document.addEventListener('DOMContentLoaded', () => {
    // --- CONEXÃO COM O SUPABASE ---
    const supabaseUrl = 'https://svijubigtigsrpfqzcgf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k-Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    // ---------------------------------

    // --- SELETORES DE UI ---
    const ui = {
        adminContainer: document.getElementById('admin-container'),
        adminLogoutButton: document.getElementById('admin-logout-button'),
        announcementInput: document.getElementById('announcement-input'),
        publishAnnouncementButton: document.getElementById('publish-announcement-button'),
        adminUserList: document.getElementById('admin-user-list')
    };

    let adminProfile = {};

    // --- FUNÇÕES DO PAINEL DE ADMIN ---

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = 'index.html'; // Redireciona para a página principal
    }

    async function addAnnouncement() {
        const content = ui.announcementInput.value.trim();
        if (!content) {
            alert('O aviso não pode estar vazio.');
            return;
        }

        const { error } = await supabase.from('announcements').insert({ 
            content: content, 
            author_name: adminProfile.nome_de_guerra 
        });

        if (error) {
            alert('Erro ao publicar aviso: ' + error.message);
            console.error(error);
        } else {
            alert('Aviso publicado com sucesso!');
            ui.announcementInput.value = '';
        }
    }

    async function renderUserList() {
        ui.adminUserList.innerHTML = 'Carregando usuários...';
        const { data, error } = await supabase.from('profiles').select('*').order('numerica', { ascending: true });
        
        if (error) {
            ui.adminUserList.innerHTML = 'Erro ao carregar usuários.';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nome de Guerra</th>
                        <th>Numérica</th>
                        <th>Pelotão</th>
                        <th>Nível</th>
                        <th>Média</th>
                        <th>Cargo</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(user => {
            tableHTML += `
                <tr>
                    <td>${user.nome_de_guerra}</td>
                    <td>${user.numerica}</td>
                    <td>${user.pelotao}</td>
                    <td>${user.level}</td>
                    <td>${user.grades_average.toFixed(2)}</td>
                    <td>${user.role}</td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table>';
        ui.adminUserList.innerHTML = tableHTML;
    }


    // --- PONTO DE ENTRADA E VERIFICAÇÃO DE SEGURANÇA ---

    async function checkAdminStatus() {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se não houver sessão, redireciona imediatamente para a página de login
        if (!session) {
            window.location.href = 'index.html';
            return;
        }

        // Se houver sessão, verifica se o usuário tem o cargo de 'admin'
        const { data, error } = await supabase.from('profiles')
            .select('role, nome_de_guerra')
            .eq('id', session.user.id)
            .single();

        // Se não encontrar o perfil ou o cargo não for 'admin', redireciona
        if (error || !data || data.role !== 'admin') {
            alert('Acesso negado. Você não tem permissão para ver esta página.');
            window.location.href = 'index.html';
            return;
        }

        // Se for admin, guarda o perfil e inicia o painel
        adminProfile = data;
        initAdminPanel();
    }
    
    function initAdminPanel() {
        ui.adminContainer.classList.remove('hidden');
        ui.adminLogoutButton.addEventListener('click', handleLogout);
        ui.publishAnnouncementButton.addEventListener('click', addAnnouncement);
        renderUserList();
    }

    // Inicia a verificação de segurança assim que a página carrega
    checkAdminStatus();
});
