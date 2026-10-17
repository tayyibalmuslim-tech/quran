# فحص المحتوى والتخطيط

تاريخ الفحص: 2026-10-17 بتوقيت القاهرة. المستودع `tayyibalmuslim-tech/quran`، أساس الفحص `9f8acaa4ab071d346bba88de3871c927c35d4d08`. لا تعديل للتطبيق ولا محتوى سور جديد ولا اعتماد علمي لأي سورة في هذه المهمة.

## النتيجة

- القائمة تضم 114 سورة و6,236 آية. الموجود 22 سورة، مجموعها 1,116 آية؛ غير الموجود 92 سورة ومجموعها **5,120 آية بالضبط** وفق المصدر المحلي.
- الموجود: 70 محورًا و181 مقطعًا؛ لا تدخل صفحات المقدمة الـ22 في عدّ المحاور أو المقاطع. 3 سور tooltips (البقرة ومريم والنبأ)، و19 سورة glossary، بينها المطففين الديناميكية.
- أرقام الآيات في نص التلاوة لكل سورة موجودة تغطي 1..N بالترتيب مرة واحدة، وتطابق نطاقات المقاطع والمحاور المعلنة. هذه **تغطية بنيوية** وليست شهادة مطابقة الرسم أو اكتمال المعاني أو صحة الفضائل.
- المطففين ليست غائبة رغم خلو HTML من المقاطع الثابتة: قرأت `assets/mutaffifin-content.js` وشغّلت دالة توليده محليًا في Node بسياق document مصغر بلا شبكة، ثم فحصت الناتج؛ 36 آية و6 مقاطع وقائمة glossary. ليس ذلك اختبار متصفح أو محررات.
- مقارنة النص بعد إزالة وسوم العرض والأقواس والترقيم والفراغات فقط تظهر اختلافات في 21 سورة قديمة؛ مريم وحدها تطابق آياتها الـ98 هذا الفحص كله. لا يعني اختلاف Unicode وحده تبديل معنى أو فساد القراءة؛ لكنه يخالف شرط المطابقة الحرفية الجديد. مثال متحقق: البقرة آية 2 أول اختلاف بعد تجاهل الفراغات عند الموضع الصفري 39: U+0650 في الصفحة مقابل U+0651 في المصدر، أي ترتيب علامات ضبط مختلف. لا تجري تسوية Unicode لإخفاء الفرق.
- شُغّل `python scripts/validate_maryam.py` فعليًا: PASS، 98 آية مطابقة، 13 مقطعًا، 327 tooltip، و112 محررًا وروابط سليمة. هذا لا يثبت توثيق كل معنى علميًا.
- لا سورة صُنّفت ready_for_code أو verified. الموجود محفوظ ومجمّد، ومراجعة المحتوى وفق القواعد الجديدة تنتظر عملًا مستقلًا بإذن مكتوب لأي تعديل.

## ما قُرئ فعلًا وحدود القراءة

قُرئت المراجع الخمسة كاملة، وقائمة السور، وجميع ملفات info.json الـ22. قورنت مقدمة وجميع محاور البقرة ومريم والنبأ والملك من حيث حقولها وعناوينها ونطاقاتها ومعرّفاتها والمفردات ومحرراتها. حللت آليًا نصوص التلاوة في جميع صفحات المحاور، ولم أراجع علميًا كل معنى أو حديث في السور القديمة. قُرئ ملف بيانات القرآن آليًا للتحقق من الأعداد والمطابقة، لا ادعاء تدبر نصه كله. استُعرضت الأجزاء المتصلة بالتخزين والفهرس وخرائط المجلدات والألوان والتسجيل في `assets/tadabbur-engine.js` و`assets/tadabbur-toc.js` و`surah.html` و`index.html`؛ ليست مراجعة شاملة للتطبيق. لم يوجد AGENTS.md في الملفات المتعقبة المفحوصة.

قائمة المراجع المقروءة كاملة:

- `project-docs/README.md`
- `project-docs/template.html`
- `project-docs/paragraph-order.md`
- `project-docs/notes.md`
- `project-docs/maryam-plan.md`
- `data/surahs-list.json`
- `assets/quran-data.js`
- `assets/mutaffifin-content.js`
- `scripts/validate_maryam.py`

ملفات info.json المقروءة كاملة:

- `surahs/002-baqarah/info.json`
- `surahs/014-ibrahim/info.json`
- `surahs/019-maryam/info.json`
- `surahs/049-al-hujurat/info.json`
- `surahs/067-al-mulk/info.json`
- `surahs/068-al-qalam/info.json`
- `surahs/069-al-haqqah/info.json`
- `surahs/070-al-maarij/info.json`
- `surahs/071-nuh/info.json`
- `surahs/072-al-jinn/info.json`
- `surahs/073-al-muzzammil/info.json`
- `surahs/074-al-muddaththir/info.json`
- `surahs/075-al-qiyamah/info.json`
- `surahs/076-al-insan/info.json`
- `surahs/077-al-mursalat/info.json`
- `surahs/078-al-naba/info.json`
- `surahs/079-al-naziat/info.json`
- `surahs/080-abasa/info.json`
- `surahs/081-at-takwir/info.json`
- `surahs/082-al-infitar/info.json`
- `surahs/083-al-mutaffifin/info.json`
- `surahs/096-al-alaq/info.json`

## البنية الفعلية

سورة ← صفحة مقدمة مستقلة + محاور/صفحات ← مقاطع `.sub-block` ← نص آيات ومعاني وملاحظات. صفحة `01-muqaddimah.html` في البقرة **محور آيات 1–20** وليست صفحة المقدمة؛ المقدمة الفعلية `00-muqaddimat-alsurah.html`.

`info.json` يحوي `id,name_ar,type,total_verses,muqaddimah,mahawir`؛ المقدمة `file,title`؛ المحور `file,title,range,color,subsections`؛ المقطع في الفهرس `title,range` فقط. المعرّف الجديد للمقطع غير موجود في info القديمة. النطاق القديم يقبل `188` كما يقبل `20-20`؛ العقد يوحد الجديد إلى a-b دون تغيير القديم.

