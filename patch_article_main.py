from pathlib import Path
p=Path('main.js')
s=p.read_text()
old='''    if (bot && roughText) {
      const prompt = `Bạn là chuyên gia trích xuất bài báo. Từ văn bản thô dưới đây, chỉ giữ lại nội dung chính liên quan trực tiếp tới bài báo/thời sự. Bỏ menu, quảng cáo, tiêu đề phụ không liên quan, ảnh, chú thích ảnh, gợi ý bài khác, thông tin bản quyền. Trả về nội dung sạch, không thêm lời dẫn.\n\n${roughText.slice(0, 50000)}`;
      const data = await callApiGeneric({ bot, prompt });
      const aiText = data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (aiText.trim()) roughText = aiText.trim();
    }'''
new='''    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const saPath = configData.articleExtractor?.serviceAccountPath;
    if (saPath && fs.existsSync(saPath) && roughText) {
      const prompt = `Bạn là chuyên gia trích xuất bài báo. Từ văn bản thô dưới đây, chỉ giữ lại nội dung chính liên quan trực tiếp tới bài báo/thời sự. Bỏ menu, quảng cáo, tiêu đề phụ không liên quan, ảnh, chú thích ảnh, gợi ý bài khác, thông tin bản quyền. Trả về nội dung sạch, không thêm lời dẫn.\n\n${roughText.slice(0, 50000)}`;
      const bot = { apiType: 'vertex', serviceAccountPath: saPath, model: 'gemini-2.5-flash' };
      const data = await callApiGeneric({ bot, prompt });
      const aiText = data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (aiText.trim()) roughText = aiText.trim();
    }'''
s=s.replace(old,new)
p.write_text(s)
