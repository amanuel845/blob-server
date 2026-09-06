// config.js
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
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load config from localStorage', e);
    }
    return { ...DEFAULTS };
  }
  
  const _data = loadFromStorage();
  
  function persist() {
    try {
      localStorage.setItem('app-config', JSON.stringify(_data));
    } catch (e) {
      console.warn('Failed to save config to localStorage', e);
    }
  }
  
  const CONFIG = {
    
    get(key) {
      if (key in _data) return _data[key];
      console.warn(`Config key "${key}" not found.`);
      return undefined;
    },
    
    set(key, value) {
      if (key in _data) {
        _data[key] = value;
        persist();
        document.dispatchEvent(new CustomEvent('configChanged', { detail: { key, value } }));
      } else {
        console.warn(`Config key "${key}" not found. Cannot set.`);
      }
    },
    
    get apiBase() { return this.get('apiBase'); },
    set apiBase(val) { this.set('apiBase', val); },
    
    get blobdbEndpoint() { return this.get('blobdbEndpoint'); },
    set blobdbEndpoint(val) { this.set('blobdbEndpoint', val); },
    
    get encryptedKeyEndpoint() { return this.get('encryptedKeyEndpoint'); },
    set encryptedKeyEndpoint(val) { this.set('encryptedKeyEndpoint', val); },
    
    get storageKey() { return this.get('storageKey'); },
    set storageKey(val) { this.set('storageKey', val); },
    
    get defaultCategory() { return this.get('defaultCategory'); },
    set defaultCategory(val) { this.set('defaultCategory', val); },
    
    get uploadThreshold() { return this.get('uploadThreshold'); },
    set uploadThreshold(val) { this.set('uploadThreshold', val); },
    
    get smoothingFactor() { return this.get('smoothingFactor'); },
    set smoothingFactor(val) { this.set('smoothingFactor', val); },
    
    get filterEnabled() { return this.get('filterEnabled'); },
    set filterEnabled(val) { this.set('filterEnabled', val); },
    
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