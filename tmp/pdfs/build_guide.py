from pathlib import Path
import re,html
src=Path('PFS_CODE_EXPLANATION_GUIDE.md').read_text()
def inline(s):
 s=html.escape(s)
 s=re.sub(r'\[([^\]]+)\]\([^\)]+\)',r'\1',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
 s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
 return s
parts=re.split(r'(?m)^## ',src)
pages=[]
for idx,part in enumerate(parts):
 lines=part.splitlines(); out=[]; table=[]; code=[]; incode=False
 def flush():
  if table:
   rows=[r for r in table if not re.match(r'^\|[\s:|\-]+\|$',r)]
   out.append('<table>'+''.join('<tr>'+''.join(('<th>' if i==0 else '<td>')+inline(c.strip())+('</th>' if i==0 else '</td>') for c in r.strip('|').split('|'))+'</tr>' for i,r in enumerate(rows))+'</table>');table.clear()
 for n,line in enumerate(lines):
  if line.startswith('```'):
   flush()
   if incode:out.append('<pre>'+html.escape('\n'.join(code))+'</pre>');code=[]
   incode=not incode;continue
  if incode:code.append(line);continue
  if line.startswith('|'):table.append(line);continue
  flush()
  if not line.strip():continue
  if n==0 and idx>0:out.append('<h2>'+inline(line)+'</h2>')
  elif line.startswith('# '):out.append('<h1>'+inline(line[2:])+'</h1>')
  elif line.startswith('> '):out.append('<blockquote>'+inline(line[2:])+'</blockquote>')
  elif line.startswith('- '):out.append('<p class="item">• '+inline(line[2:])+'</p>')
  else:out.append('<p>'+inline(line)+'</p>')
 flush();pages.append('<section>'+''.join(out)+'</section>')
css='''@page {size:A4; margin:17mm 17mm 19mm} body{font-family:Thonburi,Arial,sans-serif;color:#253342;font-size:11px;line-height:1.8}section{break-before:page}section:first-child{break-before:auto}h1{font-size:25px;line-height:1.6;color:#163e56;margin:55px 0 28px}h2{font-size:21px;line-height:1.6;color:#163e56;margin:0 0 22px;border-bottom:2px solid #19958c;padding-bottom:12px}p{margin:10px 0;overflow-wrap:anywhere}blockquote{margin:16px 0;padding:17px 20px;background:#eef7f5;border-left:4px solid #19958c;font-size:12px;line-height:2}strong{color:#163e56}code{font-family:monospace;font-size:10px;background:#edf1f4;padding:1px 3px}pre{font-family:monospace;font-size:10px;line-height:1.65;background:#f1f4f7;padding:16px;white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:10px;margin:18px 0}th,td{border:1px solid #d6dfe5;padding:9px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#163e56;color:white}tr{break-inside:avoid}.item{font-size:10px;margin:8px 0}'''
Path('tmp/pdfs/guide.html').write_text('<!doctype html><html lang="th"><meta charset="utf-8"><title>PFS Code Explanation Guide</title><style>'+css+'</style><body>'+''.join(pages)+'</body></html>')
