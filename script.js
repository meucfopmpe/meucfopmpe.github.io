document.addEventListener('DOMContentLoaded', () => {
    // --- CONEXÃO COM O SUPABASE ---
    const supabaseUrl = 'https://svijubigtigsrpfqzcgf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k-Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    // ---------------------------------

    // --- ESTADO DA APLICAÇÃO ---
    let userProfile = {};
    let game = {};
    const defaultAvatar = 'https://i.imgur.com/K3wY2mn.png';

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
        profileCardName: document.getElementById('profile-card-name'),
        profileCardPic: document.getElementById('profile-card-pic'),
        profileCardLevel: document.getElementById('profile-card-level'),
        profileCardAverage: document.getElementById('profile-card-average'),
        profileCardPelotao: document.getElementById('profile-card-pelotao'),
        profileCardInstagram: document.getElementById('profile-card-instagram'),
        profileCardLikeButton: document.getElementById('profile-card-like-button'),
        profileCardCloseButton: document.getElementById('profile-card-close-button'),
    };

    // --- FUNÇÕES DE AUTENTICAÇÃO ---
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
                role: 'aluno'
            };
            const { error: profileError } = await supabase.from('profiles').insert(initialProfile);
            if (profileError) {
                ui.signupError.textContent = `Erro ao criar perfil: ${profileError.message}`;
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

    // --- FUNÇÕES DE DADOS ---
    async function loadProfileAndStart(user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if(error || !data) {
            console.error("Perfil não encontrado, forçando logout", error);
            await handleLogout();
            return false;
        }
        userProfile = data;
        game = data.full_data || { dailyQuests: [] };
        game.level = data.level;
        game.exp = data.exp;
        game.title = data.title;
        startGame();
        return true;
    }

    // --- LÓGICA DO JOGO ---
    function updateProfileUI() {
        ui.playerName.textContent = userProfile.nome_de_guerra;
        ui.level.textContent = `NÍVEL ${game.level}`;
        ui.title.textContent = game.title;
        const expNeeded = Math.floor(100 * Math.pow(1.2, game.level - 1));
        ui.expText.textContent = `EXP: ${game.exp} / ${expNeeded}`;
        ui.expBar.style.width = `${(game.exp / expNeeded) * 100}%`;
        ui.profilePic.src = userProfile.profile_pic || defaultAvatar;
    }

    async function fetchAnnouncements() {
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
        if (error || !data || data.length === 0) return;
        ui.globalAnnouncementsContainer.innerHTML = '<h4>📢 Avisos Globais</h4>';
        data.forEach(ann => {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `<p>${ann.content}</p><div class="author">- ${ann.author_name}</div>`;
            ui.globalAnnouncementsContainer.appendChild(item);
        });
    }

    async function fetchAndRenderMural() {
        const { data, error } = await supabase.from('mural_messages').select('*, mural_likes(user_id)').order('created_at', { ascending: false }).limit(50);
        if (error) { console.error('Erro ao buscar mural:', error); return; }
        ui.muralFeed.innerHTML = '';
        data.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'mural-message';
            const userLiked = msg.mural_likes.some(like => like.user_id === userProfile.id);
            msgDiv.innerHTML = `
                <div class="mural-header">
                    <img src="${msg.author_profile_pic || defaultAvatar}" alt="avatar">
                    <span class="author" data-user-id="${msg.author_id}">${msg.author_name}</span>
                    <span class="timestamp">${new Date(msg.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <div class="mural-content"><p>${msg.content}</p></div>
                <div class="mural-actions">
                    <button class="like-btn ${userLiked ? 'liked' : ''}" data-message-id="${msg.id}">👍 Elogiar (${msg.mural_likes.length})</button>
                </div>`;
            ui.muralFeed.appendChild(msgDiv);
        });
    }

    async function handleNewMuralMessage(e) {
        e.preventDefault();
        const content = ui.muralInput.value.trim();
        if(!content) return;
        ui.muralInput.value = "";
        await supabase.from('mural_messages').insert({ 
            content, 
            author_id: userProfile.id, 
            author_name: userProfile.nome_de_guerra, 
            author_profile_pic: userProfile.profile_pic 
        });
    }

    async function handleMuralLike(e) {
        if(!e.target.classList.contains('like-btn')) return;
        const messageId = e.target.dataset.messageId;
        const { data } = await supabase.from('mural_likes').select('id').eq('user_id', userProfile.id).eq('message_id', messageId);
        if(data && data.length > 0) {
            await supabase.from('mural_likes').delete().eq('id', data[0].id);
        } else {
            await supabase.from('mural_likes').insert({ user_id: userProfile.id, message_id: messageId });
        }
        // A mágica do realtime já vai chamar o fetchAndRenderMural automaticamente.
    }
    
    // --- FUNÇÕES DE INICIALIZAÇÃO ---
    function initGameUI() {
        ui.authContainer.classList.add('hidden');
        ui.gameContainer.classList.remove('hidden');
        if (userProfile.role === 'admin') {
            ui.adminLink.classList.remove('hidden');
        }
        updateProfileUI();
        fetchAnnouncements();
        fetchAndRenderMural();
        
        // Listeners
        ui.logoutButton.addEventListener('click', handleLogout);
        ui.muralPostForm.addEventListener('submit', handleNewMuralMessage);
        ui.muralFeed.addEventListener('click', handleMuralLike);
    }
    
    function initAdminUI() {
        window.location.href = 'admin.html';
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
