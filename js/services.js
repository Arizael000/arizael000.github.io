document.addEventListener('DOMContentLoaded', function() {
    // Anchor links, including the hero CTA to the contact form, scroll smoothly.

    // Optional: IntersectionObserver for scroll-triggered animations
    // (CSS animations run on load, but we could add scroll-reveal for sections below hero)
    const revealElements = document.querySelectorAll('.reveal, .reveal-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Update URL without page reload
                history.pushState(null, '', targetId);
            }
        });
    });
});