const DEBUG = false;

// --- Module: Logger (Replaces all logger.* statements) ---
const logger = {
  logs: [], // Array to hold { type, message, timestamp }
  
  _push(type, args) {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    this.logs.push({
      type: type,
      message: message,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only the last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  },
  
  log(...args) {
    if (DEBUG) {
      console.log(...args);
    }
    this._push('LOG', args);
  },
  warn(...args) {
    if (DEBUG) {
      console.warn(...args);
    }
    this._push('WARN', args);
  },
  error(...args) {
    if (DEBUG) {
      console.error(...args);
    }
    this._push('ERROR', args);
  }
};

// --- Module: CONFIG ---
const CONFIG = (function() {
  'use strict';

  const DEFAULTS = {
    apiBase: 'https://blob-server.vercel.app/api',
    blobdbEndpoint: '/blob-server',
    encryptedKeyEndpoint: '/encrypted-key',
    storageKey: 'blob-db-storage-key',
    defaultCategory: 'json/tiktok',
    uploadThreshold: 4 * 1024 * 1024,
    smoothingFactor: 0.3,
    filterEnabled: true,
  };

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('app-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {
      if (DEBUG) {
        logger.warn('Failed to load config from localStorage', e);
      }
    }
    return { ...DEFAULTS };
  }

  const _data = loadFromStorage();

  function persist() {
    try {
      localStorage.setItem('app-config', JSON.stringify(_data));
    } catch (e) {
      if (DEBUG) {
        logger.warn('Failed to save config to localStorage', e);
      }
    }
  }

  const CONFIG_API = {
    get(key) {
      if (key in _data) {
        return _data[key];
      }
      if (DEBUG) {
        logger.warn(`Config key "${key}" not found.`);
      }
      return undefined;
    },

    set(key, value) {
      if (key in _data) {
        _data[key] = value;
        persist();
        document.dispatchEvent(new CustomEvent('configChanged', {
          detail: { key, value }
        }));
      } else {
        if (DEBUG) {
          logger.warn(`Config key "${key}" not found. Cannot set.`);
        }
      }
    },

    get apiBase() {
      return this.get('apiBase');
    },
    set apiBase(val) {
      this.set('apiBase', val);
    },

    get blobdbEndpoint() {
      return this.get('blobdbEndpoint');
    },
    set blobdbEndpoint(val) {
      this.set('blobdbEndpoint', val);
    },

    get encryptedKeyEndpoint() {
      return this.get('encryptedKeyEndpoint');
    },
    set encryptedKeyEndpoint(val) {
      this.set('encryptedKeyEndpoint', val);
    },

    get storageKey() {
      return this.get('storageKey');
    },
    set storageKey(val) {
      this.set('storageKey', val);
    },

    get defaultCategory() {
      return this.get('defaultCategory');
    },
    set defaultCategory(val) {
      this.set('defaultCategory', val);
    },

    get uploadThreshold() {
      return this.get('uploadThreshold');
    },
    set uploadThreshold(val) {
      this.set('uploadThreshold', val);
    },

    get smoothingFactor() {
      return this.get('smoothingFactor');
    },
    set smoothingFactor(val) {
      this.set('smoothingFactor', val);
    },

    get filterEnabled() {
      return this.get('filterEnabled');
    },
    set filterEnabled(val) {
      this.set('filterEnabled', val);
    },

    keys() {
      return Object.keys(_data);
    },

    reset() {
      Object.keys(DEFAULTS).forEach(key => {
        this.set(key, DEFAULTS[key]);
      });
    },

    onChange(callback) {
      document.addEventListener('configChanged', (e) => {
        callback(e.detail.key, e.detail.value);
      });
    }
  };

  return CONFIG_API;
})();
window.CONFIG = CONFIG;

// --- Module: DOM ---
const dom = (function() {
  'use strict';

  return {
    exitBtn: document.getElementById('exit-btn'),
    lockBtn: document.getElementById('lock-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    codeLoad: document.getElementById('code-load'),
    codeDownload: document.getElementById('code-download'),
    codeCopy: document.getElementById('code-copy'),
    codeUpload: document.getElementById('code-upload'),
    imagePreview: document.getElementById('image-preview'),
    previewModal: document.getElementById('preview-modal'),
    closePreview: document.getElementById('close-preview'),
    downloadPreview: document.getElementById('download-preview'),
    previewName: document.getElementById('previewName'),
    previewSize: document.getElementById('previewSize'),
    previewDate: document.getElementById('previewDate'),
    previewLoader: document.getElementById('previewLoader'),
    preview: document.getElementById('preview'),
    previewBar: document.getElementById('previewBar'),
    pageTitle: document.getElementById('page-title'),
    contentDesc: document.getElementById('content-desc'),
    deletionCount: document.getElementById('deletion-count'),
    tabCode: document.getElementById('tab-code'),
    tabTiktok: document.getElementById('tab-tiktok'),
    tabFiles: document.getElementById('tab-files'),
    tabConfig: document.getElementById('tab-config'),
    tabContainer: document.getElementById('tab-container'),
    uploadCategoryInput: document.getElementById('upload-category-input'),
    deletionSpinner: document.getElementById('deletion-spinner'),
    fileSelect: document.getElementById('fileSelect'),
    conn: document.getElementById('conn'),
    testModal: document.getElementById('test-modal'),
    testModalIcon: document.getElementById('test-modal-icon'),
    testModalMessage: document.getElementById('test-modal-message'),
    testModalOkBtn: document.getElementById('test-modal-ok-btn'),
    testConnectionBtn: document.getElementById('test-connection-btn'),
    jsonPre: document.getElementById('json'),
    jsonLoader: document.getElementById('jsonLoader'),
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
    cancelUploadBtn: document.getElementById('cancel-upload-btn'),
    fileTableBody: document.getElementById('file-table-body'),
    fileTableEmpty: document.getElementById('file-table-empty'),
    paginationContainer: document.getElementById('pagination-container'),
    configContainer: document.getElementById('config-container'),
    footerClock: document.getElementById('footer-clock'),
    clockDay: document.getElementById('clock-day'),
    clockHours: document.getElementById('clock-hours'),
    clockColon: document.getElementById('clock-colon'),
    clockMinutes: document.getElementById('clock-minutes'),
    clockAmPm: document.getElementById('clock-ampm'),
    unlockModal: document.getElementById('unlock-modal'),
    unlockPassword: document.getElementById('unlock-password'),
    unlockError: document.getElementById('unlock-error'),
    unlockBtn: document.getElementById('unlock-btn'),
    alertEl: document.getElementById('custom-alert'),
    alertMessage: document.getElementById('alert-message'),
    alertOkBtn: document.getElementById('alert-ok-btn'),
    confirmEl: document.getElementById('custom-confirm'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    confirmOkBtn: document.getElementById('confirm-ok-btn'),
    customSelectTrigger: document.querySelector('#fileSelect .custom-select-trigger'),
    customSelectValue: document.querySelector('#fileSelect .custom-select-value'),
    customSelectOptions: document.querySelector('#fileSelect .custom-select-options'),
    selectAllRows: document.getElementById('select-all-rows'),
    deleteSelectedBtn: document.getElementById('delete-selected-btn'),
    loggerModal: document.getElementById('logger-modal'),
    loggerOutput: document.getElementById('logger-output'),
    loggerCloseBtn: document.getElementById('logger-close-btn'),
    loggerClearBtn: document.getElementById('logger-clear-btn'),
    logBtn: document.getElementById('log-btn'),
  };
})();
window.dom = dom;

// --- Module: KeyEncryptor ---
const KeyEncryptor = (function() {
  'use strict';

  function _arrayBufferToBase6(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  function _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  function _base64ToArrayBuffe(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    const length = binary.length;
    for (let i = 0; i < length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  function _base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    let index = 0;
    for (const char of binary) {
      bytes[index] = char.charCodeAt(0);
      index++;
    }
    return bytes.buffer;
  }

  async function _deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt: salt,
      iterations: 600000,
      hash: 'SHA-256'
    }, keyMaterial, {
      name: 'AES-GCM',
      length: 256
    }, false, ['encrypt', 'decrypt']);
  }

  async function encrypt(plaintext, password) {
    if (!plaintext || !password) {
      throw new Error('Plaintext and password are required.');
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await _deriveKey(password, salt);
    const encoded = new TextEncoder().encode(plaintext);
    const cipherBuffer = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: iv
    }, key, encoded);
    return {
      iv: _arrayBufferToBase64(iv),
      salt: _arrayBufferToBase64(salt),
      ciphertext: _arrayBufferToBase64(cipherBuffer)
    };
  }

  async function decrypt(bundle, password) {
    if (!bundle || !password) {
      throw new Error('Bundle and password are required.');
    }
    const iv = new Uint8Array(_base64ToArrayBuffer(bundle.iv));
    const salt = new Uint8Array(_base64ToArrayBuffer(bundle.salt));
    const cipherBuffer = _base64ToArrayBuffer(bundle.ciphertext);
    const key = await _deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv: iv
    }, key, cipherBuffer);
    return new TextDecoder().decode(decrypted);
  }

  return { encrypt, decrypt };
})();
window.KeyEncryptor = KeyEncryptor;

