import './style.css';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { loadVdoCipherPlayer } from './vdocipher';
import coursesData from './data/courses-videos.json';

// ===== TYPES =====
interface VideoEntry {
  videoId: string;
  title: string;
  duration: string;
  order: number;
}

interface Subject {
  subjectId: string;
  displayName: string;
  icon: string;
  videos: VideoEntry[];
}

interface Course {
  courseId: string;
  displayName: string;
  description: string;
  icon: string;
  subjects: Subject[];
}

const courses: Course[] = coursesData.courses as Course[];

// ===== DOM REFS =====
const loginPrompt = document.getElementById('video-login-prompt')!;
const loadingEl = document.getElementById('video-loading')!;
const errorEl = document.getElementById('video-error')!;
const appEl = document.getElementById('video-app')!;
const breadcrumbEl = document.getElementById('video-breadcrumb')!;
const headerBtn = document.querySelector<HTMLAnchorElement>('.top-bar__login');
const freeVideosSection = document.getElementById('classes');

// ===== STATE =====
let enrollments: Map<string, string> = new Map(); // courseId -> status
let currentUser: User | null = null;

// ===== ENROLLMENT FETCH =====
async function fetchEnrollments(uid: string): Promise<Map<string, string>> {
  const q = query(collection(db, 'enrollments'), where('uid', '==', uid));
  const snap = await getDocs(q);
  const map = new Map<string, string>();
  snap.forEach((d) => {
    const data = d.data() as { courseId: string; status: string };
    map.set(data.courseId, data.status);
  });
  return map;
}

// ===== BREADCRUMB =====
function renderBreadcrumb(parts: { label: string; hash: string }[]) {
  breadcrumbEl.innerHTML = '';
  parts.forEach((part, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb__sep';
      sep.textContent = '>';
      breadcrumbEl.appendChild(sep);
    }
    if (i < parts.length - 1) {
      const a = document.createElement('a');
      a.href = part.hash;
      a.className = 'breadcrumb__link';
      a.textContent = part.label;
      breadcrumbEl.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'breadcrumb__current';
      span.textContent = part.label;
      breadcrumbEl.appendChild(span);
    }
  });
}

// ===== VIEW: COURSE GRID =====
function renderCourseGrid() {
  renderBreadcrumb([{ label: 'My Courses', hash: '#courses' }]);

  let html = '<div class="course-grid">';
  for (const course of courses) {
    const status = enrollments.get(course.courseId);
    let statusClass = 'course-card--locked';
    let badge = '<span class="enrollment-badge enrollment-badge--locked"><i class="fas fa-lock"></i> Locked</span>';
    let clickable = false;

    if (status === 'approved') {
      statusClass = 'course-card--enrolled';
      badge = '<span class="enrollment-badge enrollment-badge--enrolled"><i class="fas fa-check-circle"></i> Enrolled</span>';
      clickable = true;
    } else if (status === 'pending') {
      statusClass = 'course-card--pending';
      badge = '<span class="enrollment-badge enrollment-badge--pending"><i class="fas fa-clock"></i> Pending</span>';
    }

    const href = clickable ? `#course/${course.courseId}` : '#';
    const dataAttr = clickable ? '' : `data-locked="${status === 'pending' ? 'pending' : 'true'}"`;

    html += `
      <a href="${href}" class="course-card ${statusClass}" ${dataAttr}>
        ${badge}
        <div class="course-card__icon"><i class="${course.icon}"></i></div>
        <h3 class="course-card__title">${course.displayName}</h3>
        <p class="course-card__desc">${course.description}</p>
        <span class="course-card__count">${course.subjects.length} subject${course.subjects.length !== 1 ? 's' : ''}</span>
      </a>
    `;
  }
  html += '</div>';
  appEl.innerHTML = html;

  // Handle locked course clicks
  appEl.querySelectorAll<HTMLAnchorElement>('[data-locked]').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const lockedStatus = card.dataset.locked;
      if (lockedStatus === 'pending') {
        showError('Your enrollment is pending approval. Please contact support for access.');
      } else {
        showError('You are not enrolled in this course. <a href="/courses.html">View courses</a> to enquire.');
      }
    });
  });
}

