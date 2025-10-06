// =======================================================
// 1. CONFIGURAÇÃO DO SUPABASE
// =======================================================
// ATENÇÃO: Substitua com a sua URL e Chave Pública (Anon Key) do Supabase.
const SUPABASE_URL = 'https://svijubigtigsrpfqzcgf.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k3Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================================================
// 2. ELEMENTOS DO DOM (HTML)
// =======================================================
const authPage = document.getElementById('auth-page');
const appPage = document.getElementById('app');

// --- Elementos de Login ---
const loginContainer = document.getElementById('login-container');
const loginButton = document.getElementById('login-button');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

// --- Elementos de Cadastro ---
const signupContainer = document.getElementById('signup-container');
const signupButton = document.getElementById('signup-button');
const signupNameInput = document.getElementById('signup-name');
const signupCourseNumberInput = document.getElementById('signup-course-number');
const signupPlatoonInput = document.getElementById('signup-platoon');
const signupPasswordInput = document.getElementById('signup-password');
const signupMessage = document.getElementById('signup-message');

// --- Links de Alternância ---
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

// --- Elementos do App ---
const logoutButton = document.getElementById('logout-button');
const daysLeftEl = document.getElementById('days-left');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const avgGradeEl = document.getElementById('avg-grade');

// =======================================================
// 3. FUNÇÕES DE AUTENTICAÇÃO
// =======================================================

/**
 * Cadastra um novo usuário.
 */
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
        options: {
            data: { 
                full_name: fullName,
                course_number: courseNumber,
                platoon: platoon
            }
        }
    });

    if (error) {
        console.error('Erro no cadastro:', error.message);
        signupMessage.textContent = "Erro ao cadastrar. A numérica já pode estar em uso.";
        signupMessage.classList.add('error-message');
    } else {
        console.log('Usuário cadastrado:', data.user);
        signupMessage.textContent = 'Cadastro realizado com sucesso! Você já pode fazer o login.';
        signupMessage.classList.remove('error-message');
        signupMessage.classList.add('message');
    }
}

/**
 * Faz o login do usuário.
 */
async function handleLogin() {
    const courseNumber = loginEmailInput.value;
    const password = loginPasswordInput.value;
    loginError.textContent = '';
    
    const email = `${courseNumber}@cfo.pmpe`;

    const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Erro no login:', error.message);
        loginError.textContent = 'Numérica ou senha inválidas.';
        return;
    }

    if (data.user) {
        showApp();
        loadDashboardData();
    }
}

/**
 * Faz o logout do usuário.
 */
async function handleLogout() {
    const { error } = await sb.auth.signOut();
    if (error) {
        console.error('Erro no logout:', error);
    } else {
        showLoginPage();
    }
}

// =======================================================
// 4. FUNÇÕES DO DASHBOARD
// =======================================================

/**
 * Carrega todos os dados do dashboard para o usuário logado.
 */
async function loadDashboardData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        showLoginPage();
        return;
    }

    // Busca o perfil e as notas em paralelo para mais eficiência
    const [profileResponse, gradesResponse] = await Promise.all([
        sb.from('profiles').select('full_name, avatar_url, experience_points').eq('id', user.id).single(),
        sb.from('grades').select('score, subjects(course_load)').eq('user_id', user.id)
    ]);

    // Processa o perfil
    if (profileResponse.error) {
        console.error('Erro ao buscar perfil:', profileResponse.error);
    } else if (profileResponse.data) {
        const profile = profileResponse.data;
        userNameEl.textContent = profile.full_name || 'Aluno Oficial';
        if (profile.avatar_url) userAvatarEl.src = profile.avatar_url;
    }

    // Processa as notas para calcular a média ponderada
    if (gradesResponse.error) {
        console.error('Erro ao buscar notas:', gradesResponse.error);
    } else if (gradesResponse.data) {
        calculateWeightedAverage(gradesResponse.data);
    }

    calculateDaysLeft();
}

/**
 * Calcula a média ponderada com base nas notas e cargas horárias.
 */
function calculateWeightedAverage(grades) {
    if (!grades || grades.length === 0) {
        avgGradeEl.textContent = "N/A";
        return;
    }

    let totalScoreAndLoad = 0;
    let totalLoad = 0;

    grades.forEach(grade => {
        if (grade.subjects && typeof grade.subjects.course_load === 'number') {
            const courseLoad = grade.subjects.course_load; 
            totalScoreAndLoad += grade.score * courseLoad;
            totalLoad += courseLoad;
        }
    });

    if (totalLoad === 0) {
        avgGradeEl.textContent = "N/A";
        return;
    }

    const weightedAverage = totalScoreAndLoad / totalLoad;
    avgGradeEl.textContent = weightedAverage.toFixed(2);
}

/**
 * Calcula os dias que faltam para a formatura.
 */
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

function showApp() {
    authPage.classList.add('hidden');
    appPage.classList.remove('hidden');
}

function showLoginPage() {
    authPage.classList.remove('hidden');
    appPage.classList.add('hidden');
    signupContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
}

async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        showApp();
        loadDashboardData();
    } else {
        showLoginPage();
    }
}

// =======================================================
// 6. EVENT LISTENERS (EScutadores de eventos)
// =======================================================

loginButton.addEventListener('click', handleLogin);
signupButton.addEventListener('click', handleSignUp);
logoutButton.addEventListener('click', handleLogout);

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.classList.add('hidden');
    signupContainer.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});
