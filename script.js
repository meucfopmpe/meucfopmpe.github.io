// =======================================================
// 1. CONFIGURAÇÃO DO SUPABASE
// =======================================================
const SUPABASE_URL = 'https://svijubigtigsrpfqzcgf.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k3Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================================================
// 2. ELEMENTOS DO DOM (HTML)
// =======================================================
const authPage = document.getElementById('auth-page');
const appPage = document.getElementById('app');
const loginContainer = document.getElementById('login-container');
const loginButton = document.getElementById('login-button');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const signupContainer = document.getElementById('signup-container');
const signupButton = document.getElementById('signup-button');
const signupNameInput = document.getElementById('signup-name');
const signupCourseNumberInput = document.getElementById('signup-course-number');
const signupPlatoonInput = document.getElementById('signup-platoon');
const signupPasswordInput = document.getElementById('signup-password');
const signupMessage = document.getElementById('signup-message');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button');
const daysLeftEl = document.getElementById('days-left');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const avgGradeEl = document.getElementById('avg-grade');
const sidebarNav = document.getElementById('sidebar-nav');
const pageTitleEl = document.getElementById('page-title');

// =======================================================
// 3. FUNÇÕES DE AUTENTICAÇÃO (sem alterações)
// =======================================================
async function handleSignUp() {
    const fullName = signupNameInput.value, courseNumber = signupCourseNumberInput.value, platoon = signupPlatoonInput.value, password = signupPasswordInput.value;
    signupMessage.textContent = '';
    if (!fullName || !courseNumber || !platoon || !password) { signupMessage.textContent = 'Por favor, preencha todos os campos.'; signupMessage.className = 'error-message'; return; }
    const email = `${courseNumber}@cfo.pmpe`;
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: fullName, course_number: courseNumber, platoon: platoon } } });
    if (error) { signupMessage.textContent = "Erro: Numérica já pode estar em uso."; signupMessage.className = 'error-message'; } 
    else {
        signupMessage.textContent = 'Sucesso! Redirecionando para login...'; signupMessage.className = 'message';
        setTimeout(() => { signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); signupMessage.textContent = ''; }, 2000);
    }
}
async function handleLogin() {
    const courseNumber = loginEmailInput.value, password = loginPasswordInput.value;
    loginError.textContent = '';
    const email = `${courseNumber}@cfo.pmpe`;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { loginError.textContent = 'Numérica ou senha inválidas.'; } 
    else if (data.user) { showApp(); loadDashboardData(); }
}
async function handleLogout() { await sb.auth.signOut(); showLoginPage(); }

// =======================================================
// 4. FUNÇÕES DO DASHBOARD (ATUALIZADAS)
// =======================================================
async function loadDashboardData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { showLoginPage(); return; }
    const [profileRes, gradesRes] = await Promise.all([
        sb.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
        sb.from('grades').select('score').eq('user_id', user.id) // Query simplificada para média simples
    ]);
    if (profileRes.data) {
        userNameEl.textContent = profileRes.data.full_name || 'Aluno Oficial';
        if (profileRes.data.avatar_url) userAvatarEl.src = profileRes.data.avatar_url;
    }
    if (gradesRes.data) { calculateSimpleAverage(gradesRes.data); }
    calculateDaysLeft();
}

/**
 * ATUALIZADO: Calcula a média aritmética simples.
 */
function calculateSimpleAverage(grades) {
    if (!grades || grades.length === 0) { avgGradeEl.textContent = "N/A"; return; }
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    const average = sum / grades.length;
    avgGradeEl.textContent = average.toFixed(2);
}

/**
 * ATUALIZADO: Usa uma data simulada para o cálculo.
 */
function calculateDaysLeft() {
    // IMPORTANTE: A data real de hoje (out/2025) já passou da data de formatura (mai/2025).
    // Para ver o contador funcionando, usamos uma data "de mentira".
    // Mude esta data para qualquer dia antes da formatura para testar.
    const SIMULATED_TODAY = new Date('2024-10-08T12:00:00'); // <<<< Mude aqui para testar
    
    const graduationDate = new Date('2025-05-26T00:00:00');
    // const today = new Date(); // Linha original que usa a data real
    const today = SIMULATED_TODAY; // Nova linha que usa a data simulada

    const differenceInMs = graduationDate - today;
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    daysLeftEl.textContent = days > 0 ? days : 0;
}

// =======================================================
// 5. CONTROLE DE INTERFACE E SESSÃO (ATUALIZADO)
// =======================================================
function showApp() { authPage.classList.add('hidden'); appPage.classList.remove('hidden'); }
function showLoginPage() { authPage.classList.remove('hidden'); appPage.classList.add('hidden'); }

async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) { showApp(); loadDashboardData(); } 
    else { signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); }
}

/**
 * NOVO: Gerencia a troca de páginas/abas.
 */
function handlePageNavigation(e) {
    if (e.target.tagName !== 'A') return; // Sai se o clique não foi num link
    
    const targetPageId = e.target.dataset.page;
    if (!targetPageId) return;

    // Esconde todas as páginas e remove a classe ativa dos links
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Mostra a página alvo e ativa o link
    document.getElementById(targetPageId).classList.add('active');
    e.target.classList.add('active');

    // Atualiza o título da página
    pageTitleEl.textContent = e.target.textContent;
}

// =======================================================
// 6. EVENT LISTENERS (ATUALIZADO)
// =======================================================
loginButton.addEventListener('click', handleLogin);
signupButton.addEventListener('click', handleSignUp);
logoutButton.addEventListener('click', handleLogout);
sidebarNav.addEventListener('click', handlePageNavigation); // Novo listener para as abas
showSignupLink.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); signupContainer.classList.remove('hidden'); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });
document.addEventListener('DOMContentLoaded', checkSession);
