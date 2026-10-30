"""Check search metadata, language pairs and sitemap eligibility."""
from pathlib import Path
from bs4 import BeautifulSoup
from collections import Counter
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];DOMAIN='https://olehhebel.top';pages={}
for p in ROOT.rglob('*.html'):
 if any(x in p.relative_to(ROOT).parts for x in ['.git','partials']) or p.name.startswith('google'):continue
 s=BeautifulSoup(p.read_text(),'html.parser')
 if not s.body:continue
 assert s.title and s.title.get_text().strip(),p
 for field in ['description','robots']:
  assert len(s.select(f'meta[name="{field}"]'))==1,(p,field)
 counts=Counter(n.get('name') or n.get('property') for n in s.head.select('meta[name],meta[property]'))
 assert all(v==1 for k,v in counts.items() if k!='og:locale:alternate'),(p,counts)
 canonical=s.select_one('link[rel=canonical]')['href'];assert s.select_one('meta[property="og:url"]')['content']==canonical,p
 assert canonical not in pages,canonical
 pages[canonical]=(p,s)
for url,(p,s) in pages.items():
 for a in s.select('link[rel=alternate][hreflang]'):
  target=a['href'];assert target in pages,(p,target)
  other=pages[target][1]
  assert other.select_one(f'link[rel=alternate][href="{url}"]'),(p,target,'not reciprocal')
for entry in ET.parse(ROOT/'sitemap.xml').getroot():
 url=entry.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text
 assert url in pages,url
 assert 'noindex' not in pages[url][1].select_one('meta[name=robots]')['content'],url
print(f'PASS: {len(pages)} pages; unique metadata, localized canonicals, reciprocal hreflang and sitemap eligibility.')
