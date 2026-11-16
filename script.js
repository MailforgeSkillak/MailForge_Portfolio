// MailForge interactive portfolio — vanilla JS, no build step required.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation
const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
$$('#mainNav a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

// Reveal elements as they enter the viewport.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Active navigation state
const sections = $$('main section[id]');
const navLinks = $$('#mainNav a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(section => sectionObserver.observe(section));

// Back to top
const backToTop = $('#backToTop');
window.addEventListener('scroll', () => backToTop?.classList.toggle('visible', window.scrollY > 650), { passive: true });
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
$('#year').textContent = new Date().getFullYear();

// Audience selector
const audiences = {
  training: {
    kicker: 'Initial market wedge', index: '01 / 04',
    title: 'مركز التدريب لا يرسل إعلانًا فقط؛ بل يدير رحلة الطالب.',
    desc: 'من أول تسجيل وحتى التقييم والدورة التالية، تتكرر نقاط التواصل. MailForge تساعد على تنظيم هذه الرسائل وربطها بقوائم الطلاب والشرائح وسيناريوهات المتابعة.',
    flow: ['تسجيل','ترحيب','تذكير','متابعة','تقييم'],
    usecases: ['Course announcements','Payment reminders','Attendance follow-up','Feedback']
  },
  agency: {
    kicker: 'Expansion segment', index: '02 / 04',
    title: 'الوكالة تحتاج مساحة واضحة لكل عميل.',
    desc: 'بدل خلط القوائم والقوالب والحملات، تساعد Agency Workspaces على فصل بيئة كل عميل وإدارة الفريق والصلاحيات من مساحة مركزية.',
    flow: ['عميل A','Workspace','حملات','تقارير','عميل B'],
    usecases: ['Client Workspaces','Team Permissions','Campaign Management','Template Library']
  },
  smb: {
    kicker: 'Core SMB segment', index: '03 / 04',
    title: 'الشركة الصغيرة تحتاج تسويقًا منظمًا دون تعقيد تشغيلي.',
    desc: 'يمكن للشركات تنظيم جهات الاتصال، إنشاء حملات دورية، تخصيص الرسائل، ومراجعة مؤشرات الأداء دون إدارة كل خطوة يدويًا.',
    flow: ['جهات الاتصال','تقسيم','تصميم','إرسال','تحليل'],
    usecases: ['Newsletters','Offers','Lead follow-up','Customer updates']
  },
  creator: {
    kicker: 'Creator & educator segment', index: '04 / 06',
    title: 'المدرب وصانع المحتوى يريد علاقة مستمرة مع جمهوره.',
    desc: 'من النشرة الدورية إلى إطلاق دورة أو منتج جديد، تساعد القوالب والـAI والمتابعة على تنظيم الرسائل وبناء تواصل مستمر.',
    flow: ['جمهور','محتوى','نشرة','تفاعل','إعادة تواصل'],
    usecases: ['Newsletters','Course launches','Audience updates','Re-engagement']
  },
  ecommerce: {
    kicker: 'E-commerce expansion segment', index: '05 / 06',
    title: 'المتجر يحتاج إلى تواصل يتجاوز إعلان الخصم.',
    desc: 'يمكن تنظيم النشرات والعروض وإعلانات المنتجات وشرائح العملاء. أما بيانات الطلبات وسلوك الشراء فتحتاج إلى تكامل خارجي مناسب قبل بناء أتمتة قائمة عليها.',
    flow: ['اشتراك','تقسيم','عرض','تفاعل','إعادة تواصل'],
    usecases: ['Product launches','Promotions','Customer updates','Re-engagement']
  },
  services: {
    kicker: 'B2B services segment', index: '06 / 06',
    title: 'شركة الخدمات تحتاج إلى متابعة متسقة مع العملاء المحتملين.',
    desc: 'تنظيم جهات الاتصال والرسائل التعريفية والنشرات والمتابعات، مع تخصيص الرسائل حسب بيانات الشركة واهتمامات العميل المسجلة.',
    flow: ['Lead','تعريف','تثقيف','متابعة','تحديث'],
    usecases: ['Lead nurturing','Service announcements','Client updates','Follow-up sequences']
  }
};
function renderAudience(key) {
  const data = audiences[key]; if (!data) return;
  $('#audienceKicker').textContent = data.kicker;
  $('#audienceIndex').textContent = data.index;
  $('#audienceTitle').textContent = data.title;
  $('#audienceDesc').textContent = data.desc;
  $('#audienceFlow').innerHTML = data.flow.map((item, i) => `${i ? '<i>→</i>' : ''}<span>${item}</span>`).join('');
  $('#audienceUsecases').innerHTML = data.usecases.map(item => `<span>${item}</span>`).join('');
}
$$('.audience-tab').forEach(button => button.addEventListener('click', () => {
  $$('.audience-tab').forEach(tab => {
    const active = tab === button;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  renderAudience(button.dataset.audience);
}));

// Show / hide platform page map
const pagesToggle = $('#pagesToggle');
const pagesPanel = $('#pagesPanel');
pagesToggle?.addEventListener('click', () => {
  const expanded = pagesToggle.getAttribute('aria-expanded') === 'true';
  pagesToggle.setAttribute('aria-expanded', String(!expanded));
  pagesPanel.hidden = expanded;
  $('.toggle-plus', pagesToggle).textContent = expanded ? '＋' : '−';
});

// Filter AI tool cards
$$('.ai-filter-btn').forEach(button => button.addEventListener('click', () => {
  $$('.ai-filter-btn').forEach(btn => btn.classList.toggle('active', btn === button));
  const filter = button.dataset.filter;
  $$('.ai-tool').forEach(card => card.hidden = filter !== 'all' && card.dataset.category !== filter);
}));


// Search and filter the complete page/module catalog.
const moduleSearch = $('#moduleSearch');
let activeModuleFilter = 'all';
function filterModules() {
  const query = (moduleSearch?.value || '').trim().toLocaleLowerCase('ar');
  let visible = 0;
  $$('.module-card').forEach(card => {
    const typeOk = activeModuleFilter === 'all' || card.dataset.moduleType === activeModuleFilter;
    const textOk = !query || card.textContent.toLocaleLowerCase('ar').includes(query);
    const show = typeOk && textOk;
    card.hidden = !show;
    if (show) visible++;
  });
  const counter = $('#catalogCount');
  if (counter) counter.textContent = `${visible} وحدة ظاهرة`;
  $$('.catalog-group-head').forEach(head => {
    const next = head.nextElementSibling;
    if (next?.classList.contains('module-grid')) {
      const hasVisible = [...next.querySelectorAll('.module-card')].some(card => !card.hidden);
      head.hidden = !hasVisible;
    }
  });
}
$$('.catalog-filter').forEach(button => button.addEventListener('click', () => {
  $$('.catalog-filter').forEach(item => item.classList.toggle('active', item === button));
  activeModuleFilter = button.dataset.moduleFilter || 'all';
  filterModules();
}));
moduleSearch?.addEventListener('input', filterModules);
filterModules();

// Interactive 7-step journey
const journeyData = [
  { title:'من زيارة المنصة إلى أول مساحة عمل.', desc:'يكتشف المستخدم القيمة، ينشئ حسابه، ويتعرف على لوحة التحكم والإرشادات الأولى.', features:['Public website','Authentication','Onboarding'], icon:'✦', floats:['MailForge','Workspace','Ready'] },
  { title:'اربط صندوق البريد الذي تستخدمه بالفعل.', desc:'يربط المستخدم Gmail أو Outlook عبر OAuth، دون مشاركة كلمة مرور البريد مع المنصة. تختلف الصلاحيات والحصص بحسب مزود الخدمة ونوع الحساب.', features:['Gmail OAuth','Microsoft OAuth','Mailbox settings'], icon:'✉', floats:['Gmail','Outlook','OAuth'] },
  { title:'حوّل قائمة جهات الاتصال إلى جمهور منظم.', desc:'استيراد ملفات CSV، مطابقة الأعمدة، إنشاء مجموعات ووسوم، وتجهيز شرائح مناسبة للحملة مع إدارة الاستبعاد.', features:['CSV Import','Groups & Tags','Suppression list'], icon:'◎', floats:['Contacts','Segments','Variables'] },
  { title:'اصنع الرسالة بالقالب أو المحرر أو AI.', desc:'يختار المستخدم قالبًا أو يبدأ من الصفر، يعدّل التصميم مرئيًا، ويستخدم أدوات المساعدة لكتابة المحتوى والعناوين والدعوات للإجراء.', features:['Templates','Drag & Drop Builder','AI Content'], icon:'✧', floats:['Template','RTL','AI Assist'] },
  { title:'راجع الحملة، ثم أطلقها أو جدولها.', desc:'اختيار الجمهور والقالب، مراجعة الإعدادات، فحص شروط الإرسال، ثم إرسال الحملة وفق حدود مزود البريد والضوابط الداخلية.', features:['Pre-send checks','Scheduling','Sending controls'], icon:'➤', floats:['Review','Schedule','Send'] },
  { title:'اقرأ النتائج واكتشف ما يحتاج إلى تحسين.', desc:'متابعة مؤشرات الإرسال والفتح والنقر والارتداد، ثم الاستفادة من ملخص التحليلات لتوجيه الحملة التالية.', features:['Campaign results','Link tracking','AI analysis'], icon:'▥', floats:['Open','Click','Insights'] },
  { title:'وسّع العمل مع الفريق والعملاء.', desc:'دعوة أعضاء الفريق بأدوار وصلاحيات، أو تنظيم عملاء الوكالة في مساحات منفصلة. هذه المرحلة تدعم التوسع بعد استقرار الاستخدام الأساسي.', features:['Team roles','Agency workspaces','Client separation'], icon:'⇧', floats:['Team','Agency','Scale'] }
];
let activeJourneyStep = 0;
function renderJourney(index) {
  activeJourneyStep = Math.max(0, Math.min(journeyData.length - 1, index));
  const step = journeyData[activeJourneyStep];
  $('#journeyCounter').textContent = `STEP ${String(activeJourneyStep + 1).padStart(2,'0')} / 07`;
  $('#journeyTitle').textContent = step.title;
  $('#journeyDesc').textContent = step.desc;
  $('#journeyFeatures').innerHTML = step.features.map(feature => `<span>${feature}</span>`).join('');
  $('#journeyIcon').textContent = step.icon;
  const floatNodes = $$('.journey-float');
  floatNodes.forEach((node, i) => node.textContent = step.floats[i]);
  $$('.journey-step').forEach((button, i) => {
    button.classList.toggle('active', i === activeJourneyStep);
    button.classList.toggle('done', i < activeJourneyStep);
    button.setAttribute('aria-current', i === activeJourneyStep ? 'step' : 'false');
  });
  $('#journeyFill').style.width = `${activeJourneyStep / (journeyData.length - 1) * 100}%`;
  $('#journeyPrev').disabled = activeJourneyStep === 0;
  $('#journeyNext').textContent = activeJourneyStep === journeyData.length - 1 ? 'العودة للبداية ↻' : 'الخطوة التالية ←';
  $('#journeyIcon').animate?.([{transform:'scale(.82) rotate(-8deg)',opacity:.35},{transform:'scale(1) rotate(0)',opacity:1}], {duration:320,easing:'ease-out'});
}
$$('.journey-step').forEach(button => button.addEventListener('click', () => renderJourney(Number(button.dataset.step))));
$('#journeyPrev')?.addEventListener('click', () => renderJourney(activeJourneyStep - 1));
$('#journeyNext')?.addEventListener('click', () => renderJourney(activeJourneyStep === journeyData.length - 1 ? 0 : activeJourneyStep + 1));
renderJourney(0);

// Screenshot lightbox
const lightbox = $('#lightbox');
$$('.gallery-item').forEach(button => button.addEventListener('click', () => {
  const image = button.dataset.image;
  $('#lightboxImage').src = image;
  $('#lightboxImage').alt = button.querySelector('img')?.alt || 'لقطة من MailForge';
  $('#lightboxCaption').textContent = button.querySelector('.gallery-caption [data-editable]')?.textContent || button.dataset.caption || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}));
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
$('#lightboxClose')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

// Extra screenshots maintained by the Portfolio admin dashboard.
const customGalleryUrls = new Map();
async function getLocalGalleryBlob(key) {
  if (!('indexedDB' in window)) return null;
  return new Promise((resolve) => {
    const request = indexedDB.open('mailforge-portfolio-content', 1);
    request.onerror = () => resolve(null);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('media')) request.result.createObjectStore('media');
    };
    request.onsuccess = () => {
      const db = request.result;
      try {
        const tx = db.transaction('media', 'readonly');
        const get = tx.objectStore('media').get(key);
        get.onsuccess = () => { const result = get.result || null; db.close(); resolve(result); };
        get.onerror = () => { db.close(); resolve(null); };
      } catch (_) { db.close(); resolve(null); }
    };
  });
}
async function renderCustomGallery(items = []) {
  const wrap = $('#customGalleryWrap');
  const grid = $('#customGalleryItems');
  if (!wrap || !grid) return;
  grid.replaceChildren();
  const safeItems = Array.isArray(items) ? items.filter(item => item && (typeof item.src === 'string' || typeof item.blobKey === 'string')) : [];
  wrap.hidden = safeItems.length === 0;
  for (const [index, item] of safeItems.entries()) {
    let src = item.src || '';
    if (item.blobKey) {
      const blob = await getLocalGalleryBlob(item.blobKey);
      if (blob instanceof Blob) {
        if (customGalleryUrls.has(item.blobKey)) URL.revokeObjectURL(customGalleryUrls.get(item.blobKey));
        src = URL.createObjectURL(blob);
        customGalleryUrls.set(item.blobKey, src);
      }
    }
    if (!src) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-item custom-gallery-item reveal visible';
    button.dataset.image = src;
    button.dataset.caption = item.caption || item.title || 'لقطة إضافية من MailForge';
    button.setAttribute('aria-label', `تكبير ${item.title || 'لقطة إضافية'}`);
    const label = document.createElement('span');
    label.className = 'gallery-label';
    label.textContent = `ADDITIONAL / ${String(index + 1).padStart(2, '0')}`;
    const img = document.createElement('img');
    img.src = src;
    img.alt = item.title || 'لقطة إضافية من MailForge';
    img.loading = 'lazy';
    const caption = document.createElement('span');
    caption.className = 'gallery-caption';
    const title = document.createElement('span');
    title.textContent = item.title || 'لقطة إضافية';
    const arrow = document.createElement('b');
    arrow.textContent = '↗';
    caption.append(title, arrow);
    button.append(label, img, caption);
    button.addEventListener('click', () => {
      $('#lightboxImage').src = src;
      $('#lightboxImage').alt = img.alt;
      $('#lightboxCaption').textContent = item.caption || item.title || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
    grid.append(button);
  }
  wrap.hidden = grid.children.length === 0;
}

// Apply published portfolio copy/media plus this browser's private draft preview.
(async function loadPortfolioContent() {
  const defaultImages = {};
  $$('img[data-media-slot]').forEach(img => {
    const slot = img.dataset.mediaSlot;
    if (slot && !(slot in defaultImages)) defaultImages[slot] = img.getAttribute('src');
  });
  let config = { content: {}, images: {}, customGallery: [] };
  try {
    const response = await fetch('portfolio-content.json', { cache: 'no-store' });
    if (response.ok) {
      const parsed = await response.json();
      if (parsed?.format === 'mailforge-portfolio-content') config = parsed;
    }
  } catch (error) {
    console.warn('Could not load published portfolio content:', error);
  }

  const localText = (() => {
    try { return JSON.parse(localStorage.getItem('mailforgePortfolioTextOverrides') || '{}'); }
    catch (_) { return {}; }
  })();
  const mergedText = { ...(config.content || {}), ...localText };
  $$('[data-editable]').forEach(node => {
    const key = node.dataset.editable;
    if (key && Object.prototype.hasOwnProperty.call(mergedText, key)) node.textContent = String(mergedText[key]);
  });
  const titleMain = mergedText.heroTitleMain || 'MailForge';
  document.title = `MailForge by Skillak — ${titleMain}`;

  function applyImage(slot, src) {
    if (!src) return;
    $$(`img[data-media-slot="${CSS.escape(slot)}"]`).forEach(img => {
      img.src = src;
      const galleryItem = img.closest('.gallery-item');
      if (galleryItem) galleryItem.dataset.image = src;
    });
    if (slot === 'brandLogo') {
      const icon = $('link[rel="icon"]');
      if (icon) icon.href = src;
    }
  }

  Object.entries(config.images || {}).forEach(([slot, src]) => {
    if (typeof src === 'string' && src && defaultImages[slot]) applyImage(slot, src);
  });
  let removed = [];
  try { removed = JSON.parse(localStorage.getItem('mailforgePortfolioRemovedImages') || '[]'); }
  catch (_) { removed = []; }
  removed.forEach(slot => { if (defaultImages[slot]) applyImage(slot, defaultImages[slot]); });

  // Local uploads override published assets only in this browser; publishing makes them global.
  try {
    const request = indexedDB.open('mailforge-portfolio-content', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('media')) request.result.createObjectStore('media');
    };
    await new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('media', 'readonly');
        const store = tx.objectStore('media');
        const keys = Object.keys(defaultImages);
        let pending = keys.length;
        if (!pending) { db.close(); resolve(); return; }
        keys.forEach(slot => {
          const get = store.get(slot);
          get.onsuccess = () => {
            const blob = get.result;
            if (blob instanceof Blob) applyImage(slot, URL.createObjectURL(blob));
            pending -= 1;
            if (!pending) { db.close(); resolve(); }
          };
          get.onerror = () => {
            pending -= 1;
            if (!pending) { db.close(); resolve(); }
          };
        });
        tx.onerror = () => { db.close(); reject(tx.error); };
      };
    });
  } catch (error) {
    console.warn('Local media draft preview is unavailable:', error);
  }

  let custom = config.customGallery || [];
  try {
    const localCustom = localStorage.getItem('mailforgePortfolioCustomGallery');
    if (localCustom !== null) custom = JSON.parse(localCustom);
  } catch (_) {}
  await renderCustomGallery(custom);
})().catch(error => console.warn('Portfolio content initialization failed:', error));
