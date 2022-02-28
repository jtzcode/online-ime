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
    inputArea.value += (!isEnter ? currentCandidates[index - 1] : textInput.innerText);
    currentCandidates = [];
    textInput.innerText = "";
    textBuffer = "";
    candidateWindow.innerText = "";
    candidateWindow.style.display = "none";
    imeContainer.style.display = 'none';
    isIMEActive = false;
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

function isLetter(c) {
    return c.length === 1 && c.toLowerCase() != c.toUpperCase();
}

window.onload = () => {
    inputArea = document.getElementById('input-area');
    textInput.addEventListener('compositionstart', evt => {
        isIMEActive = true;
    });
    const digitsReg = new RegExp('^[1-9]+$');
    const printableReg = new RegExp(/^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i);

    inputArea.addEventListener('keydown', evt => {
        console.log("keydown: ", evt);
        if (isIMEActive) {
            if (evt.key === 'Enter' && isIMEActive) {
                endComposition();
            }
            else if (evt.code === 'Space' && isIMEActive) {
                endComposition(1);
            } else if (evt.key.match(digitsReg) && isIMEActive) {
                endComposition(parseInt(evt.key));
            }
            evt.preventDefault();
            evt.stopPropagation();
        }
        if (!evt.key.match(digitsReg) && isLetter(evt.key)) {
            textBuffer += evt.key;
            startComposition(textBuffer);
            evt.preventDefault();
            evt.stopPropagation();
        }
        
    });
    inputArea.addEventListener('beforeinput', evt => {
    });

    // textInput.addEventListener('focus', evt => {
    //     evt.target.selectionStart = evt.target.selectionEnd = evt.target.innerText?.length;
    // });
}
