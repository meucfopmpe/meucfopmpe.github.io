// =======================================================
// 1. CONFIGURAÇÃO DO SUPABASE
// =======================================================
const SUPABASE_URL = 'https://svijubigtigsrpfqzcgf.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k3Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let userState = {}; // Objeto para guardar os dados do usuário logado
let calendarInstance;
let statsChartInstance;

// =======================================================
// 2. ELEMENTOS DO DOM
// =======================================================
const authPage = document.getElementById('auth-page'), appPage = document.getElementById('app');
const loginContainer = document.getElementById('login-container'), loginButton = document.getElementById('login-button'), loginEmailInput = document.getElementById('login-email'), loginPasswordInput = document.getElementById('login-password'), loginError = document.getElementById('login-error');
const signupContainer = document.getElementById('signup-container'), signupButton = document.getElementById('signup-button'), signupNameInput = document.getElementById('signup-name'), signupCourseNumberInput = document.getElementById('signup-course-number'), signupPlatoonInput = document.getElementById('signup-platoon'), signupPasswordInput = document.getElementById('signup-password'), signupMessage = document.getElementById('signup-message');
const showSignupLink = document.getElementById('show-signup'), showLoginLink = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button'), daysLeftEl = document.getElementById('days-left'), userNameEl = document.getElementById('user-name'), userAvatarEl = document.getElementById('user-avatar'), avgGradeEl = document.getElementById('grades-average'), sidebarNav = document.getElementById('sidebar-nav'), pageTitleEl = document.getElementById('page-title');
const gradesContainer = document.getElementById('grades-container'), qtsScheduleContainer = document.getElementById('qts-schedule-container'), calendarContainer = document.getElementById('calendar'), rankingList = document.getElementById('ranking-list'), achievementsGrid = document.getElementById('achievements-grid'), statsChart = document.getElementById('stats-chart');
const addMissionForm = document.getElementById('add-mission-form'), missionNameInput = document.getElementById('mission-name-input'), missionDateInput = document.getElementById('mission-date-input'), scheduledMissionsList = document.getElementById('scheduled-missions-list');
const remindersList = document.getElementById('reminders-list'), reminderInput = document.getElementById('reminder-input'), addReminderButton = document.getElementById('add-reminder-button');
const addLinkForm = document.getElementById('add-link-form'), linkTitleInput = document.getElementById('link-title-input'), linkValueInput = document.getElementById('link-value-input'), linkTypeInput = document.getElementById('link-type-input'), linksList = document.getElementById('links-list');

// =======================================================
// 3. DADOS ESTÁTICOS (Matérias, Conquistas, etc.)
// =======================================================
const subjectList = ["Sistema de Segurança Pública", "Teoria Geral da Administração", "Gestão Pública Geral Aplicada", "Gestão de Pessoas, Comando e Liderança", "Gestão de Logística, Orçamento e Finanças Públicas", "Fundamentos da Polícia Comunitária", "Psicologia Aplicada", "Análise Criminal e Estatística", "Qualidade do Atendimento aos Grupos Vulneráveis", "Direitos Humanos Aplicados à Atividade Policial Militar", "Gerenciamento de Crises", "Saúde Mental e Qualidade de Vida", "Treinamento Físico Militar I", "Treinamento Físico Militar II", "Gestão de Processos no Sistema Eletrônico", "Tecnologia da Informação e Comunicação", "Comunicação, Mídias Sociais e Cerimonial Militar", "Inteligência e Sistema de Informação", "Ética, Cidadania e Relações Interpessoais", "Ordem Unida I", "Ordem Unida II", "Instrução Geral", "Defesa Pessoal Policial I", "Defesa Pessoal Policial II", "Uso Diferenciado da Força", "Pronto Socorrismo", "Atendimento Pré-Hospitalar Tático", "Planejamento Operacional e Especializado", "Elaboração de Projetos e Captação de Recursos", "Planejamento Estratégico", "Gestão Por Resultados e Avaliação de Políticas Públicas", "Trabalho de Comando e Estado Maior", "Polícia Judiciária Militar", "Direito Administrativo Disciplinar Militar", "Direito Penal e Processual Penal Militar", "Legislação Policial Militar e Organizacional", "Procedimento em Ocorrência", "Economia Aplicada ao Setor Público", "História da PMPE", "Abordagem a Pessoas", "Abordagem a Veículos", "Abordagem a Edificações", "Patrulhamento Urbano", "Armamento e Munição", "Tiro Policial", "Tiro Defensivo (Método Giraldi)", "Ações Básicas de Apoio Aéreo", "Manobras Acadêmicas I", "Manobras Acadêmicas II", "Metodologia da Pesquisa Científica", "Teoria e Prática do Ensino", "Trabalho de Conclusão de Curso"];
const qtsTimes = ['08:00-09:40', '10:00-11:40', '13:40-15:20', '15:40-17:20', '17:30-19:10'];
const achievementsData = {
    FIRST_REMINDER: { name: "Organizado", icon: "📝", description: "Adicione seu primeiro lembrete.", condition: (type) => type === 'add_reminder' },
    FIRST_GRADE: { name: "Estudante", icon: "📖", description: "Adicione sua primeira nota.", condition: (type) => type === 'add_grade' },
    FIRST_SERVICE: { name: "Primeiro Serviço", icon: "🛡️", description: "Agende seu primeiro serviço.", condition: (type) => type === 'add_mission' },
    FIVE_SERVICES: { name: "Sempre Presente", icon: "📅", description: "Agende 5 serviços.", condition: () => userState.missions?.length >= 5 },
    AVG_EIGHT: { name: "Aluno Acima da Média", icon: "📈", description: "Alcance uma média geral de 8.0 ou mais.", condition: (type, avg) => type === 'avg_update' && avg >= 8 },
    AVG_NINE_FIVE: { name: "Intelecto Superior", icon: "💡", description: "Alcance uma média geral de 9.5 ou mais.", condition: (type, avg) => type === 'avg_update' && avg >= 9.5 },
    COURSE_COMPLETE: { name: "Oficial Formado", icon: "🎓", description: "Conclua os 365 dias do curso.", condition: (type) => type === 'course_complete' },
};

