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
// FUNÇÃO PARA OBTER ÍCONE (canto superior direito)
// ============================================
function getIconeCard(plataforma) {
    const icone = plataformasIcones[plataforma];
    if (icone) {
        return `<img src="${icone}" alt="${plataforma}" class="platform-icon-card" style="width: 20px; height: 20px; position: absolute; top: 8px; right: 8px; z-index: 10; border-radius: 4px;">`;
    }
    return '';
}

// ============================================
// FUNÇÃO CENTRALIZADA PARA FORMATAR PREÇO
// ============================================
function formatarPrecoCentralizado(valor) {
    if (valor === null || valor === undefined || valor === 'N/A') {
        return 'R$ 0,00';
    }
    
    let precoNum = 0;
    
    if (typeof valor === 'number') {
        precoNum = valor;
    } else {
        let limpo = valor.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        precoNum = parseFloat(limpo);
    }
    
    if (isNaN(precoNum)) {
        return 'R$ 0,00';
    }
    
    if (precoNum > 100000) {
        precoNum = precoNum / 100;
    }
    
    return precoNum.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ============================================
// FUNÇÃO PARA OBTER O PREÇO PRINCIPAL
// ============================================
function getPrecoFormatado(produto) {
    let preco = null;
    
    if (produto.preco_pix && produto.preco_pix !== 'N/A' && produto.preco_pix !== null) {
        preco = produto.preco_pix;
    } else if (produto.preco && produto.preco !== 'N/A' && produto.preco !== null) {
        preco = produto.preco;
    }
    
    if (preco) {
        return `<div class="product-price">${formatarPrecoCentralizado(preco)}</div>`;
    }
    return '<div class="product-price">R$ 0,00</div>';
}

// ============================================
// 🔥 FUNÇÃO PARA OBTER PARCELAMENTO FORMATADO (CORRIGIDA - BUSCA TODAS AS FONTES)
// ============================================
function getParcelamentoHtml(produto) {
    let texto = produto.parcelas_texto || 
                produto.parcelas_texto_completo || 
                produto.preco_parcelado || 
                '';
    
    if (!texto || texto === 'N/A') {
        if (produto.parcelas_qtd && produto.parcelas_qtd > 0) {
            const qtd = produto.parcelas_qtd;
            const semJuros = produto.parcelas_sem_juros === true || produto.parcelas_sem_juros === 'true';
            const valorFormatado = produto.parcelas_valor_formatado;
            
            if (valorFormatado && valorFormatado !== 'N/A') {
                texto = `${qtd}x ${valorFormatado}${semJuros ? ' sem juros' : ''}`;
            }
        }
    }
    
    if (!texto || texto === 'N/A' || texto === 'N/A sem juros') return '';
    
    texto = texto.replace(/[\n\r]+/g, ' ');
    texto = texto.replace(/\s*,\s*/g, ',');
    texto = texto.replace(/\s+/g, ' ').trim();
    
    if (!texto || texto === 'N/A' || texto === 'N/A sem juros') return '';
    
    const semJuros = produto.parcelas_sem_juros === true || 
                     produto.parcelas_sem_juros === 'true' ||
                     texto.toLowerCase().includes('sem juros');
    
    return `<div class="product-parcelamento" style="color: ${semJuros ? '#00a650' : '#666'};">${texto}</div>`;
}

// ============================================
// FUNÇÃO PARA OBTER ÍCONE DE FRETE GRÁTIS
// ============================================
function getFreteGratisIcon(freteGratis) {
    if (freteGratis === 'Sim' || freteGratis === true || freteGratis === 'true') {
        return '<span class="frete-gratis-badge">🚚 Frete Grátis</span>';
    }
    return '';
}

// ============================================
// FUNÇÃO PARA OBTER ÍCONE DE LOJA OFICIAL (REMOVIDO)
// ============================================
// function getLojaOficialIcon(lojaOficial) {
//    return '';
//}

// ============================================
// FUNÇÃO PARA OBTER AVALIAÇÃO FORMATADA
// ============================================
function getAvaliacao(produto) {
    if (produto.avaliacao && produto.avaliacao !== 'N/A') {
        const nota = produto.avaliacao;
        const estrelas = generateStars(nota);
        const reviews = produto.reviews ? `(${produto.reviews})` : '';
        return `<div class="product-rating">
                    <span>${estrelas}</span>
                    <span>${nota} ${reviews}</span>
                </div>`;
    }
    return '';
}

// ============================================
// FUNÇÃO GERAR ESTRELAS
// ============================================
export function generateStars(rating) {
    if (!rating || rating === 'N/A') return '☆☆☆☆☆';
    const numRating = parseFloat(rating.toString().replace(',', '.'));
    if (isNaN(numRating)) return '☆☆☆☆☆';
    
    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
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
// FUNÇÃO PARA REGISTRAR CLIQUE NO BACKEND (fire-and-forget)
// ============================================
function registrarCliqueFireAndForget(produtoId, plataforma, linkOriginal, pagina) {
    if (!produtoId) return;
    
    // Usa fetch sem await - não bloqueia o window.open
    const sessaoId = localStorage.getItem('sessaoId') || ('sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
    if (!localStorage.getItem('sessaoId')) {
        localStorage.setItem('sessaoId', sessaoId);
    }
    
    const plataformaMap = {
        'Mercado Livre': 'mercadolivre',
        'Amazon': 'amazon',
        'Shopee': 'shopee',
        'Magalu': 'magalu'
    };
    const plataformaKey = plataformaMap[plataforma] || plataforma.toLowerCase();
    
    fetch('https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io/api/cliques/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            produto_id: parseInt(produtoId) || produtoId,
            plataforma: plataformaKey,
            link_original: linkOriginal,
            sessao_id: sessaoId,
            pagina: pagina || window.location.pathname
        })
    }).then(res => res.json())
      .then(data => console.log(`✅ Clique registrado: ${plataforma} - Produto: ${produtoId}`))
      .catch(err => console.error('❌ Erro ao registrar clique:', err));
}

