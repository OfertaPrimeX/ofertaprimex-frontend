// js/app.js
import { API_BASE, getTrending, searchProducts } from './api.js';

/* =========================
   UTIL
========================= */
function formatPrice(price) {
  if (price == null) return 'Consultar';
  return Number(price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/* =========================
   TOP 20
========================= */
async function carregarTop20() {
  try {
    const products = await getTrending();
    const container = document.getElementById('top20-mercadolivre');
    if (!container) return;

    container.innerHTML = '';
    products.forEach(p => {
      container.innerHTML += `
        <div class="product-card small">
          <img src="${p.thumbnail}" alt="${p.title}">
          <h3 class="product-title">${p.title}</h3>
          <p class="price">${formatPrice(p.price)}</p>
          <a href="${API_BASE}/click/${p.id}" class="btn small">
            Ver
          </a>
        </div>
      `;
    });
  } catch (err) {
    console.error('Erro ao carregar TOP 20', err);
  }
}

/* =========================
   BUSCA HÍBRIDA
========================= */
async function buscarProdutos() {
  const termo = document.getElementById('busca')?.value;
  if (!termo) return;

  try {
    const data = await searchProducts(termo);
    const products = data.products || [];

    const section = document.getElementById('resultado-busca');
    const grid = document.getElementById('grid-busca');
    if (!section || !grid) return;

    grid.innerHTML = '';
    section.style.display = 'block';

    if (products.length === 0) {
      grid.innerHTML = '<p>Nenhum produto encontrado.</p>';
      return;
    }

    products.forEach(p => {
      const link = p.external
        ? p.affiliate_url
        : `${API_BASE}/click/${p.id}`;

      grid.innerHTML += `
        <div class="product-card">
          <img src="${p.thumbnail}" alt="${p.title}">
          <h3 class="product-title">${p.title}</h3>
          <p class="price">${formatPrice(p.price)}</p>
          <a href="${link}" target="_blank" class="btn">
            Ver Oferta
          </a>
        </div>
      `;
    });

    section.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Erro na busca:', err);
  }
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  carregarTop20();
  window.buscarProdutos = buscarProdutos; // expõe para HTML
});