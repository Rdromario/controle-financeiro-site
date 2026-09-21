// Categorias e listas - mesmas usadas na planilha, pra manter os dois em sincronia
const CATEGORIAS = {
  "Renda": ["Salário", "Pró-labore", "Freelance", "Rendimentos", "Outros"],
  "Gasto Fixo": ["Aluguel/Financiamento", "Condomínio", "Energia", "Água", "Internet",
    "Telefone", "Plano de Saúde", "Seguro", "Educação", "Assinaturas", "Academia", "Outros"],
  "Gasto Variável": ["Mercado", "Alimentação/Restaurante", "Transporte", "Combustível",
    "Lazer", "Saúde", "Vestuário", "Casa/Manutenção", "Presentes", "Viagem", "Outros"]
};
const RESPONSAVEIS = ["Eu", "Esposa", "Casal"];
const FORMAS = ["Pix", "Débito", "Crédito", "Dinheiro", "Boleto", "Transferência"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho",
  "Agosto","Setembro","Outubro","Novembro","Dezembro"];

function getToken() {
  return localStorage.getItem("cf_token");
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign({}, options.headers, {
    "x-app-token": token || "",
    "content-type": "application/json"
  });
  const res = await fetch(path, Object.assign({}, options, { headers }));
  if (res.status === 401) {
    localStorage.removeItem("cf_token");
    window.location.href = "login.html";
    throw new Error("Não autorizado");
  }
  return res;
}

function formatBRL(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function logout() {
  localStorage.removeItem("cf_token");
  window.location.href = "login.html";
}
