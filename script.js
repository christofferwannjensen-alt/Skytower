/* ============================================================
   SKYTOWER – script.js
   Vanilla JS: navigation, scroll-reveal, parallax, counters,
   billed-placeholders og kontaktformular.
   ============================================================ */

(function () {
    'use strict';

    /* ----------------------------------------------------------
       1. STICKY NAV – skift style ved scroll
       ---------------------------------------------------------- */
    const nav = document.getElementById('nav');

    function onScrollNav() {
        // Tilføj .scrolled når brugeren har scrollet forbi 60px
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();


    /* ----------------------------------------------------------
       2. MOBIL-MENU (hamburger)
       ---------------------------------------------------------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    function closeMenu() {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', function () {
        const isOpen = navToggle.classList.toggle('open');
        navLinks.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Luk menuen når et link klikkes (mobil)
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });


    /* ----------------------------------------------------------
       3. BILLED-PLACEHOLDERS
       Sætter background-image på elementer med data-img,
       HVIS filen findes. Ellers beholdes gradient-fallback.
       (Så siden ser pæn ud allerede før du tilføjer billeder.)
       ---------------------------------------------------------- */
    document.querySelectorAll('[data-img]').forEach(function (el) {
        const src = el.getAttribute('data-img');
        if (!src) return;

        const probe = new Image();
        probe.onload = function () {
            el.style.backgroundImage = "url('" + src + "')";
        };
        probe.src = src;   // findes filen ikke, fejler den lydløst → gradient bevares
    });


    /* ----------------------------------------------------------
       4. SCROLL-REVEAL (Intersection Observer)
       Tilføjer .is-visible til .reveal-elementer når de
       kommer i view → fade/slide-in.
       ---------------------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);   // animér kun én gang
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        // Fallback for meget gamle browsere: vis alt
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }


    /* ----------------------------------------------------------
       5. PARALLAX på hero-baggrund
       Flytter baggrunden langsommere end scroll.
       Bruger requestAnimationFrame for jævn ydeevne.
       ---------------------------------------------------------- */
    const heroBg = document.getElementById('heroBg');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    function updateParallax() {
        const offset = window.scrollY;
        // Kør kun mens hero er i nærheden af viewporten
        if (offset < window.innerHeight) {
            heroBg.style.transform = 'translateY(' + offset * 0.4 + 'px)';
        }
        ticking = false;
    }

    if (heroBg && !prefersReduced) {
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }


    /* ----------------------------------------------------------
       6. ANIMEREDE COUNTERS ("Bygningen i tal")
       Tæller op fra 0 til data-target når sektionen ses.
       ---------------------------------------------------------- */
    const counters = document.querySelectorAll('.fact__num');

    function animateCounter(el) {
        const target   = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix    = el.getAttribute('data-suffix') || '';
        const duration  = 2000;   // ms
        const startTime = performance.now();

        function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // easeOutCubic for et behageligt opbremsende forløb
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);

            el.textContent = value.toLocaleString('da-DK') + suffix;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString('da-DK') + suffix;
            }
        }
        requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window && counters.length) {
        const counterObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
        // Fallback: vis slutværdier direkte
        counters.forEach(function (el) {
            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            el.textContent = target.toLocaleString('da-DK') + (el.getAttribute('data-suffix') || '');
        });
    }


    /* ----------------------------------------------------------
       7. KONTAKTFORMULAR
       Simpel klient-validering + bekræftelse.
       (Ingen backend – tilslut din egen endpoint i submit-handler.)
       ---------------------------------------------------------- */
    const form   = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Browserens indbyggede validering (required, type=email)
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // --- Her kan du sende data til din backend, fx fetch('/api/kontakt', ...) ---
            const navn = form.elements['navn'].value.trim();

            status.textContent = 'Tak ' + navn + '! Vi har modtaget din besked og vender tilbage hurtigst muligt.';
            form.reset();
        });
    }


    /* ----------------------------------------------------------
       8. ÅRSTAL I FOOTER
       ---------------------------------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

})();
