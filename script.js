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
const logoutButton = document.getElementById('logout-button'), daysLeftEl = document.getElementById('days-left'), userNameSidebar = document.getElementById('user-name-sidebar'), userAvatarSidebar = document.getElementById('user-avatar-sidebar'), userAvatarHeader = document.getElementById('user-avatar-header'), avgGradeEl = document.getElementById('grades-average'), sidebarNav = document.getElementById('sidebar-nav'), pageTitleEl = document.getElementById('page-title');
const playerLevelTitle = document.getElementById('player-level-title'), xpBar = document.getElementById('xp-bar'), xpText = document.getElementById('xp-text'), coursePercentageEl = document.getElementById('course-progress-text'), courseProgressBar = document.getElementById('course-progress-bar');
const gradesContainer = document.getElementById('grades-container'), qtsScheduleContainer = document.getElementById('qts-schedule-container'), calendarContainer = document.getElementById('calendar'), rankingList = document.getElementById('ranking-list'), achievementsGrid = document.getElementById('achievements-grid'), rankingToggle = document.getElementById('ranking-toggle');
const dashboardMissionsList = document.getElementById('dashboard-missions-list'), dashboardAchievementsList = document.getElementById('dashboard-achievements-list');
const addMissionForm = document.getElementById('add-mission-form'), missionNameInput = document.getElementById('mission-name-input'), missionDateInput = document.getElementById('mission-date-input'), scheduledMissionsList = document.getElementById('scheduled-missions-list');
const remindersList = document.getElementById('reminders-list'), reminderInput = document.getElementById('reminder-input'), addReminderButton = document.getElementById('add-reminder-button');
const addLinkForm = document.getElementById('add-link-form'), linkTitleInput = document.getElementById('link-title-input'), linkValueInput = document.getElementById('link-value-input'), linkTypeInput = document.getElementById('link-type-input'), linksList = document.getElementById('links-list');
const uploadAvatarButton = document.getElementById('upload-avatar-button'), uploadAvatarInput = document.getElementById('upload-avatar-input');
const addQuestForm = document.getElementById('add-quest-form'), questTextInput = document.getElementById('quest-text-input'), questDifficultySelect = document.getElementById('quest-difficulty-select'), questsList = document.getElementById('quests-list'), clearCompletedQuestsButton = document.getElementById('clear-completed-quests-button');
const achievementsWidget = document.getElementById('achievements-widget'), achievementsModal = document.getElementById('achievements-modal'), achievementsModalClose = document.getElementById('achievements-modal-close');
const hamburgerButton = document.getElementById('hamburger-button'), sidebar = document.querySelector('.sidebar'), sidebarOverlay = document.getElementById('sidebar-overlay');
const detailModal = document.getElementById('detail-modal'), detailModalTitle = document.getElementById('detail-modal-title'), detailModalBody = document.getElementById('detail-modal-body'), detailModalClose = document.getElementById('detail-modal-close');
const adminInfoList = document.getElementById('admin-info-list');
const saveGradesButton = document.getElementById('save-grades-button'), gradeSearchInput = document.getElementById('grade-search-input');
const gradesProgressCounter = document.getElementById('grades-progress-counter');
const majorDaysCounter = document.getElementById('major-days-counter');
const addDisciplineEventForm = document.getElementById('add-discipline-event-form');
const disciplineEventType = document.getElementById('discipline-event-type');
const disciplineReasonInput = document.getElementById('discipline-reason-input');
const disciplineLogList = document.getElementById('discipline-log-list');
const disciplineGradeDisplay = document.getElementById('discipline-grade-display');

