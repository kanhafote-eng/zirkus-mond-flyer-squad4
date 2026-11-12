// Zirkus Mond · Flyer Squad — offline cache. Bump V on every release so phones refresh.
const V='zm-v2.0.2',TILES='zm-tiles';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function trim(){const c=await caches.open(TILES),ks=await c.keys();if(ks.length>400)await Promise.all(ks.slice(0,ks.length-400).map(k=>c.delete(k)))}
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||/script\.google(usercontent)?\.com$|nominatim|drive\.google|lh3\.google/.test(u.host))return; // API and photos: always network
  if(/(^|\.)tile\./.test(u.host)){e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(r);if(hit)return hit;const x=await fetch(r);if(x.ok||x.type==='opaque'){c.put(r,x.clone());trim()}return x}));return}
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const k=x.clone();caches.open(V).then(c=>c.put('./index.html',k));return x}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(x=>{if(x.ok||x.type==='opaque'){const k=x.clone();caches.open(V).then(c=>c.put(r,k))}return x})));
});
