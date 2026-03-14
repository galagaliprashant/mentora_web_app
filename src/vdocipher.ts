import { auth, functions } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

const getVdoCipherOtp = httpsCallable<
  { videoId: string; courseId: string },
  { otp: string; playbackInfo: string }
>(functions, 'getVdoCipherOtp');

async function loadVdoCipherPlayer(
  container: HTMLElement,
  videoId: string,
  courseId: string
): Promise<void> {
  const result = await getVdoCipherOtp({ videoId, courseId });
  const { otp, playbackInfo } = result.data;

  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`;
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('allow', 'encrypted-media');
  iframe.setAttribute('frameborder', '0');

  container.innerHTML = '';
  container.appendChild(iframe);
}

export function initVideoPage() {
  const loginPrompt = document.getElementById('video-login-prompt');
  const playerWrap = document.getElementById('vdocipher-container');
  const errorEl = document.getElementById('video-error');
  const loadingEl = document.getElementById('video-loading');
  const headerBtn = document.querySelector<HTMLAnchorElement>('.top-bar__login');

  if (!loginPrompt || !playerWrap || !errorEl) return;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  onAuthStateChanged(auth, async (user) => {
    // Update header login/logout button
    if (headerBtn) {
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

    // Handle premium video section
    if (user) {
      loginPrompt.classList.add('hidden');
      errorEl.classList.add('hidden');
      errorEl.textContent = '';
      playerWrap.classList.remove('hidden');
      loadingEl?.classList.remove('hidden');

      try {
        await loadVdoCipherPlayer(
          playerWrap,
          '7257d20b9f084b779fce5cad3107f576',
          '1_year_foundation'
        );
        loadingEl?.classList.add('hidden');
      } catch (err: unknown) {
        console.error('VdoCipher error:', err);
        loadingEl?.classList.add('hidden');
        playerWrap.classList.add('hidden');
        errorEl.classList.remove('hidden');

        const msg = err instanceof Error ? err.message : '';
        const code = (err as { code?: string }).code ?? '';
        console.error('Error code:', code, 'Message:', msg);

        if (code.includes('permission-denied') || msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
          errorEl.textContent =
            'Your enrollment is pending approval. Please contact support for access.';
        } else if (code.includes('unauthenticated') || msg.includes('unauthenticated') || msg.includes('UNAUTHENTICATED')) {
          errorEl.textContent = 'Please sign in to watch premium content.';
        } else if (code.includes('not-found') || msg.includes('not-found')) {
          errorEl.textContent = 'Video service not available. Please ensure the cloud function is deployed.';
        } else {
          errorEl.textContent = `Unable to load video. Please try again later. (${code || msg || 'unknown error'})`;
        }
      }
    } else {
      loginPrompt.classList.remove('hidden');
      playerWrap.classList.add('hidden');
      errorEl.classList.add('hidden');
      loadingEl?.classList.add('hidden');
    }
  });
}
