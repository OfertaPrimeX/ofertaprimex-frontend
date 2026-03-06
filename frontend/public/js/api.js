// /app/public/js/api.js
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

export async function searchProducts(termo) {
    try {
        const response = await fetch(`${API_URL}/api/produtos/buscar?q=${encodeURIComponent(termo)}`);
        
        // Verifica se a resposta HTTP foi bem-sucedida
        if (!response.ok) {
            console.error('HTTP Error:', response.status);
            return { products: [], origin: 'erro' };
        }
        
        const data = await response.json();
        
        // Verifica se o backend retornou success:true
        if (data.success) {
            return {
                products: data.products || [],
                origin: data.origin || 'nao_localizado'
            };
        } else {
            console.error('Erro na busca:', data.error);
            return { products: [], origin: 'erro' };
        }
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return { products: [], origin: 'erro' };
    }
}