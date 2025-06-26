let boot_msg = [
'Stopped target Graphical Interface.',
'Stopped Display Manager.',
'Stopped Login Service.',
'Stopped Network Service.',
'Stopped Authorization Manager.',
'Stopped D-Bus System Message Bus.',
'Stopped Disk Manager.',
'Unmounted /boot.',
'Unmounted /home.',
'Stopping File System Check on /dev/sda1...',
'Stopped File System Check on /dev/sda1.',
'Stopping Load Kernel Modules...',
'Stopped Load Kernel Modules.',
'Stopping Apply Kernel Variables...',
'Stopped Apply Kernel Variables.',
'Stopped udev Kernel Device Manager.',
'Closed udev Control Socket.',
'Closed udev Kernel Socket.',
'Stopped Journal Service.',
'Removed slice system-getty.slice.',
'Removed slice User and Session Slice.',
'Reached target Shutdown.',
'Reached target Final Step.',
'Starting Power-Off...',
];

const successKeywords = [
    'Stopped',
    'Unmounted',
    'Closed',
    'Removed',
    'Reached target'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isSuccessMessage(message) {
    return successKeywords.some(keyword => message.startsWith(keyword));
}

async function generateBootLogs() {
    const elementContainer = document.getElementById('boot-log-container');

    for (let i = 0; i < boot_msg.length; i++) {
        const log = document.createElement('div');
        const msg = boot_msg[i];

        if (isSuccessMessage(msg)) {
            log.innerHTML = `<p>[  <span class="boot-log-msg-ok">OK</span>  ] ${msg}</p>`;
        } else {
            log.innerHTML = `<p>${msg}</p>`;
        }

        elementContainer.appendChild(log);
        elementContainer.scrollTop = elementContainer.scrollHeight;

        const randomDelay = Math.random() * 500;
        await sleep(randomDelay);
    }
    window.location.href = 'index.html';
}

generateBootLogs();
