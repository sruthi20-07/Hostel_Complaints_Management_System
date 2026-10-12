/**
 * FIX MY HOSTEL — Complaints Module (complaints.js)
 * Handles submission, duplicate checks, filtering, searching, sorting,
 * rendering cards, detail modal, and student reopen workflow.
 */
class ComplaintsController {
  constructor() {
    this.currentFilters = {
      search: '',
      status: 'ALL',
      category: 'ALL',
      priority: 'ALL',
      block: 'ALL',
      sortBy: 'newest'
    };

    this.pendingImageBase64 = null;
    this.duplicateWarningAcknowledged = false;
  }

  init() {
    this.bindSubmissionForm();
    this.bindFilterControls();
  }

  // --- Form Bindings & Handlers ---

  bindSubmissionForm() {
    const form = document.getElementById('complaint-form');
    if (!form) return;

    const titleInput = document.getElementById('complaint-title');
    const titleCount = document.getElementById('title-char-count');
    const descInput = document.getElementById('complaint-desc');
    const descCount = document.getElementById('desc-char-count');
    const commonAreaCheck = document.getElementById('complaint-common-area');
    const roomInput = document.getElementById('complaint-room');
    const imageInput = document.getElementById('complaint-image');
    const prioritySelect = document.getElementById('complaint-priority');
    const emergencyWarning = document.getElementById('form-emergency-warning');

    // Live character counts
    if (titleInput && titleCount) {
      titleInput.addEventListener('input', () => {
        titleCount.textContent = `${titleInput.value.length} / 120`;
      });
    }

    if (descInput && descCount) {
      descInput.addEventListener('input', () => {
        descCount.textContent = `${descInput.value.length} / 1000`;
      });
    }

    // Common area toggle changes room requirements
    if (commonAreaCheck && roomInput) {
      commonAreaCheck.addEventListener('change', () => {
        if (commonAreaCheck.checked) {
          roomInput.placeholder = "e.g., Common Washroom, TV Hall, Corridor";
          const labelStar = document.getElementById('room-required-star');
          if (labelStar) labelStar.style.display = 'none';
        } else {
          roomInput.placeholder = "e.g., B-214";
          const labelStar = document.getElementById('room-required-star');
          if (labelStar) labelStar.style.display = 'inline';
        }
      });
    }

    // Priority change: show emergency alert callout if emergency
    if (prioritySelect && emergencyWarning) {
      prioritySelect.addEventListener('change', () => {
        if (prioritySelect.value === 'Emergency') {
          emergencyWarning.style.display = 'block';
        } else {
          emergencyWarning.style.display = 'none';
        }
      });
    }

    // Image file preview
    if (imageInput) {
      imageInput.addEventListener('change', e => {
        const file = e.target.files[0];
        const previewContainer = document.getElementById('image-preview-box');
        const previewImg = document.getElementById('image-preview-thumb');
        const previewName = document.getElementById('image-preview-name');

        if (!file) {
          this.pendingImageBase64 = null;
          if (previewContainer) previewContainer.style.display = 'none';
          return;
        }

        const validation = Validator.validateImageFile(file);
        if (!validation.isValid) {
          alert(validation.error);
          imageInput.value = '';
          this.pendingImageBase64 = null;
          if (previewContainer) previewContainer.style.display = 'none';
          return;
        }

        const reader = new FileReader();
        reader.onload = evt => {
          this.pendingImageBase64 = evt.target.result;
          if (previewContainer && previewImg && previewName) {
            previewImg.src = evt.target.result;
            previewName.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
            previewContainer.style.display = 'flex';
          }
        };
        reader.readAsDataURL(file);
      });

      const removeImageBtn = document.getElementById('btn-remove-image');
      if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
          imageInput.value = '';
          this.pendingImageBase64 = null;
          const previewContainer = document.getElementById('image-preview-box');
          if (previewContainer) previewContainer.style.display = 'none';
        });
      }
    }

    // Submit handler
    form.addEventListener('submit', e => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Reset Form button
    const resetBtn = document.getElementById('btn-reset-form');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetForm();
      });
    }
  }

  handleFormSubmit() {
    const title = document.getElementById('complaint-title').value.trim();
    const category = document.getElementById('complaint-category').value;
    const block = document.getElementById('complaint-block').value;
    const floor = document.getElementById('complaint-floor').value;
    const room = document.getElementById('complaint-room').value.trim();
    const isCommonArea = document.getElementById('complaint-common-area').checked;
    const description = document.getElementById('complaint-desc').value.trim();
    const priority = document.getElementById('complaint-priority').value;

    const formData = {
      title,
      category,
      block,
      floor,
      room,
      isCommonArea,
      description,
      priority
    };

    // 1. Validation
    const validation = Validator.validateComplaintForm(formData);
    this.displayFormErrors(validation.errors);

    if (!validation.isValid) {
      window.app.showToast("Please fix the validation errors in the form.", "error");
      return;
    }

    // 2. Duplicate Detection
    if (!this.duplicateWarningAcknowledged) {
      const existingComplaints = window.storageManager.getComplaints();
      const duplicateCheck = Validator.checkForDuplicates(formData, existingComplaints);

      if (duplicateCheck.hasDuplicate) {
        this.showDuplicateWarning(duplicateCheck.duplicates[0], formData);
        return;
      }
    }

    // 3. Confirmation Dialog
    this.showConfirmationModal(formData);
  }

  displayFormErrors(errors) {
    const fields = ['title', 'category', 'block', 'floor', 'room', 'description', 'priority'];
    fields.forEach(field => {
      const inputEl = document.getElementById(`complaint-${field}`);
      const errEl = document.getElementById(`error-${field}`);
      if (inputEl) {
        if (errors[field]) {
          inputEl.classList.add('is-invalid');
          if (errEl) {
            errEl.textContent = errors[field];
            errEl.style.display = 'block';
          }
        } else {
          inputEl.classList.remove('is-invalid');
          if (errEl) {
            errEl.textContent = '';
            errEl.style.display = 'none';
          }
        }
      }
    });
  }

  showDuplicateWarning(existing, newFormData) {
    const banner = document.getElementById('duplicate-warning-banner');
    const existingRef = document.getElementById('duplicate-existing-ref');
    const proceedBtn = document.getElementById('btn-duplicate-proceed');
    const viewExistingBtn = document.getElementById('btn-duplicate-view');

    if (!banner) return;

    if (existingRef) {
      existingRef.innerHTML = `<strong>${Validator.escapeHtml(existing.id)}</strong>: "${Validator.escapeHtml(existing.title)}" (${Validator.escapeHtml(existing.block)} - ${Validator.escapeHtml(existing.room || existing.floor)})`;
    }

    banner.classList.add('show');

    if (proceedBtn) {
      proceedBtn.onclick = () => {
        this.duplicateWarningAcknowledged = true;
        banner.classList.remove('show');
        this.showConfirmationModal(newFormData);
      };
    }

    if (viewExistingBtn) {
      viewExistingBtn.onclick = () => {
        this.openComplaintDetail(existing.id);
      };
    }
  }

  showConfirmationModal(formData) {
    const modal = document.getElementById('confirm-submission-modal');
    const detailsContainer = document.getElementById('confirm-modal-details');
    const submitBtn = document.getElementById('btn-confirm-submit');

    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <div style="background-color: var(--color-bg-subtle); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
          <div style="margin-bottom: 0.5rem;"><strong>Title:</strong> ${Validator.escapeHtml(formData.title)}</div>
          <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <span><strong>Category:</strong> ${Validator.escapeHtml(formData.category)}</span>
            <span><strong>Priority:</strong> <span class="badge badge-priority-${formData.priority.toLowerCase()}">${Validator.escapeHtml(formData.priority)}</span></span>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <strong>Location:</strong> ${Validator.escapeHtml(formData.block)}, ${Validator.escapeHtml(formData.floor)} ${formData.room ? ' - Room ' + Validator.escapeHtml(formData.room) : '(Common Area)'}
          </div>
          <div style="margin-top: 0.5rem; font-size: 0.82rem; color: var(--color-text-secondary);">
            <strong>Description:</strong> ${Validator.escapeHtml(formData.description)}
          </div>
        </div>
      `;
    }

    window.app.openModal('confirm-submission-modal');

    if (submitBtn) {
      submitBtn.onclick = () => {
        this.finalizeSubmission(formData);
        window.app.closeModal('confirm-submission-modal');
      };
    }
  }

  finalizeSubmission(formData) {
    const newId = window.storageManager.generateComplaintId();
    const userProfile = window.storageManager.getUserProfile();
    const now = new Date().toISOString();

    const newRecord = {
      id: newId,
      title: formData.title,
      category: formData.category,
      block: formData.block,
      floor: formData.floor,
      room: formData.room || (formData.isCommonArea ? "Common Area" : "N/A"),
      isCommonArea: formData.isCommonArea,
      description: formData.description,
      priority: formData.priority,
      status: "Submitted",
      submittedBy: {
        name: userProfile.name || "Student",
        studentId: userProfile.studentId || "Hosteller",
        room: userProfile.room || "Room",
        phone: userProfile.phone || ""
      },
      createdAt: now,
      updatedAt: now,
      assignedTo: null,
      estimatedCompletion: null,
      resolutionNotes: null,
      resolvedAt: null,
      upvotes: 0,
      upvotedBy: [],
      isDuplicateOf: null,
      history: [
        {
          timestamp: now,
          action: "Complaint Logged",
          status: "Submitted",
          actor: `${userProfile.name} (${userProfile.studentId})`,
          note: formData.priority === 'Emergency' ? 'Urgent hazard reported by student.' : 'Submitted via Fix My Hostel portal.',
          isPublic: true
        }
      ],
      publicUpdates: [],
      internalNotes: [],
      imageAttachment: this.pendingImageBase64
    };

    window.storageManager.addComplaint(newRecord);
    this.resetForm();

    // Show Success feedback with link
    window.app.showToast(`Complaint ${newId} submitted successfully!`, "success");
    window.app.refreshAllViews();

    // Navigate to My Complaints and open details
    window.app.navigateTo('my-complaints');
    this.openComplaintDetail(newId);
  }

  resetForm() {
    const form = document.getElementById('complaint-form');
    if (form) form.reset();

    const titleCount = document.getElementById('title-char-count');
    if (titleCount) titleCount.textContent = '0 / 120';

    const descCount = document.getElementById('desc-char-count');
    if (descCount) descCount.textContent = '0 / 1000';

    const warningBanner = document.getElementById('duplicate-warning-banner');
    if (warningBanner) warningBanner.classList.remove('show');

    const emergencyWarning = document.getElementById('form-emergency-warning');
    if (emergencyWarning) emergencyWarning.style.display = 'none';

    const previewContainer = document.getElementById('image-preview-box');
    if (previewContainer) previewContainer.style.display = 'none';

    this.pendingImageBase64 = null;
    this.duplicateWarningAcknowledged = false;
    this.displayFormErrors({});
  }

  // --- Filtering & Searching Bindings ---

  bindFilterControls() {
    const searchInput = document.getElementById('search-complaints-input');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const statusSelect = document.getElementById('filter-status-select');
    const categorySelect = document.getElementById('filter-category-select');
    const prioritySelect = document.getElementById('filter-priority-select');
    const blockSelect = document.getElementById('filter-block-select');
    const sortSelect = document.getElementById('sort-complaints-select');
    const clearAllFiltersBtn = document.getElementById('btn-clear-all-filters');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.currentFilters.search = searchInput.value.trim();
        if (clearSearchBtn) {
          if (this.currentFilters.search.length > 0) {
            clearSearchBtn.classList.add('show');
          } else {
            clearSearchBtn.classList.remove('show');
          }
        }
        this.renderComplaintsList();
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.currentFilters.search = '';
        clearSearchBtn.classList.remove('show');
        this.renderComplaintsList();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        this.currentFilters.status = statusSelect.value;
        this.renderComplaintsList();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        this.currentFilters.category = categorySelect.value;
        this.renderComplaintsList();
      });
    }

    if (prioritySelect) {
      prioritySelect.addEventListener('change', () => {
        this.currentFilters.priority = prioritySelect.value;
        this.renderComplaintsList();
      });
    }

    if (blockSelect) {
      blockSelect.addEventListener('change', () => {
        this.currentFilters.block = blockSelect.value;
        this.renderComplaintsList();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.currentFilters.sortBy = sortSelect.value;
        this.renderComplaintsList();
      });
    }

    if (clearAllFiltersBtn) {
      clearAllFiltersBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  }

  clearAllFilters() {
    this.currentFilters = {
      search: '',
      status: 'ALL',
      category: 'ALL',
      priority: 'ALL',
      block: 'ALL',
      sortBy: 'newest'
    };

    const searchInput = document.getElementById('search-complaints-input');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const statusSelect = document.getElementById('filter-status-select');
    const categorySelect = document.getElementById('filter-category-select');
    const prioritySelect = document.getElementById('filter-priority-select');
    const blockSelect = document.getElementById('filter-block-select');
    const sortSelect = document.getElementById('sort-complaints-select');

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.remove('show');
    if (statusSelect) statusSelect.value = 'ALL';
    if (categorySelect) categorySelect.value = 'ALL';
    if (prioritySelect) prioritySelect.value = 'ALL';
    if (blockSelect) blockSelect.value = 'ALL';
    if (sortSelect) sortSelect.value = 'newest';

    this.renderComplaintsList();
    window.app.showToast("All filters cleared", "info");
  }

  getFilteredComplaints() {
    let list = window.storageManager.getComplaints();
    const { search, status, category, priority, block, sortBy } = this.currentFilters;

    // Search query filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.room && c.room.toLowerCase().includes(q)) ||
        (c.block && c.block.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (status && status !== 'ALL') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    // Category filter
    if (category && category !== 'ALL') {
      list = list.filter(c => c.category === category);
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      list = list.filter(c => c.priority === priority);
    }

    // Block filter
    if (block && block !== 'ALL') {
      list = list.filter(c => c.block === block);
    }

    // Sorting
    const priorityWeight = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority') {
        const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    return list;
  }

  // --- Rendering Complaints List ---

  renderComplaintsList() {
    const container = document.getElementById('my-complaints-list');
    const countBadge = document.getElementById('my-complaints-count');
    if (!container) return;

    const filtered = this.getFilteredComplaints();

    if (countBadge) {
      countBadge.textContent = `${filtered.length} complaint${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="empty-state-title">No complaints found</div>
          <div class="empty-state-desc">No complaints match your current search criteria or active filters. Try clearing your filters or submit a new complaint.</div>
          <button class="btn btn-secondary btn-sm" onclick="window.complaintsController.clearAllFilters()">Clear All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(c => this.generateComplaintCardHTML(c)).join('');
  }

  generateComplaintCardHTML(c) {
    const statusKey = c.status.toLowerCase().replace(/\s+/g, '');
    const priorityKey = c.priority.toLowerCase();
    const isEmergency = c.priority === 'Emergency';
    const isOverdue = c.status === 'Overdue';
    const createdTimeFormatted = new Date(c.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const categoryIcon = window.app.getCategoryIcon(c.category);
    const statusIcon = window.app.getStatusIcon(c.status);

    return `
      <div class="complaint-item-card ${isEmergency ? 'is-emergency' : ''} ${isOverdue ? 'is-overdue' : ''}" 
           onclick="window.complaintsController.openComplaintDetail('${c.id}')"
           tabindex="0"
           role="button"
           aria-label="View complaint ${c.id}: ${Validator.escapeHtml(c.title)}">
        <div class="complaint-card-top">
          <div class="complaint-id-time">
            <span class="complaint-id-tag">${c.id}</span>
            <span>Submitted ${createdTimeFormatted}</span>
          </div>
          <div class="complaint-card-badges">
            <span class="badge badge-priority-${priorityKey}">
              ${c.priority} Priority
            </span>
            <span class="badge badge-status-${statusKey}">
              ${statusIcon}
              ${c.status}
            </span>
          </div>
        </div>

        <div class="complaint-card-title">${Validator.escapeHtml(c.title)}</div>
        <div class="complaint-card-desc">${Validator.escapeHtml(c.description)}</div>

        <div class="complaint-card-bottom">
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <span class="category-pill">
              ${categoryIcon}
              ${Validator.escapeHtml(c.category)}
            </span>
            <span class="complaint-location-tag">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${Validator.escapeHtml(c.block)} · ${Validator.escapeHtml(c.room || c.floor)}
            </span>
            ${c.isCommonArea ? '<span class="badge" style="background: var(--color-bg-subtle); color: var(--color-text-secondary); font-size: 0.7rem;">Common Area</span>' : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; color: var(--color-text-muted);">
            ${c.publicUpdates && c.publicUpdates.length > 0 ? `
              <span title="${c.publicUpdates.length} public updates" style="display: inline-flex; align-items: center; gap: 0.25rem;">
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                ${c.publicUpdates.length}
              </span>
            ` : ''}
            <span style="color: var(--color-primary); font-weight: 600;">View Details &rarr;</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- Complaint Details & Tracking Modal ---

  openComplaintDetail(id) {
    const c = window.storageManager.getComplaintById(id);
    if (!c) {
      window.app.showToast("Complaint not found.", "error");
      return;
    }

    const modal = document.getElementById('complaint-detail-modal');
    const titleEl = document.getElementById('detail-modal-title');
    const bodyEl = document.getElementById('detail-modal-body');
    const footerEl = document.getElementById('detail-modal-footer');

    if (titleEl) {
      titleEl.innerHTML = `
        <span style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--color-primary);">${c.id}</span>
        <span style="margin-left: 0.5rem; font-weight: 700;">Complaint Details</span>
      `;
    }

    const currentRole = window.storageManager.getRole();
    const statusKey = c.status.toLowerCase().replace(/\s+/g, '');
    const priorityKey = c.priority.toLowerCase();
    const statusIcon = window.app.getStatusIcon(c.status);
    const categoryIcon = window.app.getCategoryIcon(c.category);

    const isResolved = c.status === 'Resolved';
    const canStudentReopen = (currentRole === 'student' && isResolved);

    // Build timeline HTML
    const timelineItemsHTML = (c.history || []).map((step, idx) => {
      const stepDate = new Date(step.timestamp).toLocaleString();
      const isLast = idx === (c.history.length - 1);
      return `
        <div class="timeline-step">
          <div class="timeline-marker ${step.status === 'Resolved' ? 'resolved' : ''}">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-action-title">${Validator.escapeHtml(step.action)}</span>
              <span class="timeline-time">${stepDate}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 600;">
              By: ${Validator.escapeHtml(step.actor)} · Status: <strong>${step.status}</strong>
            </div>
            ${step.note ? `<div class="timeline-note">${Validator.escapeHtml(step.note)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Public updates HTML
    const publicUpdatesHTML = (c.publicUpdates && c.publicUpdates.length > 0)
      ? c.publicUpdates.map(u => `
          <div class="update-box-public">
            <div class="update-box-meta">
              <span><strong>${Validator.escapeHtml(u.author)}</strong></span>
              <span>${new Date(u.timestamp).toLocaleString()}</span>
            </div>
            <div class="update-box-content">${Validator.escapeHtml(u.message)}</div>
          </div>
        `).join('')
      : '<p style="font-size: 0.8rem; color: var(--color-text-muted); font-style: italic;">No public updates logged yet.</p>';

    // Internal notes HTML (Warden ONLY)
    let internalNotesHTML = '';
    if (currentRole === 'warden') {
      internalNotesHTML = `
        <div style="margin-top: 1.5rem; padding: 1rem; background-color: #FFFDF5; border: 1px dashed var(--color-accent); border-radius: var(--radius-sm);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--color-accent-dark); display: flex; align-items: center; gap: 0.35rem;">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Internal Warden Notes (Hidden from Students)
            </h4>
            <button class="btn btn-secondary btn-sm" onclick="window.adminController.openAddNoteModal('${c.id}')">+ Add Note</button>
          </div>
          ${(c.internalNotes && c.internalNotes.length > 0)
          ? c.internalNotes.map(n => `
                <div class="update-box-internal">
                  <div class="update-box-meta">
                    <span>${Validator.escapeHtml(n.author)}</span>
                    <span>${new Date(n.timestamp).toLocaleString()}</span>
                  </div>
                  <div class="update-box-content">${Validator.escapeHtml(n.message)}</div>
                </div>
              `).join('')
          : '<p style="font-size: 0.78rem; color: var(--color-text-muted); font-style: italic;">No internal management notes recorded.</p>'
        }
        </div>
      `;
    }

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;">${Validator.escapeHtml(c.title)}</h3>
            <div style="font-size: 0.78rem; color: var(--color-text-secondary);">
              Submitted by <strong>${Validator.escapeHtml(c.submittedBy?.name || 'Student')}</strong> (${Validator.escapeHtml(c.submittedBy?.studentId || 'ID')}) on ${new Date(c.createdAt).toLocaleString()}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-priority-${priorityKey}">${c.priority} Priority</span>
            <span class="badge badge-status-${statusKey}">${statusIcon} ${c.status}</span>
          </div>
        </div>

        <!-- Metadata Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; background-color: var(--color-bg-subtle); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: 1.25rem; font-size: 0.82rem;">
          <div><strong>Category:</strong> ${Validator.escapeHtml(c.category)}</div>
          <div><strong>Block / Floor:</strong> ${Validator.escapeHtml(c.block)} · ${Validator.escapeHtml(c.floor)}</div>
          <div><strong>Room / Area:</strong> ${Validator.escapeHtml(c.room)} ${c.isCommonArea ? '(Common Area)' : ''}</div>
          <div><strong>Assigned To:</strong> ${Validator.escapeHtml(c.assignedTo || 'Unassigned')}</div>
          ${c.estimatedCompletion ? `<div><strong>Est. Completion:</strong> ${Validator.escapeHtml(c.estimatedCompletion)}</div>` : ''}
          ${c.resolvedAt ? `<div><strong>Resolved At:</strong> ${new Date(c.resolvedAt).toLocaleString()}</div>` : ''}
        </div>

        <!-- Description -->
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Issue Description</h4>
          <div style="background-color: var(--color-bg-card); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.88rem; line-height: 1.5;">
            ${Validator.escapeHtml(c.description)}
          </div>
        </div>

        <!-- Image Attachment (if present) -->
        ${c.imageAttachment ? `
          <div style="margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--color-text-secondary);">Attached Photo</h4>
            <img src="${c.imageAttachment}" alt="Complaint Photo" style="max-width: 100%; max-height: 240px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); object-fit: contain; background: #000;" />
          </div>
        ` : ''}

        <!-- Resolution Notes Box (if resolved) -->
        ${c.resolutionNotes ? `
          <div style="background-color: var(--status-resolved-bg); border: 1px solid var(--status-resolved-border); border-left: 4px solid #1E4E25; padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--status-resolved-text); margin-bottom: 0.25rem;">Official Resolution Notes</h4>
            <div style="font-size: 0.84rem; color: var(--status-resolved-text);">${Validator.escapeHtml(c.resolutionNotes)}</div>
          </div>
        ` : ''}

        <!-- Public Updates Section -->
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Public Progress Updates</h4>
            ${currentRole === 'warden' ? `
              <button class="btn btn-secondary btn-sm" onclick="window.adminController.openAddUpdateModal('${c.id}')">+ Add Public Update</button>
            ` : ''}
          </div>
          ${publicUpdatesHTML}
        </div>

        <!-- Internal Notes Section (Warden Only) -->
        ${internalNotesHTML}

        <!-- Full Complaint Timeline -->
        <div style="margin-top: 1.5rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Full Complaint Timeline</h4>
          <div class="timeline">
            ${timelineItemsHTML}
          </div>
        </div>
      `;
    }

    if (footerEl) {
      footerEl.innerHTML = `
        <button class="btn btn-secondary" onclick="window.app.closeModal('complaint-detail-modal')">Close</button>
        ${canStudentReopen ? `
          <button class="btn btn-accent" onclick="window.complaintsController.promptReopenComplaint('${c.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reopen Issue
          </button>
        ` : ''}
        ${currentRole === 'warden' ? `
          <button class="btn btn-primary" onclick="window.adminController.openStatusManageModal('${c.id}')">
            Manage Status & Assignment &rarr;
          </button>
        ` : ''}
      `;
    }

    window.app.openModal('complaint-detail-modal');
  }

  // --- Student Reopen Workflow ---

  promptReopenComplaint(id) {
    const reason = prompt("Please describe why you are reopening this resolved complaint (e.g., Problem persisted, recurrence):");
    if (reason === null) return; // User clicked cancel

    if (!reason.trim()) {
      alert("A reason is required to reopen a resolved complaint.");
      return;
    }

    const now = new Date().toISOString();
    const student = window.storageManager.getUserProfile();

    const updated = window.storageManager.updateComplaint(id, c => {
      c.status = 'Reopened';
      c.updatedAt = now;
      if (!Array.isArray(c.history)) c.history = [];
      c.history.push({
        timestamp: now,
        action: "Complaint Reopened by Student",
        status: "Reopened",
        actor: `${student.name} (Student)`,
        note: `Reopened: ${reason.trim()}`,
        isPublic: true
      });
      if (!Array.isArray(c.publicUpdates)) c.publicUpdates = [];
      c.publicUpdates.push({
        timestamp: now,
        message: `Issue reopened by student: "${reason.trim()}". Further inspection required.`,
        author: `${student.name} (Student)`
      });
      return c;
    });

    if (updated) {
      window.app.showToast(`Complaint ${id} has been reopened.`, "warning");
      window.app.refreshAllViews();
      this.openComplaintDetail(id);
    }
  }
}

window.ComplaintsController = ComplaintsController;
window.complaintsController = new ComplaintsController();
