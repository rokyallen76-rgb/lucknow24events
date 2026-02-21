// Main JavaScript for Lucknow24Events Website

// ============================================
// CONFIGURATION & INITIALIZATION
// ============================================

// Global variables
let supabaseClient = null;
let currentUser = null;
let siteSettings = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSiteSettings();
    checkUserSession();
    initializeAnimations();
    setupLazyLoading();
});

// Main initialization function
async function initializeApp() {
    // Initialize Supabase
    await initializeSupabase();
    
    // Load dynamic content
    await loadTestimonials();
    await loadGalleryPreview();
    await loadVenueList();
    
    // Initialize UI components
    initializeSwiper();
    initializeCounters();
    setupFormValidation();
    
    // Check URL parameters for actions
    checkUrlParams();
}

// ============================================
// SUPABASE CONFIGURATION
// ============================================

async function initializeSupabase() {
    const SUPABASE_URL = 'https://eibvlmsgprvwoetoqffa.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYnZsbXNncHJ2d29ldG9xZmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjMzODMsImV4cCI6MjA4NzIzOTM4M30.YVEGGX0nNE-S_0Nksd-H8GI1ejdx-sS2ZRHiMf6xMjw';
    
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

// ============================================
// SITE SETTINGS & THEME
// ============================================

function loadSiteSettings() {
    // Load from localStorage or use defaults
    const savedSettings = localStorage.getItem('lucknow24events_settings');
    
    if (savedSettings) {
        siteSettings = JSON.parse(savedSettings);
        applySiteTheme();
    } else {
        // Default settings
        siteSettings = {
            siteTitle: 'Lucknow24Events',
            siteTagline: 'Best Event Management in Lucknow',
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            accentColor: '#f093fb',
            contactEmail: 'info@lucknow24events.com',
            contactPhone: '+91 99999 99999',
            address: '123, Hazratganj, Lucknow - 226001'
        };
        saveSiteSettings();
    }
    
    updateSiteContent();
}

function applySiteTheme() {
    // Apply colors to CSS variables
    document.documentElement.style.setProperty('--primary-color', siteSettings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', siteSettings.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', siteSettings.accentColor);
    
    // Update meta theme color for mobile browsers
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
    }
    metaTheme.content = siteSettings.primaryColor;
}

function updateSiteContent() {
    // Update site title
    document.title = `${siteSettings.siteTitle} | ${siteSettings.siteTagline}`;
    
    // Update logo text
    const logoElements = document.querySelectorAll('.site-logo');
    logoElements.forEach(el => {
        if (el) el.textContent = siteSettings.siteTitle;
    });
    
    // Update contact info
    const contactEmailElements = document.querySelectorAll('.contact-email');
    contactEmailElements.forEach(el => {
        if (el) el.textContent = siteSettings.contactEmail;
    });
    
    const contactPhoneElements = document.querySelectorAll('.contact-phone');
    contactPhoneElements.forEach(el => {
        if (el) el.textContent = siteSettings.contactPhone;
    });
    
    const addressElements = document.querySelectorAll('.site-address');
    addressElements.forEach(el => {
        if (el) el.textContent = siteSettings.address;
    });
}

function saveSiteSettings() {
    localStorage.setItem('lucknow24events_settings', JSON.stringify(siteSettings));
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Form submissions
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    const enquiryForm = document.getElementById('quickEnquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', handleEnquirySubmit);
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Date input min value
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        setMinDate(input);
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Subdomain navigation
    document.querySelectorAll('.subdomain-link').forEach(link => {
        link.addEventListener('mouseenter', preloadSubdomain);
    });
    
    // WhatsApp button tracking
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', trackWhatsAppClick);
    }
}

// ============================================
// MOBILE MENU
// ============================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
        
        // Animate menu items
        if (!menu.classList.contains('hidden')) {
            const items = menu.querySelectorAll('li');
            items.forEach((item, index) => {
                item.style.animation = `slideIn 0.3s ease forwards ${index * 0.1}s`;
            });
        }
    }
}

// ============================================
// SMOOTH SCROLLING
// ============================================

function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - 100;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
        
        // Update URL without jumping
        history.pushState(null, null, targetId);
    }
}

