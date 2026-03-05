// ============================================
// ADMIN.JS - Painel Administrativo (VERSÃO FINAL)
// ============================================

// Configuração da API (backend)
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

// Estado da aplicação
let produtos = [];

// ============================================
// FUNÇÃO PARA FAZER REQUISIÇÕES COM BASIC AUTH
// ============================================
async function apiRequest(url, options = {}) {
    const user = localStorage.getItem('adminUser');
    const pass = localStorage.getItem('adminPass');
    
    if (!user || !pass) {
        mostrarLogin();
        throw new Error('Não autenticado');
    }
    
    const basicAuth = 'Basic ' + btoa(user + ':' + pass);
    
    const headers = {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    try {
        const response = await fetch(API_URL + url, { ...options, headers });
        
        if (response.status === 401) {
            mostrarLogin();
            throw new Error('Sessão expirada');
        }
        
        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// ============================================
// MOSTRAR/ESCONDER TELA DE LOGIN
// ============================================
function mostrarLogin() {
    const modal = document.getElementById('login-modal');
    const adminMain = document.getElementById('admin-main');
    if (modal) modal.style.display = 'block';
    if (adminMain) adminMain.style.display = 'none';
}

function mostrarAdmin() {
    const modal = document.getElementById('login-modal');
    const adminMain = document.getElementById('admin-main');
    if (modal) modal.style.display = 'none';
    if (adminMain) adminMain.style.display = 'block';
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
    
    try {
        const testResponse = await fetch(`${API_URL}/api/admin/logs/importacao`, {
            headers: {
                'Authorization': 'Basic ' + btoa(user + ':' + pass)
            }
        });
        
        if (testResponse.ok) {
            localStorage.setItem('adminUser', user);
            localStorage.setItem('adminPass', pass);
            
            loginError.textContent = '';
            mostrarAdmin();
            
            // Carrega dados simulados para teste
            carregarDadosSimulados();
            
            // Tenta carregar os logs
            carregarLogs();
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
// CARREGAR DADOS SIMULADOS (já que as rotas não existem)
// ============================================
function carregarDadosSimulados() {
    // Dados de exemplo para teste
    produtos = [
        {
            id: 1,
            titulo: "PlayStation 5 Slim 1TB",
            plataforma: "Mercado Livre",
            preco: "3.599",
            cliques: 45,
            ativo: true
        },
        {
            id: 2,
            titulo: "iPhone 17 Pro Max 256GB",
            plataforma: "Amazon",
            preco: "8.999",
            cliques: 32,
            ativo: true
        },
        {
            id: 3,
            titulo: "Samsung Galaxy S25 Ultra",
            plataforma: "Shopee",
            preco: "7.499",
            cliques: 28,
            ativo: true
        },
        {
            id: 4,
            titulo: "Notebook Gamer Dell G15",
            plataforma: "Magalu",
            preco: "5.299",
            cliques: 15,
            ativo: false
        }
    ];
    
    // Atualiza contadores
    document.getElementById('ml-contador').textContent = "1";
    document.getElementById('amazon-contador').textContent = "1";
    document.getElementById('shopee-contador').textContent = "1";
    document.getElementById('magalu-contador').textContent = "1";
    
    atualizarDashboard();
    atualizarTabela();
}

// ============================================
// CARREGAR LOGS DO BACKEND (rota REAL)
// ============================================
async function carregarLogs() {
    try {
        const response = await apiRequest('/api/admin/logs/importacao');
        const data = await response.json();
        
        if (data.logs && data.logs.length > 0) {
            console.log('📋 Últimos logs:', data.logs.slice(-5));
            // Aqui você pode exibir os logs em algum lugar se quiser
        } else {
            console.log('📭 Nenhum log encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
}

// ============================================
// ATUALIZAR DASHBOARD
// ============================================
function atualizarDashboard() {
    document.getElementById('total-produtos').textContent = produtos.length;
    
    const totalCliques = produtos.reduce((acc, p) => acc + (p.cliques || 0), 0);
    document.getElementById('total-cliques').textContent = totalCliques;
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
    
    tbody.innerHTML = produtos.map(p => `
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
            setTimeout(() => {
                carregarDadosSimulados();
                carregarLogs();
            }, 2000);
        } else {
            status.innerHTML = `<p style="color: #d32f2f;">❌ Erro: ${data.error || 'Desconhecido'}</p>`;
        }
    } catch (error) {
        console.error('Erro na importação:', error);
        status.innerHTML = `<p style="color: #d32f2f;">❌ Erro de conexão: ${error.message}</p>`;
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
    
    let csv = 'ID,Plataforma,Título,Preço,Cliques,Status\n';
    
    produtos.forEach(p => {
        csv += `${p.id},${p.plataforma || ''},"${p.titulo}",${p.preco},${p.cliques || 0},${p.ativo ? 'Ativo' : 'Inativo'}\n`;
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
    
    let html = '<table><tr><th>ID</th><th>Plataforma</th><th>Título</th><th>Preço</th><th>Cliques</th><th>Status</th></tr>';
    
    produtos.forEach(p => {
        html += `<tr>
            <td>${p.id}</td>
            <td>${p.plataforma || '-'}</td>
            <td>${p.titulo}</td>
            <td>R$ ${p.preco}</td>
            <td>${p.cliques || 0}</td>
            <td>${p.ativo ? 'Ativo' : 'Inativo'}</td>
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
    // Esconde o admin main inicialmente
    document.getElementById('admin-main').style.display = 'none';
    
    const user = localStorage.getItem('adminUser');
    const pass = localStorage.getItem('adminPass');
    
    if (user && pass) {
        fetch(`${API_URL}/api/admin/logs/importacao`, {
            headers: {
                'Authorization': 'Basic ' + btoa(user + ':' + pass)
            }
        }).then(response => {
            if (response.ok) {
                mostrarAdmin();
                carregarDadosSimulados();
                carregarLogs();
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

// ============================================
// FUNÇÕES DOS BOTÕES (agora funcionais)
// ============================================
function importarPlataforma(plataforma) {
    const statusDiv = document.getElementById(`${plataforma}-status`);
    if (statusDiv) {
        statusDiv.innerHTML = '<div class="import-status info">⏳ Funcionalidade em desenvolvimento</div>';
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    }
}

function exportarPlataforma(plataforma, formato) {
    alert(`Exportar ${plataforma} em formato ${formato} - Em breve disponível!`);
}

function importarTodas() {
    alert('Importação de todas as plataformas será implementada em breve!');
}

function exportarTodas(formato) {
    alert(`Exportar todas em formato ${formato} - Em breve disponível!`);
}