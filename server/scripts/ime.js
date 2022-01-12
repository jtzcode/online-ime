let textBuffer = "";
let textInput = null;

function startComposition(text) {
    const url = `/candidate?text=${text}`;
    fetch(url).then(res => {
        if (res.status === 200) {
            res.text().then(data => {
                console.log("Candidate data: ", data);
            });
        }
    });
}
function showCandidateList(res) {
    console.log("Candidate info: ", res);
}

window.onload = () => {
    textInput = document.getElementById('input-area');
    textInput.addEventListener('compositionupdate', evt => {
        console.log(evt);
    });

    textInput.addEventListener('keydown', evt => {
        console.log("keydown: ", evt);
        textBuffer += evt.key;
        startComposition(textBuffer);
    })

    textInput.addEventListener('keyup', evt => {
    })
}
