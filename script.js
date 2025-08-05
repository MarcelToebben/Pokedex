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

      let types = "";
      for (let t = 0; t < pokemon.types.length; t++) {
        types += pokemon.types[t].type.name;
        if (t < pokemon.types.length - 1) {
          types += ", ";
        }
      }

      let typeColor = getTypeColor(pokemon.types[0].type.name);

      renderHere.innerHTML += /*html*/ `
  <div onclick="openOverlay(${i})" style="background-color:${typeColor};">
    <h3>${displayName}</h3>
    <p>ID: ${pokemon.id}</p>
    <img src="${pokemon.sprites.front_default}" alt="${name}">
    <p>Typ: ${types}</p>
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
  let types = "";
  for (let i = 0; i < pokemon.types.length; i++) {
    types += pokemon.types[i].type.name;
    if (i < pokemon.types.length - 1) {
      types += ", ";
    }
  }

  let stats = {};
  for (let i = 0; i < pokemon.stats.length; i++) {
    let statName = pokemon.stats[i].stat.name;
    stats[statName] = pokemon.stats[i].base_stat;
  }

  overlayData.innerHTML = /*html*/ `
    <h2>${name} (ID: ${pokemon.id})</h2>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <p><strong>Typ:</strong> ${types}</p>
    <p><strong>HP:</strong> ${stats["hp"]}</p>
    <p><strong>Angriff:</strong> ${stats["attack"]}</p>
    <p><strong>Verteidigung:</strong> ${stats["defense"]}</p>
    <p><strong>Initiative:</strong> ${stats["speed"]}</p>
    <p><strong>Spezial-Angriff:</strong> ${stats["special-attack"]}</p>
    <p><strong>Spezial-Verteidigung:</strong> ${stats["special-defense"]}</p>
  `;

  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Scrollen im Hintergrund deaktivieren
}

function closeOverlay() {
  document.getElementById("overlay").classList.add("hidden");
  document.body.style.overflow = "auto"; // Scrollen wieder aktivieren
}

function prevPokemon() {
  currentPokemonIndex = (currentPokemonIndex - 1 + pokemonList.length) % pokemonList.length;
  openOverlay(currentPokemonIndex);
}

function nextPokemon() {
  currentPokemonIndex = (currentPokemonIndex + 1) % pokemonList.length;
  openOverlay(currentPokemonIndex);
}

let currentOffset = 25;

function loadMorePokemon() {
  let button = document.getElementById("loadMoreBtn");
  let loadingText = document.getElementById("loadingText");

  button.disabled = true;
  loadingText.style.display = "block";

  let newStart = currentOffset + 1;
  let newEnd = currentOffset + 25;

  if (newStart > 151) {
    // Nichts mehr zu laden
    button.style.display = "none";
    loadingText.style.display = "none";
    return;
  }

  if (newEnd > 151) {
    newEnd = 151;
  }

  loadPokemon(newStart, newEnd).then(function () {
    currentOffset = newEnd;

    button.disabled = false;
    loadingText.style.display = "none";

    if (currentOffset >= 151) {
      button.style.display = "none";
    }
  });
}

function getTypeColor(type) {
  if (type === "grass") return "#78C850";
  if (type === "fire") return "#F08030";
  if (type === "water") return "#6890F0";
  if (type === "bug") return "#A8B820";
  if (type === "normal") return "#A8A878";
  if (type === "poison") return "#A040A0";
  if (type === "electric") return "#F8D030";
  if (type === "ground") return "#E0C068";
  if (type === "fairy") return "#EE99AC";
  if (type === "fighting") return "#C03028";
  if (type === "psychic") return "#F85888";
  if (type === "rock") return "#B8A038";
  if (type === "ghost") return "#705898";
  if (type === "ice") return "#98D8D8";
  if (type === "dragon") return "#7038F8";
  if (type === "dark") return "#705848";
  if (type === "steel") return "#B8B8D0";
  if (type === "flying") return "#A890F0";
  return "#CCCCCC"; // Standardfarbe, falls nichts passt
}
