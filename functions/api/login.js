export async function onRequestPost(context) {
  const { request, env } = context;
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
