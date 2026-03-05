// ============================================
// ADMIN.JS - Painel Administrativo (CORRIGIDO)
// ============================================

// Configuração da API (backend)
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

// Estado da aplicação
let produtos = [];

// ============================================
// FUNÇÃO PARA FAZER REQUISIÇÕES COM BASIC AUTH
// ============================================
async function apiRequest(url, options = {}) {
    // Pega usuário e senha do localStorage (salvos após login)
    const user = localStorage.getItem('adminUser');
    const pass = localStorage.getItem('adminPass');
    
    if (!user || !pass) {
        mostrarLogin();
        throw new Error('Não autenticado');
    }
    
    // Cria o cabeçalho de autenticação Basic
    const basicAuth = 'Basic ' + btoa(user + ':' + pass);
    
    const headers = {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const response = await fetch(API_URL + url, { ...options, headers });
    
    // Se não autorizado, volta para o login
    if (response.status === 401) {
        mostrarLogin();
        throw new Error('Sessão expirada');
    }
    
    return response;
}

// ============================================
// MOSTRAR/ESCONDER TELA DE LOGIN
// ============================================
function mostrarLogin() {
    document.getElementById('login-modal').style.display = 'block';
    document.getElementById('admin-main').style.display = 'none';
}

function mostrarAdmin() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-main').style.display = 'block';
}

// ============================================
// LOGIN
// ============================================
document.getElementById('btn-login')?.addEventListener('click', async () => {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const loginError = document.getElementById('login-error');
    
    if (!user || !pass) {
        loginError.textContent = 'Preencha usuário e senha';
        return;
    }
    
    // Testa se as credenciais funcionam
    try {
        const testResponse = await fetch(`${API_URL}/api/admin/logs/importacao`, {
            headers: {
                'Authorization': 'Basic ' + btoa(user + ':' + pass)
            }
        });
        
        if (testResponse.ok) {
            // Salva as credenciais
            localStorage.setItem('adminUser', user);
            localStorage.setItem('adminPass', pass);
            
            loginError.textContent = '';
            mostrarAdmin();
            carregarDados();
        } else {
            loginError.textContent = 'Usuário ou senha inválidos';
        }
    } catch (error) {
		console.error('Erro detalhado:', error);
		loginError.textContent = `Erro: ${error.message}. Verifique se o backend está acessível.`;
	}
});

// ============================================
// LOGOUT
// ============================================
document.getElementById('logout-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPass');
    mostrarLogin();
});

// ============================================
// FECHAR MODAL
// ============================================
document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'none';
});

