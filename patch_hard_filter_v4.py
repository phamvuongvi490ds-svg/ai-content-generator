import re
from pathlib import Path

p = Path('main.js')
s = p.read_text()

# 1. Update extractor to include more classes and clean lines
# Regex for aggressive HTML block removal
old_regex = r'<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>|<aside[\s\S]*?<\/aside>|<img[^>]*>|<h1[\s\S]*?<\/h1>|<h2[\s\S]*?<\/h2>'
new_regex = r'<(script|style|nav|header|footer|aside|figure|figcaption|div|span|p|small|ul|li)[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author|caption|credit|photographer|byline|info|desc|image-desc|video-meta|media-note|footer)[^"]*?"[^>]*>[\s\S]*?<\/\1>|<img[^>]*>|<h1[\s\S]*?<\/h1>|<h2[\s\S]*?<\/h2>'

s = re.sub(old_regex, new_regex, s)

# 2. Add line-by-line cleaner after decode
cleaner = '''
    roughText = he.decode(roughText).split('\\n').map(line => {
        let trimmed = line.trim();
        if (/^(Clip|Ảnh|Nguồn|Theo|Tác giả|Người viết|Ảnh minh họa|Ảnh cover|Video|Bài liên quan):/i.test(trimmed)) return '';
        if (trimmed.length < 20 && /\\d{1,2}\\/\\d{1,2}|\\d{2}:\\d{2}/.test(trimmed)) return '';
        return trimmed;
    }).filter(l => l !== '').join('\\n').trim();
'''
# Insert after decode
s = s.replace('roughText = he.decode(roughText).trim();', cleaner)

p.write_text(s)
