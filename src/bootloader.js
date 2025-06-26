// "Bootloader"

let selectionIndex = 0;
const possible_selections = ['webOS_normal', 'webOS_no_ls', 'poweroff', 'memtest'];
const optionElements = document.querySelectorAll('.bootloader-options li');

function updateSelection() {
    optionElements.forEach((el, index) => {
        if (index === selectionIndex) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
        selectionIndex = (selectionIndex + 1) % possible_selections.length;
        updateSelection();
    } else if (e.key === 'ArrowUp') {
        selectionIndex = (selectionIndex - 1 + possible_selections.length) % possible_selections.length;
        updateSelection();
    } else if (e.key === 'Enter') {
        const selectedOption = possible_selections[selectionIndex];
        goForward(selectedOption);
    }
});

function goForward(option) {
    if (option === 'webOS_normal') {
        document.location.href = 'boot.html';
    } else if (option === 'webOS_no_ls') {
        document.location.href = 'main.html';
        console.log('webOS without localStorage');
    } else if (option === 'poweroff') {
        document.location.href = 'index.html';
    } else if (option === 'memtest') {
        alert(`Your memory seems alright to me!`);
    }
}

updateSelection();
