/* Shared helpers: API client, session handling, navbar, small UI utilities.
   Change API_URL if the backend runs on another host/port. */
const API_URL = window.API_URL || localStorage.getItem("fjd_api_url") || "http://localhost:8080/api";

const Session = {
  get() { try { return JSON.parse(localStorage.getItem("fjd_session")); } catch (e) { return null; } },
  set(user, email, password) {
    const token = btoa(unescape(encodeURIComponent(email + ":" + password)));
    localStorage.setItem("fjd_session", JSON.stringify({ user, token }));
  },
  clear() { localStorage.removeItem("fjd_session"); }
};

async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const s = Session.get();
  if (token) headers.Authorization = "Basic " + token;
  else if (s) headers.Authorization = "Basic " + s.token;

  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new Error("Cannot reach the server. Is the Spring Boot backend running on port 8080?");
  }
  const text = await res.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch (e) { data = text; } }
  if (!res.ok) {
    if (res.status === 401 && s && !token) { Session.clear(); location.href = "login.html"; }
    throw new Error((data && data.message) || ("Request failed (" + res.status + ")"));
  }
  return data;
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const RISK_COLOR = { LOW: "success", MEDIUM: "warning", HIGH: "danger" };
const STATUS_COLOR = { APPROVED: "success", PENDING_REVIEW: "warning", REJECTED: "danger",
                       APPLIED: "primary", SHORTLISTED: "success" };

function riskBadge(level, score) {
  return `<span class="badge text-bg-${RISK_COLOR[level] || "secondary"}">${esc(level)} risk &middot; ${score}/100</span>`;
}
function statusBadge(status) {
  return `<span class="badge text-bg-${STATUS_COLOR[status] || "secondary"}">${esc(String(status).replace("_", " "))}</span>`;
}
function salaryText(j) {
  const f = n => "₹" + Number(n).toLocaleString("en-IN");
  if (j.salaryMin && j.salaryMax) return f(j.salaryMin) + " - " + f(j.salaryMax) + " / month";
  if (j.salaryMax || j.salaryMin) return f(j.salaryMax || j.salaryMin) + " / month";
  return "Not disclosed";
}
function showAlert(id, message, type = "danger") {
  const el = document.getElementById(id);
  if (el) el.innerHTML = message ? `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${esc(message)}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>` : "";
}

/* Role-aware navbar. Put <div id="nav"></div> at the top of every page. */
function renderNav() {
  const s = Session.get();
  const links = [`<li class="nav-item"><a class="nav-link" href="index.html">Jobs</a></li>`,
                 `<li class="nav-item"><a class="nav-link" href="detector.html">Check a Job</a></li>`];
  let right;
  if (s) {
    const dash = { JOB_SEEKER: "seeker.html", RECRUITER: "recruiter.html", ADMIN: "admin.html" }[s.user.role];
    links.push(`<li class="nav-item"><a class="nav-link" href="${dash}">Dashboard</a></li>`);
    right = `<span class="navbar-text me-3">${esc(s.user.name)} <span class="badge text-bg-light">${esc(s.user.role.replace("_", " "))}</span></span>
             <button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>`;
  } else {
    right = `<a class="btn btn-outline-light btn-sm me-2" href="login.html">Login</a>
             <a class="btn btn-warning btn-sm" href="register.html">Register</a>`;
  }
  document.getElementById("nav").innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark" style="background:#14284f">
    <div class="container">
      <a class="navbar-brand fw-bold" href="index.html">🛡️ FakeJob Detector</a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav me-auto">${links.join("")}</ul>
        <div class="d-flex align-items-center">${right}</div>
      </div>
    </div>
  </nav>`;
}
function logout() { Session.clear(); location.href = "index.html"; }
function requireRole(role) {
  const s = Session.get();
  if (!s || s.user.role !== role) { location.href = "login.html"; return null; }
  return s.user;
}

/* Renders the score circle + reasons used by the detector, job page and recruiter page. */
function analysisHtml(level, score, verdict, reasons) {
  const items = (reasons && reasons.length)
    ? `<ul class="reason-list ps-3 mb-0">${reasons.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`
    : `<p class="text-success mb-0">No red flags detected.</p>`;
  return `<div class="text-center mb-3"><div class="score-circle score-${level}">${score}</div>
          <div class="mt-2 fw-semibold">${esc(verdict || level + " risk")}</div></div>
          <div class="progress risk-meter mb-3"><div class="progress-bar bg-${RISK_COLOR[level]}" style="width:${score}%"></div></div>
          <h6>Why?</h6>${items}`;
}
