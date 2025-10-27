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
const authPage = document.getElementById("auth-page"),
  appPage = document.getElementById("app");
const loginContainer = document.getElementById("login-container"),
  loginButton = document.getElementById("login-button"),
  loginEmailInput = document.getElementById("login-email"),
  loginPasswordInput = document.getElementById("login-password"),
  loginError = document.getElementById("login-error");
const signupContainer = document.getElementById("signup-container"),
  signupButton = document.getElementById("signup-button"),
  signupNameInput = document.getElementById("signup-name"),
  signupCourseNumberInput = document.getElementById("signup-course-number"),
  signupPlatoonInput = document.getElementById("signup-platoon"),
  signupPasswordInput = document.getElementById("signup-password"),
  signupMessage = document.getElementById("signup-message");
const showSignupLink = document.getElementById("show-signup"),
  showLoginLink = document.getElementById("show-login");
const logoutButton = document.getElementById("logout-button"),
  daysLeftEl = document.getElementById("days-left"),
  daysPassedEl = document.getElementById("days-passed"),
  userNameSidebar = document.getElementById("user-name-sidebar"),
  userAvatarSidebar = document.getElementById("user-avatar-sidebar"),
  userAvatarHeader = document.getElementById("user-avatar-header"),
  avgGradeEl = document.getElementById("grades-average"),
  sidebarNav = document.getElementById("sidebar-nav"),
  pageTitleEl = document.getElementById("page-title");
const playerLevelTitle = document.getElementById("player-level-title"),
  xpBar = document.getElementById("xp-bar"),
  xpText = document.getElementById("xp-text"),
  coursePercentageEl = document.getElementById("course-progress-text"),
  courseProgressBar = document.getElementById("course-progress-bar");
const gradesContainer = document.getElementById("grades-container"),
  qtsScheduleContainer = document.getElementById("qts-schedule-container"),
  calendarContainer = document.getElementById("calendar"),
  rankingList = document.getElementById("ranking-list"),
  achievementsGrid = document.getElementById("achievements-grid"),
  rankingToggle = document.getElementById("ranking-toggle");
const dashboardMissionsList = document.getElementById(
    "dashboard-missions-list"
  ),
  dashboardAchievementsList = document.getElementById(
    "dashboard-achievements-list"
  ),
  dashboardRemindersList = document.getElementById("dashboard-reminders-list");
const addMissionForm = document.getElementById("add-mission-form"),
  missionNameInput = document.getElementById("mission-name-input"),
  missionDateInput = document.getElementById("mission-date-input"),
  scheduledMissionsList = document.getElementById("scheduled-missions-list");
const remindersList = document.getElementById("reminders-list"),
  reminderInput = document.getElementById("reminder-input"),
  addReminderButton = document.getElementById("add-reminder-button");
const addLinkForm = document.getElementById("add-link-form"),
  linkTitleInput = document.getElementById("link-title-input"),
  linkValueInput = document.getElementById("link-value-input"),
  linkTypeInput = document.getElementById("link-type-input"),
  linksList = document.getElementById("links-list");
const uploadAvatarButton = document.getElementById("upload-avatar-button"),
  uploadAvatarInput = document.getElementById("upload-avatar-input");
const addQuestForm = document.getElementById("add-quest-form"),
  questTextInput = document.getElementById("quest-text-input"),
  questDifficultySelect = document.getElementById("quest-difficulty-select"),
  questsList = document.getElementById("quests-list"),
  clearCompletedQuestsButton = document.getElementById(
    "clear-completed-quests-button"
  );
const achievementsWidget = document.getElementById("achievements-widget");
const achievementsModal = document.getElementById("achievements-modal"),
  achievementsModalClose = document.getElementById("achievements-modal-close");
const hamburgerButton = document.getElementById("hamburger-button"),
  sidebar = document.querySelector(".sidebar"),
  sidebarOverlay = document.getElementById("sidebar-overlay");
const detailModal = document.getElementById("detail-modal"),
  detailModalTitle = document.getElementById("detail-modal-title"),
  detailModalBody = document.getElementById("detail-modal-body"),
  detailModalClose = document.getElementById("detail-modal-close");
const adminInfoList = document.getElementById("admin-info-list");
const saveGradesButton = document.getElementById("save-grades-button"),
  gradeSearchInput = document.getElementById("grade-search-input");
const gradesProgressCounter = document.getElementById(
  "grades-progress-counter"
);
const documentsGrid = document.getElementById("documents-grid");
const documentSearchInput = document.getElementById("document-search-input");
// Adicione estas linhas na seção de elementos do DOM
const showProgressModalButton = document.getElementById(
  "show-progress-modal-button"
);
const courseProgressModal = document.getElementById("course-progress-modal");
const courseProgressModalClose = document.getElementById(
  "course-progress-modal-close"
);
const courseProgressBody = document.getElementById("course-progress-body");
let disciplineStatusChart = null; // Para guardar a instância do gráfico
let workloadStatusChart = null; // Para guardar a instância do gráfico

// Elementos do Ranking
const saveBattalionsButton = document.getElementById("save-battalions-button");
const battalionSelect1 = document.getElementById("battalion-select-1");
const battalionSelect2 = document.getElementById("battalion-select-2");
const battalionSelect3 = document.getElementById("battalion-select-3");
const showGlobalRankingButton = document.getElementById("show-global-ranking");
const showBattalionRankingButton = document.getElementById(
  "show-battalion-ranking"
);
const rankingMessage = document.getElementById("ranking-message");

// Elementos do Módulo de Jogos
const gamesList = document.getElementById('games-list');
const gameFrameContainer = document.getElementById('game-frame-container');
const gameFrame = document.getElementById('game-frame');
const backToGamesButton = document.getElementById('back-to-games');

