import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

const getVdoCipherOtp = httpsCallable<
  { videoId: string; courseId: string },
  { otp: string; playbackInfo: string }
>(functions, 'getVdoCipherOtp');

export async function loadVdoCipherPlayer(
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
