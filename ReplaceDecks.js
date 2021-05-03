
// ----------------------------------------------------------------
// TODO:
// - replace style = "x:xxx"; with style.x = "xxx";
// - add animation audio
// - organize colors at the top of css sheet
// - fix variables with no keyword declaration
// - highlight base project
//
//
// - support multiple projects
// 
//
// - support project zip
//
// 
// - support project stem preview
//
//
// - add explore window
// - setup cloud database
// - fetch (ssp+sample+stem) from database
// - post (ssp+sample+stem) to database

































// These variables are used to store project data.
let baseProject;
let refeProject = [];
let baseProjectName;
let refeProjectName = [];


// These variables are used to determine when to start 
// the drag and drop animation.
let baseProjectUploaded; 
let refeProjectUploaded;


let mergeactivated = false;
let helpShown = false;


// This variable is used to support undo function.
let actionList = [];
























// ----------------------------------------------------------------
// Display project UI
//
//
//
function drawDecks(layout, project, base=false){
    for (let i = 0 ; i < project.decks.length; i++) {
        // get the deck info
        const deckName = project.decks[i].name;
        const deckType = project.decks[i].type;
        deckSource = null;
        // projectNum = 0 means it is a base project
        // projectNUm = 1+ means it is one of the refe project
        const projectNum = Array.prototype.indexOf.call(layout.parentNode.parentNode.children, layout.parentNode);

        // create a deckArea container
        let deckArea = document.createElement('div');
        deckArea.className = "deckArea";
        deckArea.data = {
            "class" : "deckArea",
            "type" : deckType,
            "projectNum" : projectNum,
            "deckNum" : i
        };

        // create a deck
        let deck = document.createElement('div');
        deck.data = {
            "class": "deck", 
            "name" : deckName,
            "type" : deckType,
            "source" : deckSource,
            "projectNum" : projectNum,
            "deckNum" : i
        };
        deck.className = "deck";
        deck.innerText = deckName;
        if (deckType  == 'drums') {
            deck.style = "background-color: rgb(237, 52, 86);";
        } else if (deckType == 'instrument') {
            deck.style = "background-color: rgb(255, 176, 0);";
        } else if (deckType == 'sample') {
            deck.style = "background-color: rgb(220, 255, 168);";
        } else if (deckType  == 'plugin'){
            deck.style = "background-color: pink;";
        }
        deck.draggable = (base) ? false : true;

        // Draw
        deckArea.append(deck);
        layout.append(deckArea);
        setTimeout('', 50000);
    }
};





















// ----------------------------------------------------------------
// Drag and drop animation
//
//
//
let sDeck = null; // copy of selected deck
let dDeckArea = null; // deckArea to be dropped

function addElement(area, element) {
    if (!mergeactivated) {
        // activate merge, undo and reset button
        mergeactivated = true;
        activateMerge();
        activateUndo();
        activateReset();
    }
    area.lastElementChild.style.display = "none";
    area.append(element); 

    // used to support the undo function
    actionList.push(area);
};

function dragStart() {
    // highlight acceptable drop areas
    for (const deckArea of deckLayout_1.children) {
        if (deckArea.data.type == this.data.type) {
            deckArea.style = 'filter: brightness(0.7);';
        }
    }
    setTimeout(() => (sDeck = this), 0);
};

function dragEnd() {
    for (const deckArea of deckLayout_1.children) {
        deckArea.style = 'filter: brightness(1);';
    }
};

function dragOver(e) {
    e.preventDefault();
};

function dragEnter(e) {
    e.preventDefault();
    if (this.data.projectNum == 0 && this.data.type == sDeck.data.type) {
        this.style = 'filter: brightness(0);';
    }
};

function dragLeave(e) {
    e.preventDefault();
    if (this.data.projectNum == 0 && this.data.type == sDeck.data.type) {
        this.style = 'filter: brightness(0.7);';
    }
};

function dragDrop(e) {
    e.preventDefault();
    
    dDeckArea = this;
    // accept drop event if only if 
    // 1. drop zone belongs to a base project
    // 2. selected deck is of the same type as drop area
    if (this.data.projectNum == 0 && this.data.type == sDeck.data.type) {
        const cloneDeck = sDeck.cloneNode(true);
        cloneDeck.data = sDeck.data;
        setTimeout(() => (addElement(this, cloneDeck), 0));
        console.log("Drop event accepted.");
    }

    // restore deck area shandow
    this.style = 'filter: brightness(1);';
};

function startDragnDrop() {
    const decks = document.querySelectorAll('.deck');
    const deckAreas = document.querySelectorAll('.deckArea');

    for (const deck of decks) {
        deck.addEventListener('dragstart', dragStart);
        deck.addEventListener('dragend', dragEnd);
    }

    for (const deckArea of deckAreas) {
        deckArea.addEventListener('dragover', dragOver);
        deckArea.addEventListener('dragenter', dragEnter);
        deckArea.addEventListener('dragleave', dragLeave);
        deckArea.addEventListener('drop', dragDrop);
    }
    console.log("Drag and drop activates!");
};





















// ----------------------------------------------------------------
// Upload and process files
//
//
//
const uploadBtn_1 = document.getElementById('uploadButton_1');
const uploadBtn_2 = document.getElementById('uploadButton_2');
const readFileBtn_1 = document.getElementById('readFileButton_1');
const readFileBtn_2 = document.getElementById('readFileButton_2');
const deckLayout_1 = document.getElementById('deckLayout_1');
const deckLayout_2 = document.getElementById('deckLayout_2');