// ============================================
// RENDERIZAÇÃO DE PRODUTOS (CARDS NORMAIS) - CORRIGIDO PARA SAFARI
// ============================================
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
        
        // 🔥 CORRIGIDO: abre o link PRIMEIRO, registra clique DEPOIS (sem await)
        card.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Abre o link imediatamente (antes de qualquer await)
            if (link && link !== '#') {
                window.open(link, '_blank');
            }
            
            // Registra o clique em segundo plano (fire-and-forget)
            if (produtoId) {
                registrarCliqueFireAndForget(produtoId, plataforma, link, window.location.pathname);
            }
        };
        
        const precoHtml = getPrecoFormatado(p);
        const parcelamentoHtml = getParcelamentoHtml(p);
        const freteGratisHtml = getFreteGratisIcon(p.frete_gratis);
        const avaliacaoHtml = getAvaliacao(p);
        
        let imagem = p.imagem_principal || p.thumbnail;
        if (!imagem || imagem === '') {
            imagem = 'https://via.placeholder.com/200x200?text=Sem+Imagem';
        }
        
        const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
        const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';
        
        const iconeHtml = getIconeCard(plataforma);
        
        card.innerHTML = `
            ${iconeHtml}
            <img src="${imagem}" alt="${titulo}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=Sem+Imagem'">
            <div class="product-info">
                <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
                ${precoHtml}
                ${parcelamentoHtml}
                <div class="product-badges">${freteGratisHtml}</div>
                ${avaliacaoHtml}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ============================================
// RENDERIZAÇÃO DO CARROSSEL
// ============================================
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
        
        const precoHtml = getPrecoFormatado(p);
        const parcelamentoHtml = getParcelamentoHtml(p);
        const freteGratisHtml = getFreteGratisIcon(p.frete_gratis);
        const avaliacaoHtml = getAvaliacao(p);
        
        const iconeHtml = getIconeCard(plataforma);
        const precoLimpo = precoHtml.replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '');
        
        return `<div class="carousel-card" style="position: relative;" onclick="window.registrarCliqueCarrossel(${produtoId}, '${plataforma}', '${link}'); window.open('${link}', '_blank');">
            ${iconeHtml}
            <img src="${imagem}" alt="${titulo}" loading="lazy" onerror="this.src='https://via.placeholder.com/150'">
            <div class="product-title">${titulo}...</div>
            <div class="product-price">${precoLimpo}</div>
            ${parcelamentoHtml}
            <div class="product-badges">${freteGratisHtml}</div>
            ${avaliacaoHtml}
        </div>`;
    }).join('');
    
    console.log(`✅ Carrossel renderizado com ${produtosFiltrados.length} produtos`);
}

// ============================================
// RENDERPRODUCTSHTML - CORRIGIDO PARA SAFARI
// ============================================
export function renderProductsHTML(products) {
    if (!products || products.length === 0) return '';
    
    const produtosFiltrados = filtrarProdutosPorPlataforma(products);
    
    return produtosFiltrados.map(p => {
        const precoHtml = getPrecoFormatado(p);
        const parcelamentoHtml = getParcelamentoHtml(p);
        const freteGratisHtml = getFreteGratisIcon(p.frete_gratis);
        const avaliacaoHtml = getAvaliacao(p);
        
        const produtoId = p.id;
        const plataforma = p.plataforma || 'Mercado Livre';
        const link = p.link_afiliado || p.link_original || '#';
        const imagem = p.imagem_principal || p.thumbnail || 'https://via.placeholder.com/200x200?text=Sem+Imagem';
        const titulo = (p.titulo || p.title || 'Produto sem título').substring(0, 60);
        const tituloEllipsis = (p.titulo || p.title || 'Produto sem título').length > 60 ? '...' : '';
        
        const iconeHtml = getIconeCard(plataforma);
        const plataformaKey = plataforma === 'Mercado Livre' ? 'mercadolivre' : plataforma.toLowerCase();
        
        // 🔥 CORRIGIDO: window.open PRIMEIRO, fetch DEPOIS (sem await bloqueando)
        return `
            <div class="product-card" style="position: relative; cursor:pointer;" onclick="
                (function(){
                    var link = '${link.replace(/'/g, "\\'")}';
                    if(link && link !== '#') window.open(link, '_blank');
                    try {
                        var sessaoId = localStorage.getItem('sessaoId') || 'anon_' + Date.now();
                        fetch('https://yo0g0cg4c88w88osc4s04c0c.72.61.33.248.sslip.io/api/cliques/registrar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ produto_id: ${produtoId || 'null'}, plataforma: '${plataformaKey}', link_original: '${link.replace(/'/g, "\\'")}', sessao_id: sessaoId, pagina: window.location.pathname })
                        });
                    } catch(e) { console.error(e); }
                })();
            ">
                ${iconeHtml}
                <img src="${imagem}" alt="${titulo}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=Sem+Imagem'">
                <div class="product-info">
                    <h3 class="product-title">${titulo}${tituloEllipsis}</h3>
                    ${precoHtml}
                    ${parcelamentoHtml}
                    <div class="product-badges">${freteGratisHtml}</div>
                    ${avaliacaoHtml}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// EXPORTAÇÕES PARA USO GLOBAL
// ============================================
window.getParcelamentoHtml = getParcelamentoHtml;
window.getFreteGratisIcon = getFreteGratisIcon;
window.getLojaOficialIcon = getLojaOficialIcon;
window.getAvaliacao = getAvaliacao;
window.generateStars = generateStars;