import { auth } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function resetTimer() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    if (auth.currentUser) {
      await signOut(auth);
      window.location.href = '/login.html';
    }
  }, IDLE_TIMEOUT);
}

function startIdleTracking() {
  for (const event of ACTIVITY_EVENTS) {
    document.addEventListener(event, resetTimer, { passive: true });
  }
  resetTimer();
}

function stopIdleTracking() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  for (const event of ACTIVITY_EVENTS) {
    document.removeEventListener(event, resetTimer);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    startIdleTracking();
  } else {
    stopIdleTracking();
  }
});
