// /js/api/magalu.js
// Funções específicas da Magalu

import { apiRequest } from './base.js';

/**
 * Busca Top 20 produtos da Magalu
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getTop20Magalu() {
    try {
        const data = await apiRequest('/api/produtos/top20/magalu');
        if (data.success && data.products) {
            console.log(`✅ Top 20 Magalu: ${data.products.length} produtos`);
            return data.products;
        }
        console.log('📭 Nenhum produto da Magalu disponível');
        return [];
    } catch (error) {
        console.error('❌ Erro no Top 20 Magalu:', error);
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
        // Magalu pode ter busca específica futuramente
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