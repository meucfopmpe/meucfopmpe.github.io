document.addEventListener('DOMContentLoaded', () => {
    // --- CONEXÃO COM O SUPABASE ---
    // USE AS CREDENCIAIS QUE VOCÊ PEGOU NO SEU PAINEL SUPABASE
    const supabaseUrl = 'https://svijubigtigsrpfqzcgf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k3Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    // ---------------------------------

    // --- CONFIGURAÇÕES E ESTADO INICIAL ---
    const config = {
        TOTAL_COURSE_DAYS: 365,
        BASE_EXP_TO_LEVEL: 100, LEVEL_EXP_MULTIPLIER: 1.2,
        STAT_EXP_TO_LEVEL: 50, STAT_EXP_MULTIPLIER: 1.1,
        DAILY_TASK_REWARDS: { main_exp: 20, stats_exp: { for: 10, agi: 10, vig: 15, int: 5, per: 5, lid: 5 } },
        QUICK_QUEST_CHANCE: 0.5
    };
    let game = {};
    let calendarInstance;
    let calendarInitialized = false;

    // --- BANCO DE DADOS (constantes) ---
    const quickQuestPool = [
        { text: "Fazer 50 flexões.", reward: { stats_exp: { for: 5, vig: 5 } } },
        { text: "Fazer 10 barras.", reward: { stats_exp: { for: 8 } } },
        { text: "Estudar 15min no Duolingo.", reward: { stats_exp: { int: 8 } } },
        { text: "Fazer 50 abdominais.", reward: { stats_exp: { vig: 10 } } },
        { text: "Polir o coturno por 5 minutos.", reward: { stats_exp: { per: 5 } } }
    ];
    const mainQuestPool = [
        { name: "Semana de Provas", duration: 5, reward: { main_exp: 300, stats_exp: { int: 100 } }, description: "Dedique-se aos estudos para as avaliações parciais." },
        { name: "Instrução de Tiro Avançado", duration: 3, reward: { main_exp: 250, stats_exp: { per: 80 } }, description: "Aprimore sua precisão e manejo com armamento." },
        { name: "Preparação para Desfile", duration: 7, reward: { main_exp: 200, stats_exp: { agi: 50, lid: 50 } }, description: "Treine ordem unida para uma apresentação impecável." }
    ];
    const titleUnlocks = [
        { level: 50, title: "Cadete de Brigada 🦅" }, { level: 25, title: "Cadete Raso ⭐" },
        { level: 10, title: "Bizurado 🧠" }, { level: 1,  title: "Aluno Novinho 🌱" }
    ];
    const achievementsData = {
        LEVEL_5: { name: "Recruta", icon: "🔰", description: "Alcance o Nível 5.", condition: () => game.player.level >= 5 },
        FIRST_REMINDER: { name: "Organizado", icon: "📝", description: "Adicione seu primeiro lembrete.", condition: (type) => type === 'add_reminder' },
        FIRST_GRADE: { name: "Estudante", icon: "📖", description: "Adicione sua primeira nota.", condition: (type) => type === 'add_grade' },
        TEN_DAILIES: { name: "Rotineiro", icon: "🔁", description: "Complete 10 missões diárias.", condition: () => game.player.dailiesCompleted >= 10 },
        FIRST_SERVICE: { name: "Primeiro Serviço", icon: "🛡️", description: "Complete seu primeiro serviço agendado.", condition: (type) => type === 'custom_mission_complete' },
        LEVEL_20: { name: "Veterano", icon: "🎖️", description: "Alcance o Nível 20.", condition: () => game.player.level >= 20 },
        STAT_LVL_15: { name: "Especialista", icon: "🎯", description: "Eleve qualquer habilidade para o Nível 15.", condition: () => Object.values(game.player.stats).some(s => s.level >= 15) },
        FIVE_SERVICES: { name: "Sempre Presente", icon: "📅", description: "Complete 5 serviços agendados.", condition: () => game.missions.custom.filter(m => m.completed).length >= 5 },
        WEEK_OF_PROOFS: { name: "Sobrevivente", icon: "🧠", description: "Conclua a missão 'Semana de Provas'.", condition: (type, data) => type === 'main_mission_complete' && data.name.includes('Provas') },
        AVG_EIGHT: { name: "Aluno Acima da Média", icon: "📈", description: "Alcance uma média geral de 8.0 ou mais.", condition: (type) => type === 'avg_update' && calculateGradesAverage() >= 8 },
        LEVEL_40: { name: "Elite", icon: "💀", description: "Alcance o Nível 40.", condition: () => game.player.level >= 40 },
        STAT_LVL_30: { name: "Mestre", icon: "🏆", description: "Eleve qualquer habilidade para o Nível 30.", condition: () => Object.values(game.player.stats).some(s => s.level >= 30) },
        TWENTYFIVE_SERVICES: { name: "Pilar da Academia", icon: "🏛️", description: "Complete 25 serviços agendados.", condition: () => game.missions.custom.filter(m => m.completed).length >= 25 },
        AVG_NINE_FIVE: { name: "Intelecto Superior", icon: "💡", description: "Alcance uma média geral de 9.5 ou mais.", condition: (type) => type === 'avg_update' && calculateGradesAverage() >= 9.5 },
        COURSE_COMPLETE: { name: "Oficial Formado", icon: "🎓", description: "Conclua os 365 dias do curso.", condition: (type) => type === 'course_complete' },
    };
    const subjectList = ["Sistema de Segurança Pública", "Teoria Geral da Administração", "Gestão Pública Geral Aplicada", "Gestão de Pessoas, Comando e Liderança", "Gestão de Logística, Orçamento e Finanças Públicas", "Fundamentos da Polícia Comunitária", "Psicologia Aplicada", "Análise Criminal e Estatística", "Qualidade do Atendimento aos Grupos Vulneráveis", "Direitos Humanos Aplicados à Atividade Policial Militar", "Gerenciamento de Crises", "Saúde Mental e Qualidade de Vida", "Treinamento Físico Militar I", "Treinamento Físico Militar II", "Gestão de Processos no Sistema Eletrônico", "Tecnologia da Informação e Comunicação", "Comunicação, Mídias Sociais e Cerimonial Militar", "Inteligência e Sistema de Informação", "Ética, Cidadania e Relações Interpessoais", "Ordem Unida I", "Ordem Unida II", "Instrução Geral", "Defesa Pessoal Policial I", "Defesa Pessoal Policial II", "Uso Diferenciado da Força", "Pronto Socorrismo", "Atendimento Pré-Hospitalar Tático", "Planejamento Operacional e Especializado", "Elaboração de Projetos e Captação de Recursos", "Planejamento Estratégico", "Gestão Por Resultados e Avaliação de Políticas Públicas", "Trabalho de Comando e Estado Maior", "Polícia Judiciária Militar", "Direito Administrativo Disciplinar Militar", "Direito Penal e Processual Penal Militar", "Legislação Policial Militar e Organizacional", "Procedimento em Ocorrência", "Economia Aplicada ao Setor Público", "História da PMPE", "Abordagem a Pessoas", "Abordagem a Veículos", "Abordagem a Edificações", "Patrulhamento Urbano", "Armamento e Munição", "Tiro Policial", "Tiro Defensivo (Método Giraldi)", "Ações Básicas de Apoio Aéreo", "Manobras Acadêmicas I", "Manobras Acadêmicas II", "Metodologia da Pesquisa Científica", "Teoria e Prática do Ensino", "Trabalho de Conclusão de Curso"];
    const qtsTimes = ['08:00-09:40', '10:00-11:40', '13:40-15:20', '15:40-17:20', '17:30-19:10'];

    // --- SELETORES DE UI ---
    const ui = {
        loginModal: document.getElementById('login-modal'), loginForm: document.getElementById('login-form'), loginEmailInput: document.getElementById('login-email'), loginPasswordInput: document.getElementById('login-password'), loginError: document.getElementById('login-error'),
        signupForm: document.getElementById('signup-form'), signupEmailInput: document.getElementById('signup-email'), signupPasswordInput: document.getElementById('signup-password'), signupGuerraInput: document.getElementById('signup-guerra'), signupPelotaoInput: document.getElementById('signup-pelotao'), signupNumericaInput: document.getElementById('signup-numerica'), signupError: document.getElementById('signup-error'),
        authContainer: document.getElementById('auth-container'),
        eventDetailModal: document.getElementById('event-detail-modal'), eventDetailTitle: document.getElementById('event-detail-title'), eventDetailBody: document.getElementById('event-detail-body'), eventDetailCloseButton: document.getElementById('event-detail-close-button'),
        calendarContainer: document.getElementById('calendar'), gradesContainer: document.getElementById('grades-container'), gradesAverage: document.getElementById('grades-average'),
        setupModal: document.getElementById('setup-modal'), statsDetailModal: document.getElementById('stats-detail-modal'), statsDetailGrid: document.getElementById('stats-detail-grid'), statsDetailCloseButton: document.getElementById('stats-detail-close-button'),
        gameContainer: document.getElementById('game-container'), profilePic: document.getElementById('profile-pic'), uploadPicButton: document.getElementById('upload-pic-button'), uploadPicInput: document.getElementById('upload-pic-input'),
        playerName: document.getElementById('player-name'), level: document.getElementById('level'), playerTitle: document.getElementById('player-title'), expBar: document.getElementById('exp-bar'), expText: document.getElementById('exp-text'),
        logoutButton: document.getElementById('logout-button'),
        statsChart: document.getElementById('stats-chart'),
        coursePercentageLarge: document.getElementById('course-percentage-large'), courseDayDisplay: document.getElementById('course-day-display'), courseDaysRemaining: document.getElementById('course-days-remaining'), countdownDisplayContainer: document.getElementById('countdown-display-container'), goalList: document.getElementById('goal-list'),
        goalNameInput: document.getElementById('goal-name-input'), goalDateInput: document.getElementById('goal-date-input'), addGoalButton: document.getElementById('add-goal-button'),
        dailyQuestCheckbox: document.getElementById('daily-quest-checkbox'), dailyQuestLabel: document.getElementById('daily-quest-label'), passDayButton: document.getElementById('pass-day-button'),
        tabButtons: document.querySelectorAll('.tab-button'), tabs: document.querySelectorAll('.tab'), mainQuestDisplay: document.getElementById('tab-main'), 
        remindersList: document.getElementById('reminders-list'), reminderInput: document.getElementById('reminder-input'),
        addReminderButton: document.getElementById('add-reminder-button'), achievementsGrid: document.getElementById('achievements-grid'), addMissionForm: document.getElementById('add-mission-form'), missionNameInput: document.getElementById('mission-name-input'),
        missionDateInput: document.getElementById('mission-date-input'), scheduledMissionsList: document.getElementById('scheduled-missions-list'), logContent: document.getElementById('log-content'),
        linksList: document.getElementById('links-list'), addLinkForm: document.getElementById('add-link-form'), linkTitleInput: document.getElementById('link-title-input'), linkValueInput: document.getElementById('link-value-input'), linkTypeInput: document.getElementById('link-type-input'),
        qtsScheduleContainer: document.getElementById('qts-schedule-container'),
        rankingList: document.getElementById('ranking-list')
    };
    
    // --- LÓGICA DE AUTENTICAÇÃO E SETUP ---
    async function handleSignUp(e) {
        e.preventDefault();
        const email = ui.signupEmailInput.value;
        const password = ui.signupPasswordInput.value;
        const nomeDeGuerra = ui.signupGuerraInput.value.trim().toUpperCase();
        const pelotao = ui.signupPelotaoInput.value.trim();
        const numerica = parseInt(ui.signupNumericaInput.value, 10);
        
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            ui.signupError.textContent = `Erro: ${error.message}`;
            return;
        }
        
        if (data.user) {
            const startDate = new Date('2025-05-26T00:00:00');
            const currentDate = new Date();
            currentDate.setHours(0,0,0,0);
            
            const daysDone = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));

            game = {
                player: { nomeDeGuerra, pelotao, numerica, level: 1, exp: 0, title: "Aluno Novinho 🌱", dailiesCompleted: 0, profilePic: null, stats: { for: { level: 1, exp: 0 }, agi: { level: 1, exp: 0 }, vig: { level: 1, exp: 0 }, int: { level: 1, exp: 0 }, per: { level: 1, exp: 0 }, lid: { level: 1, exp: 0 } }, achievements: [] },
                time: { startDate: startDate.toISOString(), currentDate: currentDate.toISOString(), goals: [] },
                missions: { custom: [], activeMain: null, nextMainIn: 15, quickQuestsToday: [] },
                reminders: [], grades: {}, links: [], qts_schedule: null
            };
            subjectList.forEach(subject => { game.grades[subject] = { nota: 0 }; });
            calculateInitialState(daysDone);
            checkTitleUnlocks();
            generateQuickQuestsForToday();
            
            await saveGame(data.user.id);
            startGame(data.user);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = ui.loginEmailInput.value;
        const password = ui.loginPasswordInput.value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            ui.loginError.textContent = `Erro: ${error.message}`;
            return;
        }
        if (data.user) {
            await loadGame(data.user.id);
            startGame(data.user);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        location.reload();
    }

    // --- FUNÇÕES DE PERSISTÊNCIA (SAVE/LOAD) ---
    async function saveGame(userId) {
        if (!userId && !game.player.id) return;
        const currentUserId = userId || game.player.id;
        const avg = calculateGradesAverage();
        const dataToSave = {
            id: currentUserId,
            nome_de_guerra: game.player.nomeDeGuerra,
            pelotao: game.player.pelotao,
            numerica: game.player.numerica,
            level: game.player.level,
            title: game.player.title,
            profile_pic: game.player.profilePic,
            grades_average: avg,
            full_data: game // Salva o objeto de jogo completo no campo jsonb
        };
        const { error } = await supabase.from('profiles').upsert(dataToSave);
        if(error) console.error("Erro ao salvar:", error);
    }
    
    async function loadGame(userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) {
            console.error("Erro ao carregar perfil, pode não existir ainda.", error);
            return null; // Perfil ainda não existe
        }
        if (data && data.full_data) {
            game = data.full_data;
            // Atualiza os campos de acesso rápido e converte datas
            game.player.id = data.id;
            game.player.nomeDeGuerra = data.nome_de_guerra;
            game.player.pelotao = data.pelotao;
            game.player.numerica = data.numerica;
            game.player.profilePic = data.profile_pic;
            game.time.currentDate = new Date();
            game.time.startDate = new Date('2025-05-26T00:00:00');
        } else {
            return null; // Dados incompletos
        }
    }

    // --- LÓGICA DO JOGO ---
    const getExpToNextLevel = (level, base, multiplier) => Math.floor(base * Math.pow(multiplier, level - 1));
    const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let statsChartInstance;
    function logMessage(message, type = '') {const maxLogEntries = 100; const p = document.createElement('p'); p.innerHTML = `<strong>${formatDate(game.time.currentDate)}:</strong> ${message}`; if (type) p.classList.add(type); ui.logContent.prepend(p); while(ui.logContent.children.length > maxLogEntries) { ui.logContent.removeChild(ui.logContent.lastChild); }}
    function initChart() {if(statsChartInstance) {statsChartInstance.destroy();} try{ const ctx = ui.statsChart.getContext('2d'); statsChartInstance = new Chart(ctx, {type: 'radar', data: {labels: ['FOR', 'AGI', 'VIG', 'INT', 'PER', 'LID'], datasets: [{label: 'Nível de Habilidade', data: Object.values(game.player.stats).map(s => s.level), backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: 'rgba(0, 255, 255, 1)', pointBackgroundColor: 'rgba(0, 255, 255, 1)',}]}, options: {responsive: true, maintainAspectRatio: true, scales: {r: {angleLines: { color: 'rgba(255, 255, 255, 0.2)' }, grid: { color: 'rgba(255, 255, 255, 0.2)' }, pointLabels: { color: '#c9d1d9', font: { size: 14, family: 'Orbitron' } }, ticks: { display: false, stepSize: 5 }}}, plugins: { legend: { display: false } }}});} catch(e){console.error("Erro ao iniciar Chart.js", e); ui.statsChart.parentElement.innerHTML = "<p style='color:var(--danger-color)'>Erro ao carregar o gráfico.</p>";}}
    function updateChart() {if (!statsChartInstance) return; statsChartInstance.data.datasets[0].data = Object.values(game.player.stats).map(s => s.level); statsChartInstance.update();}
    function checkTitleUnlocks() {for (const unlock of titleUnlocks) {if (game.player.level >= unlock.level) {if (game.player.title !== unlock.title) {game.player.title = unlock.title; logMessage(`Promoção! Novo título: ${unlock.title}`, 'log-levelup');} return;}}}
    function showStatsDetailModal() {ui.statsDetailGrid.innerHTML = ''; const statLabels = { for: 'Força', agi: 'Agilidade', vig: 'Vigor', int: 'Intelecto', per: 'Percepção', lid: 'Liderança' }; for (const statKey in game.player.stats) {const stat = game.player.stats[statKey]; const expNeeded = getExpToNextLevel(stat.level, config.STAT_EXP_TO_LEVEL, config.STAT_EXP_MULTIPLIER); const progress = (stat.exp / expNeeded) * 100; const item = document.createElement('div'); item.className = 'stat-detail-item'; item.innerHTML = `<h4>${statLabels[statKey]} - Nível ${stat.level}</h4><div class="stat-detail-progress"><div class="stat-detail-bar" style="width: ${progress}%"></div></div><div class="stat-detail-text">EXP: ${stat.exp} / ${expNeeded}</div>`; ui.statsDetailGrid.appendChild(item);} ui.statsDetailModal.classList.remove('hidden');}
    function gainMainExp(amount, log=true) {if (!amount) return; game.player.exp += amount; if(log) logMessage(`Ganhou ${amount} EXP.`); let expNeeded = getExpToNextLevel(game.player.level, config.BASE_EXP_TO_LEVEL, config.LEVEL_EXP_MULTIPLIER); while (game.player.exp >= expNeeded) {game.player.level++; game.player.exp -= expNeeded; if(log) logMessage(`AVANÇOU PARA O NÍVEL ${game.player.level}!`, 'log-levelup'); checkTitleUnlocks(); expNeeded = getExpToNextLevel(game.player.level, config.BASE_EXP_TO_LEVEL, config.LEVEL_EXP_MULTIPLIER);}}
    function gainStatExp(stat, amount, log=true) {if (!amount) return; const statData = game.player.stats[stat]; statData.exp += amount; let expNeeded = getExpToNextLevel(statData.level, config.STAT_EXP_TO_LEVEL, config.STAT_EXP_MULTIPLIER); while (statData.exp >= expNeeded) {statData.level++; statData.exp -= expNeeded; const statName = stat.charAt(0).toUpperCase() + stat.slice(1); if(log) logMessage(`${statName} aumentou para o Nível ${statData.level}!`, 'log-statup'); gainMainExp(50, false); checkAchievements(); expNeeded = getExpToNextLevel(statData.level, config.STAT_EXP_TO_LEVEL, config.STAT_EXP_MULTIPLIER);}}
    function updateCountdown() { ui.goalList.innerHTML = ''; if(!game.time.goals) game.time.goals = []; game.time.goals.sort((a,b) => new Date(a.date) - new Date(b.date)); const upcomingGoals = game.time.goals.filter(g => new Date(g.date + 'T00:00:00') >= game.time.currentDate); let nextGoal = upcomingGoals[0]; if (!nextGoal) { ui.countdownDisplayContainer.innerHTML = `<div class="goal-header">PRÓXIMO OBJETIVO:</div><div class="countdown-text">Nenhum objetivo definido</div>`; return; } const daysLeft = Math.ceil((new Date(nextGoal.date + 'T00:00:00') - game.time.currentDate) / (1000 * 60 * 60 * 24)); ui.countdownDisplayContainer.innerHTML = `<div class="goal-header">PRÓXIMO OBJETIVO:</div><div class="countdown-text">${nextGoal.name} (${daysLeft} dias - ${formatDate(new Date(nextGoal.date+'T00:00:00'))})</div>`; upcomingGoals.slice(1).forEach(g => { const daysLeftForGoal = Math.ceil((new Date(g.date + 'T00:00:00') - game.time.currentDate) / (1000 * 60 * 60 * 24)); ui.goalList.innerHTML += `<div><span>${g.name} (${daysLeftForGoal} dias - ${formatDate(new Date(g.date+'T00:00:00'))})</span><button class="delete-goal-btn" data-name="${g.name}">X</button></div>`; }); }
    function updateAllUI() { const dayNumber = Math.floor((game.time.currentDate - game.time.startDate) / (1000 * 60 * 60 * 24)); const percentage = ((dayNumber / config.TOTAL_COURSE_DAYS) * 100); ui.playerName.textContent = game.player.nomeDeGuerra; ui.level.textContent = `NÍVEL ${game.player.level}`; ui.playerTitle.innerHTML = game.player.title; const expNeeded = getExpToNextLevel(game.player.level, config.BASE_EXP_TO_LEVEL, config.LEVEL_EXP_MULTIPLIER); ui.expText.textContent = `EXP: ${game.player.exp} / ${expNeeded}`; ui.expBar.style.width = `${(game.player.exp / expNeeded) * 100}%`; ui.coursePercentageLarge.textContent = `${percentage.toFixed(1)}%`; ui.courseDayDisplay.innerHTML = `Dia ${dayNumber} de ${config.TOTAL_COURSE_DAYS}<br><span id="course-days-remaining">${config.TOTAL_COURSE_DAYS - dayNumber} dias restantes</span>`; updateCountdown(); renderMissionForecast(); updateChart(); }
    function setupTabs() {ui.tabButtons.forEach(button => {button.addEventListener('click', () => {ui.tabButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); ui.tabs.forEach(tab => {tab.classList.remove('active'); if (tab.id === button.dataset.tab) {tab.classList.add('active'); if (tab.id === 'tab-calendario') {initCalendar();} if(tab.id === 'tab-ranking'){renderRanking();}}});});});}
    function setupAchievements() {ui.achievementsGrid.innerHTML = ''; for (const key in achievementsData) {const ach = achievementsData[key]; const div = document.createElement('div'); div.className = 'achievement'; div.title = ach.description; div.innerHTML = `<div class="achievement-icon" id="ach-${key}">${ach.icon}</div><div class="achievement-title">${ach.name}</div>`; ui.achievementsGrid.appendChild(div); if(game.player.achievements.includes(key)) {div.querySelector('.achievement-icon').classList.add('unlocked');}}}
    function checkAchievements(eventType = null, data = null) {for (const key in achievementsData) {if (!game.player.achievements.includes(key) && achievementsData[key].condition(eventType, data)) {game.player.achievements.push(key); const iconEl = document.getElementById(`ach-${key}`); if(iconEl) iconEl.classList.add('unlocked'); logMessage(`Conquista Desbloqueada: ${achievementsData[key].name}!`, 'log-levelup');}}}
    function addReminder() {const text = ui.reminderInput.value.trim(); if (text) {if(!game.reminders) game.reminders = []; game.reminders.push({ text: text, completed: false }); ui.reminderInput.value = ''; saveGame(); renderReminders(); checkAchievements('add_reminder');}}
    function handleReminderInteraction(e) {const index = e.target.dataset.index; if (index === undefined) return; if (e.target.type === 'checkbox') {game.reminders[index].completed = e.target.checked;} if (e.target.tagName === 'BUTTON') {game.reminders.splice(index, 1);} saveGame(); renderReminders();}
    function renderReminders() { ui.remindersList.innerHTML = ''; if(!game.reminders) game.reminders = []; game.reminders.forEach((reminder, index) => { const div = document.createElement('div'); div.className = 'reminder-item'; const label = document.createElement('label'); const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = reminder.completed; checkbox.dataset.index = index; const span = document.createElement('span'); span.textContent = reminder.text; if (reminder.completed) { span.classList.add('completed'); } label.appendChild(checkbox); label.appendChild(span); const deleteButton = document.createElement('button'); deleteButton.textContent = 'X'; deleteButton.dataset.index = index; div.appendChild(label); div.appendChild(deleteButton); ui.remindersList.appendChild(div); }); }
    function addCustomMission(e) {e.preventDefault(); const name = ui.missionNameInput.value.trim(); const date = ui.missionDateInput.value; if (name && date) {game.missions.custom.push({ name, date, completed: false }); ui.addMissionForm.reset(); saveGame(); renderScheduledMissions(); refreshCalendar();}}
    function renderScheduledMissions() {ui.scheduledMissionsList.innerHTML = ''; if(!game.missions.custom) game.missions.custom = []; game.missions.custom.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((m, index) => {const li = document.createElement('li'); li.innerHTML = `<span>${formatDate(new Date(m.date + 'T00:00:00'))} - ${m.name}</span><button class="delete-mission-btn" data-index="${index}">X</button>`; if (m.completed) {li.classList.add('completed');} ui.scheduledMissionsList.appendChild(li);});}
    function renderMissionForecast() { const forecastContainer = ui.mainQuestDisplay; forecastContainer.innerHTML = ''; const now = game.time.currentDate; const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + (6 - now.getDay())); const endOfNextWeek = new Date(endOfWeek); endOfNextWeek.setDate(endOfWeek.getDate() + 7); const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); const missions = [...game.missions.custom]; if(game.missions.activeMain){ let d = new Date(now); for(let i=0; i<game.missions.activeMain.duration; i++){ missions.push({name: `[Principal] ${game.missions.activeMain.name}`, date: d.toISOString().split('T')[0]}); d.setDate(d.getDate()+1); } } const categories = {'Hoje': [], 'Esta Semana': [], 'Próxima Semana': [], 'Este Mês': []}; if(game.missions.quickQuestsToday && game.missions.quickQuestsToday.length > 0){ const catDiv = document.createElement('div'); catDiv.className = 'forecast-category'; catDiv.id = "quick-quests-container"; catDiv.innerHTML = '<h4>⚡ Missões Diárias</h4>'; const ul = document.createElement('ul'); game.missions.quickQuestsToday.forEach((q, i) => { ul.innerHTML += `<li><label class="${q.completed ? 'completed' : ''}"><input type="checkbox" class="quick-quest-checkbox" data-index="${i}" ${q.completed ? 'checked' : ''}> <span>${q.text}</span></label></li>`; }); catDiv.appendChild(ul); forecastContainer.appendChild(catDiv); } for(const mission of missions){ const missionDate = new Date(mission.date + 'T00:00:00'); if(mission.completed) continue; const daysRemaining = Math.ceil((missionDate - now) / (1000 * 60 * 60 * 24)); if(daysRemaining < 0 || daysRemaining > 30) continue; const dateInfo = `(Faltam ${daysRemaining} dias - ${formatDate(missionDate)})`; if(missionDate.toDateString() === now.toDateString()) categories['Hoje'].push({...mission, dateInfo}); else if(missionDate > now && missionDate <= endOfWeek) categories['Esta Semana'].push({...mission, dateInfo}); else if(missionDate > endOfWeek && missionDate <= endOfNextWeek) categories['Próxima Semana'].push({...mission, dateInfo}); else if(missionDate > endOfNextWeek && missionDate <= endOfMonth) categories['Este Mês'].push({...mission, dateInfo}); } const missionForecastContainer = document.getElementById('mission-forecast-container'); if(missionForecastContainer) missionForecastContainer.innerHTML = ''; for(const category in categories){ if(categories[category].length > 0){ const catDiv = document.createElement('div'); catDiv.className = 'forecast-category'; catDiv.innerHTML = `<h4>${category}</h4>`; const ul = document.createElement('ul'); categories[category].sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(m => { ul.innerHTML += `<li>${m.name} <span>${m.dateInfo}</span></li>` }); catDiv.appendChild(ul); forecastContainer.appendChild(catDiv); } } if(forecastContainer.innerHTML === '') forecastContainer.innerHTML = '<h4>Nenhuma missão agendada para os próximos 30 dias.</h4>'; }
    function calculateInitialState(daysDone) {game.player.exp = 0; game.player.level = 1; game.player.dailiesCompleted = 0; for (const stat in game.player.stats) { game.player.stats[stat] = { level: 1, exp: 0 }; } if (daysDone <= 0) return; const dailyExp = config.DAILY_TASK_REWARDS; for(let i=0; i < daysDone; i++) {gainMainExp(dailyExp.main_exp * 0.8, false); for(const stat in dailyExp.stats_exp){gainStatExp(stat, dailyExp.stats_exp[stat] * 0.8, false);}} game.player.dailiesCompleted = daysDone; }
    function getCalendarEvents() { const events = []; if(game.missions.custom) game.missions.custom.forEach(mission => { events.push({ title: mission.name, start: mission.date, color: 'var(--warning-color)', extendedProps: { description: `Serviço agendado: ${mission.name}. ${mission.completed ? '(Concluído)' : ''}` } }); }); if (game.missions.activeMain) { let missionDate = new Date(game.time.currentDate); for(let i = 0; i < game.missions.activeMain.duration; i++) { events.push({ title: game.missions.activeMain.name, start: missionDate.toISOString().split('T')[0], color: 'var(--primary-color)', extendedProps: { description: `Missão em andamento: ${game.missions.activeMain.description}` } }); missionDate.setDate(missionDate.getDate() + 1); } } const endDate = new Date(game.time.startDate); endDate.setDate(endDate.getDate() + config.TOTAL_COURSE_DAYS); events.push({ title: "🏁 Fim do Curso", start: endDate.toISOString().split('T')[0], color: 'var(--success-color)' }); events.push({ title: "▶️ Início do Curso", start: game.time.startDate.toISOString().split('T')[0], color: 'var(--success-color)' }); return events; }
    function initCalendar() { if (calendarInitialized) {refreshCalendar(); return;} calendarInstance = new FullCalendar.Calendar(ui.calendarContainer, { initialView: 'dayGridMonth', locale: 'pt-br', headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }, buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana' }, events: getCalendarEvents(), eventClick: (info) => { ui.eventDetailTitle.textContent = info.event.title; ui.eventDetailBody.textContent = info.event.extendedProps.description || `Evento em ${formatDate(info.event.start)}.`; ui.eventDetailModal.classList.remove('hidden'); }, dayCellClassNames: (arg) => { const cellDate = new Date(arg.date); cellDate.setHours(0,0,0,0); const gameCurrentDate = new Date(game.time.currentDate); gameCurrentDate.setHours(0,0,0,0); if(cellDate < gameCurrentDate) { return ['day-completed']; } return []; } }); calendarInstance.render(); calendarInitialized = true; }
    function refreshCalendar() { if (calendarInitialized) { calendarInstance.refetchEvents(); } }
    function renderGrades() { ui.gradesContainer.innerHTML = ''; Object.keys(game.grades).sort().forEach(subject => { const gradeInfo = game.grades[subject]; const item = document.createElement('div'); item.className = 'grade-item'; item.innerHTML = `<span class="grade-item-label" title="${subject}">${subject}</span><input type="number" class="grade-item-input" data-subject="${subject}" value="${gradeInfo.nota}" min="0" max="10" step="0.1">`; ui.gradesContainer.appendChild(item); }); updateGradesAverage(); }
    function handleGradeChange(e) { const subject = e.target.dataset.subject; const value = e.target.value; const nota = parseFloat(value); if (subject && value !== '' && !isNaN(nota)) { game.grades[subject].nota = Math.max(0, Math.min(10, nota)); if(nota > 0 && !game.player.achievements.includes('FIRST_GRADE')) checkAchievements('add_grade'); } else { game.grades[subject].nota = 0; } saveGame(); updateGradesAverage(); }
    function calculateGradesAverage() { const gradesWithValues = Object.values(game.grades).filter(g => g.nota > 0); if (gradesWithValues.length === 0) return 0; const sum = gradesWithValues.reduce((acc, g) => acc + g.nota, 0); return sum / gradesWithValues.length; }
    function updateGradesAverage() { const avg = calculateGradesAverage(); ui.gradesAverage.textContent = `Média Geral: ${avg > 0 ? avg.toFixed(2) : 'N/A'}`; checkAchievements('avg_update'); }
    async function passDay() {if (ui.dailyQuestCheckbox.checked) { game.player.dailiesCompleted = (game.player.dailiesCompleted || 0) + 1; checkAchievements('TEN_DAILIES'); gainMainExp(config.DAILY_TASK_REWARDS.main_exp); for (const stat in config.DAILY_TASK_REWARDS.stats_exp) { gainStatExp(stat, config.DAILY_TASK_REWARDS.stats_exp[stat]); }} else { logMessage("Você não completou o treinamento diário. Sem ganhos hoje.", "log-penalty"); } if (game.missions.activeMain) { game.missions.activeMain.duration--; if (game.missions.activeMain.duration <= 0) { const quest = game.missions.activeMain; logMessage(`Missão Principal "${quest.name}" concluída!`, 'log-mission'); gainMainExp(quest.reward.main_exp); for (const stat in quest.reward.stats_exp) { gainStatExp(stat, quest.reward.stats_exp[stat]); } checkAchievements('main_mission_complete', quest); game.missions.activeMain = null; game.missions.nextMainIn = Math.floor(Math.random() * 15) + 10; } } else { game.missions.nextMainIn--; if (game.missions.nextMainIn <= 0) { const questData = mainQuestPool[Math.floor(Math.random() * mainQuestPool.length)]; game.missions.activeMain = { ...questData }; logMessage(`Nova Missão Principal iniciada: ${game.missions.activeMain.name}`, 'log-mission'); } } const todayStr = game.time.currentDate.toISOString().split('T')[0]; game.missions.custom.filter(m => m.date === todayStr && !m.completed).forEach(mission => { logMessage(`Serviço de "${mission.name}" concluído!`, 'log-mission'); gainMainExp(200); gainStatExp('lid', 50); gainStatExp('per', 50); mission.completed = true; checkAchievements('custom_mission_complete'); }); game.time.currentDate.setDate(game.time.currentDate.getDate() + 1); generateQuickQuestsForToday(); const dayNumber = Math.floor((game.time.currentDate - game.time.startDate) / (1000 * 60 * 60 * 24)); if(dayNumber >= config.TOTAL_COURSE_DAYS) { checkAchievements('course_complete'); } ui.dailyQuestCheckbox.checked = false; ui.dailyQuestLabel.classList.remove('completed'); await saveGame(); updateAllUI(); refreshCalendar(); }
    function addLink() {const title = ui.linkTitleInput.value.trim(); let value = ui.linkValueInput.value.trim(); const type = ui.linkTypeInput.value; if(title && value) { if(type === 'link' && !(value.startsWith('http://') || value.startsWith('https://'))) { value = `https://${value}`; } game.links.push({title, value, type}); ui.addLinkForm.reset(); saveGame(); renderLinks(); } }
    function renderLinks() { ui.linksList.innerHTML = ''; if(!game.links) game.links = []; game.links.forEach((link, index) => { const div = document.createElement('div'); div.className = 'link-item'; let content; if(link.type === 'link') { content = `<a href="${link.value}" target="_blank" rel="noopener noreferrer">${link.title} 🔗</a><span>${link.value}</span>`; } else { content = `<div>${link.title} 📄</div><span>SEI: ${link.value}</span>`; } div.innerHTML = `<div class="link-item-info">${content}</div><button data-index="${index}">X</button>`; ui.linksList.appendChild(div); }); }
    function handleLinkInteraction(e) { if(e.target.tagName === 'BUTTON') { const index = e.target.dataset.index; if(index !== undefined) { game.links.splice(index, 1); saveGame(); renderLinks(); } } }
    function generateQuickQuestsForToday() { game.missions.quickQuestsToday = []; for(let i=0; i<3; i++){ if(Math.random() < config.QUICK_QUEST_CHANCE) { const quest = {...quickQuestPool[Math.floor(Math.random() * quickQuestPool.length)], completed: false}; game.missions.quickQuestsToday.push(quest); } } }
    function handleQuickQuestInteraction(e) { if(e.target.classList.contains('quick-quest-checkbox')) { const index = e.target.dataset.index; const quest = game.missions.quickQuestsToday[index]; if(e.target.checked && !quest.completed){ quest.completed = true; logMessage(`Missão rápida cumprida: ${quest.text}`, 'log-mission'); if (quest.reward.main_exp) gainMainExp(quest.reward.main_exp); if (quest.reward.stats_exp) { for(const stat in quest.reward.stats_exp) { gainStatExp(stat, quest.reward.stats_exp[stat]); } } saveGame(); renderMissionForecast(); } } }
    function addGoal() { const name = ui.goalNameInput.value.trim(); const date = ui.goalDateInput.value; if(name && date) { if(!game.time.goals) game.time.goals = []; game.time.goals.push({name, date}); ui.goalNameInput.value = ''; ui.goalDateInput.value = ''; saveGame(); updateCountdown(); } }
    function handleGoalInteraction(e) { if(e.target.classList.contains('delete-goal-btn')) { const name = e.target.dataset.name; if(confirm(`Tem certeza que deseja apagar o objetivo "${name}"?`)) { game.time.goals = game.time.goals.filter(g => g.name !== name); saveGame(); updateCountdown(); } } }
    function renderQTSSchedule() { const container = ui.qtsScheduleContainer; container.innerHTML = ''; if (!game.qts_schedule) { game.qts_schedule = {}; } const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']; container.innerHTML += `<div class="qts-cell qts-header"></div>`; days.forEach(day => container.innerHTML += `<div class="qts-cell qts-header">${day}</div>`); qtsTimes.forEach(time => { container.innerHTML += `<div class="qts-cell qts-header qts-time">${time}</div>`; days.forEach(day => { if(!game.qts_schedule[day]) game.qts_schedule[day] = {}; const materia = game.qts_schedule[day][time] || ''; container.innerHTML += `<div class="qts-cell"><input type="text" class="qts-input" data-day="${day}" data-time="${time}" value="${materia}"></div>`; }); }); }
    function handleQTSInput(e) { if(e.target.classList.contains('qts-input')) { const day = e.target.dataset.day; const time = e.target.dataset.time; game.qts_schedule[day][time] = e.target.value.trim().toUpperCase(); saveGame(); } }
    async function renderRanking() { ui.rankingList.innerHTML = 'Carregando ranking...'; const { data, error } = await supabase.from('profiles').select('nome_de_guerra, level, grades_average, profile_pic').order('grades_average', { ascending: false }).limit(50); if (error) { ui.rankingList.innerHTML = 'Não foi possível carregar o ranking.'; console.error(error); return; } ui.rankingList.innerHTML = ''; data.forEach((profile, index) => { const item = document.createElement('div'); item.className = 'ranking-item'; item.innerHTML = ` <div class="ranking-pos">${index + 1}</div> <img class="ranking-avatar" src="${profile.profile_pic || 'https://i.imgur.com/K3wY2mn.png'}"> <div class="ranking-info"> <div class="ranking-name">${profile.nome_de_guerra}</div> <div class="ranking-details">Nível ${profile.level}</div> </div> <div class="ranking-avg">${profile.grades_average.toFixed(2)}</div> `; ui.rankingList.appendChild(item); }); }

    function startGame(user) {
        ui.authContainer.classList.add('hidden');
        ui.gameContainer.classList.remove('hidden');
        initGameUI();
    }
    
    async function initGameUI() {
        if(!game || !game.player) {
            console.error("Dados do jogo não carregados. Voltando para o login.");
            location.reload();
            return;
        }
        setupTabs();
        setupAchievements();
        try { initChart(); } catch (error) { console.error("Falha ao iniciar o gráfico:", error); }
        renderGrades();
        renderReminders();
        renderScheduledMissions();
        renderLinks();
        renderQTSSchedule();
        if(game.time.goals) { updateCountdown(); }
        if(game.player.profilePic) { ui.profilePic.src = game.player.profilePic; } else { ui.profilePic.src = 'https://i.imgur.com/K3wY2mn.png'; }
        updateAllUI();
        
        ui.statsChart.addEventListener('click', showStatsDetailModal);
        ui.statsDetailCloseButton.addEventListener('click', () => ui.statsDetailModal.classList.add('hidden'));
        ui.eventDetailCloseButton.addEventListener('click', () => ui.eventDetailModal.classList.add('hidden'));
        ui.passDayButton.addEventListener('click', passDay);
        ui.uploadPicButton.addEventListener('click', () => ui.uploadPicInput.click());
        ui.uploadPicInput.addEventListener('change', (e) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = (event) => { const img = new Image(); img.onload = () => { const canvas = document.createElement('canvas'); const MAX_WIDTH = 200; const MAX_HEIGHT = 200; let width = img.width; let height = img.height; if(width > height){if(width > MAX_WIDTH){height *= MAX_WIDTH / width; width = MAX_WIDTH;}}else{if(height > MAX_HEIGHT){width *= MAX_HEIGHT / height; height = MAX_HEIGHT;}} canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); const dataUrl = canvas.toDataURL('image/jpeg', 0.9); if(dataUrl.length > 2 * 1024 * 1024) { alert('Erro: A imagem redimensionada ainda é muito grande. Tente uma imagem menor ou com menos detalhes.'); return; } ui.profilePic.src = dataUrl; game.player.profilePic = dataUrl; saveGame(); logMessage("Nova imagem de perfil salva."); }; img.onerror = () => { alert("Não foi possível carregar o arquivo de imagem. Tente um formato diferente (JPG, PNG)."); }; img.src = event.target.result; }; reader.onerror = () => { alert("Falha ao ler o arquivo.");}; reader.readAsDataURL(file); } });
        ui.dailyQuestCheckbox.addEventListener('change', () => { ui.dailyQuestLabel.classList.toggle('completed', ui.dailyQuestCheckbox.checked); });
        ui.addReminderButton.addEventListener('click', addReminder);
        ui.remindersList.addEventListener('click', handleReminderInteraction);
        ui.addMissionForm.addEventListener('submit', addCustomMission);
        ui.scheduledMissionsList.addEventListener('click', (e) => { if(e.target.classList.contains('delete-mission-btn')) { const index = e.target.dataset.index; if(confirm('Tem certeza que deseja apagar esta escala?')){ game.missions.custom.splice(index, 1); saveGame(); renderScheduledMissions(); refreshCalendar(); } }});
        ui.gradesContainer.addEventListener('change', handleGradeChange);
        ui.addLinkForm.addEventListener('submit', (e) => { e.preventDefault(); addLink(); });
        ui.linksList.addEventListener('click', handleLinkInteraction);
        ui.addGoalButton.addEventListener('click', addGoal);
        ui.goalList.addEventListener('click', handleGoalInteraction);
        ui.qtsScheduleContainer.addEventListener('change', handleQTSInput);
        ui.mainQuestDisplay.addEventListener('click', handleQuickQuestInteraction);
        ui.profilePic.addEventListener('contextmenu', e => e.preventDefault());
        ui.logoutButton.addEventListener('click', handleLogout);
    }
    
    // --- PONTO DE ENTRADA ---
    async function main() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await loadGame(session.user.id);
            if (game && game.player) {
                startGame(session.user);
            } else {
                // Perfil não existe no DB, força a criação
                ui.loginModal.classList.add('hidden');
                ui.setupModal.classList.remove('hidden');
                ui.guerraInput.value = "NOME_DE_GUERRA_PADRAO"; // Pode pedir pro usuário preencher
                ui.setupForm.addEventListener('submit', handleSetup);
            }
        } else {
            ui.authContainer.classList.remove('hidden');
            ui.loginForm.addEventListener('submit', handleLogin);
            ui.signupForm.addEventListener('submit', handleSignUp);
        }
    }

    main();
});
