// ============================================
// MAIN.JS - Atualizado com controle de login
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