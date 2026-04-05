// ============================================
// ADMIN.JS - Painel Administrativo (COM UPLOAD DE CSV)
// ============================================

const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';
let produtos = [];

// ============================================
// CONFIGURAÇÃO DE PLATAFORMAS ATIVAS
// ============================================
const PLATAFORMAS = [
    { id: 'mercadolivre', nome: 'Mercado Livre', icone: '🛒', cor: '#ffe600' },
    { id: 'amazon', nome: 'Amazon', icone: '📚', cor: '#ff9900' },
    { id: 'shopee', nome: 'Shopee', icone: '🛍️', cor: '#ee4d2d' },
    { id: 'magalu', nome: 'Magalu', icone: '🪄', cor: '#005c9e' }
];

// Carregar configurações salvas (primeiro do backend, depois localStorage)
async function carregarConfiguracoesPlataformas() {
    try {
        // Tentar carregar do backend primeiro
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        
        if (user && pass) {
            const response = await fetch(`${API_URL}/api/admin/configuracoes/plataformas`, {
                headers: { 'Authorization': 'Basic ' + btoa(user + ':' + pass) }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.plataformas) {
                    // Aplicar configurações do backend
                    PLATAFORMAS.forEach(p => {
                        p.ativa = data.plataformas.includes(p.id);
                    });
                    // Salvar no localStorage também
                    const config = {};
                    PLATAFORMAS.forEach(p => {
                        config[p.id] = p.ativa;
                    });
                    localStorage.setItem('plataformas_ativas', JSON.stringify(config));
                    const ativas = getPlataformasAtivas();
                    localStorage.setItem('plataformas_ativas_frontend', JSON.stringify(ativas));
                    console.log('✅ Configurações carregadas do backend:', data.plataformas);
                    return PLATAFORMAS;
                }
            }
        }
    } catch (error) {
        console.log('⚠️ Não foi possível carregar configurações do backend, usando localStorage');
    }
    
    // Fallback: carregar do localStorage
    const saved = localStorage.getItem('plataformas_ativas');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            PLATAFORMAS.forEach(p => {
                p.ativa = config[p.id] !== undefined ? config[p.id] : true;
            });
        } catch(e) {
            PLATAFORMAS.forEach(p => p.ativa = true);
        }
    } else {
        PLATAFORMAS.forEach(p => p.ativa = true);
    }
    return PLATAFORMAS;
}

// Salvar configurações (no backend e localStorage)
async function salvarConfiguracoesPlataformas() {
    const config = {};
    PLATAFORMAS.forEach(p => {
        config[p.id] = p.ativa;
    });
    
    // Salvar no localStorage
    localStorage.setItem('plataformas_ativas', JSON.stringify(config));
    
    // Atualizar o frontend com as novas configurações
    const ativas = getPlataformasAtivas();
    localStorage.setItem('plataformas_ativas_frontend', JSON.stringify(ativas));
    
    // Salvar no backend
    try {
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        
        if (user && pass) {
            const response = await fetch(`${API_URL}/api/admin/configuracoes/plataformas`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(user + ':' + pass),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plataformas: ativas })
            });
            
            if (response.ok) {
                console.log('✅ Configurações salvas no backend:', ativas);
            } else {
                console.warn('⚠️ Falha ao salvar configurações no backend');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao salvar configurações no backend:', error);
    }
    
    // Atualizar o painel admin visualmente
    if (typeof window.atualizarStatusPlataformasPainel === 'function') {
        window.atualizarStatusPlataformasPainel();
    }
    
    // Atualizar contador de plataformas ativas
    atualizarContadorPlataformasAtivas();
    
    console.log('✅ Configurações de plataformas salvas localmente:', config);
}

// ============================================
// FUNÇÃO PARA ATUALIZAR CONTADOR DE PLATAFORMAS ATIVAS
// ============================================
function atualizarContadorPlataformasAtivas() {
    const ativas = getPlataformasAtivas();
    const totalAtivas = ativas.length;
    const totalPlataformasElement = document.getElementById('total-plataformas');
    if (totalPlataformasElement) {
        totalPlataformasElement.textContent = totalAtivas;
    }
    console.log(`📊 Plataformas ativas: ${totalAtivas} (${ativas.join(', ')})`);
}

