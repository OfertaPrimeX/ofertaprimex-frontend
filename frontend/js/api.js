const API_BASE =
  'https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io';

export async function getProducts({ page = 1, limit = 20, order = null } = {}) {
  let url = `${API_BASE}/api/products?page=${page}&limit=${limit}`;
  if (order) url += `&order=${order}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}

export async function searchProducts(query) {
  const res = await fetch(
    `${API_BASE}/api/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error('Erro na busca');
  return res.json();
}

export async function getProductBySlug(slug) {
  const res = await fetch(`${API_BASE}/api/product/${slug}`);
  if (!res.ok) throw new Error('Produto não encontrado');
  return res.json();
}
