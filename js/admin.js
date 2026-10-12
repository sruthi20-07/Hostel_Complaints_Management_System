/**
 * FIX MY HOSTEL — Warden Management Module (admin.js)
 * Implements complaint lifecycle transitions, staff assignment, public updates,
 * private internal notes, duplicate linking, notices CRUD, and demo data reset.
 */

class AdminController {
  constructor() {
    this.tableFilters = {
      search: '',
      status: 'ALL',
      category: 'ALL',
      priority: 'ALL',
      block: 'ALL'
    };
    this.activeComplaintId = null;
  }

  init() {
    this.bindWardenControls();
    this.bindNoticeForm();
  }

  bindWardenControls() {
    const searchInput = document.getElementById('admin-search-input');
    const statusFilter = document.getElementById('admin-status-filter');
    const categoryFilter = document.getElementById('admin-category-filter');
    const priorityFilter = document.getElementById('admin-priority-filter');
    const blockFilter = document.getElementById('admin-block-filter');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.tableFilters.search = searchInput.value.trim();
        this.renderAdminTable();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.tableFilters.status = statusFilter.value;
        this.renderAdminTable();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.tableFilters.category = categoryFilter.value;
        this.renderAdminTable();
      });
    }

    if (priorityFilter) {
      priorityFilter.addEventListener('change', () => {
        this.tableFilters.priority = priorityFilter.value;
        this.renderAdminTable();
      });
    }

    if (blockFilter) {
      blockFilter.addEventListener('change', () => {
        this.tableFilters.block = blockFilter.value;
        this.renderAdminTable();
      });
    }

    // Export CSV button
    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        window.storageManager.exportComplaintsToCSV();
      });
    }

    // Reset Demo Data button
    const resetDataBtn = document.getElementById('btn-reset-demo-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        this.confirmResetDemoData();
      });
    }
  }

  // --- Render Warden Complaints Table ---

  renderAdminTable() {
    const tableBody = document.getElementById('admin-complaints-tbody');
    const countBadge = document.getElementById('admin-table-count');
    if (!tableBody) return;

    let complaints = window.storageManager.getComplaints();
    const { search, status, category, priority, block } = this.tableFilters;

    if (search) {
      const q = search.toLowerCase();
      complaints = complaints.filter(c => 
        c.id.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.block && c.block.toLowerCase().includes(q)) ||
        (c.room && c.room.toLowerCase().includes(q)) ||
        (c.submittedBy && c.submittedBy.name && c.submittedBy.name.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'ALL') {
      complaints = complaints.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    if (category && category !== 'ALL') {
      complaints = complaints.filter(c => c.category === category);
    }

    if (priority && priority !== 'ALL') {
      complaints = complaints.filter(c => c.priority === priority);
    }

    if (block && block !== 'ALL') {
      complaints = complaints.filter(c => c.block === block);
    }

    if (countBadge) {
      countBadge.textContent = `${complaints.length} records`;
    }

    if (complaints.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
            No complaints found matching current warden filters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = complaints.map(c => {
      const statusKey = c.status.toLowerCase().replace(/\s+/g, '');
      const priorityKey = c.priority.toLowerCase();
      const statusIcon = window.app.getStatusIcon(c.status);
      const categoryIcon = window.app.getCategoryIcon(c.category);
      const dateFormatted = new Date(c.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <tr class="${c.priority === 'Emergency' ? 'is-emergency-row' : ''}">
          <td style="font-family: var(--font-mono); font-weight: 700;">
            <a href="javascript:void(0)" onclick="window.complaintsController.openComplaintDetail('${c.id}')">${c.id}</a>
          </td>
          <td style="color: var(--color-text-secondary); font-size: 0.78rem;">${dateFormatted}</td>
          <td>
            <div style="font-weight: 600; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${Validator.escapeHtml(c.title)}">
              ${Validator.escapeHtml(c.title)}
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted);">By ${Validator.escapeHtml(c.submittedBy?.name || 'Student')} (${Validator.escapeHtml(c.submittedBy?.studentId || 'ID')})</div>
          </td>
          <td>
            <span class="category-pill">${categoryIcon} ${Validator.escapeHtml(c.category)}</span>
          </td>
          <td>${Validator.escapeHtml(c.block)} · ${Validator.escapeHtml(c.room || c.floor)}</td>
          <td>
            <span class="badge badge-priority-${priorityKey}">${c.priority}</span>
          </td>
          <td>
            <span class="badge badge-status-${statusKey}">${statusIcon} ${c.status}</span>
          </td>
          <td style="font-size: 0.8rem;">
            ${c.assignedTo ? Validator.escapeHtml(c.assignedTo) : '<span style="color: var(--color-text-muted); font-style: italic;">Unassigned</span>'}
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-secondary btn-sm" onclick="window.complaintsController.openComplaintDetail('${c.id}')" title="View Details">
                View
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.adminController.openStatusManageModal('${c.id}')" title="Update Status">
                Action
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- Modal for Status & Assignment Management ---

  openStatusManageModal(id) {
    const c = window.storageManager.getComplaintById(id);
    if (!c) return;
    this.activeComplaintId = id;

    const modal = document.getElementById('manage-status-modal');
    const headerTitle = document.getElementById('manage-status-modal-title');
    const statusSelect = document.getElementById('manage-status-select');
    const staffSelect = document.getElementById('manage-staff-select');
    const estInput = document.getElementById('manage-est-time');
    const notesInput = document.getElementById('manage-action-notes');
    const resolutionGroup = document.getElementById('manage-resolution-group');
    const resolutionNotes = document.getElementById('manage-resolution-notes');

    if (headerTitle) {
      headerTitle.textContent = `Manage Complaint: ${c.id}`;
    }

    if (statusSelect) {
      statusSelect.value = c.status;
      // Show or hide resolution notes group depending on status
      const checkResolution = () => {
        if (statusSelect.value === 'Resolved') {
          if (resolutionGroup) resolutionGroup.style.display = 'block';
        } else {
          if (resolutionGroup) resolutionGroup.style.display = 'none';
        }
      };
      statusSelect.onchange = checkResolution;
      checkResolution();
    }

    if (staffSelect) {
      staffSelect.value = c.assignedTo || '';
    }

    if (estInput) {
      estInput.value = c.estimatedCompletion || '';
    }

    if (notesInput) {
      notesInput.value = '';
    }

    if (resolutionNotes) {
      resolutionNotes.value = c.resolutionNotes || '';
    }

    const saveBtn = document.getElementById('btn-save-status-manage');
    if (saveBtn) {
      saveBtn.onclick = () => this.saveStatusManage(id);
    }

    window.app.openModal('manage-status-modal');
  }

  saveStatusManage(id) {
    const newStatus = document.getElementById('manage-status-select').value;
    const assignedStaff = document.getElementById('manage-staff-select').value;
    const estTime = document.getElementById('manage-est-time').value.trim();
    const actionNotes = document.getElementById('manage-action-notes').value.trim();
    const resolutionNotes = document.getElementById('manage-resolution-notes').value.trim();

    // Mandatory Resolution Notes check if resolving
    if (newStatus === 'Resolved' && !resolutionNotes) {
      alert("Resolution notes are required before resolving a complaint.");
      return;
    }

    const now = new Date().toISOString();
    const warden = window.storageManager.getRole() === 'warden' ? "Chief Warden" : "Hostel Office";

    const updated = window.storageManager.updateComplaint(id, c => {
      const oldStatus = c.status;
      c.status = newStatus;
      c.assignedTo = assignedStaff || null;
      c.estimatedCompletion = estTime || null;

      if (newStatus === 'Resolved') {
        c.resolutionNotes = resolutionNotes;
        c.resolvedAt = c.resolvedAt || now;
      } else if (oldStatus === 'Resolved' && newStatus !== 'Resolved') {
        // If moving back out of resolved, clear resolvedAt
        c.resolvedAt = null;
      }

      // Add to audit timeline
      if (!Array.isArray(c.history)) c.history = [];
      const actionText = oldStatus !== newStatus 
        ? `Status changed from ${oldStatus} to ${newStatus}`
        : `Management update recorded`;

      c.history.push({
        timestamp: now,
        action: actionText,
        status: newStatus,
        actor: warden,
        note: actionNotes || (newStatus === 'Resolved' ? resolutionNotes : `Assigned to ${assignedStaff || 'maintenance'}`),
        isPublic: true
      });

      // Add automatic public update message if status changed
      if (oldStatus !== newStatus || actionNotes) {
        if (!Array.isArray(c.publicUpdates)) c.publicUpdates = [];
        let updateMsg = `Status updated to "${newStatus}".`;
        if (assignedStaff) updateMsg += ` Assigned to ${assignedStaff}.`;
        if (actionNotes) updateMsg += ` Note: ${actionNotes}`;
        if (newStatus === 'Resolved') updateMsg = `Issue resolved: ${resolutionNotes}`;

        c.publicUpdates.push({
          timestamp: now,
          message: updateMsg,
          author: "Warden Office"
        });
      }

      return c;
    });

    if (updated) {
      window.app.closeModal('manage-status-modal');
      window.app.showToast(`Complaint ${id} updated to ${newStatus}`, "success");
      window.app.refreshAllViews();
      // If details modal was open, refresh it
      window.complaintsController.openComplaintDetail(id);
    }
  }

  // --- Add Public Update Modal ---

  openAddUpdateModal(id) {
    const message = prompt("Enter a public progress update for the student to see:");
    if (!message || !message.trim()) return;

    const now = new Date().toISOString();
    window.storageManager.updateComplaint(id, c => {
      if (!Array.isArray(c.publicUpdates)) c.publicUpdates = [];
      c.publicUpdates.push({
        timestamp: now,
        message: message.trim(),
        author: "Warden Office"
      });
      if (!Array.isArray(c.history)) c.history = [];
      c.history.push({
        timestamp: now,
        action: "Public Progress Update Added",
        status: c.status,
        actor: "Warden Office",
        note: message.trim(),
        isPublic: true
      });
      return c;
    });

    window.app.showToast("Public progress update added.", "success");
    window.complaintsController.openComplaintDetail(id);
    window.app.refreshAllViews();
  }

  // --- Add Internal Note Modal (Warden Only) ---

  openAddNoteModal(id) {
    const note = prompt("Enter internal management note (will NOT be shown to students):");
    if (!note || !note.trim()) return;

    const now = new Date().toISOString();
    window.storageManager.updateComplaint(id, c => {
      if (!Array.isArray(c.internalNotes)) c.internalNotes = [];
      c.internalNotes.push({
        timestamp: now,
        message: note.trim(),
        author: "Chief Warden"
      });
      return c;
    });

    window.app.showToast("Internal management note recorded.", "info");
    window.complaintsController.openComplaintDetail(id);
  }

  // --- Link Duplicate Modal ---

  openLinkDuplicateModal(id) {
    const targetId = prompt(`Enter Primary Complaint ID that ${id} is a duplicate of (e.g., FMH-2026-0001):`);
    if (!targetId || !targetId.trim()) return;

    const targetComplaint = window.storageManager.getComplaintById(targetId.trim());
    if (!targetComplaint) {
      alert(`Primary complaint "${targetId}" not found in records.`);
      return;
    }

    const now = new Date().toISOString();
    window.storageManager.updateComplaint(id, c => {
      c.isDuplicateOf = targetComplaint.id;
      if (!Array.isArray(c.history)) c.history = [];
      c.history.push({
        timestamp: now,
        action: "Marked as Duplicate",
        status: c.status,
        actor: "Warden Office",
        note: `Linked as duplicate of primary complaint ${targetComplaint.id}`,
        isPublic: true
      });
      return c;
    });

    window.app.showToast(`Linked ${id} as duplicate of ${targetComplaint.id}`, "info");
    window.app.refreshAllViews();
  }

  // --- Notices & Maintenance Management ---

  bindNoticeForm() {
    const form = document.getElementById('create-notice-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      this.handleCreateNoticeSubmit();
    });
  }

  openCreateNoticeModal() {
    const form = document.getElementById('create-notice-form');
    if (form) form.reset();
    window.app.openModal('create-notice-modal');
  }

  handleCreateNoticeSubmit() {
    const title = document.getElementById('notice-title').value.trim();
    const category = document.getElementById('notice-category').value;
    const targetAudience = document.getElementById('notice-audience').value;
    const description = document.getElementById('notice-desc').value.trim();
    const priority = document.getElementById('notice-priority').value;
    const scheduledDate = document.getElementById('notice-scheduled-date').value.trim();
    const expiresAtVal = document.getElementById('notice-expires-at').value;

    const data = {
      title,
      category,
      targetAudience,
      description,
      priority,
      scheduledDate,
      expiresAt: expiresAtVal ? new Date(expiresAtVal).toISOString() : null
    };

    const validation = Validator.validateNoticeForm(data);
    if (!validation.isValid) {
      const errMsgs = Object.values(validation.errors).join("\n");
      alert(errMsgs);
      return;
    }

    const newId = window.storageManager.generateNoticeId();
    const newNotice = {
      id: newId,
      title: data.title,
      category: data.category,
      targetAudience: data.targetAudience,
      description: data.description,
      priority: data.priority,
      scheduledDate: data.scheduledDate || "Standard announcement",
      isMaintenance: data.category !== 'General' && data.category !== 'Inspection',
      status: "Active",
      publishedAt: new Date().toISOString(),
      expiresAt: data.expiresAt
    };

    window.storageManager.addNotice(newNotice);
    window.app.closeModal('create-notice-modal');
    window.app.showToast(`Notice ${newId} published successfully.`, "success");
    window.app.refreshAllViews();
  }

  deleteNotice(id) {
    if (confirm(`Are you sure you want to delete notice ${id}? This action cannot be undone.`)) {
      window.storageManager.deleteNotice(id);
      window.app.showToast(`Notice ${id} deleted.`, "info");
      window.app.refreshAllViews();
    }
  }

  // --- Reset Demo Data Confirmation ---

  confirmResetDemoData() {
    const confirmed = confirm(
      "CONFIRM DEMO DATA RESET:\n\n" +
      "Are you sure you want to reset all complaints, notices, and user activity back to the initial demonstration records?\n\n" +
      "All your newly submitted complaints and changes will be replaced with clean sample data."
    );

    if (confirmed) {
      window.storageManager.resetDemoData();
      window.app.showToast("Demo data successfully restored to default records.", "success");
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  }
}

window.AdminController = AdminController;
window.adminController = new AdminController();
