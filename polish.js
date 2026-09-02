(() => {
  window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger) return;

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', () => {
      document.documentElement.classList.add('story-mode');

      // Remove legacy vertical-section ScrollTriggers created by script.js.
      ScrollTrigger.getAll().forEach((st) => {
        const trigger = st.trigger;
        if (trigger?.matches?.('#problems, #sprints, .problem-sprint-story, .outcome-team-story')) {
          st.animation?.kill?.();
          st.kill();
        }
      });

      const main = document.querySelector('main');
      const scenes = [
        document.querySelector('#hero'),
        document.querySelector('#problems'),
        document.querySelector('#sprints'),
        document.querySelector('#outcomes'),
        document.querySelector('#team')
      ];
      const sceneNames = ['hero', 'problems', 'sprints', 'outcomes', 'team'];
      const navLinks = [...document.querySelectorAll('.desktop-nav [data-nav]')];
      const navIndicator = document.querySelector('.nav-indicator');
      const brand = document.querySelector('.brand');
      const problemPaths = gsap.utils.toArray('.problem-path');
      const sprintLines = gsap.utils.toArray('.sprint-line');
      const problemCopy = document.querySelector('.problem-copy');
      const problemArt = document.querySelector('.problem-art');

      let currentScene = -1;
      let storyTrigger = null;

      // Reset any inline values left by the previous vertical ScrollTrigger implementation.
      gsap.set(main, { backgroundColor: '#ffffff' });
      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(scenes[0], { autoAlpha: 1 });
      gsap.set(problemArt, { autoAlpha: 1, x: 0, y: 0, yPercent: 0 });
      gsap.set(problemPaths, { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0% 50%' });
      gsap.set(sprintLines, { opacity: 0, scaleX: 1, transformOrigin: '0% 50%' });
      scenes[0].classList.add('is-story-active');

      const setStoryNav = (index, immediate = false, force = false) => {
        if (index === currentScene && !force) return;
        currentScene = index;

        scenes.forEach((scene, i) => scene.classList.toggle('is-story-active', i === index));

        const name = sceneNames[index];
        navLinks.forEach((link) => {
          const active = link.dataset.nav === name;
          link.classList.toggle('is-active', active);
          gsap.to(link, {
            opacity: active ? 1 : 0.62,
            y: active ? -1 : 0,
            duration: immediate ? 0 : 0.28,
            ease: 'power2.out',
            overwrite: true
          });
        });

        const active = navLinks.find((link) => link.dataset.nav === name);
        if (!active || name === 'hero') {
          gsap.to(navIndicator, {
            opacity: 0,
            width: 0,
            duration: immediate ? 0 : 0.22,
            ease: 'power2.out',
            overwrite: true
          });
          return;
        }

        const navRect = active.parentElement.getBoundingClientRect();
        const rect = active.getBoundingClientRect();
        gsap.to(navIndicator, {
          x: rect.left - navRect.left,
          width: rect.width,
          opacity: 1,
          duration: immediate ? 0 : 0.34,
          ease: 'power3.out',
          overwrite: true
        });
      };

      setStoryNav(0, true, true);

      // Subtle ambient movement while Problems is held. Individual path transforms are
      // reserved for the scroll-driven straightening sequence.
      const lineFloat = gsap.to(problemArt, {
        x: 7,
        y: -5,
        duration: 8.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      const getLineTarget = (index, axis) => {
        const path = problemPaths[index];
        const line = sprintLines[index];
        if (!path || !line) return 0;

        const p = path.getBoundingClientRect();
        const l = line.getBoundingClientRect();

        if (axis === 'x') return l.left - p.left;
        if (axis === 'y') return (l.top + l.height / 2) - (p.top + p.height / 2);
        if (axis === 'scaleX') return Math.max(0.2, l.width / Math.max(1, p.width));
        return 0;
      };

      const tl = gsap.timeline({ defaults: { ease: 'sine.inOut' } });

      // HERO → PROBLEMS. The viewport stays fixed; only the scene state changes.
      tl.to(scenes[0], { autoAlpha: 0, duration: 0.14 }, 0.68)
        .to(main, { backgroundColor: '#1c1c1c', duration: 0.22 }, 0.74)
        .to(scenes[1], { autoAlpha: 1, duration: 0.16 }, 0.84);

      // PROBLEMS → SPRINTS. Tangled paths visibly collapse into the three clean service lines.
      tl.to(problemCopy, { autoAlpha: 0, duration: 0.12 }, 1.52)
        .to(problemArt, { x: 0, y: 0, duration: 0.12, ease: 'power2.out' }, 1.52);

      problemPaths.forEach((path, index) => {
        tl.to(path, {
          x: () => getLineTarget(index, 'x'),
          y: () => getLineTarget(index, 'y'),
          scaleX: () => getLineTarget(index, 'scaleX'),
          scaleY: 0.008,
          rotation: 0,
          duration: 0.34,
          ease: 'power2.inOut'
        }, 1.56 + index * 0.025);
      });

      tl.to(main, { backgroundColor: '#ffffff', duration: 0.22 }, 1.69)
        .to(scenes[2], { autoAlpha: 1, duration: 0.16 }, 1.78)
        .to(sprintLines, { opacity: 1, scaleX: 1, stagger: 0.025, duration: 0.12 }, 1.87)
        .to(problemArt, { autoAlpha: 0, duration: 0.10 }, 1.91)
        .to(scenes[1], { autoAlpha: 0, duration: 0.08 }, 1.94);

      // SPRINTS → OUTCOMES.
      tl.to(scenes[2], { autoAlpha: 0, duration: 0.14 }, 2.70)
        .to(main, { backgroundColor: '#0066ff', duration: 0.22 }, 2.76)
        .to(scenes[3], { autoAlpha: 1, duration: 0.16 }, 2.86);

      // OUTCOMES → TEAM. No circle: blue resolves directly to the final white state.
      tl.to(scenes[3], { autoAlpha: 0, duration: 0.14 }, 3.70)
        .to(main, { backgroundColor: '#ffffff', duration: 0.22 }, 3.76)
        .to(scenes[4], { autoAlpha: 1, duration: 0.16 }, 3.86);

      storyTrigger = ScrollTrigger.create({
        trigger: main,
        animation: tl,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const index = Math.max(0, Math.min(4, Math.round(self.progress * 4)));
          setStoryNav(index);

          // Ambient drift only while Problems is the dominant state.
          if (index === 1 && self.progress < 0.39) lineFloat.resume();
          else lineFloat.pause();
        }
      });

      const scrollToScene = (index) => {
        if (!storyTrigger) return;
        const top = storyTrigger.start + ((storyTrigger.end - storyTrigger.start) * index / 4);
        window.scrollTo({ top, behavior: 'smooth' });
      };

      navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          const index = sceneNames.indexOf(link.dataset.nav);
          if (index < 0) return;
          event.preventDefault();
          scrollToScene(index);
        });
      });

      brand?.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToScene(0);
      });

      const refresh = () => {
        ScrollTrigger.refresh();
        setStoryNav(Math.max(0, currentScene), true, true);
      };
      window.addEventListener('resize', refresh);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        setStoryNav(0, true, true);
      });

      return () => {
        window.removeEventListener('resize', refresh);
        lineFloat.kill();
        tl.kill();
        storyTrigger?.kill();
        document.documentElement.classList.remove('story-mode');
        gsap.set(main, { clearProps: 'backgroundColor' });
        gsap.set(scenes, { clearProps: 'all' });
        gsap.set(problemArt, { clearProps: 'all' });
        gsap.set(problemPaths, { clearProps: 'all' });
        gsap.set(sprintLines, { clearProps: 'all' });
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      document.documentElement.classList.remove('story-mode');
    });
  });
})();
