async function fetchPokemonList(limit = 20) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await response.json();
    return data.results; // Returns an array of Pokémon with names and URLs
}

async function fetchPokemonDetails(pokemonList) {
    const pokemonPromises = pokemonList.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const data = await response.json();
        return {
            name: data.name,
            weight: data.weight,
            height: data.height,
            front_default: data.sprites.front_default,
            back_default: data.sprites.back_default,
            front_shiny: data.sprites.front_shiny,
            types: data.types,
            id: data.id
        };
    });
    return Promise.all(pokemonPromises); // Waits for all fetches
}

function displayPokemons(pokemonArray) {
    const container = document.getElementById("pokemon-list");
    container.innerHTML = ""; // Clear existing content

    pokemonArray.forEach((pokemon) => {
        const card = document.createElement("li");
        card.classList.add("pokemon-card");

        card.innerHTML = `
            <div class = "pokemon-data">
                <div class = "pokemon-identifier">
                    <h2 class ="pokemon-name">${pokemon.name}</h2>
                    <h3 class = "pokemon-number"><span class = "pokemon-number-prefix">N.º </span>${pokemon.id}</h3>
                </div>
                <div class="pokemon-info">
                    <p class="pokemon-weight"><span class = "pokemon-weight-prefix">Weight: </span>${pokemon.weight}<span class="pokemon-weight-units">kg</span></p>
                    <p class="pokemon-height"><span class = "pokemon-height-prefix">Height: </span>${pokemon.height}<span class="pokemon-height-units">m</span></p>
                </div>

            </div>
            <div class="pokemon-visual">
                <img class = "pokemon-image" src="${pokemon.front_default}" alt="Pokemon image">
                <img class = "pokemon-type" src="" alt = "Pokemon type">
            </div>
        `;
        container.appendChild(card);
    });
}
async function loadPokemons(limit = 10) {
    const pokemonList = await fetchPokemonList(limit);
    const detailedPokemons = await fetchPokemonDetails(pokemonList);
    displayPokemons(detailedPokemons);
}



loadPokemons(20);