/**
 * FIX MY HOSTEL — Authentication & Session Manager (auth.js)
 * Implements demo student registration, student login, warden login,
 * session persistence (sessionStorage/localStorage), role guards, and logout.
 */

const AUTH_KEYS = {
  USERS: 'fmh_users_v1',
  SESSION: 'fmh_session_v1'
};

// Fixed Demonstration Accounts
const DEFAULT_DEMO_USERS = [
  {
    id: "23CS108",
    name: "Aditya Verma",
    email: "aditya.v@hostel.edu",
    password: "hostel123",
    block: "Block B",
    floor: "2nd Floor",
    room: "B-214",
    role: "student",
    phone: "+91 98451 23456",
    emergencyContact: "+91 94441 22334"
  },
  {
    id: "23EE054",
    name: "Sneha Nair",
    email: "sneha.n@hostel.edu",
    password: "hostel123",
    block: "Block C",
    floor: "2nd Floor",
    room: "C-220",
    role: "student",
    phone: "+91 94471 99887",
    emergencyContact: "+91 94441 33445"
  },
  {
    id: "WARDEN-01",
    username: "warden",
    name: "Dr. K. Ramanathan",
    email: "warden.office@hostel.edu",
    password: "admin123",
    designation: "Chief Warden",
    role: "warden",
    phone: "+91 94441 55678",
    office: "Ground Floor, Admin Block"
  }
];

