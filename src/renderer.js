'use strict';
const { ipcRenderer } = require('electron');

function triggerWordCount (event) {
  let wordCount = document.getElementById('script').value.match(/([^\s]+)/g);
  let lineCount = document.getElementById('script').value.match(/\n/g);

  // Safety checks
  if (wordCount === null) {
    wordCount = 0;
  } else {
    wordCount = wordCount.length;
  }
  if (lineCount === null) {
    lineCount = 1;
  } else {
    lineCount = lineCount.length + 1;
  }

  document.getElementById('word-count').innerHTML = wordCount + ' Words | ' + lineCount + ' Lines';
}

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  ipcRenderer.send('started_parsing', {
    name: document.querySelector('#script_name').value,
    script: document.querySelector('#script').value
  });
  document.querySelector('#script').focus();
});

// Script info
document.getElementById('script').addEventListener('input', triggerWordCount);

window.addEventListener('keydown', (event) => {
  if (event.keyCode === 13 && event.ctrlKey) {
    document.querySelector('button').click();
  }
});

ipcRenderer.on('parse', (event, data) => {
  document.querySelector('button').click();
});

ipcRenderer.on('open-script', (event, data) => {
  if (document.querySelector('#script').value !== '') {
    ipcRenderer.invoke('editor-overwrite-confirmation').then((result) => {
      if (result === 0) {
        document.querySelector('#script_name').value = data.name;
        document.querySelector('#script').value = data.value;

        // Trigger word count tracker
        triggerWordCount();
      }
    });
  } else {
    document.querySelector('#script_name').value = data.name;
    document.querySelector('#script').value = data.value;

    // Trigger word count tracker
    triggerWordCount();
  }
  document.querySelector('#script').focus();
});

ipcRenderer.on('empty-check', (event, data) => {
  if (document.querySelector('#script_name').value !== '') {
    ipcRenderer.send('save-script', {
      name: document.querySelector('#script_name').value,
      script: document.querySelector('#script').value
    });
  } else {
    ipcRenderer.send('save-script', null);
  }
  document.querySelector('#script').focus();
});

// Refresh
ipcRenderer.on('new-script', (event, data) => {
  document.getElementById('script_name').value = '';
  document.getElementById('script').value = '';
  document.getElementById('script_name').focus();
});

// Spellcheck option
// Refresh the textarea
ipcRenderer.on('toggle-spellcheck', (event, checked) => {
  const TEMP = document.getElementById('script').value;
  document.getElementById('script').value = '';
  document.getElementById('script').spellcheck = checked;
  document.getElementById('script').value = TEMP;
});