// =======================================================
// 4. FUNÇÕES DE AUTENTICAÇÃO E DADOS
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
async function handleLogout() { 
    await sb.auth.signOut(); 
    window.location.reload(); 
}

async function loadUserData(user) {
    const { data, error } = await sb.from('profiles').select('user_data').eq('id', user.id).single();
    if (error) console.error("Erro ao carregar dados do usuário:", error);
    
    if (data && data.user_data) {
        userState = data.user_data;
        if (!userState.missions) userState.missions = [];
        if (!userState.reminders) userState.reminders = [];
        if (!userState.links) userState.links = [];
        if (!userState.grades) userState.grades = Object.fromEntries(subjectList.map(s => [s, 0]));
    } else { 
        userState = {
            grades: Object.fromEntries(subjectList.map(s => [s, 0])),
            schedule: {}, achievements: [], missions: [], reminders: [], links: []
        };
    }
}
async function saveUserData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { error } = await sb.from('profiles').update({ user_data: userState }).eq('id', user.id);
    if (error) console.error("Erro ao salvar dados do usuário:", error);
}

// =======================================================
// 5. FUNÇÕES DE RENDERIZAÇÃO E LÓGICA DO PAINEL
// =======================================================
async function loadDashboardData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { showLoginPage(); return; }

    const { data: profile } = await sb.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
    if (profile) {
        userNameEl.textContent = profile.full_name || 'Aluno Oficial';
        if (profile.avatar_url) userAvatarEl.src = profile.avatar_url;
    }
    
    await loadUserData(user);
    
    calculateDaysLeft();
    renderGrades();
    renderQTSSchedule();
    renderAchievements();
    renderScheduledMissions();
    renderReminders();
    renderLinks();
    initChart();
}

function calculateDaysLeft() {
    const SIMULATED_TODAY = new Date('2024-11-15T12:00:00');
    const graduationDate = new Date('2025-05-26T00:00:00');
    const days = Math.ceil((graduationDate - SIMULATED_TODAY) / (1000 * 60 * 60 * 24));
    daysLeftEl.textContent = days > 0 ? days : 0;
}

function renderGrades() {
    gradesContainer.innerHTML = '';
    subjectList.sort().forEach(subject => {
        const value = userState.grades[subject] || 0;
        gradesContainer.innerHTML += `<div class="grade-item"><span class="grade-item-label" title="${subject}">${subject}</span><input type="number" class="grade-item-input" data-subject="${subject}" value="${value}" min="0" max="10" step="0.1"></div>`;
    });
    updateGradesAverage();
}
function handleGradeChange(e) {
    const subject = e.target.dataset.subject;
    const nota = parseFloat(e.target.value);
    if (subject && !isNaN(nota)) {
        userState.grades[subject] = Math.max(0, Math.min(10, nota));
        if (nota > 0) checkAchievements('add_grade');
        saveUserData();
        updateGradesAverage();
    }
}
function updateGradesAverage() {
    const grades = Object.values(userState.grades).filter(g => g > 0);
    if (grades.length === 0) { avgGradeEl.innerHTML = `MÉDIA GERAL: <span>N/A</span>`; return; }
    const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
    avgGradeEl.innerHTML = `MÉDIA GERAL: <span>${average.toFixed(2)}</span>`;
    checkAchievements('avg_update', average);
}

