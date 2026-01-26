-- ================================
-- BANCO DE DADOS: OfertaPrimeX
-- ================================

-- Criação da tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,              -- ID único do produto
    nome VARCHAR(255) NOT NULL,          -- Nome do produto
    descricao TEXT,                      -- Descrição
    preco NUMERIC(10,2) NOT NULL,        -- Preço
    imagem_url TEXT,                     -- URL da imagem
    criado_em TIMESTAMP DEFAULT NOW()    -- Data de criação
);
