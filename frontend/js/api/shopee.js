// /js/api/shopee.js
// Funções específicas da Shopee

import { apiRequest } from './base.js';

/**
 * Busca produtos mais vendidos (em destaque) da Shopee
 * @param {number} limite - Limite de produtos (padrão 50)
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getMaisVendidosShopee(limite = 50) {
    try {
        const data = await apiRequest(`/api/produtos/mais-vendidos/shopee?limite=${limite}`);
        if (data.success && data.products) {
            console.log(`✅ Mais Vendidos Shopee: ${data.products.length} produtos`);
            return data.products;
        }
        console.log('📭 Nenhum produto da Shopee disponível');
        return [];
    } catch (error) {
        console.error('❌ Erro nos Mais Vendidos Shopee:', error);
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

// ============================================
// FUNÇÕES DEPRECATED (mantidas para compatibilidade)
// ============================================

/**
 * @deprecated Use getMaisVendidosShopee()
 */
export async function getTop20Shopee() {
    console.warn('⚠️ getTop20Shopee está obsoleto. Use getMaisVendidosShopee()');
    return getMaisVendidosShopee(50);
}