const terminalMain = document.querySelector('.terminal-main');
const terminalHeader = document.querySelector('.terminal-header');


// Shamelessly stolen from my escape room project
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


// Again, partially taken from an earlier project of mine

fileSystem ={
        '/':{
           type:'directory',
           contents:{
              home:{
                 type:'directory',
                 contents:{
                    'readme.txt':{
                       type:'file',
                       content:`Hey, welcome to your home directory! Here you can store all your files.
(Even though I wouldn't use it to store your dissertation)`
                    },
                 }
              }
           }
        }
};

let currentPath = ['/'];

function storeFileSystem() {
    try {
        localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
        printToTerminal('filesystem: file system stored successfully.');
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            printToTerminal('filesystem: out of space (This means that localStorage limits were reached)');
        }
        printToTerminal('filesystem: error storing file system: ' + e.message);
    }
}

function loadFileSystem() {
    try {
        const data = localStorage.getItem('fileSystem');
        if (data) {
            fileSystem = JSON.parse(data);
            printToTerminal('filesystem: file system loaded from local storage.');
        } else {
            printToTerminal('filesystem: no file system found in local storage.');
        }
    } catch (e) {
        printToTerminal('filesystem: error loading file system: ' + e.message);
    }
}

function clearFileSystem() {
    localStorage.removeItem('fileSystem');
    printToTerminal('filesystem: file system removed from local storage.');
}

function getFileFromPath(path) {
    const parts = path.split('/').filter(Boolean);
    let node = fileSystem['/'];
    
    for (const part of parts) {
      if (node.type === 'directory' && node.contents[part]) {
        node = node.contents[part];
      } else {
        return null;
      }
    }
    return node;
}

function getCurrentDir() {
    let dir = fileSystem['/'];
    for (let i = 1; i < currentPath.length; i++) {
        dir = dir.contents[currentPath[i]];
    }
    return dir;
}

function pwdCommand() {
    const path = currentPath.join('/');
    if (path === "/") {
        printToTerminal("/ (root)")
    }
    else {
        printToTerminal(path === '' ? '/' : path);
    }
}

function catCommand(fileName) {
    const dir = getCurrentDir();
    const file = dir.contents[fileName];

    if (file && file.type === 'file') {
        printToTerminal(file.content || '');
    } else if (file && file.type === 'directory') {
        printToTerminal(`cat: ${fileName}: Is a directory`);
    } else {
        printToTerminal(`cat: ${fileName}: No such file`);
    }
}

function rmCommand(name) {
    const dir = getCurrentDir();
    const item = dir.contents[name];

    if (!item) {
        printToTerminal(`rm: cannot remove '${name}': No such file or directory`);
    } else if (item.type === 'directory') {
        if (Object.keys(item.contents).length > 0) {
            printToTerminal(`rm: cannot remove '${name}': Directory not empty`);
        } else {
            delete dir.contents[name];
        }
    } else {
        delete dir.contents[name];
    }
}

function mkdirCommand(dirName) {
    const dir = getCurrentDir();
    if (!dir.contents[dirName]) {
        dir.contents[dirName] = {
            type: 'directory',
            contents: {}
        };
    } else {
        printToTerminal(`mkdir: cannot create directory '${dirName}': File exists`);
    }
}

function lsCommand() {
    const dir = getCurrentDir();
    const entries = Object.keys(dir.contents).join('  ');
    printToTerminal(entries || '(empty)');
}

function cdCommand(dirName) {
    if (dirName === '..') {
        if (currentPath.length > 1) currentPath.pop();
        return;
    }

    const dir = getCurrentDir();
    if (dir.contents[dirName] && dir.contents[dirName].type === 'directory') {
        currentPath.push(dirName);
    } else {
        printToTerminal(`cd: no such directory: ${dirName}`);
    }
}

function touchCommand(fileName) {
    const dir = getCurrentDir();
    if (!dir.contents[fileName]) {
        dir.contents[fileName] = {
        type: 'file',
        content: ''
        };
    } else {
        printToTerminal(`touch: file '${fileName}' already exists`);
    }
}

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
    } else if (terminalCommand === 'clear') {
        clearCommand();
    } else if (terminalCommand === 'cls') {
        clearCommand(); // I know, we aren't on Windows, but I'm used to it...
    } else if (terminalCommand === 'exit') {
        resetCommand(); // To be changed to "exitCommand", as soon as there will be a proper GUI with minimizing/closing
    } else if (terminalCommand === 'storefs') {
        storeFileSystem();
    } else if (terminalCommand === 'loadfs') {
        loadFileSystem();
    } else if (terminalCommand === 'clearfs') {
        clearFileSystem();
    } else if (terminalCommand === 'ls') {
        lsCommand();
    } else if (terminalCommand.startsWith('cd ')) {
        const arg = terminalCommand.split(' ')[1];
        cdCommand(arg);
    } else if (terminalCommand.startsWith('touch ')) {
        const arg = terminalCommand.split(' ')[1];
        touchCommand(arg);
    } else if (terminalCommand.startsWith('mkdir ')) {
        const arg = terminalCommand.split(' ')[1];
        mkdirCommand(arg);
    } else if (terminalCommand.startsWith('cat ')) {
        const arg = terminalCommand.split(' ')[1];
        catCommand(arg);
    } else if (terminalCommand.startsWith('rm ')) {
        const arg = terminalCommand.split(' ')[1];
        rmCommand(arg);
    }  else if (terminalCommand === 'pwd') {
        pwdCommand();
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

function clearCommand() {
    const terminalOutput = document.getElementById('terminal-output');
    terminalOutput.innerHTML = "";
}

function resetCommand() {
    const terminalOutput = document.getElementById('terminal-output');
    terminalOutput.innerHTML = `webOS version 0.0.0-alpha
Created by Tobias Kisling (<a href="https://github.com/hasderhi">https://github.com/hasderhi</a>)
Enter <i>help</i> to get started...`;
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
        const dir = getCurrentDir();
        dir.contents[fileName] = {
            type: 'file',
            content: message
        };
    } else {
        printToTerminal(message);
    }
}

function helpCommand() {
    printToTerminal(`--- Help ---

Available commands:
General -
    - help
        Usage: help
        Description: Show information about available commands and their usage.
    - clear
        Usage: clear
        Description: Clear the terminal (Delete all text).
    - exit
        Usage: exit
        Description: Exit the terminal.
    - echo
        Usage: echo <text> > <filepath>
        Description: Print text to terminal or, optionally, 
        write it to specified filepath.

Working with files / directories -
    - touch
        Usage: touch <filename>
        Description: Create a new file.
    - mkdir
        Usage: mkdir <directory>
        Description: Create a new directory.
    - rm
        Usage: rm <file or empty directory>
        Description: Delete a file or an empty directory.
    - ls
        Usage: ls
        Description: List all files and subdirectories in the current directory.
    - cd
        Usage: cd <directory>
        Alternative usage: cd ..
        Description: Change directory or go back one directory with "cd ..".
    - cat
        Usage: cat <filename>
        Description: Display the text content of a file.
    - pwd
        Usage: pwd
        Description: Show the current filepath

Saving / Retrieving the filesystem -
    - storefs
        Usage: storefs
        Description: Store the current state of the filesystem in localStorage.
    - loadfs
        Usage: loadfs
        Description: If a previous instance of the filesystem is found in localStorage,
        replace the current filesystem.
    - clearfs
        Usage: clearfs
        Description: If a previous instance of the filesystem is found in localStorage,
        delete it (The output will always say "removed from localStorage", no matter if
        there has been an actual instance in localStorage or not).
        `)
}

loadFileSystem()