// =======================================================
// 3. DADOS ESTÁTICOS
// =======================================================
const COURSE_START_DATE = new Date("2025-05-26T00:00:00");
const subjectList = [
  "Sistema de Segurança Pública",
  "Teoria Geral da Administração",
  "Gestão Pública Geral Aplicada",
  "Gestão de Pessoas, Comando e Liderança",
  "Gestão de Logística, Orçamento e Finanças Públicas",
  "Fundamentos da Polícia Comunitária",
  "Psicologia Aplicada",
  "Análise Criminal e Estatística",
  "Qualidade do Atendimento aos Grupos Vulneráveis",
  "Direitos Humanos Aplicados à Atividade Policial Militar",
  "Gerenciamento de Crises",
  "Saúde Mental e Qualidade de Vida",
  "Treinamento Físico Militar I",
  "Treinamento Físico Militar II",
  "Gestão de Processos no Sistema Eletrônico",
  "Tecnologia da Informação e Comunicação",
  "Comunicação, Mídias Sociais e Cerimonial Militar",
  "Inteligência e Sistema de Informação",
  "Ética, Cidadania e Relações Interpersonais",
  "Ordem Unida I",
  "Ordem Unida II",
  "Instrução Geral",
  "Defesa Pessoal Policial I",
  "Defesa Pessoal Policial II",
  "Uso Diferenciado da Força",
  "Pronto Socorrismo",
  "Atendimento Pré-Hospitalar Tático",
  "Planejamento Operacional e Especializado",
  "Elaboração de Projetos e Captação de Recursos",
  "Planejamento Estratégico",
  "Gestão Por Resultados e Avaliação de Políticas Públicas",
  "Trabalho de Comando e Estado Maior",
  "Polícia Judiciária Militar",
  "Direito Administrativo Disciplinar Militar",
  "Direito Penal e Processual Penal Militar",
  "Legislação Policial Militar e Organizacional",
  "Procedimento em Ocorrência",
  "Economia Aplicada ao Setor Público",
  "História da PMPE",
  "Abordagem a Pessoas",
  "Abordagem a Veículos",
  "Abordagem a Edificações",
  "Patrulhamento Urbano",
  "Armamento e Munição",
  "Tiro Policial",
  "Tiro Defensivo (Método Giraldi)",
  "Ações Básicas de Apoio Aéreo",
  "Manobras Acadêmicas I",
  "Manobras Acadêmicas II",
  "Metodologia da Pesquisa Científica",
  "Teoria e Prática do Ensino",
  "Trabalho de Conclusão de Curso",
];
const qtsTimes = [
  "08:00-09:40",
  "10:00-11:40",
  "13:40-15:20",
  "15:40-17:20",
  "17:30-19:10",
];
const achievementsData = {
  ASP26: {
    name: "Aspirante 2026",
    icon: "⭐",
    description: "Fazer parte da turma de Aspirantes de 2026.",
    condition: () => true,
  },
  MAPOM: {
    name: "MAPOM",
    icon: "🗺️",
    description: "Concluir o Módulo de Adaptação Policial-Militar.",
    condition: () => false,
  },
  ESPADIM: {
    name: "Espadim",
    icon: "🗡️",
    description: "Receber o Espadim Tiradentes.",
    condition: () => false,
  },
  PROGRESS_50: {
    name: "50% do Curso",
    icon: "🏃",
    description: "Concluir 50% do curso.",
    condition: (state, type, data) =>
      type === "time_update" && data.percentage >= 50,
  },
  HUNDRED_DAYS: {
    name: "Festa dos 100 Dias",
    icon: "🎉",
    description: "Celebrar a contagem regressiva de 100 dias para a formatura.",
    condition: (state, type, data) =>
      type === "time_update" && data.days_left <= 100,
  },
  ECUMENICO: {
    name: "Culto Ecumênico",
    icon: "🙏",
    description: "Participar do culto ecumênico de formatura.",
    condition: () => false,
  },
  INSTRUCTION_END: {
    name: "Fim das Instruções",
    icon: "🏁",
    description: "Completar o último dia de instruções acadêmicas.",
    condition: () => false,
  },
  FIRST_QUEST: {
    name: "Primeira Missão",
    icon: "⚔️",
    description: "Complete sua primeira missão diária.",
    condition: (state, type) => type === "complete_quest",
  },
  FIRST_GRADE: {
    name: "Estudante",
    icon: "📖",
    description: "Adicione sua primeira nota no sistema.",
    condition: (state) => Object.values(state.grades).some((g) => g > 0),
  },
  FIRST_SERVICE: {
    name: "Primeiro Serviço",
    icon: "🛡️",
    description: "Agende seu primeiro serviço no calendário.",
    condition: (state, type) => type === "add_mission",
  },
  COURSE_COMPLETE: {
    name: "Oficial Formado",
    icon: "🎓",
    description: "Concluir os 365 dias do curso.",
    condition: (state, type, data) =>
      type === "time_update" && data.days_left <= 0,
  },
};

// =======================================================
// 4. FUNÇÕES DE AUTENTICAÇÃO E DADOS
// =======================================================
async function handleSignUp() {
  const fullName = signupNameInput.value,
    courseNumber = signupCourseNumberInput.value,
    platoon = signupPlatoonInput.value,
    password = signupPasswordInput.value;
  signupMessage.textContent = "";
  if (!fullName || !courseNumber || !platoon || !password) {
    signupMessage.textContent = "Por favor, preencha todos os campos.";
    signupMessage.className = "error-message";
    return;
  }

  const email = `${courseNumber}@cfo.pmpe`;
  const { data: authData, error: authError } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        course_number: courseNumber,
        platoon: platoon,
      },
    },
  });

  if (authError) {
    signupMessage.textContent = "Erro: Numérica já pode estar em uso.";
    signupMessage.className = "error-message";
    return;
  }

  if (authData.user) {
    signupMessage.textContent = "Sucesso! Redirecionando para login...";
    setTimeout(() => {
      signupContainer.classList.add("hidden");
      loginContainer.classList.remove("hidden");
      signupMessage.textContent = "";
    }, 2000);
  }
}

async function handleLogin() {
  const courseNumber = loginEmailInput.value,
    password = loginPasswordInput.value;
  loginError.textContent = "";
  const email = `${courseNumber}@cfo.pmpe`;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = "Numérica ou senha inválidas.";
  } else if (data.user) {
    showApp();
    loadDashboardData();
  }
}

async function handleLogout() {
  await sb.auth.signOut();
  window.location.reload();
}

