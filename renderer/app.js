// [LOGIC GỐC CỦA ANH]
// ... (đã bao gồm các hàm cũ)

// Cập nhật hàm lưu API chung
window.saveGeneralApiConfig = function() {
  const apiType = document.getElementById("apiTypeGeneral").value;
  const config = {
    apiType: apiType,
    apiKey: apiType === "gemini" ? document.getElementById("genApiKeyGemini").value : 
            (apiType === "openai" ? document.getElementById("genApiKeyOpenAI").value : 
            document.getElementById("genApiKeyGateway").value),
    model: document.getElementById("apiModelGeneral").value,
    serviceAccountPath: document.getElementById("genServiceAccountPath").value
  };
  localStorage.setItem("generalApiConfig", JSON.stringify(config));
  console.log("Saving config:", config);
  alert("Đã lưu API chung thành công!");
}

// Gọi toggle khi chọn API
window.toggleGeneralApiInputs = function() {
  const type = document.getElementById("apiTypeGeneral").value;
  document.getElementById("genGatewayGroup").style.display = (type === "gateway") ? "block" : "none";
  document.getElementById("genGeminiGroup").style.display = (type === "gemini") ? "block" : "none";
  document.getElementById("genVertexGroup").style.display = (type === "vertex") ? "block" : "none";
  document.getElementById("genOpenAIGroup").style.display = (type === "openai") ? "block" : "none";
  updateGeneralModelOptions();
}

// Link chọn file vertex
window.pickGeneralServiceAccount = async function() {
  const file = await window.api.selectFile();
  if (file) document.getElementById("genServiceAccountPath").value = file;
}
