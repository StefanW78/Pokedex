let offset = 0;
const limit = 20;

let allPokemons = [];
let currentList = [];
let currentOpenIndex = -1;
let currentOpenPokemon = null;
const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";

function toggleOverlaySearchTextErr() {
  document.getElementById("searchTextOverlay").classList.toggle("displayFlex");
}

function toggleOverlay() {
  document.getElementById("overlay").classList.toggle("displayFlex");
}

async function init() {
  toggleOverlay();
  const firstBatch = await getAllPokemonDetails(BASE_URL);
  toggleOverlay();
  allPokemons = firstBatch || [];
  currentList = [...allPokemons];
  renderPokemonCards(currentList);
}

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

function renderPokemonCards(pokemonData, append = false) {
  const container = document.getElementById("pokemonMasterCollector");
  if (!append) container.innerHTML = "";
  pokemonData.forEach((pokemon, index) => {
    const cardHTML = getPokemonCardTemplate(index, pokemon);
    container.insertAdjacentHTML("beforeend", cardHTML);
  });
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
  getPokemonOverlayTemplate(pokemon, content);
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
  applyStatBars();
}

function applyStatBars() {
  document.querySelectorAll(".statBar").forEach((bar) => {
    const value = Number(bar.dataset.value) || 0;
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
  const els = getTabElements();
  const state = { tabIndex: 0 };

  const showTab = createShowTab(els.tabButtons, els.tabContents);
  wireTabButtons(els.tabs, els.tabButtons, state, showTab);
  wirePokemonNavArrows(els.leftBtn, els.rightBtn);
  showTab(els.tabs[state.tabIndex]);
}

function createShowTab(tabButtons, tabContents) {
  return (tab) => {
    tabButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === tab)
    );
    tabContents.forEach((c) =>
      c.classList.toggle("hidden", c.id !== `tab-${tab}`)
    );
  };
}

function wireTabButtons(tabs, tabButtons, state, showTab) {
  tabButtons.forEach((b, i) => {
    b.onclick = () => {
      state.tabIndex = i;
      showTab(tabs[i]);
    };
  });
}

function wirePokemonNavArrows(leftBtn, rightBtn) {
  leftBtn.onclick = (e) => {
    e.stopPropagation();
    openOverlayByIndex(currentOpenIndex - 1);
  };
  rightBtn.onclick = (e) => {
    e.stopPropagation();
    openOverlayByIndex(currentOpenIndex + 1);
  };
}

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
      return getEvolutionStageTemplate(evo, arrow); 
    })
    .join("");
}

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
  if (!document.getElementById("pokemonInput").value.trim()) {
    currentList = [...allPokemons];
    renderPokemonCards(newPokemons, true);
  }
  btn.disabled = false;
  btn.textContent = "weitere Pokémons laden";
});

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

document.addEventListener("DOMContentLoaded", () => {
  setupSearchUI();
});

function setupSearchUI() {
  closeOverlaySearchTextErrArea();
  const els = getSearchEls();
  wireInputEvents(els);
  wireOutsideClick(els);
}

function getSearchEls() {
  return {
    input: document.getElementById("pokemonInput"),
    suggestionList: document.getElementById("suggestionList"),
    loadBtn: document.getElementById("loadBtn"),
  };
}

function wireInputEvents(els) {
  els.input.addEventListener("input", () => onSearchInput(els));
  els.input.addEventListener("keydown", (e) => onSearchEnter(e, els));
}

function onSearchInput({ input, suggestionList, loadBtn }) {
  const query = getQuery(input);
  clearSuggestions(suggestionList);
  if (handleEmptyQuery(query, loadBtn, suggestionList)) return;
  if (query.length < 3) return;
  const filtered = getFilteredPokemons(query);
  currentList = filtered;
  if (renderNoResultsIfNeeded(filtered, suggestionList)) return;
  fillSuggestions(filtered, { input, suggestionList });
  renderPokemonCards(filtered);
}

function handleEmptyQuery(query, loadBtn, suggestionList) {
  if (query) return setLoadBtnState(loadBtn, false);
  setLoadBtnState(loadBtn, true);
  clearSuggestions(suggestionList);
  currentList = [...allPokemons];
  renderPokemonCards(currentList);
  return true;
}

function setLoadBtnState(loadBtn, isVisible) {
  loadBtn.style.display = isVisible ? "" : "none";
  loadBtn.disabled = !isVisible;
  return !isVisible; // true wenn query NICHT leer ist
}

function renderNoResultsIfNeeded(filtered, suggestionList) {
  if (filtered.length) return false;
  suggestionList.innerHTML = "<li>Kein Treffer</li>";
  renderPokemonCards([]);
  return true;
}

function fillSuggestions(filtered, { input, suggestionList }) {
  filtered.forEach((pokemon, index) => {
    const li = document.createElement("li");
    li.textContent = pokemon.name;
    li.onclick = () => onSuggestionClick(pokemon.name, index, filtered, { input, suggestionList });
    suggestionList.appendChild(li);
  });
}

function onSuggestionClick(name, index, filtered, { input, suggestionList }) {
  input.value = name;
  suggestionList.innerHTML = "";
  currentList = filtered;
  openOverlayByIndex(index);
}

function onSearchEnter(event, { input, suggestionList }) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const query = getQuery(input);
  if (!query) return;
  const filtered = getFilteredPokemons(query);
  if (!filtered.length) return toggleOverlaySearchTextErr();
  currentList = filtered;
  clearSuggestions(suggestionList);
  renderPokemonCards(filtered);
  if (filtered.length === 1) openOverlayByIndex(0);
}

function wireOutsideClick({ suggestionList }) {
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchContainer")) clearSuggestions(suggestionList);
  });
}

function getQuery(input) {
  return input.value.toLowerCase().trim();
}

function clearSuggestions(list) {
  list.innerHTML = "";
}

function getFilteredPokemons(query) {
  return allPokemons.filter((p) => p.name.toLowerCase().includes(query));
}

/* document.addEventListener("DOMContentLoaded", () => {
  closeOverlaySearchTextErrArea();
  const input = document.getElementById("pokemonInput");
  const suggestionList = document.getElementById("suggestionList");
  const loadBtn = document.getElementById("loadBtn");
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    suggestionList.innerHTML = "";
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
}); */

function getPokemonIndex(pokemon) {
  return allPokemons.findIndex((p) => p.id === pokemon.id);
}
