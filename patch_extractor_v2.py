from pathlib import Path
p=Path('main.js')
s=p.read_text()
old='''    let roughText = body
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')
      .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
      .replace(/<figcaption[\s\S]*?<\/figcaption>/gi, ' ')
      .replace(/<div class="[^"]*?(banner|ads|sidebar|comment|related)[^"]*?"[\s\S]*?<\/div>/gi, ' ')
      .replace(/<h1[\s\S]*?<\/h1>/gi, ' ')
      .replace(/<h2[\s\S]*?<\/h2>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')'''
new='''    let roughText = body
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?\/>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')'''
s=s.replace(old,new)
old='''      const prompt = `Bạn là chuyên gia trích xuất bài báo. Từ văn bản thô dưới đây, chỉ giữ lại nội dung chính liên quan trực tiếp tới bài báo/thời sự. Bỏ menu, quảng cáo, tiêu đề phụ không liên quan, ảnh, chú thích ảnh, gợi ý bài khác, thông tin bản quyền. Trả về nội dung sạch, không thêm lời dẫn.\n\n${roughText.slice(0, 50000)}`;
      const bot = { apiType: 'vertex', serviceAccountPath: saPath, model: 'gemini-2.5-flash' };
      const data = await callApiGeneric({ bot, prompt });'''
new='''      const prompt = `Bạn là biên tập viên AI. Trích xuất CHÍNH XÁC nội dung chính của bài báo dưới đây. 
QUY TẮC BẮT BUỘC:
1. GIỮ LẠI: Nội dung văn bản thân bài báo (thân bài).
2. LOẠI BỎ HOÀN TOÀN: Tiêu đề, menu, quảng cáo, sidebar, phần gợi ý đọc thêm, bình luận, tên tác giả, chú thích ảnh, khung ảnh, ngày tháng, nội dung chân trang, thông tin bản quyền.
3. KHÔNG THÊM LỜI DẪN, không giải thích, không tiêu đề phụ (h1, h2, h3).
4. Chỉ trả về nội dung text sạch, mạch lạc.
5. VIẾT LẠI thành các đoạn văn hoàn chỉnh.

VĂN BẢN THÔ:
${roughText.slice(0, 50000)}`;
      const bot = { apiType: 'vertex', serviceAccountPath: saPath, model: 'gemini-2.5-flash', systemInstruction: 'Bạn là công cụ trích xuất nội dung văn bản thuần túy.' };
      const data = await callApiGeneric({ bot, prompt });'''
s=s.replace(old,new)
p.write_text(s)
