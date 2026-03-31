// ============================================
// MAIN.JS - Controle de login e autenticação
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se usuário está logado
    const token = localStorage.getItem('adminToken');
    const adminLink = document.getElementById('admin-link');
    const authLink = document.getElementById('auth-link');
    
    if (token) {
        if (adminLink) adminLink.style.display = 'inline-block';
        if (authLink) {
            authLink.textContent = 'Sair';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('adminToken');
                window.location.reload();
            };
        }
    } else {
        if (adminLink) adminLink.style.display = 'none';
        if (authLink) {
            authLink.textContent = 'Login';
            authLink.href = 'admin.html';
        }
    }
});

// ============================================
// FUNÇÕES AUXILIARES GLOBAIS (para uso em outros scripts)
// ============================================

/**
 * Gera estrelas baseado na nota (0 a 5)
 * @param {number|string} rating - Nota de 0 a 5
 * @returns {string} HTML com estrelas
 */
window.generateStars = function(rating) {
    if (!rating || rating === 'N/A') return '☆☆☆☆☆';
    const numRating = parseFloat(rating.replace(',', '.'));
    if (isNaN(numRating)) return '☆☆☆☆☆';
    
    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

/**
 * Formata preço para exibição
 * @param {number|string} preco - Preço a ser formatado
 * @returns {string} Preço formatado (ex: R$ 1.234,56)
 */
window.formatPrice = function(preco) {
    if (!preco) return 'R$ 0,00';
    
    let precoNum = 0;
    if (typeof preco === 'number') {
        precoNum = preco;
    } else {
        const precoLimpo = preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        precoNum = parseFloat(precoLimpo);
    }
    
    if (isNaN(precoNum)) return 'R$ 0,00';
    
    return precoNum.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};