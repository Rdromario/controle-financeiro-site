CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  responsavel TEXT,
  forma_pagamento TEXT,
  valor REAL NOT NULL,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
