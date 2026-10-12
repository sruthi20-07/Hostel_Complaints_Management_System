/**
 * FIX MY HOSTEL — Main Application Controller (app.js)
 * Orchestrates navigation, demo role switcher, modal management,
 * toast notifications, dashboard metrics, community board, notices, and icon SVGs.
 */

class App {
  constructor() {
    this.currentView = 'student-dashboard';
    this.currentRole = 'student';
  }

  init() {
    // 1. Sync role
    this.currentRole = window.storageManager.getRole();

    // 2. Setup navigation and listeners
    this.bindRoleSwitcher();
    this.bindNavigation();
    this.bindModals();
    this.bindMobileMenu();

    // 3. Initialize sub-controllers
    if (window.complaintsController) window.complaintsController.init();
    if (window.adminController) window.adminController.init();
    if (window.analyticsController) window.analyticsController.init();

    // 4. Initial render
    this.applyRoleUI(this.currentRole);
    this.refreshAllViews();

    // 5. Setup Profile form if available
    this.bindProfileForm();

    console.log("Fix My Hostel initialized successfully in " + this.currentRole + " mode.");
  }

  // --- SVG Icon System (Non-emoji, consistent stroke & sizing) ---

  getCategoryIcon(category) {
    switch (category) {
      case 'Plumbing':
      case 'Water Supply':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`;
      case 'Electricity':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
      case 'Cleaning':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="m21.5 2-1.4 1.4"></path><path d="m19 5-3-3"></path><path d="m14 8 2 2"></path><path d="m11 11-4 4"></path><path d="M2.5 17.5 7 22l8-8-4.5-4.5Z"></path></svg>`;
      case 'Wi-Fi':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
      case 'Furniture':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"></path><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"></path><path d="M5 18v2"></path><path d="M19 18v2"></path></svg>`;
      case 'Security':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`;
      case 'Pest Control':
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="m8 2 1.88 1.88"></path><path d="M14.12 3.88 16 2"></path><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"></path><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"></path><path d="M12 20v-9"></path><path d="M6.53 9C4.6 8.8 3 7.1 3 5"></path><path d="M6 13H2"></path><path d="M3 21c0-2.1 1.7-3.9 3.8-4"></path><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"></path><path d="M22 13h-4"></path><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"></path></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'Submitted':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      case 'Acknowledged':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      case 'In Progress':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
      case 'Resolved':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      case 'Reopened':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`;
      case 'Emergency':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case 'Overdue':
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 10"></polyline><line x1="12" y1="2" x2="12" y2="4"></line></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
  }

  // --- Role Switcher (Student ↔ Warden) ---

  bindRoleSwitcher() {
    const studentBtn = document.getElementById('role-btn-student');
    const wardenBtn = document.getElementById('role-btn-warden');

    if (studentBtn) {
      studentBtn.addEventListener('click', () => {
        this.switchRole('student');
      });
    }

    if (wardenBtn) {
      wardenBtn.addEventListener('click', () => {
        this.switchRole('warden');
      });
    }
  }

  switchRole(role) {
    this.currentRole = role;
    window.storageManager.setRole(role);
    this.applyRoleUI(role);

    // Switch default landing view for the role
    const defaultView = role === 'warden' ? 'warden-overview' : 'student-dashboard';
    this.navigateTo(defaultView);
    this.refreshAllViews();

    const roleName = role === 'warden' ? 'Warden (Admin Mode)' : 'Student Mode';
    this.showToast(`Switched to ${roleName}`, "info");
  }

  applyRoleUI(role) {
    const studentBtn = document.getElementById('role-btn-student');
    const wardenBtn = document.getElementById('role-btn-warden');
    const roleIndicator = document.getElementById('sidebar-role-indicator');
    const studentNavGroup = document.getElementById('student-nav-group');
    const wardenNavGroup = document.getElementById('warden-nav-group');
    const userProfileSnippet = document.getElementById('sidebar-user-snippet');

    if (studentBtn && wardenBtn) {
      if (role === 'warden') {
        studentBtn.classList.remove('active');
        wardenBtn.classList.add('active');
      } else {
        wardenBtn.classList.remove('active');
        studentBtn.classList.add('active');
      }
    }

    if (roleIndicator) {
      if (role === 'warden') {
        roleIndicator.innerHTML = `
          <div class="role-tag-container">
            <span class="role-tag warden">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Warden
            </span>
          </div>
          <span style="font-size: 0.72rem; color: var(--color-text-secondary);">Admin Panel</span>
        `;
      } else {
        roleIndicator.innerHTML = `
          <div class="role-tag-container">
            <span class="role-tag student">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Student
            </span>
          </div>
          <span style="font-size: 0.72rem; color: var(--color-text-secondary);">Hosteller</span>
        `;
      }
    }

    if (studentNavGroup && wardenNavGroup) {
      if (role === 'warden') {
        studentNavGroup.style.display = 'none';
        wardenNavGroup.style.display = 'block';
      } else {
        wardenNavGroup.style.display = 'none';
        studentNavGroup.style.display = 'block';
      }
    }

    if (userProfileSnippet) {
      if (role === 'warden') {
        const warden = DEFAULT_WARDEN_PROFILE;
        userProfileSnippet.innerHTML = `
          <div class="user-avatar" style="background-color: var(--color-accent);">W</div>
          <div class="user-meta">
            <div class="user-meta-name">${warden.name}</div>
            <div class="user-meta-detail">${warden.designation}</div>
          </div>
        `;
      } else {
        const student = window.storageManager.getUserProfile();
        userProfileSnippet.innerHTML = `
          <div class="user-avatar">S</div>
          <div class="user-meta">
            <div class="user-meta-name">${Validator.escapeHtml(student.name)}</div>
            <div class="user-meta-detail">${Validator.escapeHtml(student.block)} · Room ${Validator.escapeHtml(student.room)}</div>
          </div>
        `;
      }
    }
  }

  // --- Navigation & Routing ---

  bindNavigation() {
    const navButtons = document.querySelectorAll('[data-view-target]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const targetView = btn.getAttribute('data-view-target');
        if (targetView) {
          this.navigateTo(targetView);
          // Auto close mobile drawer if open
          const sidebar = document.getElementById('app-sidebar');
          if (sidebar) sidebar.classList.remove('mobile-open');
        }
      });
    });

    // Quick report button in topbar
    const quickReportBtn = document.getElementById('btn-quick-report');
    if (quickReportBtn) {
      quickReportBtn.addEventListener('click', () => {
        if (this.currentRole === 'warden') {
          this.switchRole('student');
        }
        this.navigateTo('report-issue');
      });
    }
  }

  navigateTo(viewId) {
    // Hide all view sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // Show target section
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      this.currentView = viewId;
    }

    // Update active state in sidebar nav buttons
    const navButtons = document.querySelectorAll('[data-view-target]');
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-view-target') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-current-page');
    if (breadcrumbCurrent) {
      const titles = {
        'student-dashboard': 'Student Dashboard',
        'report-issue': 'Report an Issue',
        'my-complaints': 'My Complaints',
        'community-issues': 'Community Issues Board',
        'notices-maintenance': 'Notices & Maintenance Schedules',
        'profile-preferences': 'Profile & Preferences',
        'warden-overview': 'Warden Dashboard Overview',
        'all-complaints': 'All Complaints Management',
        'warden-maintenance': 'Maintenance Schedules',
        'warden-notices': 'Manage Notices & Announcements',
        'warden-analytics': 'Analytics & Reports',
        'warden-settings': 'Settings & Demo Controls'
      };
      breadcrumbCurrent.textContent = titles[viewId] || 'Dashboard';
    }

    // Scroll to top of main content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh specific view data if needed
    if (viewId === 'my-complaints' && window.complaintsController) {
      window.complaintsController.renderComplaintsList();
    } else if (viewId === 'all-complaints' && window.adminController) {
      window.adminController.renderAdminTable();
    } else if (viewId === 'warden-analytics' && window.analyticsController) {
      window.analyticsController.renderAnalytics();
    }
  }

  // --- Mobile Drawer Menu ---

  bindMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
    const sidebar = document.getElementById('app-sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Close when clicking outside on mobile
    document.addEventListener('click', e => {
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });
  }

  // --- Modals Management ---

  bindModals() {
    // Backdrop click and close buttons
    const closeButtons = document.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal-close');
        this.closeModal(modalId);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-overlay.show');
        openModals.forEach(m => m.classList.remove('show'));
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      // Trap focus or focus first input
      const firstInput = modal.querySelector('input, select, textarea, button');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // --- Toast Notifications ---

  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" style="color: var(--color-primary); flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" style="color: #B3261E; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" style="color: var(--color-accent); flex-shrink: 0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" style="color: var(--color-primary); flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-message">${Validator.escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
      toast.remove();
    };

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }

  // --- Dynamic Dashboard & View Refreshing ---

  refreshAllViews() {
    const stats = window.storageManager.getStatistics();
    this.renderStudentDashboard(stats);
    this.renderWardenOverview(stats);
    this.renderCommunityBoard();
    this.renderNoticesView();
    this.renderMaintenanceBoard();
    this.updateNavBadges(stats);

    if (window.complaintsController) window.complaintsController.renderComplaintsList();
    if (window.adminController) window.adminController.renderAdminTable();
    if (window.analyticsController) window.analyticsController.renderAnalytics();
  }

  updateNavBadges(stats) {
    const openBadge = document.getElementById('nav-badge-my-complaints');
    const urgentBadge = document.getElementById('nav-badge-warden-urgent');
    const allBadge = document.getElementById('nav-badge-warden-all');

    if (openBadge) openBadge.textContent = stats.open;
    if (urgentBadge) {
      urgentBadge.textContent = stats.urgentOpen;
      urgentBadge.style.display = stats.urgentOpen > 0 ? 'inline-block' : 'none';
    }
    if (allBadge) allBadge.textContent = stats.total;
  }

  // --- Render Student Dashboard ---

  renderStudentDashboard(stats) {
    // Stats cards
    const totalEl = document.getElementById('dash-stat-total');
    const openEl = document.getElementById('dash-stat-open');
    const inProgressEl = document.getElementById('dash-stat-inprogress');
    const resolvedEl = document.getElementById('dash-stat-resolved');
    const urgentEl = document.getElementById('dash-stat-urgent');

    if (totalEl) totalEl.textContent = stats.total;
    if (openEl) openEl.textContent = stats.open;
    if (inProgressEl) inProgressEl.textContent = stats.inProgress;
    if (resolvedEl) resolvedEl.textContent = stats.resolved;
    if (urgentEl) urgentEl.textContent = stats.urgentOpen;

    // Overdue/Urgent Alert callout
    const urgentBanner = document.getElementById('dash-urgent-banner');
    if (urgentBanner) {
      if (stats.urgentOpen > 0 || stats.overdueCount > 0) {
        urgentBanner.style.display = 'flex';
        const txt = document.getElementById('dash-urgent-text');
        if (txt) {
          txt.textContent = `There are ${stats.urgentOpen} urgent issue${stats.urgentOpen === 1 ? '' : 's'} and ${stats.overdueCount} overdue case${stats.overdueCount === 1 ? '' : 's'} requiring maintenance attention.`;
        }
      } else {
        urgentBanner.style.display = 'none';
      }
    }

    // Recent complaints preview list (last 3 items)
    const recentContainer = document.getElementById('dash-recent-complaints-list');
    if (recentContainer) {
      const complaints = window.storageManager.getComplaints().slice(0, 3);
      if (complaints.length === 0) {
        recentContainer.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.85rem; padding: 1rem 0;">No complaints submitted yet.</p>';
      } else {
        recentContainer.innerHTML = complaints.map(c => window.complaintsController.generateComplaintCardHTML(c)).join('');
      }
    }

    // Active announcements preview in student dashboard
    const noticesContainer = document.getElementById('dash-notices-preview');
    if (noticesContainer) {
      const notices = window.storageManager.getNotices()
        .filter(n => !n.expiresAt || new Date(n.expiresAt) > new Date())
        .slice(0, 2);

      if (notices.length === 0) {
        noticesContainer.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.82rem;">No active notices today.</p>';
      } else {
        noticesContainer.innerHTML = notices.map(n => `
          <div style="background-color: var(--color-bg-subtle); border-left: 3px solid ${n.priority === 'Urgent' ? 'var(--color-accent)' : 'var(--color-primary)'}; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); margin-bottom: 0.6rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--color-text-secondary); margin-bottom: 0.2rem;">
              <span><strong>${Validator.escapeHtml(n.category)}</strong></span>
              <span>${new Date(n.publishedAt).toLocaleDateString()}</span>
            </div>
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-text-main); margin-bottom: 0.2rem;">
              ${Validator.escapeHtml(n.title)}
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${Validator.escapeHtml(n.description)}
            </div>
          </div>
        `).join('');
      }
    }
  }

  // --- Render Warden Overview ---

  renderWardenOverview(stats) {
    const totalEl = document.getElementById('warden-stat-total');
    const openEl = document.getElementById('warden-stat-open');
    const urgentEl = document.getElementById('warden-stat-urgent');
    const overdueEl = document.getElementById('warden-stat-overdue');
    const avgEl = document.getElementById('warden-stat-avg');

    if (totalEl) totalEl.textContent = stats.total;
    if (openEl) openEl.textContent = stats.open;
    if (urgentEl) urgentEl.textContent = stats.urgentOpen;
    if (overdueEl) overdueEl.textContent = stats.overdueCount;
    if (avgEl) {
      avgEl.textContent = stats.avgResolutionHours > 0 ? `${stats.avgResolutionHours}h` : 'N/A';
    }
  }

  // --- Render Community Board ---

  renderCommunityBoard() {
    const container = document.getElementById('community-issues-grid');
    if (!container) return;

    // Filter complaints marked as common-area or high votes
    const complaints = window.storageManager.getComplaints().filter(c => c.isCommonArea || (c.upvotes && c.upvotes > 2));

    if (complaints.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="empty-state-title">No Common Issues Reported</div>
          <div class="empty-state-desc">Common-area problems and shared hostel concerns reported by students appear here for community visibility and upvoting.</div>
        </div>
      `;
      return;
    }