// =======================================================
// 3. DADOS ESTÁTICOS
// =======================================================
const COURSE_START_DATE = new Date('2025-05-26T00:00:00');
const subjectList = ["Sistema de Segurança Pública", "Teoria Geral da Administração", "Gestão Pública Geral Aplicada", "Gestão de Pessoas, Comando e Liderança", "Gestão de Logística, Orçamento e Finanças Públicas", "Fundamentos da Polícia Comunitária", "Psicologia Aplicada", "Análise Criminal e Estatística", "Qualidade do Atendimento aos Grupos Vulneráveis", "Direitos Humanos Aplicados à Atividade Policial Militar", "Gerenciamento de Crises", "Saúde Mental e Qualidade de Vida", "Treinamento Físico Militar I", "Treinamento Físico Militar II", "Gestão de Processos no Sistema Eletrônico", "Tecnologia da Informação e Comunicação", "Comunicação, Mídias Sociais e Cerimonial Militar", "Inteligência e Sistema de Informação", "Ética, Cidadania e Relações Interpessoais", "Ordem Unida I", "Ordem Unida II", "Instrução Geral", "Defesa Pessoal Policial I", "Defesa Pessoal Policial II", "Uso Diferenciado da Força", "Pronto Socorrismo", "Atendimento Pré-Hospitalar Tático", "Planejamento Operacional e Especializado", "Elaboração de Projetos e Captação de Recursos", "Planejamento Estratégico", "Gestão Por Resultados e Avaliação de Políticas Públicas", "Trabalho de Comando e Estado Maior", "Polícia Judiciária Militar", "Direito Administrativo Disciplinar Militar", "Direito Penal e Processual Penal Militar", "Legislação Policial Militar e Organizacional", "Procedimento em Ocorrência", "Economia Aplicada ao Setor Público", "História da PMPE", "Abordagem a Pessoas", "Abordagem a Veículos", "Abordagem a Edificações", "Patrulhamento Urbano", "Armamento e Munição", "Tiro Policial", "Tiro Defensivo (Método Giraldi)", "Ações Básicas de Apoio Aéreo", "Manobras Acadêmicas I", "Manobras Acadêmicas II", "Metodologia da Pesquisa Científica", "Teoria e Prática do Ensino", "Trabalho de Conclusão de Curso"];
const qtsTimes = ['08:00-09:40', '10:00-11:40', '13:40-15:20', '15:40-17:20', '17:30-19:10'];
const achievementsData = {
    LEVEL_5: { name: "Recruta", icon: "🔰", description: "Alcance o Nível 5 de cadete.", condition: (state) => Math.floor((state.xp || 0) / 100) + 1 >= 5 },
    LEVEL_10: { name: "Cadete Antigo", icon: "⭐", description: "Alcance o Nível 10 de cadete.", condition: (state) => Math.floor((state.xp || 0) / 100) + 1 >= 10 },
    LEVEL_20: { name: "Veterano", icon: "🎖️", description: "Alcance o Nível 20 de cadete.", condition: (state) => Math.floor((state.xp || 0) / 100) + 1 >= 20 },
    LEVEL_30: { name: "Elite", icon: "💀", description: "Alcance o Nível 30 de cadete.", condition: (state) => Math.floor((state.xp || 0) / 100) + 1 >= 30 },
    LEVEL_50: { name: "Lendário", icon: "🏆", description: "Alcance o Nível 50 de cadete.", condition: (state) => Math.floor((state.xp || 0) / 100) + 1 >= 50 },
    FIRST_QUEST: { name: "Primeira Missão", icon: "⚔️", description: "Complete sua primeira missão diária.", condition: (state, type) => type === 'complete_quest' },
    HARD_QUEST: { name: "Desafiante", icon: "🔥", description: "Complete uma missão diária na dificuldade Difícil.", condition: (state, type, data) => type === 'complete_quest' && data.difficulty === 'hard' },
    TEN_QUESTS: { name: "Combatente", icon: "💪", description: "Complete 10 missões diárias.", condition: (state) => (state.quests || []).filter(q => q.completed).length >= 10 },
    FIFTY_QUESTS: { name: "Guerreiro", icon: "💥", description: "Complete 50 missões diárias.", condition: (state) => (state.quests || []).filter(q => q.completed).length >= 50 },
    FIRST_GRADE: { name: "Estudante", icon: "📖", description: "Adicione sua primeira nota no sistema.", condition: (state, type) => type === 'add_grade' },
    ALL_GRADES: { name: "Caxias", icon: "📚", description: "Preencha as notas de todas as matérias.", condition: (state) => subjectList.every(s => (state.grades[s] || 0) > 0) },
    PERFECT_TEN: { name: "Nota Máxima", icon: "🔟", description: "Obtenha uma nota 10 em qualquer matéria.", condition: (state) => Object.values(state.grades).includes(10) },
    AVG_EIGHT: { name: "Acima da Média", icon: "📈", description: "Alcance uma média geral de 8.0 ou mais.", condition: (state, type, avg) => type === 'avg_update' && avg >= 8 },
    AVG_NINE_FIVE: { name: "Intelecto Superior", icon: "💡", description: "Alcance uma média geral de 9.5 ou mais.", condition: (state, type, avg) => type === 'avg_update' && avg >= 9.5 },
    SCHEDULE_COMPLETE: { name: "Planejador", icon: "📋", description: "Preencha todos os horários do seu QTS.", condition: (state, type) => { if (type !== 'save_schedule') return false; const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']; return days.every(d => qtsTimes.every(t => state.schedule?.[d]?.[t]?.length > 0)); }},
    FIRST_SERVICE: { name: "Primeiro Serviço", icon: "🛡️", description: "Agende seu primeiro serviço no calendário.", condition: (state, type) => type === 'add_mission' },
    FIVE_SERVICES: { name: "Sempre Presente", icon: "📅", description: "Agende 5 serviços diferentes.", condition: (state) => (state.missions || []).length >= 5 },
    TEN_SERVICES: { name: "Pilar da Turma", icon: "🏛️", description: "Agende 10 serviços diferentes.", condition: (state) => (state.missions || []).length >= 10 },
    FIRST_REMINDER: { name: "Organizado", icon: "📝", description: "Adicione seu primeiro lembrete.", condition: (state, type) => type === 'add_reminder' },
    TEN_REMINDERS: { name: "Mestre dos Lembretes", icon: "🧠", description: "Crie 10 lembretes.", condition: (state) => (state.reminders || []).length >= 10 },
    FIRST_LINK: { name: "Conectado", icon: "🔗", description: "Salve seu primeiro Link ou processo SEI.", condition: (state, type) => type === 'add_link' },
    PROGRESS_25: { name: "Início da Jornada", icon: "🌄", description: "Conclua 25% do curso.", condition: (state, type, data) => type === 'time_update' && data.percentage >= 25 },
    PROGRESS_50: { name: "Meio Caminho", icon: "🏃", description: "Conclua 50% do curso.", condition: (state, type, data) => type === 'time_update' && data.percentage >= 50 },
    PROGRESS_75: { name: "Reta Final", icon: "🏁", description: "Conclua 75% do curso.", condition: (state, type, data) => type === 'time_update' && data.percentage >= 75 },
    TOP_10: { name: "Top 10", icon: "🏅", description: "Fique entre os 10 melhores no ranking (funcionalidade futura).", condition: () => false },
    TOP_3: { name: "Pódio", icon: "🥉", description: "Fique entre os 3 melhores no ranking (funcionalidade futura).", condition: () => false },
    FIRST_PLACE: { name: "Xerife", icon: "🥇", description: "Alcance o 1º lugar no ranking (funcionalidade futura).", condition: () => false },
    ALL_ACHIEVEMENTS: { name: "Monarca", icon: "👑", description: "Desbloqueie todas as outras conquistas.", condition: (state) => (state.achievements || []).length >= Object.keys(achievementsData).length - 1 },
    NIGHT_OWL: { name: "Coruja", icon: "🦉", description: "Agende um serviço que comece após as 18h.", condition: (state, type, data) => type === 'add_mission' && new Date(data.date).getUTCHours() >= 18 },
    COURSE_COMPLETE: { name: "Oficial Formado", icon: "🎓", description: "Conclua os 365 dias do curso.", condition: (state, type, data) => type === 'time_update' && data.days_left <= 0 },
};

// =======================================================
// 4. FUNÇÕES DE AUTENTICAÇÃO E DADOS
// =======================================================
async function handleSignUp() {
    const fullName = signupNameInput.value, courseNumber = signupCourseNumberInput.value, platoon = signupPlatoonInput.value, password = signupPasswordInput.value;
    signupMessage.textContent = '';
    if (!fullName || !courseNumber || !platoon || !password) { signupMessage.textContent = 'Por favor, preencha todos os campos.'; signupMessage.className = 'error-message'; return; }
    
    const email = `${courseNumber}@cfo.pmpe`;
    const { data: authData, error: authError } = await sb.auth.signUp({ email, password, options: { data: { full_name: fullName, course_number: courseNumber, platoon: platoon } } });

    if (authError) { signupMessage.textContent = "Erro: Numérica já pode estar em uso."; signupMessage.className = 'error-message'; return; }
    
    if (authData.user) {
        const todayStr = new Date().toISOString().split('T')[0];
        await sb.from('profiles').update({ last_punishment_date: todayStr }).eq('id', authData.user.id);
        
        signupMessage.textContent = 'Sucesso! Redirecionando para login...';
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
async function handleLogout() { await sb.auth.signOut(); window.location.reload(); }

async function loadUserData(user) {
    const { data, error } = await sb.from('profiles').select('user_data, show_in_ranking, disciplinary_grade, last_punishment_date').eq('id', user.id).single();
    if (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        return;
    }
    
    rankingToggle.checked = data.show_in_ranking;
    userState.disciplinary_grade = data.disciplinary_grade;
    userState.last_punishment_date = data.last_punishment_date;

    if (data && data.user_data) {
        userState = { ...userState, ...data.user_data };
        if (userState.avatar) {
            userAvatarSidebar.src = userState.avatar;
            userAvatarHeader.src = userState.avatar;
        } else {
            userAvatarSidebar.src = '';
            userAvatarHeader.src = '';
        }
    } else { 
        const today = new Date();
        const daysPassed = Math.max(0, Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24)));
        const initialXp = daysPassed * 15;
        userState = {
            grades: Object.fromEntries(subjectList.map(s => [s, 0])),
            schedule: {}, achievements: [], missions: [], reminders: [], links: [], quests: [], xp: initialXp, avatar: ''
        };
        await saveUserData();
    }
    if (!userState.xp) userState.xp = 0;
    if (!userState.missions) userState.missions = [];
    if (!userState.reminders) userState.reminders = [];
    if (!userState.links) userState.links = [];
    if (!userState.quests) userState.quests = [];
    if (!userState.achievements) userState.achievements = [];
    if (!userState.grades || Object.keys(userState.grades).length === 0) userState.grades = Object.fromEntries(subjectList.map(s => [s, 0]));
    if (userState.moral === undefined) userState.moral = 100;
}
async function saveUserData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { avatar, ...userDataToSave } = userState;
    const { error } = await sb.from('profiles').update({ user_data: userDataToSave }).eq('id', user.id);
    if (error) console.error("Erro ao salvar dados do usuário:", error);
}

async function uploadAvatar(file) {
    try {
        const dataUrl = await resizeImage(file, 200, 200);
        userState.avatar = dataUrl;
        await saveUserData();
        userAvatarSidebar.src = dataUrl;
        userAvatarHeader.src = dataUrl;
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        alert('Não foi possível processar a imagem.');
    }
}

function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) { height = Math.round((height *= maxWidth / width)); width = maxWidth; }
                } else {
                    if (height > maxHeight) { width = Math.round((width *= maxHeight / height)); height = maxHeight; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// =======================================================
// 5. FUNÇÕES DE RENDERIZAÇÃO E LÓGICA DO PAINEL
// =======================================================
async function loadDashboardData() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { showLoginPage(); return; }
    const { data: profile } = await sb.from('profiles').select('full_name').eq('id', user.id).single();
    if (profile) {
        userNameSidebar.textContent = profile.full_name || 'Aluno Oficial';
    }
    
    await loadUserData(user);
    
    renderAdminInfo();
    renderDashboard();
    renderQuests();
    renderGrades();
    renderQTSSchedule();
    renderAchievements();
    renderScheduledMissions();
    renderReminders();
    renderLinks();
    renderDisciplinePage();
}

async function renderAdminInfo() {
    const { data, error } = await sb.from('global_info').select('*').order('created_at', { ascending: false }).limit(5);
    if (error) { console.error("Erro ao buscar informações do ADM:", error); return; }
    if (!adminInfoList) return;
    if (!data || data.length === 0) {
        adminInfoList.innerHTML = '<li><p>Nenhuma informação no momento.</p></li>';
        return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    data.sort((a, b) => {
        const parseDate = (dateStr) => dateStr ? new Date(dateStr + 'T00:00:00') : null;
        const dateA = parseDate(a.due_date);
        const dateB = parseDate(b.due_date);
        const isAUpcomingExam = a.type === 'PROVA' && dateA && dateA >= today;
        const isBUpcomingExam = b.type === 'PROVA' && dateB && dateB >= today;
        if (isAUpcomingExam && !isBUpcomingExam) return -1;
        if (!isAUpcomingExam && isBUpcomingExam) return 1;
        if (isAUpcomingExam && isBUpcomingExam) return dateA - dateB;
        return 0;
    });
    adminInfoList.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        let content = `<strong>${item.title}</strong>`;
        if (item.description) content += `<p>${item.description}</p>`;
        if (item.type === 'PROVA' && item.due_date) content += `<p>Data: ${new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>`;
        if (item.type === 'LINK' && item.link_url) content += `<a href="${item.link_url}" target="_blank" rel="noopener noreferrer">Acessar Link</a>`;
        li.innerHTML = content;
        adminInfoList.appendChild(li);
    });
}