// --- Module: AuthModule ---
const AuthModule = (function() {
  'use strict';

  const cfg = window.CONFIG;

  let cachedJfrKey = null;
  let jfrKeyPromise = null;

  function fetchEncryptedKey() {
    if (cachedJfrKey) {
      return Promise.resolve(cachedJfrKey);
    }

    if (jfrKeyPromise) {
      return jfrKeyPromise;
    }

    try {
      jfrKeyPromise = fetch(`${cfg.apiBase}${cfg.encryptedKeyEndpoint}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch encrypted key`);
          }
          return res.json();
        })
        .then(data => {
          if (!data.jfrKey) {
            throw new Error('Invalid response: missing jfrKey');
          }
          cachedJfrKey = data.jfrKey;
          jfrKeyPromise = null;
          return cachedJfrKey;
        })
        .catch(err => {
          if (DEBUG) {
            logger.error('Error fetching encrypted key:', err);
          }
          jfrKeyPromise = null;
          throw err;
        });
      return jfrKeyPromise;
    } catch (err) {
      if (DEBUG) {
        logger.error('Error fetching encrypted key:', err);
      }
      jfrKeyPromise = null;
      throw err;
    }
  }

  function clearCache() {
    cachedJfrKey = null;
    jfrKeyPromise = null;
  }

  async function unlockWithPassword(password) {
    try {
      const jfrKey = await fetchEncryptedKey();
      const decryptedKey = await KeyEncryptor.decrypt(jfrKey, password);
      return decryptedKey;
    } catch (err) {
      throw new Error(`Unlock failed: ${err.message}`);
    }
  }

  function hasStoredKey(storageKey) {
    try {
      return !!localStorage.getItem(storageKey);
    } catch (err) {
      if (DEBUG) {
        logger.error('Failed to check stored key', err);
      }
      return false;
    }
  }

  function getStoredKey(storageKey) {
    try {
      return localStorage.getItem(storageKey);
    } catch (err) {
      if (DEBUG) {
        logger.error('Failed to get stored key', err);
      }
      return null;
    }
  }

  function storeKey(storageKey, apiKey) {
    try {
      localStorage.setItem(storageKey, apiKey);
    } catch (err) {
      if (DEBUG) {
        logger.error('Failed to store key', err);
      }
    }
  }

  function removeKey(storageKey) {
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      if (DEBUG) {
        logger.error('Failed to remove key', err);
      }
    }
  }

  async function encrypt(plaintext, password) {
    try {
      return await KeyEncryptor.encrypt(plaintext, password);
    } catch (err) {
      throw new Error(`Encryption failed: ${err.message}`);
    }
  }

  async function decrypt(bundle, password) {
    try {
      return await KeyEncryptor.decrypt(bundle, password);
    } catch (err) {
      throw new Error(`Decryption failed: ${err.message}`);
    }
  }

  return {
    fetchEncryptedKey,
    unlockWithPassword,
    hasStoredKey,
    getStoredKey,
    storeKey,
    removeKey,
    clearCache,
    encrypt,
    decrypt,
    config: cfg
  };
})();
window.AuthModule = AuthModule;

// --- Module: Helper ---
const helper = (function() {
  'use strict';

  return {
    fmtSizes(bytes) {
      if (!bytes) {
        return '0 B';
      }
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    },

    fmtSize(bytes) {
      if (!bytes) {
        return '0 B';
      }
      const k = 1000;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      const value = bytes / Math.pow(k, i);
      return value.toFixed(1) + ' ' + sizes[i];
    },

    fmtDate(ts) {
      if (!ts) {
        return '—';
      }
      const d = new Date(ts);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    
    

    fmtDateTime(ts) {
      if (!ts) {
        return '—';
      }
      const d = new Date(ts);
      const pad = n => String(n).padStart(2, '0');
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    },
    
fmtDates(ts) {
  if (!ts) {
    return '—';
  }
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds());
},
    
    fmtDateHuman(ts) {
      if (!ts) {
        return '—';
      }
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'});
    },

    getDisplayName(pathname) {
      const fullName = pathname.split('/').pop();
      const lastDot = fullName.lastIndexOf('.');
      if (lastDot === -1) {
        return fullName;
      }
      const base = fullName.substring(0, lastDot);
      const ext = fullName.substring(lastDot);
      const parts = base.split('-');
      const lastPart = parts[parts.length - 1];
      if (parts.length > 1 && lastPart.length >= 20 && /^[A-Za-z0-9]+$/.test(lastPart)) {
        parts.pop();
        return parts.join('-') + ext;
      }
      return fullName;
    },

    getFileIcon(pathname) {
      const ext = pathname.split('.').pop().toLowerCase();
      const map = {
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image',
        'gif': 'fa-file-image',
        'webp': 'fa-file-image',
        'svg': 'fa-file-image',
        'bmp': 'fa-file-image',
        'ico': 'fa-file-image',
        'tiff': 'fa-file-image',
        'mp4': 'fa-file-video',
        'webm': 'fa-file-video',
        'ogg': 'fa-file-video',
        'avi': 'fa-file-video',
        'mov': 'fa-file-video',
        'mkv': 'fa-file-video',
        'flv': 'fa-file-video',
        'wmv': 'fa-file-video',
        'mp3': 'fa-file-audio',
        'wav': 'fa-file-audio',
        'flac': 'fa-file-audio',
        'aac': 'fa-file-audio',
        'ogg': 'fa-file-audio',
        'wma': 'fa-file-audio',
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'xls': 'fa-file-excel',
        'xlsx': 'fa-file-excel',
        'ppt': 'fa-file-powerpoint',
        'pptx': 'fa-file-powerpoint',
        'odt': 'fa-file-word',
        'ods': 'fa-file-excel',
        'odp': 'fa-file-powerpoint',
        'zip': 'fa-file-archive',
        'rar': 'fa-file-archive',
        '7z': 'fa-file-archive',
        'tar': 'fa-file-archive',
        'gz': 'fa-file-archive',
        'json': 'fa-file-code',
        'xml': 'fa-file-code',
        'csv': 'fa-file-csv',
        'txt': 'fa-file-lines',
        'md': 'fa-file-lines',
        'html': 'fa-file-code',
        'css': 'fa-file-code',
        'js': 'fa-file-code',
        'jsx': 'fa-file-code',
        'ts': 'fa-file-code',
        'tsx': 'fa-file-code',
        'vue': 'fa-file-code',
        'py': 'fa-file-code',
        'java': 'fa-file-code',
        'c': 'fa-file-code',
        'cpp': 'fa-file-code',
      };
      return map[ext] || 'fa-file';
    },

    sortBlobs(blobs, column, asc) {
      if (!blobs || blobs.length === 0) {
        return blobs;
      }
      const sorted = [...blobs];
      sorted.sort((a, b) => {
        let valA, valB;
        if (column === 'name') {
          valA = this.getDisplayName(a.pathname);
          valB = this.getDisplayName(b.pathname);
        } else if (column === 'size') {
          valA = a.size;
          valB = b.size;
        }
        if (typeof valA === 'string') {
          return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return asc ? valA - valB : valB - valA;
        }
      });
      return sorted;
    },

    filterBlobs(blobs, category, filterEnabled) {
      if (!blobs) {
        return [];
      }
      if (!filterEnabled) {
        return blobs;
      }
      return blobs.filter(blob => blob.pathname.startsWith(`uploads/${category}/`));
    },

    getPageItems(blobs, page, pageSize) {
      if (!blobs) {
        return { items: [], totalPages: 1 };
      }
      const totalPages = Math.ceil(blobs.length / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        items: blobs.slice(start, end),
        totalPages,
      };
    },

    pad(n, len = 2) {
      return String(n).padStart(len, '0');
    }
  };
})();
window.helper = helper;

const fileExist = (function() {
  'use strict';
  
  function getDateSuffix(timestamp) {
    const d = new Date(timestamp);
    const pad = n => String(n).padStart(2, '0');
    
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  }
  
  function check(date, blobs) {
    if (!date || !blobs || !Array.isArray(blobs)) {
      return false;
    }
    
    const dateSuffix = getDateSuffix(date);
    const duplicate = blobs.find(b => b.pathname.includes(`_${dateSuffix}.`));
    
    return !!duplicate;
  }
  
  return check;
})();
window.fileExist = fileExist;

