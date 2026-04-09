// /app/public/js/render.js

// ============================================
// MAPEAMENTO DOS ÍCONES DAS PLATAFORMAS
// ============================================
const plataformasIcones = {
    'mercadolivre': 'https://www.mercadolivre.com.br/favicon.ico',
    'amazon': 'https://www.amazon.com.br/favicon.ico',
    'shopee': 'https://shopee.com.br/favicon.ico',
    'magalu': 'https://www.magazineluiza.com.br/favicon.ico',
    'Mercado Livre': 'https://www.mercadolivre.com.br/favicon.ico',
    'Amazon': 'https://www.amazon.com.br/favicon.ico',
    'Shopee': 'https://shopee.com.br/favicon.ico',
    'Magalu': 'https://www.magazineluiza.com.br/favicon.ico'
};

// ============================================
// FUNÇÃO PARA OBTER ÍCONE (canto superior direito) - PADRÃO PARA TODOS OS CARDS
// ============================================
function getIconeCard(plataforma) {
    const icone = plataformasIcones[plataforma];
    if (icone) {
        return `<img src="${icone}" alt="${plataforma}" class="platform-icon-card" style="width: 20px; height: 20px; position: absolute; top: 8px; right: 8px; z-index: 10; border-radius: 4px;">`;
    }
    return '';
}

// ============================================
// FUNÇÃO PARA CARREGAR CATEGORIAS NO DROPDOWN
// ============================================
export async function carregarCategoriasDropdown() {
    try {
        const response = await fetch('https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io/api/produtos/categorias/contagem');
        const data = await response.json();
        
        const dropdown = document.getElementById('dropdown-categorias');
        if (!dropdown) return;
        
        if (data.success && data.categorias && data.categorias.length > 0) {
            const categoriasAtivas = data.categorias.filter(c => c.ativa);
            
            if (categoriasAtivas.length === 0) {
                dropdown.innerHTML = '<a href="#" style="color: #999;">Nenhuma categoria disponível</a>';
                return;
            }
            
            dropdown.innerHTML = categoriasAtivas.map(cat => `
                <a href="#" onclick="window.buscarPorCategoria('${cat.termo.replace(/'/g, "\\'")}'); return false;">
                    <span>${cat.icone}</span> ${cat.nome}
                </a>
            `).join('');
        } else {
            // Fallback
            const categoriasFallback = [
                { nome: "Celulares e Dispositivos", icone: "📱", termo: "celulares" },
                { nome: "Computadores e Acessórios", icone: "💻", termo: "computadores" },
                { nome: "Jogos e Consoles", icone: "🎮", termo: "jogos e consoles" },
                { nome: "Áudio", icone: "🎧", termo: "áudio" },
                { nome: "Eletrodomésticos", icone: "🧺", termo: "eletrodomésticos" },
                { nome: "Beleza", icone: "💄", termo: "beleza" },
                { nome: "Saúde", icone: "💊", termo: "saúde" }
            ];
            dropdown.innerHTML = categoriasFallback.map(cat => `
                <a href="#" onclick="window.buscarPorCategoria('${cat.termo}'); return false;">
                    <span>${cat.icone}</span> ${cat.nome}
                </a>
            `).join('');
        }
        console.log('✅ Dropdown de categorias atualizado');
    } catch (error) {
        console.error('❌ Erro ao carregar dropdown de categorias:', error);
        const dropdown = document.getElementById('dropdown-categorias');
        if (dropdown) {
            dropdown.innerHTML = '<a href="#" style="color: #999;">Erro ao carregar categorias</a>';
        }
    }
}

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
 * @param {boolean} isCarousel - Se true, substitui o conteúdo; se false, adiciona ao final
 */
