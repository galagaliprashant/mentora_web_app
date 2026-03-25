import './style.css';
import './idle-logout';
import { auth, db, functions } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

// ===== CLOUD FUNCTION REFS =====
const adminUpdateEnrollment = httpsCallable(functions, 'adminUpdateEnrollment');
const adminUpdateEnquiry = httpsCallable(functions, 'adminUpdateEnquiry');

// ===== DOM REFS =====
const loadingEl = document.getElementById('admin-loading')!;
const deniedEl = document.getElementById('admin-denied')!;
const dashboardEl = document.getElementById('admin-dashboard')!;
const enrollmentStatsEl = document.getElementById('enrollment-stats')!;
const enquiryStatsEl = document.getElementById('enquiry-stats')!;
const enrollmentsListEl = document.getElementById('enrollments-list')!;
const enquiriesListEl = document.getElementById('enquiries-list')!;

// Filters
const enrollmentStatusFilter = document.getElementById('enrollment-status-filter') as HTMLSelectElement;
const enrollmentSearch = document.getElementById('enrollment-search') as HTMLInputElement;
const enquiryTypeFilter = document.getElementById('enquiry-type-filter') as HTMLSelectElement;
const enquiryStatusFilter = document.getElementById('enquiry-status-filter') as HTMLSelectElement;
const enquirySearch = document.getElementById('enquiry-search') as HTMLInputElement;

// Confirm modal
const confirmModal = document.getElementById('admin-confirm-modal')!;
const confirmTitle = document.getElementById('admin-confirm-title')!;
const confirmMessage = document.getElementById('admin-confirm-message')!;
const confirmYes = document.getElementById('admin-confirm-yes')!;
const confirmNo = document.getElementById('admin-confirm-no')!;

// ===== DATA STORES =====
interface EnrollmentData {
  id: string;
  uid: string;
  courseId: string;
  courseName: string;
  status: string;
  submittedAt: any;
  reviewedAt: any;
}

interface EnquiryData {
  id: string;
  enquiryType: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
  courseId?: string;
  courseName?: string;
  batchType?: string;
  followUpStatus: string;
  submittedAt: any;
}

interface UserInfo {
  name: string;
  email: string;
}

let allEnrollments: EnrollmentData[] = [];
let allEnquiries: EnquiryData[] = [];
let userMap: Map<string, UserInfo> = new Map();

// ===== AUTH GATE =====
onAuthStateChanged(auth, async (user) => {
  // Update header
  const headerBtn = document.querySelector('.top-bar__login') as HTMLAnchorElement | null;
  const myCoursesBtn = document.querySelector('.top-bar__my-courses') as HTMLAnchorElement | null;

  if (!user) {
    loadingEl.classList.add('hidden');
    deniedEl.classList.remove('hidden');
    if (headerBtn) {
      headerBtn.innerHTML = '<i class="fas fa-user-circle"></i> Student Login';
      headerBtn.href = '/login.html';
      headerBtn.onclick = null;
    }
    myCoursesBtn?.classList.add('hidden');
    return;
  }

  // Update header for logged-in user
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    headerBtn.href = '#';
    headerBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.reload();
    };
  }
  myCoursesBtn?.classList.remove('hidden');

  // Check admin role
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
    loadingEl.classList.add('hidden');
    deniedEl.classList.remove('hidden');
    return;
  }

  // Admin verified — show dashboard
  document.querySelector('.top-bar__admin')?.classList.remove('hidden');
  loadingEl.classList.add('hidden');
  dashboardEl.classList.remove('hidden');
  await loadDashboard();
});

// ===== TAB SWITCHING =====
const tabs = document.querySelectorAll('.admin-tab');
const panels = document.querySelectorAll('.admin-panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('admin-tab--active'));
    panels.forEach((p) => p.classList.remove('admin-panel--active'));
    tab.classList.add('admin-tab--active');
    const targetId = `panel-${(tab as HTMLElement).dataset.tab}`;
    document.getElementById(targetId)?.classList.add('admin-panel--active');
  });
});

// ===== FILTERS =====
enrollmentStatusFilter.addEventListener('change', renderEnrollments);
enrollmentSearch.addEventListener('input', renderEnrollments);
enquiryTypeFilter.addEventListener('change', renderEnquiries);
enquiryStatusFilter.addEventListener('change', renderEnquiries);
enquirySearch.addEventListener('input', renderEnquiries);

