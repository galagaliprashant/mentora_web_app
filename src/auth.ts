import './style.css';
import './idle-logout';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// ===== COURSES (must match Android app) =====
const ALL_COURSES = [
  { id: '1_year_foundation', displayName: '1 Year Foundation' },
  { id: '2_year_foundation', displayName: '2 Year Foundation' },
  { id: '3_year_foundation', displayName: '3 Year Foundation' },
  { id: 'apmc_1_0', displayName: 'APMC 1.0' },
  { id: 'apmc_2_0', displayName: 'APMC 2.0' },
  { id: 'csat', displayName: 'CSAT' },
];

// ===== TAB SWITCHING =====
const loginTab = document.getElementById('tab-login') as HTMLButtonElement;
const signupTab = document.getElementById('tab-signup') as HTMLButtonElement;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const signupForm = document.getElementById('signup-form') as HTMLFormElement;

loginTab.addEventListener('click', () => {
  loginTab.classList.add('auth-tab--active');
  signupTab.classList.remove('auth-tab--active');
  loginForm.classList.add('auth-form--active');
  signupForm.classList.remove('auth-form--active');
});

signupTab.addEventListener('click', () => {
  signupTab.classList.add('auth-tab--active');
  loginTab.classList.remove('auth-tab--active');
  signupForm.classList.add('auth-form--active');
  loginForm.classList.remove('auth-form--active');
});

// ===== PASSWORD VISIBILITY TOGGLES =====
document.querySelectorAll('.password-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling as HTMLInputElement;
    const icon = btn.querySelector('i')!;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
});

// ===== LOGIN =====
const loginEmail = document.getElementById('login-email') as HTMLInputElement;
const loginPassword = document.getElementById('login-password') as HTMLInputElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const loginError = document.getElementById('login-error') as HTMLElement;
const loginSuccess = document.getElementById('login-success') as HTMLElement;
const loginSignoutBtn = document.getElementById('login-signout-btn') as HTMLButtonElement;
const pendingVerification = document.getElementById('pending-verification') as HTMLElement;

/** Check if user has any approved enrollments */
async function checkEnrollmentStatus(uid: string): Promise<boolean> {
  const q = query(
    collection(db, 'enrollments'),
    where('uid', '==', uid),
    where('status', '==', 'approved'),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Show/hide the pending verification vs normal login success UI */
function showLoginSuccessState(hasApprovedCourses: boolean) {
  const successButtons = document.getElementById('login-success-buttons') as HTMLElement;
  const successIcon = document.getElementById('login-success-icon') as HTMLElement;
  const successHeading = document.getElementById('login-success-heading') as HTMLElement;
  const successWelcome = document.getElementById('login-success-welcome') as HTMLElement;
  if (hasApprovedCourses) {
    pendingVerification.classList.add('hidden');
    successButtons.classList.remove('hidden');
    successIcon.classList.remove('hidden');
    successHeading.classList.remove('hidden');
    successWelcome.classList.remove('hidden');
  } else {
    pendingVerification.classList.remove('hidden');
    successButtons.classList.add('hidden');
    successIcon.classList.add('hidden');
    successHeading.classList.add('hidden');
    successWelcome.classList.add('hidden');
  }
}
const authTabs = document.querySelector('.auth-tabs') as HTMLElement;

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  try {
    const email = loginEmail.value.trim();
    // Authenticate first, then verify user exists in Firestore
    const result = await signInWithEmailAndPassword(auth, email, loginPassword.value);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      loginError.textContent = 'This account has been deleted or does not exist. Please contact support.';
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Sign In';
      return;
    }
    // Show success message instead of redirecting
    loginForm.classList.remove('auth-form--active');
    authTabs.classList.add('hidden');
    loginSuccess.classList.remove('hidden');
    // Update header button to show Logout
    updateHeaderLoginBtn(true);
    // Check enrollment status and show appropriate UI
    const hasApproved = await checkEnrollmentStatus(result.user.uid);
    showLoginSuccessState(hasApproved);
  } catch {
    loginError.textContent = 'Invalid email or password. Please try again.';
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Sign In';
  }
});

