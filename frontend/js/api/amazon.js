// /js/api/amazon.js
// Funções específicas da Amazon

import { apiRequest } from './base.js';

/**
 * Busca Top 20 produtos da Amazon
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getTop20Amazon() {
    try {
        const data = await apiRequest('/api/produtos/top20/amazon');
        if (data.success && data.products) {
            console.log(`✅ Top 20 Amazon: ${data.products.length} produtos`);
            return data.products;
        }
        console.log('📭 Nenhum produto da Amazon disponível');
        return [];
    } catch (error) {
        console.error('❌ Erro no Top 20 Amazon:', error);
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
        // Amazon pode ter busca específica futuramente
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