function renderDashboard() {
    updateTimeProgress();
    const level = Math.floor((userState.xp || 0) / 100) + 1;
    const title = level >= 20 ? "CADETE VETERANO" : "CADETE NOVATO";
    const expForNextLevel = 100;
    const currentExp = (userState.xp || 0) % 100;
    playerLevelTitle.textContent = `NÍVEL ${level} - ${title}`;
    xpText.textContent = `EXP: ${currentExp} / ${expForNextLevel}`;
    xpBar.style.width = `${currentExp}%`;

    const today = new Date();
    today.setHours(0,0,0,0);
    const scheduled = (userState.missions || []).map(m => ({ date: new Date(m.date + 'T00:00:00'), text: m.name, type: 'Serviço' }));
    const dailies = (userState.quests || []).filter(q => !q.completed).map(q => ({ date: today, text: q.text, type: 'Diária' }));
    const allTasks = [...scheduled, ...dailies].filter(task => task.date >= today).sort((a, b) => a.date - b.date).slice(0, 4);
    
    dashboardMissionsList.innerHTML = '';
    if (allTasks.length > 0) {
        allTasks.forEach(task => {
            const dateStr = task.type === 'Serviço' ? task.date.toLocaleDateString('pt-BR') : 'Hoje';
            dashboardMissionsList.innerHTML += `<li><div><span>${task.text}</span><span class="task-type">(${task.type})</span></div><span>${dateStr}</span></li>`;
        });
    } else {
        dashboardMissionsList.innerHTML = '<li><span>Nenhuma missão futura agendada.</span></li>';
    }

    dashboardAchievementsList.innerHTML = '';
    const last3Achievements = (userState.achievements || []).slice(-3);
    if (last3Achievements.length > 0) {
        last3Achievements.forEach(key => {
            const ach = achievementsData[key];
            if (ach) dashboardAchievementsList.innerHTML += `<div class="achievement-icon" title="${ach.name}">${ach.icon}</div>`;
        });
    } else {
         dashboardAchievementsList.innerHTML = `<div class="achievement-icon locked" title="Nenhuma conquista desbloqueada">?</div>`;
    }
    updateMajorCounter();
}

