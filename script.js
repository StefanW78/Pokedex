let offset = 0;
const limit = 6;
let allPokemons = [];

let allPokemonNames = [];

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=6&offset=0";

async function init() {
  showOverlay();
  allPokemons = await getAllPokemonDetails(BASE_URL);
  hideOverlay();
  renderPokemonCards(allPokemons);
}

// --------------------------------------------------
// Lade-Button (Pokémon nachladen)
// --------------------------------------------------
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

// --------------------------------------------------
// Overlay anzeigen / verstecken
// --------------------------------------------------
function showOverlay() {
  document.getElementById("overlay").style.display = "flex";
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
}

// --------------------------------------------------
// Daten laden
// --------------------------------------------------
async function getAllPokemonDetails(BASE_URL) {
  const response = await fetch(BASE_URL);
  const { results } = await response.json();

  const detailedPokemons = await Promise.all(
    results.map(async (pokemon) => {
      const detailResponse = await fetch(pokemon.url);
      const data = await detailResponse.json();
      return {
        name: data.name,
        id: data.id,
        type: data.types[0].type.name,
        image: data.sprites.other["official-artwork"].front_default,
        stats: data.stats.map((s) => ({
          stat: { name: s.stat.name },
          base_stat: s.base_stat,
        })),
        height: data.height,
        weight: data.weight,
        base_experience: data.base_experience,
        abilities: data.abilities.map((a) => a.ability.name).join(", "),
      };
    })
  );

  return detailedPokemons;
}

// --------------------------------------------------
// Karten anzeigen
// --------------------------------------------------
function renderPokemonCards(pokemonData) {
  const container = document.getElementById("pokemonMasterCollector");
  container.innerHTML = "";

  pokemonData.forEach((pokemon, index) => {
    container.innerHTML += getPokemonCardTemplate(index, pokemon);
  });

  // Klick-Events für jedes Pokémon
  document.querySelectorAll(".pokemonCards").forEach((card, i) => {
    card.addEventListener("click", () => openPokemonOverlay(pokemonData[i]));
  });
}

function getPokemonCardTemplate(index, pokemon) {
  const icon = typeIcons[pokemon.type] || "";

  return `
    <div class="pokemonCards" data-index="${index}">
      <header class="headerPkmCard">
        <div>#${pokemon.id}</div>
        <div class="pokemonName">${pokemon.name}</div>
      </header>
      <img class="pokemonPicture" src="${pokemon.image}" alt="${pokemon.name}">
      <footer class="pokemonCardFooter ${pokemon.type}">
        ${icon}
      </footer>

    </div>
  `;
}

