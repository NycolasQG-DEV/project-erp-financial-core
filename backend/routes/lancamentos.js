const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── Criação da tabela ────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS lancamentos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo       TEXT    NOT NULL CHECK(tipo IN ('pagar','receber')),
    desc       TEXT    NOT NULL,
    part       TEXT    NOT NULL,
    valor      REAL    NOT NULL CHECK(valor > 0),
    venc       TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'Pendente'
               CHECK(status IN ('Pendente','Pago','Vencido','Cancelado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('Erro ao criar tabela lancamentos:', err.message);
});

// ── GET / — lista todos ──────────────────────────────────────
router.get('/', (req, res) => {
  const { tipo, status } = req.query;
  let sql    = 'SELECT * FROM lancamentos';
  const params = [];
  const where  = [];

  if (tipo)   { where.push('tipo = ?');   params.push(tipo); }
  if (status) { where.push('status = ?'); params.push(status); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ── GET /:id — busca por ID ──────────────────────────────────
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM lancamentos WHERE id = ?', [req.params.id], (err, row) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json(row);
  });
});

// ── POST / — cria novo ───────────────────────────────────────
router.post('/', (req, res) => {
  const { tipo, desc, part, valor, venc, status = 'Pendente' } = req.body;

  if (!tipo || !desc || !part || !valor || !venc) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: tipo, desc, part, valor, venc' });
  }
  if (!['pagar', 'receber'].includes(tipo)) {
    return res.status(400).json({ error: 'Campo "tipo" deve ser "pagar" ou "receber"' });
  }
  if (Number(valor) <= 0) {
    return res.status(400).json({ error: 'Campo "valor" deve ser maior que zero' });
  }

  db.run(
    `INSERT INTO lancamentos (tipo, desc, part, valor, venc, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo, desc, part, Number(valor), venc, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, tipo, desc, part, valor: Number(valor), venc, status });
    }
  );
});

// ── PATCH /:id/quitar — liquida título ──────────────────────
router.patch('/:id/quitar', (req, res) => {
  db.get('SELECT * FROM lancamentos WHERE id = ?', [req.params.id], (err, row) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Lançamento não encontrado' });
    if (row.status === 'Pago') {
      return res.status(400).json({ error: 'Lançamento já está quitado' });
    }

    db.run(
      'UPDATE lancamentos SET status = "Pago" WHERE id = ?',
      [req.params.id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Lançamento quitado com sucesso', id: row.id });
      }
    );
  });
});

// ── PATCH /:id/cancelar — cancela título ────────────────────
router.patch('/:id/cancelar', (req, res) => {
  db.run(
    'UPDATE lancamentos SET status = "Cancelado" WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err)            return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Não encontrado' });
      res.json({ message: 'Lançamento cancelado' });
    }
  );
});

// ── DELETE /:id ──────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM lancamentos WHERE id = ?', [req.params.id], function (err) {
    if (err)            return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json({ message: 'Lançamento excluído com sucesso' });
  });
});

// ── GET /relatorio/fluxo — fluxo de caixa mensal ────────────
router.get('/relatorio/fluxo', (req, res) => {
  db.all(`
    SELECT
      strftime('%Y-%m', venc) AS mes,
      SUM(CASE WHEN tipo = 'receber' THEN valor ELSE 0 END) AS entradas,
      SUM(CASE WHEN tipo = 'pagar'   THEN valor ELSE 0 END) AS saidas,
      SUM(CASE WHEN tipo = 'receber' THEN valor ELSE -valor END) AS saldo
    FROM lancamentos
    GROUP BY mes
    ORDER BY mes DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
