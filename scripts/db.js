async function dataInformation(data) {
  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  const evoChain = [];
  let cur = evoData.chain;

  while (cur) {
    evoChain.push(cur.species.name);
    cur = cur.evolves_to[0];
  }

  const evoDetails = await Promise.all(
    evoChain.map(async (name) => {
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const d = await r.json();
      return {
        name,
        image: d.sprites.other["official-artwork"].front_default,
      };
    })
  );

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
    evolution: evoDetails, // ❗ alles evolution-related ist jetzt lokal gespeichert
  };
}
