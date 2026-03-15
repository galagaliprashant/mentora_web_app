import './style.css';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { initPyq } from './pyq';
import { initStudyMaterial } from './study-material';

// ===== HEADER LOGIN/LOGOUT TOGGLE =====
onAuthStateChanged(auth, async (user) => {
  const headerBtn = document.querySelector('.top-bar__login') as HTMLAnchorElement | null;
  if (!headerBtn) return;
  if (user) {
    // Check if user still exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      return;
    }
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
});

// ===== HERO SLIDER =====
const slides = document.querySelectorAll('.hero__slide');
const dots = document.querySelectorAll('.hero__dot');
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
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach((btn) => {
  const btn_ = btn as HTMLElement;
  const tab = btn_.dataset.tab;
  btn.addEventListener('click', () => {
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
  const stats = document.querySelectorAll<HTMLElement>('.stat__number');
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

// ===== FACULTY CAROUSEL =====
const carouselTrack = document.querySelector<HTMLElement>('.faculty-carousel__track');
const prevBtn = document.querySelector('.faculty-carousel__btn--prev');
const nextBtn = document.querySelector('.faculty-carousel__btn--next');

if (carouselTrack) {
  const originalCards = Array.from(carouselTrack.children) as HTMLElement[];
  const totalOriginal = originalCards.length;

  // Clone all cards and append for seamless infinite loop
  originalCards.forEach(card => {
    carouselTrack.appendChild(card.cloneNode(true) as HTMLElement);
  });

  let carouselIndex = 0;
  let carouselTimer: ReturnType<typeof setInterval>;
  let isTransitioning = false;
  const GAP = 24;

  function getCardStep() {
    return carouselTrack!.offsetWidth + GAP;
  }

  function slideTo(index: number, animate = true) {
    if (!animate) {
      carouselTrack!.style.transition = 'none';
    } else {
      carouselTrack!.style.transition = 'transform 0.5s ease';
    }
    carouselTrack!.style.transform = `translateX(-${index * getCardStep()}px)`;
    carouselIndex = index;
  }

  // When transition ends on a cloned region, snap back invisibly
  carouselTrack.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (carouselIndex >= totalOriginal) {
      slideTo(carouselIndex - totalOriginal, false);
    } else if (carouselIndex < 0) {
      slideTo(carouselIndex + totalOriginal, false);
    }
  });

  function nextFaculty() {
    if (isTransitioning) return;
    isTransitioning = true;
    slideTo(carouselIndex + 1);
  }

  function prevFaculty() {
    if (isTransitioning) return;
    isTransitioning = true;
    slideTo(carouselIndex - 1);
  }

  function startCarousel() {
    carouselTimer = setInterval(nextFaculty, 3000);
  }

  function resetCarousel() {
    clearInterval(carouselTimer);
    startCarousel();
  }

  nextBtn?.addEventListener('click', () => { nextFaculty(); resetCarousel(); });
  prevBtn?.addEventListener('click', () => { prevFaculty(); resetCarousel(); });

  window.addEventListener('resize', () => slideTo(carouselIndex, false));
  startCarousel();
}

// ===== PYQ ACCORDION =====
initPyq();

// ===== STUDY MATERIAL ACCORDION =====
initStudyMaterial();

// Mentora IAS website loaded successfully
