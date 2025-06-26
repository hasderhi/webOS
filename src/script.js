const terminalMain = document.querySelector('.terminal-main');
const terminalHeader = document.querySelector('.terminal-header');

function changeVisibility(windowName) {
    if (windowName === 'terminal') {
        const terminalMain = document.querySelector('.terminal-main');
        const style = window.getComputedStyle(terminalMain);
        const visibility = style.getPropertyValue('visibility');
        if (visibility === 'hidden') {
            terminalMain.style.visibility = 'visible';
        } else {
            terminalMain.style.visibility = 'hidden';
        }
    }
    else if (windowName === 'filebrowser') {
        const fileBrowserMain = document.querySelector('.filebrowser-main');
        const style = window.getComputedStyle(fileBrowserMain);
        const visibility = style.getPropertyValue('visibility');
        if (visibility === 'hidden') {
            fileBrowserMain.style.visibility = 'visible';
            renderFileBrowserContent();
        } else {
            fileBrowserMain.style.visibility = 'hidden';
        }
    }
}

function hideWindow(windowName) {
    if (windowName === 'terminal') {
        const terminalMain = document.querySelector('.terminal-main');
        terminalMain.style.visibility = 'hidden';
    }
    if (windowName === 'filebrowser') {
        const fileBrowserMain = document.querySelector('.filebrowser-main');
        fileBrowserMain.style.visibility = 'hidden';
    }
}

function toggleFullscreen(windowName) {
    // the wackiest "full"screen view you've ever seen
    if (windowName === 'terminal') {
        const terminal = document.getElementById('terminal-main');
        terminal.classList.toggle('fullscreen-mode');
    }
    if (windowName === 'filebrowser') {
        const terminal = document.getElementById('filebrowser-main');
        terminal.classList.toggle('fullscreen-mode');
    }
}


// Shamelessly stolen from my escape room project
let terminal_isDragging = false;
let terminal_offsetX = 0;
let terminal_offsetY = 0;