function updateTimeProgress() {
    const today = new Date();
    const graduationDate = new Date('2026-05-26T00:00:00');
    const totalDays = 365;
    const daysLeft = Math.ceil((graduationDate - today) / (1000 * 60 * 60 * 24));
    daysLeftEl.textContent = daysLeft > 0 ? daysLeft : 0;
    const daysPassed = Math.max(0, Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24)));
    const percentage = Math.min(100, (daysPassed / totalDays) * 100);
    courseProgressBar.style.width = `${percentage}%`;
    coursePercentageEl.innerHTML = `<span>${percentage.toFixed(1)}%</span> do curso concluído`;
    checkAchievements('time_update', { percentage, days_left: daysLeft });
}

function renderGrades() {
    gradesContainer.innerHTML = '';
    subjectList.sort().forEach(subject => {
        const value = userState.grades[subject] || 0;
        gradesContainer.innerHTML += `<div class="grade-item"><span class="grade-item-label" title="${subject}">${subject}</span><input type="number" class="grade-item-input" data-subject="${subject}" value="${value}" min="0" max="10" step="0.1"></div>`;
    });
    updateGradesAverage(false);
}
function handleGradeChange(e) {
    const subject = e.target.dataset.subject;
    const nota = parseFloat(e.target.value);
    if (subject && !isNaN(nota)) {
        userState.grades[subject] = Math.max(0, Math.min(10, nota));
    }
}
async function updateGradesAverage(save = true) {
    const grades = Object.values(userState.grades).filter(g => typeof g === 'number' && g > 0);
    let average = 0;
    const filledCount = grades.length;
    const totalCount = subjectList.length;
    if (filledCount > 0) {
        average = grades.reduce((sum, g) => sum + g, 0) / filledCount;
    }
    gradesProgressCounter.innerHTML = `<span>${filledCount}</span> / ${totalCount} matérias preenchidas (${((filledCount / totalCount) * 100).toFixed(1)}%)`;
    avgGradeEl.innerHTML = `MÉDIA GERAL: <span>${average > 0 ? average.toFixed(2) : 'N/A'}</span>`;
    checkAchievements('avg_update', average);
    
    if(save){
        await saveUserData();
        const { data: { user } } = await sb.auth.getUser();
        if(user) await sb.from('profiles').update({ grades_average: average }).eq('id', user.id);
    }
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
    checkAchievements('save_schedule');
}

