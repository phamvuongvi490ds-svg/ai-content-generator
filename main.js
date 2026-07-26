const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('renderer/index.html');
}

const configPath = path.join(app.getPath('userData'), 'config.json');

ipcMain.handle('get-config', () => {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return { bots: [] };
});

ipcMain.handle('save-config', (event, config) => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
});


function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function isRetryableError(data) {
  const code = data?.error?.code;
  const status = data?.error?.status;
  return code === 429 || code === 500 || code === 502 || code === 503 || code === 504 || status === 'UNAVAILABLE' || status === 'RESOURCE_EXHAUSTED';
}

function fallbackModels(apiType, model) {
  const list = apiType === 'openai'
    ? ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini']
    : ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
  return [model, ...list.filter(m => m !== model)];
}

async function getVertexToken(keyPath) {
  const auth = new GoogleAuth({
    keyFile: keyPath,
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function callApiGeneric({ bot, prompt }) {
  const { apiType, baseUrl, apiKeys, keyIndex, serviceAccountPath, geminiBaseUrl, openaiBaseUrl, systemInstruction } = bot;
  const keys = apiKeys && apiKeys.length ? apiKeys : [''];
  const models = fallbackModels(apiType, bot.model || (apiType === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash'));
  let lastData = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const apiKey = keys[((keyIndex || 0) + attempt) % keys.length];
      try {
        let url, headers, body;
        
        if (apiType === 'gemini') {
          const base = (geminiBaseUrl || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
          url = `${base}/v1beta/models/${model}:generateContent?key=${apiKey}`;
          headers = { 'Content-Type': 'application/json' };
          body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: (systemInstruction || '') + "\n\n" + prompt }] }] });
        } else if (apiType === 'gateway') {
          const base = (baseUrl || 'https://fisher-fare-wiley-travelling.trycloudflare.com').replace(/\/$/, '');
          url = `${base}/v1beta/models/${model}:generateContent?key=${apiKey}`;
          headers = { 'Content-Type': 'application/json' };
          body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: (systemInstruction || '') + "\n\n" + prompt }] }] });
        } else if (apiType === 'vertex') {
          const token = await getVertexToken(serviceAccountPath);
          const keyData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${keyData.project_id}/locations/us-central1/publishers/google/models/${model}:generateContent`;
          headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
          body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: (systemInstruction || '') + "\n\n" + prompt }] }] });
        } else if (apiType === 'openai') {
          url = `${(openaiBaseUrl || 'https://api.openai.com').replace(/\/$/, '')}/v1/chat/completions`;
          headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
          body = JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemInstruction || '' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.8
          });
        }

        const response = await fetch(url, { method: 'POST', headers, body });
        const data = await response.json();
        lastData = data;
        if (!data?.error) {
          if (model !== bot.model) data._fallbackModelUsed = model;
          return data;
        }
        if (!isRetryableError(data)) return data;
        await sleep(1500 * (attempt + 1));
      } catch (error) {
        lastData = { error: error.message };
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  return lastData || { error: 'All retries failed.' };
}

ipcMain.handle('call-api', async (event, { bot, prompt }) => {
  return await callApiGeneric({ bot, prompt });
});

ipcMain.handle('select-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle('save-text-file', async (event, { filename, text }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: filename || 'ai-content.txt',
    filters: [{ name: 'Text', extensions: ['txt'] }]
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, text || '', 'utf8');
  return filePath;
});





ipcMain.handle('fetch-article', async (event, payload) => {
  try {
    const url = typeof payload === 'string' ? payload : payload?.url;
    const bot = typeof payload === 'object' ? payload?.bot : null;
    if (!url || !/^https?:\/\//i.test(url)) return { error: 'URL không hợp lệ.' };
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' } });
    const html = await res.text();
    let body = html;
    const article = html.match(/<article[\s\S]*?<\/article>/i);
    const main = html.match(/<main[\s\S]*?<\/main>/i);
    if (article) body = article[0]; else if (main) body = main[0];
    let roughText = body
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')
      .replace(/<h1[\s\S]*?<\/h1>/gi, ' ')
      .replace(/<h2[\s\S]*?<\/h2>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n+/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    if (bot && roughText) {
      const prompt = `Bạn là chuyên gia trích xuất bài báo. Từ văn bản thô dưới đây, chỉ giữ lại nội dung chính liên quan trực tiếp tới bài báo/thời sự. Bỏ menu, quảng cáo, tiêu đề phụ không liên quan, ảnh, chú thích ảnh, gợi ý bài khác, thông tin bản quyền. Trả về nội dung sạch, không thêm lời dẫn.\n\n${roughText.slice(0, 50000)}`;
      const data = await callApiGeneric({ bot, prompt });
      const aiText = data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (aiText.trim()) roughText = aiText.trim();
    }
    return { text: roughText.slice(0, 80000) };
  } catch (e) {
    return { error: e.message || String(e) };
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
