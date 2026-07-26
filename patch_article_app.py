from pathlib import Path
p=Path('renderer/app.js')
s=p.read_text()
s=s.replace("""  updateModelOptions();
  renderBots();
};""", """  updateModelOptions();
  renderBots();
  loadArticleExtractorConfig();
};""")
insert_after="""async function pickServiceAccount() {
  const file = await window.api.selectFile();
  if (file) document.getElementById('botServiceAccountPath').value = file;
}
"""
new_block="""
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
"""
if new_block not in s:
    s=s.replace(insert_after, insert_after+new_block)
old="""async function fetchArticleIntoTopic() {
  const url = document.getElementById('articleUrl').value.trim();
  if (!url) return alert('Dán link bài báo trước.');
  const bot = config.bots[0];
  if (!bot) return alert('Chưa có cấu hình API/Gemini. Vào Cấu hình Bot lưu API trước.');
  const data = await window.api.fetchArticle({url, apiKey: bot.apiKeys[0], bot});
  if (data.error) return alert('Lỗi lấy bài báo: ' + data.error);
  document.getElementById('topic').value = data.text || '';
}

async function fetchArticleIntoRewrite() {
  const url = document.getElementById('rewriteArticleUrl').value.trim();
  if (!url) return alert('Dán link bài báo trước.');
  const bot = config.bots[0];
  if (!bot) return alert('Chưa có cấu hình API/Gemini. Vào Cấu hình Bot lưu API trước.');
  const data = await window.api.fetchArticle({url, apiKey: bot.apiKeys[0], bot});
  if (data.error) return alert('Lỗi lấy bài báo: ' + data.error);
  document.getElementById('originalContent').value = data.text || '';
}
"""
new="""async function fetchArticleIntoRewrite() {
  const url = document.getElementById('rewriteArticleUrl').value.trim();
  if (!url) return alert('Dán link bài báo trước.');
  const data = await window.api.fetchArticle({url});
  if (data.error) return alert('Lỗi lấy bài báo: ' + data.error);
  document.getElementById('originalContent').value = data.text || '';
}
"""
if old not in s:
    raise SystemExit('old fetch article functions not found')
s=s.replace(old,new)
p.write_text(s)
