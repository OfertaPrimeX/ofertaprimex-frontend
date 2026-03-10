// /app/public/js/search.js

// Configuração da API
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

// Função para registrar a pesquisa
async function registrarPesquisa(termo, origem, quantidadeResultados = 0, tempoResposta = null) {
    try {
        // Gera um ID de sessão (se não existir)
        let sessaoId = localStorage.getItem('sessaoId');
        if (!sessaoId) {
            sessaoId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessaoId', sessaoId);
        }

        const response = await fetch(`${API_URL}/api/pesquisas/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessaoId
            },
            body: JSON.stringify({
                termo: termo,
                origem: origem,
                quantidade_resultados: quantidadeResultados,
                tempo_resposta_ms: tempoResposta
            })
        });

        const data = await response.json();
        console.log('📊 Pesquisa registrada:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao registrar pesquisa:', error);
        // Não impede a busca principal
    }
}

// Função para formatar tempo de resposta
function medirTempo(fn) {
    const inicio = performance.now();
    return fn().then(resultado => {
        const fim = performance.now();
        return { resultado, tempo: Math.round(fim - inicio) };
    });
}

// Exporta para uso em outros arquivos
window.registrarPesquisa = registrarPesquisa;
window.medirTempo = medirTempo;