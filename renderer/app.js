let config = { bots: [] };
let editingIndex = -1;
let generatedResultsByTitle = [];
let activeResultIndex = 0;

const MODEL_OPTIONS = {
  gateway: [
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'imagen-3.0-generate-002', label: 'Imagen 3' }
  ],
  gemini: [
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' }
  ],
  vertex: [
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
    { value: 'gpt-4o', label: 'GPT-4o' }
  ]
};

window.onload = async () => {
  config = await window.api.getConfig();
  config.bots = config.bots || [];
  loadLengthSettings();
  bindLengthSettingsAutosave();
  toggleBotApiInputs();
  updateModelOptions();
  renderBots();
  loadArticleExtractorConfig();
};

function loadLengthSettings() {
  const minEl = document.getElementById('minChars');
  const maxEl = document.getElementById('maxChars');
  if (minEl) minEl.value = localStorage.getItem('aiContentMinChars') || '';
  if (maxEl) maxEl.value = localStorage.getItem('aiContentMaxChars') || '';
}

function saveLengthSettings() {
  const minEl = document.getElementById('minChars');
  const maxEl = document.getElementById('maxChars');
  const rMin = document.getElementById('rewriteMinChars');
  const rMax = document.getElementById('rewriteMaxChars');
  if (minEl) localStorage.setItem('aiContentMinChars', minEl.value.trim());
  if (maxEl) localStorage.setItem('aiContentMaxChars', maxEl.value.trim());
  if (rMin) localStorage.setItem('aiRewriteMinChars', rMin.value.trim());
  if (rMax) localStorage.setItem('aiRewriteMaxChars', rMax.value.trim());
}

function bindLengthSettingsAutosave() {
  const rMin = document.getElementById('rewriteMinChars');
  const rMax = document.getElementById('rewriteMaxChars');
  if (rMin) rMin.value = localStorage.getItem('aiRewriteMinChars') || '';
  if (rMax) rMax.value = localStorage.getItem('aiRewriteMaxChars') || '';
  ['minChars', 'maxChars', 'rewriteMinChars', 'rewriteMaxChars'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveLengthSettings);
  });
}

function showTab(n) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  const btns = Array.from(document.querySelectorAll(".tab"));
  if (btns[n-1]) btns[n-1].classList.add("active");
  const target = document.getElementById("tab" + n);
  if (target) target.classList.add("active");
}

function currentBotApiType() {
  const checked = document.querySelector('input[name="botApiType"]:checked');
  return checked ? checked.value : 'gateway';
}

function updateModelOptions(selectedValue = '') {
  const type = currentBotApiType();
  const select = document.getElementById('botModel');
  if (!select) return;
  const options = MODEL_OPTIONS[type] || MODEL_OPTIONS.gateway;
  select.innerHTML = '';
  options.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.textContent = `${m.label} (${m.value})`;
    select.appendChild(opt);
  });
  if (selectedValue) select.value = selectedValue;
}

function toggleBotApiInputs() {
  const type = currentBotApiType();
  const groups = ['botGatewayGroup', 'botGeminiGroup', 'botVertexGroup', 'botOpenAIGroup'];
  groups.forEach(g => {
    const el = document.getElementById(g);
    if(el) el.style.display = (g.toLowerCase().includes(type)) ? 'block' : 'none';
  });
  updateModelOptions();
}

async function pickServiceAccount() {
  const file = await window.api.selectFile();
  if (file) document.getElementById('botServiceAccountPath').value = file;
}

function loadArticleExtractorConfig() {
  const el = document.getElementById('articleServiceAccountPath');
  if (el) el.value = config.articleExtractor?.serviceAccountPath || '';
}

async function pickArticleServiceAccount() {
  const file = await window.api.selectFile();
  if (file) document.getElementById('articleServiceAccountPath').value = file;
}

async function saveArticleExtractorConfig() {
  const serviceAccountPath = document.getElementById('articleServiceAccountPath')?.value?.trim() || '';
  config.articleExtractor = { serviceAccountPath };
  await window.api.saveConfig(config);
  alert('Đã lưu cấu hình trích xuất bài báo.');
}

