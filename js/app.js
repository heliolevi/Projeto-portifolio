/* =========================================================
   Hélio Levi — Portfolio
   Libraries (all via CDN):
     Lenis      smooth scroll
     GSAP       scroll animation (ScrollTrigger: pin, scrub, parallax)
     Anime.js   floating particles
     Three.js   interactive 3D stack cube
     Motion     entrance animations
   Every effect degrades: no JS / no library / reduced motion
   all leave the page fully readable.
   ========================================================= */
(() => {
    'use strict';

    window.__ready = true; // tells the head failsafe the script is alive
    const root = document.documentElement;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGsap = !!(window.gsap && window.ScrollTrigger);
    const headerH = () => $('.header')?.offsetHeight || 72;

    if (hasGsap) gsap.registerPlugin(ScrollTrigger);
    // Hidden-until-animated state only exists when Motion can actually reveal it.
    if (reduce || !window.Motion) root.classList.remove('js');

    /* ---------- 1. Lenis smooth scroll ---------- */
    let lenis = null;
    if (!reduce && window.Lenis) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        if (hasGsap) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((t) => lenis.raf(t * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
    }

    // In-page anchors (works with "#id" and "index.html#id" on the home page)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="#"]');
        if (!link) return;
        const url = new URL(link.href, location.href);
        if (url.pathname !== location.pathname || !url.hash) return;
        const target = url.hash === '#top' ? 0 : $(decodeURIComponent(url.hash));
        if (target === null) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -headerH() + 1, duration: 1.4 });
        else if (target === 0) window.scrollTo({ top: 0 });
        else target.scrollIntoView();
        history.replaceState(null, '', url.hash);
    });

    /* ---------- 2. Header state + progress bar ---------- */
    const header = $('.header');
    const bar = $('.scroll-progress');
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            header?.classList.toggle('is-scrolled', y > 24);
            if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 3. Anime.js floating particles ---------- */
    (function particles() {
        const host = $('.particles');
        if (!host || reduce || !window.anime) return;
        const count = window.innerWidth < 700 ? 18 : 44;
        const rand = (a, b) => a + Math.random() * (b - a);
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'particle' + (Math.random() < 0.3 ? ' particle--dim' : '');
            const size = rand(2, 5);
            p.style.width = p.style.height = size + 'px';
            p.style.left = rand(0, 100) + '%';
            p.style.top = rand(8, 100) + '%';
            host.appendChild(p);

            const peak = p.classList.contains('particle--dim') ? rand(0.12, 0.3) : rand(0.25, 0.6);
            anime({
                targets: p,
                translateY: [0, -rand(120, 320)],
                translateX: () => anime.random(-70, 70),
                opacity: [{ value: peak, duration: 1800 }, { value: 0, duration: 2600 }],
                scale: [0.6, rand(1, 1.8)],
                duration: rand(7000, 15000),
                delay: rand(0, 9000),
                easing: 'easeInOutSine',
                loop: true,
            });
        }
    })();

    /* ---------- 4. Motion entrance animations ---------- */
    (function entrances() {
        if (reduce || !window.Motion) return;
        const { animate, inView, stagger } = Motion;
        const ease = [0.16, 1, 0.3, 1];
        const from = { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] };

        const heroEls = $$('.hero [data-enter]');
        if (heroEls.length) {
            animate(heroEls, from, { duration: 1.1, delay: stagger(0.09, { startDelay: 0.2 }), ease });
        }
        if (header) animate(header, { opacity: [0, 1], transform: ['translateY(-16px)', 'translateY(0px)'] }, { duration: 0.9, ease });

        $$('[data-enter]').filter((el) => !el.closest('.hero')).forEach((el) => {
            const siblings = $$('[data-enter]', el.parentElement).filter((s) => s.parentElement === el.parentElement);
            const delay = Math.min(siblings.indexOf(el), 4) * 0.09;
            inView(el, () => { animate(el, from, { duration: 1, delay, ease }); }, { margin: '0px 0px -8% 0px' });
        });
    })();

    /* ---------- 5. GSAP scroll animation ---------- */
    (function scrollAnimations() {
        if (!hasGsap || reduce) return;

        // Hero drifts up and softens as you leave it
        if ($('.hero__grid')) {
            gsap.to('.hero__grid', {
                yPercent: -7, opacity: 0.25, ease: 'none',
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
            });
        }

        // Screenshot parallax inside its frame
        $$('[data-parallax]').forEach((img) => {
            gsap.fromTo(img, { yPercent: 0 }, {
                yPercent: -9, ease: 'none',
                scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
            });
        });

        // Manifesto: words light up as you read
        const manifesto = $('[data-words]');
        if (manifesto) {
            const text = manifesto.textContent.trim();
            manifesto.setAttribute('aria-label', text);
            manifesto.innerHTML = text.split(/\s+/).map((w) => {
                const accent = /auditable|well-engineered/i.test(w) ? ' is-accent' : '';
                return `<span class="w${accent}" aria-hidden="true">${w} </span>`;
            }).join('');
            gsap.to($$('.w', manifesto), {
                opacity: 1, stagger: 0.12, ease: 'none',
                scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 50%', scrub: true },
            });
        }

        // Stack: pinned horizontal scroll on desktop, native swipe on mobile
        const stack = $('.stack');
        const track = $('.stack__track');
        if (stack && track) {
            gsap.matchMedia().add('(min-width: 861px)', () => {
                const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
                gsap.to(track, {
                    x: () => -distance(), ease: 'none',
                    scrollTrigger: {
                        trigger: stack, start: 'top top', end: () => '+=' + distance(),
                        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
                    },
                });
            });
        }

        window.addEventListener('load', () => ScrollTrigger.refresh());
    })();

    /* ---------- 6. Frame tilt (fine pointers only) ---------- */
    (function tilt() {
        if (reduce || !finePointer) return;
        $$('[data-tilt]').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translateZ(0)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    })();

    /* ---------- 7. Three.js interactive cube ---------- */
    function initCube() {
        const canvas = $('#cube-canvas');
        if (!canvas) return;
        if (!window.THREE) { root.classList.add('no-webgl'); return; }

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch (err) {
            root.classList.add('no-webgl');
            canvas.style.display = 'none';
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0, 8.4);

        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const key = new THREE.DirectionalLight(0xcdf3ff, 1.15);
        key.position.set(3, 4, 5);
        scene.add(key);
        const rim = new THREE.PointLight(0x22d4fd, 1.6, 30);
        rim.position.set(-4, -2, 3);
        scene.add(rim);

        const faces = [
            ['TYPESCRIPT', 'NestJS'], ['NODE.JS', 'Express'], ['AWS', 'Cloud'],
            ['POSTGRES', 'SQL'], ['MONGODB', 'NoSQL'], ['REST API', 'Swagger'],
        ];

        function drawFace(ctx, size, title, sub) {
            const g = ctx.createLinearGradient(0, 0, size, size);
            g.addColorStop(0, '#0f1822');
            g.addColorStop(1, '#080c11');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, size, size);

            ctx.strokeStyle = 'rgba(34,212,253,0.85)';
            ctx.lineWidth = 3;
            ctx.strokeRect(26, 26, size - 52, size - 52);

            ctx.strokeStyle = 'rgba(34,212,253,0.25)';
            ctx.lineWidth = 1;
            for (let i = 1; i < 8; i++) {
                const p = (size / 8) * i;
                ctx.beginPath(); ctx.moveTo(p, 26); ctx.lineTo(p, size - 26); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(26, p); ctx.lineTo(size - 26, p); ctx.stroke();
            }

            ctx.fillStyle = '#05080c';
            ctx.fillRect(56, size / 2 - 78, size - 112, 150);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#eef2f6';
            const fs = title.length > 9 ? 42 : title.length > 7 ? 54 : 72;
            ctx.font = `${fs}px "Krona One", "Montserrat", sans-serif`;
            ctx.fillText(title, size / 2, size / 2 - 10);
            ctx.fillStyle = '#22d4fd';
            ctx.font = '600 28px "JetBrains Mono", monospace';
            ctx.fillText(sub.toUpperCase(), size / 2, size / 2 + 42);
        }

        const SIZE = 512;
        const materials = faces.map(([title, sub]) => {
            const c = document.createElement('canvas');
            c.width = c.height = SIZE;
            drawFace(c.getContext('2d'), SIZE, title, sub);
            const tex = new THREE.CanvasTexture(c);
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            c._redraw = () => { drawFace(c.getContext('2d'), SIZE, title, sub); tex.needsUpdate = true; };
            tex._c = c;
            return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.2 });
        });
        // Fonts load after first paint: redraw faces once they are ready.
        if (document.fonts?.load) {
            Promise.all([
                document.fonts.load('48px "Krona One"'),
                document.fonts.load('600 28px "JetBrains Mono"'),
            ]).then(() => { materials.forEach((m) => m.map._c._redraw()); renderOnce(); }).catch(() => {});
        }

        const group = new THREE.Group();
        scene.add(group);

        const box = new THREE.BoxGeometry(2.7, 2.7, 2.7);
        group.add(new THREE.Mesh(box, materials));
        group.add(new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(2.72, 2.72, 2.72)),
            new THREE.LineBasicMaterial({ color: 0x22d4fd, transparent: true, opacity: 0.95 })
        ));

        // Orbit ring + two wireframe satellites
        const orbit = new THREE.Group();
        orbit.rotation.set(1.15, 0.35, 0);
        scene.add(orbit);
        orbit.add(new THREE.Mesh(
            new THREE.TorusGeometry(2.7, 0.012, 8, 160),
            new THREE.MeshBasicMaterial({ color: 0x22d4fd, transparent: true, opacity: 0.55 })
        ));
        const sats = [0, Math.PI].map((a) => {
            const s = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.17)),
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
            );
            s.userData.a = a;
            orbit.add(s);
            return s;
        });

        // Interaction state
        const autoY = reduce ? 0 : 0.0055;
        const autoX = reduce ? 0 : 0.0022;
        const vel = { x: autoX, y: autoY };
        group.rotation.set(-0.45, 0.65, 0);
        let dragging = false, lastX = 0, lastY = 0, travelled = 0;
        const mouse = { x: 0, y: 0 };
        let pop = 0;

        canvas.addEventListener('pointerdown', (e) => {
            dragging = true; travelled = 0;
            lastX = e.clientX; lastY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
            start();
        });
        canvas.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
            mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
            if (!dragging) return;
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;
            travelled += Math.abs(dx) + Math.abs(dy);
            vel.y = dx * 0.0105;
            vel.x = dy * 0.0105;
            group.rotation.y += vel.y;
            group.rotation.x += vel.x;
        });
        const release = () => {
            if (!dragging) return;
            dragging = false;
            if (travelled < 5) { pop = 1; vel.y += 0.09; } // a click kicks a spin
        };
        canvas.addEventListener('pointerup', release);
        canvas.addEventListener('pointercancel', release);
        canvas.addEventListener('pointerleave', () => { mouse.x = mouse.y = 0; });

        // Scroll adds a little spin
        let lastScroll = window.scrollY;
        window.addEventListener('scroll', () => {
            const d = window.scrollY - lastScroll;
            lastScroll = window.scrollY;
            if (!reduce) vel.y = Math.max(-0.12, Math.min(0.12, vel.y + d * 0.0006));
        }, { passive: true });

        // Sizing
        function resize() {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderOnce();
        }
        new ResizeObserver(resize).observe(canvas);

        // Render loop only while the stage is visible
        let running = false, visible = true, t0 = performance.now();
        function frame(now) {
            if (!running) return;
            const t = (now - t0) / 1000;
            if (!dragging) {
                vel.y += (autoY - vel.y) * 0.035;
                vel.x += (autoX - vel.x) * 0.035;
                group.rotation.y += vel.y;
                group.rotation.x += vel.x;
            }
            // pointer parallax on the whole rig
            group.position.x += (mouse.x * 0.22 - group.position.x) * 0.06;
            group.position.y += (-mouse.y * 0.18 - group.position.y) * 0.06;
            pop *= 0.9;
            const s = 1 + pop * 0.07;
            group.scale.setScalar(s);

            orbit.rotation.z += reduce ? 0 : 0.003;
            sats.forEach((m) => {
                const a = m.userData.a + t * 0.6;
                m.position.set(Math.cos(a) * 2.7, Math.sin(a) * 2.7, 0);
                m.rotation.x += 0.02; m.rotation.y += 0.03;
            });
            renderer.render(scene, camera);
            requestAnimationFrame(frame);
        }
        function start() {
            if (running || !visible) return;
            running = true;
            requestAnimationFrame(frame);
        }
        function renderOnce() { if (!running) renderer.render(scene, camera); }

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && (!reduce || dragging)) start(); else running = false;
        }, { threshold: 0.05 }).observe(canvas);

        resize();
        if (reduce) renderOnce(); else start();
    }

    // Three.js is the heaviest file (~600 KB): load it after everything else
    // has started so it never delays the hero entrance.
    if ($('#cube-canvas')) {
        if (window.THREE) initCube();
        else {
            const tag = document.createElement('script');
            tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            tag.onload = initCube;
            tag.onerror = () => root.classList.add('no-webgl');
            document.head.appendChild(tag);
        }
    }
})();
