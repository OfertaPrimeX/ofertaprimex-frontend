export function renderProducts(container, products) {
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${p.thumbnail || 'images/placeholder.png'}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price">R$ ${Number(p.price).toFixed(2)}</p>
      <a href="produto.html?slug=${p.slug}" class="btn">Ver oferta</a>
    `;

    container.appendChild(card);
  });
}