// --- Module: UI (Renamed from Templates. Holds all HTML strings) ---
const ui = (function() {
  'use strict';
  const h = window.helper;

  function loadingSpinner() {
    return '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Loading…';
  }

  function errorMessage(message) {
    return `<div class="custom-select-option disabled">${message}</div>`;
  }

  function emptyTable(colspan = 4, message = 'No files') {
    return `<tr><td colspan="${colspan}" class="text-center text-red-400 py-2">${message}</td></tr>`;
  }

  function fileTable(blobs, sortColumn, sortAsc) {
    if (!blobs || blobs.length === 0) {
      return emptyTable(6);
    }

    return blobs.map(blob => {
      const displayName = h.getDisplayName(blob.pathname);
      const icon = h.getFileIcon(blob.pathname);

      return `<tr>
        <td class="text-center"><input type="checkbox" class="row-selector" data-pathname="${blob.pathname}" data-url="${blob.url}" /></td>
        <td style="width: 150px; max-width: 150px; min-width: 150px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" title="${displayName}">
          <span class="fa-regular ${icon} text-cyan-300 text-[10px]" style="display:inline-block;width:1.2em;text-align:center;margin-right:0.25rem;"></span>
          <span style="display:inline;">${displayName}</span>
        </td>
        <td class="text-center">${h.fmtSize(blob.size)}</td>
        <td class="col-action"><button class="action-btn text-cyan-300 hover:text-cyan-200" title="View file"><i class="fa-regular fa-eye"></i></button></td>
        <td class="col-action"><button class="action-btn text-green-300 hover:text-green-200" title="Download file"><i class="fa-solid fa-download"></i></button></td>
        <td class="col-action"><button class="action-btn delete text-red-300 hover:text-red-200" title="Delete file"><i class="fa-regular fa-trash-can"></i></button></td>
      </tr>`;
    }).join('');
  }

  function dropdown(blobs, currentUrl) {
    if (!blobs || blobs.length === 0) {
      return '<div class="custom-select-option disabled">No files</div>';
    }

    return blobs.map(blob => {
      const displayName = h.getDisplayName(blob.pathname);
      const icon = h.getFileIcon(blob.pathname);
      const selected = blob.url === currentUrl ? ' selected' : '';

      return `<div class="custom-select-option flex items-center gap-1${selected}" data-value="${blob.url}" data-pathname="${blob.pathname}">
        <span class="fa-regular ${icon} text-cyan-300 text-[10px] flex-shrink-0"></span>
        <span class="truncate" title="${displayName}">${displayName}</span>
      </div>`;
    }).join('');
  }

  function pagination(currentPage, totalPages, pageSize) {
    return `<div class="flex items-center gap-2 text-[10px] text-cyan-300">
      <button class="page-prev bg-transparent border border-cyan-400/30 rounded px-2 py-0.5 hover:bg-cyan-400/10 disabled:opacity-40" ${currentPage <= 1 ? 'disabled' : ''}>Prev</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <button class="page-next bg-transparent border border-cyan-400/30 rounded px-2 py-0.5 hover:bg-cyan-400/10 disabled:opacity-40" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
      <select class="page-size bg-transparent border border-cyan-400/30 rounded px-1 py-0.5 text-cyan-200">
        <option value="10">10</option>
        <option value="20" ${pageSize === 20 ? 'selected' : ''}>20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>`;
  }

  function configTable(keys, config) {
    let html = `<table class="w-full border-collapse text-[10px]">
      <thead>
        <tr class="text-left border-b border-white/10">
          <th class="p-1 text-cyan-200 font-semibold">Key</th>
          <th class="p-1 text-cyan-200 font-semibold">Value</th>
          <th class="p-1 text-cyan-200 font-semibold">Action</th>
        </tr>
      </thead>
      <tbody>`;

    keys.forEach(key => {
      const value = config.get(key);
      const inputType = typeof value === 'boolean' ? 'checkbox' : 'text';
      const checked = inputType === 'checkbox' && value ? 'checked' : '';
      const displayValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
      html += `<tr class="border-b border-white/5 hover:bg-white/5">
          <td class="p-1 font-mono text-cyan-300">${key}</td>
          <td class="p-1">
            <input type="${inputType}" class="config-input bg-transparent border border-cyan-500/30 rounded px-1 py-0.5 text-cyan-200 w-full font-mono focus:outline-none focus:border-cyan-400" data-key="${key}" value="${inputType === 'checkbox' ? 'true' : displayValue}" ${checked} />
          </td>
          <td class="p-1">
            <button class="config-save-btn text-green-400 hover:text-green-300 text-[9px] bg-transparent border border-green-400/30 rounded px-1.5 py-0.5 transition-all flex items-center gap-1" data-key="${key}">
              <i class="fa-regular fa-floppy-disk"></i>
            </button>
          </td>
        </tr>`;
    });

    html += `</tbody></table>
      <div class="mt-3 flex gap-2">
        <button id="config-reset-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-[9px] border border-cyan-600/30 transition-colors">Reset to Defaults</button>
        <span id="config-status" class="text-[9px] text-cyan-300 self-center hidden"></span>
      </div>`;

    return html;
  }

  return { loadingSpinner, errorMessage, emptyTable, fileTable, dropdown, pagination, configTable };
})();
window.ui = ui;

// --- Module: jsonBlobUploader ---
const jsonBlobUploader = (function() {
  'use strict';
  
  const cfg = window.CONFIG;
  
  let _apiBase = cfg.apiBase;
  let _blobdbEndpoint = cfg.blobdbEndpoint;
  let _uploadCategory = cfg.defaultCategory || 'others';
  let _apiSecretKey = null;
  let _storageKey = null;
  let _workerUrl = null;
  
  let _smoothedSpeed = 0;
  const _smoothingFactor = cfg.smoothingFactor || 0.3;
  
  function _getApiKey() {
    if (_apiSecretKey) return _apiSecretKey;
    if (_storageKey) {
      const stored = AuthModule.getStoredKey(_storageKey);
      if (stored) {
        _apiSecretKey = stored;
        return stored;
      }
    }
    return null;
  }
  
  function _uploadSingleFile(formData, category, dt, onProgress) {
    return new Promise((resolve, reject) => {
      const timestamp = formData.get('lastModified') || Date.now();
      formData.set('lastModified', timestamp);
      // FIXED: Only one declaration, and dt is appended
      const queryUrl = `${_apiBase}${_blobdbEndpoint}?category=${encodeURIComponent(category)}&lastModified=${timestamp}&date=${dt}`;
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', queryUrl, true);
      const authKey = _getApiKey();
      if (authKey) xhr.setRequestHeader('Authorization', 'Bearer ' + authKey);
      
      let lastLoaded = 0;
      let lastTime = Date.now();
      
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000;
          const bytesDiff = e.loaded - lastLoaded;
          let speedMbps = 0;
          if (timeDiff > 0 && bytesDiff > 0) {
            const instantMbps = (bytesDiff * 8) / (timeDiff * 1_000_000);
            _smoothedSpeed = _smoothedSpeed * (1 - _smoothingFactor) + instantMbps * _smoothingFactor;
            speedMbps = _smoothedSpeed;
          }
          lastLoaded = e.loaded;
          lastTime = now;
          if (typeof onProgress === 'function') onProgress(percent, speedMbps);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error('Invalid response')); }
        } else {
          reject(new Error('HTTP ' + xhr.status + ' ' + xhr.statusText));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Timeout'));
      xhr.timeout = 0;
      xhr.send(formData);
    });
  }
  
