"""Normalize bilingual search metadata and keep the service proposition explicit.
Run after build-locales.py. Idempotent; does not generate performance claims.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re
ROOT=Path(__file__).resolve().parents[1]
DOMAIN='https://olehhebel.top'
COPY={
'index': ('Product Designer, UX/UI & Web Design | Oleh Hebel','Product design, UX/UI, websites and design systems by Oleh Hebel. Improve your SaaS, AI product or MVP with clear user flows and a focused design sprint.'),
'uk/index': ('Продуктовий дизайнер, UX/UI та вебдизайн | Олег Гебель','Продуктовий дизайн, UX/UI, вебсайти та дизайн-системи від Олега Гебеля. Покращення SaaS, AI-продуктів і MVP: від ключових сценаріїв до запуску.'),
'services': ('Product Design, UX/UI, Websites & SEO | Oleh Hebel','Product design, UX/UI audits, website design and technical SEO foundations. Work directly with Oleh Hebel on your MVP, SaaS, brand or AI interface.'),
'uk/services': ('Продуктовий дизайн, UX/UI, сайти та SEO | Олег Гебель','Послуги Олега Гебеля: продуктовий дизайн, UX/UI-аудит, вебдизайн, дизайн-системи та технічні основи SEO. Узгоджений обсяг і прямий зв’язок із дизайнером.'),
'work': ('Product Design & UX/UI Portfolio | Oleh Hebel','Explore product design, UX/UI and brand identity work by Oleh Hebel. Case studies distinguish live products from concepts and explain the design decisions.'),
'uk/work': ('Портфоліо продуктового дизайну та UX/UI | Олег Гебель','Продуктовий дизайн, UX/UI та айдентика Олега Гебеля. Реалізовані продукти й концепції з поясненням задач, дизайнерських рішень та обсягу роботи.')}
SERVICE_SECTIONS={
'en': [
('Website design and technical SEO','I structure service websites around what visitors need to understand, compare and do next. The work can include responsive layouts, semantic HTML, page titles, descriptions, internal links, canonical URLs, language alternates and a sitemap.','SEO scope and implementation are agreed before the project starts. Search visibility depends on content, competition and indexing; rankings and traffic are not guaranteed.'),
('What you receive','Depending on the agreed scope: an audit with priorities, user flows, a responsive prototype, interface states, reusable components and implementation notes. We define the deliverables, milestones and acceptance criteria before work begins.'),
('How we start','Send a live product, Figma file or short brief. I review the main user task, identify the constraints and propose a focused scope. The estimate follows that scope, rather than a generic package.'),
('Want to learn to build and improve your own website?','Ship Index Grow is a separate practical education project about building AI-assisted websites, publishing content and understanding SEO foundations. Explore the school if you want to learn; contact Oleh Hebel & Co if you need design work delivered.')],
'uk': [
('Вебдизайн і технічні основи SEO','Будую структуру сайту навколо того, що відвідувачу потрібно зрозуміти, порівняти та зробити. До узгодженого обсягу можуть входити адаптивні макети, семантичний HTML, заголовки й описи сторінок, внутрішні посилання, canonical, мовні альтернативи та sitemap.','Обсяг SEO й реалізації погоджуємо до старту. Видимість у пошуку залежить від контенту, конкуренції та індексації; позиції й трафік не гарантую.'),
('Що ти отримаєш','Залежно від узгодженого обсягу: аудит із пріоритетами, користувацькі сценарії, адаптивний прототип, стани інтерфейсу, повторно використовувані компоненти та пояснення для розробки. Результати, етапи й критерії приймання визначаємо до початку.'),
('Як почати співпрацю','Надішли працюючий продукт, Figma або короткий опис задачі. Я розберу основний сценарій користувача, уточню обмеження й запропоную конкретний обсяг. Оцінку вартості готую під нього.'),
('Хочеш навчитися створювати й покращувати сайт самостійно?','Ship Index Grow — окремий практичний освітній проєкт про створення сайтів за допомогою AI, публікацію контенту та основи SEO. Для навчання переходь до школи, а для виконання дизайнерської роботи звертайся до Oleh Hebel & Co.')]
}
count=0
for p in sorted(ROOT.rglob('*.html')):
 rel=p.relative_to(ROOT)
 if any(x in rel.parts for x in ['.git','partials']) or p.name.startswith('google'):continue
 raw=p.read_text();normalized=re.sub(r'^\s*html\s*(?=<html)', '<!DOCTYPE html>\n', raw);s=BeautifulSoup(normalized,'html.parser')
 if not s.body or not s.head:continue
 uk=rel.parts[0]=='uk';lang='uk' if uk else 'en';key=rel.with_suffix('').as_posix()
 # One value per singleton metadata field. Preserve different alternate locales.
 seen=set()
 for n in s.head.select('meta[name],meta[property]'):
  field=n.get('name') or n.get('property');ident=(field,n.get('content')) if field=='og:locale:alternate' else field
  if ident in seen:n.decompose()
  else:seen.add(ident)
 def meta(field,value,attr='name'):
  n=s.head.find('meta',attrs={attr:field})
  if not n:n=s.new_tag('meta',attrs={attr:field});s.head.append(n)
  n['content']=value
 if not s.select_one('meta[name=robots]'):meta('robots','index,follow,max-image-preview:large')
 if key in COPY:
  title,desc=COPY[key];s.title.string=title
  meta('description',desc)
  for field,attr,value in [('og:title','property',title),('og:description','property',desc),('twitter:title','name',title),('twitter:description','name',desc)]:meta(field,value,attr)
 else:title=s.title.get_text();desc=s.find('meta',attrs={'name':'description'}).get('content','') if s.find('meta',attrs={'name':'description'}) else ''
 canonical=s.select_one('link[rel=canonical]')
 if canonical:meta('og:url',canonical['href'],'property')
 meta('og:locale','uk_UA' if uk else 'en_US','property')
 for n in s.select('meta[property="og:locale:alternate"]'):
  if n.get('content')==('uk_UA' if uk else 'en_US'):n.decompose()
 if uk:
  for n in s.select('[aria-label]'):
   n['aria-label']=re.sub(r'^View (.+) case study$',r'Переглянути кейс \1',n['aria-label'])
 # Fix inconsistent social image left by the locale generator.
 for n in s.select('meta[property="og:image"],meta[name="twitter:image"]'):
  n['content']=DOMAIN+'/og-image.jpg'
 if key in ['index','uk/index']:
  h=s.h1;eye=h.select_one('.eyebrow')
  if eye:eye.name='p';h.insert_before(eye.extract())
  h.select_one('.hero-title').clear();h.select_one('.hero-title').append(BeautifulSoup('Продуктовий дизайн.<br/>Який обирають.' if uk else 'Product design.<br/>Worth choosing.','html.parser'))
  lead=s.select_one('.offer-banner__lead');lead.string=('Проєктую зрозумілі SaaS та AI-продукти, адаптивні сайти й цілісні дизайн-системи. Поєдную продуктову стратегію, UX/UI та айдентику — від першого сценарію до деталей запуску.' if uk else 'I design clear SaaS and AI products, responsive websites and coherent design systems. Product strategy, UX/UI and brand identity connect the first user flow to the details of launch.')
  for selector,text in [('.offer-banner__services div:nth-child(1) h3','Продуктовий дизайн та UX/UI' if uk else 'Product design & UX/UI'),('.offer-banner__services div:nth-child(2) h3','Айдентика та дизайн-системи' if uk else 'Brand identity & design systems'),('.offer-banner__services div:nth-child(3) h3','Вебдизайн і запуск сайтів' if uk else 'Website design & launch')]:
   n=s.select_one(selector)
   if n:n.string=text
  for a in s.select('script[src]'):
   if a['src'].split('?')[0] in ['/script.js','/polish.js']:a['src']=a['src'].split('?')[0]+'?v=seo-20261030'
 if key in ['services','uk/services']:
  s.h1.string='Продуктовий дизайн, UX/UI та вебсайти' if uk else 'Product design, UX/UI & websites'
  lead=s.select_one('.hero-lead');lead.string=('Для SaaS, AI-продуктів і бізнесу: від UX-аудиту та прототипу до адаптивного сайту, айдентики й дизайн-системи. Працюєш напряму з Олегом Гебелем.' if uk else 'For SaaS, AI products and businesses: from UX audits and prototypes to responsive websites, brand identity and design systems. Work directly with Oleh Hebel.')
  for n in s.select('[data-seo-service]'):n.decompose()
  for i,part in enumerate(SERVICE_SECTIONS[lang]):
   section=s.new_tag('section',attrs={'class':'service-section'+(' dark' if i%2==0 else ''),'data-seo-service':''})
   inner=s.new_tag('div',attrs={'class':'section-inner section-grid'});section.append(inner)
   h=s.new_tag('h2');h.string=part[0];inner.append(h);copy=s.new_tag('div',attrs={'class':'section-copy'});inner.append(copy)
   for text in part[1:]:n=s.new_tag('p');n.string=text;copy.append(n)
   if i==3:
    a=s.new_tag('a',href='https://shipindexgrow.top/');a.string='Переглянути Ship Index Grow ↗' if uk else 'Explore Ship Index Grow ↗';copy.append(a)
   s.main.append(section)
 # Align page-level structured data with the visible locale and search snippet.
 for n in s.select('script[type="application/ld+json"]'):
  obj=json.loads(n.string or n.get_text())
  def walk(x):
   if isinstance(x,dict):
    typ=x.get('@type');types=typ if isinstance(typ,list) else [typ]
    if any(t in ['WebPage','CollectionPage','AboutPage'] for t in types):
     x['name']=title;x['description']=desc;x['inLanguage']=lang
     if canonical:x['url']=canonical['href']
    if 'WebSite' in types:x['inLanguage']=['en','uk']
    for v in x.values():walk(v)
   elif isinstance(x,list):
    for v in x:walk(v)
  walk(obj);n.string=json.dumps(obj,ensure_ascii=False)
 out=str(s)
 if out!=raw:p.write_text(out);count+=1
print('Updated',count,'pages')
