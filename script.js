/* ============================================================
   SKYTOWER — script.js
   Vanilla JS: nav-tilstand, mobilmenu, scroll-reveal,
   hero-parallax, galleri-lightbox og kontaktformular.
   ============================================================ */

(function () {
    'use strict';

    var prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------
       1. Hero-indtoning ved load
       ---------------------------------------------------------- */
    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });
    // Fallback hvis load-eventet allerede er fyret
    if (document.readyState === 'complete') {
        document.body.classList.add('loaded');
    }

    /* ----------------------------------------------------------
       2. Navigation — solid baggrund efter scroll
       ---------------------------------------------------------- */
    var nav = document.getElementById('nav');

    function updateNav() {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    /* ----------------------------------------------------------
       2a. Ankernavigation uden hash i adressen
       Uden dette bliver fx #galleri staaende i URL'en, og et
       refresh hopper direkte derned i stedet for at starte fra
       toppen. Vi scroller selv og holder adressen ren.
       ---------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
            history.replaceState(null, '', window.location.pathname);
        });
    });

    /* ----------------------------------------------------------
       2b. Scrollspy — markér den aktive sektion i menuen
       ---------------------------------------------------------- */
    var spyLinks = {};
    document.querySelectorAll('.nav__link[href^="#"]').forEach(function (a) {
        spyLinks[a.getAttribute('href').slice(1)] = a;
    });

    function setActive(id) {
        Object.keys(spyLinks).forEach(function (key) {
            var on = key === id;
            spyLinks[key].classList.toggle('active', on);
            if (on) {
                spyLinks[key].setAttribute('aria-current', 'true');
            } else {
                spyLinks[key].removeAttribute('aria-current');
            }
        });
    }

    if ('IntersectionObserver' in window) {
        // Sektionen, der krydser midten af viewporten, er den aktive
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        Object.keys(spyLinks).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) spy.observe(section);
        });

        // Ryd markeringen, når man er tilbage i hero
        var heroSpy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive('');
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        heroSpy.observe(document.getElementById('hero'));
    }

    /* ----------------------------------------------------------
       3. Mobilmenu
       ---------------------------------------------------------- */
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    function setMenu(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Luk menu' : 'Åbn menu');
        menu.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () {
        setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Luk menuen når et link vælges
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
        if (!menu.classList.contains('open')) return;

        if (e.key === 'Escape') {
            setMenu(false);
            toggle.focus();
            return;
        }

        // Fokusfælde: hold Tab inden for toggle-knappen og menupunkterne
        if (e.key === 'Tab') {
            var focusables = [toggle].concat(
                Array.prototype.slice.call(menu.querySelectorAll('a'))
            );
            var first = focusables[0];
            var last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    /* ----------------------------------------------------------
       4. Scroll-reveal via IntersectionObserver
       ---------------------------------------------------------- */
    var revealEls = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

        revealEls.forEach(function (el, i) {
            // Let forskudt stagger inden for samme viewport-batch
            el.style.setProperty('--d', (i % 3) * 0.12 + 's');
            io.observe(el);
        });
    }

    /* ----------------------------------------------------------
       5. Hero-parallax — billedet glider langsommere end scroll
       ---------------------------------------------------------- */
    var heroMedia = document.getElementById('heroMedia');

    if (heroMedia && !prefersReducedMotion) {
        var ticking = false;

        function parallax() {
            var y = window.scrollY;
            // Kun mens hero er i viewporten
            if (y < window.innerHeight) {
                heroMedia.style.transform = 'translateY(' + y * 0.22 + 'px)';
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(parallax);
            }
        }, { passive: true });
    }

    /* ----------------------------------------------------------
       6. Galleri-lightbox med tastaturnavigation
       ---------------------------------------------------------- */
    var items = Array.prototype.slice.call(
        document.querySelectorAll('.gallery__item')
    );
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightboxImg');
    var lbCaption = document.getElementById('lightboxCaption');
    var lbClose = document.getElementById('lightboxClose');
    var lbPrev = document.getElementById('lightboxPrev');
    var lbNext = document.getElementById('lightboxNext');
    var current = 0;
    var lastFocus = null;

    var lbCount = document.getElementById('lightboxCount');

    function show(index) {
        current = (index + items.length) % items.length;
        var item = items[current];
        lbImg.src = item.dataset.full;
        lbImg.alt = item.querySelector('img').alt;
        lbCaption.textContent = item.dataset.caption || '';
        lbCount.textContent = (current + 1) + ' / ' + items.length;

        // Forudindlæs nabobillederne, så bladring føles øjeblikkelig
        [current - 1, current + 1].forEach(function (i) {
            var neighbor = items[(i + items.length) % items.length];
            var pre = new Image();
            pre.src = neighbor.dataset.full;
        });
    }

    function openLightbox(index) {
        lastFocus = document.activeElement;
        show(index);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        lbClose.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }

    items.forEach(function (item, i) {
        item.addEventListener('click', function () { openLightbox(i); });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { show(current - 1); });
    lbNext.addEventListener('click', function () { show(current + 1); });

    // Klik på den mørke baggrund lukker
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);

        // Simpel fokusfælde mellem lightboxens knapper
        if (e.key === 'Tab') {
            var focusables = [lbClose, lbPrev, lbNext];
            var idx = focusables.indexOf(document.activeElement);
            if (e.shiftKey && idx <= 0) {
                e.preventDefault();
                focusables[focusables.length - 1].focus();
            } else if (!e.shiftKey && idx === focusables.length - 1) {
                e.preventDefault();
                focusables[0].focus();
            }
        }
    });

    /* ----------------------------------------------------------
       7. Kopiér e-mail — fallback for brugere uden mailprogram
       ---------------------------------------------------------- */
    var copyBtn = document.getElementById('copyEmail');
    var copyTimer = null;

    copyBtn.addEventListener('click', function () {
        var email = copyBtn.dataset.email;

        function done() {
            copyBtn.textContent = 'Kopieret';
            copyBtn.classList.add('copied');
            clearTimeout(copyTimer);
            copyTimer = setTimeout(function () {
                copyBtn.textContent = 'Kopiér adresse';
                copyBtn.classList.remove('copied');
            }, 2000);
        }

        // Ældre browsere og afviste clipboard-tilladelser:
        // midlertidigt tekstfelt + execCommand
        function legacyCopy() {
            var tmp = document.createElement('textarea');
            tmp.value = email;
            tmp.setAttribute('readonly', '');
            tmp.style.position = 'absolute';
            tmp.style.left = '-9999px';
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            done();
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(done, legacyCopy);
        } else {
            legacyCopy();
        }
    });

    /* ----------------------------------------------------------
       8. Årstal i footer
       ---------------------------------------------------------- */
    document.getElementById('year').textContent =
        new Date().getFullYear();

}());
