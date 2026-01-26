async function buscarProdutos() {
  const termo = document.getElementById('busca').value;

  const response = await fetch(
    `https://SEU_BACKEND/produtos/buscar?termo=${encodeURIComponent(termo)}`
  );

  const produtos = await response.json();
  const grid = document.querySelector('.products-grid');
  grid.innerHTML = '';

  produtos.forEach(produto => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${produto.imagem}">
        <h3>${produto.nome}</h3>
        <p>R$ ${produto.preco}</p>
        <a href="${produto.link}" target="_blank" class="btn">
          Ver Oferta
        </a>
      </div>
    `;
  });
}
