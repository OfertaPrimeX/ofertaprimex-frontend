// /js/api/search.js
// Busca multiplataforma

import { apiRequest } from './base.js';

/**
 * Busca em todas as plataformas com registro detalhado
 * @param {string} termo - Termo de busca
 * @returns {Promise<Object>} Resultados da busca
 */
export async function searchAllPlatforms(termo) {
    console.log('🔍 Buscando em todas as plataformas:', termo);
    
    // Gera ou recupera o ID da sessão
    let sessaoId = localStorage.getItem('sessaoId');
    if (!sessaoId) {
        sessaoId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessaoId', sessaoId);
    }
    
    try {
        const data = await apiRequest('/api/pesquisas/buscar/todas', {
            method: 'POST',
            headers: { 'X-Session-Id': sessaoId },
            body: JSON.stringify({ termo })
        });
        
        if (data.success) {
            console.log('📊 Resultados por plataforma:', data.resultados_plataformas);
            return {
                products: data.products || [],
                resultados_plataformas: data.resultados_plataformas || [],
                total: data.total || 0,
                tempo_total: data.tempo_total || 0,
                pesquisa_id: data.pesquisa_id
            };
        }
        
        return { products: [], resultados_plataformas: [] };
        
    } catch (error) {
        console.error('❌ Erro na busca multiplataforma:', error);
        return { products: [], resultados_plataformas: [] };
    }
}

/**
 * Busca produtos com paginação (para scroll infinito)
 * @param {string} termo - Termo de busca
 * @param {number} page - Número da página
 * @param {number} limit - Limite por página
 * @returns {Promise<Object>} Resultados paginados
 */
export async function searchProductsPaginated(termo, page = 1, limit = 30) {
    console.log(`🔍 Buscando produtos: "${termo}" | Página ${page} | Limite ${limit}`);
    
    let sessaoId = localStorage.getItem('sessaoId');
    if (!sessaoId) {
        sessaoId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessaoId', sessaoId);
    }
    
    try {
        const data = await apiRequest('/api/pesquisas/buscar/paginada', {
            method: 'POST',
            headers: { 'X-Session-Id': sessaoId },
            body: JSON.stringify({ termo, page, limit })
        });
        
        if (data.success) {
            return {
                products: data.products || [],
                total: data.total || 0,
                page: data.page || page,
                hasMore: data.hasMore || false
            };
        }
        
        return { products: [], total: 0, hasMore: false };
        
    } catch (error) {
        console.error('❌ Erro na busca paginada:', error);
        return { products: [], total: 0, hasMore: false };
    }
}