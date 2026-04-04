// /js/api/amazon.js
// Funções específicas da Amazon

import { apiRequest } from './base.js';

/**
 * Busca produtos mais vendidos (em destaque) da Amazon
 * @param {number} limite - Limite de produtos (padrão 50)
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getMaisVendidosAmazon(limite = 50) {
    try {
        const data = await apiRequest(`/api/produtos/mais-vendidos/amazon?limite=${limite}`);
        if (data.success && data.products) {
            console.log(`✅ Mais Vendidos Amazon: ${data.products.length} produtos`);
            return data.products;
        }
        console.log('📭 Nenhum produto da Amazon disponível');
        return [];
    } catch (error) {
        console.error('❌ Erro nos Mais Vendidos Amazon:', error);
        return [];
    }
}

/**
 * Busca produtos da Amazon por termo
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} Lista de produtos
 */
export async function searchAmazon(termo) {
    try {
        console.log('🔍 Busca Amazon ainda não implementada');
        return [];
    } catch (error) {
        console.error('❌ Erro na busca Amazon:', error);
        return [];
    }
}

/**
 * Busca contador de produtos da Amazon
 * @returns {Promise<number>} Total de produtos
 */
export async function getContadorAmazon() {
    try {
        const data = await apiRequest('/api/produtos/contador?plataforma=amazon');
        if (data.success) {
            return data.total || 0;
        }
        return 0;
    } catch (error) {
        console.error('❌ Erro no contador Amazon:', error);
        return 0;
    }
}

// ============================================
// FUNÇÕES DEPRECATED (mantidas para compatibilidade)
// ============================================

/**
 * @deprecated Use getMaisVendidosAmazon()
 */
export async function getTop20Amazon() {
    console.warn('⚠️ getTop20Amazon está obsoleto. Use getMaisVendidosAmazon()');
    return getMaisVendidosAmazon(50);
}