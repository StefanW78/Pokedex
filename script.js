let offset = 0;
const limit = 20;
let allPokemons = [];

let allPokemonNames = [];

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

const leftBtn = document.getElementById("tabLeft");
const rightBtn = document.getElementById("tabRight");
let currentIndex = 0;

async function init() {
  showOverlay();
  allPokemons = await getAllPokemonDetails(BASE_URL);
  hideOverlay();
  renderPokemonCards(allPokemons);
}

document.getElementById("loadBtn").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Lädt...";

  offset += limit;
  const newUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

  showOverlay();
  const newPokemons = await getAllPokemonDetails(newUrl);
  hideOverlay();

  allPokemons = [...allPokemons, ...newPokemons];
  renderPokemonCards(allPokemons);

  btn.disabled = false;
  btn.textContent = "weitere Pokémons laden";
});

function showOverlay() {
  document.getElementById("overlay").classList.add("displayFlex");
}

function hideOverlay() {
  document.getElementById("overlay").classList.remove("displayFlex");
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

function renderPokemonCards(pokemonData) {
  const container = document.getElementById("pokemonMasterCollector");
  container.innerHTML = "";
  pokemonData.forEach((pokemon, index) => {
    container.innerHTML += getPokemonCardTemplate(index, pokemon);
  });
  document.querySelectorAll(".pokemonCards").forEach((card, i) => {
    card.addEventListener("click", () => openPokemonOverlay(pokemonData[i]));
  });
}

function getPokemonCardTemplate(index, pokemon) {
  const icon = typeIcons[pokemon.type] || "";
  return getPokemonCards(index, pokemon, icon);
}

function getPokemonOverlayElements() {
  const overlay = document.getElementById("pokemonOverlay");
  const content = document.getElementById("overlayContent");
  const closeBtn = document.getElementById("closeOverlay");
  return {overlay, content, closeBtn};
}

function functionForPokemonOverlay(pokemon) {
  loadEvolutionContainer(pokemon);
  buttonHandling(pokemon);
}

async function openPokemonOverlay(pokemon) {
  const {overlay, content, closeBtn} = getPokemonOverlayElements();
  getPokemonOverlayTemplate(pokemon, content);
  initOverlayTabs();
  overlay.classList.remove("hidden");
  loadEvolutionContainer(pokemon);
  closeBtn.onclick = () => closePokemonOverlay();
  overlay.onclick = (event) => {
    if (event.target === overlay) {
      closePokemonOverlay();
    }
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

async function loadEvolutionContainer(pokemon){
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

async function loadAllPokemonNames() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
  const data = await response.json();
  allPokemonNames = data.results.map((p) => p.name.toLowerCase());
}

async function searchPokemon(query) {
  const lowerQuery = query.toLowerCase().trim();
  showOverlay();
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${lowerQuery}`
    );
    if (!response.ok) {
      throw new Error("Pokémon nicht gefunden!");
    }
    const data = await response.json();
    const pokemon = dataInformation(data);
    await openPokemonOverlay(pokemon);
  } catch (error) {
    alert("Kein Pokémon mit diesem Namen oder dieser ID gefunden!");
    console.error(error);
  } finally {
    hideOverlay();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPokemonNames();

  const input = document.getElementById("pokemonInput");
  const suggestionList = document.getElementById("suggestionList");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    suggestionList.innerHTML = "";

    if (query.length < 2) return;

    const matches = allPokemonNames
      .filter((name) => name.includes(query))
      .slice(0, 10);

    matchesInPokemonNames(matches);
  });

  function matchesInPokemonNames(matches) {
    matches.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      li.addEventListener("click", async () => {
        input.value = name;
        suggestionList.innerHTML = "";
        await searchPokemon(name);
      });
      suggestionList.appendChild(li);
    });
  }

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = input.value.toLowerCase().trim();
      if (!query) return;
      suggestionList.innerHTML = "";
      await searchPokemon(query);
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
    tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    tabContents.forEach((c) => c.classList.toggle("hidden", c.id !== `tab-${tab}`));
  };
  const updateTab = (i) => showTab(tabs[(i + tabs.length) % tabs.length]);
  leftBtn.addEventListener("click", () => updateTab(--currentIndex));
  rightBtn.addEventListener("click", () => updateTab(++currentIndex));
  tabButtons.forEach((b, i) => b.addEventListener("click", () => (currentIndex = i, showTab(tabs[i]))));
  showTab(tabs[currentIndex]);
}



