# Online Fake Job Portal - Frontend

The frontend interface for the **Fake Job Detector Portal**. It allows job seekers to search and apply for verified jobs or test suspicious job postings with an instant risk assessment tool, recruiters to post and manage jobs, and administrators to moderate flagged postings.

## Tech Stack
* **HTML5 & CSS3**
* **Bootstrap 5.3** (Responsive design, UI components)
* **JavaScript (ES6+, Fetch API)**

## Key Features
* **Role-Based Portals**:
  * **Job Seeker**: Search jobs, view fraud risk score, apply with cover letter, track application status, report suspicious postings.
  * **Recruiter**: Post jobs with immediate fraud detection analysis, manage postings, view applicants, and update application status (Shortlist/Reject).
  * **Admin Moderation Dashboard**: Approve, reject, or delete flagged jobs; view fraud reasons; disable/enable user accounts; view reports.
  * **Public Scam Checker**: Interactive tool (`detector.html`) allowing anyone to paste job text/messages (e.g. from WhatsApp, SMS, Email) and calculate an instant risk score (0-100) with explanation.

## Getting Started

### 1. Prerequisites
Ensure the backend is running on `http://localhost:8080`.
If the backend is running on a different port or domain, update `API_URL` at the top of `js/api.js`:
```javascript
const API_URL = "http://localhost:8080/api";
```

### 2. Run the Frontend
You can serve the static files using any local web server:

**Using Python:**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

**Using VS Code Live Server:**
Right-click `index.html` and click **"Open with Live Server"**.

Alternatively, you can open `index.html` directly in your browser.

## Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@jobportal.com` | `Admin@123` |
| **Recruiter** | `recruiter@brightpath.in` | `Recruiter@123` |
| **Job Seeker** | `seeker@example.com` | `Seeker@123` |

## Backend Repository
Backend service: [online-fake-job-portal-Backend](https://github.com/Yashwanthchava19/online-fake-job-portal-Backend)