    const votedIds = window.storageManager.getVotedIds();

    container.innerHTML = complaints.map(c => {
      const hasVoted = votedIds.includes(c.id);
      const statusKey = c.status.toLowerCase().replace(/\s+/g, '');
      const statusIcon = this.getStatusIcon(c.status);
      const categoryIcon = this.getCategoryIcon(c.category);

      return `
        <div class="community-card">
          <div class="community-card-header">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <span class="category-pill">${categoryIcon} ${Validator.escapeHtml(c.category)}</span>
                <span class="badge badge-status-${statusKey}">${statusIcon} ${c.status}</span>
              </div>
              <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.25rem;">
                ${Validator.escapeHtml(c.title)}
              </h4>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
                ${Validator.escapeHtml(c.block)} · ${Validator.escapeHtml(c.room || c.floor)}
              </div>
            </div>
            <div class="community-votes-col">
              <button class="upvote-btn ${hasVoted ? 'has-voted' : ''}" 
                      onclick="window.app.handleVote('${c.id}')"
                      title="${hasVoted ? 'Click to remove upvote' : 'Click to upvote this issue'}">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <span class="upvote-count">${c.upvotes || 0}</span>
              </button>
            </div>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.45; margin-bottom: 0.85rem; flex: 1;">
            ${Validator.escapeHtml(c.description)}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border-subtle); padding-top: 0.6rem;">
            <span>ID: <strong style="font-family: var(--font-mono);">${c.id}</strong></span>
            <a href="javascript:void(0)" onclick="window.complaintsController.openComplaintDetail('${c.id}')" style="font-weight: 600;">View Discussion &rarr;</a>
          </div>
        </div>
      `;
    }).join('');
  }

  handleVote(complaintId) {
    const student = window.storageManager.getUserProfile();
    const result = window.storageManager.toggleVote(complaintId, student.studentId);
    if (result.voted) {
      this.showToast(`Upvoted complaint ${complaintId}`, "success");
    } else {
      this.showToast(`Removed upvote from ${complaintId}`, "info");
    }
    this.renderCommunityBoard();
  }

  // --- Render Notices & Maintenance ---

  renderNoticesView() {
    const notices = window.storageManager.getNotices();
    const studentContainer = document.getElementById('student-notices-grid');
    const wardenContainer = document.getElementById('warden-notices-grid');

    const now = new Date();

    const generateNoticeCard = (n, isWarden = false) => {
      const isExpired = n.expiresAt && new Date(n.expiresAt) < now;
      const isUrgent = n.priority === 'Urgent';

      return `
        <div class="notice-card ${isUrgent ? 'urgent' : ''} ${isExpired ? 'expired' : ''}">
          <div class="notice-header">
            <span class="category-pill">${this.getCategoryIcon(n.category)} ${Validator.escapeHtml(n.category)}</span>
            <span class="notice-date-range">
              ${isExpired ? '<strong style="color: #B3261E;">[Expired]</strong> ' : ''}
              ${new Date(n.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <div class="notice-title">${Validator.escapeHtml(n.title)}</div>
          <div class="notice-body">${Validator.escapeHtml(n.description)}</div>
          <div class="notice-footer">
            <span>Target: <strong>${Validator.escapeHtml(n.targetAudience || 'All Blocks')}</strong></span>
            ${isWarden ? `
              <div>
                <button class="btn btn-outline-danger btn-sm" onclick="window.adminController.deleteNotice('${n.id}')">Delete</button>
              </div>
            ` : (n.scheduledDate ? `<span>Schedule: <strong>${Validator.escapeHtml(n.scheduledDate)}</strong></span>` : '')}
          </div>
        </div>
      `;
    };

    if (studentContainer) {
      if (notices.length === 0) {
        studentContainer.innerHTML = '<p style="color: var(--color-text-muted); padding: 1.5rem;">No active notices available.</p>';
      } else {
        studentContainer.innerHTML = notices.map(n => generateNoticeCard(n, false)).join('');
      }
    }

    if (wardenContainer) {
      if (notices.length === 0) {
        wardenContainer.innerHTML = '<p style="color: var(--color-text-muted); padding: 1.5rem;">No notices created yet. Click "+ Create Notice" to publish one.</p>';
      } else {
        wardenContainer.innerHTML = notices.map(n => generateNoticeCard(n, true)).join('');
      }
    }
  }

  renderMaintenanceBoard() {
    const schedules = window.storageManager.getNotices().filter(n => n.isMaintenance);
    const container = document.getElementById('maintenance-schedule-grid');
    const wardenMaintenanceContainer = document.getElementById('warden-maintenance-grid');

    const renderList = list => {
      if (list.length === 0) {
        return '<p style="color: var(--color-text-muted); padding: 1rem;">No maintenance activities currently scheduled.</p>';
      }

      return list.map(item => `
        <div class="notice-card ${item.priority === 'Urgent' ? 'urgent' : ''}">
          <div class="notice-header">
            <span class="category-pill">${this.getCategoryIcon(item.category)} ${Validator.escapeHtml(item.category)}</span>
            <span class="badge" style="background: var(--color-primary-light); color: var(--color-primary-dark); font-size: 0.72rem;">${item.status || 'Scheduled'}</span>
          </div>
          <div class="notice-title">${Validator.escapeHtml(item.title)}</div>
          <div class="notice-body">${Validator.escapeHtml(item.description)}</div>
          <div class="notice-footer">
            <span>When: <strong>${Validator.escapeHtml(item.scheduledDate)}</strong></span>
            <span>Audience: <strong>${Validator.escapeHtml(item.targetAudience)}</strong></span>
          </div>
        </div>
      `).join('');
    };

    if (container) container.innerHTML = renderList(schedules);
    if (wardenMaintenanceContainer) wardenMaintenanceContainer.innerHTML = renderList(schedules);
  }

  // --- Profile Bindings ---

  bindProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    const student = window.storageManager.getUserProfile();
    const nameInput = document.getElementById('profile-name');
    const idInput = document.getElementById('profile-student-id');
    const blockInput = document.getElementById('profile-block');
    const roomInput = document.getElementById('profile-room');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');

    if (nameInput) nameInput.value = student.name || '';
    if (idInput) idInput.value = student.studentId || '';
    if (blockInput) blockInput.value = student.block || 'Block B';
    if (roomInput) roomInput.value = student.room || '';
    if (emailInput) emailInput.value = student.email || '';
    if (phoneInput) phoneInput.value = student.phone || '';

    form.addEventListener('submit', e => {
      e.preventDefault();
      const updated = {
        name: nameInput.value.trim(),
        studentId: idInput.value.trim(),
        block: blockInput.value,
        floor: student.floor || '2nd Floor',
        room: roomInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        emergencyContact: student.emergencyContact
      };

      window.storageManager.saveUserProfile(updated);
      this.applyRoleUI(this.currentRole);
      this.showToast("Student profile updated successfully.", "success");
    });
  }
}

// Global App instance
window.App = App;
window.app = new App();

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