// Once upload buttons are clicked
uploadBtn_1.addEventListener("click", function() {
    readFileBtn_1.click();
});
uploadBtn_2.addEventListener("click", function() {
    readFileBtn_2.click();
});

// Once some files have been accepted
readFileBtn_1.addEventListener("change", function () {
    if (readFileBtn_1.value) {
        // display project name
        const projectName = this.parentNode.parentNode.firstElementChild;
        temp = readFileBtn_1.value.split("\\");
        baseProjectName = temp[temp.length - 1];
        projectName.innerText = baseProjectName;

        let fileReader = new FileReader();
        fileReader.onload = function () {
            // read file as BASE project
            const content = fileReader.result;
            baseProject = JSON.parse(content);

            // draw the deck UI
            drawDecks(deckLayout_1, baseProject, base = true);
            uploadBtn_1.style = "display:none;";
            deckLayout_1.style = "display:gird;";

            // start the drag and drop animation
            baseProjectUploaded = true;
            if (refeProjectUploaded) {
                //@todo add drag n drop guide
                startDragnDrop();
            }
        };
        fileReader.readAsText(readFileBtn_1.files[0]);
    }
});
readFileBtn_2.addEventListener("change", function () {
    if (readFileBtn_2.value) {
        // display project name
        const projectName = this.parentNode.parentNode.firstElementChild;
        const temp = readFileBtn_2.value.split("\\");
        refeProjectName[0] = temp[temp.length - 1];
        projectName.innerText = refeProjectName[0];

        let fileReader = new FileReader();
        fileReader.onload = function () {
            // read file as REFE project
            const content = fileReader.result;
            refeProject.push(JSON.parse(content));

            // draw the deck UI
            drawDecks(deckLayout_2, refeProject[0]);           
            uploadBtn_2.style = "display:none;";
            deckLayout_2.style = "display:gird;";

            // start the drag and drop animation
            refeProjectUploaded = true;
            if (baseProjectUploaded) {
                startDragnDrop();
            }
        };
        fileReader.readAsText(readFileBtn_2.files[0]);
    }
});





















// ----------------------------------------------------------------
// Merge and download files
//
//
//
const mergeButton = document.getElementById("mergeButton");
// This function activate the merge button.
// It's called once a drag and drop event is accepted
function activateMerge() {
    mergeButton.addEventListener('click', merge);
    mergeButton.style = "opacity:1;";
    console.log("Merge button activates!");
};

function deactivateMerge() {
    mergeactivated = false;
    mergeButton.removeEventListener('click', merge);
    mergeButton.style = "opacity:0.5;";
    console.log("Merge button deactivates!");
};

function merge() {
    // create a deep copy of base project
    let mergeProject = JSON.parse(JSON.stringify(baseProject));

    // modify the copy
    for (let i = 0 ; i < deckLayout_1.children.length ; i++) {
        const deck = deckLayout_1.children[i].lastElementChild;
        if (deck) {
            // We detect a change if either:
            // 1. the deck's project is NOT base project
            // 2. the deck num does NOT equal to the deckArea num
            if (deck.data.projectNum != 0 || deck.data.deckNum != i) {
                projectNum = deck.data.projectNum;
                deckNum = deck.data.deckNum;
                console.log("Detected change in deckArea", i, ", to be replaced with deck", deckNum, "from project", projectNum);
                mergeProject.decks[i] = refeProject[projectNum-1].decks[deckNum];
            }
        }
    }

    // download the copy
    let filename = baseProjectName.slice(0, 3).concat("_X_");
    filename = filename.concat(refeProjectName[0].slice(0, 3));
    filename = filename.concat(".ssp");
    console.log("download ", filename);
    download(filename, JSON.stringify(mergeProject));
};

function download(filename, data) {
    var blob = new Blob([data], {type: 'application/ssp'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}
  



























// ----------------------------------------------------------------
// Undo, reset and help button
//
//
//
const undoButton = document.getElementById("undoButton");
const resetButton = document.getElementById("resetButton");
const helpButton = document.getElementById("helpButton");
const helpWindow = document.getElementById("helpWindow");

helpButton.addEventListener('click', help);

function activateUndo() {
    undoButton.style = "opacity:1;";
    undoButton.addEventListener('click', undo);
};

function activateReset() {
    resetButton.style = "opacity:1;";
    resetButton.addEventListener('click', reset);
};

function deactivateUndo() {
    undoButton.style = "opacity:0.5;";
    undoButton.removeEventListener('click', undo);
};

function deactivateReset() {
    resetButton.style = "opacity:0.5;";
    resetButton.removeEventListener('click', reset);
};

function undo() {
    // for drop event only
    const area = actionList.pop();
    console.log(area.lastElementChild);
    area.removeChild(area.lastElementChild);
    area.lastElementChild.style.display = "table-cell";
    console.log(area.lastElementChild);
    console.log("undo button clicked");
};

function reset() {
    // for (const child of deckLayout_1.children) { deckLayout_1.removeChild(child); setTimeout('', 2000); }
    deckLayout_1.innerHTML = '';
    drawDecks(deckLayout_1, baseProject, base = true);
    deactivateMerge();
    deactivateUndo();
    deactivateReset();
    startDragnDrop();
    console.log("reset button clicked");
};

function help() {
    console.log("help button clicked");
    if (!helpShown) {helpWindow.style.visibility = "visible"; helpShown = true;}
    else {helpWindow.style = "visibility:hidden;"; helpShown = false;}
};