async function loadUserData(user) {
  const { data, error } = await sb
    .from("profiles")
    .select("user_data, batalhao_1, batalhao_2, batalhao_3")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    return;
  }

  if (data) {
    if (data.user_data) {
      userState = data.user_data;
    } else {
      const today = new Date();
      const daysPassed = Math.max(
        0,
        Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24))
      );
      const initialXp = daysPassed * 15;
      userState = {
        grades: Object.fromEntries(subjectList.map((s) => [s, 0])),
        schedule: {},
        achievements: [],
        missions: [],
        reminders: [],
        links: [],
        quests: [],
        xp: initialXp,
        avatar: "",
        show_in_ranking: true,
      };
      await saveUserData();
    }

    // Carrega seleções de batalhão
    battalionSelect1.value = data.batalhao_1 || "";
    battalionSelect2.value = data.batalhao_2 || "";
    battalionSelect3.value = data.batalhao_3 || "";
  }

  rankingToggle.checked = userState.show_in_ranking !== false;

  if (userState.avatar) {
    userAvatarSidebar.src = userState.avatar;
    userAvatarHeader.src = userState.avatar;
  } else {
    userAvatarSidebar.src = PLACEHOLDER_AVATAR;
    userAvatarHeader.src = PLACEHOLDER_AVATAR;
  }

  if (!userState.xp) userState.xp = 0;
  if (!userState.missions) userState.missions = [];
  if (!userState.reminders) userState.reminders = [];
  if (!userState.links) userState.links = [];
  if (!userState.quests) userState.quests = [];
  if (!userState.achievements) userState.achievements = [];
  if (!userState.grades || Object.keys(userState.grades).length === 0)
    userState.grades = Object.fromEntries(subjectList.map((s) => [s, 0]));
  checkAchievements();
}

async function saveUserData() {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;
  const { error } = await sb
    .from("profiles")
    .update({ user_data: userState })
    .eq("id", user.id);
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
    console.error("Erro ao processar imagem:", error);
    alert("Não foi possível processar a imagem.");
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
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
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
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    showLoginPage();
    return;
  }
  const { data: profile } = await sb
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  if (profile) {
    userNameSidebar.textContent = profile.full_name || "Aluno Oficial";
  }

  await loadUserData(user);
  renderDashboard();
  renderAdminInfo();
}

async function renderAdminInfo() {
  const { data, error } = await sb
    .from("global_info")
    .select("*")
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) {
    console.error("Erro ao buscar informações do ADM:", error);
    return;
  }
  if (!adminInfoList) return;
  if (!data || data.length === 0) {
    adminInfoList.innerHTML = "<li><p>Nenhuma informação no momento.</p></li>";
    return;
  }
  adminInfoList.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    let content = `<strong>${item.title}</strong>`;
    if (item.description) content += `<p>${item.description}</p>`;
    if (item.type === "PROVA" && item.due_date)
      content += `<p>Data: ${new Date(
        item.due_date + "T00:00:00"
      ).toLocaleDateString("pt-BR")}</p>`;
    if (item.type === "LINK" && item.link_url)
      content += `<a href="${item.link_url}" target="_blank" rel="noopener noreferrer">Acessar Link</a>`;
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
  today.setHours(0, 0, 0, 0);
  const scheduled = (userState.missions || []).map((m) => ({
    date: new Date(m.date + "T00:00:00"),
    text: m.name,
    type: "Serviço",
  }));
  const dailies = (userState.quests || [])
    .filter((q) => !q.completed)
    .map((q) => ({ date: today, text: q.text, type: "Diária" }));
  const allTasks = [...scheduled, ...dailies]
    .filter((task) => task.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 4);

  dashboardMissionsList.innerHTML = "";
  if (allTasks.length > 0) {
    allTasks.forEach((task) => {
      const dateStr =
        task.type === "Serviço"
          ? task.date.toLocaleDateString("pt-BR")
          : "Hoje";
      dashboardMissionsList.innerHTML += `<li><div><span>${task.text}</span><span class="task-type">(${task.type})</span></div><span>${dateStr}</span></li>`;
    });
  } else {
    dashboardMissionsList.innerHTML =
      "<li><span>Nenhuma missão futura agendada.</span></li>";
  }

  dashboardRemindersList.innerHTML = "";
  const last3Reminders = (userState.reminders || [])
    .filter((r) => !r.completed)
    .slice(0, 3);
  if (last3Reminders.length > 0) {
    last3Reminders.forEach((r) => {
      dashboardRemindersList.innerHTML += `<li><span>${r.text}</span></li>`;
    });
  } else {
    dashboardRemindersList.innerHTML =
      "<li><span>Nenhum lembrete ativo.</span></li>";
  }

  dashboardAchievementsList.innerHTML = "";
  const last3Achievements = (userState.achievements || []).slice(-3).reverse();
  if (last3Achievements.length > 0) {
    last3Achievements.forEach((key) => {
      const ach = achievementsData[key];
      if (ach)
        dashboardAchievementsList.innerHTML += `<div class="achievement-icon" title="${ach.name}">${ach.icon}</div>`;
    });
  } else {
    dashboardAchievementsList.innerHTML = `<div class="achievement-icon locked" title="Nenhuma conquista desbloqueada">?</div>`;
  }
}

