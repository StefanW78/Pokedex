let offset = 0;
const limit = 6; // gleiche Zahl wie oben im BASE_URL
let allPokemons = [];

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=6&offset=0";

async function init() {
  showOverlay();
  allPokemons = await getAllPokemonDetails(BASE_URL);
  hideOverlay();
  renderPokemonCards(allPokemons);
}

document.getElementById("loadBtn").addEventListener("click", async () => {
  offset += limit; // Nächster Abschnitt
  const newUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  
  showOverlay();
  const newPokemons = await getAllPokemonDetails(newUrl);
  hideOverlay();

  // Neue Pokémon anhängen
  allPokemons = [...allPokemons, ...newPokemons];
  
  renderPokemonCards(allPokemons);
});

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
  document.getElementById("overlay").style.display = "flex";
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
}

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
        stats: data.stats.map(s => `${s.stat.name}: ${s.base_stat}`),
      };
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

  // Klick-Events hinzufügen
  document.querySelectorAll(".pokemonCards").forEach((card, i) => {
    card.addEventListener("click", () => openPokemonOverlay(pokemonData[i]));
  });
}

function getPokemonCardTemplate(index, pokemon) {
  return `
    <div class="pokemonCards" data-index="${index}">
      <header class="headerPkmCard">
        <div>#${pokemon.id}</div>
        <div class="pokemonName">${pokemon.name}</div>
      </header>
      <img class="pokemonPicture" src="${pokemon.image}" alt="${pokemon.name}">
      <footer class="pokemonCardFooter">
        <p>${pokemon.type}</p>
      </footer>
    </div>
  `;
}

function openPokemonOverlay(pokemon) {
  const overlay = document.getElementById("pokemonOverlay");
  const content = document.getElementById("overlayContent");

  // Inhalt des Overlays
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
      <p><strong>Type:</strong> ${pokemon.type}</p>
    </div>
    <div class="overlayTabContent hidden" id="tab-stats">
      <p>${pokemon.stats.join("<br>")}</p>
    </div>
    <div class="overlayTabContent hidden" id="tab-evolution">
      <p>Evolution Chain wird später hinzugefügt </p>
    </div>
  `;

  overlay.classList.remove("hidden");

 const closeBtn = document.getElementById("closeOverlay");
  closeBtn.onclick = () => closePokemonOverlay();

   overlay.onclick = (event) => {
    // Nur schließen, wenn außerhalb der Karte geklickt wird
    if (event.target === overlay) {
      closePokemonOverlay();
    }
  };

  // Tab-Umschaltung
  document.querySelectorAll(".tabBtn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  function closePokemonOverlay() {
  document.getElementById("pokemonOverlay").classList.add("hidden");
}
}

function switchTab(tabName) {
  document.querySelectorAll(".tabBtn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".overlayTabContent").forEach(tab => tab.classList.add("hidden"));

  document.querySelector(`[data-tab='${tabName}']`).classList.add("active");
  document.getElementById(`tab-${tabName}`).classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("pokemonInput");
  const suggestionList = document.getElementById("suggestionList");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    suggestionList.innerHTML = "";

    if (query.length < 2) return;
  });
});


/* document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("pokemonInput");
  
  searchInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") { 
      const query = searchInput.value.trim().toLowerCase();
      if (query) {
        await searchPokemon(query);
      }
    }
  });
}); */

async function searchPokemon(query) {
  showOverlay();

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    
    if (!response.ok) {
      throw new Error("Pokémon nicht gefunden!");
    }

    const data = await response.json();

    // Datenstruktur an dein Overlay anpassen
    const pokemon = {
      name: data.name,
      id: data.id,
      type: data.types[0].type.name,
      image: data.sprites.other["official-artwork"].front_default,
      stats: data.stats.map(s => `${s.stat.name}: ${s.base_stat}`)
    };

    openPokemonOverlay(pokemon);

  } catch (error) {
    alert("❌ Kein Pokémon mit diesem Namen oder dieser ID gefunden!");
    console.error(error);
  } finally {
    hideOverlay();
  }
}

let allPokemonNames = [];

// 🧠 Lade einmalig alle Pokémon-Namen beim Start
async function loadAllPokemonNames() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
  const data = await response.json();
  allPokemonNames = data.results.map(p => p.name);
}

// 🔍 Autocomplete aktivieren
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPokemonNames();

  const input = document.getElementById("pokemonInput");
  const suggestionList = document.getElementById("suggestionList");

  // Eingabe-Event für Autovervollständigung
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    suggestionList.innerHTML = "";

    if (query.length < 2) return;

    // Filtere Namen, die den Suchtext enthalten
    const matches = allPokemonNames
      .filter(name => name.includes(query))
      .slice(0, 10);

    // Vorschläge anzeigen
    matches.forEach(name => {
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

  // Suche starten, wenn Enter gedrückt wird
  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = input.value.toLowerCase().trim();
      if (!query) return;

      suggestionList.innerHTML = "";
      await searchPokemon(query);
    }
  });

  // Liste ausblenden, wenn außerhalb geklickt wird
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchContainer")) {
      suggestionList.innerHTML = "";
    }
  });
});


  // Liste ausblenden, wenn außerhalb geklickt wird
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchContainer")) {
      suggestionList.innerHTML = "";
    }
  });