export function renderProducts(container, products, isCarousel = false) {
  if (!container) return;
  
  const produtosFiltrados = filtrarProdutosPorPlataforma(products);
  
  if (isCarousel) {
    container.innerHTML = '';
  }

  if (!produtosFiltrados || produtosFiltrados.length === 0) {
    if (isCarousel) {
      container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum produto encontrado</p>';
    }
    return;
  }

  produtosFiltrados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    card.style.position = 'relative';
    
    const produtoId = p.id;
    const plataforma = p.plataforma || 'Mercado Livre';
    const link = p.link_afiliado || p.link_original || '#';
    
    card.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log(`🖱️ Clique no produto: ${p.titulo || p.title} | ID: ${produtoId} | Plataforma: ${plataforma}`);
      
      if (produtoId) {
        await registrarClique(produtoId, plataforma, link, window.location.pathname);
      } else {
        console.warn('⚠️ Produto sem ID, clique NÃO será registrado no backend');
      }
      
      if (link && link !== '#') {
        window.open(link, '_blank');
      } else {
        console.warn('Link não disponível para este produto');
      }
    };

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

    let imagem = p.imagem_principal || p.thumbnail;
    if (!imagem || imagem === '') {
      imagem = 'https://via.placeholder.com/200x200?text=Sem+Imagem';
    }

    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';

    const iconeHtml = getIconeCard(plataforma);

    card.innerHTML = `
      ${iconeHtml}
      <img src="${imagem}" alt="${titulo}" 
           class="product-image"
           onerror="this.src='https://via.placeholder.com/200x200?text=Sem+Imagem'">
      <div class="product-info">
        <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
        <div class="product-price">${precoFormatado}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Renderiza produtos no carrossel (formato específico com ícone no canto superior direito)
 * @param {HTMLElement} container - Elemento onde os produtos serão inseridos
 * @param {Array} products - Lista de produtos a serem renderizados
 */
export function renderCarousel(container, products) {
    if (!container) return;
    
    const produtosFiltrados = filtrarProdutosPorPlataforma(products);
    
    if (!produtosFiltrados || produtosFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align: center;">⚠️ Nenhum produto encontrado</p>';
        return;
    }
    
    container.innerHTML = produtosFiltrados.map(p => {
        const produtoId = p.id;
        const plataforma = p.plataforma || 'Mercado Livre';
        const link = p.link_afiliado || p.link_original || '#';
        const imagem = p.imagem_principal || 'https://via.placeholder.com/150';
        const titulo = (p.titulo || '').substring(0, 50);
        
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
        
        const iconeHtml = getIconeCard(plataforma);
        
        return `<div class="carousel-card" style="position: relative;" onclick="window.registrarCliqueCarrossel(${produtoId}, '${plataforma}', '${link}'); window.open('${link}', '_blank');">
            ${iconeHtml}
            <img src="${imagem}" alt="${titulo}" loading="lazy" onerror="this.src='https://via.placeholder.com/150'">
            <div class="product-title">${titulo}...</div>
            <div class="product-price">${precoFormatado}</div>
        </div>`;
    }).join('');
    
    console.log(`✅ Carrossel renderizado com ${produtosFiltrados.length} produtos`);
}

/**
 * Renderiza apenas os cards HTML (útil para scroll infinito)
 * @param {Array} products - Lista de produtos
 * @returns {string} HTML dos cards
 */
export function renderProductsHTML(products) {
  if (!products || products.length === 0) return '';
  
  const produtosFiltrados = filtrarProdutosPorPlataforma(products);
  
  return produtosFiltrados.map(p => {
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
    const link = p.link_afiliado || p.link_original || '#';
    const imagem = p.imagem_principal || p.thumbnail || 'https://via.placeholder.com/200x200?text=Sem+Imagem';
    const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
    const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';
    
    const iconeHtml = getIconeCard(plataforma);
    
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
      <div class="product-card" style="position: relative; cursor:pointer;" onclick="${onclickHandler.replace(/"/g, '&quot;')}">
        ${iconeHtml}
        <img src="${imagem}" alt="${titulo}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=Sem+Imagem'">
        <div class="product-info">
          <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
          <div class="product-price">${precoFormatado}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// FUNÇÕES AUXILIARES EXPORTADAS
// ============================================

export function formatPrice(preco) {
  if (!preco) return 'R$ 0,00';
  
  let precoNum = 0;
  if (typeof preco === 'number') {
    precoNum = preco;
  } else {
    const precoLimpo = preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    precoNum = parseFloat(precoLimpo);
  }
  
  if (precoNum > 1000) {
    precoNum = precoNum / 100;
  }
  
  if (isNaN(precoNum)) return 'R$ 0,00';
  
  return precoNum.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function generateStars(rating) {
  if (!rating || rating === 'N/A') return '☆☆☆☆☆';
  const numRating = parseFloat(rating.replace(',', '.'));
  if (isNaN(numRating)) return '☆☆☆☆☆';
  
  const fullStars = Math.floor(numRating);
  const halfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}