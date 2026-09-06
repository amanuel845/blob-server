// dom.js
(function() {
  'use strict';
  
  const dom = {
    // Header
    exitBtn: document.getElementById('exit-btn'),
    lockBtn: document.getElementById('lock-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    
    // Main
    pageTitle: document.getElementById('page-title'),
    contentDesc: document.getElementById('content-desc'),
    deletionCount: document.getElementById('deletion-count'),
    
    // Tabs
    tabCode: document.getElementById('tab-code'),
    tabTiktok: document.getElementById('tab-tiktok'),
    tabFiles: document.getElementById('tab-files'),
    tabConfig: document.getElementById('tab-config'),
    tabContainer: document.getElementById('tab-container'),
    uploadCategoryInput: document.getElementById('upload-category-input'),
    deletionSpinner: document.getElementById('deletion-spinner'),
    
    // Code pane
    fileSelect: document.getElementById('fileSelect'),
    conn: document.getElementById('conn'),
    testModal: document.getElementById('test-modal'),
    testModalIcon: document.getElementById('test-modal-icon'),
    testModalMessage: document.getElementById('test-modal-message'),
    testModalOkBtn: document.getElementById('test-modal-ok-btn'),
    testConnectionBtn: document.getElementById('test-connection-btn'),
    jsonPre: document.getElementById('json'),
    jsonLoader: document.getElementById('jsonLoader'),
    jsonLoadingIndicator: document.getElementById('json-loading-indicator'),
    
    // TikTok pane
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
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
    cancelUploadBtn: document.getElementById('cancel-upload-btn'), // new
    
    // Files pane
    fileTableBody: document.getElementById('file-table-body'),
    fileTableEmpty: document.getElementById('file-table-empty'),
    paginationContainer: document.getElementById('pagination-container'), // new
    
    // Config pane
    configContainer: document.getElementById('config-container'),
    
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
    selectAllRows: document.getElementById('select-all-rows'),
    deleteSelectedBtn: document.getElementById('delete-selected-btn'),
  };
  
  window.dom = dom;
})();