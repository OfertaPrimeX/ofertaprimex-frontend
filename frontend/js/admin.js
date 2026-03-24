// ============================================
// ADMIN.JS - Painel Administrativo (VERSÃO ATUALIZADA)
// ============================================

const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';
let produtos = [];

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
            carregarDadosReais(); // AGORA CARREGA DADOS REAIS
            carregarLogs();
            carregarContadores(); // NOVO: carrega contadores por plataforma
        } else {
            loginError.textContent = 'Usuário ou senha inválidos';
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        loginError.textContent = `Erro: ${error.message}. Verifique se o backend está acessível.`;
    }
});

document.getElementById('logout-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPass');
    mostrarLogin();
});

document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'none';
});

// ============================================
// NOVA FUNÇÃO: CARREGAR DADOS REAIS DO BANCO
// ============================================
async function carregarDadosReais() {
    try {
        // Buscar produtos do Mercado Livre
        const response = await apiRequest('/api/produtos/buscar?q=');
        const data = await response.json();
        
        if (data.success && data.products) {
            produtos = data.products.map(p => ({
                id: p.id,
                titulo: p.titulo,
                plataforma: p.plataforma || 'Mercado Livre',
                preco: p.preco,
                cliques: p.cliques || 0,
                ativo: true
            }));
        } else {
            produtos = [];
        }
        
        atualizarDashboard();
        atualizarTabela();
        
    } catch (error) {
        console.error('Erro ao carregar dados reais:', error);
        carregarDadosSimulados(); // Fallback para dados simulados
    }
}

// ============================================
// FUNÇÃO PARA CARREGAR CONTADORES POR PLATAFORMA
// ============================================
async function carregarContadores() {
    try {
        // Mercado Livre
        const mlResponse = await apiRequest('/api/produtos/contador?plataforma=mercadolivre');
        const mlData = await mlResponse.json();
        document.getElementById('ml-contador').textContent = mlData.total || 0;
        
        // Amazon (quando implementado)
        document.getElementById('amazon-contador').textContent = 0;
        document.getElementById('shopee-contador').textContent = 0;
        document.getElementById('magalu-contador').textContent = 0;
        
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
        // Fallback para dados simulados
        document.getElementById('ml-contador').textContent = "1";
        document.getElementById('amazon-contador').textContent = "1";
        document.getElementById('shopee-contador').textContent = "1";
        document.getElementById('magalu-contador').textContent = "1";
    }
}

// ============================================
// FUNÇÃO DE FALLBACK (dados simulados)
// ============================================
function carregarDadosSimulados() {
    produtos = [
        { id: 1, titulo: "PlayStation 5 Slim 1TB", plataforma: "Mercado Livre", preco: "3.599", cliques: 45, ativo: true },
        { id: 2, titulo: "iPhone 17 Pro Max 256GB", plataforma: "Amazon", preco: "8.999", cliques: 32, ativo: true },
        { id: 3, titulo: "Samsung Galaxy S25 Ultra", plataforma: "Shopee", preco: "7.499", cliques: 28, ativo: true },
        { id: 4, titulo: "Notebook Gamer Dell G15", plataforma: "Magalu", preco: "5.299", cliques: 15, ativo: false }
    ];
    
    document.getElementById('ml-contador').textContent = "1";
    document.getElementById('amazon-contador').textContent = "1";
    document.getElementById('shopee-contador').textContent = "1";
    document.getElementById('magalu-contador').textContent = "1";
    
    atualizarDashboard();
    atualizarTabela();
}

async function carregarLogs() {
    try {
        const response = await apiRequest('/api/admin/logs/importacao');
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
            console.log('📋 Últimos logs:', data.logs.slice(-5));
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
}

function atualizarDashboard() {
    document.getElementById('total-produtos').textContent = produtos.length;
    const totalCliques = produtos.reduce((acc, p) => acc + (p.cliques || 0), 0);
    document.getElementById('total-cliques').textContent = totalCliques;
}

function atualizarTabela() {
    const tbody = document.getElementById('tabela-body');
    if (!tbody) return;
    
    if (produtos.length === 0) {
        tbody.innerHTML = '发展<td colspan="6" style="text-align: center;">Nenhum produto encontrado</td>发展';
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
// BOTÃO DE IMPORTAÇÃO DO MERCADO LIVRE (CORRIGIDO)
// ============================================
document.getElementById('btn-importar')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-importar');
    const status = document.getElementById('import-status');
    
    btn.disabled = true;
    btn.textContent = 'Importando...';
    status.innerHTML = '<p style="color: #ff6a00;">⏳ Iniciando importação...</p>';
    
    try {
        const response = await apiRequest('/api/admin/importar/mercadolivre', { method: 'POST' });
        const data = await response.json();
        
        if (response.ok) {
            status.innerHTML = `<p style="color: #2e7d32;">✅ ${data.message}</p>`;
            setTimeout(() => {
                carregarDadosReais(); // Recarrega dados reais
                carregarContadores(); // Atualiza contadores
                carregarLogs(); // Atualiza logs
                status.innerHTML = '';
            }, 3000);
        } else {
            status.innerHTML = `<p style="color: #d32f2f;">❌ Erro: ${data.error || 'Desconhecido'}</p>`;
        }
    } catch (error) {
        status.innerHTML = `<p style="color: #d32f2f;">❌ Erro de conexão: ${error.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Importação';
    }
});

// ============================================
// FUNÇÕES DOS BOTÕES DAS PLATAFORMAS
// ============================================
async function importarPlataforma(plataforma) {
    const statusDiv = document.getElementById(`${plataforma}-status`);
    
    if (statusDiv) {
        statusDiv.innerHTML = '<div class="import-status info">⏳ Iniciando importação...</div>';
        
        try {
            const response = await apiRequest(`/api/admin/importar/${plataforma}`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                statusDiv.innerHTML = `<div class="import-status success">✅ ${data.message}</div>`;
                setTimeout(() => {
                    carregarDadosReais();
                    carregarContadores();
                    statusDiv.innerHTML = '';
                }, 3000);
            } else {
                statusDiv.innerHTML = `<div class="import-status error">❌ Erro: ${data.error || 'Falha na importação'}</div>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `<div class="import-status error">❌ Erro de conexão: ${error.message}</div>`;
        }
    }
}

function exportarPlataforma(plataforma, formato) {
    alert(`Exportar ${plataforma} em formato ${formato} - Em breve disponível!`);
}

function importarTodas() {
    importarPlataforma('mercadolivre');
    importarPlataforma('amazon');
    importarPlataforma('shopee');
    importarPlataforma('magalu');
}

function exportarTodas(formato) {
    alert(`Exportar todas em formato ${formato} - Em breve disponível!`);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
if (window.location.pathname.includes('admin.html')) {
    document.getElementById('admin-main').style.display = 'none';
    
    const user = localStorage.getItem('adminUser');
    const pass = localStorage.getItem('adminPass');
    
    if (user && pass) {
        fetch(`${API_URL}/api/admin/logs/importacao`, {
            headers: { 'Authorization': 'Basic ' + btoa(user + ':' + pass) }
        }).then(response => {
            if (response.ok) {
                mostrarAdmin();
                carregarDadosReais(); // Carrega dados reais
                carregarLogs();
                carregarContadores();
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