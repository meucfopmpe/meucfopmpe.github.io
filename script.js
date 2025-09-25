document.addEventListener('DOMContentLoaded', () => {
    // --- CONEXÃO COM O SUPABASE ---
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
        loginModal: document.getElementById('login-modal'), loginForm: document.getElementById('login-form'), loginNumericaInput: document.getElementById('login-numerica'), loginPasswordInput: document.getElementById('login-password'), loginError: document.getElementById('login-error'),
        signupForm: document.getElementById('signup-form'), signupPasswordInput: document.getElementById('signup-password'), signupGuerraInput: document.getElementById('signup-guerra'), signupPelotaoInput: document.getElementById('signup-pelotao'), signupNumericaInput: document.getElementById('signup-numerica'), signupError: document.getElementById('signup-error'),
        authContainer: document.getElementById('auth-container'), showLoginBtn: document.getElementById('show-login-btn'), showSignupBtn: document.getElementById('show-signup-btn'),
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
    
    // --- LÓGICA DE LOGIN E SETUP ---
    // --- LÓGICA DE AUTENTICAÇÃO E SETUP ---

// Função chamada quando o formulário de LOGIN é enviado
async function handleLogin(e) {
    e.preventDefault();
    ui.loginError.textContent = ''; // Limpa mensagens de erro antigas
    const numerica = ui.loginNumericaInput.value;
    const password = ui.loginPasswordInput.value;
    // Geramos o email falso a partir da numérica para autenticar
    const email = `${numerica}@cfo.pmpe.br`;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        ui.loginError.textContent = `Erro: Numérica ou senha inválidos.`;
        return;
    }
    if (data.user) {
        await loadGameAndStart(data.user);
    }
}

// Função chamada quando o formulário de CRIAR CONTA é enviado
async function handleSignUp(e) {
    e.preventDefault();
    ui.signupError.textContent = ''; // Limpa mensagens de erro antigas
    const nomeDeGuerra = ui.signupGuerraInput.value.trim().toUpperCase();
    const pelotao = ui.signupPelotaoInput.value.trim();
    const numerica = ui.signupNumericaInput.value;
    const password = ui.signupPasswordInput.value;
    // Geramos o email falso a partir da numérica para o sistema de autenticação
    const email = `${numerica}@cfo.pmpe.br`;

    // 1. Cria o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
        ui.signupError.textContent = `Erro: ${authError.message}`;
        return;
    }

    if (authData.user) {
        // 2. Se a autenticação foi criada com sucesso, criamos o perfil no nosso banco de dados
        const startDate = new Date('2025-05-26T00:00:00');
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Prepara o objeto de dados do perfil inicial
        const initialProfileData = {
            id: authData.user.id, // A chave primária DEVE ser o ID do usuário autenticado
            nome_de_guerra: nomeDeGuerra,
            pelotao: pelotao,
            numerica: parseInt(numerica, 10),
            level: 1, // Começa sempre no nível 1
            title: "Aluno Novinho 🌱",
            profile_pic: null,
            grades_average: 0,
            full_data: createNewGameDataObject(nomeDeGuerra, pelotao, numerica) // Cria o objeto de jogo completo
        };

        // Insere o perfil na tabela 'profiles'
        const { error: profileError } = await supabase.from('profiles').insert([initialProfileData]);

        if (profileError) {
            ui.signupError.textContent = `Erro ao criar perfil no banco de dados: ${profileError.message}`;
            return;
        }

        // Carrega o jogo que acabamos de criar e inicia a aplicação
        await loadGameAndStart(authData.user);
    }
}

// Função para criar o objeto de jogo inicial
function createNewGameDataObject(nomeDeGuerra, pelotao, numerica) {
    const startDate = new Date('2025-05-26T00:00:00');
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    let newGame = { 
        player: { 
            nomeDeGuerra, pelotao, numerica, level: 1, exp: 0, title: "Aluno Novinho 🌱", 
            dailiesCompleted: 0, profilePic: null, 
            stats: { for: { level: 1, exp: 0 }, agi: { level: 1, exp: 0 }, vig: { level: 1, exp: 0 }, int: { level: 1, exp: 0 }, per: { level: 1, exp: 0 }, lid: { level: 1, exp: 0 } }, 
            achievements: [] 
        }, 
        time: { startDate: startDate.toISOString(), currentDate: currentDate.toISOString(), goals: [] }, 
        missions: { custom: [], activeMain: null, nextMainIn: 15, quickQuestsToday: [] }, 
        reminders: [], 
        grades: {}, 
        links: [], 
        qts_schedule: null 
    };
    subjectList.forEach(subject => { newGame.grades[subject] = { nota: 0 }; });
    return newGame;
}


// --- FUNÇÕES DE APOIO E PONTO DE ENTRADA ---

// Função auxiliar para carregar os dados e iniciar o jogo
async function loadGameAndStart(user) {
    await loadGame(user.id);
    if (game && game.player) {
        startGame(user);
    } else {
        // Isso pode acontecer se o usuário foi criado na autenticação, mas a criação do perfil no DB falhou
        console.error("Usuário autenticado, mas perfil não encontrado no banco de dados.");
        ui.loginError.textContent = "Erro ao carregar perfil. Tente novamente ou crie uma nova conta.";
        await supabase.auth.signOut(); // Desloga para evitar um loop de erros
    }
}

// Função para esconder a tela de login e iniciar a interface principal do jogo
function startGame(user) {
    ui.authContainer.classList.add('hidden');
    ui.gameContainer.classList.remove('hidden');
    initGameUI(user);
}

// O PONTO DE ENTRADA PRINCIPAL da aplicação. É chamado quando a página carrega.
async function main() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Se o usuário já está logado (sessão ativa), carrega o jogo dele
        await loadGameAndStart(session.user);
    } else {
        // Se não há ninguém logado, mostra a tela de autenticação
        ui.authContainer.classList.remove('hidden');

        // Adiciona os listeners para alternar entre os formulários de login e cadastro
        ui.showLoginBtn.addEventListener('click', () => {
            ui.showLoginBtn.classList.add('active');
            ui.showSignupBtn.classList.remove('active');
            ui.loginForm.classList.remove('hidden');
            ui.signupForm.classList.add('hidden');
        });
        ui.showSignupBtn.addEventListener('click', () => {
            ui.showSignupBtn.classList.add('active');
            ui.showLoginBtn.classList.remove('active');
            ui.signupForm.classList.remove('hidden');
            ui.loginForm.classList.add('hidden');
        });

        // Adiciona os listeners para os botões de submit de cada formulário
        ui.loginForm.addEventListener('submit', handleLogin);
        ui.signupForm.addEventListener('submit', handleSignUp);
    }
}

// Chama a função principal para iniciar todo o fluxo
main();
    // --- PONTO DE ENTRADA ---
    // ...
});
