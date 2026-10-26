from pathlib import Path
from bs4 import BeautifulSoup
import json,subprocess,tempfile,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1];count=0;js=0
for p in R.rglob('*.html'):
 if any(x in p.relative_to(R).parts for x in ['.git','partials']) or p.name.startswith('google'):continue
 s=BeautifulSoup(p.read_text(),'html.parser')
 if not s.body:continue
 assert len(s.select('h1'))==1,(p,'heading count')
 assert len(s.select('.language-switch'))==1,(p,'switch')
 assert len(s.select('link[rel=canonical]'))==1,(p,'canonical')
 assert {x['hreflang'] for x in s.select('link[hreflang]')}=={'en','uk','x-default'},p
 sw=s.select_one('.language-switch');assert not sw.select_one('[lang=en]')['href'].startswith('/uk/'),p
 assert sw.select_one('[lang=uk]')['href'].startswith('/uk/'),p
 assert len(sw.select('[aria-current=page]'))==1,p
 if 'uk' in p.relative_to(R).parts:assert s.html['lang']=='uk',p
 for n in s.select('a[href],link[href],script[src],img[src]'):
  a='src' if n.name in ['script','img'] else 'href';v=n[a].split('?')[0].split('#')[0]
  if not v.startswith('/') or v.startswith('//'):continue
  t=R/v.lstrip('/');assert any(x.is_file() for x in [t,t.with_suffix('.html'),t/'index.html']),(p,v)
 for n in s.select('script'):
  if not n.string:continue
  if n.get('type')=='application/ld+json':json.loads(n.string);continue
  with tempfile.NamedTemporaryFile(mode='w',suffix='.js') as f:
   f.write(n.string);f.flush();z=subprocess.run(['node','--check',f.name],capture_output=True,text=True);assert z.returncode==0,(p,z.stderr);js+=1
 count+=1
root=ET.parse(R/'sitemap.xml').getroot();assert len(root)==92,len(root)
print(f'Validated {count} pages, {js} inline scripts, 92 sitemap URLs, reciprocal switches, schema and local references.')
# Execute localized tools with a minimal DOM to check calculations and all result bands.
for rel in ['tools/design-debt-calculator','tools/ai-agent-autonomy-matrix','tools/ai-ux-trust-checklist','tools/design-system-drift-checklist','ai-product-readiness-scorecard']:
 p=R/'uk'/(rel+'.html');s=BeautifulSoup(p.read_text(),'html.parser');script='\n'.join(n.string or '' for n in s.select('script:not([type])') if not n.get('src'))
 nodes={n['id']:{'value':n.get('value','0'),'textContent':'','style':{},'dataset':{'label':n.get('data-label','')}} for n in s.select('[id]')}
 checks=[{'checked':False,'dataset':{'label':n.get('data-label','')}} for n in s.select('input[type=checkbox]')]
 program='''const vm=require('node:vm');const nodes=DATA;const checks=CHECKS;const events=[];for(const n of [...Object.values(nodes),...checks])n.addEventListener=(e,f)=>events.push(f);const sandbox={document:{getElementById:id=>nodes[id],querySelectorAll:()=>checks},navigator:{clipboard:{writeText:async()=>{}}},setTimeout:()=>{}};Object.assign(sandbox,nodes);vm.createContext(sandbox);vm.runInContext(CODE,sandbox);const first=JSON.stringify(nodes);for(const n of checks)n.checked=true;for(const id of ['impact','reverse','confidence','expectation'])if(nodes[id])nodes[id].value='2';for(const id of ['screens','dup','states','teams'])if(nodes[id])nodes[id].value='100';for(const cb of events)cb();const last=JSON.stringify(nodes);if(first===last)throw Error('Tool did not update');if(last.includes('Level 4')||last.includes('System-level debt')||last.includes('strong interaction trust'))throw Error('Untranslated result');if(nodes.scoreNumber&&!nodes.scoreNumber.innerHTML.startsWith('100'))throw Error('Scorecard max not 100');console.log('PASS REL');'''.replace('DATA',json.dumps(nodes,ensure_ascii=False)).replace('CHECKS',json.dumps(checks,ensure_ascii=False)).replace('CODE',json.dumps(script,ensure_ascii=False)).replace('REL',rel)
 z=subprocess.run(['node','-e',program],capture_output=True,text=True);assert z.returncode==0,(rel,z.stderr);print(z.stdout.strip())
