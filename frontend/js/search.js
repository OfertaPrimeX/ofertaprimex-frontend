const API_BASE = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

function formatPrice(price) {
  return Number(price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

async function buscarProdutos() {
  const termo = document.getElementById('busca').value.trim();
  if (!termo) return;

  const section = document.getElementById('resultado-busca');
  const grid = document.getElementById('grid-busca');

  section.style.display = 'block';
  grid.innerHTML = '<p>Buscando...</p>';

  try {
    const res = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(termo)}`
    );
    const data = await res.json();

    const products = data.products || [];

    grid.innerHTML = '';

    if (products.length === 0) {
      grid.innerHTML = '<p>Nenhum produto encontrado</p>';
      return;
    }

    products.forEach(p => {
      const link = p.id
        ? `${API_BASE}/click/${p.id}`
        : p.affiliate_url || p.product_url;

      grid.innerHTML += `
        <div class="product-card">
          <img src="${p.thumbnail}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p class="price">${formatPrice(p.price)}</p>
          <a href="${link}" target="_blank" class="btn">
            Ver oferta
          </a>
        </div>
      `;
    });

  } catch (err) {
    console.error('Erro na busca:', err);
    grid.innerHTML = '<p>Erro ao buscar produtos</p>';
  }
}

document.getElementById('btnBuscar')
  .addEventListener('click', buscarProdutos);