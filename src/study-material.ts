import ncertData from './data/ncert-data.json';

interface BookEntry {
  name: string;
  url: string;
}

interface SubjectData {
  subject: string;
  classRange: string;
  books: BookEntry[];
}

function renderBooks(books: BookEntry[]): string {
  return books
    .map(
      (b) =>
        `<a class="pyq-paper" href="${b.url}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-file-pdf"></i>
          <span>${b.name}</span>
          <i class="fas fa-download pyq-paper__dl"></i>
        </a>`
    )
    .join('');
}

function renderSubject(subject: SubjectData, isOpen: boolean): string {
  const openClass = isOpen ? ' pyq-year--open' : '';
  const count = subject.books.length;

  return `
    <div class="pyq-year${openClass}">
      <button class="pyq-year__header" aria-expanded="${isOpen}">
        <span class="pyq-year__title">${subject.subject}</span>
        <span class="pyq-year__badge">Class ${subject.classRange} &middot; ${count} book${count !== 1 ? 's' : ''}</span>
        <i class="fas fa-chevron-down pyq-year__chevron"></i>
      </button>
      <div class="pyq-year__body">
        <div class="pyq-type">
          <div class="pyq-papers">${renderBooks(subject.books)}</div>
        </div>
      </div>
    </div>`;
}

export function initStudyMaterial(): void {
  const container = document.getElementById('study-material-list');
  if (!container) return;

  const data = ncertData as SubjectData[];

  container.innerHTML = data.map((s, i) => renderSubject(s, i === 0)).join('');

  // Accordion toggle: only one open at a time
  container.addEventListener('click', (e) => {
    const header = (e.target as HTMLElement).closest('.pyq-year__header');
    if (!header) return;

    const subjectDiv = header.parentElement as HTMLElement;
    const isOpen = subjectDiv.classList.contains('pyq-year--open');

    container.querySelectorAll('.pyq-year--open').forEach((el) => {
      el.classList.remove('pyq-year--open');
      el.querySelector('.pyq-year__header')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      subjectDiv.classList.add('pyq-year--open');
      header.setAttribute('aria-expanded', 'true');
    }
  });
}
