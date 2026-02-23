const API_BASE = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

function formatPrice(price) {
  const value = Number(price);
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function renderProducts(container, products) {
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // 🔗 Define link corretamente (interno ou externo)
    const link = p.id
      ? `${API_BASE}/click/${p.id}`
      : p.affiliate_url;

    const target = p.id ? '_self' : '_blank';

    card.innerHTML = `
      <img src="${p.thumbnail || 'images/placeholder.png'}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price">${formatPrice(p.price)}</p>
      <a href="${link}" target="${target}" class="btn">
        Ver oferta
      </a>
    `;

    container.appendChild(card);
  });
}