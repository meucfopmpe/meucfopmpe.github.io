// =======================================================
// 1. CONFIGURAÇÃO DO SUPABASE
// =======================================================
const SUPABASE_URL = 'https://svijubigtigsrpfqzcgf.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k3Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let userState = {}; // Objeto para guardar os dados do usuário logado
let calendarInstance;
let gradesChartInstance;
let editingLinkId = null; // Variável para controlar a edição de links
const PLACEHOLDER_AVATAR = 'https://i.imgur.com/xpkhft4.png'; // IMAGEM PADRÃO ÚNICA

// =======================================================
    // 2. ELEMENTOS DO DOM
    // =======================================================
    const authPage = document.getElementById('auth-page'), appPage = document.getElementById('app');
    const loginContainer = document.getElementById('login-container'), loginButton = document.getElementById('login-button'), loginEmailInput = document.getElementById('login-email'), loginPasswordInput = document.getElementById('login-password'), loginError = document.getElementById('login-error');
    const signupContainer = document.getElementById('signup-container'), signupButton = document.getElementById('signup-button'), signupNameInput = document.getElementById('signup-name'), signupCourseNumberInput = document.getElementById('signup-course-number'), signupPlatoonInput = document.getElementById('signup-platoon'), signupPasswordInput = document.getElementById('signup-password'), signupMessage = document.getElementById('signup-message');
    const showSignupLink = document.getElementById('show-signup'), showLoginLink = document.getElementById('show-login');
    const logoutButton = document.getElementById('logout-button'), daysLeftEl = document.getElementById('days-left'), daysPassedEl = document.getElementById('days-passed'), userNameSidebar = document.getElementById('user-name-sidebar'), userAvatarSidebar = document.getElementById('user-avatar-sidebar'), userAvatarHeader = document.getElementById('user-avatar-header'), avgGradeEl = document.getElementById('grades-average'), sidebarNav = document.getElementById('sidebar-nav'), pageTitleEl = document.getElementById('page-title');
    const playerLevelTitle = document.getElementById('player-level-title'), xpBar = document.getElementById('xp-bar'), xpText = document.getElementById('xp-text'), coursePercentageEl = document.getElementById('course-progress-text'), courseProgressBar = document.getElementById('course-progress-bar');
    const gradesContainer = document.getElementById('grades-container'), qtsScheduleContainer = document.getElementById('qts-schedule-container'), calendarContainer = document.getElementById('calendar'), rankingList = document.getElementById('ranking-list'), achievementsGrid = document.getElementById('achievements-grid'), rankingToggle = document.getElementById('ranking-toggle');
    const dashboardMissionsList = document.getElementById('dashboard-missions-list'), dashboardAchievementsList = document.getElementById('dashboard-achievements-list'), dashboardRemindersList = document.getElementById('dashboard-reminders-list');
    const addMissionForm = document.getElementById('add-mission-form'), missionNameInput = document.getElementById('mission-name-input'), missionDateInput = document.getElementById('mission-date-input'), scheduledMissionsList = document.getElementById('scheduled-missions-list');
    const remindersList = document.getElementById('reminders-list'), reminderInput = document.getElementById('reminder-input'), addReminderButton = document.getElementById('add-reminder-button');
    const addLinkForm = document.getElementById('add-link-form'), linkTitleInput = document.getElementById('link-title-input'), linkValueInput = document.getElementById('link-value-input'), linkTypeInput = document.getElementById('link-type-input'), linksList = document.getElementById('links-list');
    const uploadAvatarButton = document.getElementById('upload-avatar-button'), uploadAvatarInput = document.getElementById('upload-avatar-input');
    const addQuestForm = document.getElementById('add-quest-form'), questTextInput = document.getElementById('quest-text-input'), questDifficultySelect = document.getElementById('quest-difficulty-select'), questsList = document.getElementById('quests-list'), clearCompletedQuestsButton = document.getElementById('clear-completed-quests-button');
    const achievementsWidget = document.getElementById('achievements-widget');
    const achievementsModal = document.getElementById('achievements-modal'), achievementsModalClose = document.getElementById('achievements-modal-close');
    const hamburgerButton = document.getElementById('hamburger-button'), sidebar = document.querySelector('.sidebar'), sidebarOverlay = document.getElementById('sidebar-overlay');
    const detailModal = document.getElementById('detail-modal'), detailModalTitle = document.getElementById('detail-modal-title'), detailModalBody = document.getElementById('detail-modal-body'), detailModalClose = document.getElementById('detail-modal-close');
    const adminInfoList = document.getElementById('admin-info-list');
    const saveGradesButton = document.getElementById('save-grades-button'), gradeSearchInput = document.getElementById('grade-search-input');
    const gradesProgressCounter = document.getElementById('grades-progress-counter');
    const documentsGrid = document.getElementById('documents-grid');
    const documentSearchInput = document.getElementById('document-search-input');
    
    // =======================================================
    // 3. DADOS ESTÁTICOS
    // =======================================================
    const COURSE_START_DATE = new Date('2025-05-26T00:00:00');
    const subjectList = ["Sistema de Segurança Pública", "Teoria Geral da Administração", "Gestão Pública Geral Aplicada", "Gestão de Pessoas, Comando e Liderança", "Gestão de Logística, Orçamento e Finanças Públicas", "Fundamentos da Polícia Comunitária", "Psicologia Aplicada", "Análise Criminal e Estatística", "Qualidade do Atendimento aos Grupos Vulneráveis", "Direitos Humanos Aplicados à Atividade Policial Militar", "Gerenciamento de Crises", "Saúde Mental e Qualidade de Vida", "Treinamento Físico Militar I", "Treinamento Físico Militar II", "Gestão de Processos no Sistema Eletrônico", "Tecnologia da Informação e Comunicação", "Comunicação, Mídias Sociais e Cerimonial Militar", "Inteligência e Sistema de Informação", "Ética, Cidadania e Relações Interpessoais", "Ordem Unida I", "Ordem Unida II", "Instrução Geral", "Defesa Pessoal Policial I", "Defesa Pessoal Policial II", "Uso Diferenciado da Força", "Pronto Socorrismo", "Atendimento Pré-Hospitalar Tático", "Planejamento Operacional e Especializado", "Elaboração de Projetos e Captação de Recursos", "Planejamento Estratégico", "Gestão Por Resultados e Avaliação de Políticas Públicas", "Trabalho de Comando e Estado Maior", "Polícia Judiciária Militar", "Direito Administrativo Disciplinar Militar", "Direito Penal e Processual Penal Militar", "Legislação Policial Militar e Organizacional", "Procedimento em Ocorrência", "Economia Aplicada ao Setor Público", "História da PMPE", "Abordagem a Pessoas", "Abordagem a Veículos", "Abordagem a Edificações", "Patrulhamento Urbano", "Armamento e Munição", "Tiro Policial", "Tiro Defensivo (Método Giraldi)", "Ações Básicas de Apoio Aéreo", "Manobras Acadêmicas I", "Manobras Acadêmicas II", "Metodologia da Pesquisa Científica", "Teoria e Prática do Ensino", "Trabalho de Conclusão de Curso"];
    const qtsTimes = ['08:00-09:40', '10:00-11:40', '13:40-15:20', '15:40-17:20', '17:30-19:10'];
    const achievementsData = {
        ASP26: { name: "Aspirante 2026", icon: "⭐", description: "Fazer parte da turma de Aspirantes de 2026.", condition: () => true },
        MAPOM: { name: "MAPOM", icon: "🗺️", description: "Concluir o Módulo de Adaptação Policial-Militar.", condition: () => false },
        ESPADIM: { name: "Espadim", icon: "🗡️", description: "Receber o Espadim Tiradentes.", condition: () => false },
        PROGRESS_50: { name: "50% do Curso", icon: "🏃", description: "Concluir 50% do curso.", condition: (state, type, data) => type === 'time_update' && data.percentage >= 50 },
        HUNDRED_DAYS: { name: "Festa dos 100 Dias", icon: "🎉", description: "Celebrar a contagem regressiva de 100 dias para a formatura.", condition: (state, type, data) => type === 'time_update' && data.days_left <= 100 },
        ECUMENICO: { name: "Culto Ecumênico", icon: "🙏", description: "Participar do culto ecumênico de formatura.", condition: () => false },
        INSTRUCTION_END: { name: "Fim das Instruções", icon: "🏁", description: "Completar o último dia de instruções acadêmicas.", condition: () => false },
        FIRST_QUEST: { name: "Primeira Missão", icon: "⚔️", description: "Complete sua primeira missão diária.", condition: (state, type) => type === 'complete_quest' },
        FIRST_GRADE: { name: "Estudante", icon: "📖", description: "Adicione sua primeira nota no sistema.", condition: (state) => Object.values(state.grades).some(g => g > 0) },
        FIRST_SERVICE: { name: "Primeiro Serviço", icon: "🛡️", description: "Agende seu primeiro serviço no calendário.", condition: (state, type) => type === 'add_mission' },
        COURSE_COMPLETE: { name: "Oficial Formado", icon: "🎓", description: "Concluir os 365 dias do curso.", condition: (state, type, data) => type === 'time_update' && data.days_left <= 0 },
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
        const { data, error } = await sb.from('profiles').select('user_data').eq('id', user.id).single();
        if (error) { console.error("Erro ao carregar dados do usuário:", error); return; }
        
        if (data && data.user_data) {
            userState = data.user_data;
        } else { 
            const today = new Date();
            const daysPassed = Math.max(0, Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24)));
            const initialXp = daysPassed * 15;
            userState = {
                grades: Object.fromEntries(subjectList.map(s => [s, 0])),
                schedule: {}, achievements: [], missions: [], reminders: [], links: [], quests: [], xp: initialXp, avatar: '', show_in_ranking: true
            };
            await saveUserData();
        }
        
        rankingToggle.checked = userState.show_in_ranking !== false;
        
        const placeholderAvatar = 'https://i.imgur.com/xpkhft4.png';
        if (userState.avatar) {
            userAvatarSidebar.src = userState.avatar;
            userAvatarHeader.src = userState.avatar;
        } else {
            userAvatarSidebar.src = placeholderAvatar;
            userAvatarHeader.src = placeholderAvatar;
        }
        
        if (!userState.xp) userState.xp = 0;
        if (!userState.missions) userState.missions = [];
        if (!userState.reminders) userState.reminders = [];
        if (!userState.links) userState.links = [];
        if (!userState.quests) userState.quests = [];
        if (!userState.achievements) userState.achievements = [];
        if (!userState.grades || Object.keys(userState.grades).length === 0) userState.grades = Object.fromEntries(subjectList.map(s => [s, 0]));
        checkAchievements();
    }
    async function saveUserData() {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        const { error } = await sb.from('profiles').update({ user_data: userState }).eq('id', user.id);
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
        renderDashboard();
        renderAdminInfo();
    }
    
    async function renderAdminInfo() {
        const { data, error } = await sb.from('global_info').select('*').order('due_date', { ascending: true }).order('created_at', { ascending: false }).limit(5);
        if (error) { console.error("Erro ao buscar informações do ADM:", error); return; }
        if (!adminInfoList) return;
        if (!data || data.length === 0) {
            adminInfoList.innerHTML = '<li><p>Nenhuma informação no momento.</p></li>';
            return;
        }
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
    
        dashboardRemindersList.innerHTML = '';
        const last3Reminders = (userState.reminders || []).filter(r => !r.completed).slice(0, 3);
        if (last3Reminders.length > 0) {
            last3Reminders.forEach(r => {
                dashboardRemindersList.innerHTML += `<li><span>${r.text}</span></li>`;
            });
        } else {
            dashboardRemindersList.innerHTML = '<li><span>Nenhum lembrete ativo.</span></li>';
        }
    
        dashboardAchievementsList.innerHTML = '';
        const last3Achievements = (userState.achievements || []).slice(-3).reverse();
        if (last3Achievements.length > 0) {
            last3Achievements.forEach(key => {
                const ach = achievementsData[key];
                if (ach) dashboardAchievementsList.innerHTML += `<div class="achievement-icon" title="${ach.name}">${ach.icon}</div>`;
            });
        } else {
             dashboardAchievementsList.innerHTML = `<div class="achievement-icon locked" title="Nenhuma conquista desbloqueada">?</div>`;
        }
    }
    
    function updateTimeProgress() {
        const today = new Date();
        const graduationDate = new Date('2026-05-26T00:00:00');
        const totalDays = 365;
        const daysLeft = Math.ceil((graduationDate - today) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.max(0, Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24)));
        daysLeftEl.textContent = daysLeft > 0 ? daysLeft : 0;
        daysPassedEl.textContent = daysPassed >= 0 ? daysPassed : 0;
        const percentage = Math.min(100, (daysPassed / totalDays) * 100);
        courseProgressBar.style.width = `${percentage}%`;
        coursePercentageEl.innerHTML = `<span>${percentage.toFixed(1)}%</span> do curso concluído`;
        checkAchievements('time_update', { percentage, days_left: daysLeft });
    }

        // --- Renderização de DOCUMENTOS GLOBAIS ---
    const STORAGE_BUCKET_FOR_DOCUMENTS = 'documents'; // <-- altere se o seu bucket tiver outro nome
    
    // Função atualizada para renderizar os documentos como cards (igual ao print)
