# 🏡 Fix My Hostel
### Hostel Complaint & Maintenance Management System

Fix My Hostel is a web-based hostel complaint and maintenance management application designed to make hostel living more convenient by simplifying issue reporting, complaint tracking, and maintenance coordination.

The application provides a welcoming landing page and separate portals for students and wardens. Students can report hostel issues and monitor their complaint progress, while wardens can review complaints, manage their status, and coordinate maintenance activities.

Built using **HTML5, CSS3, and vanilla JavaScript**, the project demonstrates how a lightweight web application can improve communication between hostel residents and administration without requiring a frontend framework.

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [Application Workflow](#-application-workflow)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Application Pages](#-application-pages)
- [Complaint Management](#-complaint-management)
- [Data Storage](#-data-storage)
- [User Interface and Design](#-user-interface-and-design)
- [Demo Accounts](#-demo-accounts)
- [Testing](#-testing)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## 📖 About the Project

Hostel maintenance issues such as leaking taps, faulty electrical equipment, Wi-Fi connectivity problems, damaged furniture, and water supply interruptions can affect students' everyday lives.

When these issues are reported through paper registers or informal messages, tracking their progress and ensuring timely resolution can become difficult.

**Fix My Hostel** provides a centralized interface for reporting and managing these issues. It helps students submit complaints with relevant details and enables wardens to organize, review, and update maintenance requests.

The application is developed as a college mini-project using standard web technologies.

## ❗ Problem Statement

Traditional hostel complaint management can involve several challenges:

- Complaints may be scattered across registers, messages, or verbal reports.
- Students may not know whether their issues have been acknowledged.
- Urgent complaints can be difficult to identify among routine requests.
- Wardens may lack a centralized view of pending and resolved complaints.
- Maintaining complaint histories and monitoring maintenance progress can be inconvenient.

### Proposed Solution

Fix My Hostel offers a digital complaint management interface where students can report hostel issues and wardens can manage complaint progress through a structured workflow.

## 🎯 Objectives

- Simplify hostel complaint submission.
- Provide students with a way to track their complaints.
- Organize maintenance requests by category, priority, and status.
- Help wardens identify pending and urgent issues.
- Maintain complaint records within the application.
- Provide a clean, responsive, and accessible user interface.
- Demonstrate frontend development using HTML, CSS, and JavaScript.

## ✨ Key Features

### 🏠 1. Animated Landing Page

- Dedicated welcome page introducing Fix My Hostel.
- Existing project logo and application name.
- Subtle background and logo animations.
- Short introduction and feature highlights.
- A prominent **Get Started** button that navigates to portal selection.
- Responsive layout designed to fit common desktop viewports at 100% zoom.

### 👩‍🎓 2. Student Portal

- Student registration and login interfaces.
- Student-specific dashboard.
- Complaint submission form.
- Complaint status tracking.
- View personal complaint records.
- Search, filter, and sort complaints, where implemented.
- Access to relevant hostel notices and maintenance information, where implemented.

### 🛠️ 3. Warden Portal

- Separate warden login interface.
- Dashboard for reviewing hostel complaints.
- View complaints submitted by students.
- Update complaint statuses.
- Review complaint details and history, where implemented.
- Manage maintenance information and notices, where implemented.
- View complaint statistics, where implemented.

### 📝 4. Complaint Reporting

Students can report common hostel problems, including:

- Plumbing
- Electricity
- Cleaning and sanitation
- Wi-Fi and internet
- Furniture
- Security
- Water supply
- Other maintenance issues

Depending on the implemented form, complaints can include the hostel location, room number, issue description, priority, and optional image preview.

### 🔄 5. Complaint Tracking

The application supports a structured complaint lifecycle, depending on the implemented functionality:

1. **Submitted** — The student reports an issue.
2. **Acknowledged** — The complaint is reviewed.
3. **In Progress** — Maintenance work has started.
4. **Resolved** — The issue is marked as resolved.
5. **Reopened** — A resolved issue may be reopened when further attention is required.

Status history, timestamps, and progress updates can help users understand the current state of a complaint where these features are implemented.

### 📢 6. Notices and Maintenance

The application can provide separate pages for:

- Hostel notices and announcements.
- Maintenance schedules.
- Water supply updates.
- Other relevant maintenance information.

### 👥 7. Community Issues

If enabled in the current implementation, the community page allows students to explore shared hostel issues and upvote common-area problems.

This can help highlight issues that affect multiple residents.

### 🚨 8. Emergency Contacts

A dedicated emergency contacts page provides access to the contact information configured for the project.

The page is intended to be accessible without student or warden login so visitors can view emergency information directly.

> Emergency contact details should be verified before real-world use. The application does not guarantee that an emergency report will notify hostel authorities.

### 📊 9. Dashboard and Analytics

Where implemented, dashboards can display complaint summaries such as:

- Total complaints
- Pending complaints
- Complaints in progress
- Resolved complaints
- Recent complaint activity
- Urgent or overdue issues

Statistics should be calculated from actual application records rather than hard-coded demonstration values.

## 🔄 Application Workflow

The typical navigation flow is:

```text
Landing Page
     |
     v
Get Started
     |
     v
Portal Selection
     |
     +-----------------------+
     |                       |
     v                       v
Student Portal          Warden Portal
     |                       |
     v                       v
Student Login            Warden Login
     |                       |
     v                       v
Student Dashboard       Warden Dashboard
     |                       |
     v                       v
Submit and Track        Review and Manage
Complaints              Complaints
```

The landing page introduces the application, while portal selection directs users to the appropriate login or registration page.

Emergency contacts are intended to remain publicly accessible without requiring authentication.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Styling, animations, responsive layouts, and hover effects |
| Vanilla JavaScript | Form validation, application logic, navigation, and interactivity |
| Browser localStorage | Local demo data persistence |
| SVG | Logo and interface icons |
| Git | Version control |
| GitHub | Source-code hosting |
| Visual Studio Code / Antigravity | Development environment |

The project does not require a frontend framework or external database for its current frontend-only demonstration.

## 📁 Project Structure

The following is an illustrative structure. Your actual repository may contain additional files or combine functionality differently.

```text
College_Issue_Maintainance/
│
├── index.html
├── landingpage.html
├── login-selection.html
│
├── student-login.html
├── student-register.html
├── warden-login.html
│
├── student-dashboard.html
├── warden-dashboard.html
├── complaints.html
├── complaint-details.html
│
├── community.html
├── notices.html
├── maintenance.html
├── analytics.html
├── emergency-contacts.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── storage.js
│   ├── complaints.js
│   ├── admin.js
│   └── validation.js
│
├── assets/
│   └── logo.svg
│
└── README.md
```

**Note:** Keep the project structure in this README aligned with the actual files in your repository. Remove any filenames that do not exist.

## 🚀 Getting Started

### Prerequisites

You need:

- A modern web browser.
- Visual Studio Code or another code editor.
- Git, if you want to clone the repository.
- The Live Server extension for Visual Studio Code, or another local static web server.

No package installation should be necessary for a purely static HTML/CSS/JavaScript implementation.

### 1. Clone the Repository

Replace the placeholders with your actual GitHub username and repository name.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

Navigate to the project directory:

```bash
cd College_Issue_Maintainance
```

### 2. Open the Project

Open the project folder in Visual Studio Code.

```bash
code .
```

If the `code` command is unavailable, open Visual Studio Code manually and select the project folder.

### 3. Run the Application

Using Live Server:

1. Open the project in Visual Studio Code.
2. Install the Live Server extension if needed.
3. Open the configured entry page.
4. Right-click the HTML file and select **Open with Live Server**.

If `index.html` redirects to `landingpage.html`, opening `index.html` should take you to the welcome page.

Alternatively, run a simple local server from the project directory if Python is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

If necessary, visit `landingpage.html` directly until the default entry point is configured.

## 🧭 Application Pages

| Page | Purpose |
|---|---|
| `index.html` | Default entry point, if configured |
| `landingpage.html` | Animated welcome page |
| `login-selection.html` | Select student or warden portal |
| `student-login.html` | Student login |
| `student-register.html` | Student registration |
| `warden-login.html` | Warden login |
| `student-dashboard.html` | Student dashboard |
| `warden-dashboard.html` | Warden dashboard |
| `complaints.html` | Complaint listing and management |
| `complaint-details.html` | Individual complaint details |
| `community.html` | Shared hostel issues, if implemented |
| `notices.html` | Hostel notices |
| `maintenance.html` | Maintenance information |
| `analytics.html` | Complaint analytics |
| `emergency-contacts.html` | Public emergency contact information |

Page availability and responsibilities should be confirmed against the current source code.

## 💾 Data Storage

The application uses browser `localStorage` for demonstration data, according to the current frontend architecture.

Depending on implementation, stored data may include:

- Registered student records.
- Complaint records.
- Complaint status changes.
- Demo authentication session information.
- Notices and maintenance records.
- Community issue and voting data.

### How to Inspect Stored Data

1. Open the application in Chrome.
2. Press `F12` or `Ctrl + Shift + I`.
3. Select the **Application** tab.
4. Expand **Storage → Local Storage**.
5. Select your website origin, such as `http://localhost:5500`.
6. Inspect the available keys and values.

The exact storage keys depend on the JavaScript implementation.

### Important Storage Characteristics

- Data may persist after refreshing the page.
- Data is generally limited to the same browser profile and website origin.
- Data is not automatically shared between students using different devices.
- Clearing browser site data may delete application records.
- GitHub stores the source code, not the browser's localStorage records.

For a college-wide deployment, a shared backend and database would be required.

## 🎨 User Interface and Design

Fix My Hostel uses a sage-green and warm-neutral visual theme intended to feel calm, readable, and professional.

### Design Palette

| Purpose | Color |
|---|---|
| Primary sage | `#66816A` |
| Primary hover | `#536C56` |
| Dark sage | `#374E3C` |
| Page background | `#F6F7F2` |
| Card background | `#FFFDF8` |
| Main text | `#303831` |
| Secondary text | `#74786F` |
| Border | `#E3E6DC` |
| Light sage | `#E9EEE5` |
| Muted terracotta | `#C77D62` |

### UI Principles

- Consistent colors and typography.
- Clear navigation and readable forms.
- Responsive layouts for desktop and mobile.
- Subtle landing-page animations.
- Clear hover and keyboard-focus states.
- Accessible labels and validation feedback.
- Consistent button styling.
- Compact layouts that avoid unnecessary scrolling on common desktop viewports.

The landing page has its own styles so that its animations and layout can be adjusted without unnecessarily affecting the other application pages.

## 🔑 Demo Accounts

The following credentials are configured as demonstration accounts in the described project. Verify that they match your current `auth.js` before using them.

### Student Demo

| Field | Value |
|---|---|
| Student ID | `23CS108` |
| Email | `aditya.v@hostel.edu` |
| Password | `hostel123` |

### Warden Demo

| Field | Value |
|---|---|
| Username | `warden` |
| Email | `warden.office@hostel.edu` |
| Password | `admin123` |

These are example credentials for a local demonstration, not real production accounts.

**Security note:** Do not use these credentials for real accounts or reuse them elsewhere.

## 🧪 Testing Checklist

Before submitting or demonstrating the project, verify the following.

### Landing Page

- [ ] The landing page opens first using the configured entry point.
- [ ] The logo loads correctly.
- [ ] The Get Started button opens portal selection.
- [ ] Animations work as expected.
- [ ] The layout fits a common desktop viewport at 100% zoom.
- [ ] No horizontal scrolling occurs.
- [ ] Mobile layout remains usable.

### Authentication

- [ ] Student registration works.
- [ ] Required fields are validated.
- [ ] Student login works with configured demo credentials.
- [ ] Warden login works with configured demo credentials.
- [ ] Student and warden navigation remain separate.
- [ ] Logout works as intended.
- [ ] Emergency contacts can be opened without logging in.

### Complaint Management

- [ ] Students can submit valid complaints.
- [ ] Complaint records appear in the appropriate views.
- [ ] Warden complaint management works as expected.
- [ ] Status changes display correctly.
- [ ] Search and filters work, if implemented.
- [ ] Invalid complaint IDs are handled gracefully.

### Data and Interface

- [ ] Expected data persists after refresh.
- [ ] Empty states display correctly.
- [ ] Buttons retain readable text on hover.
- [ ] Stylesheets load on every page.
- [ ] No broken navigation links remain.
- [ ] Browser console errors are investigated.

Only mark a test as passed after actually checking it.

## ⚠️ Limitations

Fix My Hostel is currently intended as an educational frontend demonstration.

Because it relies on browser-side JavaScript and localStorage:

- Data is not centrally synchronized across users.
- Browser-only authentication can be bypassed.
- Local storage is not suitable for confidential student information.
- The application does not automatically dispatch real maintenance staff.
- Emergency contact information must be verified independently.
- Notifications are not guaranteed unless a notification service is integrated.
- Data may be lost if browser site data is cleared.

For production use, the application would need server-side authentication, authorization, persistent database storage, secure data handling, and proper operational monitoring.

## 🔮 Future Enhancements

Potential future improvements include:

- Backend integration using Java Spring Boot or Node.js.
- A shared MySQL or PostgreSQL database.
- Secure authentication and role-based authorization.
- Email or in-app notifications.
- Real-time complaint status updates.
- Maintenance staff accounts and task assignments.
- Complaint feedback and satisfaction ratings.
- Secure image uploads.
- Advanced analytics and report generation.
- Preventive maintenance scheduling.
- English and Telugu language support.
- Deployment with HTTPS and appropriate security controls.

These are potential enhancements rather than claims that every feature is already implemented.

## 🤝 Contributing

Suggestions and contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the relevant workflows.
5. Commit your changes with a descriptive message.
6. Open a pull request describing your improvements.

For a college mini-project, you can also submit suggestions through GitHub Issues.

## 📄 License

No license has been specified for this project yet.

If you want other developers to reuse and modify your code, consider selecting an open-source license, such as the MIT License, and adding the appropriate `LICENSE` file.

## 👩‍💻 Author

**Vindula Sruthi**

B.Tech Information Technology Student

Shri Vishnu Engineering College for Women

GitHub: [Add your GitHub profile URL]

---

⭐ If you find this project useful, consider starring the repository!

**Fix My Hostel — Making hostel complaint reporting and maintenance management simpler, clearer, and more organized.**