// ============================================
// FORM HANDLING
// ============================================

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Database connection error. Please try again later.', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(e.target);
    const bookingData = {
        customer_name: formData.get('customerName') || document.getElementById('clientName')?.value,
        customer_email: formData.get('customerEmail') || document.getElementById('clientEmail')?.value,
        customer_phone: formData.get('customerPhone') || document.getElementById('clientPhone')?.value,
        event_type: formData.get('eventType') || document.getElementById('eventType')?.value,
        event_date: formData.get('eventDate') || document.getElementById('eventDate')?.value,
        guest_count: formData.get('guestCount') || document.getElementById('guestCount')?.value,
        venue: formData.get('venue') || document.getElementById('venue')?.value,
        requirements: formData.get('requirements') || document.getElementById('requirements')?.value,
        status: 'Pending',
        location: 'Lucknow',
        created_at: new Date().toISOString()
    };
    
    // Validate
    if (!validateBookingData(bookingData)) {
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
        submitBtn.disabled = true;
        
        // Submit to Supabase
        const { data, error } = await supabaseClient
            .from('bookings')
            .insert([bookingData])
            .select();
        
        if (error) throw error;
        
        // Show success message
        showNotification('Booking request submitted successfully! Our team will contact you within 30 minutes.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Send email notification (via edge function)
        await sendEmailNotification('booking', bookingData);
        
        // Track conversion
        trackConversion('booking_complete');
        
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Error submitting booking. Please try again or call us directly.', 'error');
    } finally {
        // Reset button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleEnquirySubmit(e) {
    e.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Database connection error. Please try again later.', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const enquiryData = {
        name: formData.get('enquiryName') || document.getElementById('enquiryName')?.value,
        phone: formData.get('enquiryPhone') || document.getElementById('enquiryPhone')?.value,
        email: formData.get('enquiryEmail') || document.getElementById('enquiryEmail')?.value,
        enquiry_type: formData.get('enquiryType') || document.getElementById('enquiryEvent')?.value,
        message: formData.get('enquiryMessage') || document.getElementById('enquiryMessage')?.value,
        status: 'New',
        location: 'Lucknow',
        created_at: new Date().toISOString()
    };
    
    if (!enquiryData.name || !enquiryData.phone || !enquiryData.message) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
        
        const { data, error } = await supabaseClient
            .from('enquiries')
            .insert([enquiryData]);
        
        if (error) throw error;
        
        showNotification('Enquiry sent successfully! We will contact you soon.', 'success');
        e.target.reset();
        
        await sendEmailNotification('enquiry', enquiryData);
        
    } catch (error) {
        console.error('Enquiry error:', error);
        showNotification('Error sending enquiry. Please try again.', 'error');
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Enquiry';
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('contactName') || document.getElementById('contactName')?.value,
        email: formData.get('contactEmail') || document.getElementById('contactEmail')?.value,
        subject: formData.get('contactSubject') || document.getElementById('contactSubject')?.value,
        message: formData.get('contactMessage') || document.getElementById('contactMessage')?.value,
        created_at: new Date().toISOString()
    };
    
    if (!contactData.name || !contactData.email || !contactData.message) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!validateEmail(contactData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        if (supabaseClient) {
            const { error } = await supabaseClient
                .from('contacts')
                .insert([contactData]);
            
            if (error) throw error;
        }
        
        showNotification('Message sent successfully! We will respond within 24 hours.', 'success');
        e.target.reset();
        
        await sendEmailNotification('contact', contactData);
        
    } catch (error) {
        console.error('Contact error:', error);
        showNotification('Error sending message. Please try again.', 'error');
    }
}

async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    showNotification('Thank you for subscribing to our newsletter!', 'success');
    e.target.reset();
}

