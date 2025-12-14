let offset = 0;
const limit = 20;

let allPokemons = [];     // alle bisher geladenen Pokémons
let currentList = [];     // aktuell angezeigte / gefilterte Liste
let currentOpenIndex = -1; // Index des aktuell geöffneten Pokémons in currentList
let currentOpenPokemon = null;
const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

function toggleOverlaySearchTextErr() {
  document.getElementById("searchTextOverlay").classList.toggle("displayFlex");
}

function toggleOverlay() {
  document.getElementById("overlay").classList.toggle("displayFlex");
}

/* -------------------- Initialisierung -------------------- */

async function init() {
  toggleOverlay();
  const firstBatch = await getAllPokemonDetails(BASE_URL);
  toggleOverlay();

  allPokemons = firstBatch || [];
  currentList = [...allPokemons];

  renderPokemonCards(currentList);
}

/* -------------------- Laden der Daten -------------------- */

async function getAllPokemonDetails(url) {
  try {
    const response = await fetch(url);
    const { results } = await response.json();

    const detailedPokemons = await Promise.all(
      results.map(async (pokemon) => {
        const detailResponse = await fetch(pokemon.url);
        const data = await detailResponse.json();
        return dataInformation(data); // aus db.js
      })
    );

    return detailedPokemons;
  } catch (error) {
    console.error("Pokemondatenbank nicht erreichbar: ", error);
    return [];
  }
}

/* -------------------- Karten-Rendering -------------------- */

function renderPokemonCards(pokemonData, append = false) {
  const container = document.getElementById("pokemonMasterCollector");
  if (!append) container.innerHTML = "";

  pokemonData.forEach((pokemon, index) => {
    const cardHTML = getPokemonCardTemplate(index, pokemon);
    container.insertAdjacentHTML("beforeend", cardHTML);
  });

  // Klick-Handler auf Basis der currentList
  const cards = container.querySelectorAll(".pokemonCards");
  
  cards.forEach((card) => {
    const index = Number(card.dataset.index);
    card.addEventListener("click", () => openOverlayByIndex(index));
  });
}

function getPokemonCardTemplate(index, pokemon) {
  const icon = typeIcons[pokemon.type] || "";
  return getPokemonCards(index, pokemon, icon); // aus template.js
}

/* -------------------- Overlay öffnen / schließen -------------------- */

function getPokemonOverlayElements() {
  const overlay = document.getElementById("pokemonOverlay");
  const content = document.getElementById("overlayContent");
  const closeBtn = document.getElementById("closeOverlay");
  return { overlay, content, closeBtn };
}

function openOverlayByIndex(index) {
  if (!currentList.length) return;
  const newIndex = (index + currentList.length) % currentList.length;
  currentOpenIndex = newIndex;
  const pokemon = currentList[newIndex];
  openPokemonOverlay(pokemon);
}

function openNextPokemon() {
  if (!currentList.length) return;
  openOverlayByIndex(currentOpenIndex + 1);
}

function openPrevPokemon() {
  if (!currentList.length) return;
  openOverlayByIndex(currentOpenIndex - 1);
}


async function openPokemonOverlay(pokemon) {
  const { overlay, content, closeBtn } = getPokemonOverlayElements();

  getPokemonOverlayTemplate(pokemon, content); // aus template.js
  initOverlayTabs();
  loadEvolutionContainer(pokemon);
  buttonHandling();
  currentOpenPokemon = pokemon;
  overlay.classList.remove("hidden");

  closeBtn.onclick = () => closePokemonOverlay();
  overlay.onclick = (event) => {
    if (event.target === overlay) closePokemonOverlay();
  };

}

function closePokemonOverlay() {
  document.getElementById("pokemonOverlay").classList.add("hidden");
}

/* -------------------- Tabs + Stat-Balken -------------------- */

function switchTab(tabName) {
  document
    .querySelectorAll(".tabBtn")
    .forEach((btn) => btn.classList.remove("active"));

  document
    .querySelectorAll(".overlayTabContent")
    .forEach((tab) => tab.classList.add("hidden"));

  document.querySelector(`[data-tab='${tabName}']`).classList.add("active");
  document.getElementById(`tab-${tabName}`).classList.remove("hidden");
}

function buttonHandling() {
  document.querySelectorAll(".tabBtn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll(".statBar").forEach((bar) => {
    const value = bar.dataset.value;
    bar.style.transform = `scaleX(${value / 200})`;
  });
}

function getTabElements() {
  return {
    tabs: ["main", "stats", "evolution"],
    tabButtons: document.querySelectorAll(".tabBtn"),
    tabContents: document.querySelectorAll(".overlayTabContent"),
    leftBtn: document.getElementById("tabLeft"),
    rightBtn: document.getElementById("tabRight"),
  };
}

function initOverlayTabs() {
  const { tabs, tabButtons, tabContents, leftBtn, rightBtn } = getTabElements();
  let currentIndex = 0;
  const showTab = (tab) => {
    tabButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === tab)
    );
    tabContents.forEach((c) =>
      c.classList.toggle("hidden", c.id !== `tab-${tab}`)
    );
  };
  const updateTab = (i) => showTab(tabs[(i + tabs.length) % tabs.length]);
  leftBtn.addEventListener("click", () => updateTab(--currentIndex));
  rightBtn.addEventListener("click", () => updateTab(++currentIndex));
  tabButtons.forEach((b, i) =>
    b.addEventListener("click", () => ((currentIndex = i), showTab(tabs[i])))
  );
  showTab(tabs[currentIndex]);

