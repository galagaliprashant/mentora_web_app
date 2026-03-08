import './style.css';

// ===== HERO SLIDER =====
const slides = document.querySelectorAll('.hero__slide') as NodeListOf<HTMLElement>;
const dots = document.querySelectorAll('.hero__dot') as NodeListOf<HTMLButtonElement>;
let currentSlide = 0;
let slideInterval: ReturnType<typeof setInterval>;

function goToSlide(index: number) {
  slides.forEach(s => s.classList.remove('hero__slide--active'));
  dots.forEach(d => d.classList.remove('hero__dot--active'));
  currentSlide = index;
  slides[currentSlide]?.classList.add('hero__slide--active');
  dots[currentSlide]?.classList.add('hero__dot--active');
}

function nextSlide() {
  goToSlide((currentSlide + 1) % slides.length);
}

function startSlider() {
  slideInterval = setInterval(nextSlide, 5000);
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    clearInterval(slideInterval);
    goToSlide(i);
    startSlider();
  });
});

if (slides.length > 0) startSlider();

// ===== CLASSES HUB TABS =====
const tabBtns = document.querySelectorAll('.tab-btn') as NodeListOf<HTMLButtonElement>;
const tabPanels = document.querySelectorAll('.tab-panel') as NodeListOf<HTMLElement>;

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('tab-btn--active'));
    tabPanels.forEach(p => p.classList.remove('tab-panel--active'));
    btn.classList.add('tab-btn--active');
    document.getElementById(`tab-${tab}`)?.classList.add('tab-panel--active');
  });
});

// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger?.addEventListener('click', () => {
  navMenu?.classList.toggle('open');
  hamburger.classList.toggle('active');
});

// Mobile dropdown toggles
const dropdownParents = document.querySelectorAll('.has-dropdown > a');
dropdownParents.forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parent = (link as HTMLElement).parentElement;
      parent?.classList.toggle('open');
    }
  });
});

// ===== FLOATING ENQUIRE PANEL =====
const enquireToggle = document.getElementById('enquire-toggle');
const enquireBtn = document.getElementById('enquire-btn');
const enquirePanel = document.getElementById('enquire-panel');

enquireToggle?.addEventListener('click', () => {
  enquirePanel?.classList.toggle('open');
});

enquireBtn?.addEventListener('click', () => {
  enquirePanel?.classList.toggle('open');
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (enquirePanel?.classList.contains('open') &&
    !enquirePanel.contains(target) &&
    !enquireToggle?.contains(target) &&
    !enquireBtn?.contains(target)) {
    enquirePanel.classList.remove('open');
  }
});

// ===== STATS COUNTER ANIMATION =====
function animateCounters() {
  const stats = document.querySelectorAll('.stat__number') as NodeListOf<HTMLElement>;
  stats.forEach(stat => {
    const target = parseInt(stat.dataset.target || '0');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      // Display formatted (e.g. 3.9, 15.8, 97.5, 100.2)
      const display = (current / 1000).toFixed(1);
      stat.textContent = display;
    }, 16);
  });
}

// Intersection Observer for stats
const statsSection = document.getElementById('stats');
let statsAnimated = false;

if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.category-card, .course-card, .faculty-card, .class-card, .why-card, .contact__info-card').forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

// Add fade-up CSS dynamically
const style = document.createElement('style');
style.textContent = `
  .fade-up { opacity:0; transform:translateY(30px); transition: opacity .6s ease, transform .6s ease; }
  .fade-up.visible { opacity:1; transform:translateY(0); }
  .fade-up:nth-child(2) { transition-delay:.1s; }
  .fade-up:nth-child(3) { transition-delay:.2s; }
  .fade-up:nth-child(4) { transition-delay:.3s; }
  .fade-up:nth-child(5) { transition-delay:.4s; }
`;
document.head.appendChild(style);

// ===== STICKY NAV SHADOW =====
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    mainNav?.classList.add('scrolled');
  } else {
    mainNav?.classList.remove('scrolled');
  }
});

// Scrolled nav style
const navStyle = document.createElement('style');
navStyle.textContent = `.main-nav.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,.15); }`;
document.head.appendChild(navStyle);

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = (anchor as HTMLAnchorElement).getAttribute('href');
    if (href && href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu
        navMenu?.classList.remove('open');
      }
    }
  });
});

console.log('Mentora IAS website loaded successfully!');
