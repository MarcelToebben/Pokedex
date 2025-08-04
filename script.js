let currentPokemonIndex = 0;
let pokemonList = [];

window.onload = function () {
  loadPokemon(1, 25);
};

async function loadPokemon(start, end) {
  for (let i = start; i <= end; i++) {
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    let data = await res.json();
    pokemonList.push(data);
  }
  renderPokemonList("");
}

function renderPokemonList(searchTerm) {
  let renderHere = document.getElementById("renderHere");
  renderHere.innerHTML = "";

  for (let i = 0; i < pokemonList.length; i++) {
    let pokemon = pokemonList[i];
    let name = pokemon.name;
    let id = pokemon.id.toString();

    if (
      searchTerm === "" ||
      name.includes(searchTerm) ||
      id === searchTerm
    ) {
      let displayName = name.charAt(0).toUpperCase() + name.slice(1);

      renderHere.innerHTML += /*html*/ `
        <div onclick="openOverlay(${i})">
          <h3>${displayName}</h3>
          <img src="${pokemon.sprites.front_default}" alt="${name}">
        </div>
      `;
    }
  }
}

function searchPokemon() {
  let input = document.getElementById("searchInput").value.toLowerCase().trim();
  renderPokemonList(input);
}

function openOverlay(index) {
  currentPokemonIndex = index;
  let pokemon = pokemonList[index];
  let overlay = document.getElementById("overlay");
  let overlayData = document.getElementById("overlayData");
  let name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  overlayData.innerHTML = /*html*/ `
    <h2>${name}</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p>Typ: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
    <p>Größe: ${pokemon.height / 10} m</p>
    <p>Gewicht: ${pokemon.weight / 10} kg</p>
  `;
  overlay.classList.remove("hidden");
}

function closeOverlay() {
  document.getElementById("overlay").classList.add("hidden");
}

function prevPokemon() {
  currentPokemonIndex = (currentPokemonIndex - 1 + pokemonList.length) % pokemonList.length;
  openOverlay(currentPokemonIndex);
}

function nextPokemon() {
  currentPokemonIndex = (currentPokemonIndex + 1) % pokemonList.length;
  openOverlay(currentPokemonIndex);
}