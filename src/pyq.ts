import pyqData from './data/pyq-data.json';

interface PaperEntry {
  name: string;
  url: string;
}

interface YearData {
  year: number;
  prelims: PaperEntry[];
  mains: PaperEntry[];
}

function renderPapers(papers: PaperEntry[]): string {
  return papers
    .map(
      (p) =>
        `<a class="pyq-paper" href="${p.url}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-file-pdf"></i>
          <span>${p.name}</span>
          <i class="fas fa-download pyq-paper__dl"></i>
        </a>`
    )
    .join('');
}

function renderYear(year: YearData, isOpen: boolean): string {
  const totalPapers = year.prelims.length + year.mains.length;
  const openClass = isOpen ? ' pyq-year--open' : '';

  let body = '';
  if (year.prelims.length > 0) {
    body += `
      <div class="pyq-type">
        <h4><i class="fas fa-pen-fancy"></i> Prelims</h4>
        <div class="pyq-papers">${renderPapers(year.prelims)}</div>
      </div>`;
  }
  if (year.mains.length > 0) {
    body += `
      <div class="pyq-type">
        <h4><i class="fas fa-scroll"></i> Mains</h4>
        <div class="pyq-papers">${renderPapers(year.mains)}</div>
      </div>`;
  }

  return `
    <div class="pyq-year${openClass}">
      <button class="pyq-year__header" aria-expanded="${isOpen}">
        <span class="pyq-year__title">${year.year}</span>
        <span class="pyq-year__badge">${totalPapers} paper${totalPapers !== 1 ? 's' : ''}</span>
        <i class="fas fa-chevron-down pyq-year__chevron"></i>
      </button>
      <div class="pyq-year__body">${body}</div>
    </div>`;
}

export function initPyq(): void {
  const container = document.getElementById('pyq-list');
  if (!container) return;

  const data = pyqData as YearData[];

  // Render all years, first one open by default
  container.innerHTML = data.map((y, i) => renderYear(y, i === 0)).join('');

  // Accordion toggle: only one open at a time
  container.addEventListener('click', (e) => {
    const header = (e.target as HTMLElement).closest('.pyq-year__header');
    if (!header) return;

    const yearDiv = header.parentElement as HTMLElement;
    const isOpen = yearDiv.classList.contains('pyq-year--open');

    // Close all
    container.querySelectorAll('.pyq-year--open').forEach((el) => {
      el.classList.remove('pyq-year--open');
      el.querySelector('.pyq-year__header')?.setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked (open if was closed)
    if (!isOpen) {
      yearDiv.classList.add('pyq-year--open');
      header.setAttribute('aria-expanded', 'true');
    }
  });
}
