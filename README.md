# ERP Modular — Módulo 05: Financeiro
> Grupo: Nycolas Gimenez, Tiago Gregório, Nicolas Medeiros e Vinicius Silva
> Controle de Contas a Pagar, Contas a Receber, Extrato e Fluxo de Caixa.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 · CSS3 · JavaScript Vanilla |
| Backend  | Node.js · Express 4 |
| Banco    | SQLite (dev) / MySQL (prod) |

---

## Estrutura do Projeto

```
erp-financeiro/
├── backend/
│   ├── routes/
│   │   └── lancamentos.js   # CRUD + relatório fluxo
│   ├── db.js                # Conexão SQLite
│   └── server.js            # Entry point + rota de integração
├── frontend/
│   └── index.html           # SPA completa
├── docs/
│   ├── REQUISITOS.md        # RFs, RNFs, RNs, DER, API
│   └── financeiro_schema.sql
└── package.json
```

---

## Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Desenvolvimento (com auto-reload)
npm run dev

# 3. Produção
npm start

# 4. Acesse no navegador
# http://localhost:3001
```

---

## Funcionalidades

- **Dashboard** — KPIs em tempo real: A Receber, A Pagar, Saldo Previsto e Títulos Vencidos
- **Contas a Pagar** — Cadastro, filtro por texto/status, quitação e exclusão
- **Contas a Receber** — Cadastro, filtro por texto/status, baixa e exclusão
- **Extrato** — Visão consolidada de entradas e saídas com filtros avançados
- **Fluxo de Caixa** — Agrupamento mensal com barras visuais comparativas
- **Modal de Liquidação** — Formulário de quitação de títulos com data de liquidação
- **API de Integração** — `POST /api/integracao` para receber lançamentos de Vendas e Compras

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | /api/lancamentos | Lista todos |
| GET    | /api/lancamentos/:id | Busca por ID |
| POST   | /api/lancamentos | Cria novo |
| PATCH  | /api/lancamentos/:id/quitar | Liquida título |
| PATCH  | /api/lancamentos/:id/cancelar | Cancela título |
| DELETE | /api/lancamentos/:id | Remove |
| GET    | /api/lancamentos/relatorio/fluxo | Fluxo mensal |
| POST   | /api/integracao | Integração externa |

---

## Integração com Outros Módulos

O endpoint `POST /api/integracao` recebe lançamentos de outros módulos ERP:

```json
// Vendas → gera conta a receber
POST /api/integracao
{
  "tipo": "receber",
  "desc": "Pedido #2031",
  "part": "Cliente XYZ",
  "valor": 5000.00,
  "venc": "2026-05-01"
}

// Compras → gera conta a pagar
POST /api/integracao
{
  "tipo": "pagar",
  "desc": "NF 089 — Compra insumos",
  "part": "Fornecedor ABC",
  "valor": 1800.00,
  "venc": "2026-04-20"
}
```
