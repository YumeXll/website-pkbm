// Dark Mode Toggle Functionality
const themeToggle = document.getElementById('themeToggle');

// Quick diagnostic flag: set to `true` to enable scroll animations/effects.
// Set to `false` to disable features that may hide content while we debug.
const ENABLE_SCROLL_EFFECTS = false;

// Theme Toggle Animation
const animateThemeIcon = () => {
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        // Add animation class
        icon.style.animation = 'none';
        icon.offsetHeight; // Trigger reflow
        icon.style.animation = 'iconRotate 0.5s ease-in-out';
    }
};

// Initialize theme
const initializeTheme = () => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
};

const setTheme = (theme) => {
    // Update document attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update toggle button icon
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Update button state for accessibility
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', theme === 'dark');
    }
};

// Toggle theme
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Add animation to the icon
    animateThemeIcon();
};

// Event listener for theme toggle
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also support keyboard navigation
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Initialize theme on page load
initializeTheme();

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mainNav = document.getElementById('mainNav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Mobile Dropdown Toggle
const dropdownMenus = document.querySelectorAll('.has-dropdown > a');
dropdownMenus.forEach(menu => {
    // ensure correct ARIA defaults
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            e.preventDefault();
            e.stopPropagation();
            const parent = menu.parentElement;
            const dropdown = parent.querySelector('.dropdown');

            // toggle active class
            const isActive = parent.classList.toggle('active');

            // update ARIA state
            menu.setAttribute('aria-expanded', isActive ? 'true' : 'false');

            // ensure visible on mobile by toggling inline display as a fallback
            if (dropdown) {
                dropdown.style.display = isActive ? 'block' : 'none';
            }
        }
    });
});

// Search Toggle (optional UI — guarded)
const searchToggle = document.getElementById('searchToggle');
const searchForm = document.getElementById('searchForm');
const searchClose = document.getElementById('searchClose');

if (searchToggle) {
    searchToggle.addEventListener('click', () => {
        // If the search form is not present (disabled/commented out), do nothing
        if (!searchForm) return;
        searchForm.classList.toggle('active');
        const input = searchForm.querySelector('input');
        if (searchForm.classList.contains('active') && input) {
            input.focus();
        }
    });
}

if (searchClose) {
    searchClose.addEventListener('click', () => {
        if (!searchForm) return;
        searchForm.classList.remove('active');
    });
}

// Client-side search handling
const isBlogListingPage = () => /\/pages\/blog\.html(\?|$)/.test(location.pathname + location.search) || /(^|\/)blog\.html(\?|$)/.test(location.pathname + location.search) && location.pathname.includes('/pages/');

const filterArticles = (query) => {
    const q = (query || '').toLowerCase().trim();
    const articlesContainer = document.querySelector('.articles');
    if (!articlesContainer) return;

    const cards = articlesContainer.querySelectorAll('.card');
    let visibleCount = 0;

    const tokens = q.split(/\s+/).filter(Boolean);

    cards.forEach(card => {
        const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const excerpt = (card.querySelector('.card-excerpt')?.textContent || '').toLowerCase();
        const combined = title + ' ' + excerpt;
        const matches = tokens.length === 0 || tokens.every(t => combined.includes(t));
        if (matches) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // show no-results message when nothing matches
    let noResults = articlesContainer.querySelector('.search-no-results');
    if (visibleCount === 0) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.style.padding = '40px 20px';
            noResults.style.textAlign = 'center';
            noResults.style.color = 'var(--text-color)';
            noResults.textContent = 'Tidak ada hasil untuk pencarian ini.';
            articlesContainer.appendChild(noResults);
        }
    } else if (noResults) {
        noResults.remove();
    }
};

// Handle search form submission: prevent default and either filter on blog page or redirect to blog with query
if (searchForm) {
    const searchInput = searchForm.querySelector('input[name="s"]');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = (searchInput?.value || '').trim();
        if (!q) {
            // if empty, on blog show all, else navigate to blog
            if (isBlogListingPage()) {
                filterArticles('');
                return;
            }
        }

        if (isBlogListingPage()) {
            filterArticles(q);
            // keep search form open and focused
            if (searchForm) {
                searchForm.classList.add('active');
                searchInput?.focus();
            }
        } else {
            // build a relative blog URL depending on current folder
            const blogPath = location.pathname.includes('/pages/') ? 'blog.html' : 'pages/blog.html';
            const blogUrl = new URL(blogPath + '?q=' + encodeURIComponent(q), location.href).href;
            location.href = blogUrl;
        }
    });

    // If the page was opened with ?q= or ?s=, apply the filter on load
    const params = new URLSearchParams(location.search);
    const preq = params.get('q') || params.get('s');
    if (preq && isBlogListingPage()) {
        // ensure search form is visible and input populated
        const input = searchForm.querySelector('input[name="s"]');
        if (input) {
            input.value = preq;
            searchForm.classList.add('active');
        }
        filterArticles(preq);
    }
}

