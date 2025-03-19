async function fetchAllTypesWithIcons() {
    const response = await fetch("https://pokeapi.co/api/v2/type/");
    const data = await response.json();
    const typeIcons = {};
    data.results.forEach(async type => {
        const typeResponse= await fetch(`${type.url}`);
        const typeData = await typeResponse.json();
        const typeId = typeData.id;
        typeIcons[`${type.name}`] = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${typeId}.png`; //Last pokemon type was introduced in sixth generation
    });
    return typeIcons;
}

async function fetchPokemonList(limit = 20) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await response.json();
    return data.results; // Returns an array of Pokémon with names and URLs
}

async function fetchPokemonDetails(pokemonList, typeIcons) {
    const pokemonPromises = pokemonList.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const data = await response.json();
        return {
            name: data.name,
            weight: data.weight /10, //it is given in hg
            height: data.height /10, //it is given in dm
            front_default: data.sprites.front_default,
            back_default: data.sprites.back_default,
            front_shiny: data.sprites.front_shiny,
            types: data.types.map(t => t.type.name),
            typeSprites: data.types.map(t => typeIcons[t.type.name]),
            id: data.id
        };
    });
    console.log(pokemonPromises)
    return Promise.all(pokemonPromises); // Waits for all fetches
}

function displayPokemons(pokemonArray) {
    const container = document.getElementById("pokemon-list");
    container.innerHTML = ""; // Clear existing content
    pokemonArray.forEach((pokemon) => {
        const card = document.createElement("li");
        card.classList.add("pokemon-card");
        card.innerHTML = `
            <h2 class ="pokemon-name">${pokemon.name}</h2>
            <div class = "pokemon-data">
                <div class="pokemon-info">
                    <h3 class = "pokemon-number"><span class = "pokemon-number-prefix">N.º </span>${pokemon.id}</h3>
                    <p class="pokemon-weight"><span class = "pokemon-weight-prefix">Weight: </span>${pokemon.weight}<span class="pokemon-weight-units">kg</span></p>
                    <p class="pokemon-height"><span class = "pokemon-height-prefix">Height: </span>${pokemon.height}<span class="pokemon-height-units">m</span></p>
                </div>
                <div class="pokemon-visual">
                    <img class = "pokemon-image" src="${pokemon.front_default}" alt="Pokemon image">
                    <div class="pokemon-types">
                        ${pokemon.typeSprites.map(icon => `<img src="${icon}" class="type-icon">`).join("")}
                    </div>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showPokemonStats(pokemon.id));
        container.appendChild(card);
    });
}

async function loadPokemons(limit = 10) {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "block";
    const pokemonList = await fetchPokemonList(limit);
    const typeIcons = await fetchAllTypesWithIcons();
    const detailedPokemons = await fetchPokemonDetails(pokemonList, typeIcons);
    loadingSpinner.style.display = "none";
    displayPokemons(detailedPokemons);
}

function generateStatBar(statValue) {
    const totalSquares = 10;
    const filledSquares = Math.ceil(statValue / 25.5); // 1 square per 25.5 points
    return Array(totalSquares)
        .fill('<div class="stat-square-filled"></div>', 0, filledSquares)
        .fill('<div class="stat-square-blank"></div>', filledSquares, totalSquares)
        .join("");
}

function closeModal() {
    document.getElementById("pokemon-modal").style.display = "none";
    document.getElementById("body").style.overflow = "auto"
}

async function showPokemonStats(pokemonId){
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const data = await response.json();
    const pokemon = {
        name: data.name,
        front_default: data.sprites.front_default,
        back_default: data.sprites.back_default,
        front_shiny: data.sprites.front_shiny,
        back_shiny: data.sprites.back_shiny,
        stats: data.stats,
        id: data.id
    };
    const modal = document.getElementById("pokemon-modal");
    const body = document.getElementById("body");
    modal.innerHTML = `
        <div id="pokemon-modal-content" class="modal">        
            <div class = "close-module">
                <button class="close-modal-button" onclick="closeModal()"><img src = "./assets/close-box.svg" class="close-modal-button" alt="Close"></button>
            </div>
            <img id="modal-pokemon-image" src="${pokemon.front_default}" alt="${data.name}">
            <div class="control-buttons-container">
                <button class="control-button" id="shiny-button"><img class="control-button" src="./assets/shiny.png"></button>
                <button class="control-button" id= "rotate-button"><img class="control-button" src="./assets/rotate.svg"></button>
            </div>
            <h2 class = "pokemon-name">${pokemon.name}</h2>
            <h3 class = "pokemon-number"><span class = "pokemon-number-prefix">N.º </span>${pokemon.id}</h3>
            <div class="stats-container">
                ${pokemon.stats.map(stat => `
                    <div class = "stat">
                        <h4 class = "stat-name"><strong>${stat.stat.name}</strong></h4>
                        <div class = "stat-bar">${generateStatBar(stat.base_stat)}</div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
    modal.style.display = "flex";
    body.style.overflow = "hidden";
    let isShiny = false;
    let isBack = false;
    const pokemonImage = document.getElementById("modal-pokemon-image");
    const rotateButton = document.getElementById("rotate-button");
    const shinyButton = document.getElementById("shiny-button");

    function updateImage() {
        const spriteType = isShiny ? "front_shiny" : "front_default";
        const spriteBackType = isShiny ? "back_shiny" : "back_default";

        pokemonImage.src = isBack ? data.sprites[spriteBackType] : data.sprites[spriteType];
        console.log(pokemonImage.src);
    }
    rotateButton.addEventListener("click", () => {
        isBack = !isBack;
        updateImage();
    });

    shinyButton.addEventListener("click", () => {
        isShiny = !isShiny;
        updateImage();
    });
    updateImage();
}
const searchAlert = document.getElementById("search-alert");
const alertMessage = document.getElementById("alert-message");
const searchButton = document.getElementById("pokemon-search-button");
const pokemonList = document.getElementById("pokemon-list");
const resetSearchButton = document.getElementById("reset-search-button");
resetSearchButton.addEventListener('click', ()=>{
    searchAlert.style.display ="none";
    pokemonList.innerHTML = "";
    loadPokemons(1025);
}
)


document.getElementById("pokemon-search-input").addEventListener("keyup", function(event) { //Press search button when 'enter' is pressed
        // Number 13 is the "Enter" key on the keyboard
    if (event.key === 'Enter') {
      // Cancel the default action, if needed
    event.preventDefault();
      // Trigger the button element with a click
    searchButton.click();
    }
})


searchButton.addEventListener('click', async () =>{
    const pokemonToSearch = document.getElementById("pokemon-search-input").value.trim().toLowerCase();
    if (pokemonToSearch === ""){ //Didn't search anything. Something should appear to make the user aware
        searchAlert.style.display = "flex";
        alertMessage.innerHTML = "Please enter a search input!"
        return;
    } 
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonToSearch}`);
    if(!response.ok){ //Couldnt find pokemon. Change pokemon list
        pokemonList.innerHTML = ""
        searchAlert.style.display="flex";
        alertMessage.innerHTML = 'Something went wrong! Your pokemon was not found. Check your spelling and try again. Click the button below to load all the pokemons again.';
        return;
    }
    const data = await fetch(response.url);
    const pokemonArray = Array(data);
    const typeIcons = await fetchAllTypesWithIcons();
    const detailedPokemons = await fetchPokemonDetails(pokemonArray, typeIcons);
    displayPokemons(detailedPokemons); 
    searchAlert.style.display = "flex";
    alertMessage.innerHTML = 'Your pokemon was found! Click the button below to load all the pokemons again.';

})

loadPokemons(1025);