// ===== LOGIN SIGN OUT =====
loginSignoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  // Reset to login form
  loginSuccess.classList.add('hidden');
  authTabs.classList.remove('hidden');
  loginForm.classList.add('auth-form--active');
  loginBtn.disabled = false;
  loginBtn.innerHTML = 'Sign In';
  loginEmail.value = '';
  loginPassword.value = '';
  loginTab.classList.add('auth-tab--active');
  signupTab.classList.remove('auth-tab--active');
  updateHeaderLoginBtn(false);
});

// ===== CHANGE PASSWORD =====
const changePasswordSection = document.getElementById('change-password-section') as HTMLElement;
const changePasswordBtn = document.getElementById('change-password-btn') as HTMLButtonElement;
const changePasswordCancelBtn = document.getElementById('change-password-cancel-btn') as HTMLButtonElement;
const changePasswordSubmitBtn = document.getElementById('change-password-submit-btn') as HTMLButtonElement;
const changePasswordError = document.getElementById('change-password-error') as HTMLElement;
const changePasswordSuccessMsg = document.getElementById('change-password-success') as HTMLElement;
const currentPasswordInput = document.getElementById('current-password') as HTMLInputElement;
const newPasswordInput = document.getElementById('new-password') as HTMLInputElement;
const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
const loginSuccessButtons = document.getElementById('login-success-buttons') as HTMLElement;

changePasswordBtn.addEventListener('click', () => {
  changePasswordSection.classList.remove('hidden');
  loginSuccessButtons.classList.add('hidden');
  changePasswordError.textContent = '';
  changePasswordSuccessMsg.classList.add('hidden');
  currentPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
});

changePasswordCancelBtn.addEventListener('click', () => {
  changePasswordSection.classList.add('hidden');
  loginSuccessButtons.classList.remove('hidden');
});

changePasswordSubmitBtn.addEventListener('click', async () => {
  changePasswordError.textContent = '';
  changePasswordSuccessMsg.classList.add('hidden');

  const currentPwd = currentPasswordInput.value;
  const newPwd = newPasswordInput.value;
  const confirmPwd = confirmPasswordInput.value;

  if (!currentPwd) { changePasswordError.textContent = 'Please enter your current password.'; return; }
  if (newPwd.length < 6) { changePasswordError.textContent = 'New password must be at least 6 characters.'; return; }
  if (newPwd !== confirmPwd) { changePasswordError.textContent = 'New passwords do not match.'; return; }

  changePasswordSubmitBtn.disabled = true;
  changePasswordSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

  try {
    const user = auth.currentUser!;
    const credential = EmailAuthProvider.credential(user.email!, currentPwd);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPwd);

    changePasswordSuccessMsg.classList.remove('hidden');
    changePasswordError.textContent = '';
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';

    setTimeout(() => {
      changePasswordSection.classList.add('hidden');
      loginSuccessButtons.classList.remove('hidden');
      changePasswordSuccessMsg.classList.add('hidden');
    }, 2000);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
      changePasswordError.textContent = 'Current password is incorrect.';
    } else {
      changePasswordError.textContent = 'Failed to change password. Please try again.';
    }
  } finally {
    changePasswordSubmitBtn.disabled = false;
    changePasswordSubmitBtn.innerHTML = 'Update Password';
  }
});

// ===== HEADER LOGIN/LOGOUT TOGGLE =====
const myCoursesBtn = document.querySelector('.top-bar__my-courses') as HTMLAnchorElement | null;

function updateHeaderLoginBtn(loggedIn: boolean) {
  const headerBtn = document.querySelector('.top-bar__login') as HTMLAnchorElement | null;
  if (!headerBtn) return;
  if (loggedIn) {
    headerBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    headerBtn.href = '#';
    headerBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.reload();
    });
    myCoursesBtn?.classList.remove('hidden');
  } else {
    headerBtn.innerHTML = '<i class="fas fa-user-circle"></i> Student Login';
    headerBtn.href = '/login.html';
    myCoursesBtn?.classList.add('hidden');
  }
}

let signupInProgress = false;

