// /app/public/js/render.js

/**
 * Renderiza produtos no container especificado
 * @param {HTMLElement} container - Elemento onde os produtos serão inseridos
 * @param {Array} products - Lista de produtos a serem renderizados
 * @param {boolean} isCarousel - Se true, substitui o conteúdo; se false, adiciona ao final (para scroll infinito)
 */
export function renderProducts(container, products, isCarousel = false) {
  if (!container) return;
  
  // Se for carrossel, limpa o container antes de adicionar
  if (isCarousel) {
    container.innerHTML = '';
  }

  if (!products || products.length === 0) {
    if (isCarousel) {
      container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum produto encontrado</p>';
    }
    return;
  }

  // Para cada produto, cria o card
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => {
      const link = p.link_afiliado || p.link_original || '#';
      window.open(link, '_blank');
    };

    // ===== FORMATA PREÇO =====
    let precoFormatado = 'R$ 0,00';
    if (p.preco) {
      let precoNum = 0;
      if (typeof p.preco === 'number') {
        precoNum = p.preco;
      } else {
        // Remove R$, pontos e vírgulas, converte para número
        const precoLimpo = p.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        precoNum = parseFloat(precoLimpo);
      }
      
      // Se o valor for maior que 10000, provavelmente está em centavos
      if (precoNum > 10000) {
        precoNum = precoNum / 100;
      }
      
      if (!isNaN(precoNum)) {
        precoFormatado = precoNum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      }
    }

    // ===== DEFINE IMAGEM =====
    let imagem = p.imagem_principal || p.thumbnail;
    if (!imagem || imagem === '') {
      imagem = 'https://via.placeholder.com/200x200?text=Sem+Imagem';
    }

    // ===== DEFINE LINK =====
    const link = p.link_afiliado || p.link_original || '#';

    // ===== PLATAFORMA =====
    const plataforma = p.plataforma || 'Mercado Livre';

    // ===== TÍTULO (limitado a 60 caracteres) =====
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';

    // ===== CONSTRÓI O CARD (SIMPLIFICADO) =====
    card.innerHTML = `
      <img src="${imagem}" alt="${titulo}" 
           class="product-image"
           onerror="this.src='https://via.placeholder.com/200x200?text=Sem+Imagem'">
      <div class="product-info">
        <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
        <div class="product-price">${precoFormatado}</div>
        <div class="product-platform">${plataforma}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Renderiza apenas os cards HTML (útil para scroll infinito)
 * @param {Array} products - Lista de produtos
 * @returns {string} HTML dos cards
 */
export function renderProductsHTML(products) {
  if (!products || products.length === 0) return '';
  
  return products.map(p => {
    // Formata preço
    let precoFormatado = 'R$ 0,00';
    if (p.preco) {
      let precoNum = 0;
      if (typeof p.preco === 'number') {
        precoNum = p.preco;
      } else {
        const precoLimpo = p.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        precoNum = parseFloat(precoLimpo);
      }
      
      if (precoNum > 10000) {
        precoNum = precoNum / 100;
      }
      
      if (!isNaN(precoNum)) {
        precoFormatado = precoNum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      }
    }
    
    const imagem = p.imagem_principal || p.thumbnail || 'https://via.placeholder.com/200x200?text=Sem+Imagem';
    const plataforma = p.plataforma || 'Mercado Livre';
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';
    
    return `
      <div class="product-card" onclick="window.open('${p.link_afiliado || p.link_original || '#'}', '_blank')">
        <img src="${imagem}" alt="${titulo}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=Sem+Imagem'">
        <div class="product-info">
          <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
          <div class="product-price">${precoFormatado}</div>
          <div class="product-platform">${plataforma}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// FUNÇÕES AUXILIARES EXPORTADAS
// ============================================

/**
 * Formata preço para exibição
 * @param {number|string} preco - Preço a ser formatado
 * @returns {string} Preço formatado (ex: R$ 1.234,56)
 */
export function formatPrice(preco) {
  if (!preco) return 'R$ 0,00';
  
  let precoNum = 0;
  if (typeof preco === 'number') {
    precoNum = preco;
  } else {
    const precoLimpo = preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    precoNum = parseFloat(precoLimpo);
  }
  
  if (precoNum > 10000) {
    precoNum = precoNum / 100;
  }
  
  if (isNaN(precoNum)) return 'R$ 0,00';
  
  return precoNum.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Gera estrelas baseado na nota (função global para uso em outros scripts)
 * @param {number} rating - Nota de 0 a 5
 * @returns {string} HTML com estrelas
 */
export function generateStars(rating) {
  if (!rating || rating === 'N/A') return '☆☆☆☆☆';
  const numRating = parseFloat(rating.replace(',', '.'));
  if (isNaN(numRating)) return '☆☆☆☆☆';
  
  const fullStars = Math.floor(numRating);
  const halfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}