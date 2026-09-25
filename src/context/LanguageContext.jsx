import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export const languages = [
    { code: 'ar', label: 'العربية', nativeShort: 'ع', dir: 'rtl', defaultCurrency: 'OMR' },
    { code: 'en', label: 'English', nativeShort: 'EN', dir: 'ltr', defaultCurrency: 'USD' },
    { code: 'ur', label: 'اردو', nativeShort: 'اردو', dir: 'rtl', defaultCurrency: 'OMR' },
    { code: 'zh', label: '中文', nativeShort: '中', dir: 'ltr', defaultCurrency: 'USD' },
    { code: 'ru', label: 'Русский', nativeShort: 'RU', dir: 'ltr', defaultCurrency: 'USD' },
    { code: 'es', label: 'Español', nativeShort: 'ES', dir: 'ltr', defaultCurrency: 'EUR' },
];

// Exchange rates relative to OMR (base currency)
export const currencies = [
    { code: 'OMR', symbol: 'ر.ع.', flag: '🇴🇲', name: { ar: 'ريال عماني', en: 'Omani Rial', ur: 'عمانی ریال', zh: '阿曼里亚尔', ru: 'Оманский риал', es: 'Rial omaní' }, rate: 1 },
    { code: 'AED', symbol: <img src="/Assets/Fonts/aed.svg" alt="AED" className="inline-block w-[1em] h-[0.75em] object-contain align-middle" />, flag: '🇦🇪', name: { ar: 'درهم إماراتي', en: 'UAE Dirham', ur: 'متحدہ عرب امارات درہم', zh: '阿联酋迪拉姆', ru: 'Дирхам ОАЭ', es: 'Dírham de los Emiratos Árabes Unidos' }, rate: 9.53 },
    { code: 'USD', symbol: '$', flag: '🇺🇸', name: { ar: 'دولار أمريكي', en: 'US Dollar', ur: 'امریکی ڈالر', zh: '美元', ru: 'Доллар США', es: 'Dólar estadounidense' }, rate: 2.60 },
    { code: 'EUR', symbol: '€', flag: '🇪🇺', name: { ar: 'يورو', en: 'Euro', ur: 'یورو', zh: '欧元', ru: 'Евро', es: 'Euro' }, rate: 2.39 },
];

