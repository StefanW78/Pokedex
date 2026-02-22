async function getAllPokemonDetails(url) {
  try {
    const { results } = await fetchApiCollectored(url);
    return Promise.all(
      results.map(async (p) => {
        const data = await fetchApiCollectored(p.url);
        return dataInformation(data);
      }),
    );
  } catch (error) {
    console.error("Pokemondatenbank nicht erreichbar:", error);
    return [];
  }
}

async function fetchApiCollectored(url) {
  if (apiCollector.has(url)) return apiCollector.get(url);
  const promise = fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
  });
  apiCollector.set(url, promise);
  return promise;
}

async function getSpeciesData(pokemonOrData) {
  const url = pokemonOrData.speciesUrl ?? pokemonOrData.species?.url;
  if (!url) throw new Error("species URL fehlt");
  return fetchApiCollectored(url);
}

async function getEvolutionData(speciesData) {
  return fetchApiCollectored(speciesData.evolution_chain.url);
}

function extractEvolutionNames(evoData) {
  const names = [];
  let cur = evoData.chain;
  while (cur) {
    names.push(cur.species.name);
    cur = cur.evolves_to[0];
  }
  return names;
}

async function getEvolutionDetails(names) {
  const details = await Promise.all(
    names.map(async (name) => {
      const d = await fetchApiCollectored(
        `https://pokeapi.co/api/v2/pokemon/${name}`,
      );
      return { name, image: d.sprites.other["official-artwork"].front_default };
    }),
  );
  return details;
}

function mapStats(stats) {
  return stats.map((s) => ({
    stat: { name: s.stat.name },
    base_stat: s.base_stat,
  }));
}

function buildPokemonObject(data, evolution = null) {
  return {
    name: data.name,
    id: data.id,
    type: data.types[0].type.name,
    image: data.sprites.other["official-artwork"].front_default,
    stats: mapStats(data.stats),
    height: data.height,
    weight: data.weight,
    base_experience: data.base_experience,
    abilities: data.abilities.map((a) => a.ability.name).join(", "),
    evolution,
    speciesUrl: data.species.url,
  };
}

async function dataInformation(data) {
  return buildPokemonObject(data, null);
}

async function getEvolutionForPokemon(pokemon) {
  const speciesData = await getSpeciesData(pokemon);
  const evoData = await getEvolutionData(speciesData);
  const names = extractEvolutionNames(evoData);
  return await getEvolutionDetails(names);
}

async function ensureEvolutionLoaded(pokemon) {
  if (pokemon.evolution?.length) return pokemon.evolution;
  const evo = await getEvolutionForPokemon(pokemon);
  pokemon.evolution = evo;
  return evo;
}
