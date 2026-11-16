# دليل الاستضافة والتخزين — MailForge Portfolio

## التوصية

استخدم البنية التالية:

- **GitHub Repository:** مستودع المصدر وحفظ ملفات HTML وCSS وJavaScript والصور وملف المحتوى وسجل الإصدارات.
- **Cloudflare Pages:** نشر الموقع الثابت وتقديمه للزوار عبر CDN.
- **Admin Dashboard:** تعديل المحتوى والصور محليًا، ثم إنشاء Commit في GitHub باستخدام Fine-grained Token يقدمه مالك المشروع وقت النشر.

بهذا الشكل لا تحتاج إلى Backend أو قاعدة بيانات أو Storage منفصل لهذا الـPortfolio في المرحلة الحالية.

> ملاحظة سياسة استضافة: وثائق GitHub Pages الحالية تنص على أن الخدمة ليست مخصصة لاستضافة مواقع الأعمال أو المواقع التي يكون غرضها الأساسي تقديم أو ترويج SaaS تجاري. لذلك أوصي باستخدام GitHub كمستودع مصدر، وCloudflare Pages كطبقة استضافة عامة بدل نشر هذا الموقع التجاري على GitHub Pages. راجع وثائق GitHub قبل اختيار Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## 1. إنشاء مستودع GitHub

1. أنشئ مستودعًا باسم `mailforge-portfolio`.
2. يمكن أن يكون المستودع خاصًا أو عامًا؛ Cloudflare Pages يدعم ربط مستودعات GitHub الخاصة والعامة.
3. فك ضغط حزمة المشروع.
4. ارفع **محتويات مجلد `mailforge-portfolio`** إلى جذر المستودع، لا ترفع المجلد كطبقة إضافية.
5. تأكد من وجود `index.html` بجوار `styles.css` و`script.js` و`portfolio-content.json` ومجلد `assets/`.

## 2. إنشاء Cloudflare Pages Project

1. سجّل الدخول إلى Cloudflare.
2. افتح Workers & Pages.
3. اختر Create application ثم Pages ثم Connect to Git.
4. اربط حساب GitHub وامنح Cloudflare صلاحية الوصول إلى مستودع `mailforge-portfolio` فقط قدر الإمكان.
5. اختر المستودع والفرع `main`.
6. لأن الموقع HTML/CSS/JS ثابت ولا يحتاج إلى Build:
   - Framework preset: None.
   - Build command: اتركه فارغًا.
   - Build output directory: `.` (جذر المستودع).
   - Root directory: جذر المستودع.
7. ابدأ أول Deployment وافتح رابط `*.pages.dev` الذي يوفره Cloudflare.

عند ربط Git Integration، يؤدي كل Push إلى الفرع المتصل إلى Deployment تلقائي. يمكن توصيل مستودع خاص أو عام. راجع:
https://developers.cloudflare.com/pages/get-started/git-integration/

## 3. فتح لوحة الإدارة

افتح:

`https://YOUR-PROJECT.pages.dev/admin.html`

من لوحة الإدارة يمكنك:

- تعديل الحقول النصية التي تحمل `data-editable` في `index.html`.
- استبدال كل صورة من موضعها المحدد.
- إضافة صور إلى معرض المنتج أو حذف الصور المضافة.
- حفظ المسودات محليًا في المتصفح.
- استيراد وتصدير نسخة JSON احتياطية.
- اختبار الاتصال بمستودع GitHub قبل النشر.
- نشر التغييرات إلى GitHub في Commit واحد.

## 4. إعداد Fine-grained Personal Access Token

أنشئ الرمز من إعدادات GitHub:

1. اختر Fine-grained personal access token.
2. اختر Repository access → Only select repositories.
3. حدد مستودع `mailforge-portfolio` فقط.
4. امنح Repository permissions → Contents: Read and write.
5. اترك Metadata للقراءة، ولا تمنح صلاحيات أخرى غير لازمة.
6. ضع تاريخ انتهاء قصيرًا مناسبًا، واحتفظ بالرمز سرًا.
7. في لوحة الإدارة، أدخل Owner وRepository وBranch والرمز.
8. اضغط «اختبار الاتصال والصلاحيات» أولًا.
9. إذا نجح الاختبار، اضغط «حفظ التحديث في GitHub».

