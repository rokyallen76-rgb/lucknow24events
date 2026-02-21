// =============================
// REPLACE WITH YOUR SUPABASE KEYS
// =============================
const supabaseUrl = "YOUR_PROJECT_URL";
const supabaseKey = "YOUR_PUBLIC_ANON_KEY";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// LOGIN WITH OTP
async function login() {
  const email = document.getElementById("email").value;

  const { error } = await supabase.auth.signInWithOtp({
    email: email
  });

  if (!error) {
    document.getElementById("message").innerText =
      "Check your email for login link!";
  }
}

// CHECK SESSION
async function checkUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = "index.html";
  }
}

// SAVE NOTE
async function saveNote() {
  const note = document.getElementById("note").value;

  const { data: userData } = await supabase.auth.getUser();

  await supabase.from("notes").insert([
    { user_id: userData.user.id, content: note }
  ]);

  loadNotes();
}

// LOAD NOTES
async function loadNotes() {
  const { data: userData } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("id", { ascending: false });

  const container = document.getElementById("notes");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(note => {
    container.innerHTML += `<p>${note.content}</p>`;
  });
}

// LOGOUT
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// Auto run if dashboard page
if (window.location.pathname.includes("dashboard.html")) {
  checkUser();
  loadNotes();
}
