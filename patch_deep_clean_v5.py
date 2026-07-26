import re
from pathlib import Path

p = Path('main.js')
s = p.read_text()

# Sửa logic replace/filter trong main.js
# Dùng replace để chèn thêm filter cho dòng caption/author/link
code_to_add = '''
        // Filter out lines that look like captions, authors, or links
        if (/^(Ảnh|Clip|Nguồn|Theo|Tác giả|Người viết|Vũ Tuân)/i.test(trimmed)) return '';
        if (trimmed.length < 100 && (trimmed.includes('Ảnh:') || trimmed.includes('https://') || trimmed.includes('.net/') || trimmed.includes('.com/'))) return '';
'''
# Chèn vào trong hàm filter của main.js
s = s.replace('if (trimmed.length < 20 && /\\d{1,2}\\/\\d{1,2}|\\d{2}:\\d{2}/.test(trimmed)) return \'\';', 
              'if (trimmed.length < 20 && /\\d{1,2}\\/\\d{1,2}|\\d{2}:\\d{2}/.test(trimmed)) return \'\';' + code_to_add)

p.write_text(s)
