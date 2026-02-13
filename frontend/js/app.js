// js/app.js
const API_BASE = 'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io'; // domínio do backend

/* =========================
   UTIL
========================= */
function formatPrice(price) {
  const value = Number(price);
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/* =========================
   TOP 20
========================= */
async function carregarTop20() {
  try {
    const res = await fetch(`${API_BASE}/api/trending`);
    const products = await res.json();

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
   MAIS PROCURADOS
========================= */
async function carregarMaisProcurados() {
  try {
    const res = await fetch(`${API_BASE}/api/trending`);
    const products = await res.json();

    const container = document.getElementById('mais-procurados');
    if (!container) return;

    container.innerHTML = '';

    products.forEach(p => {
      container.innerHTML += `
        <div class="product-card">
          <img src="${p.thumbnail}" alt="${p.title}">
          <h3 class="product-title">${p.title}</h3>
          <p class="platform">Mercado Livre</p>
          <p class="price">${formatPrice(p.price)}</p>
          <a href="${API_BASE}/click/${p.id}" class="btn">
            Ver Oferta
          </a>
        </div>
      `;
    });
  } catch (err) {
    console.error('Erro ao carregar mais procurados', err);
  }
}

/* =========================
   BUSCA
========================= */
/* =========================
   BUSCA (HÍBRIDA)
========================= */
async function buscarProdutos() {
  const termo = document.getElementById('busca')?.value;
  if (!termo) return;

  try {
    const res = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(termo)}`
    );
    const data = await res.json();

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
      grid.innerHTML += `
        <div class="product-card">
          <img src="${p.thumbnail || 'images/placeholder.png'}" alt="${p.title}">
          <h3 class="product-title">${p.title}</h3>
          <p class="price">${formatPrice(p.price)}</p>

          ${
            p.id
              ? `<a href="${API_BASE}/click/${p.id}" class="btn">Ver Oferta</a>`
              : `<a href="${p.original_url}" target="_blank" class="btn">Ver no Mercado Livre</a>`
          }
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
  carregarMaisProcurados();
});
