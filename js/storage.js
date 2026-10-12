/**
 * FIX MY HOSTEL — Storage & Data Layer (storage.js)
 * Manages persistent browser localStorage, realistic seed data,
 * ID generation, statistics calculations, and safe CSV export.
 */

const STORAGE_KEYS = {
  COMPLAINTS: 'fmh_complaints_v1',
  NOTICES: 'fmh_notices_v1',
  USER_PROFILE: 'fmh_user_profile_v1',
  VOTES: 'fmh_votes_v1',
  CURRENT_ROLE: 'fmh_current_role_v1'
};

// Default Demo User Profile (Hostel Student)
const DEFAULT_STUDENT_PROFILE = {
  name: "Aditya Verma",
  studentId: "23CS108",
  block: "Block B",
  floor: "2nd Floor",
  room: "B-214",
  email: "aditya.v@hostel.edu",
  phone: "+91 98451 23456",
  emergencyContact: "+91 94441 22334"
};

// Warden Profile
const DEFAULT_WARDEN_PROFILE = {
  name: "Dr. K. Ramanathan",
  designation: "Chief Warden",
  office: "Ground Floor, Admin Block",
  phone: "+91 94441 55678",
  email: "warden.office@hostel.edu"
};

// Realistic Initial Sample Complaints (Demonstration records)
const INITIAL_SAMPLE_COMPLAINTS = [
  {
    id: "FMH-2026-0001",
    title: "Geyser not working in 2nd floor bathroom",
    category: "Plumbing",
    block: "Block B",
    floor: "2nd Floor",
    room: "Common Washroom West",
    isCommonArea: true,
    description: "The water geyser in the west wing washroom trips the circuit breaker whenever switched on. Cold water only for past 2 days.",
    priority: "High",
    status: "In Progress",
    submittedBy: {
      name: "Aditya Verma",
      studentId: "23CS108",
      room: "B-214",
      phone: "+91 98451 23456"
    },
    createdAt: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    assignedTo: "Sunder (Plumbing & Heating)",
    estimatedCompletion: "Today, 5:00 PM",
    resolutionNotes: null,
    resolvedAt: null,
    upvotes: 6,
    upvotedBy: ["23CS108", "23EE042", "23ME091"],
    isDuplicateOf: null,
    history: [
      {
        timestamp: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
        action: "Complaint Submitted",
        status: "Submitted",
        actor: "Aditya Verma (Student)",
        note: "Submitted through portal.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        action: "Acknowledged by Warden",
        status: "Acknowledged",
        actor: "Warden Office",
        note: "Complaint verified. Assigned to campus maintenance team.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        action: "Work Started",
        status: "In Progress",
        actor: "Sunder (Plumber)",
        note: "Inspecting heating coil and MCB wiring.",
        isPublic: true
      }
    ],
    publicUpdates: [
      {
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        message: "Plumber inspected. Replacement heating element requisitioned from store. Expected repair by 5 PM.",
        author: "Warden Office"
      }
    ],
    internalNotes: [
      {
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        message: "Frequent tripping reported earlier this month. May need replacement of MCB switch box.",
        author: "Warden Office"
      }
    ],
    imageAttachment: null
  },
  {
    id: "FMH-2026-0002",
    title: "Wi-Fi access point offline on 3rd floor corridor",
    category: "Wi-Fi",
    block: "Block A",
    floor: "3rd Floor",
    room: "Corridor AP-04",
    isCommonArea: true,
    description: "The ceiling Wi-Fi access point in corridor near room A-310 is showing red light. No signal in rooms A-308 to A-315.",
    priority: "Medium",
    status: "Acknowledged",
    submittedBy: {
      name: "Rohit Shinde",
      studentId: "22CS045",
      room: "A-312",
      phone: "+91 98220 11223"
    },
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    assignedTo: "Network Team (IT Dept)",
    estimatedCompletion: "Tomorrow 12:00 PM",
    resolutionNotes: null,
    resolvedAt: null,
    upvotes: 11,
    upvotedBy: ["22CS045", "22CS048", "23CS108"],
    isDuplicateOf: null,
    history: [
      {
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        action: "Complaint Submitted",
        status: "Submitted",
        actor: "Rohit Shinde (Student)",
        note: "Submitted through portal.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        action: "Acknowledged",
        status: "Acknowledged",
        actor: "Warden Office",
        note: "Logged ticket with Computer Center network admin.",
        isPublic: true
      }
    ],
    publicUpdates: [
      {
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        message: "Campus IT has been notified. Power over Ethernet switch will be rebooted during maintenance window.",
        author: "Warden Office"
      }
    ],
    internalNotes: [
      {
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        message: "IT Helpdesk ticket reference: #CC-NET-8821.",
        author: "Warden Admin"
      }
    ],
    imageAttachment: null
  },
  {
    id: "FMH-2026-0003",
    title: "Sparking in electrical outlet near study table",
    category: "Electricity",
    block: "Block B",
    floor: "1st Floor",
    room: "B-108",
    isCommonArea: false,
    description: "Plug socket makes buzzing sound and visible spark occurred when laptop charger was plugged in. Switched off the room fuse.",
    priority: "Emergency",
    status: "Submitted",
    submittedBy: {
      name: "Karan Patel",
      studentId: "24EC019",
      room: "B-108",
      phone: "+91 97123 44556"
    },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    assignedTo: null,
    estimatedCompletion: null,
    resolutionNotes: null,
    resolvedAt: null,
    upvotes: 1,
    upvotedBy: ["24EC019"],
    isDuplicateOf: null,
    history: [
      {
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        action: "Emergency Complaint Submitted",
        status: "Submitted",
        actor: "Karan Patel (Student)",
        note: "Emergency safety hazard reported. Urgent attention requested.",
        isPublic: true
      }
    ],
    publicUpdates: [],
    internalNotes: [],
    imageAttachment: null
  },
  {
    id: "FMH-2026-0004",
    title: "Broken window latch allowing rain water entry",
    category: "Furniture",
    block: "Block C",
    floor: "2nd Floor",
    room: "C-220",
    isCommonArea: false,
    description: "The window latch on the outer pane is snapped. During night rain water leaks onto study desk and books.",
    priority: "Medium",
    status: "Resolved",
    submittedBy: {
      name: "Sneha Nair",
      studentId: "23EE054",
      room: "C-220",
      phone: "+91 94471 99887"
    },
    createdAt: new Date(Date.now() - 76 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    assignedTo: "Mohan (Carpentry)",
    estimatedCompletion: "Completed",
    resolutionNotes: "Installed brand new brass tower bolt and adjusted hinge alignment. Tested closure with student present.",
    resolvedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    upvotes: 0,
    upvotedBy: [],
    isDuplicateOf: null,
    history: [
      {
        timestamp: new Date(Date.now() - 76 * 3600 * 1000).toISOString(),
        action: "Complaint Submitted",
        status: "Submitted",
        actor: "Sneha Nair (Student)",
        note: "Submitted through portal.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
        action: "Acknowledged",
        status: "Acknowledged",
        actor: "Warden Office",
        note: "Assigned to carpentry staff Mohan.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
        action: "In Progress",
        status: "In Progress",
        actor: "Mohan (Carpenter)",
        note: "Procuring hardware from store.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        action: "Resolved",
        status: "Resolved",
        actor: "Warden Office",
        note: "Installed brand new brass tower bolt and adjusted hinge alignment.",
        isPublic: true
      }
    ],
    publicUpdates: [
      {
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        message: "Work completed and verified by room occupant.",
        author: "Warden Office"
      }
    ],
    internalNotes: [
      {
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        message: "Cost of replacement latch: INR 120 from hostel maintenance fund.",
        author: "Warden Office"
      }
    ],
    imageAttachment: null
  },
  {
    id: "FMH-2026-0005",
    title: "Water cooler purifier filter replacement needed",
    category: "Water Supply",
    block: "Block B",
    floor: "Ground Floor",
    room: "Mess Dining Entrance",
    isCommonArea: true,
    description: "The drinking water cooler near the dining hall entrance has a bad taste and the RO filter change indicator lamp is red.",
    priority: "High",
    status: "Overdue", // Demo overdue case (started > 60 hours ago and still unhandled/open)
    submittedBy: {
      name: "Vikas Rao",
      studentId: "21ME110",
      room: "B-004",
      phone: "+91 98840 33441"
    },
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    assignedTo: null,
    estimatedCompletion: null,
    resolutionNotes: null,
    resolvedAt: null,
    upvotes: 18,
    upvotedBy: ["21ME110", "23CS108"],
    isDuplicateOf: null,
    history: [
      {
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        action: "Complaint Submitted",
        status: "Submitted",
        actor: "Vikas Rao (Student)",
        note: "Submitted through portal.",
        isPublic: true
      }
    ],
    publicUpdates: [],
    internalNotes: [
      {
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        message: "Vendor AMC technician called. Waiting on response.",
        author: "Warden Office"
      }
    ],
    imageAttachment: null
  },
  {
    id: "FMH-2026-0006",
    title: "Clogged drainage sink in washroom 3rd floor",
    category: "Cleaning",
    block: "Block D",
    floor: "3rd Floor",
    room: "Washroom D-3",
    isCommonArea: true,
    description: "Sink #2 drainage is clogged with stagnant water overflowing onto the floor tiles. Unhygienic odor.",
    priority: "Medium",
    status: "Resolved",
    submittedBy: {
      name: "Anand Menon",
      studentId: "24CS012",
      room: "D-302",
      phone: "+91 97890 12345"
    },
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
    assignedTo: "CleanPro Sanitation Team",
    estimatedCompletion: "Completed",
    resolutionNotes: "Pipe cleared using chemical unclogger and pressure snake. Basin cleaned and disinfected.",
    resolvedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
    upvotes: 4,
    upvotedBy: ["24CS012"],
    isDuplicateOf: null,
    history: [
      {
        timestamp: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
        action: "Complaint Submitted",
        status: "Submitted",
        actor: "Anand Menon (Student)",
        note: "Submitted through portal.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
        action: "In Progress",
        status: "In Progress",
        actor: "Sanitation Staff",
        note: "Cleaning team deployed.",
        isPublic: true
      },
      {
        timestamp: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
        action: "Resolved",
        status: "Resolved",
        actor: "Warden Office",
        note: "Drain cleared and disinfected.",
        isPublic: true
      }
    ],
    publicUpdates: [
      {
        timestamp: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
        message: "Sanitation team cleared blockage. Restored for use.",
        author: "Warden Office"
      }
    ],
    internalNotes: [],
    imageAttachment: null
  }
];

// Realistic Initial Sample Notices and Schedules
const INITIAL_SAMPLE_NOTICES = [
  {
    id: "NOT-2026-0001",
    title: "Overhead Water Tank Cleaning & Chlorination",
    category: "Water Supply",
    targetAudience: "All Blocks",
    description: "Annual cleaning and chemical chlorination of main overhead storage tanks will be carried out this Saturday. Water supply will be suspended between 9:00 AM and 2:00 PM. Please store sufficient drinking water in advance.",
    publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    priority: "Urgent",
    scheduledDate: "Saturday, 9:00 AM - 2:00 PM",
    isMaintenance: true,
    status: "Scheduled"
  },
  {
    id: "NOT-2026-0002",
    title: "Campus Wi-Fi Core Router Firmware Upgrade",
    category: "Wi-Fi",
    targetAudience: "Block A & Block B",
    description: "Central IT services will update hostel network distribution switches. Expect intermittent connectivity interruptions of 15-20 minutes on Wednesday night between 1:00 AM and 3:00 AM.",
    publishedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    priority: "Normal",
    scheduledDate: "Wednesday Night (1:00 AM - 3:00 AM)",
    isMaintenance: true,
    status: "Scheduled"
  },
  {
    id: "NOT-2026-0003",
    title: "Weekly Pest Control & Fogging in Common Areas",
    category: "Pest Control",
    targetAudience: "All Blocks",
    description: "Vector control and anti-mosquito fogging will occur around hostel corridors, lawns, and drainage canals. Keep windows closed during fogging hours.",
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    priority: "Normal",
    scheduledDate: "Friday Evening (4:30 PM - 6:30 PM)",
    isMaintenance: true,
    status: "Scheduled"
  },
  {
    id: "NOT-2026-0004",
    title: "Past Fire Drill & Alarm Testing Completed",
    category: "General",
    targetAudience: "All Blocks",
    description: "The quarterly fire drill testing was completed successfully last week. All hose reels and fire extinguishers have been certified.",
    publishedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // Expired
    priority: "Normal",
    scheduledDate: "Completed",
    isMaintenance: false,
    status: "Completed"
  }
];

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    try {
      // Initialize Complaints if not present
      if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_SAMPLE_COMPLAINTS));
      }

      // Initialize Notices if not present
      if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_SAMPLE_NOTICES));
      }

      // Initialize Student User Profile if not present
      if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_STUDENT_PROFILE));
      }

      // Initialize Upvotes if not present
      if (!localStorage.getItem(STORAGE_KEYS.VOTES)) {
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(["FMH-2026-0001", "FMH-2026-0002"]));
      }
    } catch (e) {
      console.error("Storage initialization error:", e);
    }
  }

  // --- Complaints Retrieval and Manipulation ---

  getComplaints() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse complaints from storage:", e);
      return [];
    }
  }

  saveComplaints(complaints) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
      return true;
    } catch (e) {
      console.error("Failed to save complaints to storage (quota exceeded?):", e);
      alert("Storage quota exceeded or storage unavailable. Changes could not be saved.");
      return false;
    }
  }

  getComplaintById(id) {
    const complaints = this.getComplaints();
    return complaints.find(c => c.id.toUpperCase() === id.toUpperCase()) || null;
  }

  /**
   * Generates a persistent, reliable, unique complaint ID: FMH-2026-XXXX
   * Computes the highest existing ID number from stored records so it never clashes
   */
  generateComplaintId() {
    const complaints = this.getComplaints();
    const currentYear = new Date().getFullYear();
    let maxNum = 0;
    
    complaints.forEach(c => {
      if (c.id && c.id.startsWith(`FMH-${currentYear}-`)) {
        const parts = c.id.split('-');
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `FMH-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  }

  addComplaint(newComplaint) {
    const complaints = this.getComplaints();
    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);
    return newComplaint;
  }

  updateComplaint(id, updateFn) {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const current = complaints[index];
    const updated = updateFn(current);
    updated.updatedAt = new Date().toISOString();
    complaints[index] = updated;

    this.saveComplaints(complaints);
    return updated;
  }

  // --- Upvoting Community Issues ---

  getVotedIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  hasVoted(complaintId) {
    const votes = this.getVotedIds();
    return votes.includes(complaintId);
  }

  toggleVote(complaintId, studentId = "23CS108") {
    const votes = this.getVotedIds();
    const hasVoted = votes.includes(complaintId);
    let updatedComplaint = null;

    if (hasVoted) {
      // Remove vote
      const newVotes = votes.filter(id => id !== complaintId);
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(newVotes));

      updatedComplaint = this.updateComplaint(complaintId, c => {
        c.upvotes = Math.max(0, (c.upvotes || 0) - 1);
        if (Array.isArray(c.upvotedBy)) {
          c.upvotedBy = c.upvotedBy.filter(id => id !== studentId);
        }
        return c;
      });
      return { voted: false, count: updatedComplaint ? updatedComplaint.upvotes : 0 };
    } else {
      // Add vote
      votes.push(complaintId);
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));

      updatedComplaint = this.updateComplaint(complaintId, c => {
        c.upvotes = (c.upvotes || 0) + 1;
        if (!Array.isArray(c.upvotedBy)) c.upvotedBy = [];
        if (!c.upvotedBy.includes(studentId)) c.upvotedBy.push(studentId);
        return c;
      });
      return { voted: true, count: updatedComplaint ? updatedComplaint.upvotes : 0 };
    }
  }

  // --- Notices ---

  getNotices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  saveNotices(notices) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
      return true;
    } catch (e) {
      return false;
    }
  }

  generateNoticeId() {
    const notices = this.getNotices();
    const currentYear = new Date().getFullYear();
    let maxNum = 0;
    notices.forEach(n => {
      if (n.id && n.id.startsWith(`NOT-${currentYear}-`)) {
        const parts = n.id.split('-');
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `NOT-${currentYear}-${String(maxNum + 1).padStart(4, '0')}`;
  }

  addNotice(notice) {
    const notices = this.getNotices();
    notices.unshift(notice);
    this.saveNotices(notices);
    return notice;
  }

  updateNotice(id, updatedNotice) {
    const notices = this.getNotices();
    const idx = notices.findIndex(n => n.id === id);
    if (idx !== -1) {
      notices[idx] = { ...notices[idx], ...updatedNotice };
      this.saveNotices(notices);
      return notices[idx];
    }
    return null;
  }

  deleteNotice(id) {
    const notices = this.getNotices();
    const filtered = notices.filter(n => n.id !== id);
    this.saveNotices(filtered);
    return true;
  }

  // --- User Profiles & Roles ---

  getUserProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_STUDENT_PROFILE;
    } catch (e) {
      return DEFAULT_STUDENT_PROFILE;
    }
  }

  saveUserProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  getRole() {
    if (window.authManager && window.authManager.isAuthenticated()) {
      return window.authManager.getRole();
    }
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || null;
  }

  setRole(role) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  }

  // --- Analytics & Statistics Calculations ---

  getStudentComplaints(studentId) {
    if (!studentId) return [];
    return this.getComplaints().filter(c => 
      c.submittedBy && c.submittedBy.studentId && 
      c.submittedBy.studentId.toUpperCase() === studentId.toUpperCase()
    );
  }

  getRecentComplaints(limit = 5, filterStudentId = null) {
    let complaints = this.getComplaints();
    if (filterStudentId) {
      complaints = complaints.filter(c => 
        c.submittedBy && c.submittedBy.studentId && 
        c.submittedBy.studentId.toUpperCase() === filterStudentId.toUpperCase()
      );
    }
    return complaints.slice(0, limit);
  }

  getStatistics(filterStudentId = null) {
    let complaints = this.getComplaints();
    if (filterStudentId) {
      complaints = complaints.filter(c => 
        c.submittedBy && c.submittedBy.studentId && 
        c.submittedBy.studentId.toUpperCase() === filterStudentId.toUpperCase()
      );
    }
    const now = Date.now();

    const isResolved = c => c.status === 'Resolved';
    const isOpen = c => ['Submitted', 'Acknowledged', 'In Progress', 'Reopened', 'Overdue'].includes(c.status);

    const total = complaints.length;
    const resolved = complaints.filter(isResolved).length;
    const open = complaints.filter(isOpen).length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const acknowledged = complaints.filter(c => c.status === 'Acknowledged').length;
    const reopened = complaints.filter(c => c.status === 'Reopened').length;

    // Urgent Open = Open AND (Priority is Emergency OR High)
    const urgentOpen = complaints.filter(c => isOpen(c) && (c.priority === 'Emergency' || c.priority === 'High')).length;

    // Overdue Open calculation demo rule:
    // Any open complaint that is status 'Overdue', or age > 48h, or emergency open > 24h
    const overdueCount = complaints.filter(c => {
      if (!isOpen(c)) return false;
      if (c.status === 'Overdue') return true;
      const ageHours = (now - new Date(c.createdAt).getTime()) / (1000 * 3600);
      if (c.priority === 'Emergency' && ageHours > 24) return true;
      if (ageHours > 48) return true;
      return false;
    }).length;

    // Average resolution time in hours for resolved complaints
    let totalResolutionHours = 0;
    let resolvedCountWithTimestamps = 0;
    complaints.filter(isResolved).forEach(c => {
      if (c.createdAt && c.resolvedAt) {
        const diffHours = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600);
        if (diffHours >= 0) {
          totalResolutionHours += diffHours;
          resolvedCountWithTimestamps++;
        }
      }
    });

    const avgResolutionHours = resolvedCountWithTimestamps > 0 
      ? Math.round(totalResolutionHours / resolvedCountWithTimestamps) 
      : 0;

    // Breakdown by Category
    const byCategory = {};
    complaints.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });

    // Breakdown by Status
    const byStatus = {
      Submitted: submitted,
      Acknowledged: acknowledged,
      'In Progress': inProgress,
      Resolved: resolved,
      Reopened: reopened,
      Overdue: overdueCount
    };

    // Breakdown by Hostel Block
    const byBlock = {};
    complaints.forEach(c => {
      const b = c.block || 'Unassigned';
      byBlock[b] = (byBlock[b] || 0) + 1;
    });

    // Most frequently reported category
    let topCategory = 'None';
    let topCategoryCount = 0;
    Object.entries(byCategory).forEach(([cat, count]) => {
      if (count > topCategoryCount) {
        topCategoryCount = count;
        topCategory = cat;
      }
    });

    return {
      total,
      open,
      inProgress,
      resolved,
      submitted,
      acknowledged,
      reopened,
      urgentOpen,
      overdueCount,
      avgResolutionHours,
      byCategory,
      byStatus,
      byBlock,
      topCategory,
      topCategoryCount
    };
  }

  // --- Reset Demo Data with Explicit Confirmation ---

  resetDemoData() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_SAMPLE_COMPLAINTS));
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_SAMPLE_NOTICES));
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_STUDENT_PROFILE));
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(["FMH-2026-0001", "FMH-2026-0002"]));
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, 'student');
      return true;
    } catch (e) {
      console.error("Failed to reset demo data:", e);
      return false;
    }
  }

  // --- CSV Export Helper (Proper Escaping & Safe from Formula Injection) ---

  exportComplaintsToCSV() {
    const complaints = this.getComplaints();
    if (!complaints.length) {
      alert("No complaint records to export.");
      return;
    }

    const headers = [
      "Complaint ID",
      "Title",
      "Category",
      "Hostel Block",
      "Floor",
      "Room / Area",
      "Common Area",
      "Priority",
      "Status",
      "Created At",
      "Updated At",
      "Assigned To",
      "Resolved At",
      "Upvotes",
      "Student Name",
      "Student ID",
      "Public Resolution Notes"
    ];

    const sanitizeCell = value => {
      if (value === null || value === undefined) return '""';
      let str = String(value);

      // Prevent spreadsheet formula injection attacks (=, +, -, @, tab, cr)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }

      // Escape quotes by doubling them
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = complaints.map(c => [
      sanitizeCell(c.id),
      sanitizeCell(c.title),
      sanitizeCell(c.category),
      sanitizeCell(c.block),
      sanitizeCell(c.floor),
      sanitizeCell(c.room),
      sanitizeCell(c.isCommonArea ? "Yes" : "No"),
      sanitizeCell(c.priority),
      sanitizeCell(c.status),
      sanitizeCell(new Date(c.createdAt).toLocaleString()),
      sanitizeCell(new Date(c.updatedAt).toLocaleString()),
      sanitizeCell(c.assignedTo || "Unassigned"),
      sanitizeCell(c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : "N/A"),
      sanitizeCell(c.upvotes || 0),
      sanitizeCell(c.submittedBy ? c.submittedBy.name : "N/A"),
      sanitizeCell(c.submittedBy ? c.submittedBy.studentId : "N/A"),
      sanitizeCell(c.resolutionNotes || "None")
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(r => r.join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `fix_my_hostel_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }
}

// Global singleton instance for access across modules
window.storageManager = new StorageManager();