function updateTimeProgress() {
  const today = new Date();
  const graduationDate = new Date("2026-05-26T00:00:00");
  const totalDays = 365;
  const daysLeft = Math.ceil((graduationDate - today) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(
    0,
    Math.floor((today - COURSE_START_DATE) / (1000 * 60 * 60 * 24))
  );
  daysLeftEl.textContent = daysLeft > 0 ? daysLeft : 0;
  daysPassedEl.textContent = daysPassed >= 0 ? daysPassed : 0;
  const percentage = Math.min(100, (daysPassed / totalDays) * 100);
  courseProgressBar.style.width = `${percentage}%`;
  coursePercentageEl.innerHTML = `<span>${percentage.toFixed(
    1
  )}%</span> do curso concluído`;
  checkAchievements("time_update", { percentage, days_left: daysLeft });
}

// =======================================================
// FUNÇÕES DA PÁGINA DE JOGOS
// =======================================================

// Lista de jogos disponíveis
const games = [
    {
        id: 'desafio-cfo',
        title: 'Desafio CFO',
        description: 'Teste os seus conhecimentos sobre o Estatuto e a Lei Orgânica num desafio de velocidade e precisão.',
        url: 'game/desafio-cfo.html'
    },
    {
        id: 'lpmo',
        title: 'Quiz LPMO',
        description: 'Um jogo de perguntas e respostas para treinar os seus conhecimentos sobre a Lei de Promoção de Oficiais.',
        url: 'game/LPMO.html'
    }
];

// Função para desenhar os cartões dos jogos na tela
// Versão corrigida que abre numa nova aba
function renderGames() {
    if (!gamesList) return;
    gamesList.innerHTML = ''; 

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'doc-card'; 
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="doc-icon">🎮</div>
            <div class="doc-title">${game.title}</div>
            <div class="doc-desc" style="display: block !important;">${game.description}</div>
        `;
        
        // CORREÇÃO: Em vez de chamar openGame, abrimos a URL diretamente
        card.addEventListener('click', () => {
            window.open(game.url, '_blank');
        });
        
        gamesList.appendChild(card);
    });
}

// --- Renderização de DOCUMENTOS GLOBAIS ---
const STORAGE_BUCKET_FOR_DOCUMENTS = "documents";

async function renderDocuments(searchTerm = "") {
  if (!documentsGrid) return;
  documentsGrid.innerHTML =
    '<div class="loading">Carregando documentos...</div>';
  try {
    let query = sb
      .from("documents")
      .select("id, title, description, url, file_path, created_at");
    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    if (!data || data.length === 0) {
      documentsGrid.innerHTML =
        '<div class="empty">Nenhum documento encontrado.</div>';
      return;
    }

    documentsGrid.innerHTML = "";
    data.forEach((doc) => {
      const item = document.createElement("div");
      item.className = "doc-card";

      const ext =
        (doc.file_path || doc.url || "").split(".").pop()?.toLowerCase() || "";
      let icon = "📄";
      if (ext === "pdf") icon = "📄";
      else if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext)) icon = "🖼️";
      else if (["doc", "docx"].includes(ext)) icon = "📝";

      let href =
        doc.url ||
        (doc.file_path
          ? `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET_FOR_DOCUMENTS}/${doc.file_path}`
          : null);

      item.innerHTML = `
        <div class="doc-icon">${icon}</div>
        <div class="doc-title">${
          doc.title || doc.file_path || `Documento ${doc.id}`
        }</div>
        ${
          doc.description
            ? `<div class="doc-desc">${doc.description}</div>`
            : ""
        }
      `;

      if (href) {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => window.open(href, "_blank"));
      }
      documentsGrid.appendChild(item);
    });
  } catch (err) {
    console.error("Erro ao buscar documentos:", err);
    documentsGrid.innerHTML = `<div class="error">Erro ao carregar documentos.</div>`;
  }
}

function renderGrades() {
  gradesContainer.innerHTML = "";
  subjectList.sort().forEach((subject) => {
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
    checkAchievements("add_grade");
  }
}

async function updateGradesAverage(save = true) {
  const grades = Object.values(userState.grades).filter(
    (g) => typeof g === "number" && g > 0
  );
  let average = 0;
  const filledCount = grades.length;
  const totalCount = subjectList.length;
  if (filledCount > 0) {
    average = grades.reduce((sum, g) => sum + g, 0) / filledCount;
  }
  gradesProgressCounter.innerHTML = `<span>${filledCount}</span> / ${totalCount} matérias preenchidas (${(
    (filledCount / totalCount) *
    100
  ).toFixed(1)}%)`;
  avgGradeEl.innerHTML = `MÉDIA GERAL: <span>${
    average > 0 ? average.toFixed(2) : "N/A"
  }</span>`;
  checkAchievements("avg_update", average);

  if (save) {
    await saveUserData();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user)
      await sb
        .from("profiles")
        .update({ grades_average: average })
        .eq("id", user.id);
  }
}

// =======================================================
// FUNÇÕES PARA O MODAL DE PROGRESSO DO CURSO
// =======================================================

// Função principal para buscar os dados da sua tabela `disciplines`
// Função principal para buscar os dados da sua tabela `subjects`
async function fetchCourseProgressData() {
    const { data, error } = await sb.from('subjects').select('status, course_load');
    if (error) {
        console.error("Erro ao buscar progresso das matérias:", error);
        return null;
    }
    return data;
}



// Função para renderizar os gráficos de anel
function renderProgressCharts(stats) {
    // Destrói gráficos antigos se existirem
    if (disciplineStatusChart) disciplineStatusChart.destroy();
    if (workloadStatusChart) workloadStatusChart.destroy();

    const chartColors = ['#33FFB5', '#00AFFF', '#FF4D4D']; // Cores para Concluído, Em Andamento, Não Iniciado

    // Gráfico 1: Quantidade de Disciplinas
    const disciplineCtx = document.getElementById('discipline-status-chart').getContext('2d');
    disciplineStatusChart = new Chart(disciplineCtx, {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Não Iniciadas'],
            datasets: [{
                data: [stats.concluidas.count, stats.em_andamento.count, stats.nao_iniciadas.count],
                backgroundColor: chartColors,
                borderColor: 'var(--sl-surface)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            label += context.raw + ' disciplinas';
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Gráfico 2: Carga Horária
    const workloadCtx = document.getElementById('workload-status-chart').getContext('2d');
    workloadStatusChart = new Chart(workloadCtx, {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Não Iniciadas'],
            datasets: [{
                data: [stats.concluidas.workload, stats.em_andamento.workload, stats.nao_iniciadas.workload],
                backgroundColor: chartColors,
                borderColor: 'var(--sl-surface)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                     callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            label += context.raw + ' horas';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Função que é chamada quando o botão é clicado
async function showCourseProgress() {
    courseProgressModal.classList.remove('hidden');
    courseProgressBody.innerHTML = `<p>Carregando dados de progresso...</p>`;

    const subjects = await fetchCourseProgressData();

    if (!subjects) {
        courseProgressBody.innerHTML = `<p style="color: var(--sl-error);">Não foi possível carregar os dados.</p>`;
        return;
    }

    const totalSubjects = subjects.length;
    let totalWorkload = 0;

    const stats = {
        concluidas: { count: 0, workload: 0 },
        em_andamento: { count: 0, workload: 0 },
        nao_iniciadas: { count: 0, workload: 0 }
    };

    subjects.forEach(d => {
        totalWorkload += d.course_load; // CORREÇÃO AQUI
        if (d.status === 'CONCLUÍDO') {
            stats.concluidas.count++;
            stats.concluidas.workload += d.course_load; // CORREÇÃO AQUI
        } else if (d.status === 'EM ANDAMENTO') {
            stats.em_andamento.count++;
            stats.em_andamento.workload += d.course_load; // CORREÇÃO AQUI
        } else { // NÃO INICIADO
            stats.nao_iniciadas.count++;
            stats.nao_iniciadas.workload += d.course_load; // CORREÇÃO AQUI
        }
    });

    // Monta o HTML do corpo do modal
    courseProgressBody.innerHTML = `
        <div class="progress-stats-container">
            <div class="stats-card concluidas">
                <span class="stats-label">Disciplinas Concluídas</span>
                <span class="stats-value">${stats.concluidas.count} / ${totalSubjects} (${((stats.concluidas.count / totalSubjects) * 100).toFixed(1)}%)</span>
            </div>
             <div class="stats-card em-andamento">
                <span class="stats-label">Disciplinas em Andamento</span>
                <span class="stats-value">${stats.em_andamento.count} / ${totalSubjects} (${((stats.em_andamento.count / totalSubjects) * 100).toFixed(1)}%)</span>
            </div>
             <div class="stats-card nao-iniciadas">
                <span class="stats-label">Disciplinas Não Iniciadas</span>
                <span class="stats-value">${stats.nao_iniciadas.count} / ${totalSubjects} (${((stats.nao_iniciadas.count / totalSubjects) * 100).toFixed(1)}%)</span>
            </div>
            <div class="stats-card">
                <span class="stats-label">Carga Horária Concluída</span>
                <span class="stats-value" style="color: var(--sl-success)">${stats.concluidas.workload} / ${totalWorkload} horas</span>
            </div>
        </div>
        <div class="progress-charts-container">
            <div class="progress-chart-container">
                <div class="chart-title">Quantidade de Disciplinas</div>
                <canvas id="discipline-status-chart"></canvas>
            </div>
            <div class="progress-chart-container">
                <div class="chart-title">Carga Horária</div>
                <canvas id="workload-status-chart"></canvas>
            </div>
        </div>
    `;

    // Renderiza os gráficos com os dados calculados
    renderProgressCharts(stats);
}

function renderGradesChart() {
    const ctx = document.getElementById('grades-chart').getContext('2d');
    const gradesWithValues = Object.entries(userState.grades).filter(([, score]) => score > 0);
    
    if (gradesChartInstance) {
        gradesChartInstance.destroy();
    }

  gradesChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: gradesWithValues.map(
        ([subject]) => subject.substring(0, 15) + "..."
      ),
      datasets: [
        {
          label: "Notas",
          data: gradesWithValues.map(([, score]) => score),
          backgroundColor: "rgba(0, 175, 255, 0.6)",
          borderColor: "rgba(0, 175, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: { color: "#8A94B6", stepSize: 2 },
          grid: { color: "rgba(57, 66, 105, 0.5)" },
        },
        x: {
          ticks: { color: "#8A94B6" },
          grid: { color: "rgba(57, 66, 105, 0.2)" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (context) => gradesWithValues[context[0].dataIndex][0],
          },
        },
      },
    },
  });
}

function renderQTSSchedule() {
  qtsScheduleContainer.innerHTML =
    `<div class="qts-cell qts-header"></div>` +
    ["Seg", "Ter", "Qua", "Qui", "Sex"]
      .map((day) => `<div class="qts-cell qts-header">${day}</div>`)
      .join("");
  qtsTimes.forEach((time) => {
    qtsScheduleContainer.innerHTML += `<div class="qts-cell qts-header qts-time">${time}</div>`;
    ["Seg", "Ter", "Qua", "Qui", "Sex"].forEach((day) => {
      const materia = userState.schedule?.[day]?.[time] || "";
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
  if (calendarInstance) {
    calendarInstance.destroy();
  }
  calendarInstance = new FullCalendar.Calendar(calendarContainer, {
    locale: "pt-br",
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,dayGridWeek",
    },
    buttonText: { today: "Hoje", month: "Mês", week: "Semana" },
    events: getCalendarEvents(),
    eventClick: function (info) {
      detailModalTitle.textContent = info.event.title;
      detailModalBody.innerHTML = `<strong>Data:</strong> ${info.event.start.toLocaleDateString(
        "pt-BR"
      )}`;
      detailModal.classList.remove("hidden");
    },
  });
  calendarInstance.render();
}

function getCalendarEvents() {
  const eventColors = {
    plantão: "#E57373",
    guarda: "#64B5F6",
    auxiliar: "#FFF176",
    default: "var(--sl-primary)",
  };
  const events = (userState.missions || []).map((mission) => {
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

// =======================================================
// FUNÇÕES DE RANKING (ATUALIZADAS)
// =======================================================
function renderRanking() {
  // Verifica se a opção de exibir no ranking está desativada
  if (userState && userState.show_in_ranking === false) {
    rankingList.innerHTML = `
            <div class="ranking-private-container">
                <h3>Acesso Restrito</h3>
                <p>Você desativou a opção "Exibir no Ranking". Para visualizar, ative a opção na página <strong>Minhas Notas</strong>.</p>
            </div>`;
    return;
  }

  // Decide qual ranking renderizar com base no botão ativo
  if (showGlobalRankingButton.classList.contains("active")) {
    renderGlobalRanking();
  } else {
    renderBattalionRankings();
  }
}

async function renderGlobalRanking() {
  rankingList.innerHTML = "<p>Carregando Ranking Global...</p>";
  const { data, error } = await sb
    .from("profiles")
    .select("full_name, user_data, grades_average")
    .eq("user_data->>show_in_ranking", "true") // Filtra no backend
    .order("grades_average", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Erro ao carregar ranking global:", error);
    rankingList.innerHTML = `<p style="color: var(--sl-error);">Não foi possível carregar o ranking global.</p>`;
    return;
  }

  if (data.length === 0) {
    rankingList.innerHTML = "<p>Ninguém no ranking ainda.</p>";
    return;
  }

  rankingList.innerHTML = "";
  data.forEach((profile, index) => {
    const item = document.createElement("div");
    item.className = "ranking-item";
    const avatarSrc = profile.user_data?.avatar || PLACEHOLDER_AVATAR;
    item.innerHTML = `
            <div class="ranking-pos">${index + 1}</div>
            <img class="ranking-avatar" src="${avatarSrc}" alt="Avatar">
            <div class="ranking-info"><div class="ranking-name">${
              profile.full_name || "Anônimo"
            }</div></div>
            <div class="ranking-avg">${
              profile.grades_average
                ? Number(profile.grades_average).toFixed(2)
                : "0.00"
            }</div>`;
    rankingList.appendChild(item);
  });
}

// Substitua a função renderBattalionRankings inteira por esta:
async function renderBattalionRankings() {
  rankingList.innerHTML = "<p>Carregando Rankings dos Batalhões...</p>";
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return; // Garante que temos um usuário logado

  const { data: profile } = await sb
    .from("profiles")
    .select("batalhao_1, batalhao_2, batalhao_3")
    .eq("id", user.id)
    .single();

  const battalions = [
    profile.batalhao_1,
    profile.batalhao_2,
    profile.batalhao_3,
  ].filter(Boolean);
  if (battalions.length === 0) {
    rankingList.innerHTML = `<p>Selecione até 3 batalhões acima para comparar os rankings.</p>`;
    return;
  }

  rankingList.innerHTML = "";
  for (const battalion of battalions) {
    const section = document.createElement("div");
    section.innerHTML = `<h3>🏅 Ranking do ${battalion}</h3>`;
    rankingList.appendChild(section);

    // 1. Adicionamos 'id' ao select para identificar o usuário logado
    const { data, error } = await sb
      .from("profiles")
      .select("id, full_name, user_data, grades_average") // Adicionado 'id'
      .or(
        `batalhao_1.eq.${battalion},batalhao_2.eq.${battalion},batalhao_3.eq.${battalion}`
      )
      .eq("user_data->>show_in_ranking", "true")
      .order("grades_average", { ascending: false })
      .limit(50);

    if (error) {
      section.innerHTML += `<p style="color: var(--sl-error);">Erro ao carregar ranking para ${battalion}.</p>`;
      continue;
    }

    if (data.length === 0) {
      section.innerHTML += `<p>Nenhum combatente deste batalhão no ranking.</p>`;
      continue;
    }

    data.forEach((p, index) => {
      const item = document.createElement("div");
      item.className = "ranking-item";

      // 2. Verificamos se o perfil 'p' corresponde ao usuário logado
      const isCurrentUser = p.id === user.id;

      // Define o nome e o avatar a serem exibidos com base na verificação
      const displayName = isCurrentUser
        ? `${p.full_name} (Você)`
        : "Combatente";
      const avatarSrc = isCurrentUser
        ? p.user_data?.avatar || PLACEHOLDER_AVATAR
        : PLACEHOLDER_AVATAR;

      // Adiciona uma classe especial se for o usuário atual para o destaque
      if (isCurrentUser) {
        item.classList.add("current-user-highlight");
      }

      // 3. Monta o HTML do item com o nome condicional
      item.innerHTML = `
                <div class="ranking-pos">${index + 1}</div>
                <img class="ranking-avatar" src="${avatarSrc}" alt="Avatar">
                <div class="ranking-info"><div class="ranking-name">${displayName}</div></div>
                <div class="ranking-avg">${
                  p.grades_average
                    ? Number(p.grades_average).toFixed(2)
                    : "0.00"
                }</div>`;
      section.appendChild(item);
    });
  }
}

function renderAchievements() {
  achievementsGrid.innerHTML = "";
  for (const key in achievementsData) {
    const ach = achievementsData[key];
    const unlocked = (userState.achievements || []).includes(key);
    achievementsGrid.innerHTML += `<div class="achievement" data-key="${key}" title="Clique para ver detalhes"><div class="achievement-icon ${
      unlocked ? "unlocked" : ""
    }">${ach.icon}</div><div class="achievement-title">${ach.name}</div></div>`;
  }
}

