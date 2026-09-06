// helper.js
(function() {
  'use strict';

  const helper = {

    // Format file size (binary units) – kept for compatibility
    fmtSizes(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    },

    // Format file size (decimal units) – used in UI
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

    // Get Font Awesome icon class for a file based on its extension
    getFileIcon(pathname) {
      const ext = pathname.split('.').pop().toLowerCase();
      const map = {
        // Images
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image',
        'gif': 'fa-file-image',
        'webp': 'fa-file-image',
        'svg': 'fa-file-image',
        'bmp': 'fa-file-image',
        'ico': 'fa-file-image',
        'tiff': 'fa-file-image',
        // Videos
        'mp4': 'fa-file-video',
        'webm': 'fa-file-video',
        'ogg': 'fa-file-video',
        'avi': 'fa-file-video',
        'mov': 'fa-file-video',
        'mkv': 'fa-file-video',
        'flv': 'fa-file-video',
        'wmv': 'fa-file-video',
        // Audio
        'mp3': 'fa-file-audio',
        'wav': 'fa-file-audio',
        'flac': 'fa-file-audio',
        'aac': 'fa-file-audio',
        'ogg': 'fa-file-audio',
        'wma': 'fa-file-audio',
        // Documents
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
        // Archives
        'zip': 'fa-file-archive',
        'rar': 'fa-file-archive',
        '7z': 'fa-file-archive',
        'tar': 'fa-file-archive',
        'gz': 'fa-file-archive',
        // Data
        'json': 'fa-file-code',
        'xml': 'fa-file-code',
        'csv': 'fa-file-csv',
        'txt': 'fa-file-lines',
        'md': 'fa-file-lines',
        // Code
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
    
    // helper.js – add these methods

// Sort blobs by name or size
sortBlobs(blobs, column, asc) {
    if (!blobs || blobs.length === 0) return blobs;
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
  
  // Filter blobs by category (if filterEnabled)
  filterBlobs(blobs, category, filterEnabled) {
    if (!blobs) return [];
    if (!filterEnabled) return blobs;
    return blobs.filter(blob => blob.pathname.startsWith(`uploads/${category}/`));
  },
  
  // Get current page items
  getPageItems(blobs, page, pageSize) {
    if (!blobs) return { items: [], totalPages: 1 };
    const totalPages = Math.ceil(blobs.length / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: blobs.slice(start, end),
      totalPages,
    };
  },

    // Generic pad (if needed elsewhere)
    pad(n, len = 2) {
      return String(n).padStart(len, '0');
    }
  };

  window.helper = helper;
})();