// Renderizar checkboxes de plataformas
function renderizarControlesPlataformas() {
    const container = document.getElementById('controle-plataformas');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 15px;">
            ${PLATAFORMAS.map(p => `
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; background: ${p.ativa ? '#e8f5e9' : '#ffebee'}; border-radius: 8px; transition: all 0.2s;">
                    <input type="checkbox" 
                           id="plataforma-${p.id}" 
                           ${p.ativa ? 'checked' : ''}
                           onchange="window.togglePlataforma('${p.id}', this.checked)"
                           style="width: 18px; height: 18px; cursor: pointer;">
                    <span style="font-size: 18px;">${p.icone}</span>
                    <span style="font-weight: 500;">${p.nome}</span>
                    <span style="font-size: 12px; color: ${p.ativa ? '#2e7d32' : '#c62828'};">
                        ${p.ativa ? '✅ Ativa' : '❌ Inativa'}
                    </span>
                </label>
            `).join('')}
        </div>
        <div style="margin-top: 15px;">
            <button class="plataforma-btn" onclick="window.aplicarConfiguracoesPlataformas()" style="background-color: #2e7d32; margin-right: 10px;">💾 Aplicar Configurações</button>
            <button class="plataforma-btn" onclick="window.resetarConfiguracoesPlataformas()" style="background-color: #555;">🔄 Resetar (Todas Ativas)</button>
        </div>
        <div id="status-plataformas" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
    `;
}

// Alternar plataforma
window.togglePlataforma = function(plataformaId, ativa) {
    const plataforma = PLATAFORMAS.find(p => p.id === plataformaId);
    if (plataforma) {
        plataforma.ativa = ativa;
        const label = document.querySelector(`label:has(#plataforma-${plataformaId})`);
        if (label) {
            label.style.background = ativa ? '#e8f5e9' : '#ffebee';
            const statusSpan = label.querySelector('span:last-child');
            if (statusSpan) {
                statusSpan.textContent = ativa ? '✅ Ativa' : '❌ Inativa';
                statusSpan.style.color = ativa ? '#2e7d32' : '#c62828';
            }
        }
    }
};

// Aplicar configurações
window.aplicarConfiguracoesPlataformas = async function() {
    await salvarConfiguracoesPlataformas();
    const statusDiv = document.getElementById('status-plataformas');
    if (statusDiv) {
        const ativas = PLATAFORMAS.filter(p => p.ativa).map(p => p.nome).join(', ');
        statusDiv.innerHTML = `<span style="color: #2e7d32;">✅ Configurações aplicadas! Plataformas ativas: ${ativas || 'Nenhuma'}</span>`;
        setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
    }
};

// Resetar para todas ativas
window.resetarConfiguracoesPlataformas = async function() {
    PLATAFORMAS.forEach(p => p.ativa = true);
    await salvarConfiguracoesPlataformas();
    renderizarControlesPlataformas();
    const statusDiv = document.getElementById('status-plataformas');
    if (statusDiv) {
        statusDiv.innerHTML = '<span style="color: #2e7d32;">🔄 Todas as plataformas foram reativadas!</span>';
        setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
    }
};

// Obter plataformas ativas (para enviar ao backend)
function getPlataformasAtivas() {
    return PLATAFORMAS.filter(p => p.ativa).map(p => p.id);
}

// Atualizar frontend com as configurações
window.atualizarFrontendPlataformas = function() {
    const ativas = getPlataformasAtivas();
    localStorage.setItem('plataformas_ativas_frontend', JSON.stringify(ativas));
    console.log('🔄 Frontend atualizado com plataformas ativas:', ativas);
};