function getBotFromForm() {
  const apiType = currentBotApiType();
  const keyBox = apiType === 'gemini' ? 'botApiKeysGemini' : (apiType === 'openai' ? 'botApiKeysOpenAI' : 'botApiKeysGateway');
  return {
    name: document.getElementById('botName').value.trim(),
    apiType,
    model: document.getElementById('botModel').value,
    systemInstruction: document.getElementById('systemInstruction').value.trim(),
    baseUrl: document.getElementById('botBaseUrl').value.trim(),
    geminiBaseUrl: document.getElementById('botGeminiBaseUrl').value.trim() || 'https://generativelanguage.googleapis.com',
    openaiBaseUrl: document.getElementById('botOpenAIBaseUrl').value.trim() || 'https://api.openai.com',
    serviceAccountPath: document.getElementById('botServiceAccountPath').value.trim(),
    apiKeys: (document.getElementById(keyBox)?.value || '').split('\n').map(k => k.trim()).filter(Boolean),
    keyIndex: 0
  };
}

async function addBot() {
  const bot = getBotFromForm();
  if (!bot.name) return alert('Nhập tên bot.');
  if (editingIndex >= 0) config.bots[editingIndex] = bot;
  else config.bots.push(bot);
  await window.api.saveConfig(config);
  clearBotForm();
  renderBots();
}

function clearBotForm() {
  editingIndex = -1;
  document.getElementById('botName').value = '';
  document.getElementById('systemInstruction').value = '';
  document.getElementById('saveBotBtn').textContent = 'Lưu Chatbot';
}

async function deleteBot(idx) {
  if (!confirm('Xóa bot này?')) return;
  config.bots.splice(idx, 1);
  await window.api.saveConfig(config);
  renderBots();
}

function editBot(idx) {
  editingIndex = idx;
  const bot = config.bots[idx];
  document.getElementById('botName').value = bot.name;
  document.getElementById('systemInstruction').value = bot.systemInstruction;
  document.getElementById('saveBotBtn').textContent = 'Cập nhật Chatbot';
}

function renderBots() {
  const list = document.getElementById('botList');
  const mainSelect = document.getElementById('botSelectMain');
  const tab3Select = document.getElementById('selectBotTab3');
  
  if(list) list.innerHTML = '';
  if(mainSelect) mainSelect.innerHTML = '';
  if(tab3Select) tab3Select.innerHTML = '';

  config.bots.forEach((bot, index) => {
    if(list) {
       const div = document.createElement('div');
       div.className = 'bot-item';
       div.style = 'display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #334155;';
       div.innerHTML = `<span><b>${bot.name}</b> (${bot.model})</span>
                        <div><button onclick="editBot(${index})" class="secondary">Sửa</button> 
                        <button onclick="deleteBot(${index})" style="background:#ef4444">Xóa</button></div>`;
       list.appendChild(div);
    }
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = bot.name;
    if(mainSelect) mainSelect.appendChild(opt.cloneNode(true));
    if(tab3Select) tab3Select.appendChild(opt);
  });
}