// ===== SIGNUP =====
const signupName = document.getElementById('signup-name') as HTMLInputElement;
const signupEmail = document.getElementById('signup-email') as HTMLInputElement;
const signupPassword = document.getElementById('signup-password') as HTMLInputElement;
const signupPhone = document.getElementById('signup-phone') as HTMLInputElement;
const signupBtn = document.getElementById('signup-btn') as HTMLButtonElement;
const signupError = document.getElementById('signup-error') as HTMLElement;
const signupSuccess = document.getElementById('signup-success') as HTMLElement;
const coursesGrid = document.getElementById('courses-grid') as HTMLElement;

// Render course checkboxes
ALL_COURSES.forEach((course) => {
  const label = document.createElement('label');
  label.className = 'course-option';
  label.innerHTML = `
    <input type="checkbox" name="courses" value="${course.id}" />
    <span class="course-option__check"><i class="fas fa-check"></i></span>
    <span class="course-option__name">${course.displayName}</span>
  `;
  coursesGrid.appendChild(label);
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.textContent = '';
  signupSuccess.classList.add('hidden');

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const phone = signupPhone.value.trim();
  const selectedCourses = Array.from(
    signupForm.querySelectorAll<HTMLInputElement>('input[name="courses"]:checked')
  ).map((cb) => cb.value);

  // Validation
  if (!name) { signupError.textContent = 'Full name is required.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { signupError.textContent = 'Enter a valid email address.'; return; }
  if (password.length < 6) { signupError.textContent = 'Password must be at least 6 characters.'; return; }
  if (phone && phone.replace(/[\s\-+]/g, '').length < 10) { signupError.textContent = 'Phone number must be at least 10 digits.'; return; }
  if (selectedCourses.length === 0) { signupError.textContent = 'Please select at least one course.'; return; }

  signupBtn.disabled = true;
  signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
  signupInProgress = true;

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      phone,
      role: 'student',
      createdAt: serverTimestamp(),
    });

    // Create enrollment documents
    const courseNameById = Object.fromEntries(ALL_COURSES.map((c) => [c.id, c.displayName]));
    const batch = writeBatch(db);
    for (const courseId of selectedCourses) {
      const ref = doc(collection(db, 'enrollments'));
      batch.set(ref, {
        uid,
        courseId,
        courseName: courseNameById[courseId] ?? courseId,
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedAt: null,
      });
    }
    await batch.commit();

    // Sign out after signup (matches Android flow)
    await signOut(auth);

    signupInProgress = false;

    // Show success, hide form
    signupForm.classList.remove('auth-form--active');
    authTabs.classList.add('hidden');
    signupSuccess.classList.remove('hidden');
  } catch (err: unknown) {
    signupInProgress = false;
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('email-already-in-use')) {
      signupError.textContent = 'This email is already registered. Please sign in instead.';
    } else {
      signupError.textContent = 'Sign up failed. Please try again.';
    }
    signupBtn.disabled = false;
    signupBtn.innerHTML = 'Create Account';
  }
});

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

// ===== SWITCH LINKS =====
document.getElementById('goto-signup')?.addEventListener('click', (e) => {
  e.preventDefault();
  signupTab.click();
});
document.getElementById('goto-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  loginTab.click();
});
document.getElementById('goto-signin-btn')?.addEventListener('click', () => {
  loginTab.click();
  signupSuccess.classList.add('hidden');
  signupForm.classList.add('auth-form--active');
});

// ===== CHECK URL HASH FOR TAB =====
if (window.location.hash === '#signup') {
  signupTab.click();
}

// ===== AUTH STATE LISTENER (page load) =====
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, async (user) => {
  if (user && !signupInProgress) {
    // Update UI immediately
    loginForm.classList.remove('auth-form--active');
    signupForm.classList.remove('auth-form--active');
    authTabs.classList.add('hidden');
    loginSuccess.classList.remove('hidden');
    updateHeaderLoginBtn(true);

    // Background check: sign out if user doc was deleted
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      return;
    }

    // Show admin button if admin
    if (userDoc.data()?.role === 'admin') {
      document.querySelector('.top-bar__admin')?.classList.remove('hidden');
    }

    // Check enrollment status and show appropriate UI
    const hasApproved = await checkEnrollmentStatus(user.uid);
    showLoginSuccessState(hasApproved);
  }
});
