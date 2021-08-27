



// ----------------------------------------------------------------
// TODO:
// - fix the occasional deck name overflow problem
// - replace style = "x:xxx"; with style.x = "xxx";
// - fix variables with no keyword declaration
// - fix drop precision problem ( @000001 )
// - Update based on new .ssp file format ( @000002 )
//
//
// - support changing base project
// - support uploading zip
// - support project stem preview
//
//
// - add explore window
// - setup cloud database
// - fetch (ssp+sample+stem) from database
// - post (ssp+sample+stem) to database

































// These variables are used to store project data.
let baseProject = [];
let refeProject = [];
let baseProjectName = [];
let refeProjectName = [];


// These variables are used to determine when to start 
// the drag and drop animation.
let baseProjectUploaded; 
let refeProjectUploaded;


let mergeactivated = false;
let guideShown = false;
let messageShown = true;


// This variable is used to support undo function.
let actionList = [];


// This function is used for copying templates.
// All templates used in this project is stored in html files
// with id="{classname}_template" and display='none'
function copyTemplate(id){
    const newNode = document.getElementById(id).cloneNode(true);
    newNode.style = 'display:flex;';
    newNode.id = null;
    return newNode;
}























// ----------------------------------------------------------------
// Display project UI
//
//
//

const style_sample = "background: #61E1FD;box-shadow: 0px 4px 20px #61E1FD, 0px -4px 20px #61E1FD;";
const style_plugin = "background: #287BF7;box-shadow: 0px 4px 20px #0F294E, 0px -4px 20px #287BF6;";
const style_instrument ="background: #864DFE;box-shadow: 0px 4px 20px #C281FF, 0px -4px 20px #C281FF;";
const style_drums ="background: #00FF34;box-shadow: 0px 4px 20px #00FF34, 0px -4px 20px #00FF34;";


