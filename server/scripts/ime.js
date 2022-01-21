let textBuffer = "";
let inputArea;
let textInput = null;
let imeContainer = null;
let candidateWindow = null;
let currentCandidates = [];
let selectedIndex = null;
let isIMEActive = false;

candidateWindow = document.getElementById("candidate");
candidateWindow.style.display = "none";


imeContainer = document.createElement('div');
imeContainer.style.position = 'absolute';
imeContainer.style.display = 'none';
imeContainer.setAttribute('id', 'ime-container');
document.getElementById('app-container').appendChild(imeContainer);

textInput = document.createElement('span');
textInput.setAttribute('id', 'ime-buffer');
textInput.setAttribute('contenteditable', true);
textInput.setAttribute('spellcheck', false);
textInput.setAttribute('class', 'ime-buffer');
textInput.setAttribute('tabindex', '0');
textInput.style.caretColor = 'transparent';
textInput.style.fontSize = '10px';
textInput.style.marginLeft = '0px';
imeContainer.appendChild(textInput);

function setCandidates(data) {
    imeContainer.style.zIndex = 14;
    let dataArray = JSON.parse(data);
    currentCandidates = dataArray[1][0][1] || [];
    let resultStr = "";
    currentCandidates.forEach((candidate, index) => {
        resultStr += `${index + 1}. ${candidate} `;
    });
    candidateWindow.style.display = "block";
    candidateWindow.innerText = resultStr;
}

function moveCandidateWindow() {
}

function endComposition(index) {
    let isEnter = index === undefined ? true : false
    inputArea.value += (!isEnter ? currentCandidates[index] : textInput.innerText);
    currentCandidates = [];
    textInput.innerText = "";
    textBuffer = "";
    candidateWindow.innerText = "";
    candidateWindow.style.display = "none";
    imeContainer.style.display = 'none';
}
function startComposition(text) {
    imeContainer.style.display = 'block';
    textInput.innerText = text;
    const url = `/candidate?text=${text}`;
    isIMEActive = true;
    fetch(url).then(res => {
        if (res.status === 200) {
            res.json().then(data => {
                console.log("Candidate data: ", data);
                setCandidates(data);
            });
        }
    });
}

window.onload = () => {
    inputArea = document.getElementById('input-area');
    textInput.addEventListener('compositionstart', evt => {
        isIMEActive = true;
    });

    inputArea.addEventListener('keydown', evt => {
        console.log("keydown: ", evt);
        if (evt.key === 'Enter') {
            endComposition();
        }
        else if (evt.code === 'Space' && isIMEActive) {
            endComposition(0);
        } else {
            textBuffer += evt.key;
            startComposition(textBuffer);
        }
        evt.stopPropagation();
        evt.preventDefault();
    });
    inputArea.addEventListener('beforeinput', evt => {
    });

    // textInput.addEventListener('focus', evt => {
    //     evt.target.selectionStart = evt.target.selectionEnd = evt.target.innerText?.length;
    // });
}