function checkAchievements(eventType, data) {
  if (!userState.achievements) userState.achievements = [];
  let stateChanged = false;
  for (const key in achievementsData) {
    if (
      !userState.achievements.includes(key) &&
      achievementsData[key].condition(userState, eventType, data)
    ) {
      userState.achievements.push(key);
      stateChanged = true;
    }
  }
  if (stateChanged) saveUserData();
}

function addXp(amount) {
  if (!userState.xp) userState.xp = 0;
  userState.xp += amount;
  checkAchievements();
  saveUserData();
  renderDashboard();
}

function renderQuests() {
  questsList.innerHTML = "";
  if (!userState.quests) return;
  userState.quests.forEach((q, index) => {
    const item = document.createElement("div");
    item.className = `list-item quest-item ${q.completed ? "completed" : ""}`;
    item.innerHTML = `<label><input type="checkbox" data-index="${index}" ${
      q.completed ? "checked" : ""
    }> <span>${q.text}</span></label><span class="quest-xp">${q.xp} XP</span>`;
    questsList.appendChild(item);
  });
}

function addQuest(e) {
  e.preventDefault();
  const text = questTextInput.value.trim(),
    difficulty = questDifficultySelect.value;
  if (!text) return;
  const xpMap = { easy: 10, medium: 50, hard: 100 };
  const newQuest = {
    text,
    difficulty,
    xp: xpMap[difficulty],
    completed: false,
  };
  if (!userState.quests) userState.quests = [];
  userState.quests.push(newQuest);
  addQuestForm.reset();
  saveUserData();
  renderQuests();
}

