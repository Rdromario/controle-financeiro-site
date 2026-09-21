function checkAuth(request, env) {
  const token = request.headers.get("x-app-token");
  return token && env.APP_PIN && token === env.APP_PIN;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const url = new URL(request.url);
  const mes = url.searchParams.get("mes");
  const ano = url.searchParams.get("ano");
  const limite = parseInt(url.searchParams.get("limite") || "0", 10);

  let query = "SELECT * FROM lancamentos";
  const params = [];
  const conditions = [];

  if (mes && ano) {
    conditions.push("strftime('%m', data) = ?", "strftime('%Y', data) = ?");
    params.push(String(mes).padStart(2, "0"), String(ano));
  }
  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY data DESC, id DESC";
  if (limite > 0) {
    query += " LIMIT ?";
    params.push(limite);
  }

  const stmt = env.DB.prepare(query).bind(...params);
  const { results } = await stmt.all();
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const body = await request.json();
  const { data, tipo, categoria, descricao, responsavel, forma_pagamento, valor } = body;

  if (!data || !tipo || !categoria || valor === undefined || valor === null || isNaN(valor)) {
    return new Response(JSON.stringify({ error: "campos obrigatórios faltando" }), { status: 400 });
  }

  await env.DB.prepare(
    `INSERT INTO lancamentos (data, tipo, categoria, descricao, responsavel, forma_pagamento, valor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(data, tipo, categoria, descricao || "", responsavel || "", forma_pagamento || "", valor).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}