// ============================================
// CARREGAR DADOS DO BANCO
// ============================================
async function carregarDados() {
    try {
        // Carrega os produtos (rota que você precisa criar no backend)
        const response = await apiRequest('/api/admin/produtos');
        produtos = await response.json();
        
        atualizarDashboard();
        atualizarTabela();
        
        // Carrega contadores por plataforma
        await carregarContadoresPlataformas();
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

// ============================================
// CARREGAR CONTADORES DAS PLATAFORMAS
// ============================================
async function carregarContadoresPlataformas() {
    try {
        const response = await apiRequest('/api/admin/contadores');
        const contadores = await response.json();
        
        document.getElementById('ml-contador').textContent = contadores.mercadolivre || 0;
        document.getElementById('amazon-contador').textContent = contadores.amazon || 0;
        document.getElementById('shopee-contador').textContent = contadores.shopee || 0;
        document.getElementById('magalu-contador').textContent = contadores.magalu || 0;
        
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
    }
}

// ============================================
// ATUALIZAR DASHBOARD
// ============================================
function atualizarDashboard() {
    document.getElementById('total-produtos').textContent = produtos.length;
    
    const totalCliques = produtos.reduce((acc, p) => acc + (p.cliques || 0), 0);
    document.getElementById('total-cliques').textContent = totalCliques;
    
    if (produtos.length > 0) {
        const ultimaColeta = produtos[0].data_coleta;
        document.getElementById('data-coleta').textContent = 
            ultimaColeta ? new Date(ultimaColeta).toLocaleDateString('pt-BR') : '-';
    }
}

// ============================================
// ATUALIZAR TABELA
// ============================================
function atualizarTabela() {
    const tbody = document.getElementById('tabela-body');
    if (!tbody) return;
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.slice(0, 20).map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${p.plataforma || '-'}</td>
            <td>${p.titulo.substring(0, 50)}...</td>
            <td>R$ ${p.preco}</td>
            <td>${p.cliques || 0}</td>
            <td>${p.ativo ? '✅' : '❌'}</td>
        </tr>
    `).join('');
}

// ============================================
// IMPORTAR PRODUTOS (MERCADO LIVRE)
// ============================================
document.getElementById('btn-importar')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-importar');
    const status = document.getElementById('import-status');
    
    btn.disabled = true;
    btn.textContent = 'Importando...';
    status.innerHTML = '<p style="color: #ff6a00;">⏳ Iniciando importação...</p>';
    
    try {
        const response = await apiRequest('/api/admin/importar/mercadolivre', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            status.innerHTML = `<p style="color: #2e7d32;">✅ ${data.message}</p>`;
            setTimeout(() => carregarDados(), 2000);
        } else {
            status.innerHTML = `<p style="color: #d32f2f;">❌ Erro: ${data.error}</p>`;
        }
    } catch (error) {
        status.innerHTML = `<p style="color: #d32f2f;">❌ Erro de conexão</p>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Importação';
    }
});

// ============================================
// EXPORTAR CSV
// ============================================
document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    if (produtos.length === 0) return;
    
    let csv = 'ID,Plataforma,Título,Preço,Cliques,Link Original\n';
    
    produtos.forEach(p => {
        csv += `${p.id},${p.plataforma || ''},"${p.titulo}",${p.preco},${p.cliques || 0},${p.link_original}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produtos_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
});

// ============================================
// EXPORTAR EXCEL
// ============================================
document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    if (produtos.length === 0) return;
    
    let html = '<table><tr><th>ID</th><th>Plataforma</th><th>Título</th><th>Preço</th><th>Cliques</th><th>Link Original</th></tr>';
    
    produtos.forEach(p => {
        html += `<tr>
            <td>${p.id}</td>
            <td>${p.plataforma || '-'}</td>
            <td>${p.titulo}</td>
            <td>${p.preco}</td>
            <td>${p.cliques || 0}</td>
            <td>${p.link_original}</td>
        </tr>`;
    });
    
    html += '</table>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produtos_${new Date().toISOString().slice(0,10)}.xls`;
    link.click();
});

// ============================================
// INICIALIZAÇÃO
// ============================================
if (window.location.pathname.includes('admin.html')) {
    const user = localStorage.getItem('adminUser');
    const pass = localStorage.getItem('adminPass');
    
    if (user && pass) {
        // Testa se as credenciais ainda funcionam
        fetch(`${API_URL}/api/admin/logs/importacao`, {
            headers: {
                'Authorization': 'Basic ' + btoa(user + ':' + pass)
            }
        }).then(response => {
            if (response.ok) {
                mostrarAdmin();
                carregarDados();
            } else {
                mostrarLogin();
            }
        }).catch(() => {
            mostrarLogin();
        });
    } else {
        mostrarLogin();
    }
}

// Funções temporárias para os botões
function importarPlataforma(plataforma) {
    document.getElementById(`${plataforma}-status`).innerHTML = 
        '<div class="import-status info">⏳ Importando ' + plataforma + '...</div>';
}

function exportarPlataforma(plataforma, formato) {
    alert(`Exportar ${plataforma} em formato ${formato} - Aguardando implementação`);
}

function importarTodas() {
    alert('Importar todas as plataformas - Aguardando implementação');
}

function exportarTodas(formato) {
    alert(`Exportar todas em formato ${formato} - Aguardando implementação`);
}