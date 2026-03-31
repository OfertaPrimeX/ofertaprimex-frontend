// /js/api/shopee.js
// Funções específicas da Shopee

import { apiRequest } from './base.js';

/**
 * Busca Top 20 produtos da Shopee
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getTop20Shopee() {
    try {
        const data = await apiRequest('/api/produtos/top20/shopee');
        if (data.success && data.products) {
            console.log(`✅ Top 20 Shopee: ${data.products.length} produtos`);
            return data.products;
        }
        console.log('📭 Nenhum produto da Shopee disponível');
        return [];
    } catch (error) {
        console.error('❌ Erro no Top 20 Shopee:', error);
        return [];
    }
}

/**
 * Busca produtos da Shopee por termo
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} Lista de produtos
 */
export async function searchShopee(termo) {
    try {
        // Shopee será implementada após o seguro-desemprego
        console.log('🔍 Busca Shopee será implementada em breve');
        return [];
    } catch (error) {
        console.error('❌ Erro na busca Shopee:', error);
        return [];
    }
}

/**
 * Busca contador de produtos da Shopee
 * @returns {Promise<number>} Total de produtos
 */
export async function getContadorShopee() {
    try {
        const data = await apiRequest('/api/produtos/contador?plataforma=shopee');
        if (data.success) {
            return data.total || 0;
        }
        return 0;
    } catch (error) {
        console.error('❌ Erro no contador Shopee:', error);
        return 0;
    }
}