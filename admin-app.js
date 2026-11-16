/* MailForge Portfolio CMS — static-first, Git-backed, Cloudflare Pages friendly.
   No API secret or GitHub token is stored in source code or localStorage. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const DB_NAME = 'mailforge-portfolio-content';
const STORE_NAME = 'media';
const TEXT_KEY = 'mailforgePortfolioTextOverrides';
const CUSTOM_KEY = 'mailforgePortfolioCustomGallery';
const REMOVED_MEDIA_KEY = 'mailforgePortfolioRemovedImages';
const GH_SETTINGS_KEY = 'mailforgePortfolioGitHubSettings';
const ACTIVITY_KEY = 'mailforgePortfolioActivity';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const MEDIA = [
  ['brandLogo','شعار MailForge الرسمي','assets/mailforge-logo.png','الشريط العلوي والتذييل وأيقونة الموقع'],
  ['dashboardOverview','لوحة التحكم الرئيسية','assets/dashboard-overview.png','معرض المنتج — نظرة عامة'],
  ['dashboardOnboarding','لوحة التحكم وخطوات التفعيل','assets/dashboard-onboarding.png','القسم الافتتاحي — بدء أول حملة'],
  ['dashboardActivity','نشاط لوحة التحكم','assets/dashboard-activity.png','معرض المنتج — النشاط السريع'],
  ['templatesGallery','معرض القوالب','assets/templates-gallery.png','قسم القوالب — مكتبة التصاميم'],
  ['templatesWorkspace','مساحة إدارة القوالب','assets/templates-library.png','قسم القوالب — مساحة العمل ومصمم الذكاء'],
  ['analyticsOverview','التحليلات العامة','assets/analytics-overview.png','معرض التحليلات — النظرة العامة'],
  ['analyticsDetailed','تفاصيل التحليلات والأداء','assets/analytics-detailed.png','معرض التحليلات — التفاصيل'],
  ['campaignResults','نتائج الحملة','assets/campaign-results.png','قسم نتائج الحملات'],
  ['campaignCreation','إنشاء حملة جديدة','assets/campaign-creation.png','قسم إدارة الحملات — نموذج الإنشاء'],
  ['automationWorkflow','الأتمتة والسلاسل البريدية','assets/automation-workflow.png','قسم Automation — السلاسل واختبارات العناوين'],
  ['contactsManagement','جهات الاتصال وإدارة الجمهور','assets/contacts-management.png','قسم Audience — جهات الاتصال والمجموعات'],
  ['analyticsSummary','ملخص التحليلات','assets/analytics-summary.png','قسم Analytics — المؤشرات التنفيذية'],
  ['analyticsDelivery','نشاط الإرسال وحالات التسليم','assets/analytics-delivery.png','قسم Analytics — النشاط والنطاقات والتسليم'],
  ['analyticsBestTime','أفضل وقت للإرسال','assets/analytics-best-time.png','قسم Analytics — التوقيت والروابط'],
  ['mediaLibrary','مكتبة الوسائط والملفات','assets/media-library.png','قسم Media Library — الملفات والصور']
].map(([key,label,src,placement])=>({key,label,src,placement}));

let published = {format:'mailforge-portfolio-content',version:2,content:{},images:{},customGallery:[]};
let textDefaults = {};
let textLabels = {};
let localContent = {};
let customGallery = [];
let removedImageSlots = new Set();
let objectUrls = new Map();
let imageDraftCount = 0;
let isPublishing = false;

function toast(message, type='ok') {
  const el = $('#toast');
  el.textContent = message;
  el.style.borderRight = type === 'error' ? '4px solid #ef4444' : '4px solid #10b981';
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(()=>el.classList.remove('show'), 4200);
}
function showPublishStatus(message, type='ok') {
  const el = $('#publishStatus');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', type === 'error');
}
function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || ''); } catch (_) { return fallback; }
}
function bytesLabel(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function openDB() {
  return new Promise((resolve,reject)=>{
    const request = indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{ const db=request.result; if(!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME); };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error || new Error('تعذر فتح مخزن الصور المحلي'));
  });
}
async function dbGet(key) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readonly');
    const req=tx.objectStore(STORE_NAME).get(key);
    req.onsuccess=()=>resolve(req.result || null);
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
async function dbPut(key,value) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).put(value,key);
    tx.oncomplete=()=>{db.close();resolve(true);};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
async function dbDelete(key) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete=()=>{db.close();resolve(true);};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
async function dbClear() {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete=()=>{db.close();resolve(true);};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}
function revokeUrl(key) {
  if (objectUrls.has(key)) { URL.revokeObjectURL(objectUrls.get(key)); objectUrls.delete(key); }
}
async function imageUrlFor(key, fallback) {
  const blob=await dbGet(key);
  if (!blob) return fallback;
  revokeUrl(key);
  const url=URL.createObjectURL(blob);
  objectUrls.set(key,url);
  return url;
}
async function optimizeImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('اختر ملف صورة صالحًا.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('حجم الصورة أكبر من 8MB. اختر صورة أصغر.');
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1900;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d', {alpha:true});
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close?.();
  const blob = await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('تعذر ضغط الصورة')),'image/webp',0.92));
  return blob;
}
function blobToDataUrl(blob) {
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error || new Error('تعذر قراءة الصورة'));
    reader.readAsDataURL(blob);
  });
}
function dataUrlToBlob(dataUrl) {
  const [head,body]=dataUrl.split(',');
  const mime=head.match(/data:(.*?);base64/)?.[1] || 'image/webp';
  const raw=atob(body);
  const arr=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
  return new Blob([arr],{type:mime});
}
function safeId(input) { return String(input).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64); }
function logActivity(message) {
  const rows=readJSON(ACTIVITY_KEY,[]);
  rows.unshift({message,at:new Date().toISOString()});
  localStorage.setItem(ACTIVITY_KEY,JSON.stringify(rows.slice(0,12)));
  renderActivity();
}
function renderActivity() {
  const rows=readJSON(ACTIVITY_KEY,[]);
  const root=$('#activityLog');
  if(!rows.length){root.innerHTML='<p>لا يوجد نشاط مسجل حتى الآن.</p>';return;}
  root.replaceChildren();
  rows.slice(0,8).forEach(item=>{
    const row=document.createElement('div');row.className='activity-item';
    const span=document.createElement('span');span.textContent=item.message;
    const time=document.createElement('time');time.textContent=new Date(item.at).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'});
    row.append(span,time);root.append(row);
  });
}

async function loadSources() {
  try {
    const [pageRes,contentRes]=await Promise.all([fetch('index.html',{cache:'no-store'}),fetch('portfolio-content.json',{cache:'no-store'})]);
    if(pageRes.ok){
      const html=await pageRes.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      doc.querySelectorAll('[data-editable]').forEach(node=>{
        const key=node.dataset.editable;
        if(key && !(key in textDefaults)){textDefaults[key]=node.textContent.trim();textLabels[key]=node.dataset.editLabel || key;}
      });
    }
    if(contentRes.ok){
      const json=await contentRes.json();
      if(json && json.format==='mailforge-portfolio-content') published={...published,...json};
    }
  } catch(error) {
    console.warn('Static project files could not be loaded:',error);
  }
  localContent={...(published.content||{}),...readJSON(TEXT_KEY,{})};
  const localCustom=readJSON(CUSTOM_KEY,null);
  customGallery=Array.isArray(localCustom)?localCustom:(Array.isArray(published.customGallery)?published.customGallery:[]);
  removedImageSlots=new Set(readJSON(REMOVED_MEDIA_KEY,[]).filter(key=>MEDIA.some(item=>item.key===key)));
}

function navTo(view) {
  $$('.nav-item').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));
  $$('.view-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`view-${view}`));
  const labels={overview:'نظرة عامة',content:'محتوى الموقع',media:'الصور والمعرض',publish:'النشر والتخزين',backup:'النسخ الاحتياطي'};
  $('#pageTitle').textContent=labels[view]||'لوحة الإدارة';
  $('#sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>navTo(btn.dataset.view)));
$$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>navTo(btn.dataset.go)));
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));

function buildTextFields() {
  const root=$('#contentFields');root.replaceChildren();
  const entries=Object.entries(textDefaults);
  $('#contentCount').textContent=`${entries.length} حقل قابل للتعديل`;
  entries.forEach(([key,defaultValue])=>{
    const card=document.createElement('article');card.className='field-card';card.dataset.search=`${textLabels[key]} ${key}`.toLowerCase();
    const label=document.createElement('label');label.textContent=textLabels[key];
    const area=document.createElement('textarea');area.dataset.contentKey=key;area.value=localContent[key] ?? defaultValue;area.rows=Math.min(5,Math.max(2,Math.ceil(area.value.length/72)));
    const meta=document.createElement('div');meta.className='field-meta';
    const keyLabel=document.createElement('span');keyLabel.textContent=key;
    const len=document.createElement('span');len.textContent=`${area.value.length} حرف`;
    area.addEventListener('input',()=>{localContent[key]=area.value;len.textContent=`${area.value.length} حرف`;$('#statText').textContent=Object.keys(localContent).filter(k=>localContent[k]!==textDefaults[k]).length;});
    meta.append(keyLabel,len);card.append(label,area,meta);root.append(card);
  });
}
$('#contentSearch').addEventListener('input',event=>{
  const q=event.target.value.trim().toLowerCase();
  $$('.field-card').forEach(card=>card.hidden=!!q && !card.dataset.search.includes(q));
});
function getTextValues(){
  const result={};
  $$('[data-content-key]').forEach(el=>{result[el.dataset.contentKey]=el.value.trim();});
  return result;
}
function saveDraft() {
  localContent=getTextValues();
  localStorage.setItem(TEXT_KEY,JSON.stringify(localContent));
  localStorage.setItem(CUSTOM_KEY,JSON.stringify(customGallery));
  logActivity('تم حفظ مسودة المحتوى محليًا');
  updateOverview();
  toast('تم حفظ المسودة في هذا المتصفح. انشر التغييرات ليشاهدها باقي الزوار.');
}
$('#saveTextDraft').addEventListener('click',saveDraft);

async function renderMediaCards() {
  const root=$('#mediaSlots');root.replaceChildren();
  for(const slot of MEDIA){
    const card=document.createElement('article');card.className='media-card';
    const preview=document.createElement('img');preview.alt=slot.label;preview.loading='lazy';
    const fallback=removedImageSlots.has(slot.key)?slot.src:(published.images?.[slot.key] || slot.src);
    preview.src=await imageUrlFor(slot.key,fallback);
    const body=document.createElement('div');body.className='media-card-body';
    const title=document.createElement('b');title.textContent=slot.label;
    const small=document.createElement('small');small.textContent=`الموضع: ${slot.placement} · المعرّف: ${slot.key}`;
    const actions=document.createElement('div');actions.className='media-card-actions';
    const label=document.createElement('label');label.textContent='استبدال الصورة';
    const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.hidden=true;
    input.addEventListener('change',async()=>{
      const file=input.files?.[0];if(!file)return;
      try{
        const blob=await optimizeImage(file);
        await dbPut(slot.key,blob);removedImageSlots.delete(slot.key);localStorage.setItem(REMOVED_MEDIA_KEY,JSON.stringify([...removedImageSlots]));revokeUrl(slot.key);
        const url=URL.createObjectURL(blob);objectUrls.set(slot.key,url);preview.src=url;
        imageDraftCount++;
        logActivity(`تم استبدال صورة: ${slot.label}`);updateOverview();
        toast(`تم تحديث ${slot.label}. احفظ المسودة ثم انشر إلى GitHub.`);
      }catch(err){toast(err.message,'error');}
      input.value='';
    });
    label.append(input);
    const reset=document.createElement('button');reset.type='button';reset.textContent='استعادة الأصلية';
    reset.addEventListener('click',async()=>{
      await dbDelete(slot.key);removedImageSlots.add(slot.key);localStorage.setItem(REMOVED_MEDIA_KEY,JSON.stringify([...removedImageSlots]));revokeUrl(slot.key);preview.src=slot.src;
      toast(`تمت استعادة ${slot.label} إلى الصورة المنشورة/الأصلية.`);logActivity(`استعادة الصورة الأصلية: ${slot.label}`);updateOverview();
    });
    actions.append(label,reset);body.append(title,small,actions);card.append(preview,body);root.append(card);
  }
  $('#mediaCounter').textContent=`${MEDIA.length} موضعًا`;
}

async function renderCustomMedia() {
  const root=$('#customMediaList');root.replaceChildren();
  if(!customGallery.length){const empty=document.createElement('p');empty.className='muted-note';empty.textContent='لا توجد لقطات إضافية بعد. أضف صورة جديدة لتظهر في معرض المنتج.';root.append(empty);return;}
  for(const item of customGallery){
    const row=document.createElement('div');row.className='custom-item';
    const img=document.createElement('img');img.alt=item.title||'لقطة إضافية';img.src=await imageUrlFor(item.blobKey||`custom-${item.id}`,item.src||'');
    const text=document.createElement('div');const title=document.createElement('b');title.textContent=item.title||'لقطة إضافية';const cap=document.createElement('small');cap.textContent=item.caption||'بدون وصف';text.append(title,cap);
    const remove=document.createElement('button');remove.type='button';remove.textContent='حذف';remove.addEventListener('click',async()=>{
      if(!confirm(`حذف الصورة «${item.title||'لقطة إضافية'}» من المعرض؟`))return;
      const key=item.blobKey||`custom-${item.id}`;await dbDelete(key);revokeUrl(key);
      customGallery=customGallery.filter(x=>x.id!==item.id);localStorage.setItem(CUSTOM_KEY,JSON.stringify(customGallery));
      renderCustomMedia();updateOverview();logActivity(`حذف لقطة إضافية: ${item.title||item.id}`);toast('تم حذف اللقطة من المسودة.');
    });
    row.append(img,text,remove);root.append(row);
  }
}
$('#addGalleryImage').addEventListener('click',async()=>{
  const title=$('#newImageTitle').value.trim();const caption=$('#newImageCaption').value.trim();const file=$('#newImageFile').files?.[0];
  if(!title){toast('اكتب عنوان الصورة أولًا.','error');return;}
  if(!file){toast('اختر لقطة الشاشة المراد إضافتها.','error');return;}
  try{
    const blob=await optimizeImage(file);const id=`${Date.now()}_${Math.random().toString(36).slice(2,7)}`;const blobKey=`custom-${id}`;
    await dbPut(blobKey,blob);
    customGallery.push({id,title,caption,blobKey});
    localStorage.setItem(CUSTOM_KEY,JSON.stringify(customGallery));
    $('#newImageTitle').value='';$('#newImageCaption').value='';$('#newImageFile').value='';
    await renderCustomMedia();updateOverview();logActivity(`إضافة لقطة جديدة: ${title}`);toast('تمت إضافة اللقطة إلى المعرض. احفظ وانشر التغييرات.');
  }catch(err){toast(err.message,'error');}
});

function updateOverview() {
  const changedText=Object.keys(localContent).filter(key=>localContent[key]!==textDefaults[key]).length;
  $('#statSlots').textContent=MEDIA.length;
  $('#statCustom').textContent=customGallery.length;
  $('#statText').textContent=changedText;
  const last=readJSON(ACTIVITY_KEY,[])[0];
  if(last){$('#lastPublish').textContent=last.message;}
  $('#healthText').textContent=Object.keys(textDefaults).length?'جاهز':'تعذر قراءة النصوص';
  $('#meterText').style.width=Object.keys(textDefaults).length?'100%':'35%';
  $('#healthImages').textContent=`${MEDIA.length} / ${MEDIA.length}`;
  $('#meterImages').style.width='100%';
  $('#healthJson').textContent=published.format?'موجود':'افتراضي';
  $('#meterJson').style.width=published.format?'100%':'70%';
  $('#statPublish').textContent=readJSON(ACTIVITY_KEY,[]).some(x=>x.message.includes('GitHub'))?'تم النشر':'مسودة';
  refreshStorageUsage();
}

async function refreshStorageUsage(){
  const node=$('#statStorage');
  if(!node)return;
  try{
    if(navigator.storage?.estimate){
      const estimate=await navigator.storage.estimate();
      node.textContent=bytesLabel(estimate.usage||0);
      node.title=estimate.quota?`المساحة المقدرة المتاحة لهذا الأصل: ${bytesLabel(estimate.quota)}`:'تقدير مساحة المتصفح';
    }else node.textContent='غير متاح';
  }catch(_){node.textContent='غير متاح';}
}

function downloadBlob(blob,filename){
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
async function makeBackupConfig(){
  const images={...(published.images||{})};
  for(const key of removedImageSlots)delete images[key];
  for(const slot of MEDIA){const blob=await dbGet(slot.key);if(blob)images[slot.key]=await blobToDataUrl(blob);}
  const custom=[];
  for(const item of customGallery){
    const key=item.blobKey||`custom-${item.id}`;const blob=await dbGet(key);
    custom.push({...item,src:blob?await blobToDataUrl(blob):(item.src||''),blobKey:undefined});
  }
  return {format:'mailforge-portfolio-content',version:2,exportedAt:new Date().toISOString(),content:getTextValues(),images,removedImageSlots:[...removedImageSlots],customGallery:custom};
}
async function exportBackup(){
  try{
    const config=await makeBackupConfig();const json=JSON.stringify(config,null,2);
    downloadBlob(new Blob([json],{type:'application/json;charset=utf-8'}),'portfolio-content.json');
    logActivity('تنزيل نسخة احتياطية من المحتوى والصور');toast(`تم تنزيل ملف النسخة الاحتياطية (${bytesLabel(new Blob([json]).size)}).`);
  }catch(err){toast(`تعذر إنشاء النسخة الاحتياطية: ${err.message}`,'error');}
}
$('#exportBackup').addEventListener('click',exportBackup);
$('#downloadContentFromPublish').addEventListener('click',exportBackup);
$('#importBackup').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
    const config=JSON.parse(await file.text());
    if(config?.format!=='mailforge-portfolio-content'||typeof config.content!=='object'||typeof config.images!=='object')throw new Error('صيغة ملف غير صحيحة.');
    localContent={...config.content};localStorage.setItem(TEXT_KEY,JSON.stringify(localContent));
    removedImageSlots=new Set((config.removedImageSlots||[]).filter(key=>MEDIA.some(item=>item.key===key)));
    localStorage.setItem(REMOVED_MEDIA_KEY,JSON.stringify([...removedImageSlots]));
    for(const [slot,value] of Object.entries(config.images)){
      if(!MEDIA.some(item=>item.key===slot)||typeof value!=='string')continue;
      if(value.startsWith('data:image/')){await dbPut(slot,dataUrlToBlob(value));removedImageSlots.delete(slot);}
      else if(value)published.images[slot]=value;
    }
    localStorage.setItem(REMOVED_MEDIA_KEY,JSON.stringify([...removedImageSlots]));
    customGallery=[];
    for(const item of (config.customGallery||[])){
      if(!item?.id)continue;
      const copy={id:String(item.id),title:String(item.title||'لقطة إضافية'),caption:String(item.caption||'')};
      if(typeof item.src==='string'&&item.src.startsWith('data:image/')){const key=`custom-${copy.id}`;await dbPut(key,dataUrlToBlob(item.src));copy.blobKey=key;}
      else copy.src=String(item.src||'');
      customGallery.push(copy);
    }
    localStorage.setItem(CUSTOM_KEY,JSON.stringify(customGallery));
    buildTextFields();await renderMediaCards();await renderCustomMedia();updateOverview();
    logActivity(`استيراد نسخة احتياطية: ${file.name}`);toast('تم استيراد النسخة. راجع التغييرات ثم انشرها.');
  }catch(err){toast(`تعذر الاستيراد: ${err.message}`,'error');}
  event.target.value='';
});
$('#resetDraft').addEventListener('click',async()=>{
  if(!confirm('استعادة المحتوى الافتراضي؟ سيُحذف كل ما حفظته محليًا من نصوص وصور ومعرض إضافي.'))return;
  localStorage.removeItem(TEXT_KEY);localStorage.removeItem(CUSTOM_KEY);localStorage.removeItem(REMOVED_MEDIA_KEY);removedImageSlots.clear();await dbClear();
  for(const url of objectUrls.values()) URL.revokeObjectURL(url);objectUrls.clear();localContent={...(published.content||{})};customGallery=[...(published.customGallery||[])];
  buildTextFields();await renderMediaCards();await renderCustomMedia();updateOverview();logActivity('استعادة المسودات المحلية');toast('تمت استعادة المسودات الافتراضية.');
});

function bytesToBase64(buffer) {
  const bytes=new Uint8Array(buffer);let binary='';const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)));
  return btoa(binary);
}
async function githubRequest(url,token,options={}){
  const response=await fetch(url,{...options,headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json',...(options.headers||{})}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const message=data.message||`GitHub API returned ${response.status}`;throw new Error(message);}
  return data;
}
async function createGitBlob(repoBase,token,blob,encoding='base64'){
  const content=encoding==='base64'?bytesToBase64(await blob.arrayBuffer()):blob;
  return githubRequest(`${repoBase}/git/blobs`,token,{method:'POST',body:JSON.stringify({content,encoding})});
}
async function publishGithub(){
  if(isPublishing)return;
  const owner=$('#ghOwner').value.trim(),repo=$('#ghRepo').value.trim(),branch=$('#ghBranch').value.trim()||'main',path='portfolio-content.json',token=$('#ghToken').value.trim();
  if(!owner||!repo||!token){showPublishStatus('أدخل Owner وRepository وFine-grained Token أولًا.','error');return;}
  if(!/^[a-zA-Z0-9_.-]+$/.test(owner)||! /^[a-zA-Z0-9_.-]+$/.test(repo)){showPublishStatus('تحقق من اسم المستخدم واسم المستودع.','error');return;}
  const settings={owner,repo,branch,path};localStorage.setItem(GH_SETTINGS_KEY,JSON.stringify(settings));
  isPublishing=true;$('#publishGithub').disabled=true;$('#publishGithub').textContent='جارٍ تجهيز Commit…';showPublishStatus('يتم ضغط الصور ورفع ملفات الصور وملف المحتوى إلى GitHub…');
  const repoBase=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  try{
    const config={format:'mailforge-portfolio-content',version:2,updatedAt:new Date().toISOString(),content:getTextValues(),images:{...(published.images||{})},customGallery:[]};
    for(const key of removedImageSlots)delete config.images[key];
    const treeItems=[];let imageCount=0;
    for(const slot of MEDIA){
      const blob=await dbGet(slot.key);
      if(blob){
        const gitBlob=await createGitBlob(repoBase,token,blob,'base64');
        const target=`assets/managed/${slot.key}.webp`;
        treeItems.push({path:target,mode:'100644',type:'blob',sha:gitBlob.sha});
        config.images[slot.key]=target;imageCount++;
      }
    }
    for(const item of customGallery){
      const copy={id:String(item.id),title:String(item.title||'لقطة إضافية'),caption:String(item.caption||'')};
      const key=item.blobKey||`custom-${item.id}`;const blob=await dbGet(key);
      if(blob){
        const gitBlob=await createGitBlob(repoBase,token,blob,'base64');
        const target=`assets/managed/custom-${safeId(item.id)}.webp`;
        treeItems.push({path:target,mode:'100644',type:'blob',sha:gitBlob.sha});
        copy.src=target;imageCount++;
      } else copy.src=item.src||'';
      config.customGallery.push(copy);
    }
    const json=JSON.stringify(config,null,2);
    const jsonBlob=await createGitBlob(repoBase,token,new Blob([json],{type:'application/json'}),'base64');
    treeItems.push({path,mode:'100644',type:'blob',sha:jsonBlob.sha});
    showPublishStatus(`تم تجهيز ${imageCount} صورة. جارٍ إنشاء Commit واحد…`);
    const ref=await githubRequest(`${repoBase}/git/ref/heads/${encodeURIComponent(branch)}`,token);
    const parentSha=ref.object.sha;
    const parent=await githubRequest(`${repoBase}/git/commits/${parentSha}`,token);
    const tree=await githubRequest(`${repoBase}/git/trees`,token,{method:'POST',body:JSON.stringify({base_tree:parent.tree.sha,tree:treeItems})});
    const commit=await githubRequest(`${repoBase}/git/commits`,token,{method:'POST',body:JSON.stringify({message:'Update MailForge portfolio content and media',tree:tree.sha,parents:[parentSha]})});
    await githubRequest(`${repoBase}/git/refs/heads/${encodeURIComponent(branch)}`,token,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
    published=config;localContent={...config.content};customGallery=[...config.customGallery];removedImageSlots.clear();localStorage.removeItem(REMOVED_MEDIA_KEY);
    $('#statPublish').textContent='تم النشر';$('#lastPublish').textContent=`Commit ${commit.sha.slice(0,7)}`;
    logActivity(`نشر الموقع إلى GitHub — ${commit.sha.slice(0,7)}`);
    showPublishStatus(`نجح النشر. تم إنشاء Commit ${commit.sha.slice(0,7)} وتحديث ملف المحتوى و${imageCount} صورة. إذا كان Cloudflare Pages مرتبطًا بالفرع، سيبدأ النشر التلقائي وقد يحتاج بعض الوقت حتى يظهر التحديث.`);
    toast('تم إرسال التحديث إلى GitHub بنجاح.');
  }catch(err){
    showPublishStatus(`فشل النشر: ${err.message}. تحقق من صلاحيات Contents: Read and write واسم الفرع.`, 'error');
    toast(`فشل النشر: ${err.message}`,'error');
  }finally{
    $('#ghToken').value='';isPublishing=false;$('#publishGithub').disabled=false;$('#publishGithub').textContent='نشر إلى GitHub الآن ↗';
  }
}
$('#publishGithub').addEventListener('click',publishGithub);

async function testGithubConnection(){
  const owner=$('#ghOwner').value.trim(),repo=$('#ghRepo').value.trim(),branch=$('#ghBranch').value.trim()||'main',token=$('#ghToken').value.trim();
  if(!owner||!repo||!token){showPublishStatus('أدخل Owner وRepository وFine-grained Token لاختبار الاتصال.','error');return;}
  if(!/^[a-zA-Z0-9_.-]+$/.test(owner)||! /^[a-zA-Z0-9_.-]+$/.test(repo)){showPublishStatus('تحقق من اسم المستخدم واسم المستودع.','error');return;}
  const button=$('#testGithub');button.disabled=true;button.textContent='جارٍ الاختبار…';
  const repoBase=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  try{
    const repoInfo=await githubRequest(repoBase,token);
    const ref=await githubRequest(`${repoBase}/git/ref/heads/${encodeURIComponent(branch)}`,token);
    const visibility=repoInfo.private?'خاص':'عام';
    const result=`نجح الاتصال. المستودع ${visibility}، والفرع ${branch} متاحان. هذا يؤكد الوصول للقراءة؛ صلاحية الكتابة تُثبت عند محاولة النشر.`;
    showPublishStatus(result);
    localStorage.setItem(GH_SETTINGS_KEY,JSON.stringify({owner,repo,branch,path:'portfolio-content.json'}));
    logActivity(`نجح اختبار اتصال GitHub — ${owner}/${repo}`);
    toast('نجح اختبار مستودع GitHub.');
  }catch(err){
    showPublishStatus(`تعذر الاتصال: ${err.message}. تحقق من المستودع والفرع وصلاحية Contents: Read and write. اختبار القراءة لا يثبت صلاحية الكتابة. إذا كان المستودع فارغًا، أنشئ أول Commit من GitHub أولًا.`, 'error');
    toast(`فشل اختبار الاتصال: ${err.message}`,'error');
  }finally{
    $('#ghToken').value='';button.disabled=false;button.textContent='اختبار الاتصال والوصول';
  }
}
$('#testGithub').addEventListener('click',testGithubConnection);

function loadGitHubSettings(){
  const settings=readJSON(GH_SETTINGS_KEY,{});
  $('#ghOwner').value=settings.owner||'';$('#ghRepo').value=settings.repo||'';$('#ghBranch').value=settings.branch||'main';$('#ghPath').value=settings.path||'portfolio-content.json';
}

async function init(){
  await loadSources();
  const storedSettings=readJSON(GH_SETTINGS_KEY,{});loadGitHubSettings();
  buildTextFields();await renderMediaCards();await renderCustomMedia();renderActivity();updateOverview();
  if(!Object.keys(textDefaults).length){toast('تعذر تحميل index.html. افتح لوحة الإدارة عبر Cloudflare Pages أو خادم محلي، وليس file://.','error');}
}
init().catch(error=>{console.error(error);toast(error.message,'error');});
