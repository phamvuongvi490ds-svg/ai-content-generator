from pathlib import Path
p=Path('renderer/index.html')
s=p.read_text()
insert_after='''    <div class="card">
      <h3>Danh sách Chatbot đã lưu</h3>
      <div id="botList"></div>
    </div>'''
card='''    <div class="card">
      <h3>Cấu hình trích xuất bài báo</h3>
      <p style="color:#94a3b8; font-size:13px; margin-top:-5px;">Phần này chỉ dùng Gemini/Vertex để lấy đúng nội dung bài báo. Không liên quan đến chatbot viết bài.</p>
      <div class="form-group">
        <label>Service Account JSON Vertex/Gemini</label>
        <input type="text" id="articleServiceAccountPath" readonly placeholder="Chọn file Service Account JSON dùng riêng cho lấy nội dung bài báo">
        <button class="secondary" style="margin-top:5px" onclick="pickArticleServiceAccount()">Chọn File</button>
      </div>
      <button onclick="saveArticleExtractorConfig()">Lưu cấu hình trích xuất</button>
    </div>'''
if card not in s:
    s=s.replace(insert_after, insert_after+'\n'+card)
p.write_text(s)
