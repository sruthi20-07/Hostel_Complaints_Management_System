# Fix My Hostel — Hostel Complaint & Maintenance Management System

> **College Mini-Project:** A browser-based, offline-capable complaint and facility maintenance management system designed to solve recurring hostel infrastructure issues.

---

## 1. Problem Statement

Hostel students regularly encounter facility failures involving plumbing, water supply, electricity, Wi-Fi connectivity, cleanliness, furniture, and safety. In traditional hostel settings, these problems are reported verbally, through informal chat groups, or via paper registers.

Such methods lead to:
- Overlooked or lost complaints.
- Repeated duplicate submissions from multiple students for shared facilities.
- Unclear priorities and delayed technician dispatch.
- Lack of transparency into repair timelines.
- Zero analytics on recurring infrastructure failure hotspots.

**Fix My Hostel** provides a centralized, human-designed interface for students to report issues, track real-time status updates, view official warden notices, and upvote shared common-area concerns. A simulated warden management dashboard allows administration to triage complaints, prioritize emergency cases, allocate maintenance technicians, record student-visible updates, maintain internal management notes, and review live facility analytics.

---

## 2. Technology Stack & Architectural Constraints

In accordance with strict project guidelines, the entire system is built **without external frameworks or backend servers**:

- **Structure:** Semantic HTML5 with accessible markup.
- **Styling:** Vanilla CSS3 with CSS Custom Properties, flexbox, and responsive grid layouts.
- **Logic:** Native Vanilla JavaScript (ES6+), modularized into focused controllers.
- **Data Persistence:** Browser `localStorage` with versioned keys (`fmh_complaints_v1`, `fmh_notices_v1`, etc.).
- **Icons:** Inline SVG vector icons (consistent stroke width and dimension; no external icon font libraries required).
- **Charts & Visualizations:** Pure HTML/CSS bar and distribution visualizations in the design system palette (no third-party chart libraries).
- **Zero Build Process:** Runs immediately via VS Code Live Server or any static web server (`python -m http.server 5500`).

---

## 3. Design System — Sage Green & Warm Neutrals

The application strictly adheres to a professional **non-blue, non-purple** palette tailored for an institution utility:

| Token | Hex Value | Application |
|---|---|---|
| `--color-primary` | `#66816A` | Primary Sage Green (actions, active tabs, brand accents) |
| `--color-primary-hover` | `#536C56` | Hover state for buttons and controls |
| `--color-bg-page` | `#F6F7F2` | Gentle warm-tinted page background |
| `--color-bg-card` | `#FFFDF8` | Card and container background |
| `--color-text-main` | `#303831` | High-contrast readable charcoal text |
| `--color-text-secondary` | `#74786F` | Secondary labels and descriptions |
| `--color-border` | `#E3E6DC` | Structural dividers and input borders |
| `--color-accent` | `#C77D62` | Muted terracotta accent for notices & highlights |
| `--color-primary-light` | `#E9EEE5` | Light sage badge and hover fill |

### Semantic Status Colors
Every status features a clear text label and meaningful SVG icon:
- **Submitted:** `#F0F0EA` background, dark grey text (`#41473F`).
- **Acknowledged:** `#F7E8C5` background, amber text (`#6B4E10`).
- **In Progress:** `#E9EEE5` background, dark sage text (`#2D4832`).
- **Resolved:** `#DDEBDD` background, forest green text (`#1E4E25`).
- **Reopened:** `#F5E4DC` background, terracotta text (`#6B3423`).
- **Emergency:** `#FBE4E2` background, deep red text (`#781C1A`).
- **Overdue:** `#F9E7D7` background, dark orange text (`#7A3A0E`).

---

## 4. File Structure

```
College_Issue_Maintainance/
├── index.html              # Main single-page application entry point
├── css/
│   └── style.css           # Complete Sage Green & Warm Neutrals design system
├── js/
│   ├── storage.js          # LocalStorage manager, seed records, unique ID generation, CSV export
│   ├── validation.js       # Form validation, duplicate detection, HTML sanitizer
│   ├── complaints.js       # Complaint submission, multi-filter search, timeline, student reopen
│   ├── admin.js            # Warden table, status lifecycle, staff assignments, notes, notices
│   ├── analytics.js        # Dynamic statistics, category/status/block charts, 7-day trend
│   └── app.js              # View router, demo role switcher, modal & toast managers, icon SVGs
├── assets/
│   └── logo.svg            # Custom SVG logo for Fix My Hostel
└── README.md               # Project documentation and test report
```

---

## 5. Key Workflows & Features

### 5.1 Student Experience
1. **Interactive Dashboard:** Live counts of open, in-progress, resolved, and urgent complaints. Shows latest submitted tickets, active warden announcements, and upcoming maintenance.
2. **Comprehensive Complaint Form:**
   - Fields: Title, Category (Plumbing, Electricity, Cleaning, Wi-Fi, Furniture, Security, Water Supply, Other), Block, Floor, Room number (conditional for common areas), Description, Priority (Low, Medium, High, Emergency), optional Photo Attachment.
   - **Inline Validation:** Instant visual feedback on min/max length and required inputs.
   - **Duplicate Detection:** Automatic warning if an existing open complaint shares the same block, category, and room or similar keywords.
   - **Confirmation Step:** Review modal before final submission.
   - **Emergency Callout:** Prominent emergency safety notice with warden desk helplines.
