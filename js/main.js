(() => {
  document.documentElement.classList.add('motion-ready');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const nav = document.getElementById('site-nav');
  const scrollProgress = document.getElementById('scroll-progress');
  const menuButton = document.getElementById('menu-button');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = [...document.querySelectorAll('.nav-link')];

  const updateChrome = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 24);
    if (scrollProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  };
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });
  window.addEventListener('resize', updateChrome, { passive: true });

  menuButton?.addEventListener('click', () => {
    const open = menuButton.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  navLinkItems.forEach((link) => {
    link.addEventListener('click', () => {
      menuButton?.classList.remove('open');
      navLinks.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', 'Open navigation');
    });
  });

  const observedSections = document.querySelectorAll('header[id], section[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    navLinkItems.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-38% 0px -52% 0px', threshold: [0.01, 0.2, 0.5] });
  observedSections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  // Hero specialization is intentionally static for a clearer professional introduction.


  const counterContainer = document.querySelector('.metrics-grid');
  let countersPlayed = false;
  const runCounters = () => {
    if (countersPlayed) return;
    countersPlayed = true;
    document.querySelectorAll('[data-counter]').forEach((element) => {
      const target = Number(element.dataset.counter);
      if (prefersReducedMotion) {
        element.textContent = String(target);
        return;
      }
      const start = performance.now();
      const duration = 1150;
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    });
  };
  if (counterContainer) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runCounters();
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    counterObserver.observe(counterContainer);
  }

  document.querySelectorAll('.spotlight-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    });
  });


  document.querySelectorAll('[data-project-gallery]').forEach((showcase) => {
    const gallery = showcase.querySelector('.project-gallery');
    const image = showcase.querySelector('.project-visual > img');
    const label = showcase.querySelector('.browser-address strong');
    const count = showcase.querySelector('.browser-screen-count');
    const arrows = [...showcase.querySelectorAll('.project-gallery-nav .gallery-arrow')];
    const prev = arrows[0];
    const next = arrows[1];
    const tabs = [...showcase.querySelectorAll('.project-thumb')];

    if (!gallery || !image || !tabs.length) return;

    let activeScreen = 0;
    let galleryTimer;
    let transitionTimer;
    const autoplayDelay = Number(showcase.dataset.autoplay) || 5400;

    tabs.forEach((tab, index) => {
      tab.tabIndex = index === 0 ? 0 : -1;
      const preload = new Image();
      preload.src = tab.dataset.src;
    });

    const centerActiveTab = (tab) => {
      const targetLeft = tab.offsetLeft - (gallery.clientWidth - tab.offsetWidth) / 2;
      gallery.scrollTo({ left: Math.max(0, targetLeft), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const showScreen = (index, centerTab = true) => {
      const nextIndex = (index + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (!nextTab) return;

      activeScreen = nextIndex;
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === activeScreen;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      window.clearTimeout(transitionTimer);
      image.classList.add('is-switching');
      transitionTimer = window.setTimeout(() => {
        image.src = nextTab.dataset.src;
        image.alt = nextTab.dataset.alt;
        if (label) label.textContent = nextTab.dataset.label;
        if (count) count.textContent = `${String(activeScreen + 1).padStart(2, '0')} / ${String(tabs.length).padStart(2, '0')}`;
        requestAnimationFrame(() => image.classList.remove('is-switching'));
      }, prefersReducedMotion ? 0 : 170);

      if (centerTab) centerActiveTab(nextTab);
    };

    const stopGallery = () => window.clearInterval(galleryTimer);
    const startGallery = () => {
      stopGallery();
      if (prefersReducedMotion) return;
      galleryTimer = window.setInterval(() => showScreen(activeScreen + 1), autoplayDelay);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        showScreen(index);
        startGallery();
      });
    });

    prev?.addEventListener('click', () => {
      showScreen(activeScreen - 1);
      startGallery();
    });
    next?.addEventListener('click', () => {
      showScreen(activeScreen + 1);
      startGallery();
    });

    gallery.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') showScreen(activeScreen - 1);
      if (event.key === 'ArrowRight') showScreen(activeScreen + 1);
      if (event.key === 'Home') showScreen(0);
      if (event.key === 'End') showScreen(tabs.length - 1);
      tabs[activeScreen]?.focus({ preventScroll: true });
      startGallery();
    });

    showcase.addEventListener('pointerenter', stopGallery);
    showcase.addEventListener('pointerleave', startGallery);
    showcase.addEventListener('focusin', stopGallery);
    showcase.addEventListener('focusout', (event) => {
      if (!showcase.contains(event.relatedTarget)) startGallery();
    });

    startGallery();
  });

  if (finePointer && !prefersReducedMotion) {
    document.body.classList.add('has-pointer');
    const cursorAura = document.getElementById('cursor-aura');
    let cursorX = innerWidth / 2;
    let cursorY = innerHeight / 2;
    let auraX = cursorX;
    let auraY = cursorY;

    window.addEventListener('pointermove', (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
    }, { passive: true });

    const animateAura = () => {
      auraX += (cursorX - auraX) * 0.11;
      auraY += (cursorY - auraY) * 0.11;
      cursorAura.style.left = `${auraX}px`;
      cursorAura.style.top = `${auraY}px`;
      requestAnimationFrame(animateAura);
    };
    animateAura();

    document.querySelectorAll('.tilt-surface').forEach((surface) => {
      const strength = Number(surface.dataset.tilt || 4);
      surface.addEventListener('pointermove', (event) => {
        const rect = surface.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        surface.style.transform = `perspective(1000px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`;
      });
      surface.addEventListener('pointerleave', () => {
        surface.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });

    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });
  }

  const form = document.getElementById('contact-form');
  const submitButton = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const originalText = submitButton.firstChild.textContent;
    submitButton.disabled = true;
    submitButton.firstChild.textContent = 'Sending... ';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Request failed');
      form.reset();
      formStatus.textContent = 'Message sent successfully. I will reply soon.';
      formStatus.classList.add('success');
    } catch (error) {
      formStatus.textContent = 'Unable to send right now. Please email me directly.';
      formStatus.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.firstChild.textContent = originalText;
    }
  });
})();
