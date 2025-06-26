let boot_msg = [
    'Loading webOS 0.0.1-alpha...',
    'Loading initial ramdisk ...',
    'Created slice Slice /system/getty.',
    'Created slice Slice /system/modprobe.',
    'Listening on initctl Compatibility Named Pipe.',
    'Listening on Journal Socket (/dev/log).',
    'Started Forward Password Requests to Wall Directory Watch.',
    'Listening on udev Control Socket.',
    'Reached target Swap.',
    'Reached target Remote File Systems.',
    'Mounting FUSE Control File System...',
    'Mounted FUSE Control File System.',
    'Started Journal Service.',
    'Starting Load Kernel Modules...',
    'Starting Remount Root and Kernel File Systems...',
    'Finished Load Kernel Modules.',
    'Starting Apply Kernel Variables...',
    'Finished Apply Kernel Variables.',
    'Finished Remount Root and Kernel File Systems.',
    'Starting Coldplug All udev Devices...',
    'Finished Coldplug All udev Devices.',
    'Starting udev Kernel Device Manager...',
    'Started udev Kernel Device Manager.',
    'Found device localStorage.',
    'Starting File System Check on /dev/sda1...',
    'Finished File System Check on /dev/sda1.',
    'Mounting /boot...',
    'Mounted /boot.',
    'Reached target Local File Systems.',
    'Starting Create Volatile Files and Directories...',
    'Finished Create Volatile Files and Directories.',
    'Starting Network Service...',
    'Started Network Service.',
    'Started Login Service.',
    'Started Authorization Manager.',
    'Started Display Manager.',
    'Reached target Graphical Interface.',
    'Starting Session Manager...',
    'Started Display Manager.'
];

// Lazy ah solution because I don't want to waste time on finding out which of these
// I should display with [  OK  ].
const successKeywords = [
    'Created',
    'Started',
    'Finished',
    'Mounted',
    'Reached target',
    'Found device'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isSuccessMessage(message) { // Really lazy
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
    window.location.href = 'main.html';
}

generateBootLogs();