async function renderDocuments(searchTerm = '') {
  if (!documentsGrid) {
    console.warn('[renderDocuments] #documents-grid não encontrado.');
    return;
  }

  documentsGrid.innerHTML = '<div class="loading">Carregando documentos...</div>';

  try {
    let query = sb.from('documents').select('id, title, description, url, file_path, created_at');

    if (searchTerm && searchTerm.length > 0) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    query = query.order('created_at', { ascending: false }).limit(200);

    const { data, error } = await query;
    console.log('[renderDocuments] resposta:', { data, error, searchTerm });

    if (error) {
      console.error('Erro ao buscar documents:', error);
      documentsGrid.innerHTML = `<div class="error">Erro ao carregar documentos: ${error.message || JSON.stringify(error)}</div>`;
      return;
    }

    if (!data || data.length === 0) {
      documentsGrid.innerHTML = '<div class="empty">Nenhum documento encontrado.</div>';
      return;
    }

    // renderiza como grid de cards
    documentsGrid.innerHTML = '';
    data.forEach(doc => {
      const item = document.createElement('div');
      item.className = 'doc-card';

      // escolha do ícone - se for PDF usar emoji /📄/ ou imagem
      const ext = (doc.file_path || doc.url || '').split('.').pop()?.toLowerCase() || '';
      let icon = '📄';
      if (ext === 'pdf') icon = '📄';
      else if (['png','jpg','jpeg','gif','svg'].includes(ext)) icon = '🖼️';
      else if (['doc','docx'].includes(ext)) icon = '📝';

      // montar href (prioriza url, depois file_path via storage pública)
      let href = null;
      if (doc.url) {
        href = doc.url;
      } else if (doc.file_path) {
        href = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(STORAGE_BUCKET_FOR_DOCUMENTS)}/${encodeURIComponent(doc.file_path)}`;
      }

      // título e descrição (fallback)
      const title = doc.title || (doc.file_path ? doc.file_path : `Documento ${doc.id || ''}`);
      const desc = doc.description || '';

      // conteúdo do card (uso de criação de elementos para evitar HTML inseguro)
      const iconEl = document.createElement('div');
      iconEl.className = 'doc-icon';
      iconEl.textContent = icon;
      item.appendChild(iconEl);

      const titleEl = document.createElement('div');
      titleEl.className = 'doc-title';
      titleEl.textContent = title;
      item.appendChild(titleEl);

      if (desc) {
        const descEl = document.createElement('div');
        descEl.className = 'doc-desc';
        descEl.textContent = desc;
        item.appendChild(descEl);
      }

      const metaEl = document.createElement('div');
      metaEl.className = 'document-meta';
      if (doc.created_at) {
        const d = new Date(doc.created_at);
        if (!isNaN(d)) metaEl.textContent = d.toLocaleDateString('pt-BR');
      }
      if (metaEl.textContent) item.appendChild(metaEl);

      if (href) {
        const a = document.createElement('a');
        a.className = 'doc-link';
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Abrir / Baixar';
        item.appendChild(a);
      } else {
        const noLink = document.createElement('div');
        noLink.className = 'document-no-link';
        noLink.textContent = 'Sem link disponível';
        item.appendChild(noLink);
      }
        // tornar todo o card clicável para abrir o arquivo (mesma URL do .doc-link)
        if (href) {
          // permitir foco por teclado
          item.tabIndex = 0;
          item.style.cursor = 'pointer';
        
          // clique com o mouse abre em nova aba
          item.addEventListener('click', () => {
            window.open(href, '_blank');
          });
        
        }

      documentsGrid.appendChild(item);
    });

  } catch (err) {
    console.error('Erro inesperado em renderDocuments:', err);
    documentsGrid.innerHTML = '<div class="error">Erro inesperado ao carregar documentos. Veja o console.</div>';
  }
}

// bind de busca com debounce (se já não existir)
if (documentSearchInput) {
  let searchTimeout = null;
  documentSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderDocuments(documentSearchInput.value.trim());
    }, 220);
  });
}

// Assegure que os documentos carreguem já ao abrir a aba e na inicialização:
// 1) Quando o usuário navega para a aba de documentos (garanta que handlePageNavigation chama isto):
//    if (targetPageId === 'page-documents') renderDocuments(documentSearchInput ? documentSearchInput.value.trim() : '');
// 2) E também carregue ao iniciar (após checkSession/DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  // Carregar os documentos logo que o DOM esteja pronto (evita depender só do input)
  // - chama sem termo de busca para listar todos (ou os mais recentes)
  setTimeout(() => {
    // pequeno timeout para garantir variáveis/elementos já inicializados
    try { renderDocuments(documentSearchInput ? documentSearchInput.value.trim() : ''); }
    catch (e) { console.warn('renderDocuments init falhou:', e); }
  }, 120);
});
    
    
    // chamar renderDocuments ao abrir a aba de documentos:
    // no seu handlePageNavigation, adicione ou ajuste:
   function handlePageNavigation(e) {
    if (e.target.tagName !== 'A') return;
    const targetPageId = e.target.dataset.page;
    if (!targetPageId) return;

    // Lógica condicional para o Ranking
    if (targetPageId === 'page-ranking' && !userState.show_in_ranking) {
        const rankingPage = document.getElementById('page-ranking');
        const rankingList = document.getElementById('ranking-list');
        
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        rankingPage.classList.add('active');
        e.target.classList.add('active');
        pageTitleEl.textContent = e.target.textContent;

        rankingList.innerHTML = `
            <div class="ranking-private-container">
                <h3>Acesso Restrito</h3>
                <p>Para visualizar o ranking da turma, você precisa permitir que seu perfil seja exibido.</p>
                <p>Vá para a página "Minhas Notas" e ative a opção "Exibir no Ranking".</p>
            </div>
        `;
        
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.add('hidden');
        }
        return; // Interrompe a função aqui para não renderizar o ranking
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(targetPageId).classList.add('active');
    e.target.classList.add('active');
    pageTitleEl.textContent = e.target.textContent;

    // Renderiza o conteúdo específico da página clicada
    if (targetPageId === 'page-grades') renderGrades();
    if (targetPageId === 'page-schedule') renderQTSSchedule();
    if (targetPageId === 'page-calendar') initCalendar();
    if (targetPageId === 'page-ranking') renderRanking();
    if (targetPageId === 'page-daily-quests') renderQuests();
    if (targetPageId === 'page-reminders') renderReminders();
    if (targetPageId === 'page-links') renderLinks();
    if (targetPageId === 'page-documents') renderDocuments();

    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.add('hidden');
    }
}
    
    function renderGrades() {
        gradesContainer.innerHTML = '';
        subjectList.sort().forEach(subject => {
            const value = userState.grades[subject] || 0;
            gradesContainer.innerHTML += `<div class="grade-item"><span class="grade-item-label" title="${subject}">${subject}</span><input type="number" class="grade-item-input" data-subject="${subject}" value="${value}" min="0" max="10" step="0.1"></div>`;
        });
        updateGradesAverage(false);
        renderGradesChart();
    }
    function handleGradeChange(e) {
        const subject = e.target.dataset.subject;
        const nota = parseFloat(e.target.value);
        if (subject && !isNaN(nota)) {
            userState.grades[subject] = Math.max(0, Math.min(10, nota));
            checkAchievements('add_grade');
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
    
    function renderGradesChart() {
        const ctx = document.getElementById('grades-chart').getContext('2d');
        const gradesWithValues = Object.entries(userState.grades).filter(([, score]) => score > 0);
        
        if (gradesChartInstance) {
            gradesChartInstance.destroy();
        }
        
        gradesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: gradesWithValues.map(([subject]) => subject.substring(0, 15) + '...'),
                datasets: [{
                    label: 'Notas',
                    data: gradesWithValues.map(([, score]) => score),
                    backgroundColor: 'rgba(0, 175, 255, 0.6)',
                    borderColor: 'rgba(0, 175, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { 
                            color: '#8A94B6',
                            stepSize: 2
                        },
                        grid: {
                            color: 'rgba(57, 66, 105, 0.5)'
                        }
                    },
                    x: {
                        ticks: { color: '#8A94B6' },
                        grid: {
                            color: 'rgba(57, 66, 105, 0.2)'
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                return gradesWithValues[index][0];
                            }
                        }
                    }
                }
            }
        });
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
        if (calendarInstance) { calendarInstance.destroy(); }
        calendarInstance = new FullCalendar.Calendar(calendarContainer, {
            locale: 'pt-br',
            initialView: 'dayGridMonth',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' },
            buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana' },
            events: getCalendarEvents(),
            eventClick: function(info) {
                detailModalTitle.textContent = info.event.title;
                detailModalBody.innerHTML = `<strong>Data:</strong> ${info.event.start.toLocaleDateString('pt-BR')}`;
                detailModal.classList.remove('hidden');
            }
        });
        calendarInstance.render();
    }
    function getCalendarEvents() {
        const eventColors = { 'plantão': '#E57373', 'guarda': '#64B5F6', 'auxiliar': '#FFF176', 'default': 'var(--sl-primary)' };
        const events = (userState.missions || []).map(mission => {
            const nameLower = mission.name.toLowerCase();
            let color = eventColors.default;
            for (const key in eventColors) {
                if (nameLower.includes(key)) {
                    color = eventColors[key];
                    break;
                }
            }
            return { title: mission.name, start: mission.date, color: color };
        });
        return events;
    }
    
    async function renderRanking() {
    if (!rankingList) return;

    // Se o usuário atual escolheu não aparecer no ranking, mostramos a mensagem de bloqueio.
    // Isso bloqueia a visualização local da lista enquanto o usuário estiver com a opção desativada.
    if (userState && userState.show_in_ranking === false) {
        rankingList.innerHTML = `
            <div class="ranking-private-container">
                <h3>Acesso Restrito</h3>
                <p>Você desativou a opção "Exibir no Ranking". Para visualizar o ranking, ative a opção <strong>Exibir no Ranking</strong> na página <em>Minhas Notas</em>.</p>
                <p>Depois de ativar, atualize a página ou volte ao ranking para ver a lista.</p>
            </div>
        `;
        return;
    }

    rankingList.innerHTML = 'Carregando ranking...';

    try {
        const { data: profiles, error } = await sb
            .from('profiles')
            .select('full_name, user_data, grades_average')
            .order('grades_average', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Erro ao carregar ranking:', error);
            rankingList.innerHTML = `<p style="color: var(--sl-error);">Não foi possível carregar o ranking. (${error.message || 'erro'})</p>`;
            return;
        }

        // Filtra apenas perfis que permitiram aparecer no ranking
        const filteredProfiles = (profiles || []).filter(p => p.user_data?.show_in_ranking !== false);

        if (filteredProfiles.length === 0) {
            rankingList.innerHTML = '<p>Ninguém no ranking ainda ou todos optaram por ficar privados.</p>';
            return;
        }

        // Renderiza a lista
        rankingList.innerHTML = '';
        filteredProfiles.forEach((profile, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            const avatarSrc = profile.user_data?.avatar || PLACEHOLDER_AVATAR;
            item.innerHTML = `<div class="ranking-pos">${index + 1}</div>
                              <img class="ranking-avatar" src="${avatarSrc}" alt="Avatar">
                              <div class="ranking-info"><div class="ranking-name">${profile.full_name || 'Anônimo'}</div></div>
                              <div class="ranking-avg">${profile.grades_average ? Number(profile.grades_average).toFixed(2) : '0.00'}</div>`;
            rankingList.appendChild(item);
        });

    } catch (err) {
        console.error('Erro inesperado ao renderizar ranking:', err);
        rankingList.innerHTML = '<p style="color: var(--sl-error);">Erro ao carregar ranking (ver console).</p>';
    }
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
        if(stateChanged) saveUserData();
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
        if (!quest || quest.completed) return;
        quest.completed = true;
        addXp(quest.xp);
        checkAchievements('complete_quest', quest);
        saveUserData();
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
            item.innerHTML = `<div class="link-item-info">${content}</div><div class="link-buttons"><button class="edit-link-btn" data-index="${index}">✏️</button><button data-index="${index}">X</button></div>`;
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
            
            if (editingLinkId !== null) {
                userState.links[editingLinkId] = { title, value, type };
                editingLinkId = null;
            } else {
                userState.links.push({ title, value, type });
            }
            
            addLinkForm.reset();
            checkAchievements('add_link');
            saveUserData();
            renderLinks();
        }
    }
    function handleLinkInteraction(e) {
        if (e.target.tagName !== 'BUTTON') return;
        const index = e.target.dataset.index;
        if (e.target.classList.contains('edit-link-btn')) {
            const link = userState.links[index];
            linkTitleInput.value = link.title;
            linkValueInput.value = link.value;
            linkTypeInput.value = link.type;
            editingLinkId = index;
        } else {
            userState.links.splice(index, 1);
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
        
        if (targetPageId === 'page-grades') renderGrades();
        if (targetPageId === 'page-schedule') renderQTSSchedule();
        if (targetPageId === 'page-calendar') initCalendar();
        if (targetPageId === 'page-ranking') renderRanking();
        if (targetPageId === 'page-daily-quests') renderQuests();
        if (targetPageId === 'page-reminders') renderReminders();
        if (targetPageId === 'page-links') renderLinks();
    
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
                renderGradesChart();
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

        
        if (rankingToggle) {
          rankingToggle.addEventListener('change', async () => {
            // atualiza estado local
            userState.show_in_ranking = rankingToggle.checked;
            // salva no Supabase
            try {
              await saveUserData();
            } catch (err) {
              console.error('Erro ao salvar preferência de ranking:', err);
            }
            // se estivermos na página de ranking, re-renderiza (para aplicar o bloqueio / desbloqueio)
            const rankingPageEl = document.getElementById('page-ranking');
            if (rankingPageEl && rankingPageEl.classList.contains('active')) {
              renderRanking();
            }
          });
        }
                // === CONFIGURAÇÃO DE JOGOS DISPONÍVEIS ===
        const games = [
          { id: 'desafio-cfo', name: 'Desafio CFO - TCEM', path: 'game/desafio-cfo.html', subject: 'TCEM'},
          { id: 'LPMO-jogo', name: 'Desafio LPMO', path: 'game/LPMO.html', subject: 'LPMO' }
          // 🔹 você pode adicionar novos jogos aqui conforme as provas da semana
        ];
        
        // === RENDERIZAÇÃO DOS CARDS ===
        function renderGames() {
          const container = document.getElementById('games-list');
          container.innerHTML = '';
          games
            .forEach(game => {
              const card = document.createElement('div');
              card.className = 'doc-card';
              card.innerHTML = `
                <h3>${game.subject}</h3>
                <p>${game.name}</p>
              `;
              card.onclick = () => window.open(game.path, '_blank');
              container.appendChild(card);
            });
        }
        
        // === ABRIR O JOGO NO IFRAME ===
        function openGame(game) {
          document.getElementById('games-list').classList.add('hidden');
          const frameContainer = document.getElementById('game-frame-container');
          const iframe = document.getElementById('game-frame');
          iframe.src = game.path;
          frameContainer.classList.remove('hidden');
        
          // Monitora mensagens vindas do jogo
          window.addEventListener('message', async (event) => {
            if (event.data.type === 'GAME_SCORE') {
              const score = event.data.score;
              const userId = localStorage.getItem('user_id'); // supondo que seu login já salva o ID
              await sb.from('user_scores').insert({ user_id: userId, game_id: game.id, score });
              alert(`Pontuação de ${score} registrada!`);
            }
          });
        }
                // === BLOQUEIA E DESBLOQUEIA O SCROLL GLOBAL ===
        let scrollPosition = 0;
        
        function disableScroll() {
          scrollPosition = window.scrollY;
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollPosition}px`;
          document.body.style.width = '100%';
          document.body.style.overflow = 'hidden';
        }
        
        function enableScroll() {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          document.body.style.overflow = '';
          window.scrollTo(0, scrollPosition);
        }

        
        
        document.getElementById('back-to-games').onclick = () => {
          document.getElementById('game-frame-container').classList.add('hidden');
          document.getElementById('games-list').classList.remove('hidden');
        };
        
        // chama a renderização ao carregar a aba
        renderGames();


        
    });