leftBtn.onclick = () => {
  const index = getPokemonIndex(currentOpenPokemon);
  openOverlayByIndex(index - 1);
};

rightBtn.onclick = () => {
  const index = getPokemonIndex(currentOpenPokemon);
  openOverlayByIndex(index + 1);
};

  
}

/* function initOverlayTabs() {
  const { tabs, tabButtons, tabContents, leftBtn, rightBtn } = getTabElements();
  let currentTabIndex = 0;

  const showTab = (tab) => {
    tabButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === tab)
    );
    tabContents.forEach((c) =>
      c.classList.toggle("hidden", c.id !== `tab-${tab}`)
    );
  };

  const updateTab = (i) => {
    currentTabIndex = (i + tabs.length) % tabs.length;
    showTab(tabs[currentTabIndex]);
  };

  // Tab-Klicks
  tabButtons.forEach((b, i) =>
    b.addEventListener("click", () => updateTab(i))
  );

  // Nur Tabs wechseln (nicht Pokémon)
  leftBtn.addEventListener("click", () => updateTab(currentTabIndex - 1));
  rightBtn.addEventListener("click", () => updateTab(currentTabIndex + 1));

  showTab(tabs[currentTabIndex]);
} */

/* -------------------- Evolution (nutzt lokale Daten) -------------------- */

async function loadEvolutionContainer(pokemon) {
  const evoContainer = document.getElementById("evolutionContainer");

  if (!pokemon.evolution || pokemon.evolution.length === 0) {
    evoContainer.innerHTML = "<p>Keine Evolution Chain gefunden.</p>";
    return;
  }

  evoContainer.innerHTML = pokemon.evolution
    .map((evo, index) => {
      const arrow =
        index < pokemon.evolution.length - 1
          ? '<span class="evoArrow"> &gt;&gt; </span>'
          : "";
      return getEvolutionStageTemplate(evo, arrow); // aus template.js
    })
    .join("");
}

/* -------------------- Suche in geladenen Pokémons -------------------- */

function filterLoadedPokemons(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    currentList = [...allPokemons];
    renderPokemonCards(currentList);
    return;
  }

  const filtered = allPokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(lowerQuery)
  );
  currentList = filtered;
  renderPokemonCards(filtered);
}

/* -------------------- "Weitere Pokémons laden"-Button -------------------- */

document.getElementById("loadBtn").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Lädt...";

  offset += limit;
  const newUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

  toggleOverlay();
  const newPokemons = await getAllPokemonDetails(newUrl);
  toggleOverlay();

  allPokemons.push(...newPokemons);

  // Nur anhängen, wenn kein Filter aktiv ist
  if (!document.getElementById("pokemonInput").value.trim()) {
    currentList = [...allPokemons];
    renderPokemonCards(newPokemons, true);
  }

  btn.disabled = false;
  btn.textContent = "weitere Pokémons laden";
});

/* -------------------- Fehlermeldungs-Overlay -------------------- */

function closeOverlaySearchTextErr() {
  toggleOverlaySearchTextErr();
}

function closeOverlaySearchTextErrArea() {
  const overlayTextErr = document.getElementById("searchTextOverlay");
  overlayTextErr.addEventListener("click", (event) => {
    if (event.target === overlayTextErr) {
      toggleOverlaySearchTextErr();
    }
  });
}

/* -------------------- DOMContentLoaded: Suche & Events -------------------- */

document.addEventListener("DOMContentLoaded", () => {
  closeOverlaySearchTextErrArea();

  const input = document.getElementById("pokemonInput");
  const suggestionList = document.getElementById("suggestionList");
  const loadBtn = document.getElementById("loadBtn");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    suggestionList.innerHTML = "";

    // Button steuern
    if (!query) {
      loadBtn.style.display = "";
      loadBtn.disabled = false;
      currentList = [...allPokemons];
      renderPokemonCards(currentList);
      return;
    } else {
      loadBtn.style.display = "none";
      loadBtn.disabled = true;
    }

    if (query.length < 3) return;

    const filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );

    currentList = filteredPokemons;

    if (filteredPokemons.length === 0) {
      suggestionList.innerHTML = "<li>Kein Treffer</li>";
      renderPokemonCards([]);
      return;
    }

    filteredPokemons.forEach((pokemon, index) => {
      const li = document.createElement("li");
      li.textContent = pokemon.name;
      li.addEventListener("click", () => {
        input.value = pokemon.name;
        suggestionList.innerHTML = "";
        currentList = filteredPokemons;
        openOverlayByIndex(index);
      });
      suggestionList.appendChild(li);
    });

    renderPokemonCards(filteredPokemons);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const query = input.value.toLowerCase().trim();
    if (!query) return;

    const filtered = allPokemons.filter((p) =>
      p.name.toLowerCase().includes(query)
    );

    if (!filtered.length) {
      toggleOverlaySearchTextErr();
      return;
    }

    currentList = filtered;
    renderPokemonCards(filtered);

    if (filtered.length === 1) {
      openOverlayByIndex(0);
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchContainer")) {
      suggestionList.innerHTML = "";
    }
  });
});

function getPokemonIndex(pokemon) {
  return allPokemons.findIndex((p) => p.id === pokemon.id);
}