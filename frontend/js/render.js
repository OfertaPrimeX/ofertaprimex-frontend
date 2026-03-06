// /app/public/js/render.js
export function renderProducts(container, products) {
  if (!container) return;
  
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum produto encontrado</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Formata o preço (removendo .00 se for inteiro)
    let precoFormatado = 'R$ 0,00';
    if (p.preco) {
      const precoNum = parseFloat(p.preco);
      if (!isNaN(precoNum)) {
        precoFormatado = precoNum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      }
    }

    // Define a imagem (usa placeholder se não tiver)
    const imagem = p.imagem_principal || p.thumbnail || 'https://via.placeholder.com/150';

    // Define o link (usa link_afiliado se existir, senão link_original)
    const link = p.link_afiliado || p.link_original || '#';

    // Define a plataforma
    const plataforma = p.plataforma || 'Mercado Livre';

    // Avaliação
    const avaliacao = p.avaliacao ? `⭐ ${p.avaliacao}` : '';

    // Frete grátis
    const frete = p.frete_gratis === true || p.frete_gratis === 'Sim' 
      ? '<span class="frete-badge">🚚 Frete Grátis</span>' 
      : '';

    card.innerHTML = `
      <img src="${imagem}" alt="${p.titulo || p.title || 'Produto'}" 
           onerror="this.src='https://via.placeholder.com/150'">
      <h3 class="product-title">${(p.titulo || p.title || '').substring(0, 60)}...</h3>
      <div class="platform">${plataforma}</div>
      <div class="price">${precoFormatado}</div>
      ${avaliacao ? `<div class="rating">${avaliacao}</div>` : ''}
      ${frete}
      <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn">
        Ver oferta
      </a>
    `;

    container.appendChild(card);
  });
}