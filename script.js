let offset = 0;
const length = 4;
let BASE_URL = `https://pokeapi.co/api/v2/pokemon?limit=${length}&offset=${offset}`;
const statusDiv = document.getElementById("status");
const overlay = document.getElementById("overlay");

// === Status & Spinner ===
function showStatus(message, type, withSpinner = false) {
  if (withSpinner) {
    statusDiv.innerHTML = `<span class="spinner"></span>${message}`;
  } else {
    statusDiv.textContent = message;
  }
  statusDiv.className = type;
}
function showOverlay() { overlay.style.display = "flex"; }
function hideOverlay() { overlay.style.display = "none"; }

// === Daten laden ===
async function loadData(URL) {
  try {
    showOverlay();
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
    const data = await response.json();
    showStatus("Pokémon erfolgreich geladen!", "success");
    return data;
  } catch (error) {
    showStatus("Fehler beim Laden der Daten!", "error");
    console.error(error);
    return null;
  } finally {
    hideOverlay();
  }
}

// === Pokémon-Details laden ===
async function getAllPokemonDetails(BASE_URL) {
  try {
    showOverlay();
    const { results } = await loadData(BASE_URL);
    if (!results) return [];

    const detailedPokemons = await Promise.all(
      results.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        if (!response.ok) throw new Error("Fehler bei Detaildaten");
        const data = await response.json();
        return {
          name: data.name,
          id: data.id,
          type: data.types[0].type.name,
          image: data.sprites.front_default
        };
      })
    );

    showStatus("Pokémon erfolgreich geladen!", "success");
    return detailedPokemons;
  } catch (error) {
    console.error("Fehler bei Details:", error);
    showStatus("Fehler bei Detaildaten!", "error");
    return [];
  } finally {
    hideOverlay();
  }
}

// === Karten-Template ===
function getPokemonCardTemplate(index, pokemons) {
  const pokemon = pokemons[index];
  return `
    <div class="pokemonCards" data-index="${index}">
      <header class="headerPkmCard">
        <div>#${pokemon.id}</div>
        <div class="pokemonName">${pokemon.name}</div>
      </header>
      <img class="pokemonPicture" src="${pokemon.image}" alt="${pokemon.name}">
      <footer class="pokemonCardFooter">
        <img class="svgFooter" src="/assets/img/favicon/pokedex2.svg" alt="Features">
      </footer>
    </div>
  `;
}

// === Karten rendern ===
async function renderPokemonCards(pokemonData, append = false) {
  const container = document.getElementById("pokemonMasterCollector");
  if (!append) container.innerHTML = "";

  pokemonData.forEach((_, index) => {
    container.innerHTML += getPokemonCardTemplate(index, pokemonData);
  });

  document.querySelectorAll(".pokemonCards").forEach(card => {
    card.addEventListener("click", () => {
      const index = card.dataset.index;
      openPokemonOverlay(pokemonData[index]);
    });
  });
}

// === Overlay öffnen ===
function openPokemonOverlay(pokemon) {
  const overlay = document.getElementById("pokemonOverlay");
  const content = document.getElementById("overlayContent");

  content.innerHTML = `
    <div class="overlayHeader">
      <header class="headerPkmCard">
        <div>#${pokemon.id}</div>
        <div class="pokemonName">${pokemon.name}</div>
      </header>
      <img class="pokemonPicture" src="${pokemon.image}" alt="${pokemon.name}">
    </div>

    <div class="overlayTabs">
      <button class="tabBtn active" data-tab="main">Main</button>
      <button class="tabBtn" data-tab="stats">Stats</button>
      <button class="tabBtn" data-tab="evolution">Evolution</button>
    </div>

    <div class="overlayTabContent" id="tab-main">
      <p>Type: ${pokemon.type}</p>
    </div>
    <div class="overlayTabContent hidden" id="tab-stats">
      <p>Hier kommen die Stats rein.</p>
    </div>
    <div class="overlayTabContent hidden" id="tab-evolution">
      <p>Hier kommt die Evolution Chain rein.</p>
    </div>
  `;

  overlay.classList.remove("hidden");
  document.getElementById("closeOverlay").addEventListener("click", () => overlay.classList.add("hidden"));
  document.querySelectorAll(".tabBtn").forEach(btn =>
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  );
}

// === Tabs umschalten ===
function switchTab(tabName) {
  document.querySelectorAll(".tabBtn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".overlayTabContent").forEach(tab => tab.classList.add("hidden"));
  document.querySelector(`[data-tab='${tabName}']`).classList.add("active");
  document.getElementById(`tab-${tabName}`).classList.remove("hidden");
}

// === Init-Funktion ===
async function init() {
  const pokemons = await getAllPokemonDetails(BASE_URL);
  renderPokemonCards(pokemons);
}
init();

// === Mehr Pokémons laden ===
document.getElementById("loadBtn").addEventListener("click", async () => {
  offset += length;
  BASE_URL = `https://pokeapi.co/api/v2/pokemon?limit=${length}&offset=${offset}`;
  const morePokemons = await getAllPokemonDetails(BASE_URL);
  renderPokemonCards(morePokemons, true); // Karten anhängen
});