terminalHeader.addEventListener('mousedown', (e) => {
    terminal_isDragging = true;
    const rect = terminalMain.getBoundingClientRect();
    terminal_offsetX = e.clientX - rect.left;
    terminal_offsetY = e.clientY - rect.top;
    terminalHeader.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (terminal_isDragging) {
        terminalMain.style.left = `${e.clientX - terminal_offsetX}px`;
        terminalMain.style.top = `${e.clientY - terminal_offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    terminal_isDragging = false;
    terminalHeader.style.cursor = 'grab';
    document.body.style.userSelect = '';
});








const fileBrowserMain = document.querySelector('.filebrowser-main');
const fileBrowserHeader = document.querySelector('.filebrowser-header');

let filebrowser_isDragging = false;
let filebrowser_offsetX = 0;
let filebrowser_offsetY = 0;

fileBrowserHeader.addEventListener('mousedown', (e) => {
    filebrowser_isDragging = true;
    const rect = fileBrowserMain.getBoundingClientRect();
    filebrowser_offsetX = e.clientX - rect.left;
    filebrowser_offsetY = e.clientY - rect.top;
    fileBrowserHeader.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (filebrowser_isDragging) {
        fileBrowserMain.style.left = `${e.clientX - filebrowser_offsetX}px`;
        fileBrowserMain.style.top = `${e.clientY - filebrowser_offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    filebrowser_isDragging = false;
    fileBrowserHeader.style.cursor = 'grab';
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
let users = ["root"];
let username = "root";

function storeUsers() {
    try {
        localStorage.setItem('users', users);
        printToTerminal('filesystem: userfile stored successfully.');
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            printToTerminal('filesystem: out of space (This means that localStorage limits were reached)');
        }
        printToTerminal('filesystem: error storing userfile: ' + e.message);
    }
}

function loadUsers() {
    try {
        const data = localStorage.getItem('users');
        if (data) {
            users = data;
            printToTerminal('filesystem: userfile loaded from local storage.');
        } else {
            printToTerminal('filesystem: no userfile found in local storage.');
        }
    } catch (e) {
        printToTerminal('filesystem: error loading userfile: ' + e.message);
    }
}

function clearUsers() {
    localStorage.removeItem('users');
    printToTerminal('filesystem: userfile removed from local storage.');
}




function storeFileSystem() {
    storeUsers();
    try {
        localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
        printToTerminal('filesystem: file system stored successfully.');
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            printToTerminal('filesystem: out of space (This means that localStorage limits were reached)');
        }
        printToTerminal('filesystem: error storing file system: ' + e.message);
    }
    renderFileBrowserContent();
}

function loadFileSystem() {
    loadUsers();
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
    renderFileBrowserContent();
}

function clearFileSystem() {
    clearUsers();
    localStorage.removeItem('fileSystem');
    printToTerminal('filesystem: file system removed from local storage.');
    renderFileBrowserContent();
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

function whoamiCommand() {
    printToTerminal(username);
}

function fingerCommand(username) {
    if (users.includes(username)) {
        printToTerminal(`Login: ${username}                         
Name: ${username}
Directory: /home/               
Shell: /bin/whatever_shell_idk_what_im_gonna_name_it
On since idk_when_im_gonna_implement_a_date
No mail.
No Plan.`);
    }
    else {
        printToTerminal(`finger: no user with this name was found`)
    }
}

function listUsersCommand() {
    printToTerminal(users);
}

function useraddCommand(username) {
    if (users.includes(username)) {
        printToTerminal(`useradd: cannot add user ${username}, user with this name already exists`);
        return;
    } 
    users.push(username);
    printToTerminal(`useradd: created user ${username}`);
}

function userdelCommand(username) {
    if (username === 'root') {
        printToTerminal(`userdel: cannot delete root`);
        return;
    }
    const index = users.indexOf(username);
    if (index > -1) {
        users.splice(index, 1);
        printToTerminal(`userdel: deleted user ${username}`);
        suCommand("root");
    }
    else {
        printToTerminal(`userdel: no user with this name was found`)
    }
}

function suCommand(username_input) {
    if (users.includes(username_input)) {
        username = username_input;
    }
    else {
        printToTerminal(`su: cannot switch user, no user with this name was found`)
    }
}

function logoutCommand() {
    // Currently just switches to root, maybe I'm gonna implement a proper login system later on
    printToTerminal('logout')

    // So you can actually see the msg
    setTimeout(() => {
        suCommand('root');
    }, '1000');
    setTimeout(() => {
        exitCommand();
    }, '1500')
}

function shutdownCommand() {
    logoutCommand();
    window.location.href = 'shutdown.html';
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
            printToTerminal(`rm: cannot remove '${name}': Directory not empty`); // who needs -r anyways?
        } else {
            delete dir.contents[name];
        }
    } else {
        delete dir.contents[name];
    }
    renderFileBrowserContent();
}

function mkdirCommand(dirName) {
    if (dirName === null) {
        printToTerminal(`mkdir: cannot create directory named ${dirName}, aborted`);
        return;
    }
    const dir = getCurrentDir();
    if (!dir.contents[dirName]) {
        dir.contents[dirName] = {
            type: 'directory',
            contents: {}
        };
    } else {
        printToTerminal(`mkdir: cannot create directory '${dirName}': File exists`);
    }
    renderFileBrowserContent();
}

function lsCommand() {
    const dir = getCurrentDir();
    const entries = Object.keys(dir.contents).join('  ');
    printToTerminal(entries || '(empty)');
    renderFileBrowserContent(); // Not really needed as ls isn't changing the files, just here for consistency
    // This is bad because now the explorer resets everytime, but this isn't a problem with the commands, I need to fix this on the explorer side.
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
    renderFileBrowserContent();
}

function touchCommand(fileName) {
    if (fileName === null) {
        printToTerminal(`touch: cannot create file named ${fileName}, aborted`);
        return;
    }
    const dir = getCurrentDir();
    if (!dir.contents[fileName]) {
        dir.contents[fileName] = {
        type: 'file',
        content: ''
        };
    } else {
        printToTerminal(`touch: file '${fileName}' already exists`);
    }
    renderFileBrowserContent();
}







const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

terminalInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const terminalCommand = terminalInput.value.trim();
        if (terminalCommand !== '') {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.textContent = `${username}@webos-host: ${currentPath.join('/')}$ ${terminalCommand}`;
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
        exitCommand();
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
    } else if (terminalCommand === 'pwd') {
        pwdCommand();
    } else if (terminalCommand === 'whoami') {
        whoamiCommand();
    } else if (terminalCommand === 'lsusr') { 
        listUsersCommand();
    } else if (terminalCommand.startsWith('useradd ')) { 
        const arg = terminalCommand.split(' ')[1];
        useraddCommand(arg);
    } else if (terminalCommand.startsWith('userdel ')) { 
        const arg = terminalCommand.split(' ')[1];
        userdelCommand(arg);
    } else if (terminalCommand.startsWith('su ')) {
        const arg = terminalCommand.split(' ')[1];
        suCommand(arg);
    } else if (terminalCommand === 'logout') {
        logoutCommand();
    } else if (terminalCommand === 'shutdown') {
        shutdownCommand();
    } else if (terminalCommand.startsWith('finger ')) {
        const arg = terminalCommand.split(' ')[1];
        fingerCommand(arg);
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

function exitCommand() {
    hideWindow('terminal');
    const terminalOutput = document.getElementById('terminal-output');
    terminalOutput.innerHTML = `webOS version 0.0.1-alpha
Created by Tobias Kisling (<a href="https://github.com/hasderhi">https://github.com/hasderhi</a>)
Enter <i>help</i> to get started...`; // It is very likely that I'm going to forget to change 
// the version number on both sides (HTML, JS) at one point...
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
    renderFileBrowserContent();
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

Managing system -
    - logout
        Usage: logout
        Description: Log out of your user and close the terminal.
    - shutdown
        Usage: shutdown
        Description: Log out and shut down the system.

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

Managing users -
    - whoami
        Usage: whoami
        Description: Show the user currently logged in
    - lsusr
        Usage: lsusr
        Description: List all users
    - useradd
        Usage: useradd <username>
        Description: Add a new user
    - userdel
        Usage: userdel <username>
        Description: Delete an existing user
    - su
        Usage: su <username>
        Description: Switch to another existing user
    - finger
        Usage: finger <username>
        Description: Show information about an user

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










// Filebrowser



function getDirectoryFromPath(path) {
    const parts = path.split('/').filter(Boolean);
    let current = fileSystem['/'];

    for (let part of parts) {
        if (current.type === 'directory' && current.contents[part]) {
            current = current.contents[part];
        } else {
            return null;
        }
    }

    return current;
}

function renderFileBrowserContent(path = '/') {
    const container = document.getElementById("filebrowser-content");

    const inputContainer = container.querySelector(".filebrowser-input-container");

    container.innerHTML = '';
    container.appendChild(inputContainer);

    const input = document.getElementById("filebrowser-input");
    input.value = path;

    const dir = getDirectoryFromPath(path);

    if (!dir || dir.type !== 'directory') {
        container.appendChild(document.createTextNode("Invalid path"));
        return;
    }

    const list = document.createElement("div");
    list.classList.add("file-list");

    for (const name in dir.contents) {
        const item = dir.contents[name];
        const element = document.createElement("div");
        element.classList.add("file-item", item.type);
        element.innerText = name;

        if (item.type === 'directory') {
            element.addEventListener('click', () => {
                renderFileBrowserContent(`${path.endsWith('/') ? path : path + '/'}${name}`);
            });
        }

        if (item.type === 'file') {
            element.addEventListener('click', () => {
                alert(item.content); // Just for testing, later there'll be an editor, I'm just unsure if it's gonna be a nice visual one or if I want to simulate VIM
            });
        }

        list.appendChild(element);
    }

    container.appendChild(list);
}

document.getElementById('filebrowser-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        renderFileBrowserContent(this.value);
    }
});



loadFileSystem(); // Debug, later the user will be able to choose whether they want to load from ls or not
// through the "bootloader" window