"""Build static Ukrainian routes and reciprocal language metadata. Run from repo root."""
from pathlib import Path
import re,json,html,xml.etree.ElementTree as ET
from bs4 import BeautifulSoup,Comment
ROOT=Path(__file__).resolve().parents[1]; DOMAIN='https://olehhebel.top'
M={}
for line in (ROOT/'i18n/uk.txt').read_text().splitlines():
 if '|||' in line:
  a,b=line.split('|||',1);M[a.strip()]=b.strip()
DATA=json.loads((ROOT/'i18n/pages-uk.json').read_text())
FILES=[p for p in ROOT.rglob('*.html') if not any(x in p.relative_to(ROOT).parts for x in ['uk','.git','partials']) and not p.name.startswith('google')]
FILES=[p for p in FILES if BeautifulSoup(p.read_text(),'html.parser').body]
SLUGS={p.relative_to(ROOT).with_suffix('').as_posix():p for p in FILES}
def enurl(slug):return '/' if slug=='index' else '/'+slug
def ukurl(slug):return '/uk/' if slug=='index' else '/uk/'+slug+'.html'
def switch(slug,uk):
 return f'<nav class="language-switch" aria-label="{"Мова сайту" if uk else "Site language"}"><a href="{enurl(slug)}" lang="en" hreflang="en"{(" aria-current=\"page\"" if not uk else "")}>EN</a><a href="{ukurl(slug)}" lang="uk" hreflang="uk"{(" aria-current=\"page\"" if uk else "")}>УКР</a></nav>'
def tr(t):
 v=t.strip()
 if v in M:return t.replace(v,M[v])
 if re.fullmatch(r'Explore \d+ project images',v):return re.sub(r'Explore (\d+) project images',r'Переглянути зображення: \1',v)
 return t

def metadata(s,slug,uk):
 for n in s.select('link[hreflang], link[rel="canonical"]'):n.decompose()
 for lang,url in [('en',enurl(slug)),('uk',ukurl(slug)),('x-default',enurl(slug))]:
  n=s.new_tag('link',rel='alternate',hreflang=lang,href=DOMAIN+url);s.head.append(n)
 s.head.append(s.new_tag('link',rel='canonical',href=DOMAIN+(ukurl(slug) if uk else enurl(slug))))
 for n in s.select('meta[property="og:url"]'):n['content']=DOMAIN+(ukurl(slug) if uk else enurl(slug))
 for n in s.select('meta[property="og:locale"]'):n.decompose()
 s.head.append(s.new_tag('meta',attrs={'property':'og:locale','content':'uk_UA' if uk else 'en_US'}))
 s.head.append(s.new_tag('meta',attrs={'property':'og:locale:alternate','content':'en_US' if uk else 'uk_UA'}))
 if not s.select_one('link[href="/services-offer.css"]'):s.head.append(s.new_tag('link',rel='stylesheet',href='/services-offer.css'))
 for n in s.select('script[src^="/_vercel/"]'):n.decompose()
 # Normalize local references for nested locale routes.
 for n in s.find_all(True):
  for attr in ['src','href']:
   val=n.get(attr)
   if val and not val.startswith(('/', '#', 'https:', 'http:', 'mailto:', 'tel:', 'data:')):
    base=Path(slug).parent
    n[attr]='/'+(base/val.removeprefix('./')).as_posix()
 for n in s.select('.language-switch'):n.decompose()
 header=s.find('header')
 if not header:
  header=s.new_tag('header',attrs={'class':'service-header'});header.append(BeautifulSoup('<a class="brand" href="/">OLEH HEBEL &amp; Co</a>','html.parser'));s.body.insert(0,header)
 header.append(BeautifulSoup(switch(slug,uk),'html.parser'))
 # Demo forms cannot receive enquiries on GitHub Pages: use a real email handoff.
 for n in s.select('[data-open-form]'):
  n.name='a'; n['href']='mailto:theolehhebel@gmail.com?subject='+('Проєкт%20для%20Oleh%20Hebel' if uk else 'Project%20for%20Oleh%20Hebel')
  for a in ['type','data-open-form','data-source','data-sprint']:n.attrs.pop(a,None)
 if uk:
  s.html['lang']='uk'
  for n in s.find_all(['a','form']):
   if n.find_parent(class_='language-switch'):continue
   attr='href' if n.name=='a' else 'action';v=n.get(attr,'')
   if v.startswith(DOMAIN):v=v[len(DOMAIN):]
   if v.startswith('/') and not v.startswith('/uk/'):
    path,sep,frag=v.partition('#'); path=path.split('?')[0]
    key=path.strip('/').removesuffix('.html') or 'index'
    if key in SLUGS:n[attr]=ukurl(key)+(sep+frag if sep else '')
   elif v.startswith('#') and n.name=='a':pass
  for n in s.select('script[type="application/ld+json"]'):
   try:
    obj=json.loads(n.string or n.get_text())
    def walk(x):
     if isinstance(x,dict):
      for k,v in list(x.items()):
       if k=='inLanguage':x[k]='uk'
       elif isinstance(v,str):
        if k=='url' and v.startswith(DOMAIN):
         path,sep,frag=v[len(DOMAIN):].partition('#');key=path.strip('/').removesuffix('.html') or 'index'
         if key in SLUGS:x[k]=DOMAIN+ukurl(key)+(sep+frag if sep else '')
        elif v in M:x[k]=M[v]
       else:walk(v)
     elif isinstance(x,list):
      for v in x:walk(v)
    walk(obj);n.string=json.dumps(obj,ensure_ascii=False)
   except json.JSONDecodeError:pass
 return s

