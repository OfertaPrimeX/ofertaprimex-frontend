// /js/api/mercadolivre.js
// Funções específicas do Mercado Livre

import { apiRequest } from './base.js';

/**
 * Busca produtos mais vendidos (em destaque) do Mercado Livre
 * @param {number} limite - Limite de produtos (padrão 50)
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getMaisVendidosMercadoLivre(limite = 50) {
    try {
        const data = await apiRequest(`/api/produtos/mais-vendidos/mercadolivre?limite=${limite}`);
        if (data.success) {
            console.log(`✅ Mais Vendidos Mercado Livre: ${data.products?.length || 0} produtos`);
            return data.products || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Erro nos Mais Vendidos Mercado Livre:', error);
        return [];
    }
}

/**
 * Busca produtos do Mercado Livre por termo
 * @param {string} termo - Termo de busca
 * @param {number} limite - Limite de produtos (padrão 20)
 * @returns {Promise<Array>} Lista de produtos
 */
export async function searchMercadoLivre(termo, limite = 20) {
    try {
        const data = await apiRequest(`/api/produtos/buscar?q=${encodeURIComponent(termo)}`);
        if (data.success) {
            return data.products || [];
        }
        return [];
    } catch (error) {
        console.error('❌ Erro na busca Mercado Livre:', error);
        return [];
    }
}

/**
 * Busca contador de produtos do Mercado Livre
 * @returns {Promise<number>} Total de produtos
 */
export async function getContadorMercadoLivre() {
    try {
        const data = await apiRequest('/api/produtos/contador?plataforma=mercadolivre');
        if (data.success) {
            return data.total || 0;
        }
        return 0;
    } catch (error) {
        console.error('❌ Erro no contador Mercado Livre:', error);
        return 0;
    }
}

// ============================================
// FUNÇÕES DEPRECATED (mantidas para compatibilidade)
// ============================================

/**
 * @deprecated Use getMaisVendidosMercadoLivre()
 */
export async function getTop20MercadoLivre() {
    console.warn('⚠️ getTop20MercadoLivre está obsoleto. Use getMaisVendidosMercadoLivre()');
    return getMaisVendidosMercadoLivre(50);
}