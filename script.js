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
const loginPage = document.getElementById('login-page');
const appPage = document.getElementById('app');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const daysLeftEl = document.getElementById('days-left');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const avgGradeEl = document.getElementById('avg-grade');


// =======================================================
// 3. FUNÇÕES PRINCIPAIS
// =======================================================

async function handleLogin() {
    const email = loginEmailInput.value; 
    const password = loginPasswordInput.value;
    loginError.textContent = ''; 

    // O Supabase espera um formato de e-mail. Uma solução é adicionar um domínio fixo.
    // Ex: Se a numérica for "12345", o login será "12345@cfo.pmpe"
    // Certifique-se de cadastrar o usuário dessa forma no Supabase Auth.
    const loginIdentifier = `${email}@cfo.pmpe`;

    const { data, error } = await sb.auth.signInWithPassword({
        email: loginIdentifier,
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

async function handleLogout() {
    const { error } = await sb.auth.signOut();
    if (error) console.error('Erro no logout:', error);
    else {
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        showLoginPage();
    }
}

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
    if (profileResponse.error) console.error('Erro ao buscar perfil:', profileResponse.error);
    else if (profileResponse.data) {
        const profile = profileResponse.data;
        userNameEl.textContent = profile.full_name || 'Aluno Oficial';
        if (profile.avatar_url) userAvatarEl.src = profile.avatar_url;
    }

    // Processa as notas para calcular a média ponderada
    if (gradesResponse.error) console.error('Erro ao buscar notas:', gradesResponse.error);
    else if (gradesResponse.data) {
        calculateWeightedAverage(gradesResponse.data);
    }

    calculateDaysLeft();
}

/**
 * Calcula a média ponderada com base nas notas e cargas horárias.
 * Fórmula: Soma(nota * peso) / Soma(pesos)
 */
function calculateWeightedAverage(grades) {
    if (grades.length === 0) {
        avgGradeEl.textContent = "N/A";
        return;
    }

    let totalScoreAndLoad = 0;
    let totalLoad = 0;

    grades.forEach(grade => {
        // 'subjects' é um objeto porque fizemos uma busca aninhada
        const courseLoad = grade.subjects.course_load; 
        totalScoreAndLoad += grade.score * courseLoad;
        totalLoad += courseLoad;
    });

    const weightedAverage = totalScoreAndLoad / totalLoad;
    avgGradeEl.textContent = weightedAverage.toFixed(2); // Formata para 2 casas decimais
}


function calculateDaysLeft() {
    const graduationDate = new Date('2025-05-26T00:00:00');
    const today = new Date();
    const differenceInMs = graduationDate - today;
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    daysLeftEl.textContent = days > 0 ? days : 0;
}

function showApp() {
    loginPage.classList.add('hidden');
    app.classList.remove('hidden');
}

function showLoginPage() {
    loginPage.classList.remove('hidden');
    app.classList.add('hidden');
}

// =======================================================
// 4. VERIFICAÇÃO DE SESSÃO E EVENTOS
// =======================================================

async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        showApp();
        loadDashboardData();
    } else {
        showLoginPage();
    }
}

loginButton.addEventListener('click', handleLogin);
logoutButton.addEventListener('click', handleLogout);

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});