function validateBookingData(data) {
    if (!data.customer_name || data.customer_name.length < 2) {
        showNotification('Please enter a valid name', 'error');
        return false;
    }
    
    if (data.customer_email && !validateEmail(data.customer_email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!data.customer_phone || !/^\d{10}$/.test(data.customer_phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    if (!data.event_type) {
        showNotification('Please select an event type', 'error');
        return false;
    }
    
    if (!data.event_date) {
        showNotification('Please select an event date', 'error');
        return false;
    }
    
    const selectedDate = new Date(data.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Event date cannot be in the past', 'error');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Add icon based on type
    const icon = type === 'success' ? '✅' : '❌';
    notification.innerHTML = `${icon} ${message}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// ============================================
// DYNAMIC CONTENT LOADING
// ============================================

async function loadTestimonials() {
    const container = document.querySelector('.testimonials-slider');
    if (!container) return;
    
    // Sample testimonials - In production, load from database
    const testimonials = [
        {
            name: 'Priya Sharma',
            event: 'Wedding',
            rating: 5,
            comment: 'Excellent service! Made our wedding perfect. The team was very professional and took care of everything.',
            image: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
            name: 'Rahul Verma',
            event: 'Corporate Event',
            rating: 5,
            comment: 'Very professional team. Our annual conference was a huge success. Highly recommended!',
            image: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        {
            name: 'Anjali Singh',
            event: 'Birthday Party',
            rating: 4,
            comment: 'Great decoration and arrangements. My daughter loved her birthday party!',
            image: 'https://randomuser.me/api/portraits/women/2.jpg'
        }
    ];
    
    let html = '';
    testimonials.forEach(t => {
        html += `
            <div class="swiper-slide">
                <div class="glassmorphism p-8">
                    <div class="flex items-center gap-2 mb-4">
                        ${Array(t.rating).fill('<i class="fas fa-star text-yellow-400"></i>').join('')}
                    </div>
                    <p class="text-gray-300 mb-6">"${t.comment}"</p>
                    <div class="flex items-center gap-4">
                        <img src="${t.image}" alt="${t.name}" class="w-12 h-12 rounded-full object-cover">
                        <div>
                            <p class="font-bold text-white">${t.name}</p>
                            <p class="text-sm text-gray-400">${t.event}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function loadGalleryPreview() {
    const container = document.querySelector('.gallery-preview');
    if (!container) return;
    
    if (supabaseClient) {
        try {
            const { data: images } = await supabaseClient
                .from('gallery')
                .select('*')
                .limit(6);
            
            if (images && images.length > 0) {
                displayGalleryImages(images, container);
            } else {
                displaySampleGallery(container);
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            displaySampleGallery(container);
        }
    } else {
        displaySampleGallery(container);
    }
}

function displayGalleryImages(images, container) {
    let html = '';
    images.forEach(img => {
        html += `
            <div class="gallery-item cursor-pointer" onclick="openLightbox('${img.image_url}')">
                <img src="${img.image_url}" alt="${img.title}" class="w-full h-64 object-cover rounded-lg">
                <div class="mt-2">
                    <p class="font-semibold">${img.title}</p>
                    <p class="text-sm text-gray-400">${img.location || 'Lucknow'}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function displaySampleGallery(container) {
    const sampleImages = [
        { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', title: 'Wedding at Taj', location: 'Gomti Nagar' },
        { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', title: 'Corporate Event', location: 'Hazratganj' },
        { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', title: 'Birthday Party', location: 'Alambagh' }
    ];
    
    let html = '';
    sampleImages.forEach(img => {
        html += `
            <div class="gallery-item cursor-pointer" onclick="openLightbox('${img.url}')">
                <img src="${img.url}?w=600&h=400&fit=crop" alt="${img.title}" class="w-full h-64 object-cover rounded-lg">
                <div class="mt-2">
                    <p class="font-semibold">${img.title}</p>
                    <p class="text-sm text-gray-400">${img.location}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function loadVenueList() {
    const container = document.querySelector('.venue-list');
    if (!container) return;
    
    const venues = [
        'Taj Mahal Hotel', 'Clarks Avadh', 'Lebua Lucknow', 'Piccadily',
        'Renaissance', 'Novotel', 'Hazratganj', 'Gomti Nagar'
    ];
    
    let html = '';
    venues.forEach(venue => {
        html += `<span class="location-tag"><i class="fas fa-map-marker-alt mr-2"></i>${venue}</span>`;
    });
    
    container.innerHTML = html;
}

// ============================================
// LIGHTBOX
// ============================================

function openLightbox(imageUrl) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        // Create lightbox if it doesn't exist
        createLightbox();
    }
    
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = imageUrl;
    document.getElementById('lightbox').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'fixed inset-0 bg-black/90 hidden z-50 flex items-center justify-center';
    lightbox.innerHTML = `
        <button onclick="closeLightbox()" class="absolute top-4 right-4 text-white text-4xl">&times;</button>
        <img id="lightboxImg" src="" alt="" class="max-w-full max-h-screen p-4">
    `;
    document.body.appendChild(lightbox);
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ============================================
// SWIPER INITIALIZATION
// ============================================

function initializeSwiper() {
    if (typeof Swiper !== 'undefined') {
        // Hero slider
        const heroSwiper = new Swiper('.heroSwiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
        
        // Testimonials slider
        const testimonialSwiper = new Swiper('.testimonialsSwiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            breakpoints: {
                640: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            },
        });
        
        // Gallery slider
        const gallerySwiper = new Swiper('.gallerySwiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            },
        });
    }
}

// ============================================
// COUNTER ANIMATIONS
// ============================================

function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 30);
}

// ============================================
// ANIMATIONS
// ============================================

function initializeAnimations() {
    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll('.fade-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => observer.observe(el));
    
    // Animate location tags
    animateLocationTags();
}

function animateLocationTags() {
    const tags = document.querySelectorAll('.location-tag');
    tags.forEach((tag, index) => {
        tag.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        tag.style.opacity = '0';
    });
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchableItems = document.querySelectorAll('.searchable-item');
    
    searchableItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ============================================
// FORM VALIDATION
// ============================================

function setupFormValidation() {
    // Phone number validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    });
    
    // Email validation on blur
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', (e) => {
            const email = e.target.value;
            if (email && !validateEmail(email)) {
                showInputError(input, 'Please enter a valid email');
            } else {
                removeInputError(input);
            }
        });
    });
}

function showInputError(input, message) {
    input.classList.add('border-red-500');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.textContent = message;
    } else {
        const div = document.createElement('div');
        div.className = 'error-message text-red-500 text-sm mt-1';
        div.textContent = message;
        input.parentNode.insertBefore(div, input.nextSibling);
    }
}

function removeInputError(input) {
    input.classList.remove('border-red-500');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.remove();
    }
}

