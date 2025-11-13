let offset = 0;
const limit = 20;
let allPokemons = [];

let allPokemonNames = [];

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

const leftBtn = document.getElementById("tabLeft");
const rightBtn = document.getElementById("tabRight");
let currentIndex = 0;

async function init() {
  toggleOverlay();
  allPokemons = await getAllPokemonDetails(BASE_URL);
  toggleOverlay();
  renderPokemonCards(allPokemons);
}

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
  renderPokemonCards(newPokemons, true);

  btn.disabled = false;
  btn.textContent = "weitere Pokémons laden";
});

function toggleOverlaySearchTextErr() {
  document.getElementById("searchTextOverlay").classList.toggle("displayFlex");
}

function toggleOverlay() {
  document.getElementById("overlay").classList.toggle("displayFlex");
}

async function getAllPokemonDetails(BASE_URL) {
  const response = await fetch(BASE_URL);
  const { results } = await response.json();
  const detailedPokemons = await Promise.all(
    results.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url);
      const data = await detailResponse.json();
      return dataInformation(data);
    })
  );
  return detailedPokemons;
}

function renderPokemonCards(pokemonData, append = false) {
  const container = document.getElementById("pokemonMasterCollector");
  if (!append) container.innerHTML = "";
  pokemonData.forEach((pokemon, index) => {
    const cardHTML = getPokemonCardTemplate(index, pokemon);
    container.insertAdjacentHTML("beforeend", cardHTML);
  });
  document.querySelectorAll(".pokemonCards").forEach((card, i) => {
    card.addEventListener("click", () => openPokemonOverlay(allPokemons[i]));
  });
}

function filterLoadedPokemons(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    renderPokemonCards(allPokemons);
    return;
  }
  const filtered = allPokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(lowerQuery)
  );
  renderPokemonCards(filtered);
}

function getPokemonCardTemplate(index, pokemon) {
  const icon = typeIcons[pokemon.type] || "";
  return getPokemonCards(index, pokemon, icon);
}

function getPokemonOverlayElements() {
  const overlay = document.getElementById("pokemonOverlay");
  const content = document.getElementById("overlayContent");
  const closeBtn = document.getElementById("closeOverlay");
  return { overlay, content, closeBtn };
}

function functionForPokemonOverlay(pokemon) {
  loadEvolutionContainer(pokemon);
  buttonHandling(pokemon);
}

async function openPokemonOverlay(pokemon) {
  const { overlay, content, closeBtn } = getPokemonOverlayElements();
  getPokemonOverlayTemplate(pokemon, content);
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (document.getElementById("tabLeft") && document.getElementById("tabRight")) {
    initOverlayTabs();
  }

  overlay.classList.remove("hidden");
  loadEvolutionContainer(pokemon);
  closeBtn.onclick = () => closePokemonOverlay();
  overlay.onclick = (event) => {
    if (event.target === overlay) closePokemonOverlay();
  };
  buttonHandling(pokemon);
}

function closePokemonOverlay() {
  document.getElementById("pokemonOverlay").classList.add("hidden");
}

function buttonHandling(pokemon) {
  document.querySelectorAll(".tabBtn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll(".statBar").forEach((bar) => {
    const value = bar.dataset.value;
    bar.style.transform = `scaleX(${value / 200})`;
  });
}

async function loadEvolutionContainer(pokemon) {
  const evoContainer = document.getElementById("evolutionContainer");
  try {
    const chain = await loadEvolutionChain(pokemon.id);
    evoContainer.innerHTML = chain
      .map((evo, index) => {
        const arrow =
          index < chain.length - 1
            ? '<span class="evoArrow"> &gt;&gt; </span>'
            : "";
        return getEvolutionStageTemplate(evo, arrow);
      })
      .join("");
  } catch (err) {
    evoContainer.innerHTML = "<p>Keine Evolution Chain gefunden.</p>";
    console.error(err);
  }
}

async function loadEvolutionChain(pokemonId) {
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`
  );
  const speciesData = await speciesRes.json();
  const evoUrl = speciesData.evolution_chain.url;
  const evoRes = await fetch(evoUrl);
  const evoData = await evoRes.json();
  const chain = [];
  let current = evoData.chain;
  while (current) {
    chain.push(current.species.name);
    current = current.evolves_to[0];
  }
  return fetchEvoDetails(chain);
}

async function fetchEvoDetails(chain) {
  const evoDetails = await Promise.all(
    chain.map(async (name) => {
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const pokeData = await pokeRes.json();
      return {
        name,
        image: pokeData.sprites.other["official-artwork"].front_default,
      };
    })
  );
  return evoDetails;
}

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

async function searchPokemon(query) {
  const name = query.toLowerCase().trim();
  toggleOverlay();
  try {
    const data = await fetchPokemon(name);
    const pokemon = dataInformation(data);
    await openPokemonOverlay(pokemon);
  } catch (err) {
    handleSearchError(err);
  } finally {
    toggleOverlay();
  }
}

async function fetchPokemon(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!res.ok) throw new Error("Pokémon nicht gefunden!");
  return res.json();
}

function handleSearchError(err) {
  toggleOverlay();
  toggleOverlaySearchTextErr();
  toggleOverlay();
  console.error(err);
}

document.addEventListener("DOMContentLoaded", async () => {
  closeOverlaySearchTextErrArea();
  const input = document.getElementById("pokemonInput");
  const suggestionList = document.getElementById("suggestionList");
  input.addEventListener("input", () => {
    input.addEventListener("input", () => {
      const query = input.value.toLowerCase().trim();
      suggestionList.innerHTML = "";
      if (!query) {
        renderPokemonCards(allPokemons);
        return;
      }
      if (query.length < 3) return;
      const filteredPokemons = allPokemons.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query)
      );
      if (filteredPokemons.length === 0) {
        suggestionList.innerHTML = "<li>Kein Treffer</li>";
        renderPokemonCards([]);
        return;
      }
      filteredPokemons.forEach((pokemon) => {
        const li = document.createElement("li");
        li.textContent = pokemon.name;
        li.addEventListener("click", () => {
          input.value = pokemon.name;
          suggestionList.innerHTML = "";
          openPokemonOverlay(pokemon);
        });
        suggestionList.appendChild(li);
      });
      renderPokemonCards(filteredPokemons);
    });
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = input.value.toLowerCase().trim();
      const filtered = allPokemons.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
      if (filtered.length === 1) {
        openPokemonOverlay(filtered[0]);
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchContainer")) {
      suggestionList.innerHTML = "";
    }
  });
});

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
}

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