// ===== VIEW: SUBJECT LIST =====
function renderSubjectList(courseId: string) {
  const course = courses.find((c) => c.courseId === courseId);
  if (!course) { renderCourseGrid(); return; }

  // Check enrollment
  const status = enrollments.get(courseId);
  if (status !== 'approved') {
    renderCourseGrid();
    return;
  }

  renderBreadcrumb([
    { label: 'My Courses', hash: '#courses' },
    { label: course.displayName, hash: `#course/${courseId}` },
  ]);

  let html = '<div class="course-grid">';
  for (const subject of course.subjects) {
    html += `
      <a href="#course/${courseId}/${subject.subjectId}" class="subject-card">
        <div class="subject-card__icon"><i class="${subject.icon}"></i></div>
        <h3 class="subject-card__title">${subject.displayName}</h3>
        <span class="subject-card__count">${subject.videos.length} video${subject.videos.length !== 1 ? 's' : ''}</span>
      </a>
    `;
  }
  html += '</div>';
  appEl.innerHTML = html;
}

// ===== VIEW: VIDEO LIST =====
function renderVideoList(courseId: string, subjectId: string) {
  const course = courses.find((c) => c.courseId === courseId);
  if (!course) { renderCourseGrid(); return; }

  const status = enrollments.get(courseId);
  if (status !== 'approved') { renderCourseGrid(); return; }

  const subject = course.subjects.find((s) => s.subjectId === subjectId);
  if (!subject) { renderSubjectList(courseId); return; }

  renderBreadcrumb([
    { label: 'My Courses', hash: '#courses' },
    { label: course.displayName, hash: `#course/${courseId}` },
    { label: subject.displayName, hash: `#course/${courseId}/${subjectId}` },
  ]);

  const sortedVideos = [...subject.videos].sort((a, b) => a.order - b.order);

  let html = `
    <div class="video-list-header">
      <h3><i class="${subject.icon}"></i> ${subject.displayName}</h3>
      <span>${sortedVideos.length} videos</span>
    </div>
    <div class="video-list">
  `;
  for (const video of sortedVideos) {
    html += `
      <a href="#video/${courseId}/${video.videoId}" class="video-list__item">
        <span class="video-list__order">${video.order}</span>
        <span class="video-list__title">${video.title}</span>
        <span class="video-list__duration"><i class="fas fa-clock"></i> ${video.duration}</span>
      </a>
    `;
  }
  html += '</div>';
  appEl.innerHTML = html;
}

// ===== VIEW: VIDEO PLAYER =====
async function renderVideoPlayer(courseId: string, videoId: string) {
  const course = courses.find((c) => c.courseId === courseId);
  if (!course) { renderCourseGrid(); return; }

  const status = enrollments.get(courseId);
  if (status !== 'approved') { renderCourseGrid(); return; }

  // Find the video and its subject
  let foundSubject: Subject | null = null;
  let foundVideo: VideoEntry | null = null;
  for (const subject of course.subjects) {
    const v = subject.videos.find((vid) => vid.videoId === videoId);
    if (v) { foundSubject = subject; foundVideo = v; break; }
  }

  if (!foundSubject || !foundVideo) { renderCourseGrid(); return; }

  renderBreadcrumb([
    { label: 'My Courses', hash: '#courses' },
    { label: course.displayName, hash: `#course/${courseId}` },
    { label: foundSubject.displayName, hash: `#course/${courseId}/${foundSubject.subjectId}` },
    { label: foundVideo.title, hash: `#video/${courseId}/${videoId}` },
  ]);

  // Build prev/next nav
  const sortedVideos = [...foundSubject.videos].sort((a, b) => a.order - b.order);
  const currentIdx = sortedVideos.findIndex((v) => v.videoId === videoId);
  const prevVideo = currentIdx > 0 ? sortedVideos[currentIdx - 1] : null;
  const nextVideo = currentIdx < sortedVideos.length - 1 ? sortedVideos[currentIdx + 1] : null;

  appEl.innerHTML = `
    <div class="video-player-wrap">
      <div class="video-player__container" id="vdocipher-player"></div>
      <div class="video-player__info">
        <h3>${foundVideo.title}</h3>
        <span class="video-player__duration"><i class="fas fa-clock"></i> ${foundVideo.duration}</span>
      </div>
      <div class="video-player-nav">
        ${prevVideo ? `<a href="#video/${courseId}/${prevVideo.videoId}" class="btn btn--outline video-player-nav__prev"><i class="fas fa-chevron-left"></i> Previous</a>` : '<span></span>'}
        <a href="#course/${courseId}/${foundSubject.subjectId}" class="btn btn--outline video-player-nav__list"><i class="fas fa-list"></i> All Videos</a>
        ${nextVideo ? `<a href="#video/${courseId}/${nextVideo.videoId}" class="btn btn--outline video-player-nav__next">Next <i class="fas fa-chevron-right"></i></a>` : '<span></span>'}
      </div>
    </div>
  `;

  // Load VdoCipher player
  const playerContainer = document.getElementById('vdocipher-player')!;
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');

  try {
    await loadVdoCipherPlayer(playerContainer, videoId, courseId);
    loadingEl.classList.add('hidden');
  } catch (err: unknown) {
    loadingEl.classList.add('hidden');
    const msg = err instanceof Error ? err.message : '';
    const code = (err as { code?: string }).code ?? '';

    if (code.includes('permission-denied') || msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
      showError('Your enrollment is pending approval. Please contact support for access.');
    } else if (code.includes('unauthenticated') || msg.includes('unauthenticated') || msg.includes('UNAUTHENTICATED')) {
      showError('Please sign in to watch premium content.');
    } else if (code.includes('not-found') || msg.includes('not-found')) {
      showError('Video service not available. Please ensure the cloud function is deployed.');
    } else {
      showError(`Unable to load video. Please try again later. (${code || msg || 'unknown error'})`);
    }
  }
}

