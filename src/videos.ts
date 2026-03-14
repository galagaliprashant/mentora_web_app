import './style.css';
import { initVideoPage } from './vdocipher';

// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger?.addEventListener('click', () => {
  navMenu?.classList.toggle('open');
  hamburger.classList.toggle('active');
});

const dropdownParents = document.querySelectorAll('.has-dropdown > a');
dropdownParents.forEach((link) => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parent = (link as HTMLElement).parentElement;
      parent?.classList.toggle('open');
    }
  });
});

// ===== STICKY NAV SHADOW =====
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    mainNav?.classList.add('scrolled');
  } else {
    mainNav?.classList.remove('scrolled');
  }
});

const navStyle = document.createElement('style');
navStyle.textContent = `.main-nav.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,.15); }`;
document.head.appendChild(navStyle);

// ===== INIT VDOCIPHER =====
initVideoPage();
