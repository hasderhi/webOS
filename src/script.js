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




const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

terminalInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const terminalCommand = terminalInput.value.trim();
        if (terminalCommand !== '') {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.textContent = `user: folder$ ${terminalCommand}`;
            terminalOutput.appendChild(line);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            processCommand(terminalCommand);
        }
        else {
            printToTerminal("\n")
        }
        terminalInput.value = '';
    }
})



function processCommand(terminalCommand) {
    if (terminalCommand.startsWith('echo')) {
        echoCommand(terminalCommand);
    } else if (terminalCommand === 'help') {
        helpCommand();
    } else {
        printToTerminal(`${terminalCommand}: command not found`)
    }
}

function printToTerminal(message) {
    const terminalOutput = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = message;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function echoCommand(input) {
    const match = input.match(/^echo\s+(.+?)(?:\s*>\s*(\S+))?$/);
    if (!match) {
        printToTerminal('echo: invalid syntax');
        return;
    }
    const message = match[1];
    const fileName = match[2];

    if (fileName) {
        printToTerminal('echo: function to be implemented');
    } else {
        printToTerminal(message);
    }
}

function helpCommand() {
    printToTerminal(`--- Help ---

Available commands:
- echo
    Usage: echo <text> > <filepath>
    Description: Prints text to terminal or, optionally, writes it to specified filepath.
- help
    Usage: help
    Description: Shows information about available commands and their usage.
        `)
}