function initCalendar() {
    if (calendarInstance) { calendarInstance.destroy(); }
    calendarInstance = new FullCalendar.Calendar(calendarContainer, {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' },
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana' },
        events: getCalendarEvents(),
        dateClick: function(info) {
            const missionsForDay = (userState.missions || []).filter(m => m.date === info.dateStr);
            if (missionsForDay.length > 0) {
                detailModalTitle.textContent = `Serviços para ${info.date.toLocaleDateString('pt-BR')}`;
                detailModalBody.innerHTML = '<ul>' + missionsForDay.map(m => `<li>${m.name}</li>`).join('') + '</ul>';
                detailModal.classList.remove('hidden');
            }
        }
    });
    calendarInstance.render();
}
function getCalendarEvents() {
    const events = [
        { title: 'Início do Curso', start: '2025-05-26', color: 'var(--sl-success)'}, 
        { title: 'Fim do Curso', start: '2026-05-26', color: 'var(--sl-success)'}
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
    const { data, error } = await sb.from('profiles').select('full_name, user_data, grades_average').eq('show_in_ranking', true).order('grades_average', { ascending: false }).limit(50);
    if (error) { rankingList.innerHTML = '<p style="color: var(--sl-error);">Não foi possível carregar o ranking.</p>'; console.error(error); return; }
    if (!data || data.length === 0) { rankingList.innerHTML = '<p>Ninguém no ranking ainda ou todos estão privados.</p>'; return; }
    rankingList.innerHTML = '';
    data.forEach((profile, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        const avatarSrc = profile.user_data?.avatar || 'https://i.imgur.com/K3wY2mn.png';
        item.innerHTML = `<div class="ranking-pos">${index + 1}</div><img class="ranking-avatar" src="${avatarSrc}"><div class="ranking-info"><div class="ranking-name">${profile.full_name || 'Anônimo'}</div></div><div class="ranking-avg">${profile.grades_average ? profile.grades_average.toFixed(2) : '0.00'}</div>`;
        rankingList.appendChild(item);
    });
}

function renderAchievements() {
    achievementsGrid.innerHTML = '';
    for (const key in achievementsData) {
        const ach = achievementsData[key];
        const unlocked = (userState.achievements || []).includes(key);
        achievementsGrid.innerHTML += `<div class="achievement" data-key="${key}" title="Clique para ver detalhes"><div class="achievement-icon ${unlocked ? 'unlocked' : ''}">${ach.icon}</div><div class="achievement-title">${ach.name}</div></div>`;
    }
}
function checkAchievements(eventType, data) {
    if (!userState.achievements) userState.achievements = [];
    let stateChanged = false;
    for (const key in achievementsData) {
        if (!userState.achievements.includes(key) && achievementsData[key].condition(userState, eventType, data)) {
            userState.achievements.push(key);
            stateChanged = true;
        }
    }
    if(stateChanged) {
        saveUserData();
        renderAchievements();
        renderDashboard();
    }
}

function addXp(amount) {
    if (!userState.xp) userState.xp = 0;
    userState.xp += amount;
    checkAchievements();
    saveUserData();
    renderDashboard();
}

function renderQuests() {
    questsList.innerHTML = '';
    if (!userState.quests) return;
    userState.quests.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = `list-item quest-item ${q.completed ? 'completed' : ''}`;
        item.innerHTML = `<label><input type="checkbox" data-index="${index}" ${q.completed ? 'checked' : ''}> <span>${q.text}</span></label><span class="quest-xp">${q.xp} XP</span>`;
        questsList.appendChild(item);
    });
}
function addQuest(e) {
    e.preventDefault();
    const text = questTextInput.value.trim(), difficulty = questDifficultySelect.value;
    if (!text) return;
    const xpMap = { easy: 10, medium: 50, hard: 100 };
    const newQuest = { text, difficulty, xp: xpMap[difficulty], completed: false };
    if (!userState.quests) userState.quests = [];
    userState.quests.push(newQuest);
    addQuestForm.reset();
    saveUserData();
    renderQuests();
}
function handleQuestInteraction(e) {
    if (e.target.type !== 'checkbox') return;
    const index = e.target.dataset.index;
    const quest = userState.quests[index];
    if (!quest || !e.target.checked) return;
    if(!quest.completed) {
        quest.completed = true;
        addXp(quest.xp);
        checkAchievements('complete_quest', quest);
        saveUserData();
    }
    e.target.closest('.quest-item').classList.add('completed');
}
function clearCompletedQuests() {
    if (!userState.quests) return;
    userState.quests = userState.quests.filter(q => !q.completed);
    saveUserData();
    renderQuests();
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
        checkAchievements('add_mission', {date});
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
        checkAchievements('add_link');
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

async function renderDisciplinePage() {
    if (userState.moral === undefined) userState.moral = 100;
    moralBar.style.width = `${userState.moral}%`;
    moralText.textContent = `${userState.moral.toFixed(0)}%`;
    if (userState.moral < 30) moralBar.style.backgroundColor = 'var(--sl-error)';
    else if (userState.moral < 70) moralBar.style.backgroundColor = '#FFD700';
    else moralBar.style.backgroundColor = 'var(--sl-success)';
    
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    
    const { data, error } = await sb.from('discipline_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar histórico disciplinar:', error); return; }
    disciplineLogList.innerHTML = '';
    if (data.length > 0) {
        data.forEach(log => {
            const item = document.createElement('div');
            item.className = 'list-item';
            const eventDate = new Date(log.created_at).toLocaleDateString('pt-BR');
            const eventName = log.event_type.replace(/_/g, ' ').replace('PUNIÇÃO', 'Punição');
            let details = log.reason ? `<p class="log-reason">Motivo: ${log.reason}</p>` : '';
            if (log.sei_number) details += `<p class="log-reason">SEI: ${log.sei_number}</p>`;
            if (log.completion_date) details += `<p class="log-reason">Cumprimento: ${new Date(log.completion_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>`;

            item.innerHTML = `<div class="log-header"><span class="log-type-${log.event_type}">${eventName}</span><span>${eventDate}</span></div>${details}`;
            disciplineLogList.appendChild(item);
        });
    } else {
        disciplineLogList.innerHTML = '<p>Nenhum evento disciplinar registrado.</p>';
    }
}

