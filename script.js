let offset = 0;
const limit = 20;
const apiCollector = new Map();
let allPokemons = [];
let currentList = [];
let currentOpenIndex = -1;
let currentOpenPokemon = null;
let pokeUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

function toggleOverlaySearchTextErr() {
  document.getElementById("searchTextOverlay").classList.toggle("displayFlex");
}

function toggleOverlay() {
  document.getElementById("overlay").classList.toggle("displayFlex");
}

document.addEventListener("DOMContentLoaded", () => {
  setupSearchUI();
  init();
});

async function init() {
  toggleOverlay();
  const firstBatch = await getAllPokemonDetails(pokeUrl);
  toggleOverlay();
  allPokemons = firstBatch || [];
  currentList = [...allPokemons];
  renderPokemonCards(currentList);
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
  return getPokemonCards(index, pokemon, icon);
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

async function openPokemonOverlay(pokemon) {
  const { overlay, content, closeBtn} = getPokemonOverlayElements();
  content.innerHTML = getPokemonOverlayTemplate(pokemon, content);
  initOverlayTabs();
  await loadEvolutionContainer(pokemon);
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

function closeSearchTextOverlay() {
  const overlay = document.getElementById("searchTextOverlay");
  overlay.classList.remove("displayFlex"); 
  overlay.classList.add("hidden");
  document.getElementById("pokemonInput").value = "";
  document.getElementById("pokemonInput").focus(); 
}

function openSearchTextOverlay() {
  const overlay = document.getElementById("searchTextOverlay");
  overlay.classList.remove("hidden");
  overlay.classList.add("displayFlex");
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
      b.classList.toggle("active", b.dataset.tab === tab),
    );
    tabContents.forEach((c) =>
      c.classList.toggle("hidden", c.id !== `tab-${tab}`),
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
  if (!evoContainer) return;
  evoContainer.innerHTML = "<p>Lade Evolution Chain...</p>";
  try {
    await ensureEvolutionLoaded(pokemon);
    evoContainer.innerHTML = getEvolutionHTML(pokemon);
  } catch (err) {
    console.error("Evolution konnte nicht geladen werden:", err);
    evoContainer.innerHTML = "<p>Evolution konnte nicht geladen werden.</p>";
  }
}

function getEvolutionHTML(pokemon) {
  if (!pokemon.evolution?.length) {
    return "<p>Keine Evolution Chain gefunden.</p>";
  }
  return pokemon.evolution
    .map((evo, index) => {
      const arrow =
        index < pokemon.evolution.length - 1
          ? '<span class="evoArrow"> &gt;&gt; </span>'
          : "";
      return getEvolutionStageTemplate(evo, arrow);
    })
    .join("");
}

document.getElementById("loadBtn").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Lädt...";
  await handleNewPokemons();

  btn.disabled = false;
  btn.textContent = "weitere Pokémons laden";
});

function increaseLimit() {
  offset += limit;
  pokeUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  return pokeUrl;
}

async function getNewPokemons(pokeUrl) {
  toggleOverlay();
  const newPokemons = await getAllPokemonDetails(pokeUrl);
  toggleOverlay();
  return newPokemons;
}

async function handleNewPokemons() {
  pokeUrl = increaseLimit();
  const newPokemons = await getNewPokemons(pokeUrl);
  allPokemons.push(...newPokemons);
  if (!document.getElementById("pokemonInput").value.trim()) {
    currentList = [...allPokemons];
    renderPokemonCards(newPokemons, true);
  }
}

function closeOverlaySearchTextErrArea() {
  const overlayTextErr = document.getElementById("searchTextOverlay");
  overlayTextErr.addEventListener("click", (event) => {
    if (event.target === overlayTextErr) {
      toggleOverlaySearchTextErr();
    }
  });
}

function setupSearchUI() {
  closeOverlaySearchTextErrArea();
  const closeBtn2 = document.getElementById("closeOverlay2");
  closeBtn2.addEventListener("click", closeSearchTextOverlay);
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
  return !isVisible;
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
    li.onclick = () =>
      onSuggestionClick(pokemon.name, index, filtered, {
        input,
        suggestionList,
      });
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
  if (!filtered.length) return openSearchTextOverlay();
  currentList = filtered;
  clearSuggestions(suggestionList);
  renderPokemonCards(filtered);
  if (filtered.length === 1) openOverlayByIndex(0);
}

function wireOutsideClick({ suggestionList }) {
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchContainer"))
      clearSuggestions(suggestionList);
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