function drawDecks(layout, project, projectNum){ 
    // ---------------------------------------------
    // projectNum = 0 means this is a base project
    // projectNum = 1+ mean this is a refe project

    // new .ssp project uses 'scene_decks' instead of 'scene', relates to problem @000002
    const decks = project.decks == undefined ? project.scene_decks : project.decks;
    console.log("[drawDecks] ", decks);
    for (let i = 0 ; i < decks.length; i++) {
        // get the deck info
        const deckName = decks[i].name;
        const deckType = decks[i].type;
        deckSource = null;

        // copy a deckArea element，and un-hide it
        let deckArea = copyTemplate('deckArea_template');
        let deck = deckArea.querySelector('.deck');
        let icon = deckArea.querySelector('.icon');
        let deck_outer = deckArea.querySelector('.outer');
        let deck_inner = deckArea.querySelector('.inner');
        let deck_line  = deckArea.querySelector('.line');
        let deck_name  = deckArea.querySelector('.name');
        
        // load data to deckArea and deck
        deckArea.data = {
            "class" : "deckArea",
            "type" : deckType,
            "projectNum" : projectNum,
            "deckNum" : i
        };
        deck.data = {
            "class": "deck", 
            "name" : deckName,
            "type" : deckType,
            "source" : deckSource,
            "projectNum" : projectNum,
            "deckNum" : i
        };
        deck_name.innerText = deckName;
        
        if (deckType  == 'drums') {
            deck_inner.style = style_drums;
            icon.src = "images/drums.svg";
        } else if (deckType == 'instrument') {
            deck_inner.style = style_instrument;
            icon.src = "images/instrument.svg";
        } else if (deckType == 'sample') {
            deck_inner.style = style_sample;
            icon.src = "images/sample.svg";
        } else if (deckType  == 'plugin'){
            deck_inner.style = style_plugin;
            icon.src = "images/plugin.svg";
        }

        // Special styling for base project
        if (projectNum == 0){
            deck.draggable = false;
            deck_inner.remove();
        } else {
            deck.draggable = true;
        }

        // Draw
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
    area.querySelectorAll('.deck').forEach(function (deck){deck.style.display = 'none';});
    area.prepend(element);
    
    // update the wrapper deck name
    area.querySelector('.name').innerText = element.data.name;

    // used to support the undo function
    actionList.push(area);
};


function dragStart() {
    // highlight acceptable drop areas
    for (const deckArea of deckLayout_0.children) {
        if (deckArea.data.type == this.data.type) {
            deckArea.style = 'filter: brightness(2);';
            // deckArea.querySelector('.name').style = 'filter: brightness(2);';
            // deckArea.querySelector('.line').style = 'filter: brightness(2);';
        }
    }
    setTimeout(() => (sDeck = this), 0);  
};

function dragEnd() {
    for (const deckArea of deckLayout_0.children) {
        deckArea.style = 'filter: brightness(1);';
    }
};

function dragOver(e) {
    e.preventDefault();
};

function dragEnter(e) {
    e.preventDefault();
    dDeckArea = (this.className == 'deckArea') ? this : this.parentNode; // relates to problem @000001
    if (dDeckArea.data.projectNum == 0 && dDeckArea.data.type == sDeck.data.type) {
        dDeckArea.style = 'filter: brightness(0.1);';
    }
};

function dragLeave(e) {
    e.preventDefault();
    dDeckArea = (this.className == 'deckArea') ? this : this.parentNode; // relates to problem @000001
    if (dDeckArea.data.projectNum == 0 && dDeckArea.data.type == sDeck.data.type) {
        dDeckArea.style = 'filter: brightness(2);';
    }
};

function dragDrop(e) {
    e.preventDefault();
    
    dDeckArea = (this.className == 'deckArea') ? this : this.parentNode; // relates to problem @000001
    // accept drop event if only if 
    // 1. drop zone belongs to a base project
    // 2. selected deck is of the same type as drop area
    if (dDeckArea.data.projectNum == 0 && dDeckArea.data.type == sDeck.data.type) {
        const cloneDeck = sDeck.cloneNode(true);
        cloneDeck.data = sDeck.data;
        setTimeout(() => (addElement(dDeckArea, cloneDeck), 0));
        console.log("Drop event accepted.");
    }

    // restore deck area shandow
    dDeckArea.style = 'filter: brightness(1);';
};



function startDragnDrop() {
    const decks = document.querySelectorAll('.deck');
    const deckAreas = document.querySelectorAll('.deckArea');

    for (const deck of decks) {
        deck.addEventListener('dragstart', dragStart);
        deck.addEventListener('dragend', dragEnd);

        // @000001
        // Dropping precision problem (11/May/2021 sarah.hao)
        //
        // The current solution is making all decks also 
        // droppable in order to increase the chance of dectaction. 
        // The following code and any code marked with @000001 is relating to 
        // this problem.
        deck.droppable = true;
        deck.addEventListener('dragover', dragOver);
        deck.addEventListener('dragenter', dragEnter);
        deck.addEventListener('dragleave', dragLeave);
    }

    for (const deckArea of deckAreas) {
        deckArea.droppable = true;
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
const uploadBtn_0 = document.getElementById('uploadButton_0');
const uploadBtn_1 = document.getElementById('uploadButton_1');
const uploadBtn_more = document.getElementById('uploadMoreButton');
const readFileBtn_0 = document.getElementById('readFileButton_0');
const readFileBtn_1 = document.getElementById('readFileButton_1');
const readFileBtn_more = document.getElementById('readFileButton_more'); 
const deckLayout_0 = document.getElementById('deckLayout_0');
const deckLayout_1 = document.getElementById('deckLayout_1');
// Once upload buttons are clicked
uploadBtn_0.addEventListener("click", function() {
    readFileBtn_0.click();
});
uploadBtn_1.addEventListener("click", function() {
    readFileBtn_1.click();
});
uploadBtn_more.addEventListener('click', function() {
    readFileBtn_more.click();
});

// Once some files have been accepted
readFileBtn_0.addEventListener("change", function () {
    if (readFileBtn_0.value) {
        // display project name
        const projectName = this.parentNode.parentNode.querySelector('.projectName');
        temp = readFileBtn_0.value.split("\\");
        baseProjectName.push(temp[temp.length - 1]);
        projectName.innerText = baseProjectName[0];

        let fileReader = new FileReader();
        fileReader.onload = function () {
            // read file as BASE project
            const content = fileReader.result;
            baseProject[0] = JSON.parse(content);

            // draw the deck UI
            drawDecks(deckLayout_0, baseProject[0], 0);
            uploadBtn_0.style = "display:none;";

            // start the drag and drop animation
            baseProjectUploaded = true;
            if (refeProjectUploaded) {
                //@todo add drag n drop guide
                startDragnDrop();
                activateUploadMoreButton();
                activateMerge();
            }
        };
        fileReader.readAsText(readFileBtn_0.files[0]);
        
    }
});
readFileBtn_1.addEventListener("change", function () {
    if (readFileBtn_1.value) {
        // display project name
        const projectName = this.parentNode.parentNode.querySelector('.projectName');
        const temp = readFileBtn_1.value.split("\\");
        refeProjectName[0] = temp[temp.length - 1];
        projectName.innerText = refeProjectName[0];

        let fileReader = new FileReader();
        fileReader.onload = function () {
            // read file as REFE project
            const content = fileReader.result;
            refeProject.push(JSON.parse(content));

            // draw the deck UI
            drawDecks(deckLayout_1, refeProject[0], 1);           
            uploadBtn_1.style = "display:none;";
            // deckLayout_1.style = "display:gird;";

            // start the drag and drop animation
            refeProjectUploaded = true;
            if (baseProjectUploaded) {
                startDragnDrop();
                activateUploadMoreButton();
                activateMerge();
            }
        };
        fileReader.readAsText(readFileBtn_1.files[0]);
        
    }
});


// Upload more button
readFileBtn_more.addEventListener("change", function () {
    console.log('button clicked!');
    if (this.value) {
        // Create a new container from template
        const container = copyTemplate('container_template');
        const deckLayout = container.querySelector('.deckLayout');
        const projectName = container.querySelector('.projectName');


        // display project name
        index = refeProject.length;
        const temp = this.value.split("\\");
        refeProjectName.push(temp[temp.length - 1]);
        projectName.innerText = refeProjectName[index];
        document.querySelector('.grid').append(container);


        // Assign project number and deckLayout ID 
        projectNum = baseProject.length + refeProject.length;
        deckLayout_id = 'decklayout_' + toString(projectNum);
        deckLayout.id = deckLayout_id;

        let fileReader = new FileReader();
        fileReader.onload = function () {
            
            // read file as REFE project
            const content = fileReader.result;
            refeProject.push(JSON.parse(content));

            // draw the deck UI
            drawDecks(deckLayout, refeProject[index], projectNum);           

            // start the drag and drop animation
            refeProjectUploaded = true;
            if (baseProjectUploaded) {
                startDragnDrop();
            }
        };
        fileReader.readAsText(this.files[0]);
        this.value = '';
    }
});


function activateUploadMoreButton() {
    console.log('Trying to activate uploadMoreButton!');
    if (refeProject.length > 0 && baseProject.length > 0){
        uploadBtn_more.style.display = 'flex';
    }else {
        console.log('Activate uploadMoreButton when there is no refe project or base project will cause error!');
    }
}
 



















// ----------------------------------------------------------------
// Merge and download files
//
//
//
const mergeButton = document.getElementById("mergeButton");
// This function activate the merge button.
// It's called once a drag and drop event is accepted
function activateMerge() {
    mergeactivated = true;
    activateUndo();
    activateReset();
    mergeButton.addEventListener('click', merge);
    mergeButton.style.display = 'flex';
    console.log("Merge button activates!");
};

function deactivateMerge() {
    mergeButton.removeEventListener('click', merge);
    mergeButton.style.display = 'none';
    mergeactivated = false;
    console.log("Merge button deactivates!");
};

function merge() {
    // create a deep copy of base project
    let mergeProject = JSON.parse(JSON.stringify(baseProject[0]));

    // modify the copy
    for (let i = 0 ; i < deckLayout_0.children.length ; i++) {
        
        const deck = deckLayout_0.children[i].querySelector('.deck:last-child');
        console.log('[merge] deck', deck);
        if (deck) {
            // We detect a change if either:
            // 1. the deck's project is NOT base project
            // 2. the deck num does NOT equal to the deckArea num
            if (deck.data.projectNum != 0 || deck.data.deckNum != i) {
                projectNum = deck.data.projectNum;
                deckNum = deck.data.deckNum;
                
                // accept two possible name while find project decks ('decks' and 'scene_decks'), relates to problem @000002.
                if (mergeProject.decks != undefined) {
                    mergeProject.decks[i] = refeProject[projectNum-1].decks != undefined ? refeProject[projectNum-1].decks[deckNum] : refeProject[projectNum-1].scene_decks[deckNum];
                }
                else if (mergeProject.scene_decks != undefined) {
                    mergeProject.scene_decks[i] = refeProject[projectNum-1].decks != undefined ? refeProject[projectNum-1].decks[deckNum] : refeProject[projectNum-1].scene_decks[deckNum];
                }
                else {
                    console.log("Base project missing an attribute called 'decks' or 'scene_decks'. ");
                }
            }
        }
    }

    // download the copy
    let filename = baseProjectName[0].substring(0, 3) + "_X_" + refeProjectName[0].substring(0, 3) + ".ssp";
    console.log("download ", filename);
    download(filename, JSON.stringify(mergeProject, null, '\t'));
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
// Undo, reset, home and guide button
//
//
//
const undoButton = document.getElementById("undoButton");
const resetButton = document.getElementById("resetButton");
const guideButton = document.getElementById("guideButton");
const guideWindow = document.getElementById("guideWindow");
const closeGuideButton = document.getElementById("closeGuideButton");
const message = document.getElementById("message");
const closeMessageButton = document.getElementById("closeMessageButton");



guideButton.addEventListener('click', guide);
closeGuideButton.addEventListener('click', closeGuide);
closeMessageButton.addEventListener('click', closeMessage);

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
    console.log("[undo] button clicked");
    if (actionList.length == 0) {
        showMessage("Nothing to undo. \n\n If you wish to undo uploading a project, please refresh the page :)");
        return;
    }

    const area = actionList.pop(); // remove the drag and drop event from action list
    area.removeChild(area.querySelector('.deck')); // remove the last deck from UI
    // recover the next deck's name
    let next_deck = area.querySelector('.deck');
    area.querySelector('.name').innerText = next_deck.data.name; 
    next_deck.style.display = "flex";
};

function reset() {
    console.log("reset button clicked");
    deckLayout_0.innerHTML = '';
    drawDecks(deckLayout_0, baseProject[0], 0);
    startDragnDrop(); 
};

function guide() {
    console.log("guide button clicked");
    if (!guideShown) {guideWindow.style.visibility = "visible"; guideShown = true;}
    else {guideWindow.style = "visibility:hidden;"; guideShown = false;}
};

function closeGuide() {
    guideWindow.style = "visibility:hidden;"; guideShown = false;
}

function closeMessage() {
    message.style = "display: none;"; messageShown = false;
}

function showMessage(text) {
    message.querySelector('p').innerText = text;
    console.log('[message]', message.querySelector('p').innerText);
    message.style = "display: flex;"; messageShown = true;
}