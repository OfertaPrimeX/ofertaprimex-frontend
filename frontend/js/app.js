const API_BASE = 'https://ofertaprimex.com.br'; // ex: https://ofertaprimex.com

/* =========================
   UTIL
========================= */
function formatPrice(price) {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/* =========================
   TOP 20
========================= */
async function carregarTop20() {
  try {
    const res = await fetch(`${API_BASE}/api/top`);
    const products = await res.json();

    const container = document.getElementById('top20-mercadolivre');
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
async function buscarProdutos() {
  const termo = document.getElementById('busca').value;
  if (!termo) return;

  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(termo)}`);
  const products = await res.json();

  // você pode reaproveitar qualquer grid existente
  console.log('Resultado busca:', products);
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  carregarTop20();
  carregarMaisProcurados();
});
