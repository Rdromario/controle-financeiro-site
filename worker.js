function checkAuth(request, env) {
  const token = request.headers.get("x-app-token");
  return token && env.APP_PIN && token === env.APP_PIN;
}

async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  if (!env.APP_PIN) {
    return new Response(JSON.stringify({ ok: false, error: "APP_PIN não configurado" }), { status: 500 });
  }

  if (body.pin === env.APP_PIN) {
    return new Response(JSON.stringify({ ok: true, token: env.APP_PIN }), {
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: false }), {
    status: 401,
    headers: { "content-type": "application/json" }
  });
}

async function handleListar(request, env) {
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

async function handleCriar(request, env) {
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

async function handleExcluir(request, env, id) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const idNum = parseInt(id, 10);
  if (!idNum) {
    return new Response(JSON.stringify({ error: "id inválido" }), { status: 400 });
  }

  await env.DB.prepare("DELETE FROM lancamentos WHERE id = ?").bind(idNum).run();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === "/api/login" && method === "POST") {
      return handleLogin(request, env);
    }
    if (path === "/api/lancamentos" && method === "GET") {
      return handleListar(request, env);
    }
    if (path === "/api/lancamentos" && method === "POST") {
      return handleCriar(request, env);
    }
    const matchId = path.match(/^\/api\/lancamentos\/(\d+)$/);
    if (matchId && method === "DELETE") {
      return handleExcluir(request, env, matchId[1]);
    }

    // Qualquer outra rota: serve os arquivos estáticos do site (html, css, js)
    return env.ASSETS.fetch(request);
  }
};
