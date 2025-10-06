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

// =======================================================
// 3. FUNÇÕES DE AUTENTICAÇÃO
// =======================================================

async function handleSignUp() {
    const fullName = signupNameInput.value;
    const courseNumber = signupCourseNumberInput.value;
    const platoon = signupPlatoonInput.value;
    const password = signupPasswordInput.value;
    signupMessage.textContent = '';

    if (!fullName || !courseNumber || !platoon || !password) {
        signupMessage.textContent = 'Por favor, preencha todos os campos.';
        signupMessage.classList.add('error-message');
        return;
    }
    
    const email = `${courseNumber}@cfo.pmpe`;

    const { data, error } = await sb.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: fullName, course_number: courseNumber, platoon: platoon } }
    });

    if (error) {
        console.error('Erro no cadastro:', error.message);
        signupMessage.textContent = "Erro ao cadastrar. A numérica já pode estar em uso.";
        signupMessage.classList.add('error-message');
    } else {
        signupMessage.textContent = 'Cadastro realizado! Redirecionando para o login...';
        signupMessage.classList.remove('error-message');
        signupMessage.classList.add('message');
        
        // **MELHORIA**: Aguarda 2 segundos e volta para a tela de login
        setTimeout(() => {
            signupContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
            signupMessage.textContent = ''; // Limpa a mensagem
        }, 2000);
    }
}

async function handleLogin() {
    const courseNumber = loginEmailInput.value;
    const password = loginPasswordInput.value;
    loginError.textContent = '';
    
    const email = `${courseNumber}@cfo.pmpe`;

    // **DEBUG**: Adicionando logs para ver o que acontece
    console.log("1. Tentando fazer login com a numérica:", courseNumber);

    const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error("2. Erro no login:", error.message);
        loginError.textContent = 'Numérica ou senha inválidas.';
        return;
    }

    if (data.user) {
        console.log("3. Login bem-sucedido. Usuário:", data.user.id);
        console.log("4. Mostrando o painel...");
        showApp();
        console.log("5. Carregando dados do painel...");
        loadDashboardData();
    }
}

async function handleLogout() {
    const { error } = await sb.auth.signOut();
    if (error) console.error('Erro no logout:', error);
    else showLoginPage();
}

// =======================================================
// 4. FUNÇÕES DO DASHBOARD
// =======================================================

async function loadDashboardData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { showLoginPage(); return; }

    const [profileResponse, gradesResponse] = await Promise.all([
        sb.from('profiles').select('full_name, avatar_url, experience_points').eq('id', user.id).single(),
        sb.from('grades').select('score, subjects(course_load)').eq('user_id', user.id)
    ]);

    if (profileResponse.data) {
        const profile = profileResponse.data;
        userNameEl.textContent = profile.full_name || 'Aluno Oficial';
        if (profile.avatar_url) userAvatarEl.src = profile.avatar_url;
    } else {
         console.error('Erro ao buscar perfil:', profileResponse.error);
    }
    
    if (gradesResponse.data) {
        calculateWeightedAverage(gradesResponse.data);
    } else {
        console.error('Erro ao buscar notas:', gradesResponse.error);
    }
    
    calculateDaysLeft();
    console.log("6. Dados do painel carregados.");
}

function calculateWeightedAverage(grades) {
    if (!grades || grades.length === 0) { avgGradeEl.textContent = "N/A"; return; }
    let totalScoreAndLoad = 0, totalLoad = 0;
    grades.forEach(grade => {
        if (grade.subjects && typeof grade.subjects.course_load === 'number') {
            totalScoreAndLoad += grade.score * courseLoad;
            totalLoad += grade.subjects.course_load;
        }
    });
    if (totalLoad === 0) { avgGradeEl.textContent = "N/A"; return; }
    avgGradeEl.textContent = (totalScoreAndLoad / totalLoad).toFixed(2);
}

function calculateDaysLeft() {
    const graduationDate = new Date('2025-05-26T00:00:00');
    const today = new Date();
    const differenceInMs = graduationDate - today;
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    daysLeftEl.textContent = days > 0 ? days : 0;
}

// =======================================================
// 5. CONTROLE DE INTERFACE E SESSÃO
// =======================================================

function showApp() { authPage.classList.add('hidden'); appPage.classList.remove('hidden'); }
function showLoginPage() { authPage.classList.remove('hidden'); appPage.classList.add('hidden'); }

async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) { showApp(); loadDashboardData(); } 
    else { signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); }
}

// =======================================================
// 6. EVENT LISTENERS
// =======================================================
loginButton.addEventListener('click', handleLogin);
signupButton.addEventListener('click', handleSignUp);
logoutButton.addEventListener('click', handleLogout);
showSignupLink.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); signupContainer.classList.remove('hidden'); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });
document.addEventListener('DOMContentLoaded', checkSession);