في HTML: `body[data-surah][data-mahwar]` يحدد هوية التخزين، و`data-note-group` يحدد مجموعة الملاحظة. صيغها مختلفة: `tadabbur-sub1` و`tafsir-1-1` في البقرة، و`tadabbur-19-1-6` و`tafsir-19-1` في مريم، و`tadabbur-67-1a` و`tafsir-67-1-3-4` في الملك. لا إعادة تسمية أو تطبيع لهذه الهويات. الهايلايت يحفظ innerHTML تحت `quran-tadabbur-hl-${SURAH_ID}-${MAHWAR_ID}`.

المقدمة: بطاقات النوع والترتيب وعدد الآيات والكلمات، فقرتا تعريف، فضل السورة، سرد أبرز الموضوعات، تدبر شخصي فارغ. الفضل في مريم بلا حديث متحقق مُدرج؛ في النبأ نص ينفي ثبوت فضل خاص، وفي الملك والبقرة نصوص أحاديث وإحالات تحتاج تحققًا مستقلًا. نقل الموجود هنا ليس تصحيحًا أو تضعيفًا للأحاديث.

| المقارنة | البقرة | مريم | النبأ | الملك |
|---|---|---|---|---|
| المحاور / المقاطع | 8 / 59 | 6 / 13 | 3 / 3 | 4 / 5 |
| المفردات | 1117 tooltip | 327 tooltip | 77 tooltip | 46 glossary-item |
| المعنى التفصيلي الجاهز المرصود | 0 كتلة tafsir-text | 0 | 40 كتلة | 22 كتلة؛ بعضها لعدة آيات |
| المرجع للنسخ | الهيكل المرجعي، لا نسخ نصوصه حرفيًا كقرآن أصلي | مرجع تطابق النص وحقول فارغة | شاهد لنمط tooltip لا شهادة مطابقة | شاهد النمط القديم فقط |

الألوان المسموحة بالعقد: `pink, purple, gold, green, coral, teal, blue`. لكن COLOR_MAP الفعلية في `surah.html` تعرف أربعة فقط: purple/teal/coral/pink؛ gold/green/blue تحتاج دعمًا تقنيًا لاحقًا، لا تغييرًا علميًا أو تعديلًا الآن.

## التعارضات والقرارات المقترحة — لم تُنفذ

| القرار | الدليل والتعارض | المقترح وحدود التنفيذ |
|---|---|---|
| D01 | 19 سورة glossary مقابل معيار tooltip الجديد | إبقاء الـ22 محمية، وتطبيق الجديد على الـ92 فقط؛ أي ترحيل قديم مشروع مستقل بقرار مكتوب وحفظ بيانات المستخدم |
| D02 | تفصيل جاهز في النبأ/الملك و`MUTAFFIFIN.detail`، وتجميع آيات في محرر الملك | الفراغ وآية لكل محرر في الجديد؛ طلب إذن منفصل قبل إزالة محتوى قديم أو تغيير هوياته |
| D03 | القالب يتيح معنى إجمالي و3–4 مفردات/آية | استبعاد المعنى الإجمالي من الإصدار الأول، واعتبار الكثافة وصفية لا حصة حشو؛ مراجعة كل غريب بالفعل |
| D04 | القالب يتيح عبارة متعددة الكلمات؛ القاعدة الجديدة تعين الكلمة وورودها | كلمة مفردة في v1؛ اعتماد توسعة صريحة للتراكيب إن أراد المستخدم، بلا تقسيم آلي للتراكيب |
| D05 | مصادر عامة لا تربط كل لفظ بموضع؛ عدم ثبوت كفاية ابن كثير لكل غريب | توثيق موضعي والتحقق قبل readiness؛ مصدر مساعد لغوي مقترح أدناه ينتظر الموافقة |
| D06 | اختلافات رسم/ضبط في القديم؛ المطففين لها نص مستقل عن quran-data.js | منع نسخ النص من الصفحات القديمة للجديد؛ لا تصحيح للقديم دون قرار وخطة لحماية الهايلايت |
| D07 | خمسة عناوين في المطففين تختلف بين info وJS، مع غياب tadabbur-toc من صفحتي محوريها | تسجيل خلل محتوى/فهرس؛ إصلاح القديم ممنوع الآن، وتوليد الاثنين من العقد في الجديد |
| D08 | القالب يكرر المحرك آخر الصفحة ويضعه في head دون defer، مقابل مريم | المولّد لاحقًا يحمل المحرك والفهرس مرة واحدة مع توافر body؛ لا تعديل القالب في هذه المهمة |
| D09 | COLOR_MAP لا يدعم الألوان السبعة، والتعريفات النصية والـslugs غير موحدة | دعم الألوان تقنيًا لاحقًا مع تثبيت مسارات الجديد وفق التطبيق، دون إعادة تسمية القديم |
| D10 | نص تنبيه المطففين مختصر مقارنة بالتنبيه الكامل | استخدام النص الكامل الموجود في البقرة ومريم والقالب للجديد فقط |
| D11 | القالب يطلب اعتماد خطة السورة قبل HTML | لا تجاوز لاعتماد الخطة؛ تثبيت قرار المستخدم في review.plan_approval ثم تسليم JSON المراجع للبرمجة |

اختلافات المطففين الخمسة بالنطاق: 7–12، 13–17، 18–21، 22–28، 29–36. مصادرها `surahs/083-al-mutaffifin/info.json` و`assets/mutaffifin-content.js`؛ لم أختَر أي العنوانين أصح.

## المصادر: ما فُتح وما لم يُراجع

