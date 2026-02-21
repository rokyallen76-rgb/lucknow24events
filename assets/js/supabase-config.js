// Supabase Configuration
const SUPABASE_URL = localStorage.getItem('supabaseUrl') || 'https://eibvlmsgprvwoetoqffa.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('supabaseKey') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYnZsbXNncHJ2d29ldG9xZmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjMzODMsImV4cCI6MjA4NzIzOTM4M30.YVEGGX0nNE-S_0Nksd-H8GI1ejdx-sS2ZRHiMf6xMjw';

let supabaseClient = null;

// Initialize Supabase
function initSupabase() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://eibvlmsgprvwoetoqffa.supabase.co') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } else {
        console.warn('Supabase not configured');
        return false;
    }
}

// Test connection
async function testSupabaseConnection() {
    if (!supabaseClient) return false;
    
    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection failed:', error);
        return false;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
});