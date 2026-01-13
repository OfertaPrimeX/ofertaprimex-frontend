// Carrega o arquivo de produtos
fetch("data/produtos.json")
  .then(response => response.json())
  .then(produtos => {

    // Seleciona as áreas do site
    const top20Grid = document.querySelector("#top20 .grid");
    const personalizadoGrid = document.querySelector("#personalizado .grid");

    // Percorre todos os produtos
    produtos.forEach(produto => {

      // Cria o badge conforme o tipo
      let badgeHTML = "";

      if (produto.top === true) {
        badgeHTML = `<div class="badge top">TOP</div>`;
      }

      if (produto.personalizado === true) {
        badgeHTML = `<div class="badge personalizado">PERSONALIZADO</div>`;
      }

      // Card do produto
      const cardHTML = `
        <div class="card">
          ${badgeHTML}
          <img src="${produto.imagem}" alt="${produto.nome}">
          <h3>${produto.nome}</h3>
          <p>${produto.preco}</p>
          <span>${produto.plataforma}</span>
          <a href="${produto.link}" target="_blank" class="btn">Ver oferta</a>
        </div>
      `;

      // Envia para o Top 20
      if (produto.top === true && top20Grid) {
        top20Grid.innerHTML += cardHTML;
      }

      // Envia para Personalizado
      if (produto.personalizado === true && personalizadoGrid) {
        personalizadoGrid.innerHTML += cardHTML;
      }

    });
  })
  .catch(error => {
    console.error("Erro ao carregar produtos:", error);
  });
