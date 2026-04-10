# ERP Modular — Módulo 05: Financeiro

## Documento de Requisitos, DER e Documentação da API

**Grupo:** 05 — Financeiro (Contas e Fluxo de Caixa)
**Stack:** Node.js · Express · SQLite/MySQL · HTML · CSS · JavaScript Vanilla
**Data:** Abril / 2026

---

## 1. Requisitos Funcionais (RF)

| ID   | Descrição                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RF01 | O sistema deve permitir o cadastro de lançamentos do tipo **Conta a Pagar** (fornecedores).                                                            |
| RF02 | O sistema deve permitir o cadastro de lançamentos do tipo **Conta a Receber** (clientes).                                                              |
| RF03 | O sistema deve exibir um **Dashboard** com KPIs: total a receber, total a pagar, saldo previsto e títulos vencidos.                                    |
| RF04 | O sistema deve apresentar uma **tela de extrato** consolidando entradas e saídas por mês (Fluxo de Caixa).                                             |
| RF05 | O sistema deve permitir a **liquidação de títulos** (quitação), marcando o status como "Pago".                                                         |
| RF06 | O sistema deve permitir a **exclusão** de lançamentos.                                                                                                 |
| RF07 | O sistema deve expor uma **API de integração** (`POST /api/integracao`) para receber lançamentos automáticos oriundos dos módulos de Vendas e Compras. |
| RF08 | Os lançamentos devem exibir **indicadores visuais** de status (Pendente, Pago, Vencido).                                                               |
| RF09 | O sistema deve exibir os **5 lançamentos mais recentes** na tela de Dashboard.                                                                         |
| RF10 | O formulário de novo lançamento deve ter campo de descrição, parceiro (cliente/fornecedor), valor e data de vencimento.                                |

---

## 2. Requisitos Não Funcionais (RNF)

| ID    | Descrição                                                                                   |
| ----- | ------------------------------------------------------------------------------------------- |
| RNF01 | O backend deve ser desenvolvido em **Node.js com Express**.                                 |
| RNF02 | O banco de dados deve ser **MySQL** (produção) ou **SQLite** (desenvolvimento local).       |
| RNF03 | O frontend deve ser desenvolvido com **HTML, CSS e JavaScript puro** (sem frameworks).      |
| RNF04 | A API deve seguir o padrão **REST**, retornando respostas em JSON.                          |
| RNF05 | O sistema deve ser responsivo e funcionar em resoluções de 1024px ou superior.              |
| RNF06 | O tempo de resposta das chamadas de API não deve ultrapassar **500 ms** em rede local.      |
| RNF07 | O frontend deve ser servido como arquivo estático pelo próprio servidor Express.            |
| RNF08 | Todas as rotas de API devem retornar **códigos HTTP semânticos** (200, 201, 400, 404, 500). |

---

## 3. Regras de Negócio (RN)

| ID   | Descrição                                                                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| RN01 | Um lançamento só pode ser quitado se o status atual for **Pendente** ou **Vencido**.                                                         |
| RN02 | O **Saldo Previsto** é calculado como: Σ(Contas a Receber pendentes) − Σ(Contas a Pagar pendentes).                                          |
| RN03 | Um lançamento é considerado **Vencido** quando a data de vencimento é anterior à data atual e o status ainda é "Pendente".                   |
| RN04 | O Fluxo de Caixa agrupa lançamentos **pagos/recebidos** por mês de vencimento.                                                               |
| RN05 | Os campos **tipo, descricao, parceiro, valor e vencimento** são obrigatórios na criação de um lançamento.                                    |
| RN06 | A API de integração `/api/integracao` deve aceitar lançamentos do tipo **"receber"** (oriundo de Vendas) e **"pagar"** (oriundo de Compras). |
| RN07 | Ao criar um lançamento via integração, o status inicial é sempre **"Pendente"**.                                                             |

---

## 4. Diagrama de Entidade-Relacionamento (DER)

