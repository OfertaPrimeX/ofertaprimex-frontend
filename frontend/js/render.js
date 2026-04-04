// /app/public/js/render.js

// ============================================
// FUNÇÃO PARA OBTER PLATAFORMAS ATIVAS
// ============================================
export function getPlataformasAtivas() {
    const saved = localStorage.getItem('plataformas_ativas_frontend');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {
            console.log('Erro ao parsear plataformas ativas');
        }
    }
    // Padrão: todas ativas
    return ['mercadolivre', 'amazon', 'shopee', 'magalu'];
}

// ============================================
// FUNÇÃO PARA FILTRAR PRODUTOS POR PLATAFORMA ATIVA
// ============================================
export function filtrarProdutosPorPlataforma(produtos) {
    const plataformasAtivas = getPlataformasAtivas();
    
    // Mapeamento de nomes de plataforma para IDs
    const mapaPlataforma = {
        'Mercado Livre': 'mercadolivre',
        'Amazon': 'amazon',
        'Shopee': 'shopee',
        'Magalu': 'magalu',
        'mercadolivre': 'mercadolivre',
        'amazon': 'amazon',
        'shopee': 'shopee',
        'magalu': 'magalu'
    };
    
    return produtos.filter(produto => {
        const plataforma = produto.plataforma || '';
        const plataformaId = mapaPlataforma[plataforma] || mapaPlataforma[plataforma.toLowerCase()];
        
        if (!plataformaId) {
            // Se não conseguir identificar, mostra (fallback)
            return true;
        }
        
        const isAtiva = plataformasAtivas.includes(plataformaId);
        if (!isAtiva) {
            console.log(`🔴 Produto oculto: ${produto.titulo} (${plataforma} desativada)`);
        }
        return isAtiva;
    });
}

// ============================================
// FUNÇÃO PARA REGISTRAR CLIQUE NO BACKEND
// ============================================
async function registrarClique(produtoId, plataforma, linkOriginal, pagina) {
    try {
        // Se não tiver ID, não registra
        if (!produtoId) {
            console.warn('⚠️ Produto sem ID, clique NÃO registrado');
            return;
        }
        
        const sessaoId = localStorage.getItem('sessaoId');
        if (!sessaoId) {
            const novaSessao = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessaoId', novaSessao);
        }
        
        const sessaoIdAtual = localStorage.getItem('sessaoId');
        
        // Mapeamento de nomes de plataforma
        const plataformaMap = {
            'Mercado Livre': 'mercadolivre',
            'Amazon': 'amazon',
            'Shopee': 'shopee',
            'Magalu': 'magalu'
        };
        
        const plataformaKey = plataformaMap[plataforma] || plataforma.toLowerCase();
        
        console.log(`📤 Enviando clique: Produto ID=${produtoId}, Plataforma=${plataformaKey}`);
        
        const response = await fetch('https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io/api/cliques/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                produto_id: parseInt(produtoId) || produtoId,
                plataforma: plataformaKey,
                link_original: linkOriginal,
                sessao_id: sessaoIdAtual,
                pagina: pagina || window.location.pathname
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Clique registrado: ${plataforma} - Produto: ${produtoId}`, data);
        } else {
            console.warn(`⚠️ Falha ao registrar clique: ${response.status}`, data);
        }
    } catch (error) {
        console.error('❌ Erro ao registrar clique:', error);
    }
}

/**
 * Renderiza produtos no container especificado
 * @param {HTMLElement} container - Elemento onde os produtos serão inseridos
 * @param {Array} products - Lista de produtos a serem renderizados
 * @param {boolean} isCarousel - Se true, substitui o conteúdo; se false, adiciona ao final (para scroll infinito)
 */
export function renderProducts(container, products, isCarousel = false) {
  if (!container) return;
  
  // FILTRA PRODUTOS POR PLATAFORMA ATIVA
  const produtosFiltrados = filtrarProdutosPorPlataforma(products);
  
  // Se for carrossel, limpa o container antes de adicionar
  if (isCarousel) {
    container.innerHTML = '';
  }

  if (!produtosFiltrados || produtosFiltrados.length === 0) {
    if (isCarousel) {
      container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum produto encontrado</p>';
    }
    return;
  }

  // Para cada produto, cria o card
  produtosFiltrados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    
    // Captura os dados do produto
    const produtoId = p.id;
    const plataforma = p.plataforma || 'Mercado Livre';
    const link = p.link_afiliado || p.link_original || '#';
    
    // CORREÇÃO: Adiciona registro de clique antes de abrir o link
    card.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log(`🖱️ Clique no produto: ${p.titulo || p.title} | ID: ${produtoId} | Plataforma: ${plataforma}`);
      
      // Registra o clique no backend
      if (produtoId) {
        await registrarClique(produtoId, plataforma, link, window.location.pathname);
      } else {
        console.warn('⚠️ Produto sem ID, clique NÃO será registrado no backend');
      }
      
      // Abre o link em nova aba
      if (link && link !== '#') {
        window.open(link, '_blank');
      } else {
        console.warn('Link não disponível para este produto');
      }
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
      
      // CORREÇÃO: se o valor for maior que 1000, provavelmente está em centavos
      // Produtos baratos (R$ 10,00) vêm como 1000 centavos
      // Produtos caros (R$ 1000,00) vêm como 100000 centavos
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

    // ===== CONSTRÓI O CARD (PADRÃO) =====
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
  
  // FILTRA PRODUTOS POR PLATAFORMA ATIVA
  const produtosFiltrados = filtrarProdutosPorPlataforma(products);
  
  return produtosFiltrados.map(p => {
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
    
    const produtoId = p.id;
    const plataforma = p.plataforma || 'Mercado Livre';
    const link = p.link_afiliado || p.link_original || '#';
    const imagem = p.imagem_principal || p.thumbnail || 'https://via.placeholder.com/200x200?text=Sem+Imagem';
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';
    
    // Função inline para registrar clique e abrir link
    const onclickHandler = `(async () => { 
      try { 
        const sessaoId = localStorage.getItem('sessaoId') || 'anon_' + Date.now();
        await fetch('https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io/api/cliques/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ produto_id: ${produtoId || 'null'}, plataforma: '${plataforma === 'Mercado Livre' ? 'mercadolivre' : plataforma.toLowerCase()}', link_original: '${link}', sessao_id: sessaoId, pagina: window.location.pathname })
        });
      } catch(e) { console.error(e); }
      window.open('${link}', '_blank');
    })()`;
    
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