async function handleDisciplineEvent(e) {
    e.preventDefault();
    const eventType = disciplineEventType.value;
    const reason = disciplineReasonInput.value.trim();
    const sei = disciplineSeiInput.value.trim();
    const completionDate = disciplineCompletionDateInput.value;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    
    const points = { 'ELOGIO': 3, 'PUNIÇÃO_LEVE': -2, 'PUNIÇÃO_MEDIA': -3, 'PUNIÇÃO_GRAVE': -5, 'EXTRACLASSE': 0 };
    
    if (userState.moral === undefined) userState.moral = 100;
    userState.moral = Math.max(0, Math.min(100, userState.moral + points[eventType]));
    
    let updatePayload = {};
    if (eventType !== 'ELOGIO') {
        const todayStr = new Date().toISOString().split('T')[0];
        updatePayload.last_punishment_date = todayStr;
    }

    await sb.from('profiles').update(updatePayload).eq('id', user.id);
    await sb.from('discipline_log').insert({ event_type: eventType, reason, sei_number: sei, completion_date: completionDate || null });

    if (eventType === 'ELOGIO') checkAchievements('add_elogio');

    addDisciplineEventForm.reset();
    disciplineCompletionDateInput.classList.add('hidden');
    saveUserData();
    renderDisciplinePage();
    renderDashboard();
}

