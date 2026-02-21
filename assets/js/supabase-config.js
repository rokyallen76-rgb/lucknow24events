<!-- Include Supabase JS library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.35.1/dist/supabase.min.js"></script>

<script>
// ---------------- Supabase Configuration ----------------
const DEFAULT_SUPABASE_URL = 'https://eibvlmsgprvwoetoqffa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYnZsbXNncHJ2d29ldG9xZmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjMzODMsImV4cCI6MjA4NzIzOTM4M30.YVEGGX0nNE-S_0Nksd-H8GI1ejdx-sS2ZRHiMf6xMjw';

// Get Supabase URL and key from localStorage if available, else use default
const SUPABASE_URL = localStorage.getItem('supabaseUrl') || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = localStorage.getItem('supabaseKey') || DEFAULT_SUPABASE_ANON_KEY;

let supabaseClient = null;

// ---------------- Initialize Supabase ----------------
function initSupabase() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized successfully');
        return true;
    } else {
        console.warn('⚠️ Supabase not configured');
        return false;
    }
}

// ---------------- Test Supabase Connection ----------------
async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.warn('Supabase client is not initialized');
        return false;
    }

    try {
        // Test connection by getting count of rows from 'bookings' table
        const { count, error } = await supabaseClient
            .from('bookings')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        console.log(`✅ Supabase connection successful, bookings count: ${count}`);
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
}

// ---------------- Initialize on Page Load ----------------
document.addEventListener('DOMContentLoaded', async function() {
    const initialized = initSupabase();
    if (initialized) {
        await testSupabaseConnection();
    }
});
</script>