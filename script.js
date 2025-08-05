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
    <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${name}">
    <p>Typ: ${types}</p>
  </div>
`;

    }
  }
}

function searchPokemon() {
  let input = document.getElementById("searchInput").value.toLowerCase().trim();

  if (input.length >= 3) {
    renderPokemonList(input);
  } else {
    renderPokemonList("");
  }
}


function openOverlay(index) {
  currentPokemonIndex = index;
  let pokemon = pokemonList[index];
  let overlay = document.getElementById("overlay");
  let overlayData = document.getElementById("overlayData");
  let name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  let id = pokemon.id.toString().padStart(3, "0");

  document.body.classList.add("overlay-open");

  let types = pokemon.types.map(t => t.type.name);
  let typeColor = getTypeColor(types[0]);

  let statsHTML = "";
  for (let i = 0; i < pokemon.stats.length; i++) {
    let stat = pokemon.stats[i];
    let value = stat.base_stat;
    let color = value >= 50 ? "green" : "red";
    statsHTML += `
      <div><strong>${stat.stat.name.toUpperCase()}</strong>: ${value}
        <div class="stat-bar">
          <div class="stat-bar-fill ${color}" style="width: ${value > 100 ? 100 : value}%"></div>
        </div>
      </div>
    `;
  }

  overlayData.innerHTML = `
    <div class="card-wrapper" style="background-color: ${typeColor};">
      <h2>${name}</h2>
      <p>#${id}</p>
      <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${name}">
      <div>${types.map(t => `<span>${t}</span>`).join(", ")}</div>

      <div class="tab-buttons">
        <div onclick="showTab('about')" class="active">About</div>
        <div onclick="showTab('stats')">Base Stats</div>
        <div onclick="showTab('gender')">Gender</div>
        <div onclick="showTab('moves')">Moves</div>
      </div>

      <div id="tab-about" class="tab-content active">
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Abilities:</strong> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>
      </div>

      <div id="tab-stats" class="tab-content">
        ${statsHTML}
      </div>

      <div id="tab-gender" class="tab-content">
  <p id="genderInfo">Loading gender info...</p>
</div>

      <div id="tab-moves" class="tab-content">
        <ul>
          ${pokemon.moves.slice(0, 5).map(m => "<li>" + m.move.name + "</li>").join("")}
        </ul>
      </div>

      <div class="nav-buttons">
        <button onclick="prevPokemon()">←</button>
        <button onclick="nextPokemon()">→</button>
      </div>
    </div>
  `;

  fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
  .then(response => response.json())
  .then(speciesData => {
    let genderRate = speciesData.gender_rate;
    let genderText = "";

    if (genderRate === -1) {
      genderText = "Genderless";
    } else if (genderRate === 0) {
      genderText = "Male only";
    } else if (genderRate === 8) {
      genderText = "Female only";
    } else {
      let femalePercent = (genderRate / 8) * 100;
      let malePercent = 100 - femalePercent;
      genderText = `♀ ${femalePercent}% &nbsp;&nbsp; ♂ ${malePercent}%`;
    }

    document.getElementById("genderInfo").innerHTML = `<strong>Gender:</strong> ${genderText}`;
  })
  .catch(err => {
    document.getElementById("genderInfo").innerText = "Failed to load gender info";
    console.error(err);
  });


  overlay.classList.remove("hidden");
}

function closeOverlay() {
  document.getElementById("overlay").classList.add("hidden");
  document.body.classList.remove("overlay-open");
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
  return "#CCCCCC";
}

function showTab(tabName) {
  let tabs = ["about", "stats", "gender", "moves"];

  for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    let tabContent = document.getElementById("tab-" + tab);
    let button = document.getElementsByClassName("tab-buttons")[0].children[i];

    if (tab === tabName) {
      tabContent.classList.add("active");
      button.classList.add("active");
    } else {
      tabContent.classList.remove("active");
      button.classList.remove("active");
    }
  }
}
