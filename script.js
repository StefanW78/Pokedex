const picContainer = document.getElementById("pokemonCollector");
let picAim;
let title;
let offset = 0;
let length = 20;
let arrlength =0;
let pokemons = [];
let BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=" + length+ "&offset="+offset;

function init() {
  showArray();
}

function showArray() {
  console.log("Url: " + BASE_URL);
  
  let contentRef = document.getElementById("pokemonMasterCollector");
  contentRef.innerHTML = ""; /* clear Field */
  
  for (let index = 0; index < pokemons.length; index++) {
    contentRef.innerHTML += getPokemonTemplate(index);
  }
}
// https://pokeapi.co/api/v2/pokemon?limit=20&offset=0
async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return responseToJson = await response.json(); //hole nur noch das Object raus.
}

function getPokemonTemplate(index) {
  return `<header class="headerPkmCard">
              <div>#${index}</div>
              <div class="pokemonName">${pokemons[index]}</div>
            </header>

            <img
              class="pokemonPicture"
              src="${getPokemonPicture()}"
              alt="Pokemon Picture"
            />

            <footer class="pokemonCardFooter">
              <img
                class="svgFooter"
                src="/assets/img/favicon/pokedex2.svg"
                alt="Pokemon features"
              />
            </footer>`;
}

function logDownPropagationPrevent(event) {
  event.stopPropagation();
}

/* picContainer.addEventListener("click", function (event) {
  event.stopPropagation();
  picAim = event.target.src;
  title = event.target.dataset.text1;
  number = event.target.dataset.info;
  arrlength = imgArray.length;
  showDialog(title, picAim, number, arrlength);
}); */

function showDialog(title, target, number, arrlength) {
  let contentRef = document.getElementById("pokemonDialog");
  contentRef.innerHTML = ""; /* Immer leeren bevor es losgeht!!! */

  contentRef.innerHTML = getDialogTemplate(title, target, number, arrlength);
}

function getDialogTemplate(title, target, number, arrlength) {
  return 
}

const dialogRef = document.getElementById("pokemonDialog");

function openDialog(event) {
  dialogRef.showModal();
  dialogRef.classList.add("opened");
}

function closeDialog(event) {
  event.stopPropagation();
  dialogRef.close();
  dialogRef.classList.remove("opened");
}

function clickPrevention(event) {
  event.stopPropagation();
}

document.addEventListener("keydown", (event) => {
  if (
    event.target.classList.contains("picture") &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault(); /* ohne wird der Dialog nicht mit Inhalt gestartet, der Standart für die Entertaste muss vermieden werden */
    openDialog(event);
    event.stopPropagation();
    picAim = event.target.src;
    title = event.target.dataset.text1;
    number = event.target.dataset.info;
    arrlength = imgArray.length;
    showDialog(title, picAim, number, arrlength);
  }
});
