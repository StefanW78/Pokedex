function dataInformation(data) {
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
}

