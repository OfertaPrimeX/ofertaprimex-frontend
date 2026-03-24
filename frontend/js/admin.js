// ============================================
// ADMIN.JS - Painel Administrativo (COM UPLOAD DE CSV)
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
            carregarDadosReais();
            carregarLogs();
            carregarContadores();
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

async function carregarDadosReais() {
    try {
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
        carregarDadosSimulados();
    }
}

async function carregarContadores() {
    try {
        const mlResponse = await apiRequest('/api/produtos/contador?plataforma=mercadolivre');
        const mlData = await mlResponse.json();
        document.getElementById('ml-contador').textContent = mlData.total || 0;
        
        document.getElementById('amazon-contador').textContent = 0;
        document.getElementById('shopee-contador').textContent = 0;
        document.getElementById('magalu-contador').textContent = 0;
        
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
        document.getElementById('ml-contador').textContent = "1";
        document.getElementById('amazon-contador').textContent = "1";
        document.getElementById('shopee-contador').textContent = "1";
        document.getElementById('magalu-contador').textContent = "1";
    }
}

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
// FUNÇÃO DE IMPORTAÇÃO COM SELEÇÃO DE ARQUIVO
// ============================================
async function importarPlataforma(plataforma) {
    console.log(`🔄 Importando para: ${plataforma}`);
    
    // Cria um input de arquivo dinamicamente
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    // Quando um arquivo for selecionado
    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log(`📄 Arquivo selecionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        
        const statusDiv = document.getElementById(`${plataforma}-status`);
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="import-status info">⏳ Enviando arquivo e importando...</div>';
        }
        
        // Prepara o FormData para upload
        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('plataforma', plataforma);
        
        try {
            const user = localStorage.getItem('adminUser');
            const pass = localStorage.getItem('adminPass');
            const basicAuth = 'Basic ' + btoa(user + ':' + pass);
            
            const response = await fetch(`${API_URL}/api/admin/importar/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': basicAuth
                },
                body: formData
            });
            
            const data = await response.json();
            console.log('📦 Resposta:', data);
            
            if (response.ok) {
                if (statusDiv) {
                    statusDiv.innerHTML = `<div class="import-status success">✅ ${data.message || 'Importação concluída!'}</div>`;
                }
                setTimeout(() => {
                    carregarDadosReais();
                    carregarContadores();
                    if (statusDiv) {
                        setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
                    }
                }, 2000);
            } else {
                if (statusDiv) {
                    statusDiv.innerHTML = `<div class="import-status error">❌ Erro: ${data.error || 'Falha na importação'}</div>`;
                }
            }
        } catch (error) {
            console.error('❌ Erro no upload:', error);
            if (statusDiv) {
                statusDiv.innerHTML = `<div class="import-status error">❌ Erro de conexão: ${error.message}</div>`;
            }
        }
        
        document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
}

// ============================================
// FUNÇÕES DOS BOTÕES
// ============================================
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
                carregarDadosReais();
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