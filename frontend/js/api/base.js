// /js/api/base.js
// Configuração base da API

export const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

/**
 * Faz requisição para o backend com tratamento de erro padrão
 * @param {string} endpoint - Endpoint da API (ex: '/api/produtos/mais-vendidos/mercadolivre')
 * @param {Object} options - Opções do fetch (method, headers, body)
 * @returns {Promise<Object>} Dados da resposta
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`❌ Erro na requisição ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Busca produtos em destaque (mais vendidos) de uma plataforma específica
 * @param {string} plataforma - mercadolivre, amazon, shopee, magalu
 * @param {number} limite - Limite de produtos (padrão 50)
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getMaisVendidosByPlatform(plataforma, limite = 50) {
    const rotas = {
        mercadolivre: `/api/produtos/mais-vendidos/mercadolivre?limite=${limite}`,
        amazon: `/api/produtos/mais-vendidos/amazon?limite=${limite}`,
        shopee: `/api/produtos/mais-vendidos/shopee?limite=${limite}`,
        magalu: `/api/produtos/mais-vendidos/magalu?limite=${limite}`
    };
    
    const rota = rotas[plataforma];
    if (!rota) {
        console.error(`❌ Plataforma "${plataforma}" não suportada`);
        return [];
    }
    
    try {
        const data = await apiRequest(rota);
        if (data.success) {
            return data.products || [];
        }
        return [];
    } catch (error) {
        console.error(`❌ Erro ao buscar mais vendidos ${plataforma}:`, error);
        return [];
    }
}

/**
 * @deprecated Use getMaisVendidosByPlatform()
 */
export async function getTop20ByPlatform(plataforma) {
    console.warn('⚠️ getTop20ByPlatform está obsoleto. Use getMaisVendidosByPlatform()');
    return getMaisVendidosByPlatform(plataforma, 50);
}

/**
 * Busca contador de produtos por plataforma
 * @param {string} plataforma - mercadolivre, amazon, shopee, magalu
 * @returns {Promise<number>} Total de produtos
 */
export async function getContador(plataforma) {
    try {
        const data = await apiRequest(`/api/produtos/contador?plataforma=${plataforma}`);
        if (data.success) {
            return data.total || 0;
        }
        return 0;
    } catch (error) {
        console.error(`❌ Erro ao buscar contador ${plataforma}:`, error);
        return 0;
    }
}