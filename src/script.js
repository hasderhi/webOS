const terminalMain = document.querySelector('.terminal-main');
const terminalHeader = document.querySelector('.terminal-header');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

terminalHeader.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = terminalMain.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    terminalHeader.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        terminalMain.style.left = `${e.clientX - offsetX}px`;
        terminalMain.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    terminalHeader.style.cursor = 'grab';
    document.body.style.userSelect = '';
});