```
+-------------------+          +-------------------+
|    lancamentos    |          |     parceiros     |
+-------------------+          +-------------------+
| PK id             |          | PK id             |
|    tipo (ENUM)    |          |    nome           |
|    descricao      |          |    tipo (ENUM)    |
|    parceiro (FK)--+--------->|    documento      |
|    valor          |          |    email          |
|    vencimento     |          |    telefone       |
|    status (ENUM)  |          |    criado_em      |
|    data_liquidacao|          +-------------------+
|    observacao     |
|    criado_em      |
|    atualizado_em  |
+-------------------+

ENUM tipo_lancamento: 'pagar' | 'receber'
ENUM status:          'Pendente' | 'Pago' | 'Vencido' | 'Cancelado'
ENUM tipo_parceiro:   'cliente' | 'fornecedor' | 'ambos'
```

### Relacionamentos

- Um **parceiro** pode ter muitos **lançamentos** (1:N).
- O campo `parceiro` em `lancamentos` referencia `parceiros.nome` (ou `parceiros.id` na versão MySQL com FK formal).

---

## 5. Documentação da API

**Base URL:** `http://localhost:3001`

---

### 5.1 `GET /api/lancamentos`

Retorna todos os lançamentos cadastrados.

**Resposta 200:**

```json
[
  {
    "id": 1,
    "tipo": "pagar",
    "desc": "Nota Fiscal 001",
    "part": "Fornecedor Alpha",
    "valor": 8500.0,
    "venc": "2026-04-14",
    "status": "Pendente",
    "created_at": "2026-04-09T10:00:00.000Z"
  }
]
```

---

### 5.2 `GET /api/lancamentos/:id`

Retorna um lançamento pelo ID.

**Parâmetros de rota:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | integer | ID do lançamento |

**Respostas:**

- `200 OK` — objeto do lançamento
- `404 Not Found` — `{ "error": "Lançamento não encontrado" }`

---

### 5.3 `POST /api/lancamentos`

Cria um novo lançamento.

**Body (JSON):**

```json
{
  "tipo": "pagar",
  "desc": "Aluguel do galpão",
  "part": "Fornecedor Alpha",
  "valor": 3200.0,
  "venc": "2026-04-12",
  "status": "Pendente"
}
```

**Campos obrigatórios:** `tipo`, `desc`, `part`, `valor`, `venc`

**Respostas:**

- `201 Created` — objeto criado com `id`
- `400 Bad Request` — `{ "error": "Campos obrigatórios ausentes" }`

---

### 5.4 `PATCH /api/lancamentos/:id/quitar`

Marca um lançamento como "Pago" (liquidação do título).

**Respostas:**

- `200 OK` — `{ "message": "Lançamento quitado com sucesso" }`
- `404 Not Found` — `{ "error": "Não encontrado" }`

---

### 5.5 `DELETE /api/lancamentos/:id`

Remove um lançamento.

**Respostas:**

- `200 OK` — `{ "message": "Lançamento excluído" }`
- `404 Not Found` — `{ "error": "Não encontrado" }`

---

### 5.6 `POST /api/integracao`

Rota de integração externa. Recebe lançamentos criados pelos módulos de **Vendas** (receber) e **Compras** (pagar).

**Body (JSON):**

```json
{
  "tipo": "receber",
  "desc": "Pedido #2031 — Venda confirmada",
  "part": "Cliente Gama ME",
  "valor": 7500.0,
  "venc": "2026-05-01"
}
```

**Campos obrigatórios:** `tipo`, `desc`, `part`, `valor`, `venc`

**Respostas:**

- `201 Created` — `{ "message": "Lançamento integrado com sucesso!", "id": 12 }`
- `400 Bad Request` — `{ "error": "Dados incompletos" }`
- `500 Internal Server Error` — `{ "error": "<mensagem do banco>" }`

---

## 6. Estrutura do Repositório

```
erp-financeiro/
├── backend/
│   ├── routes/
│   │   └── lancamentos.js    # CRUD de lançamentos
│   ├── db.js                 # Conexão SQLite/MySQL
│   ├── server.js             # Entry point Express
│   └── package.json
├── frontend/
│   └── public/
│       └── index.html        # SPA (HTML + CSS + JS Vanilla)
└── docs/
    ├── REQUISITOS.md          # Este documento
    └── financeiro_schema.sql  # Script SQL
```

---

## 7. Instruções de Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start
# ou em modo desenvolvimento:
npm run dev

# 3. Acessar no navegador
# http://localhost:3001
```

## V1.7 - Senai && Hortobots

