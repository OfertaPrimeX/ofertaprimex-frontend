// ============================================
// ADMIN.JS - Painel Administrativo (COM BACKEND)
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

// Carregar configurações do BACKEND
async function carregarConfiguracoesPlataformas() {
    try {
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        
        if (user && pass) {
            const response = await fetch(`${API_URL}/api/admin/configuracoes/plataformas`, {
                headers: { 'Authorization': 'Basic ' + btoa(user + ':' + pass) }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.plataformas) {
                    PLATAFORMAS.forEach(p => {
                        p.ativa = data.plataformas.includes(p.id);
                    });
                    console.log('✅ Configurações carregadas do backend:', data.plataformas);
                    return PLATAFORMAS;
                }
            }
        }
    } catch (error) {
        console.log('⚠️ Erro ao carregar do backend:', error);
    }
    
    // Fallback: localStorage
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

// Salvar configurações no BACKEND e localStorage
async function salvarConfiguracoesPlataformas() {
    const config = {};
    PLATAFORMAS.forEach(p => {
        config[p.id] = p.ativa;
    });
    
    localStorage.setItem('plataformas_ativas', JSON.stringify(config));
    
    const ativas = getPlataformasAtivas();
    localStorage.setItem('plataformas_ativas_frontend', JSON.stringify(ativas));
    
    // SALVAR NO BACKEND
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
                console.log('✅ Configurações salvas no BACKEND:', ativas);
            } else {
                console.warn('⚠️ Falha ao salvar no backend');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao salvar no backend:', error);
    }
    
    if (typeof window.atualizarStatusPlataformasPainel === 'function') {
        window.atualizarStatusPlataformasPainel();
    }
    
    atualizarContadorPlataformasAtivas();
    console.log('✅ Configurações salvas:', config);
}

