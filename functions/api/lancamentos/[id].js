function checkAuth(request, env) {
  const token = request.headers.get("x-app-token");
  return token && env.APP_PIN && token === env.APP_PIN;
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!id) {
    return new Response(JSON.stringify({ error: "id inválido" }), { status: 400 });
  }

  await env.DB.prepare("DELETE FROM lancamentos WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}