function _findUrlByPathname(pathname) {
    const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const url = `${_apiBase}${_blobdbEndpoint}?_=${Date.now()}`;
    const authKey = _getApiKey();
    const headers = {};
    if (authKey) {
      headers['Authorization'] = 'Bearer ' + authKey;
    }
    try {
      return fetch(url, { headers })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          const blobs = data.blobs || [];
          const blob = blobs.find(b => b.pathname === cleanPath || b.pathname === '/' + cleanPath);
          if (!blob) {
            throw new Error(`Blob with pathname "${pathname}" not found`);
          }
          return blob.url;
        });
    } catch (err) {
      if (DEBUG) {
        logger.error('Failed to find URL by pathname', err);
      }
      throw err;
    }
  }

  function _fetchJson(url) {
    try {
      return fetch(url).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      });
    } catch (err) {
      if (DEBUG) {
        logger.error('Failed to fetch JSON', err);
      }
      throw err;
    }
  }

  function configure(options) {
    if (!options || typeof options !== 'object') {
      return;
    }
    if (typeof options.apiBase === 'string' && options.apiBase.length > 0) {
      _apiBase = options.apiBase.replace(/\/+$/, '');
    }
    if (typeof options.blobdbEndpoint === 'string' && options.blobdbEndpoint.length > 0) {
      _blobdbEndpoint = options.blobdbEndpoint;
    }
    if (typeof options.uploadCategory === 'string' && options.uploadCategory.length > 0) {
      _uploadCategory = options.uploadCategory;
    }
    if (typeof options.apiSecretKey === 'string') {
      _apiSecretKey = options.apiSecretKey;
    }
    if (typeof options.storageKey === 'string' && options.storageKey.length > 0) {
      _storageKey = options.storageKey;
      if (!_apiSecretKey) {
        _apiSecretKey = AuthModule.getStoredKey(_storageKey) || null;
      }
    }
  }
  
  
  function uploadFile(file, onProgress, category, dt, extraFields) {
    if (!file) return Promise.reject(new Error('File is required'));
    
    const duplicate = window.fileExist(file.lastModified, window.app.cachedBlobs);
    if (duplicate) return Promise.reject(new Error('Duplicate file detected.'));
    
    _smoothedSpeed = 0;
    const cat = category || _uploadCategory;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('lastModified', file.lastModified || Date.now());
    if (extraFields && typeof extraFields === 'object') {
      Object.entries(extraFields).forEach(([key, value]) => formData.append(key, value));
    }
    return _uploadSingleFile(formData, cat, dt, onProgress);
  }
  
  function uploadFileWorking(file, onProgress, category, dt, extraFields) {
    if (!file) return Promise.reject(new Error('File is required'));
    _smoothedSpeed = 0;
    const cat = category || _uploadCategory;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('lastModified', file.lastModified || Date.now());
    if (extraFields && typeof extraFields === 'object') {
      Object.entries(extraFields).forEach(([key, value]) => formData.append(key, value));
    }
    return _uploadSingleFile(formData, cat, dt, onProgress);
  }
  
  function uploadFileA(file, onProgress, category, dt, extraFields) {
    if (!file) return Promise.reject(new Error('File is required'));
    _smoothedSpeed = 0;
    const cat = category || _uploadCategory;
    
    const lastModified = file.lastModified || Date.now();
    const dotIndex = file.name.lastIndexOf('.');
    const baseName = dotIndex > -1 ? file.name.substring(0, dotIndex) : file.name;
    const extension = dotIndex > -1 ? file.name.substring(dotIndex) : '';
    const dateObj = new Date(lastModified);
    const dateSuffix = `${dateObj.getUTCFullYear()}${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}${String(dateObj.getUTCDate()).padStart(2, '0')}`;
    const finalFileName = `${baseName}_${dateSuffix}${extension}`;
    const renamedFile = new File([file], finalFileName, { type: file.type, lastModified: lastModified });
    
    const formData = new FormData();
    formData.append('image', renamedFile);
    formData.append('lastModified', lastModified);
    if (extraFields && typeof extraFields === 'object') {
      Object.entries(extraFields).forEach(([key, value]) => formData.append(key, value));
    }
    return _uploadSingleFile(formData, cat, dt, onProgress);
  }
  
  function uploadFileChunked(file, onProgress, category, dt, extraFields, chunkSize) {
    if (!file) return Promise.reject(new Error('File is required'));
    const cat = category || _uploadCategory;
    chunkSize = chunkSize || 4 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileName = file.name;
    const lastModified = file.lastModified || Date.now();
    
    async function uploadNextChunk(chunkIndex) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('fileId', fileId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', fileName);
      formData.append('category', cat);
      formData.append('lastModified', lastModified);
      
      if (extraFields && typeof extraFields === 'object') {
        Object.entries(extraFields).forEach(([key, value]) => formData.append(key, value));
      }
      
      const result = await _uploadSingleFile(formData, cat, dt, (chunkPercent, speedMbps) => {
        if (onProgress) {
          const overall = ((chunkIndex + chunkPercent / 100) / totalChunks) * 100;
          onProgress(Math.round(overall), speedMbps);
        }
      });
      return result;
    }
    
    const executeChunks = async () => {
      let finalResult;
      _smoothedSpeed = 0;
      for (const i of Array(totalChunks).keys()) {
        finalResult = await uploadNextChunk(i);
      }
      return finalResult;
    };
    return executeChunks();
  }
  
  function uploadFileAdaptive(file, onProgress, category, dt, extraFields, threshold, chunkSize) {
    if (!file) return Promise.reject(new Error('File is required'));
    threshold = threshold || cfg.uploadThreshold || 4 * 1024 * 1024;
    if (file.size > threshold) {
      return this.uploadFileChunked(file, onProgress, category, dt, extraFields, chunkSize);
    } else {
      return this.uploadFile(file, onProgress, category, dt, extraFields);
    }
  }
  
  // [createDirectUploadRequest unchanged]
  
  function uploadFileDirectly(file, onProgress, category, dt, extraFields) {
    if (!file) return Promise.reject(new Error('File is required'));
    const cat = category || _uploadCategory;
    const authKey = _getApiKey();
    if (!authKey) return Promise.reject(new Error('API key not available. Please unlock first.'));
    
    const base = _apiBase.replace(/\/+$/, '');
    const presignUrl = base + _blobdbEndpoint + '?action=presign&date=' + dt;
    
    const formData = new FormData();
    formData.append('filename', file.name);
    formData.append('category', cat);
    formData.append('lastModified', file.lastModified || Date.now());
    
    try {
      return fetch(presignUrl, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + authKey },
          body: formData,
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errData => { throw new Error(errData.error || 'Failed to get upload URL'); });
          }
          return response.json();
        })
        .then(({ presignedUrl }) => {
          const uploadRequest = createDirectUploadRequest(file, presignedUrl, onProgress);
          const promise = uploadRequest;
          promise.abort = uploadRequest.abort || (() => {});
          return promise;
        });
    } catch (err) {
      if (DEBUG) logger.error('Failed to upload file directly', err);
      throw err;
    }
  }
  
  function uploadFileSmart(file, onProgress, category, dt, extraFields, threshold) {
    if (!file) return Promise.reject(new Error('File is required'));
    threshold = threshold || cfg.uploadThreshold || 4 * 1024 * 1024;
    if (file.size <= threshold) {
      return this.uploadFile(file, onProgress, category, dt, extraFields);
    }
    return this.uploadFileDirectly(file, onProgress, category, dt, extraFields);
  }
  
  function uploadJson(data, filename, onProgress, category, dt) {
    if (data === undefined || data === null) return Promise.reject(new Error('Data is required'));
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const file = new File([jsonString], filename || 'data.json', {
      type: 'application/json',
      lastModified: Date.now()
    });
    return uploadFile(file, onProgress, category || 'json', dt);
  }
  
function readJson(input) {
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return _fetchJson(input);
    }
    return _findUrlByPathname(input).then(url => _fetchJson(url));
  }
  if (input && typeof input === 'object' && input.url) {
    return _fetchJson(input.url);
  }
  return Promise.reject(new Error('A URL, pathname, or blob object with url is required'));
}

function imageLoaded(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (event) => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    image.src = url;
  });
}

function readJsonInWorker(input) {
  if (!_workerUrl) {
    const workerCode = `
        self.onmessage = async function(e) {
          const url = e.data.url;
          if (!url) {
            self.postMessage({ error: 'No URL provided' });
            return;
          }
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('HTTP ' + response.status);
            }
            const data = await response.json();
            self.postMessage({ data });
          } catch (err) {
            self.postMessage({ error: err.message });
          }
        };
      `;
    const blob = new Blob([workerCode], {
      type: 'application/javascript'
    });
    _workerUrl = URL.createObjectURL(blob);
  }
  
  return new Promise((resolve, reject) => {
    const worker = new Worker(_workerUrl);
    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.data);
      }
      worker.terminate();
    };
    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
    
    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        worker.postMessage({ url: input });
      } else {
        _findUrlByPathname(input)
          .then(url => worker.postMessage({ url }))
          .catch(err => {
            reject(err);
            worker.terminate();
          });
      }
    } else if (input && typeof input === 'object' && input.url) {
      worker.postMessage({ url: input.url });
    } else {
      reject(new Error('A URL, pathname, or blob object with url is required'));
      worker.terminate();
    }
  });
}

function listBlobs() {
  const url = `${_apiBase}${_blobdbEndpoint}?_=${Date.now()}`;
  const authKey = _getApiKey();
  const headers = {};
  if (authKey) {
    headers['Authorization'] = 'Bearer ' + authKey;
  }
  try {
    return fetch(url, { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => data.blobs || []);
  } catch (err) {
    if (DEBUG) {
      logger.error('Failed to list blobs', err);
    }
    throw err;
  }
}

function deleteBlob(pathname) {
  if (!pathname) {
    return Promise.reject(new Error('Pathname is required'));
  }
  const authKey = _getApiKey();
  if (!authKey) {
    return Promise.reject(new Error('API key not available'));
  }
  const url = `${_apiBase}${_blobdbEndpoint}?pathname=${encodeURIComponent(pathname)}`;
  try {
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + authKey
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    });
  } catch (err) {
    if (DEBUG) {
      logger.error('Failed to delete blob', err);
    }
    throw err;
  }
}
  
  return {
    configure,
uploadFile,
uploadFileChunked,
uploadFileAdaptive,
uploadFileDirectly,
uploadFileSmart,
uploadJson,
readJson,
imageLoaded,
readJsonInWorker,
listBlobs,
deleteBlob,
getApiBase: () => _apiBase,
  getUploadCategory: () => _uploadCategory,
  getApiKey: _getApiKey
  };
})();
window.jsonBlobUploader = jsonBlobUploader;



