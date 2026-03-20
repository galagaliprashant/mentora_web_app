import currentAffairsData from './data/current-affairs-data.json';

interface YoutubeLink {
  label: string;
  url: string;
}

interface LectureEntry {
  name: string;
  pdfUrl: string;
  youtubeLinks?: YoutubeLink[];
}

interface SeriesData {
  series: string;
  lectures: LectureEntry[];
}

function renderLectures(lectures: LectureEntry[]): string {
  return lectures
    .map(
      (l) => {
        let html = `<a class="pyq-paper" href="${l.pdfUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-file-pdf"></i>
          <span>${l.name}</span>
          <i class="fas fa-download pyq-paper__dl"></i>
        </a>`;

        if (l.youtubeLinks && l.youtubeLinks.length > 0) {
          html += l.youtubeLinks
            .map(
              (yt) =>
                `<a class="pyq-paper pyq-paper--yt" href="${yt.url}" target="_blank" rel="noopener noreferrer">
                  <i class="fab fa-youtube"></i>
                  <span>${l.name} — ${yt.label}</span>
                  <i class="fas fa-external-link-alt pyq-paper__dl"></i>
                </a>`
            )
            .join('');
        }

        return html;
      }
    )
    .join('');
}

function renderSeries(series: SeriesData, isOpen: boolean): string {
  const openClass = isOpen ? ' pyq-year--open' : '';
  const count = series.lectures.length;

  return `
    <div class="pyq-year${openClass}">
      <button class="pyq-year__header" aria-expanded="${isOpen}">
        <span class="pyq-year__title">${series.series}</span>
        <span class="pyq-year__badge">${count} lecture${count !== 1 ? 's' : ''}</span>
        <i class="fas fa-chevron-down pyq-year__chevron"></i>
      </button>
      <div class="pyq-year__body">
        <div class="pyq-type">
          <div class="pyq-papers">${renderLectures(series.lectures)}</div>
        </div>
      </div>
    </div>`;
}

export function initCurrentAffairs(): void {
  const container = document.getElementById('current-affairs-list');
  if (!container) return;

  const data = currentAffairsData as SeriesData[];

  container.innerHTML = data.map((s, i) => renderSeries(s, i === 0)).join('');

  container.addEventListener('click', (e) => {
    const header = (e.target as HTMLElement).closest('.pyq-year__header');
    if (!header) return;

    const seriesDiv = header.parentElement as HTMLElement;
    const isOpen = seriesDiv.classList.contains('pyq-year--open');

    container.querySelectorAll('.pyq-year--open').forEach((el) => {
      el.classList.remove('pyq-year--open');
      el.querySelector('.pyq-year__header')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      seriesDiv.classList.add('pyq-year--open');
      header.setAttribute('aria-expanded', 'true');
    }
  });
}