// ===== LOAD DASHBOARD =====
async function loadDashboard() {
  await Promise.all([fetchEnrollments(), fetchEnquiries()]);
  renderStats();
  renderEnrollments();
  renderEnquiries();
}

// ===== FETCH ENROLLMENTS =====
async function fetchEnrollments() {
  const q = query(collection(db, 'enrollments'), orderBy('submittedAt', 'desc'));
  const snap = await getDocs(q);

  allEnrollments = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    status: d.data().status || 'pending',
  })) as EnrollmentData[];

  // Batch-fetch user info
  const uids = [...new Set(allEnrollments.map((e) => e.uid))];
  const missingUids = uids.filter((uid) => !userMap.has(uid));

  await Promise.all(
    missingUids.map(async (uid) => {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        userMap.set(uid, { name: data.name || 'Unknown', email: data.email || '' });
      } else {
        userMap.set(uid, { name: 'Deleted User', email: '' });
      }
    })
  );
}

// ===== FETCH ENQUIRIES =====
async function fetchEnquiries() {
  const q = query(collection(db, 'enquiries'), orderBy('submittedAt', 'desc'));
  const snap = await getDocs(q);

  allEnquiries = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    followUpStatus: d.data().followUpStatus || 'new',
  })) as EnquiryData[];
}

// ===== RENDER STATS =====
function renderStats() {
  const pendingEnrollments = allEnrollments.filter((e) => e.status === 'pending').length;
  const approvedEnrollments = allEnrollments.filter((e) => e.status === 'approved').length;
  const rejectedEnrollments = allEnrollments.filter((e) => e.status === 'rejected').length;

  enrollmentStatsEl.innerHTML = `
    <div class="admin-stat-card">
      <div class="admin-stat-card__number">${allEnrollments.length}</div>
      <div class="admin-stat-card__label">Total</div>
    </div>
    <div class="admin-stat-card admin-stat-card--warning">
      <div class="admin-stat-card__number">${pendingEnrollments}</div>
      <div class="admin-stat-card__label">Pending</div>
    </div>
    <div class="admin-stat-card admin-stat-card--success">
      <div class="admin-stat-card__number">${approvedEnrollments}</div>
      <div class="admin-stat-card__label">Approved</div>
    </div>
    <div class="admin-stat-card admin-stat-card--danger">
      <div class="admin-stat-card__number">${rejectedEnrollments}</div>
      <div class="admin-stat-card__label">Rejected</div>
    </div>
  `;

  const newEnquiries = allEnquiries.filter((e) => e.followUpStatus === 'new').length;
  const contactedEnquiries = allEnquiries.filter((e) => e.followUpStatus === 'contacted').length;
  const resolvedEnquiries = allEnquiries.filter((e) => e.followUpStatus === 'resolved').length;

  enquiryStatsEl.innerHTML = `
    <div class="admin-stat-card">
      <div class="admin-stat-card__number">${allEnquiries.length}</div>
      <div class="admin-stat-card__label">Total</div>
    </div>
    <div class="admin-stat-card admin-stat-card--info">
      <div class="admin-stat-card__number">${newEnquiries}</div>
      <div class="admin-stat-card__label">New</div>
    </div>
    <div class="admin-stat-card admin-stat-card--warning">
      <div class="admin-stat-card__number">${contactedEnquiries}</div>
      <div class="admin-stat-card__label">Contacted</div>
    </div>
    <div class="admin-stat-card admin-stat-card--success">
      <div class="admin-stat-card__number">${resolvedEnquiries}</div>
      <div class="admin-stat-card__label">Resolved</div>
    </div>
  `;
}