// --- Module: App (The Main Controller. Renamed from UI) ---
const app = (function() {
  'use strict';

  const d = window.dom;
  const ui = window.ui;

  // Modal helpers (now fully private to app module)
  function closeTestModal() {
    const el = d.testModal;
    el.classList.add('hidden', 'opacity-0');
    el.classList.remove('flex', 'opacity-100');
    const box = el.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-100', 'translate-y-0');
      box.classList.add('scale-95', 'translate-y-2');
    }
  }

  function showTestModal(message, isSuccess) {
    isSuccess = isSuccess !== undefined ? isSuccess : true;
    const el = d.testModal;
    const icon = d.testModalIcon.querySelector('i');
    const msgEl = d.testModalMessage;
    msgEl.textContent = message;
    icon.className = isSuccess ? 'fa-regular fa-circle-check' : 'fa-solid fa-triangle-exclamation';
    d.testModalIcon.style.color = isSuccess ? '#34d399' : '#f87171';
    el.classList.remove('hidden', 'opacity-0');
    el.classList.add('flex', 'opacity-100');
    const box = el.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-95', 'translate-y-2');
      box.classList.add('scale-100', 'translate-y-0');
    }
    d.testModalOkBtn.onclick = closeTestModal;
    el.onclick = function(e) {
      if (e.target === el) {
        closeTestModal();
      }
    };
  }

  function closeAlert() {
    const el = d.alertEl;
    el.classList.add('hidden', 'opacity-0');
    el.classList.remove('flex', 'opacity-100');
    const box = el.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-100', 'translate-y-0');
      box.classList.add('scale-95', 'translate-y-2');
    }
  }

  function closeConfirm() {
    const el = d.confirmEl;
    el.classList.add('hidden', 'opacity-0');
    el.classList.remove('flex', 'opacity-100');
    const box = el.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-100', 'translate-y-0');
      box.classList.add('scale-95', 'translate-y-2');
    }
  }

  function showAlert(msg, cb) {
    d.alertMessage.textContent = msg;
    const el = d.alertEl;
    el.classList.remove('hidden', 'opacity-0');
    el.classList.add('flex', 'opacity-100');
    const box = el.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-95', 'translate-y-2');
      box.classList.add('scale-100', 'translate-y-0');
    }
    d.alertOkBtn.onclick = function() {
      closeAlert();
      if (cb) {
        cb();
      }
    };
    el.onclick = function(e) {
      if (e.target === el) {
        closeAlert();
        if (cb) {
          cb();
        }
      }
    };
  }

  function showConfirm(msg, onConfirm, onCancel) {
    d.confirmMessage.textContent = msg;
    const el = d.confirmEl;
    el.classList.remove('hidden', 'opacity-0');
    el.classList.add('flex', 'opacity-100');
    const box = el.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-95', 'translate-y-2');
      box.classList.add('scale-100', 'translate-y-0');
    }
    d.confirmCancelBtn.onclick = function() {
      closeConfirm();
      if (onCancel) {
        onCancel();
      }
    };
    d.confirmOkBtn.onclick = function() {
      closeConfirm();
      if (onConfirm) {
        onConfirm();
      }
    };
    el.onclick = function(e) {
      if (e.target === el) {
        closeConfirm();
        if (onCancel) {
          onCancel();
        }
      }
    };
  }

  // Main App Object
  const app_api = {
    uploader: null,
    selectedFiles: [],
    sortColumn: 'name',
    sortAsc: true,
    cachedBlobs: null,
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
    currentUploadAbort: null,

    // Expose modal helpers as app methods
    showAlert: showAlert,
    showConfirm: showConfirm,
    closeAlert: closeAlert,
    closeConfirm: closeConfirm,

    get filterEnabled() {
      return window.CONFIG.filterEnabled;
    },

    get selectedFile() {
      return this.selectedFiles[0] || null;
    },
    set selectedFile(file) {
      this.selectedFiles = file ? [file] : [];
    },

    get d() {
      return window.dom;
    },

    closePreviewModal() {
      d.previewModal.classList.add('hidden');
      d.preview.classList.add('hidden');
      d.previewLoader.classList.remove('hidden');
      d.imagePreview.src = '';
      d.imagePreview.alt = '';
      d.downloadPreview.removeAttribute('data-download');
      d.previewName.textContent = '';
      d.previewSize.textContent = '';
      d.previewDate.textContent = '';
      d.closePreview.disabled = true;
    },

    showUnlockModal() {
      const d = this.d;
      d.unlockModal.classList.remove('hidden');
      d.unlockPassword.focus();
    },

    hideUnlockModal() {
      const d = this.d;
      d.unlockModal.classList.add('hidden');
      d.unlockError.classList.add('hidden');
      d.unlockPassword.value = '';
    },
    
    async handleUnlock(password) {
  const d = this.d;
  const unlockBtn = d.unlockBtn;
  const unlockError = d.unlockError;
  const unlockErrorMsg = d.unlockErrorMsg;
  unlockBtn.disabled = true;
  unlockBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Unlocking...';
  unlockError.classList.add('hidden');
  try {
    const apiKey = await AuthModule.unlockWithPassword(password);
    AuthModule.storeKey(AuthModule.config.storageKey, apiKey);
    const uploader = jsonBlobUploader;
    uploader.configure({
      apiSecretKey: apiKey,
      storageKey: AuthModule.config.storageKey
    });
    this.uploader = uploader;
    this.hideUnlockModal();
    window.dispatchEvent(new CustomEvent('auth:ready', { detail: { uploader } }));
  } catch (err) {
    unlockErrorMsg.textContent = err.message || 'Invalid password';
    unlockError.classList.remove('hidden');
    d.unlockPassword.select();
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.innerHTML = '<i class="fa-solid fa-key"></i> Unlock';
  }
},


    lockApp() {
      AuthModule.removeKey(AuthModule.config.storageKey);
      if (this.uploader) {
        // this.uploader.configure({apiSecretKey: null});
        this.cachedBlobs = null;
        this.selectedFiles = [];
        this.clearSelection();
        this.populateTable([]);
        this.renderDropdown([]);
        if (d.paginationContainer) {
          d.paginationContainer.innerHTML = '';
        }
        this.uploader = null;
      }
      this.showUnlockModal();
    },

    getFilteredBlobs() {
      const category = d.uploadCategoryInput.value.trim() || window.CONFIG.defaultCategory;
      return helper.filterBlobs(this.cachedBlobs, category, this.filterEnabled);
    },

    getCurrentPageItems() {
      const filtered = this.getFilteredBlobs();
      const result = helper.getPageItems(filtered, this.currentPage, this.pageSize);
      this.totalPages = result.totalPages;
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      return result.items;
    },

    async populateFileSelect() {
      const d = this.d;
      if (!this.uploader) {
        return;
      }
      const valueSpan = d.customSelectValue;
      const optionsContainer = d.customSelectOptions;
      valueSpan.innerHTML = ui.loadingSpinner();
      d.refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[8px]"></i>';
      d.fileSelect.classList.add('disabled');
      optionsContainer.innerHTML = ui.errorMessage('Loading files…');
      try {
        const blobs = await this.uploader.listBlobs();
        this.cachedBlobs = blobs;
        if (d.conn) {
          d.conn.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
        }
        this.currentPage = 1;
        const filtered = this.getFilteredBlobs();
        const pageItems = this.getCurrentPageItems();
        this.renderDropdown(pageItems);
        if (filtered.length === 0) {
          valueSpan.textContent = 'No files';
        } else if (!d.fileSelect.dataset.value) {
          valueSpan.textContent = 'Select File';
        }
        d.fileSelect.classList.remove('disabled');
        this.populateTable(pageItems);
        d.refreshBtn.innerHTML = '<i class="fa-solid fa-rotate text-[8px]"></i>';
        this.renderPagination();
      } catch (err) {
        if (DEBUG) {
          logger.error('Failed to load file list:', err);
        }
        if (d.conn) {
          d.conn.className = 'w-1.5 h-1.5 rounded-full bg-red-800 animate-pulse';
        }
        valueSpan.textContent = '❌ Error';
        optionsContainer.innerHTML = ui.errorMessage(err.message);
        d.fileSelect.classList.remove('disabled');
        if (d.fileTableBody) {
          d.fileTableBody.innerHTML = ui.emptyTable(4, err.message);
        }
        if (d.paginationContainer) {
          d.paginationContainer.innerHTML = '';
        }
      }
    },

    refreshTableAndDropdown() {
      const pageItems = this.getCurrentPageItems();
      this.renderDropdown(pageItems);
      this.populateTable(pageItems);
      this.renderPagination();
    },

    renderDropdown(blobs) {
      const d = this.d;
      const optionsContainer = d.customSelectOptions;
      const currentUrl = d.fileSelect.dataset.value;
      optionsContainer.innerHTML = ui.dropdown(blobs, currentUrl);

      optionsContainer.querySelectorAll('.custom-select-option').forEach(option => {
        option.addEventListener('click', () => {
          d.customSelectValue.textContent = option.querySelector('.truncate').textContent;
          d.fileSelect.dataset.value = option.dataset.value;
          d.fileSelect.classList.remove('open');
          optionsContainer.classList.add('hidden');
          d.fileSelect.dispatchEvent(new CustomEvent('change'));
        });
      });
    },

    populateTable(blobs) {
      const d = this.d;
      const tbody = d.fileTableBody;
      const emptyMsg = d.fileTableEmpty;
      if (!tbody) {
        return;
      }
      if (!blobs || blobs.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) {
          emptyMsg.style.display = 'block';
        }
        return;
      }
      if (emptyMsg) {
        emptyMsg.style.display = 'none';
      }
      const sorted = helper.sortBlobs(blobs, this.sortColumn, this.sortAsc);
      tbody.innerHTML = ui.fileTable(sorted, this.sortColumn, this.sortAsc);

      tbody.querySelectorAll('.row-selector').forEach(cb => {
        cb.addEventListener('change', () => {
          if (d.selectAllRows) {
            const all = tbody.querySelectorAll('.row-selector:checked');
            d.selectAllRows.checked = all.length === tbody.querySelectorAll('.row-selector').length;
          }
        });
      });
      tbody.querySelectorAll('.action-btn.text-cyan-300').forEach(btn => {
        btn.addEventListener('click', () => this.loadFile(blobs[Array.prototype.indexOf.call(tbody.rows, btn.closest('tr'))]));
      });
      tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = btn.closest('tr');
          const index = Array.prototype.indexOf.call(tbody.rows, row);
          const blob = sorted[index];
          this.deleteBlob(blob.pathname, blob.url);
        });
      });

      this.updateSortIndicators();
      if (d.selectAllRows) {
        d.selectAllRows.checked = false;
      }
    },

    renderPagination() {
      const container = d.paginationContainer;
      if (!container) {
        return;
      }
      const total = this.totalPages || 1;
      const current = this.currentPage;
      container.innerHTML = ui.pagination(current, total, this.pageSize);

      container.querySelector('.page-prev').addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.refreshTableAndDropdown();
        }
      });
      container.querySelector('.page-next').addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.refreshTableAndDropdown();
        }
      });
      container.querySelector('.page-size').addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value, 10);
        this.currentPage = 1;
        this.refreshTableAndDropdown();
      });
    },

    populateConfig() {
      const container = d.configContainer;
      if (!container) {
        return;
      }
      const config = window.CONFIG;
      const keys = config.keys();
      container.innerHTML = ui.configTable(keys, config);

      container.querySelectorAll('.config-save-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.key;
          const input = container.querySelector(`.config-input[data-key="${key}"]`);
          let value;
          if (input.type === 'checkbox') {
            value = input.checked;
          } else {
            const raw = input.value.trim();
            if (raw === 'true') {
              value = true;
            } else if (raw === 'false') {
              value = false;
            } else if (!isNaN(raw) && raw !== '') {
              value = Number(raw);
            } else {
              value = raw;
            }
          }
          const originalHtml = btn.innerHTML;
          btn.disabled = true;
          btn.classList.add('opacity-60', 'cursor-wait');
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
          window.CONFIG.set(key, value);
          this.showConfigStatus(`✅ ${key} updated`);
          setTimeout(() => {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-wait');
            btn.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
            setTimeout(() => {
              btn.innerHTML = originalHtml;
            }, 1500);
          }, 300);
        });
      });
      const resetBtn = container.querySelector('#config-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.CONFIG.reset();
          this.showConfigStatus('✅ Reset to defaults');
          this.populateConfig();
        });
      }
    },

    async loadFile(blob) {
      const d = this.d;
      if (!blob) {
        return;
      }
      const codeTab = d.tabCode;
      if (codeTab) {
        codeTab.click();
      }
      const isImage = /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(blob.url);
      if (isImage) {
        d.previewModal.classList.remove('hidden');
        try {
          const image = await this.uploader.imageLoaded(blob.url);
          d.imagePreview.src = image.src;
          d.imagePreview.alt = helper.getDisplayName(blob.url);
          d.previewName.textContent = helper.getDisplayName(blob.url);
          d.previewSize.textContent = helper.fmtSizes(blob.size);
          //d.previewDate.textContent = helper.fmtDates(blob.lastModified);
          d.previewDate.textContent = helper.fmtDateHuman(blob.lastModified);
          d.downloadPreview.setAttribute('data-download', blob.downloadUrl);
          d.previewLoader.classList.add('hidden');
          d.preview.classList.remove('hidden');
          d.closePreview.disabled = false;
        } catch (err) {
          if (DEBUG) {
            logger.error('Image failed to load:', err);
          }
          d.previewModal.classList.remove('hidden');
        }
        return;
      }
      d.jsonPre.classList.add('hidden');
      d.jsonLoader.classList.remove('hidden');
      d.previewModal.classList.add('hidden');
      try {
        const data = await this.uploader.readJsonInWorker(blob.url);
        d.jsonPre.textContent = JSON.stringify(Object.keys(data), null, 2);
        d.jsonPre.classList.remove('hidden');
        d.jsonLoader.classList.add('hidden');
        d.customSelectValue.textContent = helper.getDisplayName(blob.url);
        d.fileSelect.dataset.value = blob.url;
      } catch (err) {
        if (DEBUG) {
          logger.error('Failed to load file:', err);
        }
        d.jsonLoader.classList.add('hidden');
        d.jsonPre.classList.remove('hidden');
        d.jsonPre.textContent = 'Error loading file: ' + err.message;
      }
    },

    async loadFiles(url) {
      const d = this.d;
      if (!url) {
        return;
      }
      const codeTab = d.tabCode;
      if (codeTab) {
        codeTab.click();
      }
      d.jsonPre.classList.add('hidden');
      d.jsonLoader.classList.remove('hidden');
      try {
        const data = await this.uploader.readJsonInWorker(url);
        d.jsonPre.textContent = JSON.stringify(Object.keys(data), null, 2);
        d.jsonPre.classList.remove('hidden');
        d.jsonLoader.classList.add('hidden');
        d.customSelectValue.textContent = helper.getDisplayName(url);
        d.fileSelect.dataset.value = url;
      } catch (err) {
        if (DEBUG) {
          logger.error('Failed to load file:', err);
        }
        d.jsonLoader.classList.add('hidden');
        d.jsonPre.classList.remove('hidden');
        d.jsonPre.textContent = 'Error loading file: ' + err.message;
      }
    },

    async copyJsonContent() {
      const d = this.d;
      const text = d.jsonPre.textContent.trim();
      if (!text) {
        showAlert('Nothing to copy');
        return;
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          showAlert('✅ Copied to clipboard');
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showAlert('✅ Copied to clipboard');
        }
      } catch (err) {
        if (DEBUG) {
          logger.error('Copy failed:', err);
        }
        showAlert('❌ Copy failed: ' + err.message);
      }
    },

    downloadJsonFile() {
      const d = this.d;
      const text = d.jsonPre.textContent.trim();
      if (!text) {
        showAlert('Nothing to download');
        return;
      }
      try {
        JSON.parse(text);
      } catch (e) {
        if (DEBUG) {
          logger.warn('Content is not valid JSON, downloading as text.');
        }
      }
      let filename = 'blobList.json';
      const blob = new Blob([text], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    async uploadJsonContent(dt) {
      const d = this.d;
      const text = d.jsonPre.textContent.trim();
      if (!text) {
        showAlert('Nothing to upload');
        return;
      }
      try {
        JSON.parse(text);
      } catch (e) {
        showAlert('❌ Invalid JSON content');
        return;
      }
      if (!this.uploader) {
        showAlert('Uploader not initialised. Unlock first.');
        return;
      }
      d.codeUpload.disabled = true;
      d.codeUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Upload';
      try {
        const result = await this.uploader.uploadJson(text, 'blobList.json', null, 'json/others', dt);
        if (DEBUG) {
          logger.log('Upload result:', result);
        }
        showAlert('✅ JSON uploaded successfully');
      } catch (err) {
        if (DEBUG) {
          logger.error('Upload failed:', err);
        }
        showAlert('❌ Upload failed: ' + err.message);
      } finally {
        d.codeUpload.disabled = false;
        d.codeUpload.innerHTML = '<i class="fa-solid fa-upload"></i> Upload';
      }
    },

    updateFileDisplay(file) {
      const d = this.d;
      if (this.selectedFiles.length > 1) {
        d.fileName.textContent = `${this.selectedFiles.length} files selected`;
        const totalSize = this.selectedFiles.reduce((sum, f) => sum + f.size, 0);
        d.fileSize.textContent = `Total: ${helper.fmtSize(totalSize)}`;
        d.fileType.textContent = '';
        d.fileDate.textContent = '';
        return;
      }
      if (!file) {
        d.fileName.textContent = 'Original file name';
        d.fileSize.textContent = 'File size';
        d.fileType.textContent = 'file type';
        d.fileDate.textContent = 'last modified date';
        return;
      }
      d.fileName.textContent = file.name;
      d.fileType.textContent = file.type || 'unknown type';
      d.fileSize.textContent = helper.fmtSize(file.size);
      d.fileDate.textContent = helper.fmtDate(file.lastModified);
      const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
      if (isJson) {
        const prefix = d.filePrefix.value.replace(/_[0-9]{8}\.json$/, '');
        d.filePrefix.value = prefix + '_' + helper.fmtDates(file.lastModified) + '.json';
      }
    },

    clearSelection() {
      this.selectedFiles = [];
      const d = this.d;
      d.fileInput.value = '';
      this.updateFileDisplay(null);
      d.uploadBtn.disabled = true;
      d.uploadProgress.classList.add('hidden');
      d.progressBar.style.width = '0%';
      d.progressText.textContent = '0%';
      d.speedText.textContent = '0';
      d.currentFileCount.textContent = '0';
      d.totalFileCount.textContent = '0';
      d.cancelUploadBtn.classList.add('hidden');
    },

    setProgress(percent) {
      const d = this.d;
      d.uploadProgress.classList.remove('hidden');
      d.progressBar.style.width = percent + '%';
      d.progressText.textContent = percent + '%';
      d.cancelUploadBtn.classList.remove('hidden');
    },

    async uploadFiles(files, onProgress, categories, dtt) {
      if (!files || !files.length) {
        return {
          success: 0,
          total: 0,
          failed: []
        };
      }
      const dt = dtt;
      const total = files.length;
      let completed = 0;
      let failed = [];
      const d = this.d;
      d.totalFileCount.textContent = total.toString();
      const defaultCategory = d.uploadCategoryInput.value.trim() || window.CONFIG.defaultCategory;
      if (!categories || !Array.isArray(categories) || categories.length !== total) {
        categories = files.map(() => defaultCategory);
      }
      d.uploadBtn.disabled = true;
      d.clearBtn.disabled = true;
      this.setProgress(0);
      d.speedText.textContent = '0';
      d.cancelUploadBtn.classList.remove('hidden');
      this.currentUploadAbort = null;

      try {
        for (let i = 0; i < total; i++) {
          const file = files[i];
          const category = categories[i] || defaultCategory;
          d.currentFileCount.textContent = (i + 1).toString();
          let fileToUpload = file;
          const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
          if (isJson) {
            let customName = d.filePrefix.value.trim();
            if (customName && !customName.toLowerCase().endsWith('.json')) {
              customName += '.json';
            }
            const finalName = customName || file.name;
            if (finalName !== file.name) {
              fileToUpload = new File([file], finalName, {
                type: file.type,
                lastModified: file.lastModified,
              });
            }
          }
          const uploadPromise = this.uploader.uploadFileSmart(
            fileToUpload,
            (percent, speedMbps) => {
              const overall = Math.round(((completed + percent / 100) / total) * 100);
              this.setProgress(overall);
              if (speedMbps !== null && speedMbps !== undefined) {
                d.speedText.textContent = speedMbps.toFixed(2) + ' Mbit/s';
              }
              if (typeof onProgress === 'function') {
                onProgress({
                  overallPercent: overall,
                  currentFileIndex: i,
                  totalFiles: total,
                  completed: completed,
                  failed: failed.length,
                  currentFileName: file.name,
                  currentFilePercent: percent,
                });
              }
            },
            category,
            dt,
            {
              size: fileToUpload.size,
              name: fileToUpload.name,
              type: fileToUpload.type
            }
          );
          if (typeof uploadPromise.abort === 'function') {
            this.currentUploadAbort = uploadPromise.abort;
          }
          try {
            const result = await uploadPromise;
            completed++;
            if (DEBUG) {
              logger.log(`Uploaded ${file.name}:`, result);
            }
          } catch (err) {
            if (err.message && err.message.includes('aborted')) {
              if (DEBUG) {
                logger.log('Upload cancelled');
              }
              showAlert('Upload cancelled');
              break;
            }
            if (DEBUG) {
              logger.error(`Failed to upload ${file.name}:`, err);
            }
            failed.push({
              name: file.name,
              error: err.message
            });
          } finally {
            if (this.currentUploadAbort) {
              this.currentUploadAbort = null;
            }
          }
        }
        const finalResult = {
          success: completed,
          total,
          failed
        };
        this.setProgress(100);
        d.speedText.textContent = '0';
        d.currentFileCount.textContent = '0';
        d.totalFileCount.textContent = '0';
        d.cancelUploadBtn.classList.add('hidden');
        if (failed.length === 0 && completed === total) {
          showAlert(`✅ ${completed} file(s) uploaded successfully`);
        } else if (failed.length > 0) {
          showAlert(`⚠️ ${completed} succeeded, ${failed.length} failed`);
        }
        setTimeout(() => this.clearSelection(), 1500);
        this.populateFileSelect();
        return finalResult;
      } catch (err) {
        if (DEBUG) {
          logger.error('Upload error:', err);
        }
        showAlert('Upload failed: ' + err.message);
        throw err;
      } finally {
        d.uploadBtn.disabled = false;
        d.clearBtn.disabled = false;
        d.cancelUploadBtn.classList.add('hidden');
        this.currentUploadAbort = null;
      }
    },

    async uploadSelectedFiles(onProgress, dt) {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      showAlert('No files selected');
      return {
        success: 0,
        total: 0,
        failed: []
      };
    }
    return this.uploadFiles(this.selectedFiles.slice(), onProgress, null, dt);
  },
  
  async handleUpload(dt = true) {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      showAlert('No file selected');
      return;
    }
    if (!this.uploader) {
      showAlert('Uploader not initialised. Unlock first.');
      return;
    }
    await this.uploadSelectedFiles(null, dt);
  },

    cancelUpload() {
      if (this.currentUploadAbort) {
        this.currentUploadAbort();
        this.currentUploadAbort = null;
        const d = this.d;
        d.cancelUploadBtn.classList.add('hidden');
        showAlert('Upload cancelled');
      }
    },

    async deleteBlob(pathname, url) {
      if (!pathname) {
        return;
      }
      const displayName = helper.getDisplayName(pathname);
      const d = this.d;
      showConfirm(`Delete "${displayName}"?`, async () => {
        d.deletionSpinner.classList.remove('hidden');
        try {
          await this.uploader.deleteBlob(pathname);
          this.cachedBlobs = this.cachedBlobs.filter(b => b.pathname !== pathname);
          this.currentPage = 1;
          const filtered = this.getFilteredBlobs();
          const pageItems = this.getCurrentPageItems();
          this.renderDropdown(pageItems);
          this.populateTable(pageItems);
          this.renderPagination();
          if (d.fileSelect.dataset.value === url) {
            d.fileSelect.dataset.value = '';
            d.customSelectValue.textContent = 'Select File';
            d.jsonPre.classList.add('hidden');
            d.jsonLoader.classList.add('hidden');
            d.jsonPre.textContent = 'Select from the dropdown';
          }
          d.deletionSpinner.classList.add('hidden');
          showAlert('File deleted successfully');
        } catch (err) {
          if (DEBUG) {
            logger.error('Delete failed:', err);
          }
          d.deletionSpinner.classList.add('hidden');
          showAlert('Delete failed: ' + err.message);
        }
      });
    },

    async deleteMultipleBlobs(files) {
      if (!files || files.length === 0) {
        return;
      }
      const d = this.d;
      const total = files.length;
      let completed = 0;
      let failed = [];
      showConfirm(`Delete ${total} file(s)?`, async () => {
        d.deletionSpinner.classList.remove('hidden');
        d.deletionCount.textContent = `0 / ${total}`;
        try {
          for (const file of files) {
            try {
              await this.uploader.deleteBlob(file.pathname);
              this.cachedBlobs = this.cachedBlobs.filter(b => b.pathname !== file.pathname);
              completed++;
              d.deletionCount.textContent = `${completed} / ${total}`;
            } catch (err) {
              failed.push({
                pathname: file.pathname,
                error: err.message
              });
            }
          }
          const filtered = this.getFilteredBlobs();
          this.renderDropdown(filtered);
          this.populateTable(filtered);
          const currentUrl = d.fileSelect.dataset.value;
          if (currentUrl) {
            const stillExists = filtered.some(b => b.url === currentUrl);
            if (!stillExists) {
              d.fileSelect.dataset.value = '';
              d.customSelectValue.textContent = 'Select File';
              d.jsonPre.classList.add('hidden');
              d.jsonLoader.classList.add('hidden');
              d.jsonPre.textContent = 'Select from the dropdown';
            }
          }
          d.deletionSpinner.classList.add('hidden');
          if (failed.length === 0) {
            showAlert(`✅ ${total} file(s) deleted successfully`);
          } else {
            showAlert(`⚠️ ${total - failed.length} succeeded, ${failed.length} failed`);
          }
        } catch (err) {
          if (DEBUG) {
            logger.error('Bulk delete error:', err);
          }
          d.deletionSpinner.classList.add('hidden');
          showAlert('Bulk delete failed: ' + err.message);
        }
      });
    },

    async deleteSelectedFiles() {
      const checkboxes = document.querySelectorAll('#file-table-body .row-selector:checked');
      if (checkboxes.length === 0) {
        showAlert('No files selected');
        return;
      }
      const selectedFiles = Array.from(checkboxes).map(cb => ({
        pathname: cb.dataset.pathname,
        url: cb.dataset.url
      }));
      await this.deleteMultipleBlobs(selectedFiles);
    },

    showMessage(msg, isError) {
      if (isError) {
        showAlert('❌ ' + msg);
      } else {
        showAlert('✅ ' + msg);
      }
      const d = this.d;
      d.uploadProgress.classList.add('hidden');
      d.progressText.textContent = '0%';
      d.progressBar.style.width = '0%';
      d.cancelUploadBtn.classList.add('hidden');
    },

    updateSortIndicators() {
      const headers = document.querySelectorAll('#file-table thead th[data-sort]');
      headers.forEach(th => {
        const arrow = th.querySelector('.sort-arrow');
        if (!arrow) {
          return;
        }
        const column = th.dataset.sort;
        if (column === this.sortColumn) {
          arrow.textContent = this.sortAsc ? '▲' : '▼';
        } else {
          arrow.textContent = '';
        }
      });
    },

    showConfigStatus(msg) {
      const status = d.configContainer?.querySelector('#config-status');
      if (status) {
        status.textContent = msg;
        status.classList.remove('hidden');
        setTimeout(() => status.classList.add('hidden'), 3000);
      }
    },
    
    async testConnection() {
      showTestModal('✅ Connection test placeholder', true);
    },


    init() {
      const d = this.d;
      if (d.lockBtn) {
        d.lockBtn.addEventListener('click', () => this.lockApp());
      }
      
      if (d.cancelUploadBtn) {
        d.cancelUploadBtn.addEventListener('click', () => this.cancelUpload());
        d.cancelUploadBtn.classList.add('hidden');
      }

      d.codeLoad.addEventListener('click', async () => {
        d.jsonPre.classList.add('hidden');
        d.jsonLoader.classList.remove('hidden');
        try {
          const blobs = await this.uploader.listBlobs();
          d.jsonPre.textContent = JSON.stringify(blobs, null, 2);
          d.jsonPre.classList.remove('hidden');
          d.jsonLoader.classList.add('hidden');
          d.codeDownload.disabled = false;
          d.codeCopy.disabled = false;
          d.codeUpload.disabled = false;
        } catch (err) {
          if (DEBUG) {
            logger.error('Failed to load file list:', err);
          }
        }
      });

      if (d.codeCopy) {
        d.codeCopy.addEventListener('click', () => this.copyJsonContent());
      }
      if (d.codeDownload) {
        d.codeDownload.addEventListener('click', () => this.downloadJsonFile());
      }
      if (d.codeUpload) {
        d.codeUpload.addEventListener('click', () => this.uploadJsonContent(false));
      }
      
      if (d.downloadPreview) {
  d.downloadPreview.addEventListener('click', () => {
    const downloadUrl = d.downloadPreview.getAttribute('data-download');
    if (!downloadUrl) {
      logger.warn('No download URL available for preview download');
      return;
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = (d.previewName.textContent || 'download').trim();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

      if (d.selectAllRows) {
        d.selectAllRows.addEventListener('change', () => {
          const checkboxes = document.querySelectorAll('#file-table-body .row-selector');
          checkboxes.forEach(cb => cb.checked = d.selectAllRows.checked);
        });
      }
      if (d.deleteSelectedBtn) {
        d.deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedFiles());
      }
      
      d.unlockBtn.addEventListener('click', () => {
        const password = d.unlockPassword.value;
        if (password) {
          this.handleUnlock(password);
        }
      });

      d.closePreview.addEventListener('click', () => {
        this.closePreviewModal();
      });
      
// --- Logger Modal Logic ---
if (d.loggerModal && d.loggerOutput && d.loggerCloseBtn && d.loggerClearBtn) {
  
  const renderLogs = () => {
    if (logger.logs.length === 0) {
      d.loggerOutput.innerHTML = '<div class="text-white/30 text-center mt-10">No logs recorded yet.</div>';
      return;
    }
    let html = '';
    for (let i = logger.logs.length - 1; i >= 0; i--) {
      const log = logger.logs[i];
      let colorClass = 'text-gray-300';
      let icon = '';
      if (log.type === 'ERROR') {
        colorClass = 'text-red-400';
        icon = '<i class="fa-solid fa-circle-xmark mr-1"></i>';
      } else if (log.type === 'WARN') {
        colorClass = 'text-yellow-400';
        icon = '<i class="fa-solid fa-triangle-exclamation mr-1"></i>';
      } else {
        colorClass = 'text-cyan-300';
        icon = '<i class="fa-solid fa-circle-info mr-1"></i>';
      }
      html += `<div class="mb-2 border-b border-white/5 pb-1">
              <span class="text-white/40 text-[8px]">[${log.timestamp}]</span>
              <span class="${colorClass}">${icon}${log.type}</span>
              <div class="text-white/80 mt-0.5 pl-2 border-l border-white/10 break-words">${log.message}</div>
            </div>`;
    }
    d.loggerOutput.innerHTML = html;
    d.loggerOutput.scrollTop = 0;
  };
  
  const openLoggerModal = () => {
    d.loggerModal.classList.remove('hidden', 'opacity-0');
    d.loggerModal.classList.add('flex', 'opacity-100');
    const box = d.loggerModal.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-95', 'translate-y-2');
      box.classList.add('scale-100', 'translate-y-0');
    }
    renderLogs();
  };
  
  const closeLoggerModal = () => {
    d.loggerModal.classList.add('hidden', 'opacity-0');
    d.loggerModal.classList.remove('flex', 'opacity-100');
    const box = d.loggerModal.querySelector('.modal-box');
    if (box) {
      box.classList.remove('scale-100', 'translate-y-0');
      box.classList.add('scale-95', 'translate-y-2');
    }
  };
  
  d.loggerCloseBtn.addEventListener('click', closeLoggerModal);
  d.loggerClearBtn.addEventListener('click', () => {
    logger.logs = [];
    renderLogs();
  });
  
  d.loggerModal.addEventListener('click', (e) => {
    if (e.target === d.loggerModal) {
      closeLoggerModal();
    }
  });
  
  window.openLoggerModal = openLoggerModal;
}

if (d.logBtn) {
  d.logBtn.addEventListener('click', () => {
    if (window.openLoggerModal) window.openLoggerModal();
  });
}

      d.unlockPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const password = d.unlockPassword.value;
          if (password) {
            this.handleUnlock(password);
          }
        }
      });
      d.testConnectionBtn.addEventListener('click', () => this.testConnection());
      const savedCategory = localStorage.getItem('uploadCategory');
      
      if (savedCategory) {
        d.uploadCategoryInput.value = savedCategory;
      } else {
        d.uploadCategoryInput.value = window.CONFIG.defaultCategory;
        localStorage.setItem('uploadCategory', window.CONFIG.defaultCategory);
      }
      d.uploadCategoryInput.addEventListener('change', () => {
        localStorage.setItem('uploadCategory', d.uploadCategoryInput.value.trim());
        if (this.cachedBlobs) {
          this.currentPage = 1;
          const filtered = this.getFilteredBlobs();
          const pageItems = this.getCurrentPageItems();
          this.renderDropdown(pageItems);
          this.populateTable(pageItems);
          this.renderPagination();
        }
      });

      if (d.exitBtn) {
        d.exitBtn.addEventListener('click', () => {
          this.lockApp();
          window.location.href = 'login.html';
        });
      }

      window.addEventListener('auth:ready', (e) => {
        this.uploader = e.detail.uploader;
      });
      const storedKey = AuthModule.getStoredKey(AuthModule.config.storageKey);
      if (storedKey) {
        const uploader = jsonBlobUploader;
        uploader.configure({
          apiSecretKey: storedKey,
          storageKey: AuthModule.config.storageKey
        });
        this.uploader = uploader;
        window.dispatchEvent(new CustomEvent('auth:ready', {
          detail: { uploader }
        }));
      } else {
        this.showUnlockModal();
      }
      const trigger = d.customSelectTrigger;
      const optionsContainer = d.customSelectOptions;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        d.fileSelect.classList.toggle('open');
        optionsContainer.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!d.fileSelect.contains(e.target)) {
          d.fileSelect.classList.remove('open');
          optionsContainer.classList.add('hidden');
        }
      });
      d.fileSelect.addEventListener('change', async () => {
        const selectedUrl = d.fileSelect.dataset.value;
        if (!selectedUrl) {
          return;
        }
        if (!this.uploader) {
          if (DEBUG) {
            logger.error('Uploader not initialised');
          }
          return;
        }
        d.jsonPre.classList.add('hidden');
        d.jsonLoader.classList.remove('hidden');
        try {
          const data = await this.uploader.readJsonInWorker(selectedUrl);
          d.jsonPre.textContent = JSON.stringify(Object.keys(data), null, 2);
          d.jsonPre.classList.remove('hidden');
          d.jsonLoader.classList.add('hidden');
        } catch (err) {
          if (DEBUG) {
            logger.error('Failed to load selected file:', err);
          }
          d.jsonLoader.classList.add('hidden');
          d.jsonPre.classList.remove('hidden');
          d.jsonPre.textContent = 'Error loading file: ' + err.message;
        }
      });
      d.dropZone.addEventListener('click', () => d.fileInput.click());
      d.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        d.dropZone.classList.add('border-cyan-400', 'bg-cyan-400/10');
      });
      d.dropZone.addEventListener('dragleave', () => {
        d.dropZone.classList.remove('border-cyan-400', 'bg-cyan-400/10');
      });
      d.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        d.dropZone.classList.remove('border-cyan-400', 'bg-cyan-400/10');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.selectedFiles = Array.from(files);
          this.updateFileDisplay(this.selectedFiles[0]);
          d.uploadBtn.disabled = false;
        }
      });
      d.fileInput.addEventListener('change', () => {
        if (d.fileInput.files.length > 0) {
          this.selectedFiles = Array.from(d.fileInput.files);
          this.updateFileDisplay(this.selectedFiles[0]);
          d.uploadBtn.disabled = false;
        } else {
          this.clearSelection();
        }
      });
      d.uploadBtn.addEventListener('click', () => this.handleUpload(true));
      d.clearBtn.addEventListener('click', () => this.clearSelection());
      d.refreshBtn.addEventListener('click', () => {
        this.populateFileSelect();
      });
      const tableHeaders = document.querySelectorAll('#file-table thead th[data-sort]');
      tableHeaders.forEach(th => {
        th.addEventListener('click', () => {
          const column = th.dataset.sort;
          if (this.sortColumn === column) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortColumn = column;
            this.sortAsc = true;
          }
          if (this.cachedBlobs) {
            const pageItems = this.getCurrentPageItems();
            this.populateTable(pageItems);
            this.renderPagination();
          } else {
            this.populateFileSelect();
          }
        });
      });
      
      const setActiveTab = (tabBtn) => {
        const common = 'flex-1 text-center py-0.5 text-[9px] transition-colors';
        const active = 'text-white border-b-[1.5px] border-cyan-400 font-medium';
        const inactive = 'text-white/60 border-b-[1.5px] border-transparent hover:text-white hover:border-cyan-400/50';
        document.querySelectorAll('#tab-bar .tab-btn').forEach(btn => {
          const icon = btn.querySelector('i');
          if (btn === tabBtn) {
            btn.className = `tab-btn ${common} ${active}`;
            if (icon) {
              icon.classList.add('text-cyan-300');
            }
          } else {
            btn.className = `tab-btn ${common} ${inactive}`;
            if (icon) {
              icon.classList.remove('text-cyan-300');
            }
          }
        });
        document.querySelectorAll('#tab-container > div').forEach(p => p.classList.add('hidden'));
        const paneId = 'tab-pane-' + tabBtn.id.replace('tab-', '');
        document.getElementById(paneId).classList.remove('hidden');
        if (paneId === 'tab-pane-config') {
          this.populateConfig();
        }
      };
      document.querySelectorAll('#tab-bar .tab-btn').forEach(btn => btn.addEventListener('click', () => setActiveTab(btn)));
      const defaultTab = d.tabCode;
      if (defaultTab) {
        setActiveTab(defaultTab);
      }
      d.uploadBtn.disabled = true;
    }
  };

  return app_api;
})();
window.app = app;
app.init();