class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!localStorage.getItem(AUTH_KEYS.USERS)) {
        localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(DEFAULT_DEMO_USERS));
      }
    } catch (e) {
      console.error("Auth init storage error:", e);
    }
  }

  getUsers() {
    try {
      const data = localStorage.getItem(AUTH_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_DEMO_USERS;
    } catch (e) {
      return DEFAULT_DEMO_USERS;
    }
  }

  saveUsers(users) {
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  }

  // --- Student Registration ---
  registerStudent(formData) {
    const errors = {};
    const users = this.getUsers();

    const name = (formData.name || '').trim();
    const studentId = (formData.studentId || '').trim().toUpperCase();
    const email = (formData.email || '').trim().toLowerCase();
    const block = (formData.block || '').trim();
    const room = (formData.room || '').trim();
    const password = formData.password || '';
    const confirmPassword = formData.confirmPassword || '';
    const agreeTerms = !!formData.agreeTerms;

    if (!name || name.length < 3) {
      errors.name = "Full name must be at least 3 characters.";
    }

    if (!studentId || studentId.length < 4) {
      errors.studentId = "Valid Student ID / Roll Number is required.";
    } else {
      const existingId = users.find(u => u.id && u.id.toUpperCase() === studentId);
      if (existingId) {
        errors.studentId = "An account with this Student ID already exists. Please login.";
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Please provide a valid college email address.";
    } else {
      const existingEmail = users.find(u => u.email && u.email.toLowerCase() === email);
      if (existingEmail) {
        errors.email = "This email is already registered. Please login.";
      }
    }

    if (!block) errors.block = "Please select your hostel block.";
    if (!room) errors.room = "Room number is required.";

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errors.agreeTerms = "You must accept the demonstration terms.";
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Determine floor from room if possible
    let floor = "1st Floor";
    if (room.includes("-") || room.length >= 3) {
      const digitMatch = room.match(/\d/);
      if (digitMatch) {
        const floorNum = digitMatch[0];
        floor = floorNum === '0' ? 'Ground Floor' : `${floorNum}${floorNum === '1' ? 'st' : floorNum === '2' ? 'nd' : floorNum === '3' ? 'rd' : 'th'} Floor`;
      }
    }

    const newStudent = {
      id: studentId,
      name,
      email,
      password,
      block,
      floor,
      room,
      role: 'student',
      phone: formData.phone || "+91 98000 00000",
      emergencyContact: "+91 94441 22334",
      registeredAt: new Date().toISOString()
    };

    users.push(newStudent);
    this.saveUsers(users);

    return { success: true, user: newStudent };
  }

  // --- Student Login ---
  loginStudent(identifier, password) {
    if (!identifier || !password) {
      return { success: false, error: "Please enter both Student ID/Email and password." };
    }

    const users = this.getUsers();
    const query = identifier.trim().toLowerCase();

    const user = users.find(u => 
      u.role === 'student' && 
      (u.id.toLowerCase() === query || u.email.toLowerCase() === query)
    );

    if (!user) {
      return { success: false, error: "No student account found with this ID or email." };
    }

    if (user.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    // Create session (safe without password)
    const sessionUser = { ...user };
    delete sessionUser.password;

    this.setSession({
      user: sessionUser,
      role: 'student',
      loginTime: new Date().toISOString()
    });

    return { success: true, user: sessionUser };
  }

  // --- Warden Login ---
  loginWarden(identifier, password) {
    if (!identifier || !password) {
      return { success: false, error: "Please enter username/email and password." };
    }

    const users = this.getUsers();
    const query = identifier.trim().toLowerCase();

    const warden = users.find(u => 
      u.role === 'warden' && 
      ((u.username && u.username.toLowerCase() === query) || (u.email && u.email.toLowerCase() === query))
    );

    if (!warden) {
      return { success: false, error: "Invalid warden credentials." };
    }

    if (warden.password !== password) {
      return { success: false, error: "Incorrect password." };
    }

    const sessionUser = { ...warden };
    delete sessionUser.password;

    this.setSession({
      user: sessionUser,
      role: 'warden',
      loginTime: new Date().toISOString()
    });

    return { success: true, user: sessionUser };
  }

  // --- Session Management ---
  setSession(sessionData) {
    try {
      sessionStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(sessionData));
      // Also sync to localStorage active role key for backward compatibility
      localStorage.setItem('fmh_current_role_v1', sessionData.role);
      localStorage.setItem('fmh_user_profile_v1', JSON.stringify(sessionData.user));
    } catch (e) {
      console.error("Failed to write session:", e);
    }
  }

  getSession() {
    try {
      const data = sessionStorage.getItem(AUTH_KEYS.SESSION);
      if (data) return JSON.parse(data);

      // Fallback check in localStorage for seamless development
      const localRole = localStorage.getItem('fmh_current_role_v1');
      const localProfile = localStorage.getItem('fmh_user_profile_v1');
      if (localRole && localProfile) {
        return {
          user: JSON.parse(localProfile),
          role: localRole,
          loginTime: new Date().toISOString()
        };
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser() {
    const session = this.getSession();
    return session ? session.user : null;
  }

  getRole() {
    const session = this.getSession();
    return session ? session.role : null;
  }

  isAuthenticated() {
    return this.getSession() !== null;
  }

  logout() {
    sessionStorage.removeItem(AUTH_KEYS.SESSION);
    localStorage.removeItem('fmh_current_role_v1');
    window.location.href = 'login-selection.html';
  }

  /**
   * Route Guard helper: Call on page load
   * @param {string} expectedRole 'student' | 'warden' | null
   */
  requireAuth(expectedRole = null) {
    const session = this.getSession();
    if (!session) {
      // Redirect to appropriate login
      if (expectedRole === 'warden') {
        window.location.href = 'warden-login.html';
      } else {
        window.location.href = 'student-login.html';
      }
      return false;
    }

    if (expectedRole && session.role !== expectedRole) {
      // Wrong role access attempt
      if (session.role === 'warden') {
        window.location.href = 'warden-dashboard.html';
      } else {
        window.location.href = 'student-dashboard.html';
      }
      return false;
    }

    return true;
  }

  /**
   * Render Navigation Header user pill and Logout button
   */
  renderNavUserControls(containerId = 'nav-user-controls') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = this.getCurrentUser();
    const role = this.getRole();
    if (!user) return;

    const roleLabel = role === 'warden' ? 'Warden' : 'Student';
    const roleClass = role === 'warden' ? 'warden' : 'student';

    container.innerHTML = `
      <div class="nav-user-badge">
        <span class="role-tag ${roleClass}">${roleLabel}</span>
        <span>${Validator.escapeHtml(user.name)}</span>
      </div>
      <button class="logout-btn" onclick="window.authManager.logout()" title="Logout of demo session">
        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </button>
    `;
  }
}

window.AuthManager = AuthManager;
window.authManager = new AuthManager();