// ===== FORMAT DATE =====
function formatDate(timestamp: any): string {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// ===== RENDER ENROLLMENTS =====
function renderEnrollments() {
  const statusFilter = enrollmentStatusFilter.value;
  const searchTerm = enrollmentSearch.value.toLowerCase().trim();

  const filtered = allEnrollments.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (searchTerm) {
      const user = userMap.get(e.uid);
      const name = user?.name.toLowerCase() || '';
      const email = user?.email.toLowerCase() || '';
      if (!name.includes(searchTerm) && !email.includes(searchTerm) && !e.courseName.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    enrollmentsListEl.innerHTML = '<p class="admin-empty">No enrollments found.</p>';
    return;
  }

  const rows = filtered
    .map((e) => {
      const user = userMap.get(e.uid) || { name: 'Unknown', email: '' };
      const badgeClass = `admin-badge admin-badge--${e.status}`;
      const actions = getEnrollmentActions(e);

      return `
      <tr data-id="${e.id}">
        <td data-label="Student">${escapeHtml(user.name)}</td>
        <td data-label="Email">${escapeHtml(user.email)}</td>
        <td data-label="Course">${escapeHtml(e.courseName)}</td>
        <td data-label="Status"><span class="${badgeClass}">${e.status}</span></td>
        <td data-label="Submitted">${formatDate(e.submittedAt)}</td>
        <td data-label="Reviewed">${formatDate(e.reviewedAt)}</td>
        <td data-label="Actions" class="admin-actions-cell">${actions}</td>
      </tr>`;
    })
    .join('');

  enrollmentsListEl.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Email</th>
          <th>Course</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Reviewed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Bind action buttons
  enrollmentsListEl.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', handleEnrollmentAction);
  });
}

function getEnrollmentActions(e: EnrollmentData): string {
  const buttons: string[] = [];

  if (e.status === 'pending') {
    buttons.push(`<button class="admin-action-btn admin-action-btn--approve" data-action="approve" data-id="${e.id}" title="Approve"><i class="fas fa-check"></i></button>`);
    buttons.push(`<button class="admin-action-btn admin-action-btn--reject" data-action="reject" data-id="${e.id}" title="Reject"><i class="fas fa-times"></i></button>`);
  } else if (e.status === 'approved') {
    buttons.push(`<button class="admin-action-btn admin-action-btn--revoke" data-action="revoke" data-id="${e.id}" title="Revoke"><i class="fas fa-undo"></i></button>`);
  } else if (e.status === 'rejected') {
    buttons.push(`<button class="admin-action-btn admin-action-btn--approve" data-action="approve" data-id="${e.id}" title="Approve"><i class="fas fa-check"></i></button>`);
  }

  buttons.push(`<button class="admin-action-btn admin-action-btn--delete" data-action="delete" data-id="${e.id}" title="Delete"><i class="fas fa-trash"></i></button>`);

  return buttons.join('');
}

async function handleEnrollmentAction(e: Event) {
  const btn = (e.currentTarget as HTMLElement);
  const action = btn.dataset.action!;
  const enrollmentId = btn.dataset.id!;

  if (action === 'delete' || action === 'reject') {
    const confirmed = await showConfirm(
      `${action === 'delete' ? 'Delete' : 'Reject'} Enrollment`,
      `Are you sure you want to ${action} this enrollment? This ${action === 'delete' ? 'cannot be undone' : 'will deny access to the course'}.`
    );
    if (!confirmed) return;
  }

  btn.classList.add('admin-action-btn--loading');
  btn.setAttribute('disabled', 'true');

  try {
    await adminUpdateEnrollment({ enrollmentId, action });
    await fetchEnrollments();
    renderStats();
    renderEnrollments();
    showToast(`Enrollment ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully.`);
  } catch (err: any) {
    showToast(err.message || 'Action failed. Please try again.', true);
  }
}

