from pathlib import Path
p=Path('main.js')
s=p.read_text()
old='''    let roughText = body
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?\/>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n+/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();'''
new='''    let doc = body
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?\/>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\\n')
      .replace(/<\/p>/gi, '\\n');
    let div = document.createElement("div");
    div.innerHTML = doc;
    let roughText = div.textContent
      .replace(/\\n\\s*\\n+/g, '\\n\\n')
      .replace(/[ \\t]+/g, ' ')
      .trim();'''
# Dùng replace cẩn thận vì có thể gây lỗi indentation.
# Em sẽ dùng cách thay thế thủ công.
s=s.replace(old, new)
p.write_text(s)
