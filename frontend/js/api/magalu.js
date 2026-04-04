// /js/api/magalu.js
// Funções específicas da Magalu

import { apiRequest } from './base.js';

/**
 * Busca produtos mais vendidos (em destaque) da Magalu
 * @param {number} limite - Limite de produtos (padrão 50)
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getMaisVendidosMagalu(limite = 50) {
    try {
        const data = await apiRequest(`/api/produtos/mais-vendidos/magalu?limite=${limite}`);
        if (data.success && data.products) {
            console.log(`✅ Mais Vendidos Magalu: ${data.products.length} produtos`);
            return data.products;
        }
        console.log('📭 Nenhum produto da Magalu disponível');
        return [];
    } catch (error) {
        console.error('❌ Erro nos Mais Vendidos Magalu:', error);
        return [];
    }
}

/**
 * Busca produtos da Magalu por termo
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} Lista de produtos
 */
export async function searchMagalu(termo) {
    try {
        console.log('🔍 Busca Magalu ainda não implementada');
        return [];
    } catch (error) {
        console.error('❌ Erro na busca Magalu:', error);
        return [];
    }
}

/**
 * Busca contador de produtos da Magalu
 * @returns {Promise<number>} Total de produtos
 */
export async function getContadorMagalu() {
    try {
        const data = await apiRequest('/api/produtos/contador?plataforma=magalu');
        if (data.success) {
            return data.total || 0;
        }
        return 0;
    } catch (error) {
        console.error('❌ Erro no contador Magalu:', error);
        return 0;
    }
}

// ============================================
// FUNÇÕES DEPRECATED (mantidas para compatibilidade)
// ============================================

/**
 * @deprecated Use getMaisVendidosMagalu()
 */
export async function getTop20Magalu() {
    console.warn('⚠️ getTop20Magalu está obsoleto. Use getMaisVendidosMagalu()');
    return getMaisVendidosMagalu(50);
}