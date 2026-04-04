// /app/public/js/render.js

// ============================================
// FUNÇÃO PARA REGISTRAR CLIQUE NO BACKEND
// ============================================
async function registrarClique(produtoId, plataforma) {
    try {
        // Mapeamento de nomes de plataforma para os IDs usados no backend
        const plataformaMap = {
            'Mercado Livre': 'mercadolivre',
            'Amazon': 'amazon',
            'Shopee': 'shopee',
            'Magalu': 'magalu'
        };
        
        const plataformaKey = plataformaMap[plataforma] || 'mercadolivre';
        
        const response = await fetch('/api/admin/cliques/incrementar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                produto_id: produtoId,
                plataforma: plataformaKey
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Clique registrado: ${plataforma} ID:${produtoId} - Total: ${data.cliques}`);
        } else {
            console.warn(`⚠️ Falha ao registrar clique: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Erro ao registrar clique:', error);
    }
}

// ============================================
// FUNÇÃO PARA REDIRECIONAR PARA PÁGINA DO PRODUTO
// ============================================
function irParaPaginaProduto(produto) {
    if (!produto) return;
    
    // Salva os dados do produto no sessionStorage para a página produto.html
    sessionStorage.setItem('produtoSelecionado', JSON.stringify({
        id: produto.id,
        titulo: produto.titulo || produto.title,
        preco: produto.preco,
        plataforma: produto.plataforma,
        link_original: produto.link_original,
        link_afiliado: produto.link_afiliado,
        imagem_principal: produto.imagem_principal || produto.thumbnail,
        descricao: produto.descricao
    }));
    
    // Redireciona para a página do produto
    window.location.href = `produto.html?id=${produto.id}`;
}

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
    
    // Captura os dados do produto
    const produtoId = p.id;
    const plataforma = p.plataforma || 'Mercado Livre';
    
    // CORREÇÃO: Redireciona para produto.html em vez de abrir link direto
    card.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Registra o clique no backend
      if (produtoId) {
        await registrarClique(produtoId, plataforma);
      }
      
      // Redireciona para a página de detalhes do produto
      irParaPaginaProduto(p);
    };

    // Adiciona estilo de cursor pointer para indicar que é clicável
    card.style.cursor = 'pointer';

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
      
      // CORREÇÃO: se o valor for maior que 1000, provavelmente está em centavos
      if (precoNum > 1000) {
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

    // ===== TÍTULO (limitado a 60 caracteres) =====
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';

    // ===== CONSTRÓI O CARD =====
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
      
      if (precoNum > 1000) {
        precoNum = precoNum / 100;
      }
      
      if (!isNaN(precoNum)) {
        precoFormatado = precoNum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      }
    }
    
    const produtoId = p.id;
    const plataforma = p.plataforma || 'Mercado Livre';
    const imagem = p.imagem_principal || p.thumbnail || 'https://via.placeholder.com/200x200?text=Sem+Imagem';
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';
    const produtoData = encodeURIComponent(JSON.stringify({
        id: p.id,
        titulo: p.titulo || p.title,
        preco: p.preco,
        plataforma: p.plataforma,
        link_original: p.link_original,
        link_afiliado: p.link_afiliado,
        imagem_principal: p.imagem_principal || p.thumbnail
    }));
    
    // CORREÇÃO: Redireciona para produto.html em vez de abrir link direto
    const onclickHandler = `fetch('/api/admin/cliques/incrementar', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({produto_id:${produtoId},plataforma:'${plataforma === 'Mercado Livre' ? 'mercadolivre' : plataforma.toLowerCase()}'})}).catch(e=>console.error(e)); sessionStorage.setItem('produtoSelecionado', '${produtoData.replace(/'/g, "\\'")}'); window.location.href='produto.html?id=${produtoId}';`;
    
    return `
      <div class="product-card" style="cursor:pointer;" onclick="${onclickHandler.replace(/"/g, '&quot;')}">
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
  
  // CORREÇÃO: se o valor for maior que 1000, provavelmente está em centavos
  if (precoNum > 1000) {
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