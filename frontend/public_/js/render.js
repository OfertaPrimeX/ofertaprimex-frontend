// /app/public/js/render.js
export function renderProducts(container, products) {
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">😢 Nenhum produto encontrado</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imagem_principal || 'https://via.placeholder.com/150'}" 
                 alt="${product.titulo}"
                 onerror="this.src='https://via.placeholder.com/150'">
            <h3 class="product-title">${product.titulo.substring(0, 60)}...</h3>
            <div class="platform">${product.plataforma || 'Mercado Livre'}</div>
            <div class="price">R$ ${product.preco}</div>
            ${product.avaliacao ? `<div class="rating">⭐ ${product.avaliacao}</div>` : ''}
            ${product.frete_gratis === true || product.frete_gratis === 'Sim' ? 
              '<div class="frete">🚚 Frete Grátis</div>' : ''}
            <a href="${product.link_afiliado || product.link_original}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="btn">Ver Oferta</a>
        </div>
    `).join('');
}