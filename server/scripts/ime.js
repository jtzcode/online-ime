let textBuffer = "";
let inputArea;
let textInput = null;
let imeContainer = null;
let candidateWindow = null;
let currentCandidates = [];
let selectedIndex = null;
let isIMEActive = false;
let currentCursorPos = null;
let textFontSize = null;
const bodyMargin = 8;
const extraBorder = 8;
let lastKeydown = null;
let isIMEEnable = true;

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
    moveCandidateWindow();
}

function moveCandidateWindow() {
    const imeLeft = bodyMargin + currentCursorPos.left;
    const imeTop = bodyMargin + currentCursorPos.top + textFontSize + extraBorder;
    const candidateLeft = imeLeft;
    const candidateTop = imeTop + textInput.getBoundingClientRect().height;

    imeContainer.style.left = imeLeft + 'px';
    imeContainer.style.top = imeTop + 'px';
    candidateWindow.style.left = candidateLeft + 'px';
    candidateWindow.style.top = candidateTop + 'px';
}

function endComposition(index) {
    let isEnter = index === undefined ? true : false
    inputArea.value += (!isEnter ? currentCandidates[index - 1] : textInput.innerText);
    currentCandidates = [];
    textInput.innerText = "";
    textBuffer = "";
    candidateWindow.innerText = "";
    candidateWindow.style.display = "none";
    imeContainer.style.zIndex = '-1';
    isIMEActive = false;
    currentCursorPos = getCaretCoordinates(inputArea, inputArea.selectionEnd);
}
function startComposition(text) {
    imeContainer.style.zIndex = '14';
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

function fetchMoreCandidates() {
    const url = `/more`;
    fetch(url).then(res => {
        if (res.status === 200) {
            res.json().then(data => {
                console.log("More candidate data: ", data);
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
    candidateWindow = document.getElementById("candidate-contaier");
    imeContainer = document.getElementById("ime-container");
    textInput = document.getElementById("ime-buffer");
    textInput.addEventListener('compositionstart', evt => {
        isIMEActive = true;
    });
    const digitsReg = new RegExp('^[1-9]+$');
    //const printableReg = new RegExp(/^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i);
    textFontSize = parseFloat(getComputedStyle(inputArea, null).getPropertyValue('font-size'));

    inputArea.addEventListener('keydown', evt => {
        console.log("keydown: ", evt);
        currentCursorPos = getCaretCoordinates(inputArea, inputArea.selectionEnd);
        if (evt.key === 'Shift' && (evt.altKey || evt.ctrlKey)) {
            return true;
        }
        lastKeydown = evt.key;
        if (isIMEActive) {
            if (evt.key === 'Enter' && isIMEActive) {
                endComposition();
            }
            else if (evt.code === 'Space' && isIMEActive) {
                endComposition(1);
            } else if (evt.key.match(digitsReg) && isIMEActive) {
                endComposition(parseInt(evt.key));
            } else if (evt.code === 'ArrowDown') {
                fetchMoreCandidates();
            }
            evt.preventDefault();
            evt.stopPropagation();
        }
        if (!evt.key.match(digitsReg) && isLetter(evt.key) && isIMEEnable) {
            textBuffer += evt.key;
            startComposition(textBuffer);
            evt.preventDefault();
            evt.stopPropagation();
        }
        
    });
    inputArea.addEventListener('keyup', evt => {
        if (evt.key === 'Shift' && !evt.altKey && !evt.ctrlKey && lastKeydown === 'Shift') {
            isIMEEnable = !isIMEEnable;
            lastKeydown = null;
        }
    });
    inputArea.addEventListener('compositionstart', evt => {
        evt.preventDefault();
        return false;
    });

    // textInput.addEventListener('focus', evt => {
    //     evt.target.selectionStart = evt.target.selectionEnd = evt.target.innerText?.length;
    // });
}
