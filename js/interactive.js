document.addEventListener('DOMContentLoaded', () => {

    /* ===========================
       1. MOUSE NEON GLOW FOLLOW
    =========================== */
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        spawnSparkle(e.clientX, e.clientY);
    });

    // Smooth glow follow with lerp
    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Expand glow on interactive elements
    const hoverTargets = document.querySelectorAll('.button, .project-card, .header__link, .presentation__hero-img');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => glow.classList.add('cursor-glow--active'));
        el.addEventListener('mouseleave', () => glow.classList.remove('cursor-glow--active'));
    });


    /* ===========================
       2. SPARKLE PARTICLE TRAIL
    =========================== */
    let lastSparkleTime = 0;

    function spawnSparkle(x, y) {
        const now = Date.now();
        if (now - lastSparkleTime < 40) return; // throttle to one sparkle per 40ms
        lastSparkleTime = now;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        const size = Math.random() * 5 + 3;

        sparkle.style.left = (x + offsetX) + 'px';
        sparkle.style.top = (y + offsetY) + 'px';
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.opacity = Math.random() * 0.7 + 0.3;

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 600);
    }


    /* ===========================
       3. BUTTON RIPPLE EFFECT
    =========================== */
    document.querySelectorAll('.button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });


    /* ===========================
       4. PROJECT CARD 3D TILT
    =========================== */
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });


    /* ===========================
       5. HEADER LINK ACTIVE STATE
    =========================== */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.header__link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.style.color = '#fff';
            link.style.borderBottom = '2px solid var(--color-primary)';
            link.style.paddingBottom = '4px';
        }
    });


    /* ===========================
       6. FOOTER NEON LETTER EFFECT
    =========================== */
    const footerP = document.querySelector('.footer p');
    if (footerP) {
        const text = footerP.textContent;
        footerP.innerHTML = text.split('').map(char => {
            if (char === ' ') return '<span class="footer__char">&nbsp;</span>';
            return `<span class="footer__char">${char}</span>`;
        }).join('');

        footerP.querySelectorAll('.footer__char').forEach(span => {
            span.addEventListener('mouseenter', () => {
                // Pick a random neon color from a premium palette
                const neons = [
                    '#22D4FD', // cyan
                    '#a855f7', // purple
                    '#f472b6', // pink
                    '#34d399', // emerald
                    '#fbbf24', // amber
                ];
                const color = neons[Math.floor(Math.random() * neons.length)];
                span.style.color = color;
                span.style.textShadow = `0 0 8px ${color}, 0 0 20px ${color}`;
                span.style.transition = 'none';
            });
            span.addEventListener('mouseleave', () => {
                span.style.color = '';
                span.style.textShadow = '';
                span.style.transition = 'color 0.5s ease, text-shadow 0.5s ease';
            });
        });
    }

});
