from pathlib import Path
p=Path('main.js')
s=p.read_text()
old='''    let roughText = body
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?\/>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')'''
new='''    let roughText = body
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div|span|p|small)[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author|caption|credit|photographer|byline)[^"]*?"[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(script|style|nav|header|footer|aside|figure|figcaption|div[^>]*class="[^"]*?(banner|ads|sidebar|comment|related|meta|social|author|caption|credit|photographer|byline)[^"]*?"|ul[^>]*class="[^"]*?related[^"]*?")[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<img[^>]*>/gi, ' ')'''
s=s.replace(old,new)
p.write_text(s)