// --------------------------------------------------
// Overlay mit Details
// --------------------------------------------------
async function openPokemonOverlay(pokemon) {
  const overlay = document.getElementById("pokemonOverlay");
  const content = document.getElementById("overlayContent");

  content.innerHTML = `
    <div class="overlayHeader">
      <header class="headerPkmCard">
        <div>#${pokemon.id}</div>
        <div class="pokemonName">${pokemon.name}</div>
      </header>
      <img class="pokemonOverlayPicture pokemonPicture ${pokemon.type}" src="${
    pokemon.image
  }" alt="${pokemon.name}">
    </div>

    <div class="overlayTabs">
      <button class="tabBtn active" data-tab="main">Main</button>
      <button class="tabBtn" data-tab="stats">Stats</button>
      <button class="tabBtn" data-tab="evolution">Evolution</button>
    </div>

    <div class="overlayTabContent" id="tab-main">
      <div class="pokemonInfoRow">
    <span class="infoLabel">Height</span>
    <span class="infoSeparator">:</span>
    <span class="infoValue">${pokemon.height}</span>
  </div>
  <div class="pokemonInfoRow">
    <span class="infoLabel">Weight</span>
    <span class="infoSeparator">:</span>
    <span class="infoValue">${pokemon.weight}</span>
  </div>
  <div class="pokemonInfoRow">
    <span class="infoLabel">Base Experience</span>
    <span class="infoSeparator">:</span>
    <span class="infoValue">${pokemon.base_experience}</span>
  </div>
  <div class="pokemonInfoRow">
    <span class="infoLabel">Abilities</span>
    <span class="infoSeparator">:</span>
    <span class="infoValue">${pokemon.abilities}</span>
  </div>
      
    </div>
    <div class="overlayTabContent hidden" id="tab-stats">
      <div class="pokemonStats">
  ${pokemon.stats
    .map(
      (s) => `
    <div class="statRow">
      <span class="statLabel">${s.stat.name}</span>
      <div class="statBarContainer">
        <div class="statBar"style="transform: scaleX(${s.base_stat / 200})"></div>
      </div>

      <span class="statValue">${s.base_stat}</span>
    </div>
  `
    )
    .join("")}
</div>

    </div>
    <div class="overlayTabContent hidden" id="tab-evolution">
      <div class="evolutionContainer" id="evolutionContainer"></div>
    </div>

  `;

  overlay.classList.remove("hidden");

  // Evolution Chain mit await laden
  const evoContainer = document.getElementById("evolutionContainer");
  try {
    const chain = await loadEvolutionChain(pokemon.id);
    evoContainer.innerHTML = chain
  .map((evo, index) => {
    // Pfeil nur, wenn es nicht die letzte Stufe ist
    const arrow = index < chain.length - 1 ? '<span class="evoArrow"> &gt;&gt; </span>' : '';
    return `
      <div class="evolutionStage">
        <div class="stageName">${evo.name}</div>
        <div class="stageContent">
          <img src="${evo.image}" alt="${evo.name}">
          ${arrow}
        </div>
      </div>
    `;
  })
  .join("");


  } catch (err) {
    evoContainer.innerHTML = "<p>Keine Evolution Chain gefunden.</p>";
    console.error(err);
  }

  // Restlicher Overlay-Code bleibt unverändert
  const closeBtn = document.getElementById("closeOverlay");
  closeBtn.onclick = () => closePokemonOverlay();

  overlay.onclick = (event) => {
    if (event.target === overlay) {
      closePokemonOverlay();
    }
  };

  document.querySelectorAll(".tabBtn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  function closePokemonOverlay() {
    document.getElementById("pokemonOverlay").classList.add("hidden");
  }
}

async function loadEvolutionChain(pokemonId) {
  // 1. Species-Daten holen
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
  const speciesData = await speciesRes.json();

  // 2. Evolution Chain abrufen
  const evoUrl = speciesData.evolution_chain.url;
  const evoRes = await fetch(evoUrl);
  const evoData = await evoRes.json();

  // 3. Kette in Array auflösen
  const chain = [];
  let current = evoData.chain;
  while (current) {
    chain.push(current.species.name);
    current = current.evolves_to[0];
  }

  // 4. Für jedes Stadium Bild holen
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

// --------------------------------------------------
// Pokémon-Suche + Autocomplete
// --------------------------------------------------

async function loadAllPokemonNames() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
  const data = await response.json();
  allPokemonNames = data.results.map((p) => p.name.toLowerCase());
}

async function searchPokemon(query) {
  const lowerQuery = query.toLowerCase().trim();
  showOverlay();

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${lowerQuery}`);

    if (!response.ok) {
      throw new Error("Pokémon nicht gefunden!");
    }
    const data = await response.json();

    const pokemon = {
      name: data.name,
      id: data.id,
      type: data.types[0].type.name,
      image: data.sprites.other["official-artwork"].front_default,
      stats: data.stats.map((s) => ({
        stat: { name: s.stat.name },
        base_stat: s.base_stat,
      })),
      height: data.height,
      weight: data.weight,
      base_experience: data.base_experience,
      abilities: data.abilities.map((a) => a.ability.name).join(", "),
    };

    await openPokemonOverlay(pokemon);
  } catch (error) {
    alert("Kein Pokémon mit diesem Namen oder dieser ID gefunden!");
    console.error(error);
  } finally {
    hideOverlay();
  }
}

// --------------------------------------------------
// DOM geladen → Autocomplete initialisieren
// --------------------------------------------------
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
  });

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