// ============================================
// DATE UTILITIES
// ============================================

function setMinDate(input) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    input.min = minDate;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ============================================
// USER SESSION
// ============================================

async function checkUserSession() {
    if (!supabaseClient) return;
    
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            updateUIForLoggedInUser();
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

function updateUIForLoggedInUser() {
    const loginLinks = document.querySelectorAll('.login-link');
    const userMenus = document.querySelectorAll('.user-menu');
    
    loginLinks.forEach(link => link.classList.add('hidden'));
    userMenus.forEach(menu => menu.classList.remove('hidden'));
}

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

async function sendEmailNotification(type, data) {
    // This would typically call a Supabase Edge Function
    console.log(`Sending ${type} notification:`, data);
    
    // For now, just log to console
    return true;
}

// ============================================
// TRACKING & ANALYTICS
// ============================================

function trackConversion(action) {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'YOUR_GA_ID',
            'event_category': 'engagement',
            'event_label': action
        });
    }
    
    // Facebook Pixel tracking
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: action
        });
    }
    
    console.log('Conversion tracked:', action);
}

function trackWhatsAppClick() {
    trackConversion('whatsapp_click');
}

// ============================================
// SUBDOMAIN PRELOADING
// ============================================

function preloadSubdomain(e) {
    const href = e.target.closest('a')?.href;
    if (href && href.includes('lucknow24events.com')) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    }
}

// ============================================
// URL PARAMETERS
// ============================================

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const eventType = urlParams.get('event');
    
    if (action === 'book' && eventType) {
        const eventSelect = document.getElementById('eventType');
        if (eventSelect) {
            eventSelect.value = eventType;
            document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    if (urlParams.get('enquiry') === 'true') {
        document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// LAZY LOADING
// ============================================

function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.showNotification = showNotification;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.applyForJob = applyForJob;
window.showBookingForm = showBookingForm;
window.showQuickEnquiry = showQuickEnquiry;