function renderQTSSchedule() {
    qtsScheduleContainer.innerHTML = `<div class="qts-cell qts-header"></div>` + ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(day => `<div class="qts-cell qts-header">${day}</div>`).join('');
    qtsTimes.forEach(time => {
        qtsScheduleContainer.innerHTML += `<div class="qts-cell qts-header qts-time">${time}</div>`;
        ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].forEach(day => {
            const materia = userState.schedule?.[day]?.[time] || '';
            qtsScheduleContainer.innerHTML += `<div class="qts-cell"><input type="text" class="qts-input" data-day="${day}" data-time="${time}" value="${materia}"></div>`;
        });
    });
}
function handleQTSInput(e) {
    const { day, time } = e.target.dataset;
    if (!userState.schedule) userState.schedule = {};
    if (!userState.schedule[day]) userState.schedule[day] = {};
    userState.schedule[day][time] = e.target.value.trim().toUpperCase();
    saveUserData();
}

function initCalendar() {
    if (calendarInstance) { calendarInstance.refetchEvents(); return; }
    calendarInstance = new FullCalendar.Calendar(calendarContainer, {
        initialView: 'dayGridMonth', locale: 'pt-br',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' },
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana' },
        events: getCalendarEvents()
    });
    calendarInstance.render();
}
function getCalendarEvents() {
    const events = [
        { title: 'Início do Curso', start: '2024-05-26', color: 'var(--sl-success)'}, 
        { title: 'Fim do Curso', start: '2025-05-26', color: 'var(--sl-success)'}
    ];
    if (userState.missions) {
        userState.missions.forEach(mission => {
            events.push({ title: mission.name, start: mission.date, color: 'var(--sl-error)' });
        });
    }
    return events;
}

async function renderRanking() {
    rankingList.innerHTML = 'Carregando ranking...';
    rankingList.innerHTML = `
        <div class="ranking-item"><div class="ranking-pos">1</div><div class="ranking-name">CADETE FULANO</div><div class="ranking-avg">9.85</div></div>
        <div class="ranking-item"><div class="ranking-pos">2</div><div class="ranking-name">CADETE BELTRANO</div><div class="ranking-avg">9.72</div></div>
        <div class="ranking-item"><div class="ranking-pos">3</div><div class="ranking-name">CADETE CICLANO</div><div class="ranking-avg">9.69</div></div>
    `;
}

function renderAchievements() {
    achievementsGrid.innerHTML = '';
    for (const key in achievementsData) {
        const ach = achievementsData[key];
        const unlocked = userState.achievements?.includes(key);
        achievementsGrid.innerHTML += `<div class="achievement" title="${ach.description}"><div class="achievement-icon ${unlocked ? 'unlocked' : ''}">${ach.icon}</div><div class="achievement-title">${ach.name}</div></div>`;
    }
}
function checkAchievements(eventType, data) {
    if (!userState.achievements) userState.achievements = [];
    for (const key in achievementsData) {
        if (!userState.achievements.includes(key) && achievementsData[key].condition(eventType, data)) {
            userState.achievements.push(key);
            saveUserData();
            renderAchievements();
        }
    }
}

function initChart() {
    if (statsChartInstance) statsChartInstance.destroy();
    const ctx = statsChart.getContext('2d');
    statsChartInstance = new Chart(ctx, { type: 'radar', data: {
        labels: ['FORÇA', 'AGILIDADE', 'VIGOR', 'INTELIGÊNCIA', 'PERCEPÇÃO', 'LIDERANÇA'],
        datasets: [{ label: 'Nível', data: [5, 7, 8, 9, 6, 7], backgroundColor: 'rgba(0, 175, 255, 0.2)', borderColor: 'rgba(0, 175, 255, 1)' }]
    }, options: { scales: { r: { suggestedMin: 0, suggestedMax: 10, ticks: { display: false }, grid: { color: 'rgba(255, 255, 255, 0.2)' }, pointLabels: { color: '#c9d1d9' } } }, plugins: { legend: { display: false } } } });
}

