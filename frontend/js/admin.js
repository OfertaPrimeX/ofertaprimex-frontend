// ============================================
// ADMIN.JS - Painel Administrativo
// ============================================

// Configuração da API (backend)
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io'; // URL do seu backend

// Estado da aplicação
let token = localStorage.getItem('adminToken');
let produtos = [];

// ============================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ============================================
function checkAuth() {
    const modal = document.getElementById('login-modal');
    const loginError = document.getElementById('login-error');
    
    if (!token) {
        if (modal) modal.style.display = 'block';
        return false;
    }
    return true;
}

// ============================================
// LOGIN
// ============================================
document.getElementById('btn-login')?.addEventListener('click', async () => {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const loginError = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: user, senha: pass })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            document.getElementById('login-modal').style.display = 'none';
            carregarDados();
        } else {
            loginError.textContent = 'Usuário ou senha inválidos';
        }
    } catch (error) {
        loginError.textContent = 'Erro de conexão com o servidor';
    }
});

// ============================================
// LOGOUT
// ============================================
document.getElementById('logout-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
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
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`${API_URL}/api/admin/produtos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar');
        
        produtos = await response.json();
        atualizarDashboard();
        atualizarTabela();
        
    } catch (error) {
        console.error('Erro:', error);
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
            <td>${p.titulo.substring(0, 50)}...</td>
            <td>R$ ${p.preco}</td>
            <td>${p.categoria_principal || '-'}</td>
            <td>${p.cliques || 0}</td>
            <td>${p.ativo ? '✅' : '❌'}</td>
        </tr>
    `).join('');
}

// ============================================
// IMPORTAR PRODUTOS (aciona o IMPORTER)
// ============================================
document.getElementById('btn-importar')?.addEventListener('click', async () => {
    if (!checkAuth()) return;
    
    const btn = document.getElementById('btn-importar');
    const status = document.getElementById('import-status');
    
    btn.disabled = true;
    btn.textContent = 'Importando...';
    status.innerHTML = '<p style="color: #ff6a00;">⏳ Iniciando importação...</p>';
    
    try {
        const response = await fetch(`${API_URL}/api/admin/importar-mercado-livre`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
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
    if (!checkAuth() || produtos.length === 0) return;
    
    let csv = 'ID,Título,Preço,Avaliação,Vendedor,Frete Grátis,Cliques,Link Original\n';
    
    produtos.forEach(p => {
        csv += `${p.id},"${p.titulo}",${p.preco},${p.avaliacao || 0},"${p.vendedor}",${p.frete_gratis ? 'Sim' : 'Não'},${p.cliques || 0},${p.link_original}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produtos_ml_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
});

// ============================================
// EXPORTAR EXCEL
// ============================================
document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    if (!checkAuth() || produtos.length === 0) return;
    
    let html = '<table><tr><th>ID</th><th>Título</th><th>Preço</th><th>Avaliação</th><th>Vendedor</th><th>Frete Grátis</th><th>Cliques</th><th>Link Original</th></tr>';
    
    produtos.forEach(p => {
        html += `<tr>
            <td>${p.id}</td>
            <td>${p.titulo}</td>
            <td>${p.preco}</td>
            <td>${p.avaliacao || 0}</td>
            <td>${p.vendedor || '-'}</td>
            <td>${p.frete_gratis ? 'Sim' : 'Não'}</td>
            <td>${p.cliques || 0}</td>
            <td>${p.link_original}</td>
        </tr>`;
    });
    
    html += '</table>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produtos_ml_${new Date().toISOString().slice(0,10)}.xls`;
    link.click();
});

// ============================================
// INICIALIZAÇÃO
// ============================================
if (window.location.pathname.includes('admin.html')) {
    if (token) {
        carregarDados();
    } else {
        document.getElementById('login-modal').style.display = 'block';
    }
}