function handleQuestInteraction(e) {
  if (e.target.type !== "checkbox") return;
  const index = e.target.dataset.index;
  const quest = userState.quests[index];
  if (!quest || quest.completed) return;
  quest.completed = true;
  addXp(quest.xp);
  checkAchievements("complete_quest", quest);
  saveUserData();
  e.target.closest(".quest-item").classList.add("completed");
}

function clearCompletedQuests() {
  if (!userState.quests) return;
  userState.quests = userState.quests.filter((q) => !q.completed);
  saveUserData();
  renderQuests();
}

function renderScheduledMissions() {
  scheduledMissionsList.innerHTML = "";
  if (!userState.missions) return;
  userState.missions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((m, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${new Date(m.date + "T00:00:00").toLocaleDateString(
        "pt-BR"
      )} - ${m.name}</span><button data-index="${index}">X</button>`;
      scheduledMissionsList.appendChild(li);
    });
}

function addCustomMission(e) {
  e.preventDefault();
  const name = missionNameInput.value.trim(),
    date = missionDateInput.value;
  if (name && date) {
    if (!userState.missions) userState.missions = [];
    userState.missions.push({ name, date });
    addMissionForm.reset();
    checkAchievements("add_mission", { date });
    saveUserData();
    renderScheduledMissions();
    if (calendarInstance) calendarInstance.refetchEvents();
  }
}

function renderReminders() {
  remindersList.innerHTML = "";
  if (!userState.reminders) return;
  userState.reminders.forEach((r, index) => {
    const item = document.createElement("div");
    item.className = `list-item reminder-item ${
      r.completed ? "completed" : ""
    }`;
    item.innerHTML = `<label><input type="checkbox" data-index="${index}" ${
      r.completed ? "checked" : ""
    }> <span>${r.text}</span></label><button data-index="${index}">X</button>`;
    remindersList.appendChild(item);
  });
}

function addReminder() {
  const text = reminderInput.value.trim();
  if (text) {
    if (!userState.reminders) userState.reminders = [];
    userState.reminders.push({ text, completed: false });
    reminderInput.value = "";
    checkAchievements("add_reminder");
    saveUserData();
    renderReminders();
  }
}

function handleReminderInteraction(e) {
  const index = e.target.dataset.index;
  if (index === undefined) return;
  if (e.target.type === "checkbox")
    userState.reminders[index].completed = e.target.checked;
  if (e.target.tagName === "BUTTON") userState.reminders.splice(index, 1);
  saveUserData();
  renderReminders();
}

function renderLinks() {
  linksList.innerHTML = "";
  if (!userState.links) return;
  userState.links.forEach((link, index) => {
    const item = document.createElement("div");
    item.className = "list-item link-item";
    let content =
      link.type === "link"
        ? `<a href="${link.value}" target="_blank" rel="noopener noreferrer">${link.title} 🔗</a><span>${link.value}</span>`
        : `<div>${link.title} 📄</div><span>SEI: ${link.value}</span>`;
    item.innerHTML = `<div class="link-item-info">${content}</div><div class="link-buttons"><button class="edit-link-btn" data-index="${index}">✏️</button><button data-index="${index}">X</button></div>`;
    linksList.appendChild(item);
  });
}

function addLink(e) {
  e.preventDefault();
  let value = linkValueInput.value.trim();
  const title = linkTitleInput.value.trim(),
    type = linkTypeInput.value;
  if (title && value) {
    if (type === "link" && !value.startsWith("http"))
      value = `https://${value}`;
    if (!userState.links) userState.links = [];

    if (editingLinkId !== null) {
      userState.links[editingLinkId] = { title, value, type };
      editingLinkId = null;
    } else {
      userState.links.push({ title, value, type });
    }

    addLinkForm.reset();
    checkAchievements("add_link");
    saveUserData();
    renderLinks();
  }
}

function handleLinkInteraction(e) {
  if (e.target.tagName !== "BUTTON") return;
  const index = e.target.dataset.index;
  if (e.target.classList.contains("edit-link-btn")) {
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
function showApp() {
  authPage.classList.add("hidden");
  appPage.classList.remove("hidden");
}
function showLoginPage() {
  authPage.classList.remove("hidden");
  appPage.classList.add("hidden");
}
function showRankingInfoPopup() {
  // Usa sessionStorage para mostrar o popup apenas uma vez por sessão
  if (!sessionStorage.getItem("rankingInfoShown")) {
    const modal = document.getElementById("ranking-info-modal");
    if (modal) {
      modal.classList.remove("hidden");
      sessionStorage.setItem("rankingInfoShown", "true");
    }
  }
}
async function checkSession() {
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (session) {
    showApp();
    loadDashboardData();
  } else {
    signupContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  }
}

function handlePageNavigation(e) {
  if (e.target.tagName !== "A") return;
  const targetPageId = e.target.dataset.page;
  if (!targetPageId) return;

  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  document.getElementById(targetPageId).classList.add("active");
  e.target.classList.add("active");
  pageTitleEl.textContent = e.target.textContent;

  if (targetPageId === "page-grades") renderGrades();
  if (targetPageId === "page-schedule") renderQTSSchedule();
  if (targetPageId === "page-calendar") initCalendar();
  if (targetPageId === "page-ranking") {
    renderRanking();
    showRankingInfoPopup(); // <-- ADICIONE ESTA LINHA
  }

  if (targetPageId === "page-daily-quests") renderQuests();
  if (targetPageId === "page-reminders") renderReminders();
  if (targetPageId === "page-links") renderLinks();
  if (targetPageId === "page-documents") renderDocuments();
  if (targetPageId === 'page-missions') renderScheduledMissions();
  if (targetPageId === 'page-games') renderGames();

  if (window.innerWidth <= 768) {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  loginButton.addEventListener("click", handleLogin);
  signupButton.addEventListener("click", handleSignUp);
  logoutButton.addEventListener("click", handleLogout);
  sidebarNav.addEventListener("click", handlePageNavigation);
  showSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    signupContainer.classList.remove("hidden");
  });
  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });

  // --- Listeners de Páginas Específicas ---
  gradesContainer.addEventListener("click", (e) => {
    const label = e.target.closest(".grade-item-label");
    if (label) {
      detailModalTitle.textContent = "Nome da Matéria";
      detailModalBody.textContent = label.getAttribute("title");
      detailModal.classList.remove("hidden");
    }
    // Adicione estes listeners para o novo modal de progresso
    if (showProgressModalButton) {
      showProgressModalButton.addEventListener("click", showCourseProgress);
    }
    if (courseProgressModal) {
      courseProgressModalClose.addEventListener("click", () =>
        courseProgressModal.classList.add("hidden")
      );
      courseProgressModal.addEventListener("click", (e) => {
        if (e.target === courseProgressModal) {
          courseProgressModal.classList.add("hidden");
        }
      });
    }
  });

  // Adicione estes listeners para o novo modal de ranking
  const rankingInfoModal = document.getElementById("ranking-info-modal");
  const rankingInfoModalClose = document.getElementById(
    "ranking-info-modal-close"
  );

  if (rankingInfoModal && rankingInfoModalClose) {
    rankingInfoModalClose.addEventListener("click", () =>
      rankingInfoModal.classList.add("hidden")
    );
    rankingInfoModal.addEventListener("click", (e) => {
      if (e.target === rankingInfoModal) {
        rankingInfoModal.classList.add("hidden");
      }
    });
  }

  saveGradesButton.addEventListener("click", () => {
    document
      .querySelectorAll("#grades-container .grade-item-input")
      .forEach((input) => {
        handleGradeChange({ target: input });
      });
    saveUserData().then(() => {
      updateGradesAverage(true);
      renderGradesChart();
      saveGradesButton.textContent = "Salvo!";
      setTimeout(() => {
        saveGradesButton.textContent = "Salvar Alterações";
      }, 1500);
    });
  });

  gradeSearchInput.addEventListener("input", () => {
    const searchTerm = gradeSearchInput.value.toLowerCase();
    document
      .querySelectorAll("#grades-container .grade-item")
      .forEach((item) => {
        const subjectName = item
          .querySelector(".grade-item-label")
          .getAttribute("title")
          .toLowerCase();
        item.style.display = subjectName.includes(searchTerm) ? "flex" : "none";
      });
  });

  qtsScheduleContainer.addEventListener("change", handleQTSInput);
  addMissionForm.addEventListener("submit", addCustomMission);
  scheduledMissionsList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      userState.missions.splice(e.target.dataset.index, 1);
      saveUserData();
      renderScheduledMissions();
      if (calendarInstance) calendarInstance.refetchEvents();
    }
  });
  addReminderButton.addEventListener("click", addReminder);
  remindersList.addEventListener("click", handleReminderInteraction);
  addLinkForm.addEventListener("submit", addLink);
  linksList.addEventListener("click", handleLinkInteraction);
  uploadAvatarButton.addEventListener("click", () => uploadAvatarInput.click());
  uploadAvatarInput.addEventListener("change", (event) => {
    if (event.target.files[0]) uploadAvatar(event.target.files[0]);
  });
  addQuestForm.addEventListener("submit", addQuest);
  questsList.addEventListener("change", handleQuestInteraction);
  clearCompletedQuestsButton.addEventListener("click", clearCompletedQuests);

  let searchTimeout = null;
  documentSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(
      () => renderDocuments(documentSearchInput.value.trim()),
      250
    );
  });

  // --- Listeners de Componentes (Modais, Sidebar) ---
  achievementsWidget.addEventListener("click", () => {
    renderAchievements();
    achievementsModal.classList.remove("hidden");
  });
  achievementsModalClose.addEventListener("click", () =>
    achievementsModal.classList.add("hidden")
  );
  achievementsModal.addEventListener("click", (e) => {
    if (e.target === achievementsModal)
      achievementsModal.classList.add("hidden");
  });

  hamburgerButton.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("hidden");
  });
  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.add("hidden");
  });

  detailModalClose.addEventListener("click", () =>
    detailModal.classList.add("hidden")
  );
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.classList.add("hidden");
  });
  achievementsGrid.addEventListener("click", (e) => {
    const achievementElement = e.target.closest(".achievement");
    if (!achievementElement) return;
    const key = achievementElement.dataset.key;
    const achData = achievementsData[key];
    if (achData) {
      detailModalTitle.textContent = `${achData.icon} ${achData.name}`;
      detailModalBody.textContent = achData.description;
      detailModal.classList.remove("hidden");
    }
  });

  // --- Listener de Privacidade do Ranking ---
  if (rankingToggle) {
    rankingToggle.addEventListener("change", async () => {
      userState.show_in_ranking = rankingToggle.checked;
      await saveUserData();
      const rankingPageEl = document.getElementById("page-ranking");
      if (rankingPageEl && rankingPageEl.classList.contains("active")) {
        renderRanking();
      }
    });
  }

  // =======================================================
  // 7. EVENT LISTENERS PARA O NOVO RANKING
  // =======================================================
  saveBattalionsButton.addEventListener("click", async () => {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;

    const updates = {
      batalhao_1: battalionSelect1.value || null,
      batalhao_2: battalionSelect2.value || null,
      batalhao_3: battalionSelect3.value || null,
    };

    const { error } = await sb
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      rankingMessage.textContent = "Erro ao salvar.";
      rankingMessage.style.color = "var(--sl-error)";
      console.error("Erro ao salvar batalhões:", error);
    } else {
      rankingMessage.textContent = "Batalhões salvos!";
      rankingMessage.style.color = "var(--sl-success)";
      // Re-renderiza o ranking de batalhões se estiver ativo
      if (showBattalionRankingButton.classList.contains("active")) {
        renderBattalionRankings();
      }
    }
    setTimeout(() => {
      rankingMessage.textContent = "";
    }, 3000);
  });

  showGlobalRankingButton.addEventListener("click", () => {
    showGlobalRankingButton.classList.add("active");
    showBattalionRankingButton.classList.remove("active");
    renderRanking();
  });

  showBattalionRankingButton.addEventListener("click", () => {
    showBattalionRankingButton.classList.add("active");
    showGlobalRankingButton.classList.remove("active");
    renderRanking();
  });
// --- Listeners para o Modal de Progresso do Curso ---
        const showProgressModalButton = document.getElementById('show-progress-modal-button');
        const courseProgressModal = document.getElementById('course-progress-modal');
        const courseProgressModalClose = document.getElementById('course-progress-modal-close');
        
       if (showProgressModalButton) {
            showProgressModalButton.addEventListener('click', () => {
                showCourseProgress();
            });
        } else {
            console.error("❌ Botão não encontrado no DOM!");
        }
        
        if (courseProgressModal && courseProgressModalClose) {
            courseProgressModalClose.addEventListener('click', () => courseProgressModal.classList.add('hidden'));
            
            courseProgressModal.addEventListener('click', (e) => {
                // Fecha o modal se o clique for na área externa (o fundo)
                if (e.target === courseProgressModal) {
                    courseProgressModal.classList.add('hidden');
                }
            });
        }

});
