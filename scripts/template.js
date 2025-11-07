function getPokemonCardTemplate(index, pokemons) {
  return `
    <div class="pokemonCards" data-index="${index}">
      <header class="headerPkmCard">
        <div>#${index + 1}</div>
        <div class="pokemonName">${pokemons[index].name}</div>
      </header>

      <img
        class="pokemonPicture"
        src="${pokemons[index].image}"
        alt="${pokemons[index].name}"
      />

      <footer class="pokemonCardFooter">
        <img
          class="svgFooter"
          src="/assets/img/favicon/pokedex2.svg"
          alt="Pokemon features"
        />
      </footer>
    </div>
  `;
}