function renderScheduledMissions() {
    scheduledMissionsList.innerHTML = '';
    if (!userState.missions) return;
    userState.missions.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((m, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${new Date(m.date+'T00:00:00').toLocaleDateString('pt-BR')} - ${m.name}</span><button data-index="${index}">X</button>`;
        scheduledMissionsList.appendChild(li);
    });
}
function addCustomMission(e) {
    e.preventDefault();
    const name = missionNameInput.value.trim(), date = missionDateInput.value;
    if (name && date) {
        if (!userState.missions) userState.missions = [];
        userState.missions.push({ name, date });
        addMissionForm.reset();
        checkAchievements('add_mission');
        saveUserData();
        renderScheduledMissions();
        if (calendarInstance) calendarInstance.refetchEvents();
    }
}

function renderReminders() {
    remindersList.innerHTML = '';
    if (!userState.reminders) return;
    userState.reminders.forEach((r, index) => {
        const item = document.createElement('div');
        item.className = `list-item reminder-item ${r.completed ? 'completed' : ''}`;
        item.innerHTML = `<label><input type="checkbox" data-index="${index}" ${r.completed ? 'checked' : ''}> <span>${r.text}</span></label><button data-index="${index}">X</button>`;
        remindersList.appendChild(item);
    });
}
function addReminder() {
    const text = reminderInput.value.trim();
    if (text) {
        if (!userState.reminders) userState.reminders = [];
        userState.reminders.push({ text, completed: false });
        reminderInput.value = '';
        checkAchievements('add_reminder');
        saveUserData();
        renderReminders();
    }
}
function handleReminderInteraction(e) {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    if (e.target.type === 'checkbox') userState.reminders[index].completed = e.target.checked;
    if (e.target.tagName === 'BUTTON') userState.reminders.splice(index, 1);
    saveUserData();
    renderReminders();
}

function renderLinks() {
    linksList.innerHTML = '';
    if (!userState.links) return;
    userState.links.forEach((link, index) => {
        const item = document.createElement('div');
        item.className = 'list-item link-item';
        let content = link.type === 'link'
            ? `<a href="${link.value}" target="_blank" rel="noopener noreferrer">${link.title} 🔗</a><span>${link.value}</span>`
            : `<div>${link.title} 📄</div><span>SEI: ${link.value}</span>`;
        item.innerHTML = `<div class="link-item-info">${content}</div><button data-index="${index}">X</button>`;
        linksList.appendChild(item);
    });
}
function addLink(e) {
    e.preventDefault();
    let value = linkValueInput.value.trim();
    const title = linkTitleInput.value.trim(), type = linkTypeInput.value;
    if (title && value) {
        if (type === 'link' && !value.startsWith('http')) value = `https://${value}`;
        if (!userState.links) userState.links = [];
        userState.links.push({ title, value, type });
        addLinkForm.reset();
        saveUserData();
        renderLinks();
    }
}
function handleLinkInteraction(e) {
    if (e.target.tagName === 'BUTTON') {
        userState.links.splice(e.target.dataset.index, 1);
        saveUserData();
        renderLinks();
    }
}

// =======================================================
// 6. CONTROLE DE INTERFACE E EVENT LISTENERS
// =======================================================
function showApp() { authPage.classList.add('hidden'); appPage.classList.remove('hidden'); }
function showLoginPage() { authPage.classList.remove('hidden'); appPage.classList.add('hidden'); }
async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) { showApp(); loadDashboardData(); } 
    else { signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); }
}
function handlePageNavigation(e) {
    if (e.target.tagName !== 'A') return;
    const targetPageId = e.target.dataset.page;
    if (!targetPageId) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(targetPageId).classList.add('active');
    e.target.classList.add('active');
    pageTitleEl.textContent = e.target.textContent;
    if (targetPageId === 'page-calendar') initCalendar();
    if (targetPageId === 'page-ranking') renderRanking();
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loginButton.addEventListener('click', handleLogin);
    signupButton.addEventListener('click', handleSignUp);
    logoutButton.addEventListener('click', handleLogout);
    sidebarNav.addEventListener('click', handlePageNavigation);
    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); signupContainer.classList.remove('hidden'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });
    gradesContainer.addEventListener('change', handleGradeChange);
    qtsScheduleContainer.addEventListener('change', handleQTSInput);
    addMissionForm.addEventListener('submit', addCustomMission);
    scheduledMissionsList.addEventListener('click', (e) => { if(e.target.tagName === 'BUTTON') { userState.missions.splice(e.target.dataset.index, 1); saveUserData(); renderScheduledMissions(); if(calendarInstance) calendarInstance.refetchEvents(); } });
    addReminderButton.addEventListener('click', addReminder);
    remindersList.addEventListener('click', handleReminderInteraction);
    addLinkForm.addEventListener('submit', addLink);
    linksList.addEventListener('click', handleLinkInteraction);
});
