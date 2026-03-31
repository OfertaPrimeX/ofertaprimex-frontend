// /js/api/base.js
// Configuração base da API

export const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

/**
 * Faz requisição para o backend com tratamento de erro padrão
 * @param {string} endpoint - Endpoint da API (ex: '/api/produtos/top20/mercadolivre')
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
 * Busca Top 20 de uma plataforma específica
 * @param {string} plataforma - mercadolivre, amazon, shopee, magalu
 * @returns {Promise<Array>} Lista de produtos
 */
export async function getTop20ByPlatform(plataforma) {
    const rotas = {
        mercadolivre: '/api/produtos/top20/mercadolivre',
        amazon: '/api/produtos/top20/amazon',
        shopee: '/api/produtos/top20/shopee',
        magalu: '/api/produtos/top20/magalu'
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
        console.error(`❌ Erro ao buscar Top 20 ${plataforma}:`, error);
        return [];
    }
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