// 무우수 서비스 워커: 한 번 열면 녹음까지 모두 저장해 인터넷 없이도 열림
// 앱을 고친 뒤 다시 올릴 때는 아래 VERSION 숫자를 하나 올려 주세요.
const VERSION='muusu-v13';
const SHELL=["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
const AUDIO=["bodyscan-01.mp3", "bodyscan-02.mp3", "bodyscan-03.mp3", "bodyscan-04.mp3", "bodyscan-05.mp3", "bodyscan-06.mp3", "bodyscan-07.mp3", "bodyscan-08.mp3", "bodyscan-09.mp3", "bodyscan-10.mp3", "bodyscan-11.mp3", "bodyscan-12.mp3", "bodyscan-13.mp3", "bodyscan-14.mp3", "brush-01.mp3", "brush-02.mp3", "brush-03.mp3", "brush-04.mp3", "brush-05.mp3", "brush-06.mp3", "brush-07.mp3", "brush-08.mp3", "eat-01.mp3", "eat-02.mp3", "eat-03.mp3", "eat-04.mp3", "eat-05.mp3", "eat-06.mp3", "eat-07.mp3", "eat-08.mp3", "eat-09.mp3", "eat-10.mp3", "feelings-01.mp3", "feelings-02.mp3", "feelings-03.mp3", "feelings-04.mp3", "feelings-05.mp3", "feelings-06.mp3", "feelings-07.mp3", "feelings-08.mp3", "joy-01.mp3", "joy-02.mp3", "joy-03.mp3", "joy-04.mp3", "joy-05.mp3", "listen-01.mp3", "listen-02.mp3", "listen-03.mp3", "listen-04.mp3", "listen-05.mp3", "listen-06.mp3", "listen-07.mp3", "metta-01.mp3", "metta-02.mp3", "metta-03.mp3", "metta-04.mp3", "metta-05.mp3", "metta-06.mp3", "metta-07.mp3", "metta-08.mp3", "metta-09.mp3", "metta-10.mp3", "peace-01.mp3", "peace-02.mp3", "peace-03.mp3", "peace-04.mp3", "peace-05.mp3", "shoes-01.mp3", "shoes-02.mp3", "shoes-03.mp3", "shoes-04.mp3", "shoes-05.mp3", "shoes-06.mp3", "still-01.mp3", "still-02.mp3", "still-03.mp3", "still-04.mp3", "still-05.mp3", "still-06.mp3", "still-07.mp3", "still-08.mp3", "still-09.mp3", "thoughts-01.mp3", "thoughts-02.mp3", "thoughts-03.mp3", "thoughts-04.mp3", "thoughts-05.mp3", "thoughts-06.mp3", "thoughts-07.mp3", "thoughts-08.mp3", "walk-01.mp3", "walk-02.mp3", "walk-03.mp3", "walk-04.mp3", "walk-05.mp3", "walk-06.mp3", "walk-07.mp3", "walk-08.mp3", "walk-09.mp3"].map(f=>'audio/'+f);
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL).then(()=>Promise.all(AUDIO.map(u=>c.add(u).catch(()=>{}))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  // 글꼴(구글 폰트)은 받아 온 것을 저장해 두고 다음부터 씀
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(VERSION+'-fonts').then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{c.put(req,r.clone());return r;}))));
    return;
  }
  if(url.origin!==location.origin) return;
  // 경전 녹음(긴 파일)은 저장하지 않고 그때그때 받음 (구간 재생 요청을 그대로 보내야 아이폰에서도 재생됨)
  if(url.pathname.includes('/audio/geumgang-')||url.pathname.includes('/audio/banya-')||req.headers.has('range')) return;
  // 페이지는 새 버전을 먼저 시도하고, 안 되면 저장본
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{caches.open(VERSION).then(c=>c.put('index.html',r.clone()));return r;}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{ if(r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp));} return r; })));
});
