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

// ============================================
// FUNÇÃO CORRIGIDA: CARREGAR CONTADORES DE TODAS AS PLATAFORMAS
// ============================================
async function carregarContadores() {
    // Lista de plataformas com seus IDs de elemento
    const plataformas = [
        { nome: 'mercadolivre', elementId: 'ml-contador', nomeExibicao: 'Mercado Livre' },
        { nome: 'amazon', elementId: 'amazon-contador', nomeExibicao: 'Amazon' },
        { nome: 'shopee', elementId: 'shopee-contador', nomeExibicao: 'Shopee' },
        { nome: 'magalu', elementId: 'magalu-contador', nomeExibicao: 'Magalu' }
    ];
    
    let totalGeral = 0;
    
    // Buscar contadores de cada plataforma individualmente
    for (const plataforma of plataformas) {
        try {
            const response = await apiRequest(`/api/produtos/contador?plataforma=${plataforma.nome}`);
            const data = await response.json();
            
            const element = document.getElementById(plataforma.elementId);
            if (element) {
                const quantidade = data.total || 0;
                element.textContent = quantidade;
                totalGeral += quantidade;
                console.log(`✅ ${plataforma.nomeExibicao}: ${quantidade} produtos`);
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar contador para ${plataforma.nome}:`, error);
            // Em caso de erro, tenta buscar das estatísticas de pesquisas como fallback
            try {
                const statsResponse = await apiRequest('/api/admin/pesquisas/estatisticas');
                const statsData = await statsResponse.json();
                
                const element = document.getElementById(plataforma.elementId);
                if (element && statsData.success && statsData.data.por_plataforma) {
                    const plataformaStats = statsData.data.por_plataforma.find(
                        p => p.plataforma.toLowerCase() === plataforma.nome.toLowerCase()
                    );
                    const quantidade = plataformaStats ? plataformaStats.total : 0;
                    element.textContent = quantidade;
                    totalGeral += quantidade;
                } else if (element) {
                    element.textContent = '0';
                }
            } catch (fallbackError) {
                console.error(`❌ Fallback também falhou para ${plataforma.nome}:`, fallbackError);
                const element = document.getElementById(plataforma.elementId);
                if (element) element.textContent = '0';
            }
        }
    }
    
    // Atualizar o total de produtos no dashboard
    const totalProdutosElement = document.getElementById('total-produtos');
    if (totalProdutosElement) {
        totalProdutosElement.textContent = totalGeral;
    }
    
    console.log(`📊 Total geral de produtos: ${totalGeral}`);
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
    document.getElementById('total-produtos').textContent = "4";
    
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
// FUNÇÃO DE IMPORTAÇÃO COM SELEÇÃO DE ARQUIVO
// ============================================
async function importarPlataforma(plataforma) {
    console.log(`🔄 Importando para: ${plataforma}`);
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log(`📄 Arquivo selecionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        
        const statusDiv = document.getElementById(`${plataforma}-status`);
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="import-status info">⏳ Enviando arquivo e importando...</div>';
        }
        
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
// FUNÇÕES PARA EXPORTAR E LIMPAR PESQUISAS
// ============================================

// Exportar dados da tabela pesquisas_detalhadas
async function exportarPesquisas() {
    try {
        console.log('📊 Exportando dados de pesquisas...');
        
        const response = await apiRequest('/api/admin/pesquisas/exportar?format=csv');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Pegar o blob e fazer download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pesquisas_detalhadas_${new Date().toISOString().slice(0,19)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Exportação concluída!');
        alert('✅ Arquivo CSV exportado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao exportar pesquisas:', error);
        alert(`❌ Erro ao exportar: ${error.message}`);
    }
}

// Limpar tabela pesquisas_detalhadas
async function limparPesquisas() {
    const confirmar = confirm('⚠️ ATENÇÃO: Esta ação irá LIMPAR TODOS OS DADOS da tabela de pesquisas detalhadas. Esta operação é irreversível. Deseja continuar?');
    
    if (!confirmar) return;
    
    try {
        console.log('🗑️ Limpando tabela pesquisas_detalhadas...');
        
        const response = await apiRequest('/api/admin/pesquisas/limpar?confirm=true', {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${data.message}`);
            alert(`✅ ${data.message}`);
            
            // Atualizar estatísticas se a aba estiver visível
            if (typeof carregarEstatisticasPesquisas === 'function') {
                carregarEstatisticasPesquisas();
            }
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
        
    } catch (error) {
        console.error('❌ Erro ao limpar pesquisas:', error);
        alert(`❌ Erro ao limpar: ${error.message}`);
    }
}

// Carregar estatísticas das pesquisas
async function carregarEstatisticasPesquisas() {
    try {
        const response = await apiRequest('/api/admin/pesquisas/estatisticas');
        const data = await response.json();
        
        if (data.success && data.data) {
            // Atualizar card de total
            const totalElement = document.getElementById('total-pesquisas');
            if (totalElement) {
                totalElement.textContent = data.data.total;
            }
            
            // Atualizar tabela de plataformas
            const tbody = document.getElementById('tabela-estatisticas-plataformas');
            if (tbody && data.data.por_plataforma) {
                if (data.data.por_plataforma.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum dado disponível</td></tr>';
                } else {
                    tbody.innerHTML = data.data.por_plataforma.map(p => `
                        <tr>
                            <td>${p.plataforma}</td>
                            <td>${p.total}</td>
                            <td>${p.encontradas}</td>
                            <td>${p.nao_encontradas}</td>
                            <td>${p.tempo_medio_ms}ms</td>
                        </tr>
                    `).join('');
                }
            }
            
            // Atualizar tabela de termos não encontrados
            const termosTbody = document.getElementById('tabela-termos-nao-encontrados');
            if (termosTbody && data.data.top_nao_encontrados) {
                if (data.data.top_nao_encontrados.length === 0) {
                    termosTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum termo não encontrado</td></tr>';
                } else {
                    termosTbody.innerHTML = data.data.top_nao_encontrados.map(t => `
                        <tr>
                            <td>${t.termo}</td>
                            <td>${t.tentativas}</td>
                            <td>${t.plataformas}</td>
                        </tr>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas de pesquisas:', error);
    }
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
                carregarEstatisticasPesquisas();
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