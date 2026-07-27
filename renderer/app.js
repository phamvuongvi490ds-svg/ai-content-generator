let config = { bots: [] };
let generatedResultsByTitle = [];
let activeResultIndex = 0;

const MODEL_OPTIONS = {
  gateway: [{ value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' }, { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }],
  gemini: [{ value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' }, { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' }],
  vertex: [{ value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' }],
  openai: [{ value: 'gpt-4o-mini', label: 'GPT-4o mini' }, { value: 'gpt-4o', label: 'GPT-4o' }]
};

window.onload = async () => {
  config = await window.api.getConfig();
  loadGeneralApiConfig();
  toggleGeneralApiInputs();
};

function toggleGeneralApiInputs() {
  const type = document.getElementById("apiTypeGeneral").value;
  const groups = ["genGatewayGroup", "genGeminiGroup", "genVertexGroup", "genOpenAIGroup"];
  groups.forEach(g => {
    const el = document.getElementById(g);
    if(el) el.style.display = (g.toLowerCase().includes(type)) ? "block" : "none";
  });
  updateGeneralModelOptions();
}

function updateGeneralModelOptions() {
  const type = document.getElementById("apiTypeGeneral").value;
  const select = document.getElementById("apiModelGeneral");
  if (!select) return;
  const options = MODEL_OPTIONS[type] || MODEL_OPTIONS.gateway;
  select.innerHTML = options.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
}

function saveGeneralApiConfig() {
  const apiType = document.getElementById("apiTypeGeneral").value;
  const config = {
    apiType,
    apiKey: apiType === "gemini" ? document.getElementById("genApiKeyGemini").value : (apiType === "openai" ? document.getElementById("genApiKeyOpenAI").value : document.getElementById("genApiKeyGateway").value),
    model: document.getElementById("apiModelGeneral").value,
    baseUrl: apiType === "gemini" ? document.getElementById("genGeminiBaseUrl").value : (apiType === "openai" ? document.getElementById("genOpenAIBaseUrl").value : document.getElementById("genBaseUrl").value),
    serviceAccountPath: document.getElementById("genServiceAccountPath").value
  };
  localStorage.setItem("generalApiConfig", JSON.stringify(config));
  alert("Đã lưu API chung!");
}

function loadGeneralApiConfig() {
  const cfg = JSON.parse(localStorage.getItem("generalApiConfig") || "{}");
  if (cfg.apiType) {
    document.getElementById("apiTypeGeneral").value = cfg.apiType;
    document.getElementById("apiModelGeneral").value = cfg.model;
    if(cfg.apiType === 'gemini') document.getElementById("genApiKeyGemini").value = cfg.apiKey;
    else if(cfg.apiType === 'openai') document.getElementById("genApiKeyOpenAI").value = cfg.apiKey;
    else document.getElementById("genApiKeyGateway").value = cfg.apiKey;
    toggleGeneralApiInputs();
  }
}

async function fetchArticleIntoRewrite() {
  const url = document.getElementById("rewriteArticleUrl").value.trim();
  if (!url) return alert("Dán link bài báo trước.");
  const data = await window.api.fetchArticle({url});
  if (data.error) return alert("Lỗi: " + data.error);
  document.getElementById("originalContent").value = data.text;
  document.getElementById("counterArticleFetch").innerText = data.text.length + " ký tự";
  document.getElementById("counterTab3").innerText = data.text.length + " ký tự";
}

async function rewriteContent() {
  const cfgStr = localStorage.getItem("generalApiConfig");
  if (!cfgStr) return alert("Chưa cấu hình API Chung! Vui lòng vào tab Cấu hình API Chung.");
  const cfg = JSON.parse(cfgStr);
  const original = document.getElementById("originalContent").value.trim();
  if (!original) return alert("Chưa có nội dung.");
  
  const prompt = `Bạn là biên tập viên chuyên nghiệp. HÃY VIẾT LẠI nội dung sau, GIỮ NGUYÊN NGÔN NGỮ GỐC, văn phong nói tự nhiên. \n\nNỘI DUNG: ${original}`;
  const data = await window.api.callApi({ bot: cfg, prompt });
  if (data.error) return alert("Lỗi API: " + data.error);
  
  const text = data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  document.getElementById("outputTab3").innerText = text;
}

function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const btns = Array.from(document.querySelectorAll('.tab'));
  if (btns[n-1]) btns[n-1].classList.add('active');
  const target = document.getElementById('tab' + n);
  if (target) target.classList.add('active');
}
