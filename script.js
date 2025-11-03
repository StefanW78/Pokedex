const picContainer = document.getElementById("pokemonCollector");
let picAim;
let title;
let number;
let arrlength;

function init() {
  showArray();
}

function showArray() {
  let contentRef = document.getElementById("pokemonCollector");
  contentRef.innerHTML = ""; /* clear Field */

  for (let index = 0; index < imgArray.length; index++) {
    contentRef.innerHTML += getNoteTemplate(index);
  }
}

function getNoteTemplate(index) {
  return `<div class="photoElement">
        <img class="picture" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="picDialog" data-info="${
          index + 1
        }" data-text1="${imgArray[index]}" src="/assets/img/${
    imgArray[index]
  }" alt="picture ${index + 1}" onclick="openDialog(event)">
      
    </div>`;
}

function logDownPropagationPrevent(event) {
  event.stopPropagation();
}

picContainer.addEventListener("click", function (event) {
  event.stopPropagation();
  picAim = event.target.src;
  title = event.target.dataset.text1;
  number = event.target.dataset.info;
  arrlength = imgArray.length;
  showDialog(title, picAim, number, arrlength);
});

function foreward() {
  number = parseInt(number);
  if (number === arrlength) {
    number = 0;
  }
  title = imgArray[number];
  picAim = `/assets/img/${title}`;
  number += 1;
  arrlength = imgArray.length;
  showDialog(title, picAim, number, arrlength);
}

function backward() {
  number = parseInt(number);
  if (number === 1) {
    number = arrlength + 1;
  }
  let index = number - 1,
    title = imgArray[index - 1];
  picAim = `/assets/img/${title}`;
  number -= 1;
  arrlength = imgArray.length;
  showDialog(title, picAim, number, arrlength);
}

function showDialog(title, target, number, arrlength) {
  let contentRef = document.getElementById("picDialog");
  contentRef.innerHTML = ""; /* Immer leeren bevor es losgeht!!! */

  contentRef.innerHTML = getDialogTemplate(title, target, number, arrlength);
}

function getDialogTemplate(title, target, number, arrlength) {
  return `<div id="photoDialog" class="dialogDiv" onclick="clickPrevention(event)">
            <header class="picName" onclick="clickPrevention(event)">
              <h2 id="dialogPictureTitel">${title}</h2>
              <button tabindex="0" aria-label="Dialog schließen" onclick="closeDialog(event)">Schließen</button>
            </header>
            <section class="imgSection">
              <img class="dialogPicture" src="${target}" alt="Photo" onclick="clickPrevention(event)">
            </section>
            <footer class="picName" onclick="clickPrevention(event)">
              <nav class="picName">
                <button tabindex="0" onclick="backward()">Rückwärts</button>
                <p id="countWithTotal">${number}/${arrlength}</p>
                <button tabindex="0" onclick="foreward()">Vorwärts</button>
              </nav>
            </footer>
      </div>`;
}

const dialogRef = document.getElementById("picDialog");

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