// ============================================
// FUNÇÕES DE API
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
            
            // Carregar configurações do backend antes de tudo
            await carregarConfiguracoesPlataformas();
            
            carregarDadosReais();
            carregarLogs();
            carregarContadores();
            carregarTotalCliques();
            atualizarContadorPlataformasAtivas();
            renderizarControlesPlataformas();
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
// CARREGAR TOTAL DE CLIQUES (CORRIGIDO)
// ============================================
async function carregarTotalCliques() {
    try {
        console.log('📊 Buscando total de cliques da API...');
        
        // Tentar buscar total de cliques da API
        const response = await apiRequest('/api/admin/cliques/total');
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Resposta da API de cliques:', data);
            
            const totalCliquesElement = document.getElementById('total-cliques');
            if (totalCliquesElement) {
                // A API pode retornar { total: X } ou { cliques: X }
                const total = data.total || data.cliques || 0;
                totalCliquesElement.textContent = total;
                console.log(`✅ Total de cliques atualizado via API: ${total}`);
                return;
            }
        } else {
            console.warn(`⚠️ API de cliques retornou status: ${response.status}`);
        }
    } catch (error) {
        console.log('API de cliques não disponível:', error.message);
    }
    
    // Fallback: calcular a partir dos produtos carregados
    console.log('📊 Usando fallback: somando cliques dos produtos');
    const totalCliques = produtos.reduce((acc, p) => acc + (p.cliques || 0), 0);
    const totalCliquesElement = document.getElementById('total-cliques');
    if (totalCliquesElement) {
        totalCliquesElement.textContent = totalCliques;
        console.log(`✅ Total de cliques (fallback): ${totalCliques}`);
    }
}

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
        carregarTotalCliques();
        
    } catch (error) {
        console.error('Erro ao carregar dados reais:', error);
        carregarDadosSimulados();
    }
}

async function carregarContadores() {
    const plataformas = [
        { nome: 'mercadolivre', elementId: 'ml-contador', nomeExibicao: 'Mercado Livre' },
        { nome: 'amazon', elementId: 'amazon-contador', nomeExibicao: 'Amazon' },
        { nome: 'shopee', elementId: 'shopee-contador', nomeExibicao: 'Shopee' },
        { nome: 'magalu', elementId: 'magalu-contador', nomeExibicao: 'Magalu' }
    ];
    
    let totalGeral = 0;
    
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
            const element = document.getElementById(plataforma.elementId);
            if (element) element.textContent = '0';
        }
    }
    
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
    carregarTotalCliques();
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto encontrado</td</tr>';
        return;
    }
    
    tbody.innerHTML = produtos.slice(0, 20).map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${p.plataforma || '-'}</td>
            <td>${p.titulo.substring(0, 50)}...</td
            <td>R$ ${p.preco}</td
            <td>${p.cliques || 0}</td
            <td>${p.ativo ? '✅' : '❌'}</td
        </tr>
    `).join('');
}

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

async function exportarPesquisas() {
    try {
        console.log('📊 Exportando dados de pesquisas...');
        
        const response = await apiRequest('/api/admin/pesquisas/exportar?format=csv');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
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

async function carregarEstatisticasPesquisas() {
    try {
        const response = await apiRequest('/api/admin/pesquisas/estatisticas');
        const data = await response.json();
        
        if (data.success && data.data) {
            const totalElement = document.getElementById('total-pesquisas');
            if (totalElement) {
                totalElement.textContent = data.data.total;
            }
            
            const tbody = document.getElementById('tabela-estatisticas-plataformas');
            if (tbody && data.data.por_plataforma) {
                if (data.data.por_plataforma.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum dado disponível</td</tr>';
                } else {
                    tbody.innerHTML = data.data.por_plataforma.map(p => `
                        <tr>
                            <td>${p.plataforma}</td
                            <td>${p.total}</td
                            <td>${p.encontradas}</td
                            <td>${p.nao_encontradas}</td
                            <td>${p.tempo_medio_ms}ms</td
                        </tr>
                    `).join('');
                }
            }
            
            const termosTbody = document.getElementById('tabela-termos-nao-encontrados');
            if (termosTbody && data.data.top_nao_encontrados) {
                if (data.data.top_nao_encontrados.length === 0) {
                    termosTbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum termo não encontrado</td</tr>';
                } else {
                    termosTbody.innerHTML = data.data.top_nao_encontrados.map(t => `
                        <tr>
                            <td>${t.termo}</td
                            <td>${t.tentativas}</td
                            <td>${t.plataformas}</td
                        </tr>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas de pesquisas:', error);
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
        }).then(async (response) => {
            if (response.ok) {
                mostrarAdmin();
                // Carregar configurações do backend primeiro
                await carregarConfiguracoesPlataformas();
                carregarDadosReais();
                carregarLogs();
                carregarContadores();
                carregarEstatisticasPesquisas();
                renderizarControlesPlataformas();
                atualizarContadorPlataformasAtivas();
                
                setTimeout(() => {
                    if (typeof window.atualizarStatusPlataformasPainel === 'function') {
                        window.atualizarStatusPlataformasPainel();
                    }
                }, 500);
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