function randomInt(min, max) {
  min = Math.ceil(Number(min || 0));
  max = Math.floor(Number(max || 0));
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickLengthTarget(min, max) {
  min = Number(min || 0);
  max = Number(max || 0);
  if (min > 0 && max > 0 && max > min) return randomInt(min + 1, max - 1);
  if (min > 0) return min + Math.max(200, Math.round(min * 0.35));
  if (max > 0) return Math.max(1, Math.round(max * 0.85));
  return 0;
}

function clampLengthTarget(target, min, max) {
  target = Number(target || 0);
  min = Number(min || 0);
  max = Number(max || 0);
  if (min > 0 && target <= min) target = min + 1;
  if (max > 0 && target >= max) target = max - 1;
  return Math.max(0, Math.round(target));
}

function buildLengthInstruction(min, max, target = 0, strict = false) {
  min = Number(min || 0);
  max = Number(max || 0);
  target = clampLengthTarget(target || pickLengthTarget(min, max), min, max);
  const lower = target ? Math.max(min || 0, Math.floor(target * 0.95)) : min;
  const upper = target ? (max > 0 ? Math.min(max, Math.ceil(target * 1.05)) : Math.ceil(target * 1.05)) : max;
  const strictText = strict && target ? ` Match the previous result length. Aim for ${target} characters and keep the final content between ${lower} and ${upper} characters.` : '';
  if (min > 0 && max > 0 && max > min) {
    return `Target length: about ${target} characters. Final content must be more than ${min} characters and less than ${max} characters.${strictText} Do not make it shorter than the target.`;
  }
  if (min > 0) {
    return `Target length: about ${target} characters and more than ${min} characters.${strictText} Do not make it shorter than the target.`;
  }
  if (max > 0) {
    return `Target length: about ${target} characters and less than ${max} characters.${strictText} Do not make it much shorter than the target.`;
  }
  if (target > 0) return `Target length: about ${target} characters.${strictText} Do not make it much shorter than the target.`;
  return 'No fixed character count. Use the natural length needed for a complete high-quality prompt.';
}

function cleanPromptText(text) {
  return (text || '')
    .replace(/```[\s\S]*?```/g, m => m.replace(/```/g, ''))
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '') // bỏ icon/emoji/biểu tượng
    .replace(/\[[\s\S]*?\]/g, '')                         // bỏ toàn bộ giải thích/chú thích trong [ ... ]
    .replace(/^\s*(note|notes|explanation|comment|caption|title|prompt|scene|camera|style|negative prompt|ghi chú|giải thích|chú thích|tiêu đề|cảnh|phong cách)\s*[:：\-–—].*$/gim, '')
    .replace(/(^|[.!?]\s+)\([^()\r\n]{0,140}\)\s*/g, '$1') // bỏ chú thích ngắn kiểu ( ... ) ở đầu câu
    .replace(/^[\s>*#\-–—•·]+/gm, '')
    .replace(/[\[\]{}<>*_`~|^=\\#@+$%&•·✓✔✕✖★☆→←↑↓]+/g, '') // bỏ ký tự đặc biệt khỏi kết quả
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}

function setOutput(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const cleanText = cleanPromptText(text);

  el.textContent = cleanText;
  const counter = document.getElementById(id === 'outputTab2' ? 'counterTab2' : 'counterTab3');
  if (counter) counter.textContent = `${cleanText.length.toLocaleString('vi-VN')} ký tự`;
}

function showResultTab(idx) {
  activeResultIndex = idx;
  const wrap = document.getElementById('resultTabs');
  if (wrap) {
    wrap.innerHTML = '';
    generatedResultsByTitle.forEach((res, i) => {
      const btn = document.createElement('button');
      btn.className = 'result-item-btn' + (i === idx ? ' active' : '');
      btn.innerHTML = `<span class="item-num">${i+1}</span> ${res.title}`;
      btn.onclick = () => showResultTab(i);
      wrap.appendChild(btn);
    });
  }
  const item = generatedResultsByTitle[idx];
  if (item) {
    document.getElementById('tab2OutputWrap').style.display = 'block';
    setOutput('outputTab2', item.content);
  }
}

function normalizeToRange(text, min, max) {
  text = (text || '').trim();
  min = Number(min || 0);
  max = Number(max || 0);
  if (!max) return text;
  
  // Nếu text dài hơn max, không cắt ngang xương mà tìm dấu chấm gần nhất để kết thúc câu
  if (text.length > max && max > 0) {
    let truncated = text.slice(0, max);
    const lastPunctuation = Math.max(
      truncated.lastIndexOf('.'), 
      truncated.lastIndexOf('?'), 
      truncated.lastIndexOf('!')
    );
    if (lastPunctuation > max * 0.8) { // Chỉ cắt nếu dấu câu đủ gần cuối (tránh mất quá nhiều nội dung)
      const sentenceCut = truncated.slice(0, lastPunctuation + 1);
      if (!min || sentenceCut.length > min) return sentenceCut;
    }
    return truncated;
  }
  // Nếu text ngắn hơn min, giữ nguyên để AI tự điều chỉnh câu cú hoàn hảo, không bù khoảng trắng vô nghĩa
  return text;
}

async function generateContent() {
  const botIdx = document.getElementById('botSelectMain').value;
  if (botIdx === '') return alert('Hãy chọn chatbot.');
  const titles = document.getElementById('topic').value.split('\n').map(t => t.trim()).filter(Boolean);
  if (!titles.length) return alert('Nhập tiêu đề.');

  const btn = document.getElementById('generateBtn');
  const progWrap = document.getElementById('genProgressWrap');
  const progBar = document.getElementById('genProgressBar');
  const errorBox = document.getElementById('genError');

  btn.disabled = true;
  btn.textContent = '⏳ Đang xử lý...';
  progWrap.style.display = 'block';
  progBar.style.width = '0%';
  errorBox.style.display = 'none';

  generatedResultsByTitle = titles.map(t => ({ title: t, content: 'Đang tạo nội dung...' }));
  showResultTab(0);

  const bot = config.bots[Number(botIdx)];
  saveLengthSettings();
  const minRaw = document.getElementById('minChars').value.trim();
  const maxRaw = document.getElementById('maxChars').value.trim();
  const min = minRaw ? Number(minRaw) : 0;
  const max = maxRaw ? Number(maxRaw) : 0;
  const requirements = document.getElementById('requirements').value.trim();

  // Ngưỡng an toàn thấp hơn để ép AI phải gọi nhiều lần hơn khi người dùng nhập giới hạn dài
  const MAX_PER_CALL = 1800;

  for (let i = 0; i < titles.length; i++) {
    try {
      let finalContent = "";
      const lengthTarget = pickLengthTarget(min, max);
      const lengthInstruction = buildLengthInstruction(min, max, lengthTarget);
      generatedResultsByTitle[i].lengthTarget = lengthTarget;
      generatedResultsByTitle[i].minChars = min;
      generatedResultsByTitle[i].maxChars = max;
      
      // Chỉ chia nhiều phần khi người dùng nhập giới hạn ký tự dài
      const numParts = max > MAX_PER_CALL ? Math.max(Math.ceil(max / 1500), 2) : 1; 
      
      if (numParts > 1) {
        let context = "";
        
        for (let p = 1; p <= numParts; p++) {
          const isLast = (p === numParts);
          
          // Tính toán giới hạn cho từng phần để tổng đạt ngưỡng 6500-7000
          const remaining = max - finalContent.length;
          const currentMax = isLast ? remaining : Math.min(MAX_PER_CALL, Math.ceil(remaining / (numParts - p + 1)) + 500);
          const currentMin = Math.floor(currentMax * 0.85);

          const prompt = `This is PART ${p} of ${numParts} for an EXTREMELY LONG and DETAILED content titled: "${titles[i]}".
MISSION CRITICAL: You are a "wordy" writer. You MUST describe every detail, every emotion, and every scene with extreme verbosity. 
STRICT REQUIREMENT: Write between ${currentMin} and ${currentMax} characters for THIS PART. Do not be concise.
Requirements: ${requirements || 'High quality, extremely detailed content.'}.

${context ? `PREVIOUS CONTENT CONTEXT (Do not repeat, continue the story): ...${context.slice(-2500)}\n\nCONTINUATION TASK: Pick up exactly where Part ${p-1} left off. Expand the NEXT specific chapter/detail. Do not skip any time or details.` : "STARTING TASK: Begin with a very long, immersive introduction and the first deep chapter."}

INSTRUCTION: ${isLast ? "Complete the exhaustive narrative. Ensure the total content feels like a massive, complete work. End with a full sentence." : "Write this part in overwhelming detail. Stop at a natural transition point. Part ${p+1} will continue immediately after your last word."}
Return ONLY the content text. NO titles, NO labels, NO explanations, NO notes, NO icons, NO emoji, NO bracketed text like [ ... ], NO special formatting characters.`;

          const data = await window.api.callApi({ bot, prompt });
          if (data.error) throw new Error(JSON.stringify(data.error, null, 2));
          
          const partText = (data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
          finalContent += (finalContent ? "\n\n" : "") + partText;
          context += partText;
          
          // Nếu đã đạt ngưỡng max sớm thì có thể dừng (nhưng thường AI sẽ viết ngắn hơn)
          if (finalContent.length >= max && !isLast) {
             // Continue to next part anyway to ensure "Last Part" logic runs or just break if really over
          }
        }
      } else {
        // Xử lý thông thường nếu độ dài ngắn
        const prompt = `Create high-quality, engaging content for title: ${titles[i]}. 
${lengthInstruction}
Additional requirements: ${requirements || 'Output in the language implied by the title or requirements.'}.
Writing style: Ensure perfect grammar, natural flow, and a complete narrative. The content must end with a full sentence.
Return ONLY the final content. No filler, no headers, no explanations, no notes, no icons, no emoji, no bracketed text like [ ... ], no special symbols or decorative formatting characters.`;
        
        const data = await window.api.callApi({ bot, prompt });
        if (data.error) throw new Error(JSON.stringify(data.error, null, 2));
        finalContent = data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      const normalized = cleanPromptText(normalizeToRange(finalContent, min, max));
      generatedResultsByTitle[i].content = normalized;
      generatedResultsByTitle[i].actualLength = normalized.length;
      if (activeResultIndex === i) setOutput('outputTab2', normalized);
      showResultTab(activeResultIndex);
      
      progBar.style.width = `${((i + 1) / titles.length) * 100}%`;
    } catch (err) {
      errorBox.textContent = `LỖI TẠI TIÊU ĐỀ "${titles[i]}":\n${err.message}`;
      errorBox.style.display = 'block';
      generatedResultsByTitle[i].content = `[LỖI]: ${err.message}`;
      if (activeResultIndex === i) setOutput('outputTab2', `[LỖI]: ${err.message}`);
    }
  }

  btn.disabled = false;
  btn.textContent = '🚀 Bắt đầu tạo nội dung';
  setTimeout(() => { progWrap.style.display = 'none'; }, 2000);
}

async function copyOutput(id) {
  const text = cleanPromptText(document.getElementById(id).textContent);
  await navigator.clipboard.writeText(text);
  alert('Đã copy!');
}

async function downloadOutput(id, filename) {
  const text = cleanPromptText(document.getElementById(id).textContent);
  // Làm sạch tên file: bỏ ký tự đặc biệt. Nội dung file không kèm tiêu đề.
  const safeName = (filename || 'content.txt').replace(/[/\\?%*:|"<>\[\]{}]/g, '-');
  await window.api.saveTextFile({ filename: safeName, text });
  alert('Đã lưu file!');
}

function downloadActiveResult() {
  const item = generatedResultsByTitle[activeResultIndex];
  if (!item) return;
  downloadOutput('outputTab2', item.title + '.txt');
}

async function regenerateActiveTitle() {
  const botIdx = document.getElementById('botSelectMain').value;
  if (botIdx === '') return alert('Hãy chọn chatbot.');
  const bot = config.bots[Number(botIdx)];
  const item = generatedResultsByTitle[activeResultIndex];
  if (!item) return;

  const outEl = document.getElementById('outputTab2');
  const errorBox = document.getElementById('genError');
  const previousText = cleanPromptText(outEl.textContent || item.content || '');
  const previousLength = previousText.length || item.actualLength || item.lengthTarget || 0;
  
  outEl.textContent = '⏳ Đang tạo lại...';
  errorBox.style.display = 'none';
  
  saveLengthSettings();
  const minRaw = document.getElementById('minChars').value.trim();
  const maxRaw = document.getElementById('maxChars').value.trim();
  const min = minRaw ? Number(minRaw) : (item.minChars || 0);
  const max = maxRaw ? Number(maxRaw) : (item.maxChars || 0);
  const sameRange = min === (item.minChars || 0) && max === (item.maxChars || 0);
  const lengthTarget = sameRange ? clampLengthTarget(previousLength, min, max) : pickLengthTarget(min, max);
  const lengthInstruction = buildLengthInstruction(min, max, lengthTarget, true);
  const requirements = document.getElementById('requirements').value.trim();

  try {
    const prompt = `Create high-quality, engaging content for title: ${item.title}. 
${lengthInstruction}
Additional requirements: ${requirements || 'Output in the language implied by the title or requirements.'}.
Writing style: Ensure perfect grammar, natural flow, and a complete narrative. The content must end with a full sentence. Do not cut off mid-thought.
Length consistency: This is a regeneration. Keep the new result close to the previous result length. Do not return a shorter half-length version.
Return ONLY the final content. No filler, no headers, no conversational text, no explanations, no notes, no icons, no emoji, no bracketed text like [ ... ], no special symbols or decorative formatting characters.`;

    const data = await window.api.callApi({ bot, prompt });
    if (data.error) throw new Error(JSON.stringify(data.error, null, 2));
    
    let regenerated = cleanPromptText(data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Lỗi.');

    let requiredMin = lengthTarget ? Math.floor(lengthTarget * 0.95) : 0;
    if (min > 0) requiredMin = Math.max(requiredMin, min + 1);
    if (max > 0 && requiredMin >= max) requiredMin = Math.max(1, max - 1);
    let attempts = 0;
    while (requiredMin && regenerated.length < requiredMin && attempts < 6) {
      attempts++;
      const remaining = requiredMin - regenerated.length;
      const targetAfterAppend = max > 0 ? Math.min(max - 1, Math.max(requiredMin, lengthTarget || requiredMin)) : Math.max(requiredMin, lengthTarget || requiredMin);
      const hardLimitLine = max > 0 ? `The final total must stay below ${max} characters.` : '';
      const extendPrompt = `The regenerated content is too short and outside the required length range.
Current length: ${regenerated.length} characters.
Required minimum: ${requiredMin} characters, because the regenerated result must stay close to the first result length.
Target final length: around ${targetAfterAppend} characters.
Add at least ${remaining} more characters, but only return the additional continuation text.
${hardLimitLine}
Do not restart. Do not summarize. Continue naturally from the existing text. No headers, no notes, no icons, no emoji, no bracketed text, no special formatting.

Existing content:
${regenerated}`;
      const moreData = await window.api.callApi({ bot, prompt: extendPrompt });
      if (moreData.error) throw new Error(JSON.stringify(moreData.error, null, 2));
      const moreText = cleanPromptText(moreData?.choices?.[0]?.message?.content || moreData?.candidates?.[0]?.content?.parts?.[0]?.text || '');
      if (!moreText) break;
      regenerated = cleanPromptText(regenerated + ' ' + moreText);
      if (max > 0 && regenerated.length >= max) {
        regenerated = cleanPromptText(regenerated.slice(0, max - 1));
        break;
      }
    }

    let normalized = cleanPromptText(normalizeToRange(regenerated, min, max));
    if (requiredMin && normalized.length < requiredMin) {
      throw new Error(`AI trả nội dung vẫn thiếu ký tự sau ${attempts} lần bù. Hiện có ${normalized.length} ký tự, cần khoảng ${requiredMin}-${max || 'không giới hạn'} ký tự để gần với lần tạo đầu. Hãy bấm tạo lại lần nữa hoặc tăng khoảng tối đa.`);
    }
    item.content = normalized;
    item.lengthTarget = lengthTarget;
    item.minChars = min;
    item.maxChars = max;
    item.actualLength = normalized.length;
    setOutput('outputTab2', normalized);
  } catch (err) {
    errorBox.textContent = `LỖI KHI TẠO LẠI:\n${err.message}`;
    errorBox.style.display = 'block';
    outEl.textContent = `[LỖI]: ${err.message}`;
  }
}


async function fetchArticleIntoRewrite() {
  const url = document.getElementById("rewriteArticleUrl").value.trim();
  if (!url) return alert("Dán link bài báo trước.");
  const data = await window.api.fetchArticle({url});
  if (data.error) return alert("Lỗi lấy bài báo: " + data.error);
  
  const text = data.text || "";
  document.getElementById("originalContent").value = text;
  document.getElementById("counterArticleFetch").innerText = text.length + " ký tự";
  document.getElementById("counterTab3").innerText = text.length + " ký tự";
}

async function downloadAllResults() {
  if (!generatedResultsByTitle.length) return alert('Chưa có nội dung để tải.');
  const text = generatedResultsByTitle
    .map((x, i) => `===== ${i + 1}. ${x.title} =====\n\n${cleanPromptText(x.content || '')}`)
    .join('\n\n');
  await window.api.saveTextFile({ filename: 'tat-ca-noi-dung-sang-tao.txt', text });
  alert('Đã lưu toàn bộ nội dung!');
}

function downloadRewriteResult() {
  downloadOutput('outputTab3', 'noi-dung-viet-lai.txt');
}

async function copyOriginalContent() {
  const text = document.getElementById('originalContent').value || '';
  if (!text.trim()) return alert('Chưa có nội dung để copy.');
  await navigator.clipboard.writeText(text);
  alert('Đã copy nội dung!');
}

async function rewriteContent() {
  const generalConfig = JSON.parse(localStorage.getItem("generalApiConfig") || "{}");
  if (!generalConfig.apiKey) return alert("Chưa cấu hình API chung. Vào tab Cấu hình API Chung để lưu trước.");
  
  const original = document.getElementById("originalContent").value.trim();
  if (!original) return alert("Chưa có nội dung.");
  
  // Prompt mới: tự động giữ ngôn ngữ gốc
  const prompt = `Bạn là biên tập viên chuyên nghiệp. Hãy VIẾT LẠI nội dung dưới đây, đảm bảo GIỮ NGUYÊN NGÔN NGỮ của bản gốc (ví dụ gốc tiếng Pháp thì viết lại tiếng Pháp).
  
YÊU CẦU:
- Phong cách văn nói, ngắt nghỉ như người bình thường kể chuyện.
- Giữ ý chính, không bịa thông tin.
- ${document.getElementById("rewriteRequirements").value.trim() || "Viết lại tự nhiên, hấp dẫn"}

NỘI DUNG GỐC:
${original}`;

  setOutput("outputTab3", "Đang viết lại...");
  // Sử dụng API chung
  const data = await window.api.callApi({ bot: { ...generalConfig, apiType: generalConfig.apiType }, prompt });
  
  if (data.error) return setOutput("outputTab3", "Lỗi: " + data.error);
  const text = data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả.";
  setOutput("outputTab3", text);
}