// ===== RENDER ENQUIRIES =====
function renderEnquiries() {
  const typeFilter = enquiryTypeFilter.value;
  const statusFilter = enquiryStatusFilter.value;
  const searchTerm = enquirySearch.value.toLowerCase().trim();

  const filtered = allEnquiries.filter((e) => {
    if (typeFilter !== 'all' && e.enquiryType !== typeFilter) return false;
    if (statusFilter !== 'all' && e.followUpStatus !== statusFilter) return false;
    if (searchTerm) {
      const name = e.name?.toLowerCase() || '';
      const email = e.email?.toLowerCase() || '';
      if (!name.includes(searchTerm) && !email.includes(searchTerm)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    enquiriesListEl.innerHTML = '<p class="admin-empty">No enquiries found.</p>';
    return;
  }

  const rows = filtered
    .map((e) => {
      const typeBadge = `admin-badge admin-badge--type-${e.enquiryType}`;
      const statusBadge = `admin-badge admin-badge--${e.followUpStatus}`;
      const detail = e.enquiryType === 'general'
        ? escapeHtml(e.message || '—')
        : `${escapeHtml(e.courseName || '')} (${e.batchType || e.enquiryType})`;
      const actions = getEnquiryActions(e);

      return `
      <tr data-id="${e.id}">
        <td data-label="Type"><span class="${typeBadge}">${e.enquiryType}</span></td>
        <td data-label="Name">${escapeHtml(e.name)}</td>
        <td data-label="Phone">${escapeHtml(e.phone)}</td>
        <td data-label="Email">${escapeHtml(e.email)}</td>
        <td data-label="Details" class="admin-details-cell">${detail}</td>
        <td data-label="Date">${formatDate(e.submittedAt)}</td>
        <td data-label="Status"><span class="${statusBadge}">${e.followUpStatus}</span></td>
        <td data-label="Actions" class="admin-actions-cell">${actions}</td>
      </tr>`;
    })
    .join('');

  enquiriesListEl.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Details</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  enquiriesListEl.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', handleEnquiryAction);
  });
}

function getEnquiryActions(e: EnquiryData): string {
  const buttons: string[] = [];

  if (e.followUpStatus === 'new') {
    buttons.push(`<button class="admin-action-btn admin-action-btn--contacted" data-action="contacted" data-id="${e.id}" title="Mark Contacted"><i class="fas fa-phone"></i></button>`);
    buttons.push(`<button class="admin-action-btn admin-action-btn--resolved" data-action="resolved" data-id="${e.id}" title="Mark Resolved"><i class="fas fa-check-circle"></i></button>`);
  } else if (e.followUpStatus === 'contacted') {
    buttons.push(`<button class="admin-action-btn admin-action-btn--resolved" data-action="resolved" data-id="${e.id}" title="Mark Resolved"><i class="fas fa-check-circle"></i></button>`);
    buttons.push(`<button class="admin-action-btn admin-action-btn--reopen" data-action="reopen" data-id="${e.id}" title="Reopen"><i class="fas fa-undo"></i></button>`);
  } else if (e.followUpStatus === 'resolved') {
    buttons.push(`<button class="admin-action-btn admin-action-btn--reopen" data-action="reopen" data-id="${e.id}" title="Reopen"><i class="fas fa-undo"></i></button>`);
  }

  buttons.push(`<button class="admin-action-btn admin-action-btn--delete" data-action="delete" data-id="${e.id}" title="Delete"><i class="fas fa-trash"></i></button>`);

  return buttons.join('');
}

async function handleEnquiryAction(e: Event) {
  const btn = (e.currentTarget as HTMLElement);
  const action = btn.dataset.action!;
  const enquiryId = btn.dataset.id!;

  if (action === 'delete') {
    const confirmed = await showConfirm(
      'Delete Enquiry',
      'Are you sure you want to delete this enquiry? This cannot be undone.'
    );
    if (!confirmed) return;
  }

  btn.classList.add('admin-action-btn--loading');
  btn.setAttribute('disabled', 'true');

  try {
    await adminUpdateEnquiry({ enquiryId, action });
    await fetchEnquiries();
    renderStats();
    renderEnquiries();
    showToast(action === 'delete' ? 'Enquiry deleted.' : `Enquiry marked as ${action === 'reopen' ? 'new' : action}.`);
  } catch (err: any) {
    showToast(err.message || 'Action failed. Please try again.', true);
  }
}

// ===== CONFIRM MODAL =====
function showConfirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.classList.add('open');

    const cleanup = () => {
      confirmModal.classList.remove('open');
      confirmYes.removeEventListener('click', onYes);
      confirmNo.removeEventListener('click', onNo);
    };

    const onYes = () => { cleanup(); resolve(true); };
    const onNo = () => { cleanup(); resolve(false); };

    confirmYes.addEventListener('click', onYes);
    confirmNo.addEventListener('click', onNo);
  });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message: string, isError = false) {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `admin-toast ${isError ? 'admin-toast--error' : 'admin-toast--success'}`;
  toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${escapeHtml(message)}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('admin-toast--visible'));

  setTimeout(() => {
    toast.classList.remove('admin-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== UTILS =====
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== MOBILE NAV (same as main.ts) =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger?.addEventListener('click', () => {
  navMenu?.classList.toggle('open');
  hamburger.classList.toggle('active');
});

const dropdownParents = document.querySelectorAll('.has-dropdown > a');
dropdownParents.forEach((link) => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parent = (link as HTMLElement).parentElement;
      parent?.classList.toggle('open');
    }
  });
});
