// js/render.js
export function renderProducts(container, products) {
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const price =
      p.price !== null && p.price !== undefined
        ? Number(p.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        : '—';

    // 🔥 SE É PRODUTO DO BANCO
    const actionButton = p.id
      ? `<a href="${API_BASE}/click/${p.id}" class="btn">Ver oferta</a>`
      : `<a href="${p.affiliate_url}" target="_blank" rel="noopener" class="btn">
           Ver no Mercado Livre
         </a>`;

    card.innerHTML = `
      <img src="${p.thumbnail || 'images/placeholder.png'}" alt="${p.title}">
      <h3 class="product-title">${p.title}</h3>
      <p class="price">${price}</p>
      ${actionButton}
    `;

    container.appendChild(card);
  });
}