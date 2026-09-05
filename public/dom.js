// dom.js
(function() {
  'use strict';

  const dom = {
    // Header
    exitBtn: document.getElementById('exit-btn'),
    refreshBtn: document.getElementById('refresh-btn'),

    // Main
    pageTitle: document.getElementById('page-title'),
    contentDesc: document.getElementById('content-desc'),

    // Tabs
    tabCode: document.getElementById('tab-code'),
    tabTiktok: document.getElementById('tab-tiktok'),
    tabContainer: document.getElementById('tab-container'),

    // Code pane
    fileSelect: document.getElementById('fileSelect'),
    conn: document.getElementById('conn'),
    testResult: document.getElementById('test-result'),
    testConnectionBtn: document.getElementById('test-connection-btn'),
    jsonPre: document.getElementById('json'),
    jsonLoader: document.getElementById('jsonLoader'),
    jsonLoadingIndicator: document.getElementById('json-loading-indicator'),

    // TikTok pane
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileName: document.getElementById('file-name'),
    fileDetails: document.getElementById('file-details'),
    fileType: document.getElementById('file-type'),
    fileDate: document.getElementById('file-date'),
    filePrefix: document.getElementById('file-prefix'),
    uploadBtn: document.getElementById('upload-btn'),
    clearBtn: document.getElementById('clear-btn'),
    uploadProgress: document.getElementById('upload-progress'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    speedText: document.getElementById('speed-text'),

    // Footer
    footerClock: document.getElementById('footer-clock'),
    clockDay: document.getElementById('clock-day'),
    clockHours: document.getElementById('clock-hours'),
    clockColon: document.getElementById('clock-colon'),
    clockMinutes: document.getElementById('clock-minutes'),
    clockAmPm: document.getElementById('clock-ampm'),

    // Modal
    unlockModal: document.getElementById('unlock-modal'),
    unlockPassword: document.getElementById('unlock-password'),
    unlockError: document.getElementById('unlock-error'),
    unlockErrorMsg: document.getElementById('unlock-error-msg'),
    unlockBtn: document.getElementById('unlock-btn'),
  };

  // Also expose the custom select internals for convenience
  dom.customSelectTrigger = dom.fileSelect.querySelector('.custom-select-trigger');
  dom.customSelectValue = dom.fileSelect.querySelector('.custom-select-value');
  dom.customSelectOptions = dom.fileSelect.querySelector('.custom-select-options');

  window.dom = dom;
})();
