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
    tabFiles: document.getElementById('tab-files'),
    tabContainer: document.getElementById('tab-container'),
    
    // Code pane
    fileSelect: document.getElementById('fileSelect'),
    conn: document.getElementById('conn'),
    testConnectionBtn: document.getElementById('test-connection-btn'),
    jsonPre: document.getElementById('json'),
    jsonLoader: document.getElementById('jsonLoader'),
    jsonLoadingIndicator: document.getElementById('json-loading-indicator'),

    // Test modal
testModal: document.getElementById('test-modal'),
testModalIcon: document.getElementById('test-modal-icon'),
testModalMessage: document.getElementById('test-modal-message'),
testModalOkBtn: document.getElementById('test-modal-ok-btn'),
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
    currentFileCount: document.getElementById('current-file-count'),
    totalFileCount: document.getElementById('total-file-count'),
    
    // Files pane
    fileTableBody: document.getElementById('file-table-body'),
    fileTableEmpty: document.getElementById('file-table-empty'),
    
    // Footer
    footerClock: document.getElementById('footer-clock'),
    clockDay: document.getElementById('clock-day'),
    clockHours: document.getElementById('clock-hours'),
    clockColon: document.getElementById('clock-colon'),
    clockMinutes: document.getElementById('clock-minutes'),
    clockAmPm: document.getElementById('clock-ampm'),
    
    // Unlock modal
    unlockModal: document.getElementById('unlock-modal'),
    unlockPassword: document.getElementById('unlock-password'),
    unlockError: document.getElementById('unlock-error'),
    unlockErrorMsg: document.getElementById('unlock-error-msg'),
    unlockBtn: document.getElementById('unlock-btn'),
    
    // Custom alert modal
    alertEl: document.getElementById('custom-alert'),
    alertMessage: document.getElementById('alert-message'),
    alertOkBtn: document.getElementById('alert-ok-btn'),
    
    // Custom confirm modal
    confirmEl: document.getElementById('custom-confirm'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    confirmOkBtn: document.getElementById('confirm-ok-btn'),
    
    // Custom select internals
    customSelectTrigger: document.querySelector('#fileSelect .custom-select-trigger'),
    customSelectValue: document.querySelector('#fileSelect .custom-select-value'),
    customSelectOptions: document.querySelector('#fileSelect .custom-select-options'),
  };
  
  window.dom = dom;
})();