def template(slug,item,original):
 e=html.escape
 sections=''.join('<section class="service-section'+(' dark' if i%2==0 else '')+'"><div class="section-inner section-grid"><h2>'+e(part[0])+'</h2><div class="section-copy">'+''.join('<p>'+e(t)+'</p>' for t in part[1:])+'</div></div></section>' for i,part in enumerate(item['sections']))
 links=''.join(f'<a href="{e(url)}">{e(label)} ↗</a>' for url,label in item.get('links',[]))
 # Keep original source references available in each adapted Ukrainian article.
 sources=[]
 if item.get('article'):
  source_heading=next((h for h in original.find_all(['h2','h3']) if 'Sources' in h.get_text()),None)
  if source_heading:
   for sibling in source_heading.next_siblings:
    if getattr(sibling,'name',None) in ['h2','h3']:break
    if hasattr(sibling,'find_all'):
     for a in sibling.find_all('a',href=True):
      if a['href'].startswith('http'):sources.append(str(a))
  if sources:sections+='<section class="service-section"><div class="section-inner"><h2>Джерела та подальше читання</h2><ul>'+''.join('<li>'+a+'</li>' for a in sources)+'</ul></div></section>'
  original_link=enurl(slug)
  sections+='<section class="service-section"><div class="section-inner"><p>Українська редакція матеріалу. <a lang="en" href="'+original_link+'" data-keep-en>Повний англомовний оригінал ↗</a></p></div></section>'
 typ='Article' if item.get('article') else 'WebPage'
 schema={'@context':'https://schema.org','@type':typ,'headline':item['heading'],'name':item['title'],'description':item['lead'],'inLanguage':'uk','url':DOMAIN+ukurl(slug),'author':{'@type':'Person','name':'Oleh Hebel','url':DOMAIN+'/uk/'}}
 return BeautifulSoup(f'''<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(item['title'])} | Oleh Hebel</title><meta name="description" content="{e(item['lead'])}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="{'article' if item.get('article') else 'website'}"><meta property="og:title" content="{e(item['title'])}"><meta property="og:description" content="{e(item['lead'])}"><meta property="og:image" content="{DOMAIN}/og-image.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(item['title'])}"><meta name="twitter:description" content="{e(item['lead'])}"><meta name="twitter:image" content="{DOMAIN}/og-image.jpg"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="https://cdn.onlyfonts.ai/e-ukraine/font.css"><link rel="stylesheet" href="/service-page.css"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script></head><body><a class="skip-link" href="#content">Перейти до вмісту</a><header class="service-header"><a class="brand" href="/uk/">OLEH HEBEL &amp; Co</a><nav class="service-nav" aria-label="Головна навігація"><a href="/services">Послуги</a><a href="/work">Роботи</a><a href="/insights">Статті</a><a href="/tools">Інструменти</a></nav></header><main id="content"><section class="service-hero"><div class="hero-inner"><p class="eyebrow">{e(item['eyebrow'])}</p><h1>{e(item['heading'])}</h1><p class="hero-lead">{e(item['lead'])}</p>{'' if item.get('article') else '<a class="primary-cta" href="mailto:theolehhebel@gmail.com?subject=Проєкт%20для%20Oleh%20Hebel">Втілимо твій задум ↗</a>'}</div></section>{sections}<section class="service-section"><div class="section-inner"><h2>Наступний крок</h2><div class="related-links">{links}<a href="mailto:theolehhebel@gmail.com?subject=Проєкт%20для%20Oleh%20Hebel">Обговорити проєкт ↗</a></div></div></section></main><footer class="service-footer"><div class="footer-inner"><p>© 2026 OLEH HEBEL &amp; CO.</p><a href="/services">Послуги</a><a href="/oleh-hebel">Про мене</a></div></footer></body></html>''','html.parser')

