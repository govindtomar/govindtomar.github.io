console.log('Design And Developed By Govind Tomar');
console.log('Email: govindtomar01@gmail.com');
console.log('Website: https://govindtomar.com');

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    initPageLoader();
    initPortfolio();
    initRoleRotator();
    initReveals();

    function initPageLoader() {
        const pageLoading = document.getElementById('page-loading');
        if (!pageLoading) return;

        let dismissed = false;

        function hideLoader() {
            if (dismissed) return;
            dismissed = true;
            document.documentElement.classList.remove('page-loading');
            document.documentElement.classList.add('page-ready');
            pageLoading.classList.add('hiding');
            setTimeout(() => {
                pageLoading.classList.remove('active', 'hiding');
            }, 300);
        }

        pageLoading.classList.add('active');

        function dismissWhenReady() {
            requestAnimationFrame(() => requestAnimationFrame(hideLoader));
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', dismissWhenReady, { once: true });
        } else {
            dismissWhenReady();
        }

        setTimeout(() => {
            if (document.documentElement.classList.contains('page-loading')) {
                hideLoader();
            }
        }, 8000);
    }

    function initPortfolio() {
        const root = document.querySelector('[data-portfolio]');
        if (!root) return;

        const header = document.querySelector('.site-header');
        const menuBtn = document.querySelector('.menu-btn');
        const backdrop = document.querySelector('.nav-backdrop');
        const drawer = document.querySelector('.nav-drawer');
        const drawerClose = document.querySelector('.drawer-close');
        const desktopNav = document.querySelector('[data-desktop-nav]');
        const indicator = document.querySelector('.nav-indicator');
        const sectionHrefs = (root.getAttribute('data-sections') || '#home')
            .split(',')
            .map((href) => href.trim())
            .filter(Boolean);

        let scrolled = false;
        let mobileOpen = false;
        let activeHref = sectionHrefs[0];

        function setScrolled(next) {
            scrolled = next;
            if (header) header.classList.toggle('is-scrolled', scrolled);
            updateIndicator();
        }

        function setMobileOpen(open) {
            mobileOpen = open;
            if (menuBtn) {
                menuBtn.classList.toggle('is-open', open);
                menuBtn.setAttribute('aria-expanded', String(open));
                menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            }
            if (backdrop) {
                backdrop.classList.toggle('is-open', open);
                backdrop.setAttribute('aria-hidden', String(!open));
            }
            if (drawer) {
                drawer.classList.toggle('is-open', open);
                drawer.setAttribute('aria-hidden', String(!open));
                drawer.setAttribute('aria-modal', String(open));
            }
            document.body.style.overflow = open ? 'hidden' : '';
        }

        function setActiveHref(href) {
            if (!href || href === activeHref) {
                updateIndicator();
                return;
            }
            activeHref = href;
            document.querySelectorAll('[data-nav-href]').forEach((link) => {
                const isActive = link.getAttribute('data-nav-href') === activeHref;
                link.classList.toggle('is-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
            updateIndicator();
        }

        function updateIndicator() {
            if (!desktopNav || !indicator) return;
            const link = desktopNav.querySelector(`[data-nav-href="${activeHref}"]`);
            if (!link) return;
            const navRect = desktopNav.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            indicator.style.left = `${linkRect.left - navRect.left}px`;
            indicator.style.width = `${linkRect.width}px`;
            indicator.classList.add('is-ready');
        }

        function onScroll() {
            const y = window.scrollY;
            if (!scrolled && y > 24) setScrolled(true);
            else if (scrolled && y < 8) setScrolled(false);
        }

        function spawnRipple(event) {
            const target = event.currentTarget;
            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height) * 2.2;
            ripple.className = 'material-ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
            target.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        }

        function setupActiveSection() {
            const hashSections = sectionHrefs.filter((href) => href.startsWith('#'));
            const sectionIds = hashSections.map((href) => href.slice(1)).filter(Boolean);
            const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

            if (sections.length === 0) {
                setActiveHref(sectionHrefs[sectionHrefs.length - 1] || sectionHrefs[0]);
                return;
            }

            const pickActive = () => {
                const probe = window.scrollY + window.innerHeight * 0.32;
                let current = sectionIds[0];
                for (const section of sections) {
                    if (section.offsetTop <= probe) current = section.id;
                }
                setActiveHref(`#${current}`);
            };

            const observer = new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    if (visible.length > 0) {
                        setActiveHref(`#${visible[0].target.id}`);
                        return;
                    }
                    pickActive();
                },
                {
                    rootMargin: '-18% 0px -58% 0px',
                    threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
                },
            );

            sections.forEach((section) => observer.observe(section));
            pickActive();
            window.addEventListener('scroll', pickActive, { passive: true });
            window.addEventListener('resize', pickActive);
        }

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateIndicator);
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileOpen) setMobileOpen(false);
        });

        if (menuBtn) menuBtn.addEventListener('click', () => setMobileOpen(!mobileOpen));
        if (backdrop) backdrop.addEventListener('click', () => setMobileOpen(false));
        if (drawerClose) drawerClose.addEventListener('click', () => setMobileOpen(false));

        document.querySelectorAll('[data-nav-href]').forEach((link) => {
            link.addEventListener('click', (event) => {
                spawnRipple(event);
                setMobileOpen(false);
            });
        });

        setupActiveSection();
        requestAnimationFrame(updateIndicator);
    }

    function initRoleRotator() {
        const el = document.querySelector('[data-role-rotator]');
        if (!el) return;

        const roles = JSON.parse(el.getAttribute('data-roles') || '["Full Stack Developer"]');
        const textEl = el.querySelector('[data-role-text]');
        if (!textEl || roles.length < 2) return;

        let index = 0;

        window.setInterval(() => {
            textEl.classList.add('is-hidden');
            window.setTimeout(() => {
                index = (index + 1) % roles.length;
                textEl.textContent = roles[index];
                textEl.classList.remove('is-hidden');
            }, 280);
        }, 4000);
    }

    function initReveals() {
        const nodes = document.querySelectorAll('.reveal');
        if (nodes.length === 0) return;

        if (reducedMotion) {
            nodes.forEach((el) => el.classList.add('in-view'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        );

        nodes.forEach((el) => observer.observe(el));
    }
})();
