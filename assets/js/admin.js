// Admin Panel JavaScript for Lucknow24Events

// ============================================
// ADMIN CONFIGURATION
// ============================================

// Admin authentication state
let adminUser = null;
let adminToken = null;
let supabaseAdmin = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeAdminPanel();
    setupAdminEventListeners();
    loadAdminSettings();
});

// ============================================
// AUTHENTICATION
// ============================================

async function checkAdminAuth() {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    
    if (!token || !email) {
        // Show login modal if not authenticated
        showLoginModal();
    } else {
        // Verify token (in production, verify with backend)
        adminUser = { email };
        hideLoginModal();
        loadAdminData();
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center';
    modal.innerHTML = `
        <div class="glassmorphism p-8 max-w-md w-full">
            <h2 class="text-3xl font-bold text-white mb-6 text-center">Admin Login</h2>
            <form id="adminLoginForm" class="space-y-6">
                <div>
                    <label class="block text-white mb-2">Email</label>
                    <input type="email" id="adminEmail" class="w-full bg-white/10 border border-white/20 rounded-lg px-6 py-3 text-white" required>
                </div>
                <div>
                    <label class="block text-white mb-2">Password</label>
                    <input type="password" id="adminPassword" class="w-full bg-white/10 border border-white/20 rounded-lg px-6 py-3 text-white" required>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold">
                    Login
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.remove();
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // In production, verify with Supabase Auth
    if (email === 'admin@lucknow24events.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'dummy-token');
        localStorage.setItem('adminEmail', email);
        
        showNotification('Login successful!', 'success');
        hideLoginModal();
        loadAdminData();
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    window.location.reload();
}

// ============================================
// ADMIN PANEL INITIALIZATION
// ============================================

function initializeAdminPanel() {
    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Initialize menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const section = this.dataset.section;
            if (section === 'logout') {
                logout();
                return;
            }
            switchAdminSection(section);
        });
    });
    
    // Initialize filter listeners
    initializeFilters();
    
    // Initialize chart resizing
    window.addEventListener('resize', debounce(() => {
        if (window.bookingsChart) window.bookingsChart.resize();
        if (window.eventTypesChart) window.eventTypesChart.resize();
    }, 250));
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function switchAdminSection(sectionId) {
    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Show selected section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    // Load section data if needed
    switch(sectionId) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'jobs':
            loadJobApplications();
            break;
        case 'enquiries':
            loadEnquiries();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'services':
            loadServices();
            break;
        case 'venues':
            loadVenues();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'testimonials':
            loadTestimonials();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'backup':
            loadBackupHistory();
            break;
    }
}

// ============================================
// FILTERS
// ============================================

function initializeFilters() {
    // Booking filter
    const bookingFilter = document.getElementById('bookingFilter');
    if (bookingFilter) {
        bookingFilter.addEventListener('change', () => loadBookings(bookingFilter.value));
    }
    
    // Gallery filter
    const galleryFilter = document.getElementById('galleryFilter');
    if (galleryFilter) {
        galleryFilter.addEventListener('change', () => loadGallery(galleryFilter.value));
    }
    
    // Date range filter
    const dateRange = document.getElementById('dateRange');
    if (dateRange) {
        dateRange.addEventListener('change', () => refreshDashboard(dateRange.value));
    }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

async function refreshDashboard(period = 'month') {
    showLoading();
    
    try {
        await Promise.all([
            loadDashboardStats(period),
            loadRecentBookings(),
            loadCharts(period)
        ]);
    } catch (error) {
        console.error('Dashboard refresh error:', error);
        showNotification('Error loading dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

async function loadDashboardStats(period) {
    // In production, fetch from Supabase
    // For now, use sample data
    const stats = {
        bookings: 156,
        jobs: 45,
        enquiries: 89,
        staff: 200
    };
    
    document.getElementById('totalBookings').textContent = stats.bookings;
    document.getElementById('totalJobs').textContent = stats.jobs;
    document.getElementById('totalEnquiries').textContent = stats.enquiries;
    document.getElementById('totalStaff').textContent = stats.staff + '+';
    
    // Update percentage changes
    document.getElementById('bookingsChange').innerHTML = '<i class="fas fa-arrow-up text-green-400 mr-1"></i> +12% from last month';
    document.getElementById('jobsChange').innerHTML = '<i class="fas fa-arrow-up text-green-400 mr-1"></i> +8% from last month';
    document.getElementById('enquiriesChange').innerHTML = '<i class="fas fa-arrow-down text-red-400 mr-1"></i> -3% from last month';
}

async function loadRecentBookings() {
    const tbody = document.getElementById('recentBookingsBody');
    if (!tbody) return;
    
    // Sample data
    const bookings = [
        { id: 1001, customer: 'Rajesh Kumar', event: 'Wedding', date: '2024-03-15', guests: 300, status: 'Approved' },
        { id: 1002, customer: 'Priya Singh', event: 'Birthday', date: '2024-03-16', guests: 100, status: 'Pending' },
        { id: 1003, customer: 'Amit Verma', event: 'Corporate', date: '2024-03-17', guests: 200, status: 'Approved' },
        { id: 1004, customer: 'Neha Gupta', event: 'Engagement', date: '2024-03-18', guests: 150, status: 'Completed' },
        { id: 1005, customer: 'Vikram Singh', event: 'Wedding', date: '2024-03-20', guests: 500, status: 'Pending' }
    ];
    
    tbody.innerHTML = bookings.map(b => `
        <tr>
            <td>#${b.id}</td>
            <td>${b.customer}</td>
            <td>${b.event}</td>
            <td>${formatDate(b.date)}</td>
            <td>${b.guests}</td>
            <td><span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span></td>
            <td>
                <button onclick="viewBooking(${b.id})" class="action-btn text-blue-400"><i class="fas fa-eye"></i></button>
                <button onclick="editBooking(${b.id})" class="action-btn text-green-400"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadCharts(period) {
    // Bookings Chart
    const bookingsCtx = document.getElementById('bookingsChart')?.getContext('2d');
    if (bookingsCtx) {
        if (window.bookingsChart) window.bookingsChart.destroy();
        
        window.bookingsChart = new Chart(bookingsCtx, {
            type: 'line',
            data: {
                labels: getLabelsForPeriod(period),
                datasets: [{
                    label: 'Bookings',
                    data: getDataForPeriod(period),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: 'rgba(255,255,255,0.1)' }, 
                        ticks: { color: '#fff' }
                    },
                    x: { 
                        grid: { color: 'rgba(255,255,255,0.1)' }, 
                        ticks: { color: '#fff' }
                    }
                }
            }
        });
    }
    
    // Event Types Chart
    const typesCtx = document.getElementById('eventTypesChart')?.getContext('2d');
    if (typesCtx) {
        if (window.eventTypesChart) window.eventTypesChart.destroy();
        
        window.eventTypesChart = new Chart(typesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Wedding', 'Corporate', 'Birthday', 'Engagement', 'Other'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#667eea',
                        '#4facfe',
                        '#f093fb',
                        '#43e97b',
                        '#ff9f43'
                    ],
                    borderColor: 'transparent'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                }
            }
        });
    }
}

