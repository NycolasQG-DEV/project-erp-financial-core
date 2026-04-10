const express = require('express');
const cors    = require('cors');
const path    = require('path');
const lancamentosRoutes = require('./routes/lancamentos');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Rotas ────────────────────────────────────────────────────
app.use('/api/lancamentos', lancamentosRoutes);

/**
 * POST /api/integracao
 * Rota de integração com módulos externos (Vendas → receber | Compras → pagar).
 * Recebe lançamentos automáticos e os insere na tabela de lancamentos.
 *
 * Body esperado:
 *   { tipo: 'receber'|'pagar', desc: string, part: string, valor: number, venc: string }
 */
app.post('/api/integracao', (req, res) => {
  const { tipo, desc, part, valor, venc } = req.body;

  if (!tipo || !desc || !part || !valor || !venc) {
    return res.status(400).json({ error: 'Dados incompletos. Campos obrigatórios: tipo, desc, part, valor, venc.' });
  }

  if (!['pagar', 'receber'].includes(tipo)) {
    return res.status(400).json({ error: 'Campo "tipo" deve ser "pagar" ou "receber".' });
  }

  const db = require('./db');
  db.run(
    `INSERT INTO lancamentos (tipo, desc, part, valor, venc, status)
     VALUES (?, ?, ?, ?, ?, 'Pendente')`,
    [tipo, desc, part, valor, venc],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'Lançamento integrado com sucesso!',
        id: this.lastID,
      });
    }
  );
});

// Fallback — serve o frontend para qualquer rota não-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  ERP 05 — Financeiro  →  http://localhost:${PORT}`);
});
