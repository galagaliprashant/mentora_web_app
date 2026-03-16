import { db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

function validateContactFields(name: string, phone: string, email: string): string | null {
  if (!name) return 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (phone.replace(/[\s\-+]/g, '').length < 10) return 'Phone number must be at least 10 digits.';
  return null;
}

function showFeedback(el: HTMLElement, message: string, isError: boolean) {
  el.textContent = message;
  el.style.display = 'block';
  el.style.color = isError ? '#dc3545' : '#28a745';
}

function isHoneypotFilled(form: HTMLFormElement): boolean {
  const hp = form.querySelector<HTMLInputElement>('input[name="website"]');
  return !!(hp && hp.value);
}

// ===== HOMEPAGE ENQUIRY FORM =====
function initEnquiryForm() {
  const form = document.getElementById('enquiry-form') as HTMLFormElement | null;
  if (!form) return;

  const feedback = document.getElementById('enquiry-feedback') as HTMLElement;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.style.display = 'none';

    if (isHoneypotFilled(form)) {
      showFeedback(feedback, 'Thank you! We will get back to you shortly.', false);
      form.reset();
      return;
    }

    const name = (form.querySelector<HTMLInputElement>('input[name="name"]')!).value.trim();
    const phone = (form.querySelector<HTMLInputElement>('input[name="phone"]')!).value.trim();
    const email = (form.querySelector<HTMLInputElement>('input[name="email"]')!).value.trim();
    const message = (form.querySelector<HTMLTextAreaElement>('textarea[name="message"]')!).value.trim();

    const error = validateContactFields(name, phone, email);
    if (error) {
      showFeedback(feedback, error, true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }

    try {
      await addDoc(collection(db, 'enquiries'), {
        enquiryType: 'general',
        name,
        phone,
        email,
        message,
        submittedAt: serverTimestamp(),
      });
      showFeedback(feedback, 'Thank you! We will get back to you shortly.', false);
      form.reset();
      setTimeout(() => {
        feedback.style.display = 'none';
        document.getElementById('enquire-panel')?.classList.remove('open');
      }, 2000);
    } catch {
      showFeedback(feedback, 'Something went wrong. Please try again.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    }
  });
}

// ===== COURSE ENQUIRY MODAL =====
function initCourseEnquiryModal() {
  const modal = document.getElementById('course-enquiry-modal');
  const closeBtn = document.getElementById('course-enquiry-modal-close');
  const form = document.getElementById('course-enquiry-form') as HTMLFormElement | null;
  const courseInfo = document.getElementById('modal-course-info');
  const feedback = document.getElementById('course-enquiry-feedback') as HTMLElement;

  if (!modal || !form) return;

  const hiddenCourseId = form.querySelector<HTMLInputElement>('input[name="courseId"]')!;
  const hiddenCourseName = form.querySelector<HTMLInputElement>('input[name="courseName"]')!;
  const hiddenBatchType = form.querySelector<HTMLInputElement>('input[name="batchType"]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  // Attach click handlers to all register buttons
  document.querySelectorAll<HTMLElement>('.register-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseId = btn.dataset.courseId || '';
      const courseName = btn.dataset.courseName || '';
      const batchType = btn.dataset.batchType || '';

      hiddenCourseId.value = courseId;
      hiddenCourseName.value = courseName;
      hiddenBatchType.value = batchType;

      if (courseInfo) {
        const batchLabel = batchType === 'online' ? 'Online Batch' : 'In-Person Batch';
        courseInfo.textContent = `${courseName} — ${batchLabel}`;
      }

      feedback.style.display = 'none';
      form.reset();
      // Re-set hidden fields after reset
      hiddenCourseId.value = courseId;
      hiddenCourseName.value = courseName;
      hiddenBatchType.value = batchType;

      modal.classList.add('open');
    });
  });

  // Close modal
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.style.display = 'none';

    if (isHoneypotFilled(form)) {
      showFeedback(feedback, 'Thank you! We will get back to you shortly.', false);
      form.reset();
      return;
    }

    const name = (form.querySelector<HTMLInputElement>('input[name="name"]')!).value.trim();
    const phone = (form.querySelector<HTMLInputElement>('input[name="phone"]')!).value.trim();
    const email = (form.querySelector<HTMLInputElement>('input[name="email"]')!).value.trim();
    const courseId = hiddenCourseId.value;
    const courseName = hiddenCourseName.value;
    const batchType = hiddenBatchType.value as 'online' | 'in-person';

    const error = validateContactFields(name, phone, email);
    if (error) {
      showFeedback(feedback, error, true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }

    try {
      await addDoc(collection(db, 'enquiries'), {
        enquiryType: batchType,
        name,
        phone,
        email,
        courseId,
        courseName,
        submittedAt: serverTimestamp(),
      });
      showFeedback(feedback, 'Thank you! We will get back to you shortly.', false);
      form.reset();
      setTimeout(() => {
        modal.classList.remove('open');
      }, 2000);
    } catch {
      showFeedback(feedback, 'Something went wrong. Please try again.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enquiry';
      }
    }
  });
}

// Auto-init based on which page loaded
if (document.getElementById('enquiry-form')) {
  initEnquiryForm();
}
if (document.getElementById('course-enquiry-modal')) {
  initCourseEnquiryModal();
}