1. **المصدر المعتمد في مريم بحسب maryam-plan.md:** تفسير القرآن العظيم لابن كثير عبر [quranpedia.net/surah/1/19/book/136](https://quranpedia.net/surah/1/19/book/136). فُتح في هذه المهمة، وشوهدت بيانات الكتاب ومقدمة السورة ومواضع من تفسير الآيات 1–6، ومنها مناقشة الموالي والميراث. مصدر تفسير سياقي مفيد، لكن هذا الاطلاع المحدود لا يثبت أنه يغطي كل لفظ غريب في 92 سورة، ولا يصح اعتماد 327 معنى في مريم بمجرد الرابط العام. يلزم تتبع كل لفظ وموضعه؛ كفايته اللغوية الشاملة **غير مثبتة**، لا حكم بأنه عديم الفائدة اللغوية.
2. **D05، مقترح غير معتمد:** [غريب القرآن لابن قتيبة، سورة مريم](https://quranpedia.net/surah/1/19/book/341). فُتح وشوهد اسم المؤلف والمحقق ومداخل لغوية مختصرة، مع مواضع تعلن عدم وجود تفسير. يصلح مرشحًا مساعدًا، ولا ضمان لتغطيته كل غريب أو موافقته كل اختيار سياقي. لا تعميم ولا استخدامه لإنتاج معانٍ قبل موافقتك؛ التعارض يرفع للمراجعة.
3. فُتحت [صفحة ابن كثير لسورة النور](https://quranpedia.net/surah/1/24/book/136) للتحقق من إتاحة المرجع للسورة التجريبية. لم تُراجع كامل السورة ولا تُنتج معانيها أو تقسيمها، ولا يُعد ذلك تصريح جاهزية.

تاريخ الاطلاع على الصفحات الثلاث 2026-10-17 (القاهرة). لا تحقّق أحاديث فضائل في هذه المهمة. إذا تعذر المصدر في مهمة لاحقة: يحدد URL والموضع المطلوب، ويسجل unverified/blocked ويتوقف؛ لا بديل غير معتمد.

## جدول السور الـ114

الحالة هنا حالة العمل في المسار الجديد. «ينتظر المراجعة / محمي» يعني موجودًا سابقًا، وليس قبولًا علميًا جديدًا ولا إذنًا بتعديله. «مطابق X/N» يصف فحص سلسلة Unicode بعد تجاهل الفراغات فقط؛ الأعداد والترتيب مفحوصة مستقلة عنه. أساس غير الموجود: رقم السورة في القائمة وغياب مجلد محتواها وinfo وصفحاتها من لقطة المستودع، لا مجرد غيابها من READY_SURAHS.

| # | السورة | الحالة | النمط | المحاور | المقاطع | أساس الحكم والتغطية |
|---|---|---|---|---:|---:|---|
| 001 | الفاتحة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/7؛ B008 |
| 002 | البقرة | ينتظر المراجعة / محمي | tooltips | 8 | 59 | `surahs/002-baqarah`؛ تغطية 286/286؛ مطابق 27/286 |
| 003 | آل عمران | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/200؛ B031 |
| 004 | النساء | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/176؛ B032 |
| 005 | المائدة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/120؛ B033 |
| 006 | الأنعام | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/165؛ B034 |
| 007 | الأعراف | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/206؛ B035 |
| 008 | الأنفال | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/75؛ B009 |
| 009 | التوبة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/129؛ B036 |
| 010 | يونس | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/109؛ B037 |
| 011 | هود | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/123؛ B038 |
| 012 | يوسف | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/111؛ B039 |
| 013 | الرعد | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/43؛ B018 |
| 014 | ابراهيم | ينتظر المراجعة / محمي | glossary | 5 | 12 | `surahs/014-ibrahim`؛ تغطية 52/52؛ مطابق 0/52 |
| 015 | الحجر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/99؛ B030 |
| 016 | النحل | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/128؛ B040 |
| 017 | الإسراء | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/111؛ B041 |
| 018 | الكهف | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/110؛ B042 |
| 019 | مريم | ينتظر المراجعة / محمي | tooltips | 6 | 13 | `surahs/019-maryam`؛ تغطية 98/98؛ مطابق 98/98 |
| 020 | طه | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/135؛ B043 |
| 021 | الأنبياء | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/112؛ B044 |
| 022 | الحج | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/78؛ B026 |
| 023 | المؤمنون | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/118؛ B045 |
| 024 | النور | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/64؛ B009 |
| 025 | الفرقان | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/77؛ B025 |
| 026 | الشعراء | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/227؛ B046 |
| 027 | النمل | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/93؛ B029 |
| 028 | القصص | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/88؛ B028 |
| 029 | العنكبوت | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/69؛ B024 |
| 030 | الروم | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/60؛ B022 |
| 031 | لقمان | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/34؛ B016 |
| 032 | السجدة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/30؛ B015 |
| 033 | الأحزاب | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/73؛ B024 |
| 034 | سبإ | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/54؛ B020 |
| 035 | فاطر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/45؛ B018 |
| 036 | يس | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/83؛ B027 |
| 037 | الصافات | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/182؛ B047 |
| 038 | ص | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/88؛ B028 |
| 039 | الزمر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/75؛ B025 |
| 040 | غافر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/85؛ B027 |
| 041 | فصلت | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/54؛ B021 |
| 042 | الشورى | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/53؛ B020 |
| 043 | الزخرف | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/89؛ B029 |
| 044 | الدخان | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/59؛ B022 |
| 045 | الجاثية | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/37؛ B017 |
| 046 | الأحقاف | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/35؛ B016 |
| 047 | محمد | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/38؛ B017 |
| 048 | الفتح | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/29؛ B014 |
| 049 | الحجرات | ينتظر المراجعة / محمي | glossary | 2 | 4 | `surahs/049-al-hujurat`؛ تغطية 18/18؛ مطابق 0/18 |
| 050 | ق | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/45؛ B019 |
| 051 | الذاريات | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/60؛ B023 |
| 052 | الطور | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/49؛ B019 |
| 053 | النجم | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/62؛ B023 |
| 054 | القمر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/55؛ B021 |
| 055 | الرحمن | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/78؛ B026 |
| 056 | الواقعة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/96؛ B030 |
| 057 | الحديد | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/29؛ B015 |
| 058 | المجادلة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/22؛ B013 |
| 059 | الحشر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/24؛ B014 |
| 060 | الممتحنة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/13؛ B012 |
| 061 | الصف | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/14؛ B012 |
| 062 | الجمعة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/11؛ B010 |
| 063 | المنافقون | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/11؛ B010 |
| 064 | التغابن | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/18؛ B013 |
| 065 | الطلاق | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/12؛ B011 |
| 066 | التحريم | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/12؛ B011 |
| 067 | الملك | ينتظر المراجعة / محمي | glossary | 4 | 5 | `surahs/067-al-mulk`؛ تغطية 30/30؛ مطابق 1/30 |
| 068 | القلم | ينتظر المراجعة / محمي | glossary | 4 | 7 | `surahs/068-al-qalam`؛ تغطية 52/52؛ مطابق 16/52 |
| 069 | الحاقة | ينتظر المراجعة / محمي | glossary | 3 | 7 | `surahs/069-al-haqqah`؛ تغطية 52/52؛ مطابق 8/52 |
| 070 | المعارج | ينتظر المراجعة / محمي | glossary | 3 | 4 | `surahs/070-al-maarij`؛ تغطية 44/44؛ مطابق 4/44 |
| 071 | نوح | ينتظر المراجعة / محمي | glossary | 2 | 5 | `surahs/071-nuh`؛ تغطية 28/28؛ مطابق 1/28 |
| 072 | الجن | ينتظر المراجعة / محمي | glossary | 2 | 4 | `surahs/072-al-jinn`؛ تغطية 28/28؛ مطابق 1/28 |
| 073 | المزمل | ينتظر المراجعة / محمي | glossary | 2 | 3 | `surahs/073-al-muzzammil`؛ تغطية 20/20؛ مطابق 1/20 |
| 074 | المدثر | ينتظر المراجعة / محمي | glossary | 3 | 6 | `surahs/074-al-muddaththir`؛ تغطية 56/56؛ مطابق 13/56 |
| 075 | القيامة | ينتظر المراجعة / محمي | glossary | 4 | 7 | `surahs/075-al-qiyamah`؛ تغطية 40/40؛ مطابق 10/40 |
| 076 | الانسان | ينتظر المراجعة / محمي | glossary | 3 | 5 | `surahs/076-al-insan`؛ تغطية 31/31؛ مطابق 1/31 |
| 077 | المرسلات | ينتظر المراجعة / محمي | glossary | 4 | 8 | `surahs/077-al-mursalat`؛ تغطية 50/50؛ مطابق 15/50 |
| 078 | النبإ | ينتظر المراجعة / محمي | tooltips | 3 | 3 | `surahs/078-al-naba`؛ تغطية 40/40؛ مطابق 7/40 |
| 079 | النازعات | ينتظر المراجعة / محمي | glossary | 2 | 4 | `surahs/079-al-naziat`؛ تغطية 46/46؛ مطابق 7/46 |
| 080 | عبس | ينتظر المراجعة / محمي | glossary | 3 | 6 | `surahs/080-abasa`؛ تغطية 42/42؛ مطابق 12/42 |
| 081 | التكوير | ينتظر المراجعة / محمي | glossary | 2 | 6 | `surahs/081-at-takwir`؛ تغطية 29/29؛ مطابق 6/29 |
| 082 | الإنفطار | ينتظر المراجعة / محمي | glossary | 2 | 4 | `surahs/082-al-infitar`؛ تغطية 19/19؛ مطابق 4/19 |
| 083 | المطففين | ينتظر المراجعة / محمي | glossary | 2 | 6 | `surahs/083-al-mutaffifin`؛ تغطية 36/36؛ مطابق 0/36؛ فحص ناتج JS؛ 5 عناوين مختلفة |
| 084 | الإنشقاق | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/25؛ B004 |
| 085 | البروج | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/22؛ B004 |
| 086 | الطارق | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/17؛ B005 |
| 087 | الأعلى | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/19؛ B005 |
| 088 | الغاشية | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/26؛ B006 |
| 089 | الفجر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/30؛ B006 |
| 090 | البلد | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/20؛ B007 |
| 091 | الشمس | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/15؛ B007 |
| 092 | الليل | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/21؛ B008 |
| 093 | الضحى | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/11؛ B003 |
| 094 | الشرح | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/8؛ B002 |
| 095 | التين | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/8؛ B002 |
| 096 | العلق | ينتظر المراجعة / محمي | glossary | 1 | 3 | `surahs/096-al-alaq`؛ تغطية 19/19؛ مطابق 0/19 |
| 097 | القدر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/5؛ B001 |
| 098 | البينة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/8؛ B003 |
| 099 | الزلزلة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/8؛ B003 |
| 100 | العاديات | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/11؛ B003 |
| 101 | القارعة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/11؛ B003 |
| 102 | التكاثر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/8؛ B003 |
| 103 | العصر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/3؛ B001 |
| 104 | الهمزة | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/9؛ B003 |
| 105 | الفيل | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/5؛ B001 |
| 106 | قريش | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/4؛ B001 |
| 107 | الماعون | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/7؛ B002 |
| 108 | الكوثر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/3؛ B001 |
| 109 | الكافرون | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/6؛ B002 |
| 110 | النصر | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/3؛ B001 |
| 111 | المسد | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/5؛ B002 |
| 112 | الإخلاص | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/4؛ B001 |
| 113 | الفلق | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/5؛ B002 |
| 114 | الناس | لم يبدأ | غير موجودة | 0 | 0 | غياب محتوى السورة؛ 0/6؛ B002 |


## سجل الأدلة وإعادة الفحص

الإجراء: قراءة JSON لكل سورة؛ استخراج `.verses-text` من كل مقطع بترتيب الصفحة والفهرس؛ فك HTML ثم استخراج أرقام الآيات العربية/الإنجليزية بين الأقواس، ومقارنتها بالتسلسل الكامل وبنطاق المقطع. مقارنة كل نص مستخرج بالأصل بعد إسقاط الأقواس المضافة والترقيم والفراغات دون تطبيع الحركات. النمط يُحكم من العناصر الفعلية `.wq` أو `.glossary-item`، لا أسماء CSS. المطففين تستثنى من الفحص الساكن بتشغيل renderer كما سبق. لا استنتاج لصحة HTML من توازن أعداد الوسوم، ولا اختبارات متصفح في نطاق المهمة.

الـ92 صفحة أدناه قُرئت آليًا؛ الصفحات التابعة للبقرة/مريم/النبأ/الملك قورنت حقولها كما سبق. البصمات SHA-256 لبايتات الملفات تحفظ خط أساس حماية القديم، ولا تعد تقريرًا علميًا. تفصيل اختلافات النص المسجلة محفوظ أيضًا في legacy.audit داخل progress-content.json.

| الملف | SHA-256 |
|---|---|
| `project-docs/README.md` | `86fdf61c2eb0242011854208a563812d5840d5705a184addb65629a985d08a7f` |
| `project-docs/template.html` | `cacff54b4bda4ea8363928b158c6ee51efa527ca3a2db24b596a3984784f604d` |
| `project-docs/paragraph-order.md` | `ce35dd5d62aaf7c75755b47e78ebc26156c46cf12233c21f42261f6dd8219856` |
| `project-docs/notes.md` | `69c9013f3eb8e915b0a368bf1270b15c86be7b858cca9ed74b682b777f0f0ae7` |
| `project-docs/maryam-plan.md` | `3831d920a23a7286f60baccfb26611daf8aad68a1d2476229df7d919eb90a8f1` |
| `data/surahs-list.json` | `0878d3a79c6dc0310755612d347a33ee2edebb731d59cdc27707bc2c4091d413` |
| `assets/quran-data.js` | `3ff1d9efd27acefc7d01e67ec6d4a6857e9051548d05468bd4bf3b702f4bc5c3` |
| `assets/mutaffifin-content.js` | `5f55084c9c73d7f5ec676ecc5f78e3db7210167fbe7b3104e2010c67a8df30ab` |
| `scripts/validate_maryam.py` | `7c2ca71c00387f3fff03c192fed50b891b0ec04e38e13eaf13ca8b68ea866a35` |
| `surahs/002-baqarah/info.json` | `9681b24258035abf998a949e3836fd523b77323168e929c07d5ef7f1193202f1` |
| `surahs/014-ibrahim/info.json` | `b5c62a35e1f19077e5790d791291e586106423ad5e1f63aafa954cb76b7742db` |
| `surahs/019-maryam/info.json` | `8d6f150f53a2a4ded8e59036929ac40eed9e66e8067de77f5426c62aaca74e34` |
| `surahs/049-al-hujurat/info.json` | `09840f98ae5184c1b191e232c56ec2c65e2b03e127fc96813fe07c97d07d87d7` |
| `surahs/067-al-mulk/info.json` | `b7caf8298239e69ed994796d79633413a7026f8e072ac108ef1b5835c03923ab` |
| `surahs/068-al-qalam/info.json` | `4abdf496b399ad31bad4357c25effa2c2842f9074eb73a8433a6f2708050664b` |
| `surahs/069-al-haqqah/info.json` | `67548b31c90b30f0d473fde770c9732699f9adf3b7ff993ee3bf27264174ecfd` |
| `surahs/070-al-maarij/info.json` | `1c6177097add7af68a00f59f594ea9a6f57e3fc820485a4492004c2b1b2049e3` |
| `surahs/071-nuh/info.json` | `6840ae5db06e20bf228914669e595e9bf8fd9f30c0db2b40392fbf5212628483` |
| `surahs/072-al-jinn/info.json` | `0fd3f6e58414e1e3f1af488d5c0d7b6f48eda967d9ebfe6b2c7389368177d1bf` |
| `surahs/073-al-muzzammil/info.json` | `95f71bc002d9eec697358d8e1c0203d657ff860a5f3eb1ff0d19ea6ac94112a7` |
| `surahs/074-al-muddaththir/info.json` | `2511ec1af7893489c33112fd651993e45da865fb2e6fd68f3ce2da91c78f42f1` |
| `surahs/075-al-qiyamah/info.json` | `c9fedccef0ebe4466c835f716e0e3fa53d9cbd0927a41e63e1cf4299a56c9b6e` |
| `surahs/076-al-insan/info.json` | `30a9ce7076f9627319d6273eea7e79092e7418fbf572412f114252b0e7c61d83` |
| `surahs/077-al-mursalat/info.json` | `5e653431c6d60932e7a88f7b136c69e073e77262764917abb1e036fa31278eb4` |
| `surahs/078-al-naba/info.json` | `466fc0d0571edfbe973a4e60ef64654dcf57a41018c42a1a492ab45bedbac02f` |
| `surahs/079-al-naziat/info.json` | `99f48ce0a2a99220996520c5f0b4fd78335be0eb9fb05c5e096d6f1f7b4c90d1` |
| `surahs/080-abasa/info.json` | `5092c4908b517de889bc0dd54666a7865225bb4cbff088ce4a969b070609edfa` |
| `surahs/081-at-takwir/info.json` | `e97ffe0ba9946caff148cbd19e3029d348ae0a0858254c568eae77c5becf2638` |
| `surahs/082-al-infitar/info.json` | `ee5a55b69e5dbcd8f97580f10a2209a4b9c7dbd3a47485a81c670ff07ef8772b` |
| `surahs/083-al-mutaffifin/info.json` | `2d4d800c603859198940cd3bfb1e882bbd77f7e69491b97a1c709ca67eec0a90` |
| `surahs/096-al-alaq/info.json` | `4c4530104d66811e60f908c1bea2cd5229d90338a1b609d051a80163fdc3ba59` |
| `surahs/002-baqarah/mahawir-pages/00-muqaddimat-alsurah.html` | `2a90d20677214e1f5615ebf00ee786690a6cdfefb113ced1e59e972297e4369d` |
| `surahs/002-baqarah/mahawir-pages/01-muqaddimah.html` | `fd7bcd4649f16250bf44da64afb5874a02316f6445fa59e20f470cc5fd35f3aa` |
| `surahs/002-baqarah/mahawir-pages/02-adam-bani-israel.html` | `ac0abcf1cb94eac059fafbbfb8a74dae567b241a5d2e399f7bf3e97f68de01e1` |
| `surahs/002-baqarah/mahawir-pages/03-qiblah-sabr.html` | `c8ae7b9005c8d1ed51602579e346f4112ecdb1f0cd27f133e0d72787d0064d0c` |
| `surahs/002-baqarah/mahawir-pages/04-halal-haram.html` | `8c646a36beb75b60458b3cbd8e21cb4421d6c440a628d29df3ec3b920bb43289` |
| `surahs/002-baqarah/mahawir-pages/05-hajj-qital-talaq.html` | `5ca22d605172f4b89e2dadf545cbb3b343939dcfc3fab8cfa22fd4b4aae8fe13` |
| `surahs/002-baqarah/mahawir-pages/06-qasas-kursi.html` | `a6f08a47207cb361ae97a1cfda0361cfad4026ff35ce8d2f2174b4e9c1f91d60` |
| `surahs/002-baqarah/mahawir-pages/07-infaq-riba-dayn.html` | `0fa5a46787ebca6124c245a8f7d44027c0381c059f3e6dfeb701926628136aad` |
| `surahs/002-baqarah/mahawir-pages/08-khatimah.html` | `b0ee910930065f65a8920fa586a21ab7ba70942c8b3c282d70890b933e902a0e` |
| `surahs/014-ibrahim/mahawir-pages/00-muqaddimat-alsurah.html` | `aab1b6f1ac0a35e6b11999d55a07ec0d87cd8fe69accb6cd0385aaf32d826d92` |
| `surahs/014-ibrahim/mahawir-pages/01-maqsad-alrrisala-waqissat-musa-maa-qawmih.html` | `d7b5298ef0a1407693cf0db1fe711feaa2247cdf041c4443ac145438e39bcfed` |
| `surahs/014-ibrahim/mahawir-pages/02-istikbar-alumam-ala-rusulihim.html` | `f910de77b6e1b0c458a09142a0134707e29ebc671db8ce378a8b34d3f8e308d0` |
| `surahs/014-ibrahim/mahawir-pages/03-amthal-almukadhibin-wamashhad-alqiyama.html` | `559f6a9827c04ce45bec3e9ebc519dd113fa290110aa521c7e14b0ea04ec569a` |
| `surahs/014-ibrahim/mahawir-pages/04-juhud-alniam-wadhikruha.html` | `1868fc70000189c1ce7890fb68565d80d758a346f26dd11005b92569c588ac35` |
| `surahs/014-ibrahim/mahawir-pages/05-duaa-ibrahim-watahdhir-alththalimin.html` | `3f6e506b93fd934b7bcc86b115d11882f2b6263af4469a7c96e2651f0ad5a481` |
| `surahs/019-maryam/mahawir-pages/00-muqaddimat-alsurah.html` | `cb5ec99241d7d808e541b7c45e87189454d2d1b9b3235b9c8bda59b46ecde120` |
| `surahs/019-maryam/mahawir-pages/01-zakariyya-yahya.html` | `5574d9e7c732afb7dfcc640ec3d22f20d5fc1901696995c56df68e9b2a25b7d8` |
| `surahs/019-maryam/mahawir-pages/02-maryam-isa.html` | `f1c050715cd3b746173dd70c7ba61e5b6cb4dc1e5c815267259ea5bb2689afaf` |
| `surahs/019-maryam/mahawir-pages/03-ibrahim-anbiya.html` | `d2928e4611d311d6f3be1de13108d3620f186f62ca6a73aea4d34e438de2f4be` |
| `surahs/019-maryam/mahawir-pages/04-salah-tawbah-bath.html` | `6b1a5bbe556a761b7a20d8e72517e4db2992dda21c2c1a64953bb090a288d5b0` |
| `surahs/019-maryam/mahawir-pages/05-radd-mukadhibin.html` | `389407fac887e09c16d9408a4a7bb61c2e731a4b354ed4d021d023d2d26e3afe` |
| `surahs/019-maryam/mahawir-pages/06-tawhid-khitam.html` | `880787ef9b4e0fd02b30a87bb21ff4eb634e0eaa3578e4f1867705e364fabf34` |
| `surahs/049-al-hujurat/mahawir-pages/00-muqaddimat-alsurah.html` | `4566846f73bb868bb1d394dd22ab2f9351295b58d3a3b1cb1a292f3a5a326489` |
| `surahs/049-al-hujurat/mahawir-pages/01-adab-alukhuwwa-alimaniyya.html` | `0ab491b3adb63314c0d9f6f8cfdb1a42f2940ba9e41799900b7ec44634a84ca4` |
| `surahs/049-al-hujurat/mahawir-pages/02-haqiqat-aliman-wakhitam-alssura.html` | `a88f3f6c5184b2d66b1332645263d95194522e595cb02e76963821abf3841712` |
| `surahs/067-al-mulk/mahawir-pages/00-muqaddimat-alsurah.html` | `2ba1191d5f32a67e3b40b518ae9ac7b619f9f40e1c1a2045a235ddff6775d49e` |
| `surahs/067-al-mulk/mahawir-pages/01-azmat-almulk-waqudrat-allah.html` | `6b6b611a2b7ddb93ca7d86a30eb31d989a3900a430cfea55f993141cb4aff722` |
| `surahs/067-al-mulk/mahawir-pages/02-adhab-jahannam-wahiwar-ahliha.html` | `c4e28ed3d8478cfb7683888456b59bdcaeaaade604941265e0a84c2370ae7657` |
| `surahs/067-al-mulk/mahawir-pages/03-maghfirat-alghayb-waayat-alqudrah.html` | `126c1fb8a72693a67bc0052aa71221ccf100062c3657d3529b633dd4578ac1aa` |
| `surahs/067-al-mulk/mahawir-pages/04-istijal-alkuffar-wawahdaniyat-arrizq.html` | `b06ede85ba923779e895b75a0d644e24b42c92a2a96ce53012086bffb533a115` |
| `surahs/068-al-qalam/mahawir-pages/00-muqaddimat-alsurah.html` | `d490fd5495ddc0374fffeb4123ce734dd9a28a08d8594e9aa1bea6f401c86e12` |
| `surahs/068-al-qalam/mahawir-pages/01-alqasam-bilqalam-watanzih-arrasul.html` | `d98c0f338e66eed98f0518a255268400db9529c00fa0c0fe878dc5c98cb692d0` |
| `surahs/068-al-qalam/mahawir-pages/02-qissat-ashab-aljannah.html` | `9c59bb0bff08c42cfe8e965c6b58e587bd16c698577451249ea0ccea2dfdbc55` |
| `surahs/068-al-qalam/mahawir-pages/03-jazaa-almuttaqin-wadalal-hujaj-alkuffar.html` | `8f218da529b5b1e2eb396ebdc5a682469281eaac5761dcf5e850fb0b0eea7804` |
| `surahs/068-al-qalam/mahawir-pages/04-sabr-annabi-waqissat-yunus.html` | `a49c8b7ff0cb3dd4fc19a62a8c21efcdfd3f5c41eec3847b4ec42cc3f2f7f53a` |
| `surahs/069-al-haqqah/mahawir-pages/00-muqaddimat-alsurah.html` | `7300a08c8a57270c4d4342feffc9e0f8a5b927bf0a3d7fd70a6ea7b7babcc994` |
| `surahs/069-al-haqqah/mahawir-pages/01-al-haqqah-ahwal-alqiyamah.html` | `493be52683704b948485647d7d8cba201d178ef0020173f2932cc6badbd32a9b` |
| `surahs/069-al-haqqah/mahawir-pages/02-ashab-alyamin-washshimal.html` | `4b5cd23753ccc5f2e2606b62330a4c8289c8d730ddf63754be2ebf51f45db12e` |
| `surahs/069-al-haqqah/mahawir-pages/03-alquran-haqq-watanzih-arrasul.html` | `2f656ae0e9a083760b4ef2294959e8ec2c0d7092215b151dd296b786632a3e9e` |
| `surahs/070-al-maarij/mahawir-pages/00-muqaddimat-alsurah.html` | `1ce02a590043e30758572dd2fc1a155b46c08f79ad60094f2d68cb0729729429` |
| `surahs/070-al-maarij/mahawir-pages/01-assual-an-aladhab-waahwal-alqiyamah.html` | `4f2644d9080ec56095766f206e849fb84f6e28d083b1ecfc7096404ff5cc8336` |
| `surahs/070-al-maarij/mahawir-pages/02-tab-alinsan-wasifat-almusallin.html` | `68d6cbb77bcbc257eb4d5e48d6ba3a5b84b2a87545ef3f048222bdd106806000` |
| `surahs/070-al-maarij/mahawir-pages/03-takdhib-alkuffar-waindharuhum.html` | `0999f6aadde11c5b3dbf9983fc1c65095a5f87c5dcbded0c98f42db7e5220e59` |
| `surahs/071-nuh/mahawir-pages/00-muqaddimat-alsurah.html` | `a73d3cd271a7d4fd93c48f6dde7ebe3c067133544abb702aaeac0d2bfa8c9bd1` |
| `surahs/071-nuh/mahawir-pages/01-dawah-nuh-al-ula-waasalibuha.html` | `1af98635ad1deb18d38bcfd1fbfe9d944a14f6088cb99a121c90c2ceb190967d` |
| `surahs/071-nuh/mahawir-pages/02-shakwa-nuh-wadu-uh-ala-qawmih.html` | `65272e3633b379e4c68a04689f440732539e3f92383791bc56de6db7ccddb990` |
| `surahs/072-al-jinn/mahawir-pages/00-muqaddimat-alsurah.html` | `7471f49d896501372b9f044ff7c972fa412c707f71b944a06e9d6539ca673206` |
| `surahs/072-al-jinn/mahawir-pages/01-istima-al-jinn-lilquran-waimanuhum.html` | `3748f32b41c1da09c2e39eb436401185890c591bf7189586b7837b121561cadf` |
| `surahs/072-al-jinn/mahawir-pages/02-huras-alssamaa-waghayb-allah.html` | `951d38220464426ed65caefc5c96210ab39d06d14a594fda3a22c0e0a4b045b0` |
| `surahs/073-al-muzzammil/mahawir-pages/00-muqaddimat-alsurah.html` | `d7bd31ac1dbeae37981c3897edb4c85bba0959a0af2dc84bca60268bc8a42215` |
| `surahs/073-al-muzzammil/mahawir-pages/01-qiyam-allayl-waistidad-alnnabi-lihaml-abaa-alrrisala.html` | `23ad383903a98894a9e8ea84e0c940d099fae7363c17d644267ff2269f18619a` |
| `surahs/073-al-muzzammil/mahawir-pages/02-attakhfif-fi-qiyam-allayl-waahkam-mutafarriqa.html` | `f1318d0bda10c96e2ac214cf0d78a6bc3b63091f5aa7807a4d3d7b7d9a202cbb` |
| `surahs/074-al-muddaththir/mahawir-pages/00-muqaddimat-alsurah.html` | `47aa6d9f6a9b205ef777096ca703f3fa9e58527f88a3948167da672770466718` |
| `surahs/074-al-muddaththir/mahawir-pages/01-alamr-bilindhar-watakbir-allah-wahajr-alrrijz.html` | `b21dc416c654984a291fd360a74666cf644fceca10b3092d5be8da9511d4d052` |
| `surahs/074-al-muddaththir/mahawir-pages/02-qissat-alwalid-bin-almughira-wajuhuduh.html` | `c2158d02a8a08b13f3bfb0bc1a6ad22364bfa406872d984e4c9579b29b4cb4b1` |
| `surahs/074-al-muddaththir/mahawir-pages/03-alqasam-wahiwar-ahl-aljanna-walmujrimin.html` | `7310bf25214ee0e1e4900f76cb8e601f7c842c4053240d880ded980c0cb4e40f` |
| `surahs/075-al-qiyamah/mahawir-pages/00-muqaddimat-alsurah.html` | `49e8b0dba5841c24f890c11cc1a060691b799dbaf26ba453f045daf415908c60` |
| `surahs/075-al-qiyamah/mahawir-pages/01-alqasam-biyawm-alqiyama-waithbat-albath.html` | `1e277893c5730b2ff692491118a4add7f741c0b575956d236ac4c4300b058ba8` |
| `surahs/075-al-qiyamah/mahawir-pages/02-annahy-an-alistijal-bilwahy-wahal-alwujuh.html` | `1aa1d18daf9e6102a80659af9fc8c6ef7efba2c75a71535bc941a930922e9768` |
| `surahs/075-al-qiyamah/mahawir-pages/03-mashhad-alihtidar-wahal-almukadhib.html` | `31c1209fb8ec02da6f0e67ad0221a1b4c331a95cb5c9c0b17fc6db122cb3333d` |
| `surahs/075-al-qiyamah/mahawir-pages/04-marahil-khalq-alinsan-dalilan-ala-albath.html` | `977e2e33c1d3f68f5f605d74a06bc04dd2680cb07b4d248ad2665b13c125e777` |
| `surahs/076-al-insan/mahawir-pages/00-muqaddimat-alsurah.html` | `b87361ca4ee82c96d9c0c760c59ab5c933f0037ece92d6edf974757f14992202` |
| `surahs/076-al-insan/mahawir-pages/01-khalq-alinsan-waibtilauh-wasifat-alabrar.html` | `bb0c2166832a1cfc593c41597cc42dc3e2f55ab1084ebab5ed2ca7bf5d471c08` |
| `surahs/076-al-insan/mahawir-pages/02-naim-alabrar-fi-aljanna.html` | `676d2ddb08fe25a50f68254ffa9fe91021f30e680c12fd05a26f05715fb9ecd5` |
| `surahs/076-al-insan/mahawir-pages/03-tawjih-alnnabi-lilssabr-waldhikr-wakhitam-alssura.html` | `ac17aea36264a4bcefcb9195426e21dd8abff2811d741930d8561510a4893659` |
| `surahs/077-al-mursalat/mahawir-pages/00-muqaddimat-alsurah.html` | `c8366aef2e6bebffd17f57d379acd948414ab2b29bd1327c31789004167c6c93` |
| `surahs/077-al-mursalat/mahawir-pages/01-alqasam-bilmursalat-wawuqu-yawm-alfasl.html` | `61feaf88b2fb30b110906c908278f495e658afa90c6effa9bfc5ae0181e2bb83` |
| `surahs/077-al-mursalat/mahawir-pages/02-ihlak-alawwalin-waniam-allah.html` | `16ed9730f299b985d6e3bcd6cda2dc0f505e6224bfb820f5501afc09294c9528` |
| `surahs/077-al-mursalat/mahawir-pages/03-masir-almukadhibin-fi-alnnar.html` | `f55a55ca61b442971c1c63bcca33fa9cc1154eccbf7f2a61ddbb1fc4929d1ef4` |
| `surahs/077-al-mursalat/mahawir-pages/04-jazaa-almuhsinin-wakhitam-alssura.html` | `775ac1d3570b6350c0ee4411ac78d5d4eb0d792fab7e4cb509d7cdde67442f36` |
| `surahs/078-al-naba/mahawir-pages/00-muqaddimat-alsurah.html` | `92ac3c28def64c8182278777cdd64ff6d30689fdaadc87ed4af18e7c8ca429de` |
| `surahs/078-al-naba/mahawir-pages/01-istinkar-alikhtilaf-fi-albath-waayat-allah-alkawniyya.html` | `0ae79692406729be0057c73661e0f2c31c7e9c87c0ab1d0224ece221269a827a` |
| `surahs/078-al-naba/mahawir-pages/02-yawm-alfasl-wamasir-alttaghin.html` | `6c661d2b8d387cce13a656a4f018ad1856fae75ed349e50e2742abd90d68182c` |
| `surahs/078-al-naba/mahawir-pages/03-jazaa-almuttaqin-wakhitam-alssura.html` | `fa3a087962bbd397591e95436665decccf0833d4b35294c7753eca31517c06bd` |
| `surahs/079-al-naziat/mahawir-pages/00-muqaddimat-alsurah.html` | `300f926aa25b355cd667f5695f603cc777348deae13db94e18f0116b210fdfaf` |
| `surahs/079-al-naziat/mahawir-pages/01-alqasam-wayawm-albath-waqissat-musa-maa-firawn.html` | `ae63031c37bff926f6311370d15a001961ca682c71edb4b675d27409f7da294e` |
| `surahs/079-al-naziat/mahawir-pages/02-khalq-alssamaa-waltamma-alkubra.html` | `f4d06ce9b2c6a83f9e095e9865514bb567190a5be0727745343414af8351d158` |
| `surahs/080-abasa/mahawir-pages/00-muqaddimat-alsurah.html` | `456a5640adcfe4185c601e25154dfb29de578c0d0a67e8201f2d517f2f8a80a5` |
| `surahs/080-abasa/mahawir-pages/01-itab-alnnabi-washaraf-alquran.html` | `2bf1e4029642eb9689b0d758d18c68f10766bd11a44f30e87ff0109bf1ff8946` |
| `surahs/080-abasa/mahawir-pages/02-khalq-alinsan-waniamat-alttaam.html` | `bb446d23de717f3b6daba2036b3694e529ed61fb1756d90d4cae44fb64fae727` |
| `surahs/080-abasa/mahawir-pages/03-alssakhkha-wamashhad-alqiyama.html` | `b688f1dda2d21a799cbf5b5fd1ff5f8fd1f38eb73bdcbaeafded35d97bd57d06` |
| `surahs/081-at-takwir/mahawir-pages/00-muqaddimat-alsurah.html` | `69307dc663fcb542fe740611446891b289d3590098d58bd73aae03d585925f20` |
| `surahs/081-at-takwir/mahawir-pages/01-ahwal-alqiyamah-wal-inqilab-alkawni.html` | `e578156d8a04b7546da55df220134e942219d28fe5e369c8cae48258aa2b55b2` |
| `surahs/081-at-takwir/mahawir-pages/02-alqasam-bisidq-alwahy-waamanat-alrasulayn.html` | `04064f773e15ca50160976ceca57783d8d0337a34f3c6717338134dbe83d50d4` |
| `surahs/082-al-infitar/mahawir-pages/00-muqaddimat-alsurah.html` | `e2081297176d6892bd7c0e1cff672fe3e72e1406615b3c3f1281f999e1b2d845` |
| `surahs/082-al-infitar/mahawir-pages/01-mashahid-alqiyamah-watawbikh-alinsan-almughtarr.html` | `2dcbfb296553a536203cff6a75cc2665b468f78685fa4d4ce993f12806a857eb` |
| `surahs/082-al-infitar/mahawir-pages/02-masir-alabrar-walfujjar-yawm-aldeen.html` | `91406772ae2220d56ff0b9b8fe855e73466cf30adbe818093fefe9570d1e0a5e` |
| `surahs/083-al-mutaffifin/mahawir-pages/00-muqaddimat-alsurah.html` | `edf90512142b1c209950fc0e22f05157c91b558a9e96c1d6cf032384998482df` |
| `surahs/083-al-mutaffifin/mahawir-pages/01-wayl-lilmutaffifin-wamasir-alfujjar.html` | `777cde9f7f57f1e94048391e14a375390063a79506e6d575acdd6c6ecb818ab2` |
| `surahs/083-al-mutaffifin/mahawir-pages/02-masir-alabrar-wamashhad-alddahk-yawm-aldeen.html` | `1ae5240c93d3252c4b456d7ffbafae3d0e12cd240899b64644106db33c1c9405` |
| `surahs/096-al-alaq/mahawir-pages/00-muqaddimat-alsurah.html` | `9faefe9a3583dd86205829175e87018b104c47e0c82d92dce8b0d34db479c5bf` |
| `surahs/096-al-alaq/mahawir-pages/01-al-amr-bil-qiraah.html` | `6027c6531ca97f6bc156cd98e4ea6d7d7fdc878f1400e99de643157e6afb68dc` |

المهمة التالية: اعتماد قرارات العقد والمصدر المساعد وترتيب التجربة؛ ثم مهمة محتوى مستقلة لأول دفعة فقط. توقف هنا؛ لا توليد ولا نشر.
