// Simple script to handle mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
  // Use rAF-throttled callbacks for resize/scroll events to reduce layout thrashing.
  const rafThrottle = callback => {
    let scheduled = false;
    return (...args) => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        callback(...args);
      });
    };
  };

  const navToggle = document.getElementById('navToggle');
  const menu = document.getElementById('menu');
  const mobileBreakpoint = 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Mobile navigation toggle
  if (navToggle && menu) {
    const closeMenu = () => {
      menu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    const isMobileViewport = () => window.innerWidth <= mobileBreakpoint;

    navToggle.setAttribute('aria-expanded', 'false');

    navToggle.addEventListener('click', function () {
      const nextState = !menu.classList.contains('open');
      menu.classList.toggle('open', nextState);
      navToggle.setAttribute('aria-expanded', String(nextState));
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (isMobileViewport()) {
          closeMenu();
        }
      });
    });

    document.addEventListener('click', event => {
      if (!isMobileViewport()) return;
      if (!menu.classList.contains('open')) return;
      if (menu.contains(event.target) || navToggle.contains(event.target)) return;
      closeMenu();
    });

    window.addEventListener('resize', rafThrottle(() => {
      if (!isMobileViewport()) {
        closeMenu();
      }
    }));
  }

  // Make reveal elements visible immediately instead of scroll-triggered animation.
  const initReveal = () => {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => el.classList.add('active'));
  };

  // Load Twitter widgets script only when the follow button is likely to be seen.
  const initTwitterWidgets = () => {
    const followButton = document.querySelector('.twitter-follow-button');
    if (!followButton || window.twttr) return;

    let loaded = false;
    const loadTwitterScript = () => {
      if (loaded || window.twttr) return;
      loaded = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';
      script.charset = 'utf-8';
      document.body.appendChild(script);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          loadTwitterScript();
        }
      }, { rootMargin: '220px 0px' });
      observer.observe(followButton);
      return;
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadTwitterScript, { timeout: 2000 });
    } else {
      window.setTimeout(loadTwitterScript, 1200);
    }
  };

  // Function to initialise publication filtering
  const initPublicationFilter = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const publicationCards = document.querySelectorAll('.pub-card');
    const yearSections = document.querySelectorAll('.year-section');
    
    const applyFilter = (filterValue) => {
      publicationCards.forEach(card => {
        const year = card.getAttribute('data-year');
        const isSelected = card.getAttribute('data-selected') === 'true';
        let shouldShow = false;
        
        if (filterValue === 'all') {
          shouldShow = true;
        } else if (filterValue === 'selected') {
          shouldShow = isSelected;
        } else if (filterValue === year) {
          shouldShow = true;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
      });
      
      // Hide entire year sections with no visible papers to avoid large empty gaps.
      yearSections.forEach(yearSection => {
        const yearCards = yearSection.querySelectorAll('.pub-card');
        const hasVisibleCards = Array.from(yearCards).some(card => card.style.display !== 'none');
        yearSection.style.display = hasVisibleCards ? 'block' : 'none';
      });
    };
    
    if (filterButtons.length > 0 && publicationCards.length > 0) {
      // Apply default filter on page load
      const activeBtn = document.querySelector('.filter-btn.active');
      if (activeBtn) {
        applyFilter(activeBtn.getAttribute('data-filter'));
      }
      
      filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
          // Set active class on clicked button
          filterButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const filter = this.getAttribute('data-filter');
          applyFilter(filter);
        });
      });
    }
  };

  // Toggle long publication author lists.
  const initPublicationAuthorToggles = () => {
    const authorToggles = document.querySelectorAll('.pub-authors-toggle');
    if (!authorToggles.length) return;

    const expandAuthors = toggle => {
        const wrapper = toggle.closest('.pub-authors-collapsible');
        if (!wrapper) return;

        const preview = wrapper.querySelector('.pub-authors-preview');
        const full = wrapper.querySelector('.pub-authors-full');
        if (!preview || !full) return;

        preview.hidden = true;
        full.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.hidden = true;
    };

    authorToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        expandAuthors(toggle);
      });
      toggle.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          expandAuthors(toggle);
        }
      });
    });
  };

  const initPublicationPlaceholderButtons = () => {
    const placeholderButtons = document.querySelectorAll('.pub-link-btn-placeholder[data-coming-soon]');
    if (!placeholderButtons.length) return;

    let activeToast = null;
    let activeToastTimer = null;
    let activeButton = null;

    const positionToast = button => {
      if (!activeToast || !button) return;
      const rect = button.getBoundingClientRect();
      const top = rect.top + window.scrollY + (rect.height / 2);
      const left = rect.right + window.scrollX;
      activeToast.style.top = `${top}px`;
      activeToast.style.left = `${left}px`;
    };

    const removeToast = () => {
      if (!activeToast) return;
      const toastToRemove = activeToast;
      activeToast = null;
      activeButton = null;
      if (activeToastTimer) {
        window.clearTimeout(activeToastTimer);
        activeToastTimer = null;
      }
      toastToRemove.classList.remove('is-visible');
      window.setTimeout(() => {
        toastToRemove.remove();
      }, 180);
    };

    const showToast = button => {
      removeToast();

      const toast = document.createElement('div');
      const message = button.getAttribute('data-coming-soon') || 'Coming soon!';

      toast.className = 'coming-soon-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      activeToast = toast;
      activeButton = button;
      positionToast(button);

      window.requestAnimationFrame(() => {
        toast.classList.add('is-visible');
      });

      activeToastTimer = window.setTimeout(removeToast, 1400);
    };

    placeholderButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        showToast(button);
      });
    });

    window.addEventListener('resize', () => {
      positionToast(activeButton);
    });
  };

  // Keep team cards uniform in default state while allowing independent hover expansion.
  const initTeamCardSizing = () => {
    const teamGrids = document.querySelectorAll('.team-grid-simple');
    if (!teamGrids.length) return;
    const isMobileTeamViewport = () => window.innerWidth <= 900;

    teamGrids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.member-card'));
      if (!cards.length) return;

      cards.forEach(card => {
        card.style.minHeight = '';
      });

      // On mobile we keep natural card height so bio toggles can expand/collapse cleanly.
      if (isMobileTeamViewport()) {
        return;
      }

      const rows = [];
      const rowTolerance = 2;

      cards.forEach(card => {
        const rowTop = card.offsetTop;
        const existingRow = rows.find(row => Math.abs(row.top - rowTop) <= rowTolerance);
        if (existingRow) {
          existingRow.cards.push(card);
        } else {
          rows.push({ top: rowTop, cards: [card] });
        }
      });

      rows.forEach(row => {
        const tallestInRow = Math.max(...row.cards.map(card => card.offsetHeight));
        row.cards.forEach(card => {
          card.style.minHeight = `${tallestInRow}px`;
        });
      });
    });
  };

  const initTeamBioToggles = () => {
    const teamCards = document.querySelectorAll('.member-card');
    if (!teamCards.length) return;

    const isMobileTeamViewport = () => window.innerWidth <= 900;

    const updateButtonState = (button, isOpen) => {
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = isOpen ? 'Hide bio' : 'Show bio';
    };

    const applyToggleMode = () => {
      const mobileMode = isMobileTeamViewport();

      teamCards.forEach(card => {
        const bio = card.querySelector('.member-bio');
        const meta = card.querySelector('.member-meta');
        const heading = meta ? meta.querySelector('h3') : null;
        if (!bio || !meta || !heading) return;

        let toggleBtn = meta.querySelector('.member-bio-toggle');
        if (mobileMode && !toggleBtn) {
          toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.className = 'member-bio-toggle';
          toggleBtn.addEventListener('click', () => {
            const nextState = !card.classList.contains('member-bio-open');
            card.classList.toggle('member-bio-open', nextState);
            updateButtonState(toggleBtn, nextState);
          });
          heading.insertAdjacentElement('afterend', toggleBtn);
        }

        if (!toggleBtn) {
          return;
        }

        if (mobileMode) {
          card.classList.remove('member-bio-open');
          updateButtonState(toggleBtn, false);
        } else {
          card.classList.remove('member-bio-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (!mobileMode) {
        initTeamCardSizing();
      }
    };

    applyToggleMode();
    window.addEventListener('resize', rafThrottle(applyToggleMode));
  };

  // Auto-rotate research area cards (max 3 visible on desktop).
  const initResearchSlider = () => {
    const slider = document.querySelector('.research-slider');
    if (!slider) return;

    const track = slider.querySelector('.research-slider-track');
    const dotsContainer = slider.querySelector('.research-slider-dots');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.research-card'));
    if (cards.length <= 1) return;

    let currentIndex = 0;
    let visibleCount = 3;
    let maxIndex = 0;
    let timer = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let dragStartIndex = 0;
    let currentDragOffset = 0;
    let movedDuringDrag = false;
    let suppressClickUntil = 0;
    let sliderVisible = true;
    let visibilityObserver = null;

    const getVisibleCount = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    const shouldEqualizeCardHeights = () => window.innerWidth > 1024;

    const renderDots = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const dotCount = Math.max(maxIndex + 1, 1);

      for (let i = 0; i < dotCount; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `research-slider-dot${i === currentIndex ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Go to research slide ${i + 1}`);
        dot.addEventListener('click', () => {
          currentIndex = i;
          applyPosition();
          resetTimer();
        });
        dotsContainer.appendChild(dot);
      }
    };

    const getStepWidth = () => {
      const gap = parseFloat(window.getComputedStyle(track).gap || '0') || 0;
      const cardWidth = cards[0].getBoundingClientRect().width;
      return cardWidth + gap;
    };

    const clampOffset = offset => {
      const maxOffset = maxIndex * getStepWidth();
      if (offset < 0) return 0;
      if (offset > maxOffset) return maxOffset;
      return offset;
    };

    const applyPosition = () => {
      if (!cards.length) return;
      const offset = currentIndex * getStepWidth();
      track.style.transform = `translateX(-${offset}px)`;

      const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.research-slider-dot')) : [];
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    };

    const startDrag = clientX => {
      if (maxIndex <= 0) return;
      isDragging = true;
      movedDuringDrag = false;
      dragStartX = clientX;
      dragStartIndex = currentIndex;
      dragStartOffset = currentIndex * getStepWidth();
      currentDragOffset = dragStartOffset;
      track.style.transition = 'none';
      slider.classList.add('dragging');
      stopTimer();
    };

    const moveDrag = clientX => {
      if (!isDragging) return;
      const deltaX = clientX - dragStartX;
      if (Math.abs(deltaX) > 4) {
        movedDuringDrag = true;
      }
      currentDragOffset = clampOffset(dragStartOffset - deltaX);
      track.style.transform = `translateX(-${currentDragOffset}px)`;
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove('dragging');
      track.style.transition = '';

      const step = getStepWidth();
      if (step > 0) {
        const dragDistance = currentDragOffset - dragStartOffset;
        const swipeThreshold = Math.max(24, step * 0.16);

        if (dragDistance >= swipeThreshold) {
          currentIndex = Math.min(dragStartIndex + 1, maxIndex);
        } else if (dragDistance <= -swipeThreshold) {
          currentIndex = Math.max(dragStartIndex - 1, 0);
        } else {
          currentIndex = dragStartIndex;
        }
      }
      applyPosition();

      if (movedDuringDrag) {
        suppressClickUntil = Date.now() + 250;
      }
      startTimer();
    };

    const recalculate = () => {
      visibleCount = getVisibleCount();
      maxIndex = Math.max(cards.length - visibleCount, 0);

      cards.forEach(card => {
        card.style.minHeight = '';
      });

      if (shouldEqualizeCardHeights()) {
        const tallestCard = Math.max(...cards.map(card => card.offsetHeight));
        cards.forEach(card => {
          card.style.minHeight = `${tallestCard}px`;
        });
      }

      if (currentIndex > maxIndex) {
        currentIndex = 0;
      }
      renderDots();
      applyPosition();
    };

    const next = () => {
      if (maxIndex <= 0) return;
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      applyPosition();
    };

    const startTimer = () => {
      if (prefersReducedMotion || timer || maxIndex <= 0 || document.hidden || !sliderVisible) return;
      timer = window.setInterval(next, 3200);
    };

    const stopTimer = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const resetTimer = () => {
      if (prefersReducedMotion) return;
      stopTimer();
      startTimer();
    };

    const recalculateThrottled = rafThrottle(recalculate);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    const handleDragMove = event => {
      moveDrag(event.clientX);
    };

    const handleDragEnd = () => {
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
      window.removeEventListener('pointercancel', handleDragEnd);
      endDrag();
    };

    recalculate();
    startTimer();
    window.addEventListener('resize', recalculateThrottled);
    window.addEventListener('load', recalculateThrottled);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);

    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => {
        const entry = entries[0];
        sliderVisible = Boolean(entry && entry.isIntersecting);
        if (!sliderVisible) {
          stopTimer();
        } else {
          startTimer();
        }
      }, { threshold: 0.2 });
      visibilityObserver.observe(slider);
    }

    slider.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      startDrag(event.clientX);
      window.addEventListener('pointermove', handleDragMove);
      window.addEventListener('pointerup', handleDragEnd);
      window.addEventListener('pointercancel', handleDragEnd);
    });

    track.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
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
    initPublicationAuthorToggles();
    initPublicationPlaceholderButtons();
  }

  const teamSection = document.querySelector('.team-section');
  if (teamSection) {
    initTeamBioToggles();
    initTeamCardSizing();
    window.addEventListener('resize', rafThrottle(initTeamCardSizing));
  }

  initResearchSlider();

  // Initial reveal on page load for any static elements
  initReveal();
  initTwitterWidgets();

  /* Carousel: auto-play, controls, and dots */
  const initCarousel = () => {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dots = Array.from(carousel.querySelectorAll('.dot'));
    if (!track || slides.length <= 1) return;
    let current = 0;
    let slideWidth = carousel.clientWidth;
    let timer = null;
    let carouselVisible = true;
    let visibilityObserver = null;

    const updateSizes = () => {
      slideWidth = carousel.clientWidth;
      track.style.transform = `translateX(${-current * slideWidth}px)`;
    };
    window.addEventListener('resize', rafThrottle(updateSizes));

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
    const startTimer = () => {
      if (prefersReducedMotion || timer || document.hidden || !carouselVisible) return;
      timer = setInterval(next, 6000);
    };
    const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
    const resetTimer = () => {
      if (prefersReducedMotion) return;
      stopTimer();
      startTimer();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => {
        const entry = entries[0];
        carouselVisible = Boolean(entry && entry.isIntersecting);
        if (!carouselVisible) {
          stopTimer();
        } else {
          startTimer();
        }
      }, { threshold: 0.2 });
      visibilityObserver.observe(carousel);
    }

    // Touch support
    let startX = 0;
    carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopTimer(); }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 40) prev();
      else if (startX - endX > 40) next();
      resetTimer();
    }, { passive: true });

    // Initialise and start autoplay
    window.requestAnimationFrame(() => {
      updateSizes();
      moveTo(0);
      startTimer();
    });
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
    window.addEventListener('scroll', rafThrottle(toggleToTop), { passive: true });
    toTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
});
