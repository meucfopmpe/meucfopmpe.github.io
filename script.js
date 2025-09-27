document.addEventListener('DOMContentLoaded', () => {
    // --- CONEXÃO COM O SUPABASE ---
    const supabaseUrl = 'https://svijubigtigsrpfqzcgf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k3Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    // ---------------------------------

    // --- CONFIGURAÇÕES E ESTADO INICIAL ---
    const config = {
        COURSE_START_DATE: '2025-05-26T00:00:00',
        TOTAL_COURSE_DAYS: 365,
        BASE_EXP_TO_LEVEL: 100,
        LEVEL_EXP_MULTIPLIER: 1.2
    };
    let game = {};
    let userProfile = {};
    let calendarInstance;
    let calendarInitialized = false;
    const defaultAvatar = 'https://i.imgur.com/K3wY2mn.png';

    // --- BANCO DE DADOS (constantes) ---
    const quickQuestPool = [
        { text: "Fazer 50 flexões.", reward: { exp: 10 } },
        { text: "Fazer 10 barras.", reward: { exp: 15 } },
        { text: "Estudar 15min no Duolingo.", reward: { exp: 10 } },
        { text: "Fazer 50 abdominais.", reward: { exp: 8 } },
        { text: "Polir o coturno por 5 minutos.", reward: { exp: 5 } }
    ];
    const titleUnlocks = [
        { level: 50, title: "Lenda da Academia 💀" }, { level: 40, title: "Cadete de Brigada 🦅" },
        { level: 30, title: "Veterano 🎖️" }, { level: 25, title: "Cadete Antigo ⚔️" },
        { level: 20, title: "Cadete Raso ⭐⭐" }, { level: 15, title: "Cadete Moderno I ⭐" },
        { level: 10, title: "Cadete Moderno II" }, { level: 7, title: "Bizurado 🧠" },
        { level: 4, title: "Aluno Dedicado 🔰" }, { level: 1,  title: "Aluno Novinho 🌱" }
    ];
    
    // --- SELETORES DE UI ---
    const ui = {
        authContainer: document.getElementById('auth-container'),
        loginPanel: document.getElementById('login-panel'), 
        signupPanel: document.getElementById('signup-panel'),
        loginForm: document.getElementById('login-form'), 
        loginNumericaInput: document.getElementById('login-numerica'), 
        loginPasswordInput: document.getElementById('login-password'), 
        loginError: document.getElementById('login-error'),
        signupForm: document.getElementById('signup-form'), 
        signupPasswordInput: document.getElementById('signup-password'), 
        signupGuerraInput: document.getElementById('signup-guerra'), 
        signupPelotaoInput: document.getElementById('signup-pelotao'), 
        signupNumericaInput: document.getElementById('signup-numerica'), 
        signupError: document.getElementById('signup-error'),
        switchToSignupBtn: document.getElementById('switch-to-signup'),
        switchToLoginBtn: document.getElementById('switch-to-login'),
        
        gameContainer: document.getElementById('game-container'), 
        profilePic: document.getElementById('profile-pic'), 
        uploadPicButton: document.getElementById('upload-pic-button'), 
        uploadPicInput: document.getElementById('upload-pic-input'),
        playerName: document.getElementById('player-name'), 
        level: document.getElementById('level'), 
        playerTitle: document.getElementById('player-title'), 
        expBar: document.getElementById('exp-bar'), 
        expText: document.getElementById('exp-text'),
        logoutButton: document.getElementById('logout-button'),
        adminLink: document.getElementById('admin-link'),

        tabs: document.querySelectorAll('.tab'),
        tabButtons: document.querySelectorAll('.tab-button'),
        
        globalAnnouncementsContainer: document.getElementById('global-announcements-container'),
        dailyQuestsList: document.getElementById('daily-quests-list'),
        
        rankingList: document.getElementById('ranking-list'),
        
        calendar: document.getElementById('calendar'),
        
        muralFeed: document.getElementById('mural-feed'), 
        muralPostForm: document.getElementById('mural-post-form'), 
        muralInput: document.getElementById('mural-input'),

        profileCardModal: document.getElementById('profile-card-modal'),
        profileCardContent: document.getElementById('profile-card-content'),
        profileCardName: document.getElementById('profile-card-name'),
        profileCardDetails: document.getElementById('profile-card-details'),
        profileCardPic: document.getElementById('profile-card-pic'),
        profileCardLevel: document.getElementById('profile-card-level'),
        profileCardAverage: document.getElementById('profile-card-average'),
        profileCardPelotao: document.getElementById('profile-card-pelotao'),
        profileCardInstagram: document.getElementById('profile-card-instagram'),
        profileCardLikeButton: document.getElementById('profile-card-like-button'),
        profileCardCloseButton: document.getElementById('profile-card-close-button'),
    };

    // --- FUNÇÕES DE AUTENTICAÇÃO E SETUP ---
    async function handleLogin(e) {
        e.preventDefault();
        ui.loginError.textContent = '';
        const numerica = ui.loginNumericaInput.value;
        const password = ui.loginPasswordInput.value;
        const email = `${numerica}@cfo.pmpe.br`;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            ui.loginError.textContent = `Erro: Numérica ou senha inválidos.`;
            return;
        }
        if (data.user) {
            await loadProfileAndStart(data.user);
        }
    }

    async function handleSignUp(e) {
        e.preventDefault();
        ui.signupError.textContent = '';
        const nomeDeGuerra = ui.signupGuerraInput.value.trim().toUpperCase();
        const pelotao = ui.signupPelotaoInput.value.trim();
        const numerica = ui.signupNumericaInput.value;
        const password = ui.signupPasswordInput.value;
        if (password.length < 6) {
            ui.signupError.textContent = 'Erro: A senha precisa ter no mínimo 6 caracteres.';
            return;
        }
        const email = `${numerica}@cfo.pmpe.br`;
        
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) {
            ui.signupError.textContent = `Erro: ${authError.message}`;
            return;
        }

        if (authData.user) {
            const initialProfile = {
                id: authData.user.id,
                nome_de_guerra: nomeDeGuerra,
                pelotao: pelotao,
                numerica: parseInt(numerica, 10),
                role: 'aluno',
                level: 1,
                exp: 0,
                title: 'Aluno Novinho 🌱',
                full_data: {
                    reminders: [],
                    links: [],
                    qts: {},
                    events: [],
                    achievements: []
                }
            };

            const { error: profileError } = await supabase.from('profiles').insert(initialProfile);
            if (profileError) {
                ui.signupError.textContent = `Erro ao criar perfil: ${profileError.message}`;
                // Tenta apagar o usuário de autenticação órfão (requer privilégios de admin, pode falhar)
                await supabase.auth.admin.deleteUser(authData.user.id);
                return;
            }
            
            alert("Conta criada com sucesso! Por favor, faça o login para começar.");
            location.reload();
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        location.reload();
    }

    // --- FUNÇÕES DE PERSISTÊNCIA (SAVE/LOAD) ---
    async function saveGame() {
        if (!userProfile.id) return;
        const avg = calculateGradesAverage();
        const dataToSave = {
            level: game.level,
            exp: game.exp,
            title: game.title,
            grades_average: avg,
            full_data: {
                reminders: game.reminders,
                links: game.links,
                qts: game.qts,
                events: game.events,
                achievements: game.achievements
            }
        };
        const { error } = await supabase.from('profiles').update(dataToSave).eq('id', userProfile.id);
        if (error) {
            console.error("Erro ao salvar:", error);
        }
    }

    async function loadProfileAndStart(user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error || !data) {
            console.error("Usuário autenticado, mas perfil não encontrado. Forçando logout.", error);
            await handleLogout();
            return false;
        }
        
        userProfile = data;
        game = data.full_data || {};
        game.level = data.level;
        game.exp = data.exp;
        game.title = data.title;
        
        startGame();
        return true;
    }

    // --- LÓGICA DO JOGO ---
    function getExpToNextLevel(level) {
        return Math.floor(config.BASE_EXP_TO_LEVEL * Math.pow(config.LEVEL_EXP_MULTIPLIER, level - 1));
    }

    function gainExp(amount) {
        if (!amount) return;
        game.exp += amount;
        
        let expNeeded = getExpToNextLevel(game.level);
        while (game.exp >= expNeeded) {
            game.level++;
            game.exp -= expNeeded;
            checkTitleUnlocks();
            expNeeded = getExpToNextLevel(game.level);
        }
        updateProfileUI();
        saveGame();
    }
    
    function checkTitleUnlocks() {
        for (const unlock of titleUnlocks) {
            if (game.level >= unlock.level) {
                if (game.title !== unlock.title) {
                    game.title = unlock.title;
                }
                return;
            }
        }
    }

    function updateProfileUI() {
        ui.playerName.textContent = userProfile.nome_de_guerra;
        ui.level.textContent = `NÍVEL ${game.level}`;
        ui.title.textContent = game.title;
        const expNeeded = getExpToNextLevel(game.level);
        ui.expText.textContent = `EXP: ${game.exp} / ${expNeeded}`;
        ui.expBar.style.width = `${(game.exp / expNeeded) * 100}%`;
        ui.profilePic.src = userProfile.profile_pic || defaultAvatar;
    }
    
    async function renderRanking() {
        // Implementação do Ranking
    }

    async function initMural() {
        // Implementação do Mural
    }

    // --- FUNÇÕES DE INICIALIZAÇÃO ---
    function initGameUI() {
        ui.authContainer.classList.add('hidden');
        ui.gameContainer.classList.remove('hidden');

        if (userProfile.role === 'admin') {
            ui.adminLink.classList.remove('hidden');
        }

        updateProfileUI();
        // Adicione aqui as chamadas para outras inicializações (calendário, mural, etc.)
        ui.logoutButton.addEventListener('click', handleLogout);
    }
    
    function initAdminUI() {
        ui.authContainer.classList.add('hidden');
        ui.adminContainer.classList.remove('hidden');
        // Adicione aqui as chamadas para inicialização do painel de admin
    }

    function startGame() {
        if (userProfile.role === 'admin') {
            initAdminUI();
        } else {
            initGameUI();
        }
    }

    // --- PONTO DE ENTRADA ---
    async function main() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await loadProfileAndStart(session.user);
        } else {
            ui.authContainer.classList.remove('hidden');
            ui.loginPanel.classList.remove('hidden');
            ui.signupPanel.classList.add('hidden');

            ui.switchToSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.loginPanel.classList.add('hidden');
                ui.signupPanel.classList.remove('hidden');
            });
            ui.switchToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.signupPanel.classList.add('hidden');
                ui.loginPanel.classList.remove('hidden');
            });

            ui.loginForm.addEventListener('submit', handleLogin);
            ui.signupForm.addEventListener('submit', handleSignUp);
        }
    }

    main();
});
