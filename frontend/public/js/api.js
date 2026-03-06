// /app/public/js/api.js
const API_URL = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

export async function searchProducts(termo) {
    console.log('🔍 Iniciando busca por:', termo);
    
    try {
        const url = `${API_URL}/api/produtos/buscar?q=${encodeURIComponent(termo)}`;
        console.log('📡 Chamando URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Status HTTP:', response.status);
        
        // Verifica se a resposta HTTP foi bem-sucedida
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            
            // Tenta ler o erro como texto
            const errorText = await response.text();
            console.error('📄 Resposta de erro:', errorText.substring(0, 200));
            
            return { products: [], origin: 'erro' };
        }
        
        // Tenta parsear o JSON
        let data;
        try {
            data = await response.json();
            console.log('📦 Dados recebidos:', data);
        } catch (jsonError) {
            console.error('❌ Erro ao parsear JSON:', jsonError);
            const text = await response.text();
            console.error('📄 Resposta (não JSON):', text.substring(0, 200));
            return { products: [], origin: 'erro' };
        }
        
        // Verifica se o backend retornou success:true
        if (data && data.success === true) {
            console.log(`✅ Busca concluída: ${data.products?.length || 0} produtos encontrados`);
            return {
                products: data.products || [],
                origin: data.origin || 'nao_localizado'
            };
        } else {
            console.error('❌ Erro no backend:', data?.error || 'Resposta inválida');
            return { products: [], origin: 'erro' };
        }
    } catch (error) {
        console.error('❌ Erro crítico na busca:', error);
        console.error('Stack:', error.stack);
        return { products: [], origin: 'erro' };
    }
}