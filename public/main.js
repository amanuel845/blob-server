  (function() {
    'use strict';

    const d = window.dom;

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

function showTestModal(message, isSuccess = true) {
  const el = d.testModal;
  const icon = d.testModalIcon.querySelector('i');
  const msgEl = d.testModalMessage;

  msgEl.textContent = message;
  icon.className = isSuccess ? 'fa-regular fa-circle-check' : 'fa-solid fa-triangle-exclamation';
  // Optional: change icon color via parent or inline style
  // We can set a class on the icon's parent
  const iconContainer = d.testModalIcon;
  if (isSuccess) {
    iconContainer.style.color = '#34d399'; // emerald-400
  } else {
    iconContainer.style.color = '#f87171'; // red-400
  }

  el.classList.remove('hidden', 'opacity-0');
  el.classList.add('flex', 'opacity-100');
  const box = el.querySelector('.modal-box');
  if (box) {
    box.classList.remove('scale-95', 'translate-y-2');
    box.classList.add('scale-100', 'translate-y-0');
  }

  // Set OK button to close
  d.testModalOkBtn.onclick = function() {
    closeTestModal();
  };
  // Click outside to close
  el.onclick = function(e) {
    if (e.target === el) {
      closeTestModal();
    }
  };
}
    // ---- Custom modal functions ----
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
        if (cb) cb();
      };
      el.onclick = function(e) {
        if (e.target === el) {
          closeAlert();
          if (cb) cb();
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
        if (onCancel) onCancel();
      };
      d.confirmOkBtn.onclick = function() {
        closeConfirm();
        if (onConfirm) onConfirm();
      };
      el.onclick = function(e) {
        if (e.target === el) {
          closeConfirm();
          if (onCancel) onCancel();
        }
      };
    }

    window.closeAlert = closeAlert;
    window.closeConfirm = closeConfirm;
    window.showAlert = showAlert;
    window.showConfirm = showConfirm;

    // ---- UI Logic ----
    const UPLOAD_CATEGORY = 'json/tiktok';

    const ui = {
      uploader: null,
      selectedFiles: [],
      sortColumn: 'name',     // 'name' or 'size'
      sortAsc: true,
      cachedBlobs: null,      // store raw blobs for sorting

      get selectedFile() { return this.selectedFiles[0] || null; },
      set selectedFile(file) { this.selectedFiles = file ? [file] : []; },

      get d() { return window.dom; },

      // ---- File display ----
      updateFileDisplay(file) {
        const d = this.d;

        if (this.selectedFiles.length > 1) {
          d.fileName.textContent = `${this.selectedFiles.length} files selected`;
          const totalSize = this.selectedFiles.reduce((sum, f) => sum + f.size, 0);
          d.fileDetails.textContent = `Total: ${helper.fmtSize(totalSize)}`;
          d.fileType.textContent = '';
          d.fileDate.textContent = '';
          return;
        }

        if (!file) {
          d.fileName.textContent = 'Drag & drop tiktok json here';
          d.fileDetails.textContent = 'or click to select files';
          d.fileType.textContent = 'file type';
          d.fileDate.textContent = 'last modified date';
          return;
        }

        d.fileName.textContent = file.name;
        d.fileType.textContent = file.type || 'unknown type';
        d.fileDetails.textContent = helper.fmtSize(file.size);
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
      },

      setProgress(percent) {
        const d = this.d;
        d.uploadProgress.classList.remove('hidden');
        d.progressBar.style.width = percent + '%';
        d.progressText.textContent = percent + '%';
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
      },

      // ---- Sorting helpers ----
      sortBlobs(blobs) {
        if (!blobs || blobs.length === 0) return blobs;
        const sorted = [...blobs];
        const column = this.sortColumn;
        const asc = this.sortAsc;

        sorted.sort((a, b) => {
          let valA, valB;
          if (column === 'name') {
            valA = helper.getDisplayName(a.pathname);
            valB = helper.getDisplayName(b.pathname);
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

      updateSortIndicators() {
        const headers = document.querySelectorAll('#file-table thead th[data-sort]');
        headers.forEach(th => {
          const arrow = th.querySelector('.sort-arrow');
          if (!arrow) return;
          const column = th.dataset.sort;
          if (column === this.sortColumn) {
            arrow.textContent = this.sortAsc ? '▲' : '▼';
          } else {
            arrow.textContent = '';
          }
        });
      },

      // ---- Batch upload ----
      async uploadFiles(files, onProgress, categories) {
        if (!files || !files.length) {
          return { success: 0, total: 0, failed: [] };
        }

        const total = files.length;
        let completed = 0;
        let failed = [];
        const d = this.d;

        d.totalFileCount.textContent = total.toString();
        const defaultCategory = d.uploadCategoryInput.value.trim() || UPLOAD_CATEGORY;

        if (!categories || !Array.isArray(categories) || categories.length !== total) {
          categories = files.map(() => defaultCategory);
        }

        d.uploadBtn.disabled = true;
        d.clearBtn.disabled = true;
        this.setProgress(0);
        d.speedText.textContent = '0';

        try {
          for (let i = 0; i < total; i++) {
            const file = files[i];
            const category = categories[i] || defaultCategory;

            d.currentFileCount.textContent = (i + 1).toString();

            let fileToUpload = file;
            const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
            if (isJson) {
              let customName = d.filePrefix.value.trim();
              if (customName && !customName.toLowerCase().endsWith('.json')) customName += '.json';
              const finalName = customName || file.name;
              if (finalName !== file.name) {
                fileToUpload = new File([file], finalName, {
                  type: file.type,
                  lastModified: file.lastModified,
                });
              }
            }

            try {
              const result = await this.uploader.uploadFileSmart(
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
                { size: fileToUpload.size, name: fileToUpload.name, type: fileToUpload.type }
              );
              completed++;
              console.log(`Uploaded ${file.name}:`, result);
            } catch (err) {
              console.error(`Failed to upload ${file.name}:`, err);
              failed.push({ name: file.name, error: err.message });
            }
          }

          const finalResult = { success: completed, total, failed };
          this.setProgress(100);
          d.speedText.textContent = '0';
          d.currentFileCount.textContent = '0';
          d.totalFileCount.textContent = '0';

          if (failed.length === 0) {
            showAlert(`✅ ${completed} file(s) uploaded successfully`);
          } else {
            showAlert(`⚠️ ${completed} succeeded, ${failed.length} failed`);
          }

          setTimeout(() => this.clearSelection(), 1500);
          this.populateFileSelect();
          return finalResult;

        } catch (err) {
          console.error('Upload error:', err);
          showAlert('Upload failed: ' + err.message);
          throw err;
        } finally {
          d.uploadBtn.disabled = false;
          d.clearBtn.disabled = false;
        }
      },

      async uploadSelectedFiles(onProgress) {
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
          showAlert('No files selected');
          return { success: 0, total: 0, failed: [] };
        }
        return this.uploadFiles(this.selectedFiles.slice(), onProgress);
      },

      async handleUpload() {
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
          showAlert('No file selected');
          return;
        }
        if (!this.uploader) {
          showAlert('Uploader not initialised. Unlock first.');
          return;
        }
        await this.uploadSelectedFiles();
      },

      // ---- Populate dropdown & table ----
      async populateFileSelect() {
        const d = this.d;
        if (!this.uploader) return;

        if (d.fileSelect) {
          const valueSpan = d.customSelectValue;
          const optionsContainer = d.customSelectOptions;
          valueSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Loading…';
          d.fileSelect.classList.add('disabled');
          optionsContainer.innerHTML = '<div class="custom-select-option disabled">Loading files…</div>';

          try {
            const blobs = await this.uploader.listBlobs();
            this.cachedBlobs = blobs; // store for sorting

            if (d.conn) d.conn.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
            

            optionsContainer.innerHTML = '';
            blobs.forEach(blob => {
              const option = document.createElement('div');
              option.className = 'custom-select-option';
              option.dataset.value = blob.url;
              option.dataset.pathname = blob.pathname;
              option.textContent = helper.getDisplayName(blob.pathname);
              option.addEventListener('click', () => {
                valueSpan.textContent = option.textContent;
                d.fileSelect.dataset.value = blob.url;
                d.fileSelect.classList.remove('open');
                optionsContainer.classList.add('hidden');
                const event = new CustomEvent('change');
                d.fileSelect.dispatchEvent(event);
              });
              optionsContainer.appendChild(option);
            });

            if (blobs.length === 0) valueSpan.textContent = 'No files';
            else valueSpan.textContent = 'Select File';
            d.fileSelect.classList.remove('disabled');

            this.populateTable(blobs);

          } catch (err) {
            console.error('Failed to load file list:', err);
            if (d.conn) d.conn.className = 'w-1.5 h-1.5 rounded-full bg-red-800 animate-pulse';
            
            valueSpan.textContent = '❌ Error';
            optionsContainer.innerHTML = `<div class="custom-select-option disabled">${err.message}</div>`;
            d.fileSelect.classList.remove('disabled');
            if (d.fileTableBody) {
              d.fileTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-400 py-2">${err.message}</td></tr>`;
            }
          }
        }
      },

      populateTable(blobs) {
        const d = this.d;
        const tbody = d.fileTableBody;
        const emptyMsg = d.fileTableEmpty;
        if (!tbody) return;

        if (!blobs || blobs.length === 0) {
          tbody.innerHTML = '';
          if (emptyMsg) emptyMsg.style.display = 'block';
          return;
        }
        if (emptyMsg) emptyMsg.style.display = 'none';

        // Sort the blobs
        const sorted = this.sortBlobs(blobs);

        tbody.innerHTML = '';
        sorted.forEach(blob => {
          const tr = document.createElement('tr');
          const displayName = helper.getDisplayName(blob.pathname);

          const tdName = document.createElement('td');
          tdName.className = 'truncate';
          tdName.textContent = displayName;
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
          btnDownload.addEventListener('click', () => { window.open(blob.url, '_blank'); });
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
      },

      async loadFile(url) {
        const d = this.d;
        if (!url) return;
        const codeTab = d.tabCode;
        if (codeTab) codeTab.click();

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
        } catch (err) {
          console.error('Failed to load file:', err);
          d.jsonLoader.classList.add('hidden');
          d.jsonPre.classList.remove('hidden');
          d.jsonPre.textContent = 'Error loading file: ' + err.message;
        }
      },

      async deleteBlob(pathname, url) {
        if (!pathname) return;
        const displayName = helper.getDisplayName(pathname);
        showConfirm(`Delete "${displayName}"?`, async () => {
          d.deletionSpinner.classList.remove("hidden");
          try {
            await this.uploader.deleteBlob(pathname);
            await this.populateFileSelect();
            const d = this.d;
            if (d.fileSelect.dataset.value === url) {
              d.jsonPre.classList.add('hidden');
              d.jsonLoader.classList.add('hidden');
              d.jsonPre.textContent = 'Select from the dropdown';
              d.fileSelect.dataset.value = '';
              d.customSelectValue.textContent = 'Select File';
            }
            d.deletionSpinner.classList.add("hidden");
            showAlert('File deleted successfully');
          } catch (err) {
            console.error('Delete failed:', err);
            showAlert('Delete failed: ' + err.message);
          }
        });
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

      async testConnection() {
  const d = this.d;
  const conn = d.conn;
  try {
    const authKey = this.uploader.getApiKey();
    if (!authKey) throw new Error('No API key. Please unlock first.');
    const url = `${AuthModule.config.apiBase}${AuthModule.config.blobdbEndpoint}?limit=1`;
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + authKey }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    conn.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
    showTestModal('✅ Connected! Store: ' + (data.storeId || 'N/A'), true);
  } catch (err) {
    conn.className = 'w-1.5 h-1.5 rounded-full bg-red-800 animate-pulse';
    showTestModal('❌ Connection failed: ' + err.message, false);
  }
},

      // ---- Init ----
      init() {
        const d = this.d;

        d.unlockBtn.addEventListener('click', () => {
          const password = d.unlockPassword.value;
          if (password) this.handleUnlock(password);
        });
        d.unlockPassword.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const password = d.unlockPassword.value;
            if (password) this.handleUnlock(password);
          }
        });
        d.testConnectionBtn.addEventListener('click', () => this.testConnection());

        const savedCategory = localStorage.getItem('uploadCategory');
  if (savedCategory) {
    d.uploadCategoryInput.value = savedCategory;
  } else {
    // Set default and save
    d.uploadCategoryInput.value = 'json/tiktok';
    localStorage.setItem('uploadCategory', 'json/tiktok');
  }
        d.uploadCategoryInput.addEventListener('change', () => {
    localStorage.setItem('uploadCategory', d.uploadCategoryInput.value.trim());
  });

        window.addEventListener('auth:ready', (e) => {
          this.uploader = e.detail.uploader;
          this.populateFileSelect();
        });

        const storedKey = AuthModule.getStoredKey(AuthModule.config.storageKey);
        if (storedKey) {
          const uploader = jsonBlobUploader;
          uploader.configure({
            apiSecretKey: storedKey,
            storageKey: AuthModule.config.storageKey
          });
          this.uploader = uploader;
          window.dispatchEvent(new CustomEvent('auth:ready', { detail: { uploader } }));
        } else {
          this.showUnlockModal();
        }

        // ---- Custom select ----
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
          if (!selectedUrl) return;
          if (!this.uploader) {
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
          } catch (err) {
            console.error('Failed to load selected file:', err);
            d.jsonLoader.classList.add('hidden');
            d.jsonPre.classList.remove('hidden');
            d.jsonPre.textContent = 'Error loading file: ' + err.message;
          }
        });

        // ---- Drag & drop ----
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

        d.uploadBtn.addEventListener('click', () => this.handleUpload());
        d.clearBtn.addEventListener('click', () => this.clearSelection());

        d.refreshBtn.addEventListener('click', () => {
          this.populateFileSelect();
        });

        // ---- Table sorting ----
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
            // Re‑render the table with the cached blobs (if available)
            if (this.cachedBlobs) {
              this.populateTable(this.cachedBlobs);
            } else {
              // fallback – fetch again (should not happen)
              this.populateFileSelect();
            }
          });
        });

        // ---- Tabs ----
        const setActiveTab = (tabBtn) => {
          const common = 'flex-1 text-center py-0.5 text-[9px] transition-colors';
          const active = 'text-white border-b-[1.5px] border-cyan-400 font-medium';
          const inactive = 'text-white/60 border-b-[1.5px] border-transparent hover:text-white hover:border-cyan-400/50';
          document.querySelectorAll('#tab-bar .tab-btn').forEach(btn => {
            const icon = btn.querySelector('i');
            if (btn === tabBtn) {
              btn.className = `tab-btn ${common} ${active}`;
              if (icon) icon.classList.add('text-cyan-300');
            } else {
              btn.className = `tab-btn ${common} ${inactive}`;
              if (icon) icon.classList.remove('text-cyan-300');
            }
          });
          document.querySelectorAll('#tab-container > div').forEach(p => p.classList.add('hidden'));
          const paneId = 'tab-pane-' + tabBtn.id.replace('tab-', '');
          document.getElementById(paneId).classList.remove('hidden');
        };
        document.querySelectorAll('#tab-bar .tab-btn').forEach(btn => btn.addEventListener('click', () => setActiveTab(btn)));

        const defaultTab = d.tabCode;
        if (defaultTab) setActiveTab(defaultTab);

        d.uploadBtn.disabled = true;
      }
    };

    window.ui = ui;
    ui.init();
  })();
