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
    menu.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            e.preventDefault();
            const parent = menu.parentElement;
            parent.classList.toggle('active');
        }
    });
});

// Search Toggle
const searchToggle = document.getElementById('searchToggle');
const searchForm = document.getElementById('searchForm');
const searchClose = document.getElementById('searchClose');

if (searchToggle) {
    searchToggle.addEventListener('click', () => {
        searchForm.classList.toggle('active');
        if (searchForm.classList.contains('active')) {
            searchForm.querySelector('input').focus();
        }
    });
}

if (searchClose) {
    searchClose.addEventListener('click', () => {
        searchForm.classList.remove('active');
    });
}

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

// Sticky Header on Scroll
let lastScroll = 0;
const header = document.querySelector('.header');

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

// Animation on Scroll (Simple Implementation)
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
    whatsappBtn.href = 'https://wa.me/6287810103490?text=Halo%20Saya%20ingin%20menanyakan%20informasi%20PKBM%20MIC';
    whatsappBtn.target = '_blank';
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappBtn.setAttribute('aria-label', 'Chat WhatsApp');
    document.body.appendChild(whatsappBtn);
};

// Uncomment to add WhatsApp float button
// createWhatsAppButton();

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
    
    .scroll-up {
        transform: translateY(0);
    }
    
    .scroll-down {
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