// --- Search suggestions / autocomplete ---
if (searchForm) {
    const searchInput = searchForm.querySelector('input[name="s"]');
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';
    suggestions.style.display = 'none';
    searchForm.appendChild(suggestions);

    // determine script base (location of this script) to resolve relative hrefs
    const scriptSrc = (document.currentScript && document.currentScript.src) ? document.currentScript.src : (document.querySelector('script[src$="/js/main.js"],script[src*="js/main.js"]')?.src || location.href);
    const SCRIPT_BASE = scriptSrc.replace(/\/js\/main\.js$/, '/js/').replace(/\/main\.js$/, '/');

    // build index from articles and internal nav links
    const buildIndex = () => {
        const items = [];
        const articleCards = document.querySelectorAll('.articles .card');
        articleCards.forEach(card => {
            const a = card.querySelector('.card-title a') || card.querySelector('a');
            const title = a?.textContent.trim();
            const hrefRaw = a?.getAttribute('href');
            const href = hrefRaw ? (/^[a-zA-Z]+:|^\//.test(hrefRaw) ? hrefRaw : new URL(hrefRaw, SCRIPT_BASE).href) : null;
            const excerpt = (card.querySelector('.card-excerpt')?.textContent || '').trim();
            if (title && href) items.push({ type: 'article', title, href, excerpt });
        });

        // nav pages
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(a => {
            const href = a.getAttribute('href');
            const text = a.textContent.trim();
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
            const hrefResolved = (/^[a-zA-Z]+:|^\//.test(href) ? href : new URL(href, SCRIPT_BASE).href);
            if (text && hrefResolved) items.push({ type: 'page', title: text, href: hrefResolved, excerpt: '' });
        });

        // dedupe by href
        const map = new Map();
        items.forEach(it => { if (!map.has(it.href)) map.set(it.href, it); });
        return Array.from(map.values());
    };

    let index = buildIndex();

    // If a static search index file is available, load it (this makes suggestions work on all pages even when articles are not present in the DOM).
    const loadStaticIndex = () => {
        return new Promise(resolve => {
            try {
                const script = document.createElement('script');
                // load from same base as main.js
                const staticPath = SCRIPT_BASE.replace(/\/js\/$/, '/') + 'js/search-index.js';
                script.src = staticPath;
                script.onload = () => {
                    try {
                        if (window.__SITE_SEARCH_INDEX && Array.isArray(window.__SITE_SEARCH_INDEX)) {
                            window.__SITE_SEARCH_INDEX.forEach(it => {
                                const hrefRaw = it.href || '';
                                const href = hrefRaw ? (/^[a-zA-Z]+:|^\//.test(hrefRaw) ? hrefRaw : new URL(hrefRaw, SCRIPT_BASE).href) : null;
                                if (href && !index.some(i => i.href === href)) {
                                    index.push({ type: it.type || 'page', title: it.title || '', href, excerpt: it.excerpt || '' });
                                }
                            });
                        }
                    } catch (e) {}
                    resolve();
                };
                script.onerror = () => resolve();
                document.head.appendChild(script);
            } catch (e) { resolve(); }
        });
    };

    // Enrich index by fetching article pages (links containing "artikel") in background
    const enrichIndexWithArticles = async () => {
        try {
            const anchors = Array.from(document.querySelectorAll('a[href*="artikel"]'));
            const hrefs = Array.from(new Set(anchors.map(a => a.getAttribute('href')))).slice(0, 30);
            for (const href of hrefs) {
                if (!href) continue;
                // skip if already in index
                const absHref = new URL(href, location.href).href;
                if (index.some(it => it.href === absHref)) continue;

                // Try to find a matching card or anchor in the current DOM first
                let added = false;
                const pageAnchor = anchors.find(a => new URL(a.getAttribute('href'), location.href).href === absHref);
                if (pageAnchor) {
                    // look for nearby card elements (use closest .card)
                    const card = pageAnchor.closest('.card');
                    if (card) {
                        const a = card.querySelector('.card-title a') || card.querySelector('a');
                        const title = (a?.textContent || pageAnchor.textContent || '').trim();
                        const excerpt = (card.querySelector('.card-excerpt')?.textContent || '').trim();
                        if (title) {
                            index.push({ type: 'article', title, href: absHref, excerpt });
                            added = true;
                        }
                    } else {
                        // fallback: use anchor text as title
                        const title = (pageAnchor.textContent || '').trim();
                        if (title) {
                            index.push({ type: 'article', title, href: absHref, excerpt: '' });
                            added = true;
                        }
                    }
                }

                if (added) {
                    if (suggestions && suggestions.style.display === 'block') renderSuggestions(searchInput.value);
                    continue;
                }

                // If we are served over HTTP(S), attempt fetch to extract title/excerpt; otherwise skip fetch (file:// often blocks it)
                if (location.protocol.startsWith('http')) {
                    try {
                        const resp = await fetch(href, {cache: 'no-store'});
                        if (!resp.ok) continue;
                        const txt = await resp.text();
                        const doc = new DOMParser().parseFromString(txt, 'text/html');
                        const title = (doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent || '').trim();
                        let excerpt = '';
                        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
                        if (metaDesc) excerpt = metaDesc.trim();
                        else {
                            const p = doc.querySelector('p');
                            if (p) excerpt = p.textContent.trim().slice(0, 200);
                        }
                        if (title) {
                            index.push({ type: 'article', title, href: absHref, excerpt });
                            if (suggestions && suggestions.style.display === 'block') renderSuggestions(searchInput.value);
                        }
                    } catch (err) {
                        // ignore fetch errors per page
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    };
    // Track whether static index has been loaded
    let STATIC_INDEX_LOADED = false;

    const refreshIndex = () => {
        const base = buildIndex();
        const map = new Map();
        base.forEach(it => map.set(it.href, it));
        // merge static index if present
        if (window.__SITE_SEARCH_INDEX && Array.isArray(window.__SITE_SEARCH_INDEX)) {
            window.__SITE_SEARCH_INDEX.forEach(it => {
                const hrefRaw = it.href || '';
                const href = hrefRaw ? (/^[a-zA-Z]+:|^\//.test(hrefRaw) ? hrefRaw : new URL(hrefRaw, SCRIPT_BASE).href) : null;
                if (href && !map.has(href)) map.set(href, { type: it.type || 'page', title: it.title || '', href, excerpt: it.excerpt || '' });
            });
        }
        // keep any previously-enriched items
        index.forEach(it => { if (!map.has(it.href)) map.set(it.href, it); });
        index = Array.from(map.values());
    };

    // Load static index first (if present), then enrich via DOM/fetch
    loadStaticIndex().then(() => { STATIC_INDEX_LOADED = true; refreshIndex(); enrichIndexWithArticles(); });

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlight = (text, q) => {
        if (!q) return text;
        const tokens = q.split(/\s+/).filter(Boolean).map(escapeRegExp);
        if (!tokens.length) return text;
        const re = new RegExp('(' + tokens.join('|') + ')', 'ig');
        return text.replace(re, '<mark>$1</mark>');
    };

    const renderSuggestions = (q) => {
        const qs = (q || '').toLowerCase().trim();
        // ensure index is up-to-date before rendering
        refreshIndex();
        suggestions.innerHTML = '';
        if (!qs) { suggestions.style.display = 'none'; return; }

        const tokens = qs.split(/\s+/).filter(Boolean);
        const matches = index.filter(it => {
            const hay = (it.title + ' ' + it.excerpt).toLowerCase();
            return tokens.length === 0 || tokens.every(t => hay.includes(t));
        });
        const max = 8;
        if (matches.length === 0) {
            suggestions.innerHTML = '<div class="suggestion no-results"><div class="title">Tidak ada hasil</div></div>';
            suggestions.style.display = 'block';
            return;
        }

        matches.slice(0, max).forEach((it, i) => {
            const el = document.createElement('div');
            el.className = 'suggestion';
            el.setAttribute('role', 'option');
            el.setAttribute('data-href', it.href);
            el.innerHTML = '<div class="title">' + highlight(it.title, qs) + '</div>' + (it.excerpt ? '<div class="meta">' + highlight(it.excerpt, qs) + '</div>' : '');
            el.addEventListener('click', () => {
                let dest;
                try {
                    dest = (/^[a-zA-Z]+:|^\//.test(it.href)) ? (it.href.startsWith('/') ? new URL(it.href, location.origin).href : it.href) : new URL(it.href, SCRIPT_BASE).href;
                } catch (e) {
                    dest = it.href;
                }
                location.href = dest;
            });
            suggestions.appendChild(el);
        });
        suggestions.style.display = 'block';
    };

    let selected = -1;
    const updateSelection = (dir) => {
        const items = suggestions.querySelectorAll('.suggestion');
        if (!items.length) return;
        if (selected >= 0) items[selected].removeAttribute('aria-selected');
        selected = (selected + dir + items.length) % items.length;
        items[selected].setAttribute('aria-selected', 'true');
        items[selected].scrollIntoView({ block: 'nearest' });
    };

    searchInput.addEventListener('input', (e) => {
        selected = -1;
        renderSuggestions(e.target.value);
    });

    // ensure static index is loaded and index refreshed when the input is focused (helps when navigating pages without reload)
    searchInput.addEventListener('focus', () => {
        if (!STATIC_INDEX_LOADED) {
            loadStaticIndex().then(() => { STATIC_INDEX_LOADED = true; refreshIndex(); });
        } else {
            refreshIndex();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = suggestions.querySelectorAll('.suggestion');
        if (e.key === 'ArrowDown') {
            e.preventDefault(); updateSelection(1); return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault(); updateSelection(-1); return;
        }
        if (e.key === 'Enter') {
            if (selected >= 0 && items[selected]) {
                e.preventDefault();
                items[selected].click();
            }
        }
        if (e.key === 'Escape') {
            suggestions.style.display = 'none';
        }
    });

    // hide suggestions when clicking outside
    document.addEventListener('click', (ev) => {
        if (!searchForm.contains(ev.target)) {
            suggestions.style.display = 'none';
        }
    });

    // rebuild index when DOM may change (e.g., on blog page when filtering)
    const observer = new MutationObserver(() => { index = buildIndex(); });
    observer.observe(document.body, { childList: true, subtree: true });

}

// end suggestions

// Close search form on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchForm && searchForm.classList.contains('active')) {
        searchForm.classList.remove('active');
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#mobile-menu-toggle' && href !== '#mobile-header-search') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Sticky Header on Scroll (guarded by diagnostic flag)
let lastScroll = 0;
const header = document.querySelector('.header');
if (ENABLE_SCROLL_EFFECTS) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}

// Animation on Scroll (Simple Implementation) - guarded by diagnostic flag
if (ENABLE_SCROLL_EFFECTS) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Add animation to elements
    const animateElements = document.querySelectorAll('.audience-card, .program-card, .testimonial-card, .blog-card, .partner-logo');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Testimonial Slider (Simple Auto-rotate)
const testimonialCards = document.querySelectorAll('.testimonial-card');
if (testimonialCards.length > 0 && window.innerWidth < 768) {
    let currentTestimonial = 0;
    
    const showTestimonial = (index) => {
        testimonialCards.forEach((card, i) => {
            if (i === index) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };
    
    // Initially show only first testimonial on mobile
    showTestimonial(currentTestimonial);
    
    // Auto-rotate testimonials every 5 seconds on mobile
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

// Form Validation (if needed later)
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--danger-color)';
            } else {
                input.style.borderColor = 'var(--border-color)';
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Mohon lengkapi semua field yang wajib diisi.');
        }
    });
});

// Click outside to close mobile menu
document.addEventListener('click', (e) => {
    if (mainNav && mainNav.classList.contains('active')) {
        if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

// WhatsApp Float Button (Optional - can be added to HTML)
const createWhatsAppButton = () => {
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = 'https://api.whatsapp.com/send/?phone=6285219209949&text=Saya+ingin+mendaftar+di+PKBM+Bale+Rumawat+dari+WEB&type=phone_number&app_absent=0';
    whatsappBtn.target = '_blank';
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappBtn.setAttribute('aria-label', 'Chat WhatsApp');
    document.body.appendChild(whatsappBtn);
};

// Uncomment to add WhatsApp float button
   createWhatsAppButton();

// Add style for WhatsApp float button
const style = document.createElement('style');
style.textContent = `
    .whatsapp-float {
        position: fixed;
        width: 60px;
        height: 60px;
        bottom: 30px;
        right: 30px;
        background-color: #25d366;
        color: #fff;
        border-radius: 50%;
        text-align: center;
        font-size: 30px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .whatsapp-float:hover {
        background-color: #128c7e;
        transform: scale(1.1);
    }
    
    .header.scroll-up {
        transform: translateY(0);
    }
    
    .header.scroll-down {
        transform: translateY(-100%);
    }
    
    .header {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);

// Console message
console.log('%c PKBM Bale Rumawat ', 'background: #16a34a; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
console.log('%c Website by PKBM Bale Rumawat Development Team ', 'background: #84cc16; color: #14532d; padding: 5px; font-size: 12px;');