const translations = {
    ar: {
        dir: 'rtl',
        nav: { home: 'الرئيسية', products: 'المنتجات', about: 'عن الشركة', branches: 'الفروع', contact: 'اتصل بنا' },
        hero: {
            tag: 'جودة لا تُضاهى',
            title1: 'مورد موثوق للسيراميك',
            title2: 'والبورسلان والأدوات الصحية',
            subtitle: 'نوفر تشكيلة واسعة من السيراميك والبورسلان المستورد والمحلي والأدوات الصحية، مع خيارات تناسب المشاريع السكنية والتجارية بأعلى معايير الجودة وأسعار تنافسية.',
            btnBrowse: 'تصفح المنتجات',
            btnVideo: 'شاهد الفيديو',
        },
        about: {
            title: 'النجار العالمية للتجارة والمقاولات',
            description: 'من الشركات العالمية الرائدة في مجال استيراد وتصدير السيراميك والبورسلان والأدوات الصحية، يقع مقرها الرئيسي في مَسقط - سلطنة عمان . توفر مَدى كامِلاً من أفضل تَشكيلات السيراميك والبورسلان المستورد وفقاً للمعاير الدولية بتصاميم عصرية راقية للأرضيات والجدران. وتوفر مَدى متكاملاً مِن أجود الأدوات الصحية المتعددة الأنواع والأشكال والأحجام بالإضافة الى الكماليات المُميزة ذات الجودة العالية التي تناسب جميع الأذواق وبأسعار تنافس جميع الشركات.',
            chairmanTitle: 'كلمة الرئيس',
            chairmanText: 'تمتلك الشركة رصيداً قوياً مُنذ تأسيسها في مدينة الشارقة عام 1975، يَعود فضله الكبير الى المُؤسس الكريم والوالد العظيم الفاضل ابراهيم سليمان النجار . الذي عَزز دور الشركة على صَعيد تقديم أفضل مُنتجات السيراميك والبورسلين المستورد ومواد البناء والأدوات الصحية الخاضعة لمقاييس الجودة العالمية.',
            visionTitle: 'رُؤيتنا :',
            visionText: 'نَسعى لأن نَكون أفضل شِرِكات السيراميك تَطوراً ونِمواً عَلى المستوى المَحلي والدولي، وأن نَكون الشريكَ الأفضل والإختيار الأول لِعُملائنا.',
            missionTitle: 'مُهمتنا :',
            missionText: 'تتمثل مُهمتنا في تقديم تجربة استخدام استثنائية، وخلق قيمة ملموسة تَفوق تَوقعات العملاء، لِلمُنتجات التِي نُقدمها وفق أعلى مَعاير الجَودة العالمية.',
            valuesTitle: 'قِيمنا:',
            valuesText: 'إن قيمنا هي حجر الأساس فى تعاملات شركتنا ومن الثوابت التى لا نحيد عنها.',
            valuesList: [
                { title: 'الإلتِزام:', text: 'نحنُ نَحرِص على الإلتزام بتقديم أفضل المُنتجات العالمية.' },
                { title: 'الجودة:', text: 'نَحنُ نختار المُنتجات والخامات ذات التصاميم الحديثة بعناية فائقة.' },
                { title: 'الثِقة والنزاهة:', text: 'تكمن الثروة الحقيقية للشركة في علاقاتها المتينة مع عملائها.' },
                { title: 'التميز:', text: 'نَحنُ نؤمن بأننا ننمو ونزدهر مِن خلال التفرد والتميز بالمنتجات.' },
                { title: 'التنوع:', text: 'نَحنُ نَحترم كل الثقافات والجنسيات والرغبات المختلفة.' },
                { title: 'الاحترام:', text: 'نَحنُ نَحترم جَميع الأذواق والرغبات ونَتعامل باحترام مَع جميع الأفراد.' },
            ],
        },
        contact: {
            title: 'تواصل معنا', subtitle: 'نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو طلبات.',
            infoTitle: 'معلومات التواصل', phoneLabel: 'رقم الهاتف', emailLabel: 'البريد الإلكتروني',
            whatsappLabel: 'واتساب', socialLabel: 'تابعنا على', formTitle: 'أرسل لنا رسالة',
            firstName: 'الاسم الأول', lastName: 'الاسم الأخير', phone: 'رقم الهاتف',
            subject: 'الموضوع', message: 'تفاصيل الرسالة', submit: 'إرسال الرسالة',
            addressTitle: 'الموقع', address: 'طريق المطار، الطابق الثالث، مسقط، سلطنة عمان',
            paymentsTitle: 'طرق الدفع المتاحة',
        },
        admin: {
            sidebar: { dashboard: 'لوحة القيادة', products: 'المنتجات', categories: 'الفئات', branches: 'الفروع', orders: 'الطلبات', hero: 'الواجهة', about: 'محتوى عن الشركة', partners: 'الشركاء', contact: 'التواصل', settings: 'الإعدادات العامة', logout: 'تسجيل الخروج', adminPortal: 'بوابة المسؤول', navigation: 'التنقل' },
            topbar: { searchPlaceholder: 'بحث...', myProfile: 'ملفي الشخصي' },
            dashboard: { totalProducts: 'إجمالي المنتجات', totalCategories: 'إجمالي الفئات', lowStock: 'مخزون منخفض', totalOrders: 'إجمالي الطلبات', recentActivity: 'النشاط الأخير', sales: 'مبيعات', newProduct: 'منتج جديد', newUser: 'مستخدم جديد' },
            categories: { totalCategories: 'إجمالي الفئات', addNewCategory: 'إضافة فئة جديدة', nameEnglish: 'الاسم (بالإنجليزية)', nameArabic: 'الاسم (بالعربية)', add: 'إضافة', translating: 'جاري الترجمة...', reset: 'إعادة ضبط', noCategories: 'لم يتم العثور على فئات', delete: 'حذف', confirmReset: 'هل أنت متأكد من إعادة ضبط جميع الفئات؟' },
            products: { totalProducts: 'إجمالي المنتجات', inStock: 'في المخزن', lowStockLabel: 'مخزون منخفض', addNewProduct: 'إضافة منتج', searchPlaceholder: 'البحث عن منتجات...', all: 'الكل', edit: 'تعديل', delete: 'حذف', noProducts: 'لم يتم العثور على منتجات.', confirmDelete: 'هل أنت متأكد من حذف هذا المنتج؟', confirmReset: 'هل أنت متأكد من إعادة ضبط جميع المنتجات؟' },
            modal: { addProduct: 'إضافة منتج', editProduct: 'تعديل المنتج', basicInfo: 'معلومات أساسية', pName: 'اسم المنتج', pCategory: 'الفئة', pPrice: 'السعر', pStock: 'المخزون', specs: 'المواصفات', addSpec: 'إضافة مواصفة', key: 'الخاصية (مثال: الحجم)', value: 'القيمة', remove: 'إزالة', images: 'الصور والألوان المتوفرة', selectImg: 'اختر صورة', autoTranslate: 'ترجمة تلقائية ✨', save: 'حفظ المنتج', cancel: 'إلغاء' }
        },
        notFound: {
            title: 'الصفحة غير موجودة',
            desc: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
            btn: 'العودة للرئيسية'
        }
    },
    en: {
        dir: 'ltr',
        nav: { home: 'Home', products: 'Products', about: 'About Us', branches: 'Branches', contact: 'Contact' },
        hero: {
            tag: 'Unmatched Quality',
            title1: 'Trusted Supplier of Ceramics,',
            title2: 'Porcelain & Sanitary Ware',
            subtitle: 'We provide a wide selection of imported and local ceramics, porcelain, and sanitary ware, with options for residential and commercial projects at the highest quality standards and competitive prices.',
            btnBrowse: 'Browse Products',
            btnVideo: 'Watch Video',
        },
        about: {
            title: 'Al Najjar International Trading & Contracting',
            description: 'One of the leading international companies in the import and export of ceramics, porcelain, and sanitary ware, headquartered in Muscat, Oman.',
            chairmanTitle: "Chairman's Message",
            chairmanText: "The company has a strong foundation since its establishment in Sharjah in 1975, thanks in large part to the generous founder and great father, the honorable Ibrahim Suleiman Al Najjar.",
            visionTitle: 'Our Vision',
            visionText: 'We strive to be the most developed and growing ceramic company locally and internationally, and to be the best partner and the first choice for our customers.',
            missionTitle: 'Our Mission',
            missionText: 'Our mission is to provide an exceptional user experience and create tangible value that exceeds customer expectations for the products we offer according to the highest international quality standards.',
            valuesTitle: 'Our Values',
            valuesText: 'Our values are the cornerstone in our company\'s dealings and among the constants that we do not deviate from.',
            valuesList: [
                { title: 'Commitment:', text: 'We are keen to commit to providing the best international products.' },
                { title: 'Quality:', text: 'We choose products and materials with modern and diverse designs with great care.' },
                { title: 'Trust and Integrity:', text: 'The true wealth of the company lies in its solid relationships with its customers.' },
                { title: 'Excellence:', text: 'We believe that we grow and prosper through uniqueness and excellence in products.' },
                { title: 'Diversity:', text: 'We respect all different cultures, nationalities, and desires.' },
                { title: 'Respect:', text: 'We respect all tastes and desires and deal respectfully with all individuals.' },
            ],
        },
        contact: {
            title: 'Contact Us', subtitle: 'We are here to help. Reach out to us for any inquiries or requests.',
            infoTitle: 'Contact Information', phoneLabel: 'Phone Number', emailLabel: 'Email Address',
            whatsappLabel: 'WhatsApp', socialLabel: 'Follow Us', formTitle: 'Send Us a Message',
            firstName: 'First Name', lastName: 'Last Name', phone: 'Phone Number',
            subject: 'Subject', message: 'Message details', submit: 'Send Message',
            addressTitle: 'Location', address: 'Airport Road, 3rd Floor, Muscat, Sultanate of Oman',
            paymentsTitle: 'Available Payment Methods',
        },
        admin: {
            sidebar: { dashboard: 'Dashboard', products: 'Products', categories: 'Categories', branches: 'Branches', orders: 'Orders', hero: 'Hero', about: 'About Content', partners: 'Partners', contact: 'Contact', settings: 'General Settings', logout: 'Logout', adminPortal: 'Admin Portal', navigation: 'Navigation' },
            topbar: { searchPlaceholder: 'Search...', myProfile: 'My Profile' },
            dashboard: { totalProducts: 'Total Products', totalCategories: 'Total Categories', lowStock: 'Low Stock', totalOrders: 'Total Orders', recentActivity: 'Recent Activity', sales: 'Sales', newProduct: 'New Product', newUser: 'New User' },
            categories: { totalCategories: 'Total Categories', addNewCategory: 'Add New Category', nameEnglish: 'Name (English)', nameArabic: 'Name (Arabic)', add: 'Add', translating: 'Translating...', reset: 'Reset', noCategories: 'No categories found', delete: 'Delete', confirmReset: 'Reset all categories to default?' },
            products: { totalProducts: 'Total Products', inStock: 'In Stock', lowStockLabel: 'Low Stock', addNewProduct: 'Add Product', searchPlaceholder: 'Search products...', all: 'All', edit: 'Edit', delete: 'Delete', noProducts: 'No products found matching your search.', confirmDelete: 'Delete this product?', confirmReset: 'Reset all products to default?' },
            modal: { addProduct: 'Add New Product', editProduct: 'Edit Product', basicInfo: 'Basic Information', pName: 'Product Name', pCategory: 'Category', pPrice: 'Price', pStock: 'Stock', specs: 'Specifications', addSpec: 'Add Specification', key: 'Key (e.g. Size)', value: 'Value', remove: 'Remove', images: 'Colors & Images', selectImg: 'Select Image', autoTranslate: 'Auto-translates ✨', save: 'Save Product', cancel: 'Cancel' }
        },
        notFound: {
            title: 'Page Not Found',
            desc: 'The page you are looking for doesn\'t exist or has been moved.',
            btn: 'Return to Home'
        }
    },
    ur: {
        dir: 'rtl',
        nav: { home: 'ہوم', products: 'مصنوعات', about: 'ہمارے بارے میں', branches: 'شاخیں', contact: 'رابطہ کریں' },
        hero: {
            tag: 'بے مثال معیار',
            title1: 'سیرامکس اور پورسلین کا',
            title2: 'قابل اعتماد سپلائر',
            subtitle: 'ہم درآمدی اور مقامی سیرامکس، پورسلین، اور صحت کی سہولیات کی وسیع رینج فراہم کرتے ہیں۔',
            btnBrowse: 'مصنوعات دیکھیں',
            btnVideo: 'ویڈیو دیکھیں',
        },
        about: {
            title: 'النظار انٹرنیشنل ٹریڈنگ اینڈ کنٹریکٹنگ',
            description: 'ہم مقامی اور بین الاقوامی منڈیوں میں سیرامکس اور سینیٹری کے سامان کے حوالے سے معروف اداروں میں سے ایک ہیں۔',
            chairmanTitle: 'چیئرمین کا پیغام',
            chairmanText: 'ہماری کمپنی کی بنیاد مضبوط اصولوں پر رکھی گئی ہے۔',
            visionTitle: 'ہمارا وژن', visionText: 'مقامی اور بین الاقوامی سطح پر سب سے ترقی یافتہ سیرامک ​​کمپنی بننا۔',
            missionTitle: 'ہمارا مشن', missionText: 'اعلیٰ بین الاقوامی معیار کی مصنوعات کے ساتھ غیر معمولی تجربہ فراہم کرنا۔',
            valuesTitle: 'ہماری اقدار', valuesText: 'ہماری اقدار ہمارے کام کی بنیاد ہیں:',
            valuesList: [
                { title: 'عزم:', text: 'بہترین مصنوعات کی فراہمی کے لیے ترقی اور جدت کی لگن۔' },
                { title: 'معیار:', text: 'انتہائی احتیاط کے ساتھ جدید اور متنوع ڈیزائن کا انتخاب۔' },
                { title: 'اعتماد اور دیانت داری:', text: 'شفافیت اور دیانت داری پر مبنی مضبوط تعلقات۔' },
                { title: 'امتیاز:', text: 'منفرد اور عملی حل پیش کرنے پر توجہ۔' },
                { title: 'تنوع:', text: 'تمام ثقافتوں اور ضروریات کا احترام۔' },
                { title: 'احترام:', text: 'ملازمین، گاہکوں، اور شراکت داروں کے ساتھ احترام۔' },
            ],
        },
        contact: {
            title: 'ہم سے رابطہ کریں', subtitle: 'ہم آپ کی مدد کے لیے حاضر ہیں۔',
            infoTitle: 'رابطے کی معلومات', phoneLabel: 'فون نمبر', emailLabel: 'ای میل',
            whatsappLabel: 'واٹس ایپ', socialLabel: 'ہمیں فالو کریں', formTitle: 'ہمیں پیغام بھیجیں',
            firstName: 'پہلا نام', lastName: 'آخری نام', phone: 'فون نمبر',
            subject: 'موضوع', message: 'پیغام کی تفصیلات', submit: 'پیغام بھیجیں',
            addressTitle: 'مقام', address: 'ایئرپورٹ روڈ، تیسری منزل، مسقط، سلطنت عمان',
            paymentsTitle: 'ادائیگی کے دستیاب طریقے',
        },
        notFound: {
            title: 'صفحہ نہیں ملا',
            desc: 'آپ جس صفحے کی تلاش کر رہے ہیں وہ موجود نہیں ہے یا منتقل کر دیا گیا ہے۔',
            btn: 'ہوم پر واپس جائیں'
        }
    },
    zh: {
        dir: 'ltr',
        nav: { home: '首页', products: '产品', about: '关于我们', branches: '分支机构', contact: '联系我们' },
        hero: {
            tag: '品质无与伦比', title1: '瓷砖与卫浴的', title2: '值得信赖的供应商',
            subtitle: '我们提供种类繁多的进口与本地瓷砖、陶瓷及卫浴产品。',
            btnBrowse: '浏览产品', btnVideo: '观看视频',
        },
        about: {
            title: 'Al Najjar 国际贸易与承包公司',
            description: '作为全球领先的瓷砖、陶瓷及卫浴进出口公司之一，总部位于阿曼马斯喀特。',
            chairmanTitle: '董事长致辞', chairmanText: '自公司成立以来，我们就坚持以高标准为客户提供优质产品。',
            visionTitle: '愿景', visionText: '成为本地和国际上领先的瓷砖企业。',
            missionTitle: '使命', missionText: '提供卓越的服务体验。',
            valuesTitle: '价值观', valuesText: '价值观是我们企业运营的基石：',
            valuesList: [
                { title: '承诺:', text: '致力于提供最好的国际产品。' },
                { title: '品质:', text: '以严格的标准选择现代多样的设计。' },
                { title: '信任与诚信:', text: '建立透明、可靠和互信的关系。' },
                { title: '卓越:', text: '通过独特性和优质产品取得成功。' },
                { title: '多样性:', text: '尊重文化并在材料供应上体现多样化需求。' },
                { title: '尊重:', text: '始终以尊重的态度对待所有合作伙伴和客户。' },
            ],
        },
        contact: {
            title: '联系我们', subtitle: '我们乐意为您服务，如有任何疑问，请随时与我们联系。',
            infoTitle: '联系方式', phoneLabel: '电话号码', emailLabel: '电子邮件',
            whatsappLabel: 'WhatsApp', socialLabel: '关注我们', formTitle: '给我们留言',
            firstName: '名字', lastName: '姓氏', phone: '电话号码',
            subject: '主题', message: '留言详细信息', submit: '发送留言',
            addressTitle: '位置', address: '阿曼苏丹国马斯喀特机场路三楼',
            paymentsTitle: '可用支付方式',
        },
        notFound: {
            title: '页面未找到',
            desc: '您寻找的页面不存在或已被移动。',
            btn: '返回首页'
        }
    },
    ru: {
        dir: 'ltr',
        nav: { home: 'Главная', products: 'Продукты', about: 'О нас', branches: 'Филиалы', contact: 'Контакты' },
        hero: {
            tag: 'Непревзойдённое качество', title1: 'Надёжный поставщик', title2: 'керамики и сантехники',
            subtitle: 'Мы предлагаем широкий выбор импортной и отечественной керамики и сантехники.',
            btnBrowse: 'Смотреть товары', btnVideo: 'Смотреть видео',
        },
        about: {
            title: 'Al Najjar International Trading & Contracting',
            description: 'Одна из ведущих международных компаний в области импорта и экспорта керамики, фарфора и сантехники.',
            chairmanTitle: 'Слово председателя', chairmanText: 'С момента основания мы ставим качество на первое место.',
            visionTitle: 'Наше видение', visionText: 'Быть передовой компанией по продаже керамики.',
            missionTitle: 'Наша миссия', missionText: 'Предоставление исключительного опыта.',
            valuesTitle: 'Наши ценности', valuesText: 'Наши ценности — основа нашей компании:',
            valuesList: [
                { title: 'Обязательство:', text: 'Предоставление лучших международных продуктов.' },
                { title: 'Качество:', text: 'Выбор материалов по строжайшим мировым стандартам.' },
                { title: 'Доверие и честность:', text: 'Прозрачные и честные отношения.' },
                { title: 'Превосходство:', text: 'Стремление к уникальности и высоким стандартам.' },
                { title: 'Разнообразие:', text: 'Удовлетворение различных нужд и предпочтений.' },
                { title: 'Уважение:', text: 'Взаимоуважение со всеми сотрудниками и клиентами.' },
            ],
        },
        contact: {
            title: 'Свяжитесь с нами', subtitle: 'Мы готовы помочь. Свяжитесь по любым вопросам.',
            infoTitle: 'Контактная информация', phoneLabel: 'Номер телефона', emailLabel: 'Электронная почта',
            whatsappLabel: 'WhatsApp', socialLabel: 'Мы в соцсетях', formTitle: 'Отправить сообщение',
            firstName: 'Имя', lastName: 'Фамилия', phone: 'Телефон',
            subject: 'Тема', message: 'Детали сообщения', submit: 'Отправить',
            addressTitle: 'Расположение', address: 'Airport Road, 3-й этаж, Маскат, Султанат Оман',
            paymentsTitle: 'Доступные способы оплаты',
        },
        notFound: {
            title: 'Страница не найдена',
            desc: 'Страница, которую вы ищете, не существует или была перемещена.',
            btn: 'Вернуться на главную'
        }
    },
    es: {
        dir: 'ltr',
        nav: { home: 'Inicio', products: 'Productos', about: 'Sobre Nosotros', branches: 'Sucursales', contact: 'Contacto' },
        hero: {
            tag: 'Calidad Inigualable',
            title1: 'Proveedor Confiable de',
            title2: 'Cerámica y Sanitarios',
            subtitle: 'Ofrecemos una amplia selección de cerámicas, porcelanatos y artículos sanitarios importados y locales, con opciones para proyectos residenciales y comerciales con los más altos estándares de calidad y precios competitivos.',
            btnBrowse: 'Ver Productos',
            btnVideo: 'Ver Video',
        },
        about: {
            title: 'Al Najjar International Trading & Contracting',
            description: 'Una de las principales empresas internacionales en la importación y exportación de cerámica, porcelanato y artículos sanitarios, con sede en Mascate, Omán.',
            chairmanTitle: 'Mensaje del Presidente',
            chairmanText: 'La empresa tiene una base sólida desde su fundación en Sharjah en 1975, gracias en gran parte al generoso fundador y gran padre, el honorable Ibrahim Suleiman Al Najjar.',
            visionTitle: 'Nuestra Visión',
            visionText: 'Buscamos ser la empresa de cerámica más desarrollada y de mayor crecimiento a nivel local e internacional, y ser el mejor socio y la primera opción para nuestros clientes.',
            missionTitle: 'Nuestra Misión',
            missionText: 'Nuestra misión es proporcionar una experiencia de usuario excepcional y crear un valor tangible que supere las expectativas del cliente.',
            valuesTitle: 'Nuestros Valores',
            valuesText: 'Nuestros valores son la piedra angular en las operaciones de nuestra empresa y una de las constantes de las que no nos desviamos.',
            valuesList: [
                { title: 'Compromiso:', text: 'Nos compromemos a ofrecer los mejores productos internacionales.' },
                { title: 'Calidad:', text: 'Elegimos productos y materiales con diseños modernos con gran cuidado.' },
                { title: 'Confianza:', text: 'La verdadera riqueza de la empresa radica en sus relaciones.' },
                { title: 'Excelencia:', text: 'Crecemos y prosperamos a través de la excelencia en productos.' },
                { title: 'Diversidad:', text: 'Respetamos las culturas y necesidades diferentes.' },
                { title: 'Respeto:', text: 'Tratamos con respeto a todas las personas.' },
            ],
        },
        contact: {
            title: 'Contáctenos', subtitle: 'Estamos aquí para ayudar. Contáctenos para cualquier consulta o solicitud.',
            infoTitle: 'Información de Contacto', phoneLabel: 'Número de Teléfono', emailLabel: 'Correo Electrónico',
            whatsappLabel: 'WhatsApp', socialLabel: 'Síganos', formTitle: 'Envíenos un Mensaje',
            firstName: 'Nombre', lastName: 'Apellido', phone: 'Teléfono',
            subject: 'Asunto', message: 'Detalles del mensaje', submit: 'Enviar Mensaje',
            addressTitle: 'Ubicación', address: 'Carretera del Aeropuerto, 3er Piso, Mascate, Sultanato de Omán',
            paymentsTitle: 'Métodos de Pago Disponibles',
        },
        admin: {
            sidebar: { dashboard: 'Panel', products: 'Productos', categories: 'Categorías', branches: 'Sucursales', orders: 'Pedidos', hero: 'Hero', about: 'Acerca de', partners: 'Socios', contact: 'Contacto', settings: 'Ajustes', logout: 'Cerrar Sesión', adminPortal: 'Portal de Admin', navigation: 'Navegación' },
            topbar: { searchPlaceholder: 'Buscar...', myProfile: 'Mi Perfil' },
            dashboard: { totalProducts: 'Total Productos', totalCategories: 'Total Categorías', lowStock: 'Poco Stock', totalOrders: 'Total Pedidos', recentActivity: 'Actividad Reciente', sales: 'Ventas', newProduct: 'Nuevo Producto', newUser: 'Nuevo Usuario' },
            categories: { totalCategories: 'Total Categorías', addNewCategory: 'Añadir Nueva Categoría', nameEnglish: 'Nombre (Inglés)', nameArabic: 'Nombre (Árabe)', add: 'Añadir', translating: 'Traduciendo...', reset: 'Restablecer', noCategories: 'No se encontraron categorías', delete: 'Eliminar', confirmReset: '¿Restablecer todas las categorías?' },
            products: { totalProducts: 'Total Productos', inStock: 'En Stock', lowStockLabel: 'Poco Stock', addNewProduct: 'Añadir Producto', searchPlaceholder: 'Buscar productos...', all: 'Todos', edit: 'Editar', delete: 'Eliminar', noProducts: 'No se encontraron productos.', confirmDelete: '¿Eliminar este producto?', confirmReset: '¿Restablecer todos los productos?' },
            modal: { addProduct: 'Añadir Producto', editProduct: 'Editar Producto', basicInfo: 'Información Básica', pName: 'Nombre del Producto', pCategory: 'Categoría', pPrice: 'Precio', pStock: 'Stock', specs: 'Especificaciones', addSpec: 'Añadir Especificación', key: 'Clave', value: 'Valor', remove: 'Eliminar', images: 'Colores e Imágenes', selectImg: 'Elegir Imagen', autoTranslate: 'Traducción automática ✨', save: 'Guardar Producto', cancel: 'Cancelar' }
        },
        notFound: {
            title: 'Página No Encontrada',
            desc: 'La página que buscas no existe o ha sido movida.',
            btn: 'Volver al Inicio'
        }
    },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => localStorage.getItem('app_lang') || 'en');
    const [currency, setCurrencyState] = useState(() => localStorage.getItem('app_currency') || 'OMR');

    const setLang = useCallback((code) => {
        setLangState(code);
        localStorage.setItem('app_lang', code);
        const langMeta = languages.find(l => l.code === code);
        if (langMeta?.defaultCurrency) {
            setCurrencyState(langMeta.defaultCurrency);
            localStorage.setItem('app_currency', langMeta.defaultCurrency);
        }
    }, []);

    const setCurrency = useCallback((code) => {
        setCurrencyState(code);
        localStorage.setItem('app_currency', code);
    }, []);

    useEffect(() => {
        const dir = translations[lang]?.dir || 'rtl';
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', lang);
    }, [lang]);

    const currentCurrencyMeta = useMemo(
        () => currencies.find(c => c.code === currency) || currencies[0],
        [currency]
    );

    const formatPrice = useCallback((omrPrice) => {
        const converted = (omrPrice * currentCurrencyMeta.rate).toFixed(2);
        return <>{currentCurrencyMeta.symbol} {converted}</>;
    }, [currentCurrencyMeta]);

    const value = useMemo(() => ({
        lang,
        t: translations[lang] || translations['ar'],
        setLang,
        languages,
        currentLangMeta: languages.find(l => l.code === lang) || languages[0],
        currency,
        setCurrency,
        currencies,
        currentCurrencyMeta,
        formatPrice,
    }), [lang, currency, setLang, setCurrency, currentCurrencyMeta, formatPrice]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