missing=[]
for slug,p in SLUGS.items():
 source=BeautifulSoup(p.read_text(),'html.parser')
 # Write enhanced English source first; UI stays intact.
 en=metadata(source,slug,False);p.write_text(str(en))
 if slug in DATA:uk=template(slug,DATA[slug],source)
 else:
  uk=BeautifulSoup(str(source),'html.parser')
  for node in uk.find_all(string=True):
   if isinstance(node,Comment) or node.parent.name in ['script','style']:continue
   node.replace_with(tr(str(node)))
  # Translate UI strings inside inline scripts without altering JS identifiers.
  for script in uk.find_all('script'):
   if script.get('type')=='application/ld+json' or not script.string:continue
   js=str(script.string)
   for a,b in sorted(M.items(),key=lambda x:-len(x[0])):
    for quote in ["'",'"']:
     js=js.replace(quote+a+quote,quote+b.replace('\\','\\\\').replace(quote,'\\'+quote)+quote)
   js=js.replace("n+' recurrence points'","n+' балів повторюваності'")
   js=js.replace('AI Product Readiness Score:','Оцінка готовності AI-продукту:').replace('Missing:','Не виконано:')
   # Localize runtime service paths inside scorecard code.
   js=re.sub(r"(['\"])(/[^'\"]+)\1",lambda m:m[1]+(ukurl(m[2].strip('/')) if m[2].strip('/') in SLUGS else m[2])+m[1],js)
   script.string=js
  for n in uk.find_all(True):
   for attr in ['aria-label','title','placeholder','data-label']:
    if attr in n.attrs:n[attr]=tr(n[attr])
  # Descriptive Ukrainian alternatives for portfolio gallery imagery.
  for n in uk.find_all('img'):
   if n.get('alt'):n['alt']='Дизайн '+('портфоліо Олега Гебеля' if slug=='work' else (uk.h1.get_text(' ',strip=True) if uk.h1 else 'проєкту'))
  # Exact metadata for preserved layouts.
  titles={'index':'Продуктовий дизайн, UX/UI та айдентика | Олег Гебель','work':'Продуктовий дизайн і брендинг — роботи | Олег Гебель','ai-product-readiness-scorecard':'Самооцінка готовності AI-продукту | Олег Гебель','tools/design-debt-calculator':'Калькулятор дизайн-боргу | Олег Гебель','tools/ai-agent-autonomy-matrix':'Матриця автономності AI-агента | Олег Гебель','tools/ai-ux-trust-checklist':'Чекліст довіри до AI | Олег Гебель','tools/design-system-drift-checklist':'Перевірка розбіжностей дизайн-системи | Олег Гебель'}
  title=titles.get(slug,(uk.h1.get_text(' ',strip=True)+' — дизайн-проєкт | Олег Гебель') if uk.h1 else 'Дизайн | Олег Гебель')
  if uk.title:uk.title.string=title
  bodyparas=[x.get_text(' ',strip=True) for x in uk.select('main p') if len(x.get_text())>70]
  desc=bodyparas[0] if bodyparas else 'Продуктовий дизайн, UX/UI, айдентика та AI-досвід. Роботи й послуги Олега Гебеля.'
  if slug=='index':desc='Продуктовий дизайн, UX/UI, айдентика та вебсайти від Олега Гебеля. Від стратегії та ключових сценаріїв до цілісної візуальної системи й запуску.'
  for n in uk.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):n['content']=desc
  for n in uk.select('meta[property="og:title"],meta[name="twitter:title"]'):n['content']=title
  # Home brand preview changes dynamically; translate inserted text as well.
  if slug in ['index','work']:
   runtime=uk.new_tag('script',src='/i18n/uk-runtime.js',defer='');uk.body.append(runtime)
  for node in uk.body.find_all(string=True):
   v=str(node).strip()
   if node.parent.name in ['script','style'] or not re.search(r'[a-zA-Z]{3}',v) or re.search(r'[а-яА-ЯіІїЇєЄґҐ]',v):continue
   if v in ['OLEH HEBEL & Co','OLEH HEBEL & CO','SHIP INDEX GROW','INTERFACE REPORT','BRAYN','NEOVERSITY','Neoversity','LinkedIn','PDF · PNG · JPG · ZIP','Oleh Hebel & Co','Trä','Yads','Maison','Muse','Smart','project','Autumn','Hills','Fuel','Up','Mentor','ium','RIDNE','Thrive Well','BRAYN ↗','Neoversity ↗','Dashboarder','ERP. Smartproject','Mentorium / Lingidoo','FuelUp','EN','УКР'] or v.startswith('©'):continue
   missing.append((slug,v))
 uk=metadata(uk,slug,True)
 robot=source.find('meta',attrs={'name':'robots'})
 if robot and 'noindex' in robot.get('content',''):
  for n in uk.select('meta[name=robots]'):n['content']=robot['content']
 for n in uk.select('[data-keep-en]'):n['href']=enurl(slug)
 dest=ROOT/'uk'/p.relative_to(ROOT);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(str(uk))
