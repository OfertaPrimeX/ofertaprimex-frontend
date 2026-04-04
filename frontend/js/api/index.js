// /js/api/index.js
// Ponto de entrada - exporta todas as funções da API

// Base
export { API_URL, apiRequest, getTop20ByPlatform, getContador } from './base.js';

// Mercado Livre
export { 
    getMaisVendidosMercadoLivre,
    getTop20MercadoLivre,
    searchMercadoLivre, 
    getContadorMercadoLivre 
} from './mercadolivre.js';

// Amazon
export { 
    getMaisVendidosAmazon,
    getTop20Amazon, 
    searchAmazon, 
    getContadorAmazon 
} from './amazon.js';

// Shopee
export { 
    getMaisVendidosShopee,
    getTop20Shopee, 
    searchShopee, 
    getContadorShopee 
} from './shopee.js';

// Magalu
export { 
    getMaisVendidosMagalu,
    getTop20Magalu, 
    searchMagalu, 
    getContadorMagalu 
} from './magalu.js';

// Busca
export { 
    searchAllPlatforms, 
    searchProductsPaginated 
} from './search.js';

// ============================================
// FUNÇÕES DE APOIO (mantidas para compatibilidade)
// ============================================

/**
 * Busca produtos aleatórios
 * @param {number} limit - Quantidade de produtos
 * @returns {Promise<Array>} Lista de produtos aleatórios
 */
export async function getRandomProducts(limit = 50) {
    try {
        const { apiRequest } = await import('./base.js');
        const data = await apiRequest(`/api/produtos/random?limit=${limit}`);
        if (data.success) {
            console.log(`✅ ${data.products?.length || 0} produtos aleatórios carregados`);
            return data.products || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Erro nos produtos aleatórios:', error);
        return [];
    }
}

/**
 * Busca Top 10 (produtos mais pesquisados)
 * @returns {Promise<Array>} Lista do Top 10
 */
export async function getTop10() {
    try {
        const { apiRequest } = await import('./base.js');
        const data = await apiRequest('/api/pesquisas/top10');
        if (data.success) {
            console.log(`✅ Top 10 carregado: ${data.products?.length || 0} produtos`);
            return data.products || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Erro no Top 10:', error);
        return [];
    }
}

/**
 * Busca produtos (genérico)
 * @param {Object} params - Parâmetros de busca
 * @returns {Promise<Object>} Resultados
 */
export async function getProducts({ page = 1, limit = 20 } = {}) {
    try {
        const { apiRequest } = await import('./base.js');
        return await apiRequest(`/api/products?page=${page}&limit=${limit}`);
    } catch (error) {
        console.error('Erro nos produtos:', error);
        return { products: [] };
    }
}

/**
 * Busca trending
 * @returns {Promise<Array>} Lista de trending
 */
export async function getTrending() {
    try {
        const { apiRequest } = await import('./base.js');
        return await apiRequest('/api/trending');
    } catch (error) {
        console.error('Erro no trending:', error);
        return [];
    }
}