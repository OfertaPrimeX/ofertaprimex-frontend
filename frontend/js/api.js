// /app/public/js/api.js
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

export async function searchProducts(termo) {
    console.log('🔍 Buscando:', termo);
    
    try {
        const url = `${API_URL}/api/produtos/buscar?q=${encodeURIComponent(termo)}`;
        console.log('📡 URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Status:', response.status);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status);
            return { products: [], origin: 'erro' };
        }
        
        const data = await response.json();
        console.log('📦 Dados:', data);
        
        if (data.success) {
            return {
                products: data.products || [],
                origin: data.origin || 'nao_localizado'
            };
        } else {
            console.error('❌ Erro no backend:', data.error);
            return { products: [], origin: 'erro' };
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        return { products: [], origin: 'erro' };
    }
}

export async function getTrending() {
    try {
        const res = await fetch(`${API_URL}/api/trending`);
        if (!res.ok) throw new Error('Erro ao buscar trending');
        return await res.json();
    } catch (error) {
        console.error('Erro no trending:', error);
        return [];
    }
}

export async function getProducts({ page = 1, limit = 20 } = {}) {
    try {
        const res = await fetch(`${API_URL}/api/products?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        return await res.json();
    } catch (error) {
        console.error('Erro nos produtos:', error);
        return { products: [] };
    }
}