# Dynamic brand previews use the same translation catalogue and localized local links.
(ROOT/'i18n/uk-runtime.js').write_text('''(()=>{const map='''+json.dumps(M,ensure_ascii=False)+''';function translate(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(['SCRIPT','STYLE'].includes(n.parentElement?.tagName))continue;const t=n.textContent.trim();if(map[t])n.textContent=n.textContent.replace(t,map[t]);}}translate(document.body);new MutationObserver(()=>translate(document.body)).observe(document.body,{childList:true,subtree:true});})();''')
# Include reciprocal language alternates in the sitemap.
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9');ET.register_namespace('xhtml','http://www.w3.org/1999/xhtml')
ns='http://www.sitemaps.org/schemas/sitemap/0.9';xh='http://www.w3.org/1999/xhtml';root=ET.Element('{'+ns+'}urlset')
for slug in SLUGS:
 original=BeautifulSoup(SLUGS[slug].read_text(),'html.parser');robot=original.find('meta',attrs={'name':'robots'})
 if robot and 'noindex' in robot.get('content',''):continue
 for locale in ['en','uk']:
  node=ET.SubElement(root,'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=DOMAIN+(enurl(slug) if locale=='en' else ukurl(slug))
  for lang,href in [('en',enurl(slug)),('uk',ukurl(slug)),('x-default',enurl(slug))]:ET.SubElement(node,'{'+xh+'}link',rel='alternate',hreflang=lang,href=DOMAIN+href)
ET.ElementTree(root).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
print('Built',len(SLUGS),'Ukrainian pages; untranslated text candidates:',len(missing))
for row in missing:print(*row,sep=': ')
