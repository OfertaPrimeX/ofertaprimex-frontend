// /app/public/js/api.js
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

export async function searchProducts(termo) {
    console.log('🔍 Iniciando busca por:', termo);
    
    try {
        const url = `${API_URL}/api/produtos/buscar?q=${encodeURIComponent(termo)}`;
        console.log('📡 Chamando URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Status HTTP:', response.status);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status);
            return { products: [], origin: 'erro' };
        }
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        
        if (data && data.success === true) {
            return {
                products: data.products || [],
                origin: data.origin || 'nao_localizado'
            };
        } else {
            console.error('❌ Erro no backend:', data?.error);
            return { products: [], origin: 'erro' };
        }
    } catch (error) {
        console.error('❌ Erro crítico:', error);
        return { products: [], origin: 'erro' };
    }
}

// Mantenha as outras funções se existirem
export async function getTrending() {
    const res = await fetch(`${API_URL}/api/trending`);
    if (!res.ok) throw new Error('Erro ao buscar trending');
    return res.json();
}

export async function getProducts({ page = 1, limit = 20 } = {}) {
    const res = await fetch(`${API_URL}/api/products?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    return res.json();
}