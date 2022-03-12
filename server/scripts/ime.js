let textBuffer = "";
let inputArea;
let textInput = null;
let imeContainer = null;
let candidateWindow = null;
const candidateWindowSize = 10;
let pageNum = 1;
let currentCandidates = [];
let pageCandidates = [];
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
    pageCandidates = currentCandidates.slice((pageNum - 1) * candidateWindowSize);
    let resultStr = "";
    pageCandidates.forEach((candidate, index) => {
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
    inputArea.value += (!isEnter ? pageCandidates[index - 1] : textInput.innerText);
    currentCandidates = [];
    pageCandidates = [];
    textInput.innerText = "";
    textBuffer = "";
    candidateWindow.innerText = "";
    candidateWindow.style.display = "none";
    imeContainer.style.zIndex = '-1';
    isIMEActive = false;
    currentCursorPos = getCaretCoordinates(inputArea, inputArea.selectionEnd);
    pageNum = 1;
}
function startComposition(text) {
    imeContainer.style.zIndex = '14';
    textInput.innerText = text;
    const url = `/candidate?text=${text}&num=${pageNum * candidateWindowSize}`;
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

function getMoreCandidates() {
    pageNum++;
    const url = `/more?text=${textBuffer}&num=${pageNum * candidateWindowSize}`;
    fetch(url).then(res => {
        if (res.status === 200) {
            res.json().then(data => {
                console.log("Update candidate data: ", data);
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
            if (evt.key === 'Enter') {
                endComposition();
            }
            else if (evt.code === 'Space') {
                endComposition(1);
            } else if (evt.key.match(digitsReg)) {
                endComposition(parseInt(evt.key));
            } else if (evt.code === 'ArrowDown') {
                getMoreCandidates();
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
