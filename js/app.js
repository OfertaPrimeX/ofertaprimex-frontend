fetch("data/produtos.json")
  .then(response => response.json())
  .then(produtos => {

    const top20Grid = document.querySelector("#top20 .grid");
    const personalizadoGrid = document.querySelector("#personalizado .grid");

    produtos.forEach(produto => {

      const cardHTML = `
        <div class="card">
          <img src="${produto.imagem}" alt="${produto.nome}">
          <h3>${produto.nome}</h3>
          <p>${produto.preco}</p>
          <span>${produto.plataforma}</span>
          <a href="${produto.link}" target="_blank" class="btn">Ver oferta</a>
        </div>
      `;

      if (produto.top === true && top20Grid) {
        top20Grid.innerHTML += cardHTML;
      }

      if (produto.personalizado === true && personalizadoGrid) {
        personalizadoGrid.innerHTML += cardHTML;
      }

    });
  })
  .catch(error => {
    console.error("Erro ao carregar produtos:", error);
  });
