import { getCourse, type Block, type CourseContent } from './data/courses-content';

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${block.text}</p>`;
    case 'heading':
      return `<h2 class="course-page__heading">${block.text}</h2>`;
    case 'subheading':
      return `<h3 class="course-page__subheading">${block.text}</h3>`;
    case 'list':
      return `<ul class="course-page__list">${block.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    case 'checklist':
      return `<ul class="course-page__checklist">${block.items
        .map((i) => `<li><i class="fas fa-check-circle"></i> ${i}</li>`)
        .join('')}</ul>`;
  }
}

function renderMeta(course: CourseContent): string {
  if (!course.meta || course.meta.length === 0) return '';
  return `<div class="course-page__meta">${course.meta
    .map(
      (m) =>
        `<div class="course-page__meta-item"><span class="course-page__meta-label">${m.label}</span><span class="course-page__meta-value">${m.value}</span></div>`
    )
    .join('')}</div>`;
}

function renderFaculty(course: CourseContent): string {
  if (!course.faculty || course.faculty.length === 0) return '';
  const cards = course.faculty
    .map((f) => {
      const links = f.links
        ? `<div class="course-page__faculty-links">${f.links
            .map(
              (l) =>
                `<a href="${l.url}" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i> ${l.label}</a>`
            )
            .join('')}</div>`
        : '';
      const photo = f.photo
        ? `<div class="course-page__faculty-photo"><img src="${f.photo}" alt="${f.name}" loading="lazy"${
            f.photoPosition ? ` style="object-position:${f.photoPosition}"` : ''
          } /></div>`
        : '';
      const role = f.role ? `<span class="course-page__faculty-role">${f.role}</span>` : '';
      const body =
        f.points && f.points.length > 0
          ? `<ul class="course-page__faculty-points">${f.points.map((p) => `<li>${p}</li>`).join('')}</ul>`
          : f.detail
            ? `<p>${f.detail}</p>`
            : '';
      return `<div class="course-page__faculty-card">${photo}<h4>${f.name}</h4>${role}${body}${links}</div>`;
    })
    .join('');
  const title = course.facultyTitle ?? 'Faculty';
  return `<h2 class="course-page__heading">${title}</h2><div class="course-page__faculty">${cards}</div>`;
}

function renderNotFound(): string {
  return `
    <div class="course-page__notfound">
      <h1>Course not found</h1>
      <p>We couldn't find the course you were looking for.</p>
      <a href="/courses.html" class="btn btn--primary"><i class="fas fa-arrow-left"></i> Back to Courses</a>
    </div>`;
}

function render() {
  const container = document.getElementById('course-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const course = getCourse(params.get('id'));

  if (!course) {
    container.innerHTML = renderNotFound();
    return;
  }

  document.title = `${course.name} | Mentora IAS`;

  const placeholderNote = course.placeholder
    ? `<p class="course-page__placeholder-note"><i class="fas fa-info-circle"></i> Detailed programme information will be updated shortly.</p>`
    : '';

  container.innerHTML = `
    <section class="course-page__hero">
      <div class="container">
        <a href="/courses.html" class="course-page__back"><i class="fas fa-arrow-left"></i> All Courses</a>
        <span class="course-page__tag">${course.tag}</span>
        <div class="course-page__hero-title">
          <span class="course-page__hero-icon"><i class="${course.icon}"></i></span>
          <h1>${course.name}</h1>
        </div>
        ${course.tagline ? `<p class="course-page__tagline">${course.tagline}</p>` : ''}
      </div>
    </section>

    <section class="course-page__body">
      <div class="container">
        ${renderMeta(course)}
        ${placeholderNote}
        <div class="course-page__prose">
          ${course.blocks.map(renderBlock).join('')}
        </div>
        ${renderFaculty(course)}

        <div class="course-page__cta">
          <h3>Ready to begin?</h3>
          <div class="course-page__actions">
            <a href="#" class="btn btn--primary register-btn" data-course-id="${course.id}" data-course-name="${course.name}" data-batch-type="online"><i class="fas fa-laptop"></i> Register for Online Batch</a>
            <a href="#" class="btn btn--outline register-btn" data-course-id="${course.id}" data-course-name="${course.name}" data-batch-type="in-person"><i class="fas fa-building"></i> Register for Offline Batch</a>
          </div>
        </div>
      </div>
    </section>`;
}

render();