**الأمان:** الرمز لا يُكتب داخل ملفات المشروع ولا يُخزّن في LocalStorage أو IndexedDB؛ يُستخدم داخل جلسة المتصفح ثم يُمسح من الحقل. ومع ذلك، لا تستخدمه إلا مع نسخة موثوقة من الموقع، ولا تمنحه صلاحيات حساب كاملة، ولا تشاركه، وألغِه أو دوّره عند الشك في تعرضه.

## 5. كيف يعمل النشر من لوحة الإدارة؟

- الصور التي استبدلتها ترفع إلى `assets/managed/` بصيغة WebP.
- الصور الإضافية للمعرض ترفع إلى `assets/managed/` بأسماء مستقلة.
- يتحدث `portfolio-content.json` بروابط الصور والنصوص الجديدة.
- تُنشأ شجرة وCommit جديدان في GitHub ثم يُحدّث الفرع المختار.
- Cloudflare Pages يلتقط Commit الجديد ويبدأ النشر تلقائيًا إذا كان Git Integration مرتبطًا بهذا الفرع.

## 6. أين تحفظ المسودات؟

- النصوص: LocalStorage في المتصفح.
- الصور: IndexedDB في المتصفح.
- المحتوى المنشور: `portfolio-content.json` في مستودع GitHub.
- الصور المنشورة: `assets/` و`assets/managed/` في المستودع.

المسودات المحلية لا تنتقل تلقائيًا إلى جهاز آخر. استخدم «تنزيل نسخة احتياطية» أو انشر التغييرات إلى GitHub لمزامنتها مع بقية الأجهزة.

## 7. هل أحتاج إلى موقع تخزين منفصل؟

لا، ليس لهذا الـPortfolio ما دامت الصور عامة وصغيرة نسبيًا. مستودع GitHub مناسب لحفظ ملفات الموقع ولقطاته، وCloudflare Pages يقدمها للزوار.

لكن **لا تستخدم المستودع لتخزين**:
- قوائم بريد العملاء أو جهات الاتصال.
- ملفات شخصية أو مستندات خاصة.
- كلمات مرور أو مفاتيح API أو بيانات دفع.
- ملفات المستخدمين التي يفترض أن تكون خاصة أو لها صلاحيات وصول.

إذا تحوّل المشروع إلى نظام لإدارة ملفات الزوار أو العملاء، فستحتاج Backend ومصادقة وصلاحيات وتخزينًا خاصًا مثل R2 أو خدمة مشابهة؛ هذا خارج نطاق Portfolio ثابت.

## 8. حدود Cloudflare Pages المجانية

بحسب وثائق Cloudflare الحالية، الخطة المجانية تتضمن 500 Build شهريًا، و20,000 ملف لكل موقع، وحدًا أقصى 25 MiB للملف الواحد. راجع الحدود الحالية قبل الاعتماد طويل المدى:
https://developers.cloudflare.com/pages/platform/limits/

حافظ على الصور مضغوطة؛ لوحة الإدارة تحول الصور التي ترفعها إلى WebP بحد أقصى تقريبي 1900px على الضلع الأطول.

## 9. استكشاف الأخطاء

- **تعذر تحميل الحقول:** افتح لوحة الإدارة من رابط Pages أو خادم محلي عبر HTTP، ولا تفتحها باستخدام `file://`.
- **404 عند اختبار GitHub:** تحقق من Owner وRepository وBranch. أنشئ أول Commit إذا كان المستودع فارغًا.
- **Resource not accessible by personal access token:** أعد إنشاء Fine-grained Token مع Contents: Read and write للمستودع المحدد.
- **نجح Commit ولم يتغير الموقع:** تأكد من ربط Cloudflare Pages بالمستودع والفرع نفسيهما، وانتظر اكتمال Deployment، ثم حدّث الصفحة.
- **الصور لا تظهر:** تحقق من وجود ملف `portfolio-content.json` ومسارات `assets/managed/` في جذر المستودع.
