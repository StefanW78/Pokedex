const jsonCache = new Map();

async function fetchJsonCached(url) {
  if (jsonCache.has(url)) return jsonCache.get(url);
  const promise = fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
  });
  jsonCache.set(url, promise);
  return promise;
}

  async function getSpeciesData(data) {
  return fetchJsonCached(data.species.url);
}

async function getEvolutionData(speciesData) {
  return fetchJsonCached(speciesData.evolution_chain.url);
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
      const d = await fetchJsonCached(`https://pokeapi.co/api/v2/pokemon/${name}`);
      return { name, image: d.sprites.other["official-artwork"].front_default };
    })
  );
  return details;
}

function mapStats(stats) {
  return stats.map((s) => ({
    stat: { name: s.stat.name },
    base_stat: s.base_stat,
  }));
}

function buildPokemonObject(data, evolution) {
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
  };
}

async function dataInformation(data) {
  const speciesData = await getSpeciesData(data);
  const evoData = await getEvolutionData(speciesData);
  const names = extractEvolutionNames(evoData);
  const evolution = await getEvolutionDetails(names);
  return buildPokemonObject(data, evolution);
}