async function updateMajorCounter() {
    const today = new Date();
    today.setHours(0,0,0,0);
    let daysWithoutPunishment;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    
    const { data } = await sb.from('profiles').select('last_punishment_date').eq('id', user.id).single();
    if (data && data.last_punishment_date) {
        const lastPunishment = new Date(data.last_punishment_date);
        daysWithoutPunishment = Math.floor((today - lastPunishment) / (1000 * 60 * 60 * 24));
    } else {
        daysWithoutPunishment = Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24));
    }
    majorDaysCounter.textContent = daysWithoutPunishment >= 0 ? daysWithoutPunishment : 0;
    checkAchievements('time_update', { days_without_punishment: daysWithoutPunishment });
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
    if (targetPageId === 'page-discipline') renderDisciplinePage();
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loginButton.addEventListener('click', handleLogin);
    signupButton.addEventListener('click', handleSignUp);
    logoutButton.addEventListener('click', handleLogout);
    sidebarNav.addEventListener('click', handlePageNavigation);
    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); loginContainer.classList.add('hidden'); signupContainer.classList.remove('hidden'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); signupContainer.classList.add('hidden'); loginContainer.classList.remove('hidden'); });
    
    gradesContainer.addEventListener('click', (e) => {
        const label = e.target.closest('.grade-item-label');
        if (label) {
            detailModalTitle.textContent = "Nome da Matéria";
            detailModalBody.textContent = label.getAttribute('title');
            detailModal.classList.remove('hidden');
        }
    });
    saveGradesButton.addEventListener('click', () => {
        document.querySelectorAll('#grades-container .grade-item-input').forEach(input => {
            handleGradeChange({ target: input });
        });
        saveUserData().then(() => {
            updateGradesAverage(true);
            saveGradesButton.textContent = 'Salvo!';
            setTimeout(() => { saveGradesButton.textContent = 'Salvar Alterações'; }, 1500);
        });
    });
    gradeSearchInput.addEventListener('input', () => {
        const searchTerm = gradeSearchInput.value.toLowerCase();
        document.querySelectorAll('#grades-container .grade-item').forEach(item => {
            const subjectName = item.querySelector('.grade-item-label').getAttribute('title').toLowerCase();
            item.style.display = subjectName.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    qtsScheduleContainer.addEventListener('change', handleQTSInput);
    addMissionForm.addEventListener('submit', addCustomMission);
    scheduledMissionsList.addEventListener('click', (e) => { if(e.target.tagName === 'BUTTON') { userState.missions.splice(e.target.dataset.index, 1); saveUserData(); renderScheduledMissions(); if(calendarInstance) calendarInstance.refetchEvents(); } });
    addReminderButton.addEventListener('click', addReminder);
    remindersList.addEventListener('click', handleReminderInteraction);
    addLinkForm.addEventListener('submit', addLink);
    linksList.addEventListener('click', handleLinkInteraction);
    uploadAvatarButton.addEventListener('click', () => uploadAvatarInput.click());
    uploadAvatarInput.addEventListener('change', (event) => { if (event.target.files[0]) uploadAvatar(event.target.files[0]); });
    addQuestForm.addEventListener('submit', addQuest);
    questsList.addEventListener('change', handleQuestInteraction);
    clearCompletedQuestsButton.addEventListener('click', clearCompletedQuests);
    
    achievementsWidget.addEventListener('click', () => {
        renderAchievements();
        achievementsModal.classList.remove('hidden');
    });
    achievementsModalClose.addEventListener('click', () => achievementsModal.classList.add('hidden'));
    achievementsModal.addEventListener('click', (e) => { if (e.target === achievementsModal) achievementsModal.classList.add('hidden'); });
    
    hamburgerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('hidden');
    });
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.add('hidden');
    });

    detailModalClose.addEventListener('click', () => detailModal.classList.add('hidden'));
    detailModal.addEventListener('click', (e) => { if (e.target === detailModal) detailModal.classList.add('hidden'); });
    achievementsGrid.addEventListener('click', (e) => {
        const achievementElement = e.target.closest('.achievement');
        if (!achievementElement) return;
        const key = achievementElement.dataset.key;
        const achData = achievementsData[key];
        if (achData) {
            detailModalTitle.textContent = `${achData.icon} ${achData.name}`;
            detailModalBody.textContent = achData.description;
            detailModal.classList.remove('hidden');
        }
    });
    rankingToggle.addEventListener('change', async () => {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        const { error } = await sb.from('profiles').update({ show_in_ranking: rankingToggle.checked }).eq('id', user.id);
        if (error) alert("Não foi possível salvar sua preferência de privacidade.");
    });
    addDisciplineEventForm.addEventListener('submit', handleDisciplineEvent);
    disciplineEventType.addEventListener('change', (e) => {
        if (e.target.value === 'EXTRACLASSE') {
            disciplineCompletionDateInput.classList.remove('hidden');
        } else {
            disciplineCompletionDateInput.classList.add('hidden');
        }
    });
});
