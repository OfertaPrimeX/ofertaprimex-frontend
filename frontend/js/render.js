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
      p.price != null
        ? Number(p.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        : '—';

    // 🔥 REGRA DE OURO
    const link = p.id
      ? `/click/${p.id}`               // produto do banco
      : p.affiliate_url;               // produto Mercado Livre

    const target = p.id ? '_self' : '_blank';

    card.innerHTML = `
      <img src="${p.thumbnail}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price">${price}</p>
      <a href="${link}" target="${target}" class="btn">
        Ver oferta
      </a>
    `;

    container.appendChild(card);
  });
}