function atualizarContadorPlataformasAtivas() {
    const ativas = getPlataformasAtivas();
    const totalAtivas = ativas.length;
    const totalPlataformasElement = document.getElementById('total-plataformas');
    if (totalPlataformasElement) {
        totalPlataformasElement.textContent = totalAtivas;
    }
    console.log(`📊 Plataformas ativas: ${totalAtivas} (${ativas.join(', ')})`);
}

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
            <button class="plataforma-btn" onclick="window.atualizarCarrossel()" style="background-color: #ff6a00; margin-left: 10px;">🎠 Atualizar Carrossel Agora</button>
        </div>
        <div id="status-plataformas" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
    `;
}

// ============================================
// FUNÇÃO PARA FORÇAR ATUALIZAÇÃO DO CARROSSEL
// ============================================
window.atualizarCarrossel = async function() {
    if (!confirm('Deseja forçar a atualização do carrossel agora? Isso irá gerar novos produtos para hoje.')) return;
    
    const statusDiv = document.getElementById('status-plataformas');
    if (statusDiv) {
        statusDiv.innerHTML = '<span style="color: #ff6a00;">⏳ Atualizando carrossel...</span>';
    }
    
    try {
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        const basicAuth = 'Basic ' + btoa(user + ':' + pass);
        
        const response = await fetch(`${API_URL}/api/produtos/carrossel/atualizar`, {
            method: 'POST',
            headers: { 'Authorization': basicAuth }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const quantidade = data.products?.length || 0;
            if (statusDiv) {
                if (quantidade === 0) {
                    statusDiv.innerHTML = '<span style="color: #ff6a00;">⚠️ Carrossel atualizado, mas NENHUM produto foi encontrado. O carrossel ficará vazio até que produtos sejam importados.</span>';
                } else {
                    statusDiv.innerHTML = `<span style="color: #2e7d32;">✅ Carrossel atualizado com ${quantidade} produtos!</span>`;
                }
                setTimeout(() => { statusDiv.innerHTML = ''; }, 5000);
            }
            if (quantidade === 0) {
                alert('⚠️ Carrossel atualizado, mas nenhum produto foi encontrado!\n\nO carrossel ficará vazio até que você importe produtos.');
            } else {
                alert(`✅ Carrossel atualizado com ${quantidade} produtos!`);
            }
        } else {
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color: #c62828;">❌ Erro: ${data.error || 'Falha ao atualizar'}</span>`;
                setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
            }
            alert(`❌ Erro ao atualizar carrossel: ${data.error || 'Falha desconhecida'}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        if (statusDiv) {
            statusDiv.innerHTML = '<span style="color: #c62828;">❌ Erro de conexão ao atualizar carrossel</span>';
            setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
        }
        alert('❌ Erro de conexão ao atualizar carrossel');
    }
};

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

window.aplicarConfiguracoesPlataformas = async function() {
    await salvarConfiguracoesPlataformas();
    const statusDiv = document.getElementById('status-plataformas');
    if (statusDiv) {
        const ativas = PLATAFORMAS.filter(p => p.ativa).map(p => p.nome).join(', ');
        statusDiv.innerHTML = `<span style="color: #2e7d32;">✅ Configurações aplicadas! Plataformas ativas: ${ativas || 'Nenhuma'}</span>`;
        setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
    }
};

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

function getPlataformasAtivas() {
    return PLATAFORMAS.filter(p => p.ativa).map(p => p.id);
}

window.atualizarFrontendPlataformas = function() {
    const ativas = getPlataformasAtivas();
    localStorage.setItem('plataformas_ativas_frontend', JSON.stringify(ativas));
    console.log('🔄 Frontend atualizado com plataformas ativas:', ativas);
};

// ============================================
// FUNÇÃO PARA CARREGAR CATEGORIAS NO ADMIN
// ============================================
window.carregarCategoriasAdmin = async function() {
    const tbody = document.getElementById('tabela-categorias-body');
    const resumoDiv = document.getElementById('categorias-resumo');
    
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Carregando categorias...</td></tr>';
    
    try {
        const user = localStorage.getItem('adminUser');
        const pass = localStorage.getItem('adminPass');
        const basicAuth = 'Basic ' + btoa(user + ':' + pass);
        
        const response = await fetch(`${API_URL}/api/produtos/categorias/contagem`, {
            headers: { 'Authorization': basicAuth }
        });
        
        const data = await response.json();
        
        if (data.success && data.categorias) {
            const categorias = data.categorias;
            const ativas = categorias.filter(c => c.ativa);
            const inativas = categorias.filter(c => !c.ativa);
            
            tbody.innerHTML = categorias.map(cat => `
                <tr style="opacity: ${cat.ativa ? '1' : '0.6'}">
                    <td><strong>${cat.nome}</strong></td>
                    <td style="font-size: 20px;">${cat.icone}</td>
                    <td class="categoria-total">${cat.plataformas?.ml_produtos || 0}</td>
                    <td class="categoria-total">${cat.plataformas?.amazon_produtos || 0}</td>
                    <td class="categoria-total">${cat.plataformas?.shopee_produtos || 0}</td>
                    <td class="categoria-total">${cat.plataformas?.magalu_produtos || 0}</td>
                    <td class="categoria-total"><strong>${cat.total}</strong></td>
                    <td class="${cat.ativa ? 'categoria-status-ativa' : 'categoria-status-inativa'}">
                        ${cat.ativa ? '✅ Ativa' : '❌ Inativa'}
                    </td>
                </tr>
            `).join('');
            
            if (resumoDiv) {
                resumoDiv.innerHTML = `
                    <strong>📊 Resumo das Categorias:</strong><br>
                    ✅ <span style="color: #2e7d32;">Ativas:</span> ${ativas.length} categorias com produtos<br>
                    ❌ <span style="color: #c62828;">Inativas:</span> ${inativas.length} categorias sem produtos<br>
                    📦 <strong>Total de categorias:</strong> ${categorias.length}
                `;
            }
            
            console.log(`📊 Categorias carregadas: ${ativas.length} ativas, ${inativas.length} inativas`);
        } else {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #c62828;">❌ Erro ao carregar categorias</td></tr>';
            if (resumoDiv) resumoDiv.innerHTML = '❌ Erro ao carregar dados das categorias';
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #c62828;">❌ Erro de conexão</td></tr>';
        if (resumoDiv) resumoDiv.innerHTML = '❌ Erro de conexão ao carregar categorias';
    }
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
            
            await carregarConfiguracoesPlataformas();
            renderizarControlesPlataformas();
            
            carregarDadosReais();
            carregarLogs();
            carregarContadores();
            carregarTotalCliques();
            atualizarContadorPlataformasAtivas();
            
            const tabCategorias = document.getElementById('tab-categorias');
            if (tabCategorias && tabCategorias.classList.contains('active')) {
                setTimeout(() => window.carregarCategoriasAdmin(), 500);
            }
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
// CARREGAR TOTAL DE CLIQUES
// ============================================
async function carregarTotalCliques() {
    try {
        console.log('📊 Buscando total de cliques da API...');
        
        const response = await apiRequest('/api/admin/cliques/total');
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Resposta da API de cliques:', data);
            
            const totalCliquesElement = document.getElementById('total-cliques');
            if (totalCliquesElement) {
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
    
    const totalCliques = produtos.reduce((acc, p) => acc + (p.cliques || 0), 0);
    const totalCliquesElement = document.getElementById('total-cliques');
    if (totalCliquesElement) {
        totalCliquesElement.textContent = totalCliques;
        console.log(`✅ Total de cliques (fallback): ${totalCliques}`);
    }
}

async function carregarDadosReais() {
    try {
        const response = await apiRequest('/api/produtos/buscar?q=');
        const data = await response.json();
        
        if (data.success && data.products) {
            produtos = data.products.map(p => ({
                id: p.id,
                titulo: p.titulo,
                plataforma: p.plataforma || 'Mercado Livre',
                preco: p.preco_pix || p.preco,
                preco_parcelado: p.preco_parcelado || null,
                parcelas_qtd: p.parcelas_qtd || 0,
                parcelas_valor_formatado: p.parcelas_valor_formatado || null,
                parcelas_sem_juros: p.parcelas_sem_juros || false,
                parcelas_texto: p.parcelas_texto || null,
                frete_gratis: p.frete_gratis || false,
                loja_oficial: p.loja_oficial || false,
                avaliacao: p.avaliacao || 'N/A',
                reviews: p.reviews || 0,
                vendedor: p.vendedor || 'N/A',
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
        { id: 1, titulo: "PlayStation 5 Slim 1TB", plataforma: "Mercado Livre", preco: "3.599", parcelas_texto: "10x R$ 359,90 sem juros", parcelas_sem_juros: true, frete_gratis: true, cliques: 45, ativo: true },
        { id: 2, titulo: "iPhone 17 Pro Max 256GB", plataforma: "Amazon", preco: "8.999", parcelas_texto: "12x R$ 749,92", parcelas_sem_juros: false, frete_gratis: true, cliques: 32, ativo: true },
        { id: 3, titulo: "Samsung Galaxy S25 Ultra", plataforma: "Shopee", preco: "7.499", parcelas_texto: "10x R$ 749,90 sem juros", parcelas_sem_juros: true, frete_gratis: false, cliques: 28, ativo: true },
        { id: 4, titulo: "Notebook Gamer Dell G15", plataforma: "Magalu", preco: "5.299", parcelas_texto: "12x R$ 441,58", parcelas_sem_juros: false, frete_gratis: true, cliques: 15, ativo: false }
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
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.slice(0, 20).map(p => {
        const freteBadge = p.frete_gratis ? '<span style="background: #00a650; color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px;">🚚</span>' : '';
        const parcelasBadge = p.parcelas_sem_juros ? '<span style="background: #00a650; color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 3px;">S/J</span>' : '';
        const lojaBadge = p.loja_oficial ? '<span style="background: #3483fa; color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 3px;">✅</span>' : '';
        
        let precoFormatado = 'R$ 0,00';
        if (p.preco) {
            const precoNum = typeof p.preco === 'number' ? p.preco : parseFloat(p.preco);
            if (!isNaN(precoNum)) {
                precoFormatado = precoNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
        }
        
        let parcelasInfo = p.parcelas_texto || '';
        if (!parcelasInfo && p.parcelas_qtd && p.parcelas_valor_formatado) {
            parcelasInfo = `${p.parcelas_qtd}x ${p.parcelas_valor_formatado}`;
        }
        
        return `
            <tr>
                <td>#${p.id}</td>
                <td>${p.plataforma || '-'}</td>
                <td>${p.titulo?.substring(0, 40) || '-'}...</td>
                <td>${precoFormatado}</td>
                <td style="font-size: 11px;">${parcelasInfo || '-'} ${parcelasBadge}</td>
                <td>${freteBadge}${lojaBadge}</td>
                <td>${p.cliques || 0}</td>
                <td>${p.ativo ? '✅' : '❌'}</td>
            </tr>
        `;
    }).join('');
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
                await carregarConfiguracoesPlataformas();
                renderizarControlesPlataformas();
                carregarDadosReais();
                carregarLogs();
                carregarContadores();
                carregarEstatisticasPesquisas();
                atualizarContadorPlataformasAtivas();
            } else {
                renderizarControlesPlataformas();
                mostrarLogin();
            }
        }).catch(() => {
            renderizarControlesPlataformas();
            mostrarLogin();
        });
    } else {
        renderizarControlesPlataformas();
        mostrarLogin();
    }
}

// ============================================
// EXPORTAÇÕES GLOBAIS
// ============================================
window.importarPlataforma = importarPlataforma;
window.exportarPlataforma = exportarPlataforma;
window.importarTodas = importarTodas;
window.exportarTodas = exportarTodas;
window.exportarPesquisas = exportarPesquisas;
window.limparPesquisas = limparPesquisas;
window.carregarEstatisticasPesquisas = carregarEstatisticasPesquisas;