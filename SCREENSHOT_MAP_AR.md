# خريطة صور MailForge — مواضع اللقطات داخل Portfolio

هذه الخريطة تشرح وظيفة كل لقطة وموضعها المقصود في الموقع. جميع الصور مأخوذة من لقطات الواجهة التي قدمها صاحب المشروع؛ لا تستخدم صور واجهات مولدة بديلًا عنها.

| الملف | موضع العرض | ماذا توضح الصورة؟ |
|---|---|---|
| `assets/mailforge-logo.png` | الشريط العلوي، Hero، التذييل، favicon ولوحة الإدارة | الشعار الرسمي |
| `assets/dashboard-overview.png` | معرض المنتج | لوحة التحكم العامة |
| `assets/dashboard-onboarding.png` | Hero / شرح البداية / المعرض | خطوات تفعيل أول حملة |
| `assets/dashboard-activity.png` | قسم لوحة التحكم والمعرض | إجراءات سريعة ونشاط المستخدم |
| `assets/templates-gallery.png` | قسم Templates والمعرض | مكتبة قوالب البريد |
| `assets/templates-library.png` | قسم Studio والمعرض | مكتبة القوالب ومصمم الذكاء |
| `assets/campaign-creation.png` | قسم Campaign Management والمعرض | نافذة إنشاء حملة جديدة واختيار الجمهور والقالب |
| `assets/automation-workflow.png` | قسم Automation والمعرض | الأتمتة، السلاسل، واختبارات العناوين |
| `assets/contacts-management.png` | قسم Audience Management والمعرض | جهات الاتصال والمجموعات والاستيراد |
| `assets/analytics-overview.png` | قسم Analytics والمعرض | التحليلات العامة |
| `assets/analytics-detailed.png` | قسم Analytics والمعرض | تفاصيل الأداء والرسوم |
| `assets/analytics-summary.png` | قسم Analytics والمعرض | مؤشرات الحملة والملخص التنفيذي |
| `assets/analytics-delivery.png` | قسم Analytics والمعرض | نشاط الإرسال وتوزيع حالات التسليم والنطاقات |
| `assets/analytics-best-time.png` | قسم Analytics والمعرض | خريطة أفضل وقت للإرسال وتحليل الروابط |
| `assets/campaign-results.png` | قسم Campaign Results والمعرض | نتائج حملة فردية وإعادة الاستهداف |
| `assets/media-library.png` | قسم Media Library والمعرض | إدارة الصور والملفات |

## قواعد استخدام الصور

- لا تستخدم رقمًا أو نسبة ظاهرة في Dashboard بوصفها نتيجة تجارية محققة؛ قد تكون بيانات اختبارية.
- عند الحاجة إلى أرقام في قصة المشروع، استخدم مصادر موثقة أو ضع وصفًا يوضح أنها بيانات واجهة/اختبار.
- استبدال صورة من لوحة الإدارة يحدّث كل المواضع المرتبطة بنفس `data-media-slot`.
- اللقطات الإضافية التي لا يقابلها قسم حالي يمكن وضعها في معرض المنتج، ثم تخصيص قسم لها عند توفر بقية صور الوظيفة.


## مواضع إعادة الاستخدام في Version 6

تمت إعادة استخدام الصور الأصلية نفسها داخل كتالوج صفحات المنصة، مع ربطها بمعرّف `data-media-slot` نفسه حتى يظل استبدال الصورة مركزيًا من لوحة الإدارة:

- `dashboardOnboarding`: Hero، معرض المنتج، بطاقة Dashboard في الكتالوج.
- `templatesGallery`: معرض المنتج، بطاقة القوالب في الكتالوج.
- `campaignCreation`: بطاقة Campaigns، معرض المنتج، بطاقة إنشاء حملة في الكتالوج.
- `campaignResults`: معرض المنتج وبطاقة نتائج الحملة.
- `automationWorkflow`: بطاقة Automation، معرض المنتج، كتالوج الأتمتة.
- `contactsManagement`: بطاقة الجمهور، معرض المنتج، كتالوج المستلمين.
- `analyticsDetailed`: بطاقة التحليلات ومعرض المنتج وكتالوج التحليلات.
- `mediaLibrary`: بطاقة الوسائط والمعرض وكتالوج الوسائط.