3. **My Complaints & Facility Tracking:**
   - Real-time search by ID, title, or room.
   - Multi-filtering by Status, Category, Priority, and Hostel Block.
   - Sorting by newest, oldest, or priority.
   - Detail modal with complete audit timeline, public progress updates, and resolution notes.
   - **Student Reopen Workflow:** Resolved tickets can be reopened by students if problems recur.
4. **Community Issues Board:** View shared common-area issues with an upvote mechanism to highlight high-priority shared facilities.
5. **Notices & Maintenance Board:** View active hostel announcements and scheduled preventative maintenance.
6. **Profile / Preferences:** Customizable demonstration student profile.

### 5.2 Warden Management
1. **Warden Overview:** High-level metrics on active complaints, urgent cases, overdue tickets (> 48h), and real average resolution time.
2. **All Complaints Management Table:**
   - Comprehensive searchable and filterable table.
   - Status transitions: `Submitted` → `Acknowledged` → `In Progress` → `Resolved`.
   - Maintenance staff assignment: Electricians, Plumbers, Carpenters, Sanitation Team, IT Network Team.
   - **Mandatory Resolution Notes:** Cannot resolve a complaint without documenting the repair details.
   - **Public Progress Updates vs. Internal Notes:** Public updates appear on the student tracking screen; internal notes remain strictly confined to the warden interface.
   - Duplicate linking capability.
3. **Maintenance Management & Notices:** Create, edit, and delete announcements and scheduled maintenance shutdowns.
4. **Analytics & CSV Reporting:** Live charts calculating breakdowns by category, status, block, and volume over time. Generates sanitized CSV downloads protected against spreadsheet formula injection.
5. **Demo Settings & Data Reset:** Reset to original sample records with explicit confirmation.

---

## 6. How to Run Locally

### Option A: VS Code Live Server
1. Open the project folder `College_Issue_Maintainance` in Visual Studio Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.
3. The application will launch in your default browser at `http://127.0.0.1:5500`.

### Option B: Python HTTP Server (Zero Dependencies)
Open terminal or PowerShell in the project directory:
```bash
python -m http.server 5500
```
Open your browser and navigate to:
```
http://localhost:5500
```

---

## 7. Functional Testing & Verification Report

All core requirements and edge cases were tested in a real browser session:

| # | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Valid complaint submission | Generates sequential ID (`FMH-2026-0007`), stores record, shows confirmation modal | ID generated, stored, toast displayed | **PASS** |
| 2 | Browser refresh persistence | Data remains identical after reload without losing tickets | Verified after reload; 7 complaints persisted | **PASS** |
| 3 | Empty / invalid form validation | Displays inline red error messages, prevents submission | Prevented submission with inline error prompts | **PASS** |
| 4 | Duplicate complaint detection | Detects similar issue in same block & category, shows warning banner | Warning banner displayed referencing primary ticket | **PASS** |
| 5 | Role switching (Student ↔ Warden) | Switches views and navigation without altering underlying data | Role toggles instantly; both roles share same storage | **PASS** |
| 6 | Acknowledge & move to In Progress | Warden assigns technician and logs public note; status updates | Staff assigned to Sunder; public note recorded | **PASS** |
| 7 | Mandatory resolution notes | Requires resolution text before resolving; saves and timestamps | Saved resolution notes and timestamp in audit log | **PASS** |
| 8 | Student verification of resolution | Resolution notes & timeline visible to student | Official resolution box and timeline displayed | **PASS** |
| 9 | Internal notes isolation | Internal warden notes hidden from student views | Verified: internal notes only rendered in Warden panel | **PASS** |
| 10 | Student reopen workflow | Allows student to reopen resolved ticket with reason; preserves history | Status moved to Reopened; previous timeline preserved | **PASS** |
| 11 | Multi-filter & search | Combines search keyword + category + block filters correctly | Search and dropdown filters worked synchronously | **PASS** |
| 12 | Community upvoting | Upvotes increment count; toggles on second click | Incremented count and toggled state as expected | **PASS** |
| 13 | Notice expiry handling | Past expiry date notices marked as expired | Calculated dynamically against current date | **PASS** |
| 14 | Real-time analytics charts | Bars update live reflecting actual complaints in storage | Category, status, block, and trend charts updated | **PASS** |
| 15 | CSV export sanitization | Exports CSV file; escapes quotes and neutralizes formulas | Download triggered; formula injection protected | **PASS** |
| 16 | Demo data reset | Confirmation prompt before restoring default seed data | Restores initial records on explicit confirmation | **PASS** |

---

## 8. Limitations & Scope

- **Browser-Local Storage:** All complaint data, notices, and upvotes are stored in the client browser's `localStorage`. Complaints do not sync automatically between different physical devices or separate browser profiles.
- **Demo Role Selector:** The role switcher in the header is designed for demonstration and project evaluation. It does not enforce cryptographic authentication or user login sessions.
- **Simulated Communications:** The application does not send live SMS, email, or WhatsApp alerts to hostel wardens or maintenance staff.

---

## 9. License & Credits

Built as a college mini-project for hostel facility maintenance management.
Designed and implemented with modern Vanilla Web standards (HTML5, CSS3, ES6+ JavaScript).