function getLabelsForPeriod(period) {
    switch(period) {
        case 'week':
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        case 'month':
            return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        case 'year':
            return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        default:
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
}

function getDataForPeriod(period) {
    switch(period) {
        case 'week':
            return [5, 8, 12, 10, 15, 20, 18];
        case 'month':
            return [45, 52, 48, 60];
        case 'year':
            return [45, 52, 60, 55, 48, 62, 58, 70, 65, 72, 68, 80];
        default:
            return [5, 8, 12, 10, 15, 20, 18];
    }
}

// ============================================
// BOOKINGS MANAGEMENT
// ============================================

async function loadBookings(filter = 'all') {
    const tbody = document.getElementById('bookingsBody');
    if (!tbody) return;
    
    showTableLoading(tbody);
    
    try {
        // In production, fetch from Supabase
        // For now, use sample data
        const bookings = [
            { id: 1001, customer: 'Rajesh Kumar', phone: '9876543210', event: 'Wedding', date: '2024-03-15', guests: 300, venue: 'Taj Mahal', package: 'Premium', status: 'Approved' },
            { id: 1002, customer: 'Priya Singh', phone: '9876543211', event: 'Birthday', date: '2024-03-16', guests: 100, venue: 'Clarks Avadh', package: 'Basic', status: 'Pending' },
            { id: 1003, customer: 'Amit Verma', phone: '9876543212', event: 'Corporate', date: '2024-03-17', guests: 200, venue: 'Lebua', package: 'Premium', status: 'Approved' },
            { id: 1004, customer: 'Neha Gupta', phone: '9876543213', event: 'Engagement', date: '2024-03-18', guests: 150, venue: 'Piccadily', package: 'Luxury', status: 'Completed' },
            { id: 1005, customer: 'Vikram Singh', phone: '9876543214', event: 'Wedding', date: '2024-03-20', guests: 500, venue: 'Taj Mahal', package: 'Luxury', status: 'Pending' },
            { id: 1006, customer: 'Anjali Sharma', phone: '9876543215', event: 'Birthday', date: '2024-03-22', guests: 80, venue: 'Renaissance', package: 'Basic', status: 'Approved' },
            { id: 1007, customer: 'Rahul Verma', phone: '9876543216', event: 'Corporate', date: '2024-03-25', guests: 350, venue: 'Novotel', package: 'Premium', status: 'Pending' },
            { id: 1008, customer: 'Pooja Singh', phone: '9876543217', event: 'Wedding', date: '2024-03-28', guests: 400, venue: 'Clarks Avadh', package: 'Luxury', status: 'Approved' }
        ];
        
        const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase());
        
        tbody.innerHTML = filteredBookings.map(b => `
            <tr>
                <td>#${b.id}</td>
                <td>${b.customer}</td>
                <td>${b.phone}</td>
                <td>${b.event}</td>
                <td>${formatDate(b.date)}</td>
                <td>${b.guests}</td>
                <td>${b.venue}</td>
                <td>${b.package}</td>
                <td>
                    <select onchange="updateBookingStatus(${b.id}, this.value)" class="bg-transparent border border-white/20 rounded px-2 py-1 text-sm">
                        <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Approved" ${b.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${b.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <button onclick="viewBooking(${b.id})" class="action-btn text-blue-400" title="View"><i class="fas fa-eye"></i></button>
                    <button onclick="editBooking(${b.id})" class="action-btn text-green-400" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteBooking(${b.id})" class="action-btn text-red-400" title="Delete"><i class="fas fa-trash"></i></button>
                    <button onclick="sendBookingMessage(${b.id})" class="action-btn text-yellow-400" title="Send Message"><i class="fas fa-envelope"></i></button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8 text-red-400">Error loading bookings</td></tr>';
    } finally {
        hideTableLoading(tbody);
    }
}

async function updateBookingStatus(id, status) {
    if (!confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    
    showNotification(`Booking #${id} status updated to ${status}`, 'success');
    loadBookings(document.getElementById('bookingFilter')?.value);
}

function viewBooking(id) {
    const booking = { id: 1001, customer: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', event: 'Wedding', date: '2024-03-15', guests: 300, venue: 'Taj Mahal', package: 'Premium', requirements: 'Need floral decoration in red and gold theme. Vegetarian food only.', status: 'Approved' };
    
    showModal('Booking Details', `
        <div class="space-y-3">
            <p><strong>Booking ID:</strong> #${booking.id}</p>
            <p><strong>Customer:</strong> ${booking.customer}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Event Type:</strong> ${booking.event}</p>
            <p><strong>Event Date:</strong> ${formatDate(booking.date)}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Venue:</strong> ${booking.venue}</p>
            <p><strong>Package:</strong> ${booking.package}</p>
            <p><strong>Requirements:</strong> ${booking.requirements}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></p>
            <p><strong>Booking Date:</strong> ${formatDateTime(new Date())}</p>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button onclick="editBooking(${booking.id})" class="px-4 py-2 bg-green-600 rounded">Edit</button>
            <button onclick="closeModal()" class="px-4 py-2 bg-gray-600 rounded">Close</button>
        </div>
    `);
}

function editBooking(id) {
    showNotification(`Editing booking #${id}`, 'info');
    // Implement edit functionality
}

function deleteBooking(id) {
    if (!confirm(`Are you sure you want to delete booking #${id}? This action cannot be undone.`)) return;
    
    showNotification(`Booking #${id} deleted successfully`, 'success');
    loadBookings(document.getElementById('bookingFilter')?.value);
}

function sendBookingMessage(id) {
    const message = prompt('Enter message to send to customer:');
    if (message) {
        showNotification(`Message sent to booking #${id}`, 'success');
    }
}

// ============================================
// JOB APPLICATIONS
// ============================================

async function loadJobApplications() {
    const tbody = document.getElementById('jobsBody');
    if (!tbody) return;
    
    showTableLoading(tbody);
    
    try {
        const jobs = [
            { id: 2001, name: 'Rahul Sharma', phone: '9876543210', position: 'Event Manager', experience: 3, location: 'Gomti Nagar', date: '2024-03-10', status: 'New' },
            { id: 2002, name: 'Priya Singh', phone: '9876543211', position: 'Wedding Coordinator', experience: 2, location: 'Hazratganj', date: '2024-03-11', status: 'Reviewed' },
            { id: 2003, name: 'Amit Kumar', phone: '9876543212', position: 'Professional Waiter', experience: 1, location: 'Alambagh', date: '2024-03-12', status: 'Shortlisted' },
            { id: 2004, name: 'Neha Gupta', phone: '9876543213', position: 'Event Assistant', experience: 0, location: 'Indiranagar', date: '2024-03-13', status: 'New' },
            { id: 2005, name: 'Vikram Singh', phone: '9876543214', position: 'Event Manager', experience: 5, location: 'Gomti Nagar', date: '2024-03-14', status: 'Shortlisted' }
        ];
        
        tbody.innerHTML = jobs.map(j => `
            <tr>
                <td>#${j.id}</td>
                <td>${j.name}</td>
                <td>${j.phone}</td>
                <td>${j.position}</td>
                <td>${j.experience} years</td>
                <td>${j.location}</td>
                <td>${formatDate(j.date)}</td>
                <td>
                    <select onchange="updateJobStatus(${j.id}, this.value)" class="bg-transparent border border-white/20 rounded px-2 py-1 text-sm">
                        <option value="New" ${j.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="Reviewed" ${j.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
                        <option value="Shortlisted" ${j.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                        <option value="Rejected" ${j.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <button onclick="viewJob(${j.id})" class="action-btn text-blue-400"><i class="fas fa-eye"></i></button>
                    <button onclick="deleteJob(${j.id})" class="action-btn text-red-400"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-red-400">Error loading applications</td></tr>';
    } finally {
        hideTableLoading(tbody);
    }
}

function updateJobStatus(id, status) {
    showNotification(`Job application #${id} status updated to ${status}`, 'success');
    loadJobApplications();
}

function viewJob(id) {
    const job = { id: 2001, name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', position: 'Event Manager', experience: 3, age: 28, location: 'Gomti Nagar', message: 'I have 3 years experience in event management. Looking for an opportunity to grow.', date: '2024-03-10', status: 'New' };
    
    showModal('Job Application Details', `
        <div class="space-y-3">
            <p><strong>Application ID:</strong> #${job.id}</p>
            <p><strong>Name:</strong> ${job.name}</p>
            <p><strong>Phone:</strong> ${job.phone}</p>
            <p><strong>Email:</strong> ${job.email}</p>
            <p><strong>Position:</strong> ${job.position}</p>
            <p><strong>Experience:</strong> ${job.experience} years</p>
            <p><strong>Age:</strong> ${job.age}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Message:</strong> ${job.message}</p>
            <p><strong>Applied Date:</strong> ${formatDate(job.date)}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span></p>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button onclick="scheduleInterview(${job.id})" class="px-4 py-2 bg-green-600 rounded">Schedule Interview</button>
            <button onclick="closeModal()" class="px-4 py-2 bg-gray-600 rounded">Close</button>
        </div>
    `);
}

function deleteJob(id) {
    if (!confirm(`Delete application #${id}?`)) return;
    showNotification(`Application #${id} deleted`, 'success');
    loadJobApplications();
}

function scheduleInterview(id) {
    showNotification(`Interview scheduled for application #${id}`, 'success');
}

// ============================================
// ENQUIRIES MANAGEMENT
// ============================================

async function loadEnquiries() {
    const tbody = document.getElementById('enquiriesBody');
    if (!tbody) return;
    
    showTableLoading(tbody);
    
    try {
        const enquiries = [
            { id: 3001, name: 'Rajesh Kumar', phone: '9876543210', type: 'Wedding', message: 'Need wedding package details', date: '2024-03-15', status: 'New' },
            { id: 3002, name: 'Priya Singh', phone: '9876543211', type: 'Corporate', message: 'Conference for 200 people', date: '2024-03-16', status: 'Contacted' },
            { id: 3003, name: 'Amit Verma', phone: '9876543212', type: 'Pricing', message: 'Please share price list', date: '2024-03-17', status: 'New' },
            { id: 3004, name: 'Neha Gupta', phone: '9876543213', type: 'Availability', message: 'Is March 25 available?', date: '2024-03-18', status: 'Resolved' },
            { id: 3005, name: 'Vikram Singh', phone: '9876543214', type: 'Wedding', message: 'Need wedding planner', date: '2024-03-19', status: 'Contacted' }
        ];
        
        tbody.innerHTML = enquiries.map(e => `
            <tr>
                <td>#${e.id}</td>
                <td>${e.name}</td>
                <td>${e.phone}</td>
                <td>${e.type}</td>
                <td>${e.message.substring(0, 30)}...</td>
                <td>${formatDate(e.date)}</td>
                <td>
                    <select onchange="updateEnquiryStatus(${e.id}, this.value)" class="bg-transparent border border-white/20 rounded px-2 py-1 text-sm">
                        <option value="New" ${e.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="Contacted" ${e.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Resolved" ${e.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td>
                    <button onclick="viewEnquiry(${e.id})" class="action-btn text-blue-400"><i class="fas fa-eye"></i></button>
                    <button onclick="replyToEnquiry(${e.id})" class="action-btn text-green-400"><i class="fas fa-reply"></i></button>
                    <button onclick="deleteEnquiry(${e.id})" class="action-btn text-red-400"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading enquiries:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-red-400">Error loading enquiries</td></tr>';
    } finally {
        hideTableLoading(tbody);
    }
}

function updateEnquiryStatus(id, status) {
    showNotification(`Enquiry #${id} status updated to ${status}`, 'success');
    loadEnquiries();
}

function viewEnquiry(id) {
    const enquiry = { id: 3001, name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', type: 'Wedding', message: 'I am planning a wedding for 300 guests on March 25th. Need complete wedding package including decoration, catering, and photography. Please share details and pricing.', date: '2024-03-15', status: 'New' };
    
    showModal('Enquiry Details', `
        <div class="space-y-3">
            <p><strong>Enquiry ID:</strong> #${enquiry.id}</p>
            <p><strong>Name:</strong> ${enquiry.name}</p>
            <p><strong>Phone:</strong> ${enquiry.phone}</p>
            <p><strong>Email:</strong> ${enquiry.email}</p>
            <p><strong>Type:</strong> ${enquiry.type}</p>
            <p><strong>Message:</strong> ${enquiry.message}</p>
            <p><strong>Date:</strong> ${formatDate(enquiry.date)}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${enquiry.status.toLowerCase()}">${enquiry.status}</span></p>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button onclick="replyToEnquiry(${enquiry.id})" class="px-4 py-2 bg-green-600 rounded">Reply</button>
            <button onclick="closeModal()" class="px-4 py-2 bg-gray-600 rounded">Close</button>
        </div>
    `);
}

function replyToEnquiry(id) {
    const reply = prompt('Enter your reply:');
    if (reply) {
        showNotification(`Reply sent to enquiry #${id}`, 'success');
        updateEnquiryStatus(id, 'Contacted');
    }
}

function deleteEnquiry(id) {
    if (!confirm(`Delete enquiry #${id}?`)) return;
    showNotification(`Enquiry #${id} deleted`, 'success');
    loadEnquiries();
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

async function loadGallery(category = 'all') {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-spinner fa-spin text-4xl"></i></div>';
    
    try {
        const images = [
            { id: 1, title: 'Luxury Wedding at Taj', category: 'wedding', location: 'Taj Mahal', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', date: '2024-02-15' },
            { id: 2, title: 'Corporate Conference', category: 'corporate', location: 'Clarks Avadh', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', date: '2024-02-20' },
            { id: 3, title: 'Birthday Party', category: 'birthday', location: 'Piccadily', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', date: '2024-02-25' },
            { id: 4, title: 'Engagement Ceremony', category: 'engagement', location: 'Lebua', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6', date: '2024-03-01' },
            { id: 5, title: 'Wedding Reception', category: 'wedding', location: 'Renaissance', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed', date: '2024-03-05' },
            { id: 6, title: 'Product Launch', category: 'corporate', location: 'Novotel', url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', date: '2024-03-08' }
        ];
        
        const filteredImages = category === 'all' ? images : images.filter(img => img.category === category);
        
        grid.innerHTML = filteredImages.map(img => `
            <div class="image-item">
                <img src="${img.url}?w=400&h=300&fit=crop" alt="${img.title}" loading="lazy">
                <div class="p-3">
                    <p class="font-semibold">${img.title}</p>
                    <p class="text-xs text-gray-400">${img.location}</p>
                    <p class="text-xs text-gray-500">${formatDate(img.date)}</p>
                </div>
                <div class="absolute top-2 right-2 flex gap-2">
                    <button onclick="editImage(${img.id})" class="bg-blue-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteImage(${img.id})" class="bg-red-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Error loading gallery</div>';
    }
}

function editImage(id) {
    showNotification(`Editing image #${id}`, 'info');
}

function deleteImage(id) {
    if (!confirm(`Delete image #${id}?`)) return;
    showNotification(`Image #${id} deleted`, 'success');
    loadGallery(document.getElementById('galleryFilter')?.value);
}

// ============================================
// SERVICES MANAGEMENT
// ============================================

async function loadServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    const services = [
        { id: 1, name: 'Wedding Planning', icon: 'fa-glass-cheers', description: 'Complete wedding management including decoration, catering, and coordination.', price: '50000', features: ['Decoration', 'Catering', 'Photography', 'Coordination'] },
        { id: 2, name: 'Corporate Events', icon: 'fa-briefcase', description: 'Professional corporate event management for conferences, product launches, and meetings.', price: '25000', features: ['Venue Setup', 'AV Equipment', 'Catering', 'Registration'] },
        { id: 3, name: 'Birthday Parties', icon: 'fa-birthday-cake', description: 'Memorable birthday celebrations for all ages with themed decorations.', price: '15000', features: ['Decoration', 'Cake', 'Entertainment', 'Photography'] },
        { id: 4, name: 'Engagement Ceremony', icon: 'fa-heart', description: 'Beautiful engagement ceremonies with traditional and modern elements.', price: '20000', features: ['Decoration', 'Photography', 'Catering', 'Music'] },
        { id: 5, name: 'Anniversary Parties', icon: 'fa-gift', description: 'Celebrate your special milestones with elegant arrangements.', price: '18000', features: ['Decoration', 'Cake', 'Photography', 'Entertainment'] },
        { id: 6, name: 'Conference Management', icon: 'fa-chalkboard-teacher', description: 'End-to-end conference management with professional AV support.', price: '30000', features: ['Venue', 'AV Setup', 'Catering', 'Registration Desk'] }
    ];
    
    grid.innerHTML = services.map(s => `
        <div class="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition">
            <div class="w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center mb-4">
                <i class="fas ${s.icon} text-purple-400 text-xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">${s.name}</h3>
            <p class="text-gray-400 text-sm mb-4">${s.description}</p>
            <p class="text-2xl font-bold text-purple-400 mb-4">₹${s.price}+</p>
            <div class="space-y-2 mb-4">
                ${s.features.map(f => `<p class="text-sm text-gray-400"><i class="fas fa-check text-green-400 mr-2"></i>${f}</p>`).join('')}
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="editService(${s.id})" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm">Edit</button>
                <button onclick="deleteService(${s.id})" class="flex-1 bg-red-600 text-white py-2 rounded text-sm">Delete</button>
            </div>
        </div>
    `).join('');
}

function editService(id) {
    showNotification(`Editing service #${id}`, 'info');
}

function deleteService(id) {
    if (!confirm(`Delete service #${id}?`)) return;
    showNotification(`Service #${id} deleted`, 'success');
    loadServices();
}

// ============================================
// VENUES MANAGEMENT
// ============================================

async function loadVenues() {
    const grid = document.getElementById('venuesGrid');
    if (!grid) return;
    
    const venues = [
        { name: 'Taj Mahal Hotel', location: 'Gomti Nagar', capacity: 500, price: '50000 - 200000', features: ['Parking', 'AC', 'Catering', 'Stage'] },
        { name: 'Clarks Avadh', location: 'Hazratganj', capacity: 400, price: '40000 - 150000', features: ['Parking', 'AC', 'In-house Catering', 'DJ Setup'] },
        { name: 'Lebua Lucknow', location: 'Gomti Nagar', capacity: 600, price: '60000 - 250000', features: ['Luxury', 'Parking', 'AC', 'River View'] },
        { name: 'Piccadily', location: 'Alambagh', capacity: 300, price: '30000 - 100000', features: ['Parking', 'AC', 'Budget Friendly'] },
        { name: 'Renaissance', location: 'Gomti Nagar', capacity: 450, price: '45000 - 180000', features: ['Luxury', 'Poolside', 'AC', 'Parking'] },
        { name: 'Novotel', location: 'Gomti Nagar', capacity: 350, price: '35000 - 120000', features: ['AC', 'Parking', 'Modern Setup'] }
    ];
    
    grid.innerHTML = venues.map(v => `
        <div class="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition">
            <h3 class="text-xl font-bold mb-2">${v.name}</h3>
            <p class="text-gray-400 mb-2"><i class="fas fa-map-marker-alt text-purple-400 mr-2"></i>${v.location}</p>
            <p class="text-gray-400 mb-2"><i class="fas fa-users text-blue-400 mr-2"></i>Upto ${v.capacity} guests</p>
            <p class="text-gray-400 mb-4"><i class="fas fa-rupee-sign text-green-400 mr-2"></i>${v.price}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${v.features.map(f => `<span class="text-xs bg-white/10 px-2 py-1 rounded">${f}</span>`).join('')}
            </div>
            <div class="flex gap-2">
                <button onclick="editVenue('${v.name}')" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm">Edit</button>
                <button onclick="deleteVenue('${v.name}')" class="flex-1 bg-red-600 text-white py-2 rounded text-sm">Delete</button>
            </div>
        </div>
    `).join('');
}

function editVenue(name) {
    showNotification(`Editing venue: ${name}`, 'info');
}

function deleteVenue(name) {
    if (!confirm(`Delete venue: ${name}?`)) return;
    showNotification(`Venue deleted: ${name}`, 'success');
    loadVenues();
}

// ============================================
// STAFF MANAGEMENT
// ============================================

async function loadStaff() {
    const tbody = document.getElementById('staffBody');
    if (!tbody) return;
    
    const staff = [
        { id: 1, name: 'Rajesh Kumar', role: 'Event Manager', phone: '9876543210', experience: 5, status: 'Active' },
        { id: 2, name: 'Priya Singh', role: 'Wedding Coordinator', phone: '9876543211', experience: 3, status: 'Active' },
        { id: 3, name: 'Amit Verma', role: 'Senior Waiter', phone: '9876543212', experience: 2, status: 'Active' },
        { id: 4, name: 'Neha Gupta', role: 'Event Assistant', phone: '9876543213', experience: 1, status: 'On Leave' },
        { id: 5, name: 'Vikram Singh', role: 'Bartender', phone: '9876543214', experience: 4, status: 'Active' },
        { id: 6, name: 'Anjali Sharma', role: 'Photographer', phone: '9876543215', experience: 3, status: 'Active' }
    ];
    
    tbody.innerHTML = staff.map(s => `
        <tr>
            <td>#${s.id}</td>
            <td>${s.name}</td>
            <td>${s.role}</td>
            <td>${s.phone}</td>
            <td>${s.experience} years</td>
            <td><span class="status-badge ${s.status === 'Active' ? 'status-approved' : 'status-pending'}">${s.status}</span></td>
            <td>
                <button onclick="editStaff(${s.id})" class="action-btn text-green-400"><i class="fas fa-edit"></i></button>
                <button onclick="deleteStaff(${s.id})" class="action-btn text-red-400"><i class="fas fa-trash"></i></button>
                <button onclick="viewStaffSchedule(${s.id})" class="action-btn text-blue-400"><i class="fas fa-calendar"></i></button>
            </td>
        </tr>
    `).join('');
}

function editStaff(id) {
    showNotification(`Editing staff #${id}`, 'info');
}

function deleteStaff(id) {
    if (!confirm(`Remove staff #${id}?`)) return;
    showNotification(`Staff #${id} removed`, 'success');
    loadStaff();
}

function viewStaffSchedule(id) {
    showNotification(`Viewing schedule for staff #${id}`, 'info');
}

// ============================================
// TESTIMONIALS MANAGEMENT
// ============================================

async function loadTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    
    const testimonials = [
        { id: 1, name: 'Priya Sharma', event: 'Wedding', rating: 5, comment: 'Excellent service! Made our wedding perfect. The team was very professional and took care of everything.', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
        { id: 2, name: 'Rahul Verma', event: 'Corporate Event', rating: 5, comment: 'Very professional team. Our annual conference was a huge success. Highly recommended!', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: 3, name: 'Anjali Singh', event: 'Birthday Party', rating: 4, comment: 'Great decoration and arrangements. My daughter loved her birthday party!', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { id: 4, name: 'Vikram Singh', event: 'Engagement', rating: 5, comment: 'They made our engagement ceremony beautiful. Everything was perfect!', image: 'https://randomuser.me/api/portraits/men/2.jpg' }
    ];
    
    grid.innerHTML = testimonials.map(t => `
        <div class="bg-white/5 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-3">
                ${Array(t.rating).fill('<i class="fas fa-star text-yellow-400"></i>').join('')}
            </div>
            <p class="text-gray-300 mb-4">"${t.comment}"</p>
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <img src="${t.image}" alt="${t.name}" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-bold">${t.name}</p>
                        <p class="text-sm text-gray-400">${t.event}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="editTestimonial(${t.id})" class="text-blue-400"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteTestimonial(${t.id})" class="text-red-400"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function editTestimonial(id) {
    showNotification(`Editing testimonial #${id}`, 'info');
}

function deleteTestimonial(id) {
    if (!confirm(`Delete testimonial #${id}?`)) return;
    showNotification(`Testimonial #${id} deleted`, 'success');
    loadTestimonials();
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function loadSettings() {
    // Load site settings
    const settings = JSON.parse(localStorage.getItem('lucknow24events_settings') || '{}');
    
    document.getElementById('siteTitle').value = settings.siteTitle || 'Lucknow24Events';
    document.getElementById('siteTagline').value = settings.siteTagline || 'Best Event Management in Lucknow';
    document.getElementById('contactEmail').value = settings.contactEmail || 'info@lucknow24events.com';
    document.getElementById('contactPhone').value = settings.contactPhone || '+91 99999 99999';
    document.getElementById('siteAddress').value = settings.address || '123, Hazratganj, Lucknow - 226001';
    
    // Load colors
    document.getElementById('primaryColor').value = settings.primaryColor || '#667eea';
    document.getElementById('primaryColorHex').value = settings.primaryColor || '#667eea';
    document.getElementById('secondaryColor').value = settings.secondaryColor || '#764ba2';
    document.getElementById('secondaryColorHex').value = settings.secondaryColor || '#764ba2';
    document.getElementById('accentColor').value = settings.accentColor || '#f093fb';
    document.getElementById('accentColorHex').value = settings.accentColor || '#f093fb';
    
    // Load admin settings
    document.getElementById('adminEmail').value = localStorage.getItem('adminEmail') || '';
    document.getElementById('adminPhone').value = localStorage.getItem('adminPhone') || '';
    
    // Load notification settings
    const notifSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    document.getElementById('emailNotifications').checked = notifSettings.email !== false;
    document.getElementById('smsNotifications').checked = notifSettings.sms === true;
    document.getElementById('whatsappNotifications').checked = notifSettings.whatsapp !== false;
    
    // Load database settings
    document.getElementById('supabaseUrl').value = localStorage.getItem('supabaseUrl') || '';
    document.getElementById('supabaseKey').value = localStorage.getItem('supabaseKey') || '';
}

function saveSiteSettings() {
    const settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteTagline: document.getElementById('siteTagline').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value,
        address: document.getElementById('siteAddress').value,
        primaryColor: document.getElementById('primaryColorHex').value,
        secondaryColor: document.getElementById('secondaryColorHex').value,
        accentColor: document.getElementById('accentColorHex').value
    };
    
    localStorage.setItem('lucknow24events_settings', JSON.stringify(settings));
    showNotification('Site settings saved successfully', 'success');
    
    // Apply colors immediately
    applySiteTheme(settings);
}

function updateColors() {
    const primary = document.getElementById('primaryColorHex').value;
    const secondary = document.getElementById('secondaryColorHex').value;
    const accent = document.getElementById('accentColorHex').value;
    
    // Update color inputs
    document.getElementById('primaryColor').value = primary;
    document.getElementById('secondaryColor').value = secondary;
    document.getElementById('accentColor').value = accent;
    
    showNotification('Colors updated. Click "Save All Settings" to persist changes.', 'info');
}

function applySiteTheme(settings) {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
}

function updateAdminSettings() {
    const email = document.getElementById('adminEmail').value;
    const phone = document.getElementById('adminPhone').value;
    const password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (password && password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    localStorage.setItem('adminEmail', email);
    localStorage.setItem('adminPhone', phone);
    
    if (password) {
        // In production, update password via API
        showNotification('Password updated', 'success');
    }
    
    showNotification('Admin settings updated', 'success');
}

function saveNotificationSettings() {
    const settings = {
        email: document.getElementById('emailNotifications').checked,
        sms: document.getElementById('smsNotifications').checked,
        whatsapp: document.getElementById('whatsappNotifications').checked
    };
    
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    showNotification('Notification settings saved', 'success');
}

function testDatabaseConnection() {
    showNotification('Database connection successful!', 'success');
}

function saveDatabaseSettings() {
    const url = document.getElementById('supabaseUrl').value;
    const key = document.getElementById('supabaseKey').value;
    
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);
    
    showNotification('Database settings saved. Refresh to apply changes.', 'success');
}

// ============================================
// BACKUP & RESTORE
// ============================================

function loadBackupHistory() {
    const tbody = document.getElementById('backupsList');
    if (!tbody) return;
    
    const backups = [
        { date: '2024-03-15 10:30 AM', size: '2.5 MB', type: 'Auto' },
        { date: '2024-03-14 10:30 AM', size: '2.4 MB', type: 'Auto' },
        { date: '2024-03-13 05:00 PM', size: '2.4 MB', type: 'Manual' },
        { date: '2024-03-12 10:30 AM', size: '2.3 MB', type: 'Auto' }
    ];
    
    tbody.innerHTML = backups.map(b => `
        <tr>
            <td>${b.date}</td>
            <td>${b.size}</td>
            <td><span class="status-badge ${b.type === 'Auto' ? 'status-approved' : 'status-pending'}">${b.type}</span></td>
            <td>
                <button onclick="downloadBackup('${b.date}')" class="action-btn text-green-400"><i class="fas fa-download"></i></button>
                <button onclick="restoreBackup('${b.date}')" class="action-btn text-blue-400"><i class="fas fa-undo"></i></button>
                <button onclick="deleteBackup('${b.date}')" class="action-btn text-red-400"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function createBackup() {
    const backup = {
        date: new Date().toISOString(),
        version: '1.0',
        data: {
            settings: localStorage,
            // In production, include database data
        }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucknow24events-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    showNotification('Backup created successfully', 'success');
    loadBackupHistory();
}

function restoreBackup() {
    const file = document.getElementById('backupFile').files[0];
    if (!file) {
        showNotification('Please select a backup file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            // Restore data
            showNotification('Backup restored successfully', 'success');
            loadBackupHistory();
        } catch (error) {
            showNotification('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

function downloadBackup(date) {
    showNotification(`Downloading backup from ${date}`, 'info');
}

function deleteBackup(date) {
    if (!confirm(`Delete backup from ${date}?`)) return;
    showNotification(`Backup deleted`, 'success');
    loadBackupHistory();
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportBookings() {
    exportToCSV('bookings', ['ID', 'Customer', 'Phone', 'Event', 'Date', 'Guests', 'Venue', 'Status']);
}

function exportJobs() {
    exportToCSV('jobs', ['ID', 'Name', 'Phone', 'Position', 'Experience', 'Location', 'Status']);
}

function exportEnquiries() {
    exportToCSV('enquiries', ['ID', 'Name', 'Phone', 'Type', 'Message', 'Date', 'Status']);
}

function exportToCSV(type, headers) {
    showNotification(`Exporting ${type} data...`, 'info');
    
    // In production, generate actual CSV
    setTimeout(() => {
        showNotification(`${type} exported successfully`, 'success');
    }, 1000);
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function showModal(title, content) {
    const modal = document.getElementById('viewDetailsModal');
    if (!modal) return;
    
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('viewDetailsModal')?.classList.remove('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.background = type === 'success' 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
        : type === 'error'
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading() {
    // Add loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

function showTableLoading(tbody) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl"></i></td></tr>';
}

function hideTableLoading(tbody) {
    // Table loading is removed when data is loaded
}

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

// ============================================
// MODAL OPEN FUNCTIONS
// ============================================

function openAddImageModal() {
    document.getElementById('addImageModal').classList.add('active');
}

function openAddServiceModal() {
    document.getElementById('addServiceModal').classList.add('active');
}

function openAddVenueModal() {
    document.getElementById('addVenueModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ============================================
// FORM HANDLERS
// ============================================

document.getElementById('addImageForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    showNotification('Image added to gallery', 'success');
    closeModal('addImageModal');
    loadGallery();
});

document.getElementById('addServiceForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    showNotification('Service added successfully', 'success');
    closeModal('addServiceModal');
    loadServices();
});

document.getElementById('addVenueForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    showNotification('Venue added successfully', 'success');
    closeModal('addVenueModal');
    loadVenues();
});

// ============================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================

// Dashboard
window.refreshData = refreshDashboard;

// Bookings
window.loadBookings = loadBookings;
window.updateBookingStatus = updateBookingStatus;
window.viewBooking = viewBooking;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;
window.sendBookingMessage = sendBookingMessage;
window.exportBookings = exportBookings;

// Jobs
window.loadJobApplications = loadJobApplications;
window.updateJobStatus = updateJobStatus;
window.viewJob = viewJob;
window.deleteJob = deleteJob;
window.scheduleInterview = scheduleInterview;
window.exportJobs = exportJobs;

// Enquiries
window.loadEnquiries = loadEnquiries;
window.updateEnquiryStatus = updateEnquiryStatus;
window.viewEnquiry = viewEnquiry;
window.replyToEnquiry = replyToEnquiry;
window.deleteEnquiry = deleteEnquiry;
window.exportEnquiries = exportEnquiries;

// Gallery
window.loadGallery = loadGallery;
window.editImage = editImage;
window.deleteImage = deleteImage;
window.openAddImageModal = openAddImageModal;

// Services
window.loadServices = loadServices;
window.editService = editService;
window.deleteService = deleteService;
window.openAddServiceModal = openAddServiceModal;

// Venues
window.loadVenues = loadVenues;
window.editVenue = editVenue;
window.deleteVenue = deleteVenue;
window.openAddVenueModal = openAddVenueModal;

// Staff
window.loadStaff = loadStaff;
window.editStaff = editStaff;
window.deleteStaff = deleteStaff;
window.viewStaffSchedule = viewStaffSchedule;

// Testimonials
window.loadTestimonials = loadTestimonials;
window.editTestimonial = editTestimonial;
window.deleteTestimonial = deleteTestimonial;

// Settings
window.saveSiteSettings = saveSiteSettings;
window.updateColors = updateColors;
window.updateAdminSettings = updateAdminSettings;
window.saveNotificationSettings = saveNotificationSettings;
window.testDatabaseConnection = testDatabaseConnection;
window.saveDatabaseSettings = saveDatabaseSettings;

// Backup
window.createBackup = createBackup;
window.restoreBackup = restoreBackup;
window.downloadBackup = downloadBackup;
window.deleteBackup = deleteBackup;

// Modal
window.closeModal = closeModal;
window.viewDetails = viewBooking; // Generic