// helper.js
(function() {
  'use strict';
  
  const helper = {
    
    // Format file size (B, KB, MB, GB)
    fmtSizes(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    },
    
    fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1000;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return value.toFixed(1) + ' ' + sizes[i];
},
    
    // Format timestamp to YYYY-MM-DD HH:mm
    fmtDate(ts) {
      if (!ts) return '—';
      const d = new Date(ts);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    
    // Format timestamp to YYYYMMDD (for filename prefix)
    fmtDates(ts) {
      if (!ts) return '—';
      const d = new Date(ts);
      const pad = n => String(n).padStart(2, '0');
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    },
    
    // Strip Vercel Blob random suffix from a pathname
    getDisplayName(pathname) {
      const fullName = pathname.split('/').pop();
      const lastDot = fullName.lastIndexOf('.');
      if (lastDot === -1) return fullName;
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
    
    // Generic pad (if needed elsewhere)
    pad(n, len = 2) {
      return String(n).padStart(len, '0');
    }
  };
  
  window.helper = helper;
})();
