-- ============================================================
-- ERP MODULAR — Módulo 05: Financeiro (Contas e Fluxo de Caixa)
-- Script de Criação de Tabelas e Dados Iniciais (Seeds)
-- Banco: MySQL 8.x
-- ============================================================

-- Cria e seleciona o banco de dados
CREATE DATABASE IF NOT EXISTS erp_financeiro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE erp_financeiro;

-- ============================================================
-- TABELA: lancamentos
-- Armazena contas a pagar e contas a receber
-- ============================================================
CREATE TABLE IF NOT EXISTS lancamentos (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  tipo        ENUM('pagar','receber') NOT NULL COMMENT 'Tipo do lançamento',
  descricao   VARCHAR(255)     NOT NULL COMMENT 'Descrição do título',
  parceiro    VARCHAR(150)     NOT NULL COMMENT 'Fornecedor (pagar) ou Cliente (receber)',
  valor       DECIMAL(15,2)    NOT NULL COMMENT 'Valor do título em R$',
  vencimento  DATE             NOT NULL COMMENT 'Data de vencimento',
  status      ENUM('Pendente','Pago','Vencido','Cancelado')
                               NOT NULL DEFAULT 'Pendente',
  data_liquidacao DATE         NULL  COMMENT 'Data efetiva de pagamento/recebimento',
  observacao  TEXT             NULL,
  criado_em   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tipo        (tipo),
  INDEX idx_status      (status),
  INDEX idx_vencimento  (vencimento),
  INDEX idx_parceiro    (parceiro)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COMMENT='Títulos de contas a pagar e contas a receber';

-- ============================================================
-- TABELA: parceiros
-- Clientes e fornecedores vinculados aos lançamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS parceiros (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150)  NOT NULL,
  tipo        ENUM('cliente','fornecedor','ambos') NOT NULL DEFAULT 'ambos',
  documento   VARCHAR(18)   NULL COMMENT 'CPF ou CNPJ',
  email       VARCHAR(100)  NULL,
  telefone    VARCHAR(20)   NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_documento (documento)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COMMENT='Clientes e fornecedores';

-- ============================================================
-- DADOS INICIAIS (SEEDS)
-- ============================================================

-- Parceiros
INSERT INTO parceiros (nome, tipo, documento, email) VALUES
  ('Fornecedor Alpha Ltda',  'fornecedor', '12.345.678/0001-99', 'financeiro@alpha.com.br'),
  ('Fornecedor Beta S/A',    'fornecedor', '98.765.432/0001-11', 'contas@beta.com.br'),
  ('Cliente Gama ME',        'cliente',    '11.222.333/0001-44', 'pagamentos@gama.com.br'),
  ('Cliente Delta Comércio', 'cliente',    '55.666.777/0001-88', 'financeiro@delta.com.br'),
  ('Distribuidora Épsilon',  'ambos',      '33.444.555/0001-22', 'contato@epsilon.com.br');

-- Lançamentos — Contas a Pagar
INSERT INTO lancamentos (tipo, descricao, parceiro, valor, vencimento, status) VALUES
  ('pagar', 'Nota Fiscal 001 — Compra de mercadorias',       'Fornecedor Alpha Ltda',  8500.00, CURDATE() + INTERVAL  5 DAY, 'Pendente'),
  ('pagar', 'Fatura de energia elétrica — Maio/2026',        'Fornecedor Beta S/A',     940.50, CURDATE() + INTERVAL 10 DAY, 'Pendente'),
  ('pagar', 'Aluguel do galpão — Maio/2026',                 'Fornecedor Alpha Ltda',  3200.00, CURDATE() + INTERVAL  3 DAY, 'Pendente'),
  ('pagar', 'Serviço de TI — Manutenção mensal',             'Distribuidora Épsilon',  1500.00, CURDATE() - INTERVAL  2 DAY, 'Vencido'),
  ('pagar', 'NF 045 — Compra de insumos',                    'Fornecedor Beta S/A',    2300.00, CURDATE() - INTERVAL 15 DAY, 'Pago');

-- Lançamentos — Contas a Receber
INSERT INTO lancamentos (tipo, descricao, parceiro, valor, vencimento, status, data_liquidacao) VALUES
  ('receber', 'Pedido #1021 — Venda de produtos',      'Cliente Gama ME',        12000.00, CURDATE() + INTERVAL  7 DAY, 'Pendente', NULL),
  ('receber', 'Pedido #1022 — Entrega parcial',        'Cliente Delta Comércio',  4750.00, CURDATE() + INTERVAL 14 DAY, 'Pendente', NULL),
  ('receber', 'Fatura mensal serviço de consultoria',  'Distribuidora Épsilon',   3600.00, CURDATE() - INTERVAL  5 DAY, 'Vencido',  NULL),
  ('receber', 'Pedido #1019 — Liquidado',              'Cliente Gama ME',         9200.00, CURDATE() - INTERVAL 20 DAY, 'Pago',     CURDATE() - INTERVAL 18 DAY),
  ('receber', 'Pedido #1020 — Liquidado',              'Cliente Delta Comércio',  5500.00, CURDATE() - INTERVAL 30 DAY, 'Pago',     CURDATE() - INTERVAL 28 DAY);
