(function() {
	'use strict';
	const DEFAULTS = {
		apiBase: 'https://blob-server.vercel.app/api',
		blobdbEndpoint: '/server',
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
			if(saved) {
				const parsed = JSON.parse(saved);
				return {...DEFAULTS, ...parsed
				};
			}
		} catch(e) {
			console.warn('Failed to load config from localStorage', e);
		}
		return {...DEFAULTS
		};
	}
	const _data = loadFromStorage();

	function persist() {
		try {
			localStorage.setItem('app-config', JSON.stringify(_data));
		} catch(e) {
			console.warn('Failed to save config to localStorage', e);
		}
	}
	const CONFIG = {
		get(key) {
				if(key in _data) return _data[key];
				console.warn(`Config key "${key}" not found.`);
				return undefined;
			},
			set(key, value) {
				if(key in _data) {
					_data[key] = value;
					persist();
					document.dispatchEvent(new CustomEvent('configChanged', {
						detail: {
							key, value
						}
					}));
				} else {
					console.warn(`Config key "${key}" not found. Cannot set.`);
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
	window.CONFIG = CONFIG;
})();
(function() {
	'use strict';
	const dom = {
		exitBtn: document.getElementById('exit-btn'),
		lockBtn: document.getElementById('lock-btn'),
		refreshBtn: document.getElementById('refresh-btn'),
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
		jsonLoadingIndicator: document.getElementById('json-loading-indicator'),
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
		unlockErrorMsg: document.getElementById('unlock-error-msg'),
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
	};
	window.dom = dom;
})();
const KeyEncryptor = (function() {
	'use strict';

	function _arrayBufferToBase64(buffer) {
		var bytes = new Uint8Array(buffer);
		var binary = '';
		for(var i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	function _base64ToArrayBuffer(base64) {
		var binary = atob(base64);
		var bytes = new Uint8Array(binary.length);
		for(var i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	}
	async function _deriveKey(password, salt) {
		var enc = new TextEncoder();
		var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
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
		if(!plaintext || !password) {
			throw new Error('Plaintext and password are required.');
		}
		var salt = crypto.getRandomValues(new Uint8Array(16));
		var iv = crypto.getRandomValues(new Uint8Array(12));
		var key = await _deriveKey(password, salt);
		var encoded = new TextEncoder().encode(plaintext);
		var cipherBuffer = await crypto.subtle.encrypt({
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
		if(!bundle || !password) {
			throw new Error('Bundle and password are required.');
		}
		var iv = new Uint8Array(_base64ToArrayBuffer(bundle.iv));
		var salt = new Uint8Array(_base64ToArrayBuffer(bundle.salt));
		var cipherBuffer = _base64ToArrayBuffer(bundle.ciphertext);
		var key = await _deriveKey(password, salt);
		var decrypted = await crypto.subtle.decrypt({
			name: 'AES-GCM',
			iv: iv
		}, key, cipherBuffer);
		return new TextDecoder().decode(decrypted);
	}
	return {
		encrypt, decrypt
	};
})();
window.KeyEncryptor = KeyEncryptor;
var AuthModule = (function() {
	'use strict';
	const cfg = window.CONFIG;
	let cachedJfrKey = null;
	let jfrKeyPromise = null;

	function fetchEncryptedKey() {
		if(cachedJfrKey) {
			return Promise.resolve(cachedJfrKey);
		}
		if(jfrKeyPromise) {
			return jfrKeyPromise;
		}
		jfrKeyPromise = fetch(`${cfg.apiBase}${cfg.encryptedKeyEndpoint}`).then(res => {
			if(!res.ok) {
				throw new Error(`HTTP ${res.status}: Failed to fetch encrypted key`);
			}
			return res.json();
		}).then(data => {
			if(!data.jfrKey) {
				throw new Error('Invalid response: missing jfrKey');
			}
			cachedJfrKey = data.jfrKey;
			jfrKeyPromise = null;
			return cachedJfrKey;
		}).catch(err => {
			console.error('Error fetching encrypted key:', err);
			jfrKeyPromise = null;
			throw err;
		});
		return jfrKeyPromise;
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
		} catch(err) {
			throw new Error(`Unlock failed: ${err.message}`);
		}
	}

	function hasStoredKey(storageKey) {
		return !!localStorage.getItem(storageKey);
	}

	function getStoredKey(storageKey) {
		return localStorage.getItem(storageKey);
	}

	function storeKey(storageKey, apiKey) {
		localStorage.setItem(storageKey, apiKey);
	}

	function removeKey(storageKey) {
		localStorage.removeItem(storageKey);
	}
	async function encrypt(plaintext, password) {
		try {
			return await KeyEncryptor.encrypt(plaintext, password);
		} catch(err) {
			throw new Error(`Encryption failed: ${err.message}`);
		}
	}
	async function decrypt(bundle, password) {
		try {
			return await KeyEncryptor.decrypt(bundle, password);
		} catch(err) {
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
(function() {
	'use strict';
	const helper = {
		fmtSizes(bytes) {
				if(!bytes) return '0 B';
				const k = 1024;
				const sizes = ['B', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return(bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
			},
			fmtSize(bytes) {
				if(!bytes) return '0 B';
				const k = 1000;
				const sizes = ['B', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				const value = bytes / Math.pow(k, i);
				return value.toFixed(1) + ' ' + sizes[i];
			},
			fmtDate(ts) {
				if(!ts) return '—';
				const d = new Date(ts);
				const pad = n => String(n).padStart(2, '0');
				return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
			},
			fmtDates(ts) {
				if(!ts) return '—';
				const d = new Date(ts);
				const pad = n => String(n).padStart(2, '0');
				return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
			},
			getDisplayName(pathname) {
				const fullName = pathname.split('/').pop();
				const lastDot = fullName.lastIndexOf('.');
				if(lastDot === -1) return fullName;
				const base = fullName.substring(0, lastDot);
				const ext = fullName.substring(lastDot);
				const parts = base.split('-');
				const lastPart = parts[parts.length - 1];
				if(parts.length > 1 && lastPart.length >= 20 && /^[A-Za-z0-9]+$/.test(lastPart)) {
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
				if(!blobs || blobs.length === 0) return blobs;
				const sorted = [...blobs];
				sorted.sort((a, b) => {
					let valA, valB;
					if(column === 'name') {
						valA = this.getDisplayName(a.pathname);
						valB = this.getDisplayName(b.pathname);
					} else if(column === 'size') {
						valA = a.size;
						valB = b.size;
					}
					if(typeof valA === 'string') {
						return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
					} else {
						return asc ? valA - valB : valB - valA;
					}
				});
				return sorted;
			},
			filterBlobs(blobs, category, filterEnabled) {
				if(!blobs) return [];
				if(!filterEnabled) return blobs;
				return blobs.filter(blob => blob.pathname.startsWith(`uploads/${category}/`));
			},
			getPageItems(blobs, page, pageSize) {
				if(!blobs) return {
					items: [],
					totalPages: 1
				};
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
	window.helper = helper;
})();
var jsonBlobUploader = (function() {
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
		if(_apiSecretKey) return _apiSecretKey;
		if(_storageKey) {
			const stored = AuthModule.getStoredKey(_storageKey);
			if(stored) {
				_apiSecretKey = stored;
				return stored;
			}
		}
		return null;
	}

	function configure(options) {
		if(!options || typeof options !== 'object') return;
		if(typeof options.apiBase === 'string' && options.apiBase.length > 0) {
			_apiBase = options.apiBase.replace(/\/+$/, '');
		}
		if(typeof options.blobdbEndpoint === 'string' && options.blobdbEndpoint.length > 0) {
			_blobdbEndpoint = options.blobdbEndpoint;
		}
		if(typeof options.uploadCategory === 'string' && options.uploadCategory.length > 0) {
			_uploadCategory = options.uploadCategory;
		}
		if(typeof options.apiSecretKey === 'string') {
			_apiSecretKey = options.apiSecretKey;
		}
		if(typeof options.storageKey === 'string' && options.storageKey.length > 0) {
			_storageKey = options.storageKey;
			if(!_apiSecretKey) {
				_apiSecretKey = AuthModule.getStoredKey(_storageKey) || null;
			}
		}
	}

	function createDirectUploadRequest(file, presignedUrl, onProgress) {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', presignedUrl, true);
		const promise = new Promise((resolve, reject) => {
			let lastLoaded = 0;
			let lastTime = Date.now();
			xhr.upload.onprogress = e => {
				if(e.lengthComputable) {
					const percent = Math.round((e.loaded / e.total) * 100);
					const now = Date.now();
					const timeDiff = (now - lastTime) / 1000;
					const bytesDiff = e.loaded - lastLoaded;
					let speedMbps = 0;
					if(timeDiff > 0 && bytesDiff > 0) {
						const instantMbps = (bytesDiff * 8) / (timeDiff * 1 _000_000);
						_smoothedSpeed = _smoothedSpeed * (1 - _smoothingFactor) + instantMbps * _smoothingFactor;
						speedMbps = _smoothedSpeed;
					}
					lastLoaded = e.loaded;
					lastTime = now;
					if(typeof onProgress === 'function') {
						onProgress(percent, speedMbps);
					}
				}
			};
			xhr.onload = () => {
				if(xhr.status === 200 || xhr.status === 201) {
					try {
						const blobData = JSON.parse(xhr.responseText);
						resolve({
							url: blobData.url,
							pathname: blobData.pathname,
							size: blobData.size,
						});
					} catch(e) {
						reject(new Error('Invalid response from blob storage'));
					}
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			};
			xhr.onerror = () => reject(new Error('Network error during direct upload'));
			xhr.ontimeout = () => reject(new Error('Upload timeout'));
			xhr.timeout = 0;
			const abortFn = () => {
				xhr.abort();
			};
			xhr.send(file);
		});
		const wrappedPromise = promise;
		wrappedPromise.abort = () => {
			xhr.abort();
		};
		return wrappedPromise;
	}

	function _uploadSingleFile(formData, category, onProgress) {
		return new Promise((resolve, reject) => {
			const timestamp = formData.get('lastModified') || Date.now();
			formData.set('lastModified', timestamp);
			const queryUrl = `${_apiBase}${_blobdbEndpoint}?category=${encodeURIComponent(category)}&lastModified=${timestamp}`;
			const xhr = new XMLHttpRequest();
			xhr.open('POST', queryUrl, true);
			const authKey = _getApiKey();
			if(authKey) xhr.setRequestHeader('Authorization', 'Bearer ' + authKey);
			let lastLoaded = 0;
			let lastTime = Date.now();
			xhr.upload.onprogress = e => {
				if(e.lengthComputable) {
					const percent = Math.round((e.loaded / e.total) * 100);
					const now = Date.now();
					const timeDiff = (now - lastTime) / 1000;
					const bytesDiff = e.loaded - lastLoaded;
					let speedMbps = 0;
					if(timeDiff > 0 && bytesDiff > 0) {
						const instantMbps = (bytesDiff * 8) / (timeDiff * 1 _000_000);
						_smoothedSpeed = _smoothedSpeed * (1 - _smoothingFactor) + instantMbps * _smoothingFactor;
						speedMbps = _smoothedSpeed;
					}
					lastLoaded = e.loaded;
					lastTime = now;
					if(typeof onProgress === 'function') {
						onProgress(percent, speedMbps);
					}
				}
			};
			xhr.onload = () => {
				if(xhr.status === 200 || xhr.status === 201) {
					try {
						resolve(JSON.parse(xhr.responseText));
					} catch(e) {
						reject(new Error('Invalid response'));
					}
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

	function uploadFile(file, onProgress, category, extraFields) {
		if(!file) return Promise.reject(new Error('File is required'));
		_smoothedSpeed = 0;
		const cat = category || _uploadCategory;
		const formData = new FormData();
		formData.append('image', file);
		formData.append('lastModified', file.lastModified || Date.now());
		if(extraFields && typeof extraFields === 'object') {
			Object.entries(extraFields).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}
		return _uploadSingleFile(formData, cat, onProgress);
	}

	function uploadFileChunked(file, onProgress, category, extraFields, chunkSize) {
		if(!file) return Promise.reject(new Error('File is required'));
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
			formData.append('lastModified', lastModified.toString());
			if(extraFields && typeof extraFields === 'object') {
				Object.entries(extraFields).forEach(([key, value]) => {
					formData.append(key, value);
				});
			}
			const result = await _uploadSingleFile(formData, cat, (chunkPercent, speedMbps) => {
				if(onProgress) {
					const overall = ((chunkIndex + chunkPercent / 100) / totalChunks) * 100;
					onProgress(Math.round(overall), speedMbps);
				}
			});
			return result;
		}
		const executeChunks = async() => {
			let finalResult;
			_smoothedSpeed = 0;
			for(let i = 0; i < totalChunks; i++) {
				finalResult = await uploadNextChunk(i);
			}
			return finalResult;
		};
		return executeChunks();
	}

	function uploadFileAdaptive(file, onProgress, category, extraFields, threshold, chunkSize) {
		if(!file) return Promise.reject(new Error('File is required'));
		threshold = threshold || cfg.uploadThreshold || 4 * 1024 * 1024;
		if(file.size > threshold) {
			return this.uploadFileChunked(file, onProgress, category, extraFields, chunkSize);
		} else {
			return this.uploadFile(file, onProgress, category, extraFields);
		}
	}

	function uploadFileDirectly(file, onProgress, category, extraFields) {
		if(!file) return Promise.reject(new Error('File is required'));
		const cat = category || _uploadCategory;
		const authKey = _getApiKey();
		if(!authKey) {
			return Promise.reject(new Error('API key not available. Please unlock first.'));
		}
		const base = _apiBase.replace(/\/+$/, '');
		const presignUrl = base + _blobdbEndpoint + '?action=presign';
		const formData = new FormData();
		formData.append('filename', file.name);
		formData.append('category', cat);
		return fetch(presignUrl, {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + authKey
			},
			body: formData,
		}).then(response => {
			if(!response.ok) {
				return response.json().then(errData => {
					throw new Error(errData.error || 'Failed to get upload URL');
				});
			}
			return response.json();
		}).then(({
			presignedUrl
		}) => {
			const uploadRequest = createDirectUploadRequest(file, presignedUrl, onProgress);
			const promise = uploadRequest;
			promise.abort = uploadRequest.abort || (() => {});
			return promise;
		});
	}

	function uploadFileSmart(file, onProgress, category, extraFields, threshold) {
		if(!file) return Promise.reject(new Error('File is required'));
		threshold = threshold || cfg.uploadThreshold || 4 * 1024 * 1024;
		if(file.size <= threshold) {
			return this.uploadFile(file, onProgress, category, extraFields);
		}
		return this.uploadFileDirectly(file, onProgress, category, extraFields);
	}

	function uploadJson(data, filename, onProgress, category) {
		if(data === undefined || data === null) {
			return Promise.reject(new Error('Data is required'));
		}
		const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
		const file = new File([jsonString], filename || 'data.json', {
			type: 'application/json',
			lastModified: Date.now()
		});
		return uploadFile(file, onProgress, category || 'json');
	}

	function readJson(input) {
		if(typeof input === 'string') {
			if(input.startsWith('http://') || input.startsWith('https://')) {
				return _fetchJson(input);
			}
			return _findUrlByPathname(input).then(url => _fetchJson(url));
		}
		if(input && typeof input === 'object' && input.url) {
			return _fetchJson(input.url);
		}
		return Promise.reject(new Error('A URL, pathname, or blob object with url is required'));
	}

	function readJsonInWorker(input) {
		if(!_workerUrl) {
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
				if(e.data.error) {
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
			if(typeof input === 'string') {
				if(input.startsWith('http://') || input.startsWith('https://')) {
					worker.postMessage({
						url: input
					});
				} else {
					_findUrlByPathname(input).then(url => worker.postMessage({
						url
					})).catch(err => {
						reject(err);
						worker.terminate();
					});
				}
			} else if(input && typeof input === 'object' && input.url) {
				worker.postMessage({
					url: input.url
				});
			} else {
				reject(new Error('A URL, pathname, or blob object with url is required'));
				worker.terminate();
			}
		});
	}

	function _findUrlByPathname(pathname) {
		const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
		const url = `${_apiBase}${_blobdbEndpoint}?_=${Date.now()}`;
		const authKey = _getApiKey();
		const headers = {};
		if(authKey) headers['Authorization'] = 'Bearer ' + authKey;
		return fetch(url, {
			headers
		}).then(res => {
			if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			return res.json();
		}).then(data => {
			const blobs = data.blobs || [];
			const blob = blobs.find(b => b.pathname === cleanPath || b.pathname === '/' + cleanPath);
			if(!blob) throw new Error(`Blob with pathname "${pathname}" not found`);
			return blob.url;
		});
	}

	function _fetchJson(url) {
		return fetch(url).then(res => {
			if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			return res.json();
		});
	}

	function listBlobs() {
		const url = `${_apiBase}${_blobdbEndpoint}?_=${Date.now()}`;
		const authKey = _getApiKey();
		const headers = {};
		if(authKey) headers['Authorization'] = 'Bearer ' + authKey;
		return fetch(url, {
			headers
		}).then(res => {
			if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			return res.json();
		}).then(data => data.blobs || []);
	}

	function deleteBlob(pathname) {
		if(!pathname) return Promise.reject(new Error('Pathname is required'));
		const authKey = _getApiKey();
		if(!authKey) return Promise.reject(new Error('API key not available'));
		const url = `${_apiBase}${_blobdbEndpoint}?pathname=${encodeURIComponent(pathname)}`;
		return fetch(url, {
			method: 'DELETE',
			headers: {
				'Authorization': 'Bearer ' + authKey
			}
		}).then(res => {
			if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			return res.json();
		});
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
		readJsonInWorker,
		listBlobs,
		deleteBlob,
		getApiBase: () => _apiBase,
			getUploadCategory: () => _uploadCategory,
			getApiKey: _getApiKey
	};
})();
window.jsonBlobUploader = jsonBlobUploader;
(function() {
	'use strict';
	const d = window.dom;
	const UPLOAD_CATEGORY = window.CONFIG.defaultCategory;

	function closeTestModal() {
		const el = d.testModal;
		el.classList.add('hidden', 'opacity-0');
		el.classList.remove('flex', 'opacity-100');
		const box = el.querySelector('.modal-box');
		if(box) {
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
		const iconContainer = d.testModalIcon;
		iconContainer.style.color = isSuccess ? '#34d399' : '#f87171';
		el.classList.remove('hidden', 'opacity-0');
		el.classList.add('flex', 'opacity-100');
		const box = el.querySelector('.modal-box');
		if(box) {
			box.classList.remove('scale-95', 'translate-y-2');
			box.classList.add('scale-100', 'translate-y-0');
		}
		d.testModalOkBtn.onclick = closeTestModal;
		el.onclick = function(e) {
			if(e.target === el) closeTestModal();
		};
	}

	function closeAlert() {
		const el = d.alertEl;
		el.classList.add('hidden', 'opacity-0');
		el.classList.remove('flex', 'opacity-100');
		const box = el.querySelector('.modal-box');
		if(box) {
			box.classList.remove('scale-100', 'translate-y-0');
			box.classList.add('scale-95', 'translate-y-2');
		}
	}

	function closeConfirm() {
		const el = d.confirmEl;
		el.classList.add('hidden', 'opacity-0');
		el.classList.remove('flex', 'opacity-100');
		const box = el.querySelector('.modal-box');
		if(box) {
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
		if(box) {
			box.classList.remove('scale-95', 'translate-y-2');
			box.classList.add('scale-100', 'translate-y-0');
		}
		d.alertOkBtn.onclick = function() {
			closeAlert();
			if(cb) cb();
		};
		el.onclick = function(e) {
			if(e.target === el) {
				closeAlert();
				if(cb) cb();
			}
		};
	}

	function showConfirm(msg, onConfirm, onCancel) {
		d.confirmMessage.textContent = msg;
		const el = d.confirmEl;
		el.classList.remove('hidden', 'opacity-0');
		el.classList.add('flex', 'opacity-100');
		const box = el.querySelector('.modal-box');
		if(box) {
			box.classList.remove('scale-95', 'translate-y-2');
			box.classList.add('scale-100', 'translate-y-0');
		}
		d.confirmCancelBtn.onclick = function() {
			closeConfirm();
			if(onCancel) onCancel();
		};
		d.confirmOkBtn.onclick = function() {
			closeConfirm();
			if(onConfirm) onConfirm();
		};
		el.onclick = function(e) {
			if(e.target === el) {
				closeConfirm();
				if(onCancel) onCancel();
			}
		};
	}
	window.closeAlert = closeAlert;
	window.closeConfirm = closeConfirm;
	window.showAlert = showAlert;
	window.showConfirm = showConfirm;
	const ui = {
		uploader: null,
		selectedFiles: [],
		sortColumn: 'name',
		sortAsc: true,
		cachedBlobs: null,
		currentPage: 1,
		pageSize: 20,
		totalPages: 0,
		currentUploadAbort: null,
		get filterEnabled() {
			return window.CONFIG.filterEnabled;
		},
		getFilteredBlobs() {
			const category = this.d.uploadCategoryInput.value.trim() || window.CONFIG.defaultCategory;
			return helper.filterBlobs(this.cachedBlobs, category, this.filterEnabled);
		},
		getCurrentPageItems() {
			const filtered = this.getFilteredBlobs();
			const result = helper.getPageItems(filtered, this.currentPage, this.pageSize);
			this.totalPages = result.totalPages;
			if(this.currentPage > this.totalPages) this.currentPage = this.totalPages;
			return result.items;
		},
		renderPagination() {
			const container = d.paginationContainer;
			if(!container) return;
			const total = this.totalPages || 1;
			const current = this.currentPage;
			let html = `<div class="flex items-center gap-2 text-[10px] text-cyan-300">
        <button class="page-prev bg-transparent border border-cyan-400/30 rounded px-2 py-0.5 hover:bg-cyan-400/10 disabled:opacity-40" ${current <= 1 ? 'disabled' : ''}>Prev</button>
        <span>Page ${current} of ${total}</span>
        <button class="page-next bg-transparent border border-cyan-400/30 rounded px-2 py-0.5 hover:bg-cyan-400/10 disabled:opacity-40" ${current >= total ? 'disabled' : ''}>Next</button>
        <select class="page-size bg-transparent border border-cyan-400/30 rounded px-1 py-0.5 text-cyan-200">
          <option value="10">10</option>
          <option value="20" selected>20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>`;
			container.innerHTML = html;
			container.querySelector('.page-prev').addEventListener('click', () => {
				if(this.currentPage > 1) {
					this.currentPage--;
					this.refreshTableAndDropdown();
				}
			});
			container.querySelector('.page-next').addEventListener('click', () => {
				if(this.currentPage < this.totalPages) {
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
		refreshTableAndDropdown() {
			const filtered = this.getFilteredBlobs();
			const pageItems = this.getCurrentPageItems();
			this.renderDropdown(pageItems);
			this.populateTable(pageItems);
			this.renderPagination();
		},
		async deleteSelectedFiles() {
			const checkboxes = document.querySelectorAll('#file-table-body .row-selector:checked');
			if(checkboxes.length === 0) {
				showAlert('No files selected');
				return;
			}
			const selectedFiles = Array.from(checkboxes).map(cb => ({
				pathname: cb.dataset.pathname,
				url: cb.dataset.url
			}));
			await this.deleteMultipleBlobs(selectedFiles);
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
		updateFileDisplay(file) {
			const d = this.d;
			if(this.selectedFiles.length > 1) {
				d.fileName.textContent = `${this.selectedFiles.length} files selected`;
				const totalSize = this.selectedFiles.reduce((sum, f) => sum + f.size, 0);
				d.fileSize.textContent = `Total: ${helper.fmtSize(totalSize)}`;
				d.fileType.textContent = '';
				d.fileDate.textContent = '';
				return;
			}
			if(!file) {
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
			if(isJson) {
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
		showMessage(msg, isError) {
			if(isError) {
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
				if(!arrow) return;
				const column = th.dataset.sort;
				if(column === this.sortColumn) {
					arrow.textContent = this.sortAsc ? '▲' : '▼';
				} else {
					arrow.textContent = '';
				}
			});
		},
		async uploadFiles(files, onProgress, categories) {
			if(!files || !files.length) return {
				success: 0,
				total: 0,
				failed: []
			};
			const total = files.length;
			let completed = 0;
			let failed = [];
			const d = this.d;
			d.totalFileCount.textContent = total.toString();
			const defaultCategory = d.uploadCategoryInput.value.trim() || window.CONFIG.defaultCategory;
			if(!categories || !Array.isArray(categories) || categories.length !== total) {
				categories = files.map(() => defaultCategory);
			}
			d.uploadBtn.disabled = true;
			d.clearBtn.disabled = true;
			this.setProgress(0);
			d.speedText.textContent = '0';
			d.cancelUploadBtn.classList.remove('hidden');
			this.currentUploadAbort = null;
			try {
				for(let i = 0; i < total; i++) {
					const file = files[i];
					const category = categories[i] || defaultCategory;
					d.currentFileCount.textContent = (i + 1).toString();
					let fileToUpload = file;
					const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
					if(isJson) {
						let customName = d.filePrefix.value.trim();
						if(customName && !customName.toLowerCase().endsWith('.json')) customName += '.json';
						const finalName = customName || file.name;
						if(finalName !== file.name) {
							fileToUpload = new File([file], finalName, {
								type: file.type,
								lastModified: file.lastModified,
							});
						}
					}
					const uploadPromise = this.uploader.uploadFileSmart(fileToUpload, (percent, speedMbps) => {
						const overall = Math.round(((completed + percent / 100) / total) * 100);
						this.setProgress(overall);
						if(speedMbps !== null && speedMbps !== undefined) {
							d.speedText.textContent = speedMbps.toFixed(2) + ' Mbit/s';
						}
						if(typeof onProgress === 'function') {
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
					}, category, {
						size: fileToUpload.size,
						name: fileToUpload.name,
						type: fileToUpload.type
					});
					if(typeof uploadPromise.abort === 'function') {
						this.currentUploadAbort = uploadPromise.abort;
					}
					try {
						const result = await uploadPromise;
						completed++;
						console.log(`Uploaded ${file.name}:`, result);
					} catch(err) {
						if(err.message && err.message.includes('aborted')) {
							console.log('Upload cancelled');
							showAlert('Upload cancelled');
							break;
						}
						console.error(`Failed to upload ${file.name}:`, err);
						failed.push({
							name: file.name,
							error: err.message
						});
					} finally {
						if(this.currentUploadAbort) this.currentUploadAbort = null;
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
				if(failed.length === 0 && completed === total) {
					showAlert(`✅ ${completed} file(s) uploaded successfully`);
				} else if(failed.length > 0) {
					showAlert(`⚠️ ${completed} succeeded, ${failed.length} failed`);
				}
				setTimeout(() => this.clearSelection(), 1500);
				this.populateFileSelect();
				return finalResult;
			} catch(err) {
				console.error('Upload error:', err);
				showAlert('Upload failed: ' + err.message);
				throw err;
			} finally {
				d.uploadBtn.disabled = false;
				d.clearBtn.disabled = false;
				d.cancelUploadBtn.classList.add('hidden');
				this.currentUploadAbort = null;
			}
		},
		async uploadSelectedFiles(onProgress) {
			if(!this.selectedFiles || this.selectedFiles.length === 0) {
				showAlert('No files selected');
				return {
					success: 0,
					total: 0,
					failed: []
				};
			}
			return this.uploadFiles(this.selectedFiles.slice(), onProgress);
		},
		async handleUpload() {
			if(!this.selectedFiles || this.selectedFiles.length === 0) {
				showAlert('No file selected');
				return;
			}
			if(!this.uploader) {
				showAlert('Uploader not initialised. Unlock first.');
				return;
			}
			await this.uploadSelectedFiles();
		},
		cancelUpload() {
			if(this.currentUploadAbort) {
				this.currentUploadAbort();
				this.currentUploadAbort = null;
				const d = this.d;
				d.cancelUploadBtn.classList.add('hidden');
				showAlert('Upload cancelled');
			}
		},
		renderDropdown(blobs) {
			const d = this.d;
			const valueSpan = d.customSelectValue;
			const optionsContainer = d.customSelectOptions;
			optionsContainer.innerHTML = '';
			if(!blobs || blobs.length === 0) {
				valueSpan.textContent = 'No files';
				optionsContainer.innerHTML = '<div class="custom-select-option disabled">No files</div>';
				return;
			}
			blobs.forEach(blob => {
				const option = document.createElement('div');
				option.className = 'custom-select-option flex items-center gap-1';
				option.dataset.value = blob.url;
				option.dataset.pathname = blob.pathname;
				const iconSpan = document.createElement('span');
				iconSpan.className = `fa-regular ${helper.getFileIcon(blob.pathname)} text-cyan-300 text-[10px] flex-shrink-0`;
				option.appendChild(iconSpan);
				const textSpan = document.createElement('span');
				textSpan.className = 'truncate';
				textSpan.textContent = helper.getDisplayName(blob.pathname);
				textSpan.title = helper.getDisplayName(blob.pathname);
				option.appendChild(textSpan);
				option.title = helper.getDisplayName(blob.pathname);
				option.addEventListener('click', () => {
					valueSpan.textContent = helper.getDisplayName(blob.pathname);
					d.fileSelect.dataset.value = blob.url;
					d.fileSelect.classList.remove('open');
					optionsContainer.classList.add('hidden');
					const event = new CustomEvent('change');
					d.fileSelect.dispatchEvent(event);
				});
				optionsContainer.appendChild(option);
			});
			const currentUrl = d.fileSelect.dataset.value;
			if(currentUrl) {
				const stillExists = blobs.some(b => b.url === currentUrl);
				if(!stillExists) {
					d.fileSelect.dataset.value = '';
					valueSpan.textContent = 'Select File';
					if(!d.jsonPre.classList.contains('hidden')) {
						d.jsonPre.classList.add('hidden');
						d.jsonLoader.classList.add('hidden');
						d.jsonPre.textContent = 'Select from the dropdown';
					}
				}
			}
		},
		async populateFileSelect() {
			const d = this.d;
			if(!this.uploader) return;
			const valueSpan = d.customSelectValue;
			const optionsContainer = d.customSelectOptions;
			valueSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Loading…';
			d.fileSelect.classList.add('disabled');
			optionsContainer.innerHTML = '<div class="custom-select-option disabled">Loading files…</div>';
			try {
				const blobs = await this.uploader.listBlobs();
				this.cachedBlobs = blobs;
				if(d.conn) d.conn.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
				this.currentPage = 1;
				const filtered = this.getFilteredBlobs();
				const pageItems = this.getCurrentPageItems();
				this.renderDropdown(pageItems);
				if(filtered.length === 0) valueSpan.textContent = 'No files';
				else if(!d.fileSelect.dataset.value) valueSpan.textContent = 'Select File';
				d.fileSelect.classList.remove('disabled');
				this.populateTable(pageItems);
				this.renderPagination();
			} catch(err) {
				console.error('Failed to load file list:', err);
				if(d.conn) d.conn.className = 'w-1.5 h-1.5 rounded-full bg-red-800 animate-pulse';
				valueSpan.textContent = '❌ Error';
				optionsContainer.innerHTML = `<div class="custom-select-option disabled">${err.message}</div>`;
				d.fileSelect.classList.remove('disabled');
				if(d.fileTableBody) {
					d.fileTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-400 py-2">${err.message}</td></tr>`;
				}
				if(d.paginationContainer) d.paginationContainer.innerHTML = '';
			}
		},
		populateTable(blobs) {
			const d = this.d;
			const tbody = d.fileTableBody;
			const emptyMsg = d.fileTableEmpty;
			if(!tbody) return;
			if(!blobs || blobs.length === 0) {
				tbody.innerHTML = '';
				if(emptyMsg) emptyMsg.style.display = 'block';
				return;
			}
			if(emptyMsg) emptyMsg.style.display = 'none';
			const sorted = helper.sortBlobs(blobs, this.sortColumn, this.sortAsc);
			tbody.innerHTML = '';
			sorted.forEach(blob => {
				const tr = document.createElement('tr');
				const displayName = helper.getDisplayName(blob.pathname);
				const tdCheck = document.createElement('td');
				tdCheck.className = 'text-center';
				const cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.className = 'row-selector';
				cb.dataset.pathname = blob.pathname;
				cb.dataset.url = blob.url;
				tdCheck.appendChild(cb);
				tr.appendChild(tdCheck);
				const tdName = document.createElement('td');
				tdName.style.width = '150px';
				tdName.style.maxWidth = '150px';
				tdName.style.minWidth = '150px';
				tdName.style.overflow = 'hidden';
				tdName.style.whiteSpace = 'nowrap';
				tdName.style.textOverflow = 'ellipsis';
				tdName.title = displayName;
				const iconSpan = document.createElement('span');
				iconSpan.className = `fa-regular ${helper.getFileIcon(blob.pathname)} text-cyan-300 text-[10px]`;
				iconSpan.style.display = 'inline-block';
				iconSpan.style.width = '1.2em';
				iconSpan.style.textAlign = 'center';
				iconSpan.style.marginRight = '0.25rem';
				tdName.appendChild(iconSpan);
				const textSpan = document.createElement('span');
				textSpan.style.display = 'inline';
				textSpan.textContent = displayName;
				tdName.appendChild(textSpan);
				tr.appendChild(tdName);
				const tdSize = document.createElement('td');
				tdSize.className = 'text-center';
				tdSize.textContent = helper.fmtSize(blob.size);
				tr.appendChild(tdSize);
				const tdView = document.createElement('td');
				tdView.className = 'col-action';
				const btnView = document.createElement('button');
				btnView.className = 'action-btn text-cyan-300 hover:text-cyan-200';
				btnView.innerHTML = '<i class="fa-regular fa-eye"></i>';
				btnView.title = 'View file';
				btnView.addEventListener('click', () => this.loadFile(blob.url));
				tdView.appendChild(btnView);
				tr.appendChild(tdView);
				const tdDownload = document.createElement('td');
				tdDownload.className = 'col-action';
				const btnDownload = document.createElement('button');
				btnDownload.className = 'action-btn text-green-300 hover:text-green-200';
				btnDownload.innerHTML = '<i class="fa-solid fa-download"></i>';
				btnDownload.title = 'Download file';
				btnDownload.addEventListener('click', () => {
					window.open(blob.url, '_blank');
				});
				tdDownload.appendChild(btnDownload);
				tr.appendChild(tdDownload);
				const tdDelete = document.createElement('td');
				tdDelete.className = 'col-action';
				const btnDelete = document.createElement('button');
				btnDelete.className = 'action-btn delete text-red-300 hover:text-red-200';
				btnDelete.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
				btnDelete.title = 'Delete file';
				btnDelete.addEventListener('click', () => this.deleteBlob(blob.pathname, blob.url));
				tdDelete.appendChild(btnDelete);
				tr.appendChild(tdDelete);
				tbody.appendChild(tr);
			});
			this.updateSortIndicators();
			if(d.selectAllRows) d.selectAllRows.checked = false;
		},
		async loadFile(url) {
			const d = this.d;
			if(!url) return;
			const codeTab = d.tabCode;
			if(codeTab) codeTab.click();
			d.jsonPre.classList.add('hidden');
			d.jsonLoader.classList.remove('hidden');
			try {
				const data = await this.uploader.readJsonInWorker(url);
				d.jsonPre.textContent = JSON.stringify(Object.keys(data), null, 2);
				d.jsonPre.classList.remove('hidden');
				d.jsonLoader.classList.add('hidden');
				const valueSpan = d.customSelectValue;
				const displayName = helper.getDisplayName(url);
				valueSpan.textContent = displayName;
				d.fileSelect.dataset.value = url;
			} catch(err) {
				console.error('Failed to load file:', err);
				d.jsonLoader.classList.add('hidden');
				d.jsonPre.classList.remove('hidden');
				d.jsonPre.textContent = 'Error loading file: ' + err.message;
			}
		},
		async deleteBlob(pathname, url) {
			if(!pathname) return;
			const displayName = helper.getDisplayName(pathname);
			const d = this.d;
			showConfirm(`Delete "${displayName}"?`, async() => {
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
					if(d.fileSelect.dataset.value === url) {
						d.fileSelect.dataset.value = '';
						d.customSelectValue.textContent = 'Select File';
						d.jsonPre.classList.add('hidden');
						d.jsonLoader.classList.add('hidden');
						d.jsonPre.textContent = 'Select from the dropdown';
					}
					d.deletionSpinner.classList.add('hidden');
					showAlert('File deleted successfully');
				} catch(err) {
					console.error('Delete failed:', err);
					d.deletionSpinner.classList.add('hidden');
					showAlert('Delete failed: ' + err.message);
				}
			});
		},
		async deleteMultipleBlobs(files) {
			if(!files || files.length === 0) return;
			const d = this.d;
			const total = files.length;
			let completed = 0;
			let failed = [];
			const msg = `Delete ${total} file(s)?`;
			showConfirm(msg, async() => {
				d.deletionSpinner.classList.remove('hidden');
				d.deletionCount.textContent = `0 / ${total}`;
				try {
					for(const file of files) {
						try {
							await this.uploader.deleteBlob(file.pathname);
							this.cachedBlobs = this.cachedBlobs.filter(b => b.pathname !== file.pathname);
							completed++;
							d.deletionCount.textContent = `${completed} / ${total}`;
						} catch(err) {
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
					if(currentUrl) {
						const stillExists = filtered.some(b => b.url === currentUrl);
						if(!stillExists) {
							d.fileSelect.dataset.value = '';
							d.customSelectValue.textContent = 'Select File';
							d.jsonPre.classList.add('hidden');
							d.jsonLoader.classList.add('hidden');
							d.jsonPre.textContent = 'Select from the dropdown';
						}
					}
					d.deletionSpinner.classList.add('hidden');
					if(failed.length === 0) {
						showAlert(`✅ ${total} file(s) deleted successfully`);
					} else {
						showAlert(`⚠️ ${total - failed.length} succeeded, ${failed.length} failed`);
					}
				} catch(err) {
					console.error('Bulk delete error:', err);
					d.deletionSpinner.classList.add('hidden');
					showAlert('Bulk delete failed: ' + err.message);
				}
			});
		},
		populateConfig() {
			const container = d.configContainer;
			if(!container) return;
			const config = window.CONFIG;
			const keys = config.keys();
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
              <i class="fa-regular fa-floppy-disk"></i> Save
            </button>
          </td>
        </tr>`;
			});
			html += `</tbody></table>
        <div class="mt-3 flex gap-2">
          <button id="config-reset-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-[9px] border border-cyan-600/30 transition-colors">Reset to Defaults</button>
          <span id="config-status" class="text-[9px] text-cyan-300 self-center hidden"></span>
        </div>`;
			container.innerHTML = html;
			container.querySelectorAll('.config-save-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					const key = btn.dataset.key;
					const input = container.querySelector(`.config-input[data-key="${key}"]`);
					let value;
					if(input.type === 'checkbox') {
						value = input.checked;
					} else {
						const raw = input.value.trim();
						if(raw === 'true') value = true;
						else if(raw === 'false') value = false;
						else if(!isNaN(raw) && raw !== '') value = Number(raw);
						else value = raw;
					}
					const originalHtml = btn.innerHTML;
					btn.disabled = true;
					btn.classList.add('opacity-60', 'cursor-wait');
					btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';
					window.CONFIG.set(key, value);
					this.showConfigStatus(`✅ ${key} updated`);
					setTimeout(() => {
						btn.disabled = false;
						btn.classList.remove('opacity-60', 'cursor-wait');
						btn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Saved';
						setTimeout(() => {
							btn.innerHTML = originalHtml;
						}, 1500);
					}, 300);
				});
			});
			const resetBtn = container.querySelector('#config-reset-btn');
			if(resetBtn) {
				resetBtn.addEventListener('click', () => {
					window.CONFIG.reset();
					this.showConfigStatus('✅ Reset to defaults');
					this.populateConfig();
				});
			}
		},
		showConfigStatus(msg) {
			const status = d.configContainer ? .querySelector('#config-status');
			if(status) {
				status.textContent = msg;
				status.classList.remove('hidden');
				setTimeout(() => status.classList.add('hidden'), 3000);
			}
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
				window.dispatchEvent(new CustomEvent('auth:ready', {
					detail: {
						uploader
					}
				}));
			} catch(err) {
				unlockErrorMsg.textContent = err.message || 'Invalid password';
				unlockError.classList.remove('hidden');
				d.unlockPassword.select();
			} finally {
				unlockBtn.disabled = false;
				unlockBtn.innerHTML = '<i class="fa-solid fa-key"></i> Unlock';
			}
		},
		async testConnection() {
			const d = this.d;
			const conn = d.conn;
			try {
				const authKey = this.uploader.getApiKey();
				if(!authKey) throw new Error('No API key. Please unlock first.');
				const url = `${AuthModule.config.apiBase}${AuthModule.config.blobdbEndpoint}?limit=1`;
				const res = await fetch(url, {
					headers: {
						'Authorization': 'Bearer ' + authKey
					}
				});
				if(!res.ok) throw new Error('HTTP ' + res.status);
				const data = await res.json();
				conn.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
				showTestModal('✅ Connected! Store: ' + (data.storeId || 'N/A'), true);
			} catch(err) {
				conn.className = 'w-1.5 h-1.5 rounded-full bg-red-800 animate-pulse';
				showTestModal('❌ Connection failed: ' + err.message, false);
			}
		},
		lockApp() {
			AuthModule.removeKey(AuthModule.config.storageKey);
			if(this.uploader) {
				this.uploader.configure({
					apiSecretKey: null
				});
				this.cachedBlobs = null;
				this.selectedFiles = [];
				this.clearSelection();
				this.populateTable([]);
				this.renderDropdown([]);
				if(d.paginationContainer) d.paginationContainer.innerHTML = '';
				this.uploader = null;
			}
			this.showUnlockModal();
		},
		init() {
			const d = this.d;
			if(d.lockBtn) {
				d.lockBtn.addEventListener('click', () => this.lockApp());
			}
			if(d.cancelUploadBtn) {
				d.cancelUploadBtn.addEventListener('click', () => this.cancelUpload());
				d.cancelUploadBtn.classList.add('hidden');
			}
			if(d.selectAllRows) {
				d.selectAllRows.addEventListener('change', () => {
					const checkboxes = document.querySelectorAll('#file-table-body .row-selector');
					checkboxes.forEach(cb => cb.checked = d.selectAllRows.checked);
				});
			}
			if(d.deleteSelectedBtn) {
				d.deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedFiles());
			}
			d.unlockBtn.addEventListener('click', () => {
				const password = d.unlockPassword.value;
				if(password) this.handleUnlock(password);
			});
			d.unlockPassword.addEventListener('keypress', (e) => {
				if(e.key === 'Enter') {
					const password = d.unlockPassword.value;
					if(password) this.handleUnlock(password);
				}
			});
			d.testConnectionBtn.addEventListener('click', () => this.testConnection());
			const savedCategory = localStorage.getItem('uploadCategory');
			if(savedCategory) {
				d.uploadCategoryInput.value = savedCategory;
			} else {
				d.uploadCategoryInput.value = window.CONFIG.defaultCategory;
				localStorage.setItem('uploadCategory', window.CONFIG.defaultCategory);
			}
			d.uploadCategoryInput.addEventListener('change', () => {
				localStorage.setItem('uploadCategory', d.uploadCategoryInput.value.trim());
				if(this.cachedBlobs) {
					this.currentPage = 1;
					const filtered = this.getFilteredBlobs();
					const pageItems = this.getCurrentPageItems();
					this.renderDropdown(pageItems);
					this.populateTable(pageItems);
					this.renderPagination();
				}
			});
			if(d.exitBtn) {
				d.exitBtn.addEventListener('click', () => {
					this.lockApp();
					window.location.href = 'login.html';
				});
			}
			window.addEventListener('auth:ready', (e) => {
				this.uploader = e.detail.uploader;
			});
			const storedKey = AuthModule.getStoredKey(AuthModule.config.storageKey);
			if(storedKey) {
				const uploader = jsonBlobUploader;
				uploader.configure({
					apiSecretKey: storedKey,
					storageKey: AuthModule.config.storageKey
				});
				this.uploader = uploader;
				window.dispatchEvent(new CustomEvent('auth:ready', {
					detail: {
						uploader
					}
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
				if(!d.fileSelect.contains(e.target)) {
					d.fileSelect.classList.remove('open');
					optionsContainer.classList.add('hidden');
				}
			});
			d.fileSelect.addEventListener('change', async() => {
				const selectedUrl = d.fileSelect.dataset.value;
				if(!selectedUrl) return;
				if(!this.uploader) {
					console.error('Uploader not initialised');
					return;
				}
				d.jsonPre.classList.add('hidden');
				d.jsonLoader.classList.remove('hidden');
				try {
					const data = await this.uploader.readJsonInWorker(selectedUrl);
					d.jsonPre.textContent = JSON.stringify(Object.keys(data), null, 2);
					d.jsonPre.classList.remove('hidden');
					d.jsonLoader.classList.add('hidden');
				} catch(err) {
					console.error('Failed to load selected file:', err);
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
				if(files.length > 0) {
					this.selectedFiles = Array.from(files);
					this.updateFileDisplay(this.selectedFiles[0]);
					d.uploadBtn.disabled = false;
				}
			});
			d.fileInput.addEventListener('change', () => {
				if(d.fileInput.files.length > 0) {
					this.selectedFiles = Array.from(d.fileInput.files);
					this.updateFileDisplay(this.selectedFiles[0]);
					d.uploadBtn.disabled = false;
				} else {
					this.clearSelection();
				}
			});
			d.uploadBtn.addEventListener('click', () => this.handleUpload());
			d.clearBtn.addEventListener('click', () => this.clearSelection());
			d.refreshBtn.addEventListener('click', () => {
				this.populateFileSelect();
			});
			const tableHeaders = document.querySelectorAll('#file-table thead th[data-sort]');
			tableHeaders.forEach(th => {
				th.addEventListener('click', () => {
					const column = th.dataset.sort;
					if(this.sortColumn === column) {
						this.sortAsc = !this.sortAsc;
					} else {
						this.sortColumn = column;
						this.sortAsc = true;
					}
					if(this.cachedBlobs) {
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
					if(btn === tabBtn) {
						btn.className = `tab-btn ${common} ${active}`;
						if(icon) icon.classList.add('text-cyan-300');
					} else {
						btn.className = `tab-btn ${common} ${inactive}`;
						if(icon) icon.classList.remove('text-cyan-300');
					}
				});
				document.querySelectorAll('#tab-container > div').forEach(p => p.classList.add('hidden'));
				const paneId = 'tab-pane-' + tabBtn.id.replace('tab-', '');
				document.getElementById(paneId).classList.remove('hidden');
				if(paneId === 'tab-pane-config') {
					this.populateConfig();
				}
			};
			document.querySelectorAll('#tab-bar .tab-btn').forEach(btn => btn.addEventListener('click', () => setActiveTab(btn)));
			const defaultTab = d.tabCode;
			if(defaultTab) setActiveTab(defaultTab);
			d.uploadBtn.disabled = true;
		}
	};
	window.ui = ui;
	ui.init();
})();
