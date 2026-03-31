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

    // ===== FORMATA PREÇO (CORRIGIDO) =====
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
      
      // CORREÇÃO: se o valor for maior que 10000, provavelmente está em centavos
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
    
    // ===== ICONE DA PLATAFORMA =====
    let plataformaIcone = '';
    switch(plataforma.toLowerCase()) {
      case 'mercado livre':
      case 'mercadolivre':
        plataformaIcone = '🛒';
        break;
      case 'amazon':
        plataformaIcone = '📚';
        break;
      case 'shopee':
        plataformaIcone = '🛍️';
        break;
      case 'magalu':
      case 'magazine luiza':
        plataformaIcone = '🪄';
        break;
      default:
        plataformaIcone = '🏷️';
    }

    // ===== AVALIAÇÃO =====
    let avaliacaoHtml = '';
    if (p.avaliacao && p.avaliacao !== 'N/A') {
      const nota = parseFloat(p.avaliacao.replace(',', '.'));
      if (!isNaN(nota)) {
        const estrelas = gerarEstrelas(nota);
        avaliacaoHtml = `<div class="product-rating">${estrelas} ${p.avaliacao}</div>`;
      }
    }

    // ===== REVIEWS =====
    let reviewsHtml = '';
    if (p.reviews && p.reviews !== '0' && p.reviews !== 'N/A') {
      reviewsHtml = `<div class="product-reviews">📊 ${p.reviews} avaliações</div>`;
    }

    // ===== FRETE GRÁTIS =====
    let freteHtml = '';
    if (p.frete_gratis === true || p.frete_gratis === 'Sim' || p.frete_gratis === 'sim') {
      freteHtml = '<span class="free-shipping">🚚 Frete Grátis</span>';
    }

    // ===== LOJA OFICIAL =====
    let lojaOficialHtml = '';
    if (p.loja_oficial === true || p.loja_oficial === 'Sim' || p.loja_oficial === 'sim') {
      lojaOficialHtml = '<span class="official-store">✅ Loja Oficial</span>';
    }

    // ===== TÍTULO (limitado a 70 caracteres) =====
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 70);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 70 ? '...' : '';

    // ===== SCORE (se existir) =====
    let scoreHtml = '';
    if (p.score) {
      scoreHtml = `<div class="product-score">🏆 Score: ${p.score}</div>`;
    }

    // ===== CONSTRÓI O CARD =====
    card.innerHTML = `
      <img src="${imagem}" alt="${titulo}" 
           class="product-image"
           onerror="this.src='https://via.placeholder.com/200x200?text=Imagem+Indisponível'">
      <div class="product-info">
        <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
        <div class="product-meta">
          <span class="product-platform">${plataformaIcone} ${plataforma}</span>
        </div>
        <div class="product-price">${precoFormatado}</div>
        <div class="product-details">
          ${avaliacaoHtml}
          ${reviewsHtml}
        </div>
        <div class="product-badges">
          ${freteHtml}
          ${lojaOficialHtml}
          ${scoreHtml}
        </div>
      </div>
      <button class="buy-button" onclick="event.stopPropagation(); window.open('${link}', '_blank')">
        Ver Oferta
      </button>
    `;

    container.appendChild(card);
  });
}

/**
 * Gera estrelas baseado na nota (0 a 5)
 * @param {number} rating - Nota de 0 a 5
 * @returns {string} HTML com estrelas
 */
function gerarEstrelas(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let estrelasHtml = '';
  for (let i = 0; i < fullStars; i++) estrelasHtml += '★';
  if (halfStar) estrelasHtml += '½';
  for (let i = 0; i < emptyStars; i++) estrelasHtml += '☆';
  
  return `<span class="stars">${estrelasHtml}</span>`;
}

/**
 * Renderiza apenas os cards HTML (útil para scroll infinito)
 * @param {Array} products - Lista de produtos
 * @returns {string} HTML dos cards
 */
export function renderProductsHTML(products) {
  if (!products || products.length === 0) return '';
  
  return products.map(p => {
    // Formata preço (CORRIGIDO)
    let precoFormatado = 'R$ 0,00';
    if (p.preco) {
      let precoNum = 0;
      if (typeof p.preco === 'number') {
        precoNum = p.preco;
      } else {
        const precoLimpo = p.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        precoNum = parseFloat(precoLimpo);
      }
      
      // CORREÇÃO: se o valor for maior que 10000, provavelmente está em centavos
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
    const link = p.link_afiliado || p.link_original || '#';
    const plataforma = p.plataforma || 'Mercado Livre';
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 70);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 70 ? '...' : '';
    
    let avaliacaoHtml = '';
    if (p.avaliacao && p.avaliacao !== 'N/A') {
      const nota = parseFloat(p.avaliacao.replace(',', '.'));
      if (!isNaN(nota)) {
        const estrelas = gerarEstrelas(nota);
        avaliacaoHtml = `<div class="product-rating">${estrelas} ${p.avaliacao}</div>`;
      }
    }
    
    let freteHtml = '';
    if (p.frete_gratis === true || p.frete_gratis === 'Sim') {
      freteHtml = '<span class="free-shipping">🚚 Frete Grátis</span>';
    }
    
    let lojaOficialHtml = '';
    if (p.loja_oficial === true || p.loja_oficial === 'Sim') {
      lojaOficialHtml = '<span class="official-store">✅ Loja Oficial</span>';
    }
    
    return `
      <div class="product-card" onclick="window.open('${link}', '_blank')">
        <img src="${imagem}" alt="${titulo}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=Imagem+Indisponível'">
        <div class="product-info">
          <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
          <div class="product-meta">
            <span class="product-platform">${plataforma}</span>
          </div>
          <div class="product-price">${precoFormatado}</div>
          ${avaliacaoHtml}
          <div class="product-badges">
            ${freteHtml}
            ${lojaOficialHtml}
          </div>
        </div>
        <button class="buy-button" onclick="event.stopPropagation(); window.open('${link}', '_blank')">
          Ver Oferta
        </button>
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
  
  // CORREÇÃO: se o valor for maior que 10000, provavelmente está em centavos
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