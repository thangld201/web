// Simple script to handle mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const menu = document.getElementById('menu');
  // Mobile navigation toggle
  if (navToggle && menu) {
    navToggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  // IntersectionObserver for reveal animations
  let observer;
  const initReveal = () => {
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      if (!observer) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.2,
          }
        );
      }
      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback: make all elements visible immediately
      revealElements.forEach(el => el.classList.add('active'));
    }
  };

  // Function to initialise publication filtering
  const initPublicationFilter = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const publicationCards = document.querySelectorAll('.pub-card');
    const yearSections = document.querySelectorAll('.year-section');
    if (filterButtons.length > 0 && publicationCards.length > 0) {
      filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
          // Set active class on clicked button
          filterButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const filter = this.getAttribute('data-filter');
          const showAll = filter === 'all';

          publicationCards.forEach(card => {
            const cardYear = (card.getAttribute('data-type') || '').trim();
            const matches = showAll || String(cardYear) === String(filter);
            card.style.display = matches ? 'block' : 'none';
          });

          yearSections.forEach(section => {
            const hasVisibleCard = Array.from(section.querySelectorAll('.pub-card'))
              .some(card => card.style.display !== 'none');
            const showSection = showAll || hasVisibleCard;
            section.style.display = showSection ? 'block' : 'none';
            if (showSection) {
              section.classList.add('active');
            }
          });
        });
      });
    }
  };

  /*
   * The Jekyll version of this site builds the team, publications and news lists at compile time using
   * Liquid and data files.  Therefore we don't fetch JSON here.  Instead we simply initialise the
   * publication filtering (if a publication list exists) and run the reveal animations on page load.
   */

  // Initialise filters for publications
  const pubSection = document.querySelector('.publications-section');
  if (pubSection) {
    initPublicationFilter();
  }

  // Initial reveal on page load for any static elements
  initReveal();

  /* Carousel: auto-play, controls, and dots */
  const initCarousel = () => {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dots = Array.from(carousel.querySelectorAll('.dot'));
    let current = 0;
    let slideWidth = carousel.clientWidth;
    let timer = null;

    const updateSizes = () => {
      slideWidth = carousel.clientWidth;
      track.style.transform = `translateX(${-current * slideWidth}px)`;
    };
    window.addEventListener('resize', updateSizes);

    const moveTo = index => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      current = index;
      track.style.transform = `translateX(${-index * slideWidth}px)`;
      dots.forEach(d => d.classList.remove('active'));
      if (dots[current]) dots[current].classList.add('active');
    };

    const next = () => moveTo(current + 1);
    const prev = () => moveTo(current - 1);

    nextBtn && nextBtn.addEventListener('click', () => { next(); resetTimer(); });
    prevBtn && prevBtn.addEventListener('click', () => { prev(); resetTimer(); });
    dots.forEach(d => d.addEventListener('click', e => { moveTo(Number(e.currentTarget.dataset.index)); resetTimer(); }));

    // Auto-play
    const startTimer = () => { if (!timer) timer = setInterval(next, 4500); };
    const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
    const resetTimer = () => { stopTimer(); startTimer(); };
    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);

    // Touch support
    let startX = 0;
    carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopTimer(); });
    carousel.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 40) prev();
      else if (startX - endX > 40) next();
      resetTimer();
    });

    // Initialise and start autoplay
    setTimeout(() => { updateSizes(); moveTo(0); startTimer(); }, 50);
  };
  initCarousel();

  // Back to top button functionality
  const toTopBtn = document.getElementById('toTop');
  if (toTopBtn) {
    const toggleToTop = () => {
      if (window.scrollY > 200) {
        toTopBtn.classList.add('show');
      } else {
        toTopBtn.classList.remove('show');
      }
    };
    toggleToTop();
    window.addEventListener('scroll', toggleToTop);
    toTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});