// ===== ERROR DISPLAY =====
function showError(message: string) {
  errorEl.innerHTML = message;
  errorEl.classList.remove('hidden');
}

function hideError() {
  errorEl.innerHTML = '';
  errorEl.classList.add('hidden');
}

// ===== ROUTER =====
function route() {
  if (!currentUser) return;

  hideError();
  const hash = window.location.hash.slice(1); // remove #

  if (hash.startsWith('video/')) {
    const parts = hash.split('/');
    if (parts.length >= 3) {
      void renderVideoPlayer(parts[1], parts[2]);
      return;
    }
  }

  // #course/{courseId}/{subjectId}
  const subjectMatch = hash.match(/^course\/([^/]+)\/([^/]+)$/);
  if (subjectMatch) {
    renderVideoList(subjectMatch[1], subjectMatch[2]);
    return;
  }

  // #course/{courseId}
  const courseMatch = hash.match(/^course\/([^/]+)$/);
  if (courseMatch) {
    renderSubjectList(courseMatch[1]);
    return;
  }

  // Default: course grid
  renderCourseGrid();
}

// ===== HEADER LOGIN/LOGOUT =====
function updateHeader(user: User | null) {
  if (!headerBtn) return;
  if (user) {
    headerBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    headerBtn.href = '#';
    headerBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.reload();
    };
  } else {
    headerBtn.innerHTML = '<i class="fas fa-user-circle"></i> Student Login';
    headerBtn.href = '/login.html';
    headerBtn.onclick = null;
  }
}

// ===== AUTH STATE =====
// eslint-disable-next-line @typescript-eslint/no-misused-promises
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateHeader(user);

  if (user) {
    loginPrompt.classList.add('hidden');
    appEl.classList.remove('hidden');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    freeVideosSection?.classList.add('hidden');

    try {
      enrollments = await fetchEnrollments(user.uid);
    } catch {
      enrollments = new Map();
    }

    loadingEl.classList.add('hidden');
    route();
  } else {
    loginPrompt.classList.remove('hidden');
    appEl.classList.add('hidden');
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    freeVideosSection?.classList.remove('hidden');
    breadcrumbEl.innerHTML = '';
  }
});

window.addEventListener('hashchange', route);

// ===== MOBILE NAV =====
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

// ===== STICKY NAV SHADOW =====
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    mainNav?.classList.add('scrolled');
  } else {
    mainNav?.classList.remove('scrolled');
  }
});

const navStyle = document.createElement('style');
navStyle.textContent = `.main-nav.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,.15); }`;
document.head.appendChild(navStyle);
