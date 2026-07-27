function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const btns = document.querySelectorAll('.tab');
  if(btns[n-1]) btns[n-1].classList.add('active');
  const target = document.getElementById('tab' + n);
  if(target) target.classList.add('active');
}

function saveGeneralApiConfig() {
  const cfg = {
    apiType: document.getElementById('apiTypeGeneral').value,
    apiKey: document.getElementById('apiKeyGeneral').value
  };
  localStorage.setItem('generalApiConfig', JSON.stringify(cfg));
  alert('Đã lưu API Chung!');
}

async function fetchArticleIntoRewrite() {
  const url = document.getElementById('rewriteArticleUrl').value;
  const data = await window.api.fetchArticle({url});
  if(data.error) return alert(data.error);
  document.getElementById('originalContent').value = data.text;
}

async function rewriteContent() {
  const cfg = JSON.parse(localStorage.getItem('generalApiConfig') || '{}');
  const original = document.getElementById('originalContent').value;
  const req = document.getElementById('rewriteRequirements').value;
  
  const prompt = `Hãy VIẾT LẠI nội dung này theo văn phong nói, giữ ngôn ngữ gốc: ${original}\n\nYêu cầu: ${req}`;
  
  const res = await window.api.callApi({bot: cfg, prompt});
  document.getElementById('outputTab3').innerText = res.text || 'Lỗi';
}
