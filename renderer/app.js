function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const btns = Array.from(document.querySelectorAll('.tab'));
  if (btns[n-1]) btns[n-1].classList.add('active');
  const target = document.getElementById('tab' + n);
  if (target) target.classList.add('active');
}

document.getElementById("originalContent")?.addEventListener("input", function() {
    document.getElementById("counterArticleFetch").innerText = this.value.length + " ký tự";
});

function saveGeneralApiConfig() {
  const config = {
    apiType: document.getElementById("apiTypeGeneral").value,
    apiKey: document.getElementById("apiKeyGeneral").value
  };
  localStorage.setItem("generalApiConfig", JSON.stringify(config));
  alert("Đã lưu!");
}
