/* A small, progressively enhanced kitchen. No dependencies or tracking. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const setMenu = (open, restoreFocus = false) => {
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  nav.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!document.querySelector('.site-header').contains(document.activeElement)) setMenu(false);
    });
  });
  mobile.addEventListener('change', () => setMenu(false));

  const cards = [...document.querySelectorAll('.creation')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const moreButton = document.querySelector('#gallery-more');
  const galleryStatus = document.querySelector('#gallery-status');
  let filter = 'all';
  let expanded = false;
  const selection = () => cards.filter((card) => filter === 'all' || card.dataset.category === filter);

  function updateGallery(animate = false) {
    const matching = selection();
    const visible = expanded ? matching : matching.slice(0, 6);
    for (const card of cards) card.hidden = !visible.includes(card);
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    moreButton.hidden = matching.length <= 6;
    moreButton.setAttribute('aria-expanded', String(expanded));
    moreButton.firstChild.textContent = expanded ? 'Show a little less ' : `See all ${matching.length} creations `;
    galleryStatus.textContent = `Showing ${visible.length} of ${matching.length} creations`;
    if (animate && !reducedMotion.matches) {
      visible.forEach((card, index) => card.animate(
        [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 420, delay: Math.min(index, 5) * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
      ));
    }
  }
  filters.forEach((button) => button.addEventListener('click', () => {
    if (filter === button.dataset.filter) return;
    filter = button.dataset.filter;
    expanded = false;
    updateGallery(true);
  }));
  moreButton.addEventListener('click', () => {
    expanded = !expanded;
    updateGallery(true);
    if (expanded) {
      const firstNewLink = selection()[6]?.querySelector('.photo-link');
      firstNewLink?.focus({ preventScroll: true });
      firstNewLink?.scrollIntoView({ block: 'center', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    } else {
      moreButton.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  });
  updateGallery();

  const viewer = document.querySelector('#photo-viewer');
  const viewerImage = document.querySelector('#viewer-image');
  const viewerVisual = document.querySelector('.viewer-visual');
  let viewerCards = [];
  let currentIndex = 0;
  let opener;
  let touchStart = null;
  const categoryLabels = { savoury: 'AT THE TABLE', sweet: 'SOMETHING SWEET', butter: 'BUTTER STORIES' };

  function showPhoto(index) {
    currentIndex = (index + viewerCards.length) % viewerCards.length;
    const card = viewerCards[currentIndex];
    const link = card.querySelector('.photo-link');
    const thumbnail = card.querySelector('img');
    viewerVisual.classList.add('is-loading');
    viewerImage.alt = thumbnail.alt;
    viewerImage.src = link.href;
    document.querySelector('#viewer-title').textContent = card.querySelector('h3').textContent;
    document.querySelector('#viewer-caption').textContent = card.dataset.caption;
    document.querySelector('#viewer-category').textContent = categoryLabels[card.dataset.category];
    document.querySelector('#viewer-position').textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(viewerCards.length).padStart(2, '0')}`;
    document.querySelector('#viewer-announcement').textContent = `Photo ${currentIndex + 1} of ${viewerCards.length}: ${card.querySelector('h3').textContent}.`;
    if (viewerImage.complete) viewerVisual.classList.remove('is-loading');
  }
  viewerImage.addEventListener('load', () => viewerVisual.classList.remove('is-loading'));
  viewerImage.addEventListener('error', () => {
    viewerVisual.classList.remove('is-loading');
    document.querySelector('#viewer-caption').textContent = 'This photograph could not load. Please try again in a moment.';
  });
  cards.forEach((card) => card.querySelector('.photo-link').addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    opener = event.currentTarget;
    viewerCards = selection();
    showPhoto(viewerCards.indexOf(card));
    viewer.showModal();
    document.documentElement.style.overflow = 'hidden';
    document.querySelector('.viewer-close').focus();
  }));
  document.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  document.querySelector('#viewer-prev').addEventListener('click', () => showPhoto(currentIndex - 1));
  document.querySelector('#viewer-next').addEventListener('click', () => showPhoto(currentIndex + 1));
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('click', (event) => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus({ preventScroll: true });
  });
  viewerVisual.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    else touchStart = null;
  }, { passive: true });
  viewerVisual.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(currentIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      if (element.getBoundingClientRect().top < innerHeight) return;
      element.classList.add('reveal-pending');
      observer.observe(element);
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        observer.disconnect();
        document.querySelectorAll('.reveal-pending').forEach((element) => element.classList.add('is-visible'));
      }
    });
  }

  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  const heroPhoto = document.querySelector('.hero-photo');
  const hero = document.querySelector('.hero');
  let scrollScheduled = false;
  function updateScroll() {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0})`;
    header.classList.toggle('is-scrolled', scrollY > 20);
    if (!reducedMotion.matches && !mobile.matches && scrollY < hero.offsetHeight + 200) {
      heroPhoto.style.setProperty('--parallax', `${Math.min(18, scrollY * 0.035)}px`);
    } else {
      heroPhoto.style.setProperty('--parallax', '0px');
    }
    scrollScheduled = false;
  }
  function scheduleScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  reducedMotion.addEventListener('change', scheduleScroll);
  updateScroll();
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
