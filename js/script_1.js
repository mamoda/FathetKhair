       
       //كود يعمل  رقم واحد 
       // نظام إدارة الجلسات
        class SessionManager {
            constructor() {
                this.currentSessionKey = 'currentSession';
            }

            // حفظ جلسة المستخدم
            saveSession(user, rememberMe = false) {
                const sessionData = {
                    user: user,
                    loginTime: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString() // 30 يوم إذا تم التذكر، يوم واحد إذا لم يتم
                };
                
                if (rememberMe) {
                    // استخدام localStorage للتذكر الدائم
                    localStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
                } else {
                    // استخدام sessionStorage للجلسة المؤقتة
                    sessionStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
                }
            }

            // استعادة جلسة المستخدم
            getSession() {
                // البحث في localStorage أولاً ثم sessionStorage
                let sessionData = localStorage.getItem(this.currentSessionKey);
                
                if (!sessionData) {
                    sessionData = sessionStorage.getItem(this.currentSessionKey);
                }
                
                if (!sessionData) return null;

                const session = JSON.parse(sessionData);
                
                // التحقق من انتهاء صلاحية الجلسة
                if (new Date() > new Date(session.expiresAt)) {
                    this.clearSession();
                    return null;
                }

                return session.user;
            }

            // مسح جلسة المستخدم
            clearSession() {
                localStorage.removeItem(this.currentSessionKey);
                sessionStorage.removeItem(this.currentSessionKey);
            }

            // تحديث وقت انتهاء الجلسة
            refreshSession() {
                // البحث في localStorage أولاً ثم sessionStorage
                let sessionData = localStorage.getItem(this.currentSessionKey);
                let storageType = 'localStorage';
                
                if (!sessionData) {
                    sessionData = sessionStorage.getItem(this.currentSessionKey);
                    storageType = 'sessionStorage';
                }
                
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    
                    if (storageType === 'localStorage') {
                        localStorage.setItem(this.currentSessionKey, JSON.stringify(session));
                    } else {
                        sessionStorage.setItem(this.currentSessionKey, JSON.stringify(session));
                    }
                }
            }
        }

        // قاعدة بيانات محلية باستخدام localStorage
        class Database {
            constructor() {
                this.initializeDatabase();
            }

            initializeDatabase() {
                // التحقق من وجود البيانات في localStorage
                if (!localStorage.getItem('users')) {
                    const users = [
                        { id: 1, username: "admin", password: "admin123", role: "admin" },
                        { id: 2, username: "cashier", password: "cashier123", role: "cashier" }
                    ];
                    localStorage.setItem('users', JSON.stringify(users));
                }

                if (!localStorage.getItem('products')) {
                    const products = this.generateProducts();
                    localStorage.setItem('products', JSON.stringify(products));
                }

                if (!localStorage.getItem('sales')) {
                    localStorage.setItem('sales', JSON.stringify([]));
                }

                if (!localStorage.getItem('barcodeMemory')) {
                    localStorage.setItem('barcodeMemory', JSON.stringify([]));
                }

                if (!localStorage.getItem('inventoryLog')) {
                    localStorage.setItem('inventoryLog', JSON.stringify([]));
                }

                if (!localStorage.getItem('wholesaleInvoices')) {
                    localStorage.setItem('wholesaleInvoices', JSON.stringify([]));
                }

                if (!localStorage.getItem('recentTransactions')) {
                    localStorage.setItem('recentTransactions', JSON.stringify([]));
                }
            }

            generateProducts() {
                const products = [];
                const categories = [
                    "مأكولات", "مشروبات", "منتجات الألبان", "الفواكه", "الخضروات", 
                    "اللحوم", "المخبوزات", "الحلويات", "الأدوات المنزلية", "العناية الشخصية"
                ];
                // صور حقيقية للمنتجات من Pexels (مجانية للاستخدام)
                const productImages = [
                    // فواكه
                    "https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=300", // برتقال
                    "https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=300", // تفاح
                    "https://images.pexels.com/photos/7195524/pexels-photo-7195524.jpeg?auto=compress&cs=tinysrgb&w=300", // موز
                    "https://images.pexels.com/photos/7195470/pexels-photo-7195470.jpeg?auto=compress&cs=tinysrgb&w=300", // فراولة
                    
                    // خضروات
                    "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300", // جزر
                    "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300", // طماطم
                    "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=300", // خس
                    "https://images.pexels.com/photos/4117746/pexels-photo-4117746.jpeg?auto=compress&cs=tinysrgb&w=300", // بصل
                    
                    // مأكولات
                    "https://images.pexels.com/photos/4109116/pexels-photo-4109116.jpeg?auto=compress&cs=tinysrgb&w=300", // أرز
                    "https://images.pexels.com/photos/4110097/pexels-photo-4110097.jpeg?auto=compress&cs=tinysrgb&w=300", // مكرونة
                    "https://images.pexels.com/photos/4108815/pexels-photo-4108815.jpeg?auto=compress&cs=tinysrgb&w=300", // دقيق
                    "https://images.pexels.com/photos/4108839/pexels-photo-4108839.jpeg?auto=compress&cs=tinysrgb&w=300", // سكر
                    
                    // مشروبات
                    "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300", // قهوة
                    "https://images.pexels.com/photos/312420/pexels-photo-312420.jpeg?auto=compress&cs=tinysrgb&w=300", // شاي
                    "https://images.pexels.com/photos/327095/pexels-photo-327095.jpeg?auto=compress&cs=tinysrgb&w=300", // عصير
                    "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=300", // مياه
                    
                    // منتجات الألبان
                    "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300", // حليب
                    "https://images.pexels.com/photos/5410322/pexels-photo-5410322.jpeg?auto=compress&cs=tinysrgb&w=300", // جبن
                    "https://images.pexels.com/photos/5410328/pexels-photo-5410328.jpeg?auto=compress&cs=tinysrgb&w=300", // زبادي
                    "https://images.pexels.com/photos/5410325/pexels-photo-5410325.jpeg?auto=compress&cs=tinysrgb&w=300", // زبدة
                    
                    // لحوم
                    "https://images.pexels.com/photos/618775/pexels-photo-618775.jpeg?auto=compress&cs=tinysrgb&w=300", // لحم
                    "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=300", // دجاج
                    "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=300", // سمك
                    
                    // مخبوزات
                    "https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=300", // خبز
                    "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=300", // كعك
                    "https://images.pexels.com/photos/4791267/pexels-photo-4791267.jpeg?auto=compress&cs=tinysrgb&w=300", // بسكويت
                    
                    // حلويات
                    "https://images.pexels.com/photos/2144200/pexels-photo-2144200.jpeg?auto=compress&cs=tinysrgb&w=300", // شوكولاتة
                    "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=300", // حلوى
                    "https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=300", // آيس كريم
                    
                    // أدوات منزلية
                    "https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=300", // منظفات
                    "https://images.pexels.com/photos/545014/pexels-photo-545014.jpeg?auto=compress&cs=tinysrgb&w=300", // ورق
                    "https://images.pexels.com/photos/4481257/pexels-photo-4481257.jpeg?auto=compress&cs=tinysrgb&w=300", // أدوات مطبخ
                    
                    // عناية شخصية
                    "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=300", // شامبو
                    "https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=300", // صابون
                    "https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg?auto=compress&cs=tinysrgb&w=300"  // معجون أسنان
                ];

                // أسماء منتجات حقيقية
                const productNames = {
                    "مأكولات": ["أرز مصرى", "سكر أبيض", "دقيق القمح", "زيت زيتون", "عسل نحل", "معكرونة", "عدس أصفر", "فول مدمس", "حمص شامي", "فاصوليا بيضاء"],
                    "مشروبات": ["شاي أحمد", "قهوة تركية", "نسكافيه", "عصير برتقال", "مياه معدنية", "بيبسي", "سفن أب", "شاي ليبتون", "قهوة نسكافيه", "عصير مانجو"],
                    "منتجات الألبان": ["حليب طازج", "جبنة رومي", "زبادي طبيعي", "قشطة", "لبنة", "جبنة فيتا", "حليب مجفف", "زبدة", "جبنة شيدر", "روب"],
                    "الفواكه": ["تفاح", "برتقال", "موز", "فراولة", "عنب", "مانجو", "بطيخ", "شمام", "كمثرى", "خوخ"],
                    "الخضروات": ["طماطم", "خيار", "جزر", "بصل", "ثوم", "فلفل رومي", "بطاطس", "باذنجان", "كوسة", "خس"],
                    "اللحوم": ["لحم بقري", "لحم ضأن", "دجاج طازج", "سمك بلطي", "جمبري", "كبدة", "لحم مفروم", "دجاج مجمد", "سجق", "همبرجر"],
                    "المخبوزات": ["خبز بلدي", "خبز توست", "كعك", "بسكويت", "كرواسون", "دونات", "كيك", "معمول", "بقلاوة", "كنافة"],
                    "الحلويات": ["شوكولاتة", "حلوى جيلي", "آيس كريم", "مهلبية", "أم علي", "بسبوسة", "قطايف", "لقيمات", "حلاوة طحينية", "ملبن"],
                    "الأدوات المنزلية": ["صابون أطباق", "منظف زجاج", "مطهر أرضيات", "منعم أقمشة", "كلور", "إسفنج", "مناديل ورقية", "أكياس قمامة", "شمع", "معطر جو"],
                    "العناية الشخصية": ["شامبو", "بلسم", "صابون", "معجون أسنان", "فرشاة أسنان", "مزيل عرق", "غسول وجه", "كريم ترطيب", "مستحضر حلاقة", "مناديل مبللة"]
                };

                for (let i = 1; i <= 100; i++) {
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    const categoryProducts = productNames[category];
                    const productName = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
                    
                    // اختيار صورة عشوائية من مجموعة الصور المتاحة
                    const randomImage = productImages[Math.floor(Math.random() * productImages.length)];
                    
                    products.push({
                        id: i,
                        name: productName,
                        price: Math.floor(Math.random() * 100) + 1,
                        barcode: this.generateBarcode(),
                        category: category,
                        image: randomImage,
                        stock: Math.floor(Math.random() * 100) + 10,
                        minStock: 5,
                        wholesalePrice: Math.floor(Math.random() * 80) + 1 // سعر الجملة
                    });
                }
                return products;
            }

            generateBarcode() {
                return 'EG' + Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
            }

            // وظائف المستخدمين
            getUsers() {
                return JSON.parse(localStorage.getItem('users')) || [];
            }

            // وظائف المنتجات
            getProducts() {
                return JSON.parse(localStorage.getItem('products')) || [];
            }

            getProductByBarcode(barcode) {
                const products = this.getProducts();
                return products.find(product => product.barcode === barcode);
            }

            getProductById(id) {
                const products = this.getProducts();
                return products.find(product => product.id === parseInt(id));
            }

            addProduct(product) {
                const products = this.getProducts();
                product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                products.push(product);
                localStorage.setItem('products', JSON.stringify(products));
                
                // تسجيل في سجل المخزون
                this.addInventoryLog({
                    productId: product.id,
                    productName: product.name,
                    change: product.stock,
                    type: 'add',
                    reason: 'إضافة منتج جديد',
                    date: new Date().toISOString()
                });
                
                return product.id;
            }

            updateProduct(productId, updatedData) {
                const products = this.getProducts();
                const productIndex = products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    const oldStock = products[productIndex].stock;
                    products[productIndex] = { ...products[productIndex], ...updatedData };
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    // تسجيل في سجل المخزون إذا تغير المخزون
                    if (oldStock !== updatedData.stock) {
                        this.addInventoryLog({
                            productId: productId,
                            productName: products[productIndex].name,
                            change: updatedData.stock - oldStock,
                            type: updatedData.stock > oldStock ? 'add' : 'subtract',
                            reason: 'تعديل المخزون',
                            date: new Date().toISOString()
                        });
                    }
                    
                    return true;
                }
                return false;
            }

            deleteProduct(productId) {
                const products = this.getProducts();
                const product = products.find(p => p.id === productId);
                const filteredProducts = products.filter(p => p.id !== productId);
                localStorage.setItem('products', JSON.stringify(filteredProducts));
                
                // تسجيل في سجل المخزون
                this.addInventoryLog({
                    productId: productId,
                    productName: product.name,
                    change: -product.stock,
                    type: 'subtract',
                    reason: 'حذف المنتج',
                    date: new Date().toISOString()
                });
                
                return true;
            }

            updateProductStock(productId, quantity) {
                const products = this.getProducts();
                const productIndex = products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    const oldStock = products[productIndex].stock;
                    products[productIndex].stock -= quantity;
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    // تسجيل في سجل المخزون
                    this.addInventoryLog({
                        productId: productId,
                        productName: products[productIndex].name,
                        change: -quantity,
                        type: 'subtract',
                        reason: 'بيع منتج',
                        date: new Date().toISOString()
                    });
                }
            }

            // وظائف المبيعات
            getSales() {
                return JSON.parse(localStorage.getItem('sales')) || [];
            }

            addSale(saleData) {
                const sales = this.getSales();
                saleData.id = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
                saleData.date = new Date().toISOString();
                sales.push(saleData);
                localStorage.setItem('sales', JSON.stringify(sales));

                // إضافة إلى المعاملات الحديثة
                this.addRecentTransaction({
                    type: 'بيع',
                    amount: saleData.total,
                    details: `${saleData.items.length} منتج`,
                    cashier: saleData.cashier,
                    time: new Date().toISOString()
                });
                
                return saleData.id;
            }

            // وظائف فواتير الجملة
            getWholesaleInvoices() {
                return JSON.parse(localStorage.getItem('wholesaleInvoices')) || [];
            }

            addWholesaleInvoice(invoiceData) {
                const invoices = this.getWholesaleInvoices();
                invoiceData.id = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
                invoiceData.date = new Date().toISOString();
                invoices.push(invoiceData);
                localStorage.setItem('wholesaleInvoices', JSON.stringify(invoices));

                // إضافة إلى المعاملات الحديثة
                this.addRecentTransaction({
                    type: 'جملة',
                    amount: invoiceData.total,
                    details: `عميل: ${invoiceData.customer}`,
                    cashier: invoiceData.cashier,
                    time: new Date().toISOString()
                });
                
                return invoiceData.id;
            }

            // وظائف المعاملات الحديثة
            getRecentTransactions() {
                return JSON.parse(localStorage.getItem('recentTransactions')) || [];
            }

            addRecentTransaction(transaction) {
                const transactions = this.getRecentTransactions();
                transactions.unshift(transaction);
                // الاحتفاظ فقط بآخر 100 معاملة
                if (transactions.length > 100) {
                    transactions.pop();
                }
                localStorage.setItem('recentTransactions', JSON.stringify(transactions));
                return transaction;
            }

            // وظائف ذاكرة الباركود
            getBarcodeMemory() {
                return JSON.parse(localStorage.getItem('barcodeMemory')) || [];
            }

            addBarcodeToMemory(barcodeData) {
                const barcodeMemory = this.getBarcodeMemory();
                barcodeData.id = barcodeMemory.length > 0 ? Math.max(...barcodeMemory.map(b => b.id)) + 1 : 1;
                barcodeData.storedAt = new Date().toISOString();
                barcodeMemory.push(barcodeData);
                localStorage.setItem('barcodeMemory', JSON.stringify(barcodeMemory));
                return barcodeData.id;
            }

            removeBarcodeFromMemory(barcodeId) {
                const barcodeMemory = this.getBarcodeMemory();
                const filteredMemory = barcodeMemory.filter(b => b.id !== barcodeId);
                localStorage.setItem('barcodeMemory', JSON.stringify(filteredMemory));
                return true;
            }

            // وظائف سجل المخزون
            getInventoryLog() {
                return JSON.parse(localStorage.getItem('inventoryLog')) || [];
            }

            addInventoryLog(logData) {
                const inventoryLog = this.getInventoryLog();
                logData.id = inventoryLog.length > 0 ? Math.max(...inventoryLog.map(l => l.id)) + 1 : 1;
                inventoryLog.push(logData);
                localStorage.setItem('inventoryLog', JSON.stringify(inventoryLog));
                return logData.id;
            }
        }

        // إنشاء كائن قاعدة البيانات
        const db = new Database();

        // بيانات المستخدمين المسموح لهم بالدخول
        const users = db.getUsers();

        // سلة المشتريات
        let cart = [];
        let wholesaleCart = [];
        let currentUser = null;

        // عناصر DOM
        const loginPage = document.getElementById('loginPage');
        const dashboard = document.getElementById('dashboard');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const userDisplay = document.getElementById('userDisplay');
        const transactionsList = document.getElementById('transactionsList');

        // صفحات النظام
        const cashierPage = document.getElementById('cashierPage');
        const productsPage = document.getElementById('productsPage');
        const barcodeMemoryPage = document.getElementById('barcodeMemoryPage');
        const invoicesPage = document.getElementById('invoicesPage');
        const wholesalePage = document.getElementById('wholesalePage');
        const inventoryPage = document.getElementById('inventoryPage');
        const reportsPage = document.getElementById('reportsPage');

        // عناصر صفحة الكاشير
        const barcodeInput = document.getElementById('barcodeInput');
        const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
        const productsGrid = document.getElementById('productsGrid');
        const cartItems = document.getElementById('cartItems');
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');

        // عناصر صفحة إدارة المنتجات
        const productNameInput = document.getElementById('productName');
        const productPriceInput = document.getElementById('productPrice');
        const productBarcodeInput = document.getElementById('productBarcode');
        const productCategoryInput = document.getElementById('productCategory');
        const productStockInput = document.getElementById('productStock');
        const addProductBtn = document.getElementById('addProductBtn');
        const productsTableBody = document.getElementById('productsTableBody');

        // عناصر صفحة تخزين الباركود
        const memoryBarcodeInput = document.getElementById('memoryBarcode');
        const memoryProductSelect = document.getElementById('memoryProduct');
        const saveBarcodeBtn = document.getElementById('saveBarcodeBtn');
        const barcodeMemoryTable = document.getElementById('barcodeMemoryTable');

        // عناصر صفحة الفواتير
        const invoiceSearch = document.getElementById('invoiceSearch');
        const invoicesTableBody = document.getElementById('invoicesTableBody');

        // عناصر صفحة فواتير الجملة
        const wholesaleCustomer = document.getElementById('wholesaleCustomer');
        const wholesaleDiscount = document.getElementById('wholesaleDiscount');
        const wholesaleBarcode = document.getElementById('wholesaleBarcode');
        const addWholesaleProductBtn = document.getElementById('addWholesaleProductBtn');
        const wholesaleCartItems = document.getElementById('wholesaleCartItems');
        const wholesaleSubtotal = document.getElementById('wholesaleSubtotal');
        const wholesaleDiscountAmount = document.getElementById('wholesaleDiscountAmount');
        const wholesaleTax = document.getElementById('wholesaleTax');
        const wholesaleTotal = document.getElementById('wholesaleTotal');
        const wholesaleCheckoutBtn = document.getElementById('wholesaleCheckoutBtn');
        const wholesaleTableBody = document.getElementById('wholesaleTableBody');

        // عناصر صفحة المخزون
        const inventorySearch = document.getElementById('inventorySearch');
        const inventoryTableBody = document.getElementById('inventoryTableBody');

        // التحقق من وجود جلسة سابقة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            const sessionManager = new SessionManager();
            const savedUser = sessionManager.getSession();
            
            if (savedUser) {
                // استعادة الجلسة
                currentUser = savedUser;
                loginPage.style.display = 'none';
                dashboard.style.display = 'block';
                userDisplay.textContent = `مرحباً، ${savedUser.username}`;
                loadSidebarMenu();
                showPage('cashierPage');
                loadProducts();
                loadRecentTransactions();
                
                // تحديث وقت انتهاء الجلسة
                sessionManager.refreshSession();
                
                if (barcodeInput) {
                    barcodeInput.focus();
                }
            } else {
                loginPage.style.display = 'flex';
                dashboard.style.display = 'none';
            }
        });

        // وظيفة تسجيل الدخول
        loginBtn.addEventListener('click', function() {
            const username = usernameInput.value;
            const password = passwordInput.value;
            const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
            
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                currentUser = user;
                
                // حفظ الجلسة مع خاصية تذكرني
                const sessionManager = new SessionManager();
                sessionManager.saveSession(user, rememberMe);
                
                loginPage.style.display = 'none';
                dashboard.style.display = 'block';
                userDisplay.textContent = `مرحباً، ${username}`;
                loadSidebarMenu();
                showPage('cashierPage');
                loadProducts();
                loadRecentTransactions();
                barcodeInput.focus();
            } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        });

        // وظيفة تسجيل الخروج
        logoutBtn.addEventListener('click', function() {
            dashboard.style.display = 'none';
            loginPage.style.display = 'flex';
            usernameInput.value = '';
            passwordInput.value = '';
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = false;
            }
            cart = [];
            wholesaleCart = [];
            updateCart();
            updateWholesaleCart();
            currentUser = null;
            
            // مسح الجلسة من SessionManager
            const sessionManager = new SessionManager();
            sessionManager.clearSession();
        });

        // السماح بالدخول باستخدام زر Enter
        passwordInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                loginBtn.click();
            }
        });

        // تحميل القائمة الجانبية حسب صلاحية المستخدم
        function loadSidebarMenu() {
            sidebarMenu.innerHTML = '';
            
            // عناصر القائمة الأساسية للجميع
            const baseMenuItems = [
                { id: 'cashierPage', name: 'نقطة البيع', icon: 'bi-cash-register' },
                { id: 'invoicesPage', name: 'الفواتير', icon: 'bi-receipt' }
            ];
            
            // عناصر القائمة للإدمن فقط
            const adminMenuItems = [
                { id: 'productsPage', name: 'إدارة المنتجات', icon: 'bi-boxes' },
                { id: 'barcodeMemoryPage', name: 'تخزين الباركود', icon: 'bi-memory' },
                { id: 'wholesalePage', name: 'فواتير الجملة', icon: 'bi-truck' },
                { id: 'inventoryPage', name: 'إدارة المخزون', icon: 'bi-bar-chart' },
                { id: 'reportsPage', name: 'التقارير', icon: 'bi-pie-chart' }
            ];
            
            // إضافة عناصر القائمة الأساسية
            baseMenuItems.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" data-page="${item.id}"><i class="bi ${item.icon}"></i> ${item.name}</a>`;
                sidebarMenu.appendChild(li);
            });
            
            // إضافة عناصر القائمة للإدمن فقط
            if (currentUser && currentUser.role === 'admin') {
                adminMenuItems.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#" data-page="${item.id}"><i class="bi ${item.icon}"></i> ${item.name}</a>`;
                    sidebarMenu.appendChild(li);
                });
            }
            
            // إضافة أحداث النقر لعناصر القائمة
            const menuLinks = sidebarMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('data-page');
                    showPage(pageId);
                    
                    // تحديث العنصر النشط في القائمة
                    menuLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // تفعيل العنصر الأول في القائمة
            if (menuLinks.length > 0) {
                menuLinks[0].classList.add('active');
            }
        }

        // تحميل المعاملات الحديثة
        function loadRecentTransactions() {
            const transactions = db.getRecentTransactions();
            transactionsList.innerHTML = '';
            
            transactions.forEach(transaction => {
                const li = document.createElement('li');
                li.className = 'transaction-item';
                
                // تحديد الأيقونة حسب نوع المعاملة
                let icon = 'bi-cart';
                if (transaction.type === 'جملة') {
                    icon = 'bi-truck';
                } else if (transaction.type === 'بيع') {
                    icon = 'bi-cart-check';
                }
                
                li.innerHTML = `
                    <div class="transaction-info">
                        <h4><i class="bi ${icon}"></i> ${transaction.type} - ${transaction.details}</h4>
                        <p>${transaction.cashier}</p>
                        <div class="transaction-time">${new Date(transaction.time).toLocaleTimeString('ar-EG')}</div>
                    </div>
                    <div class="transaction-amount">${transaction.amount.toFixed(2)} ج.م</div>
                `;
                transactionsList.appendChild(li);
            });
        }

        // عرض الصفحة المحددة
        function showPage(pageId) {
            // إخفاء جميع الصفحات
            cashierPage.style.display = 'none';
            productsPage.style.display = 'none';
            barcodeMemoryPage.style.display = 'none';
            invoicesPage.style.display = 'none';
            wholesalePage.style.display = 'none';
            inventoryPage.style.display = 'none';
            reportsPage.style.display = 'none';
            
            // عرض الصفحة المحددة
            document.getElementById(pageId).style.display = 'block';
            
            // تحميل البيانات الخاصة بكل صفحة عند عرضها
            if (pageId === 'productsPage') {
                loadProductsTable();
            } else if (pageId === 'barcodeMemoryPage') {
                loadBarcodeMemoryPage();
            } else if (pageId === 'invoicesPage') {
                loadInvoicesPage();
            } else if (pageId === 'wholesalePage') {
                loadWholesalePage();
            } else if (pageId === 'inventoryPage') {
                loadInventoryPage();
            } else if (pageId === 'reportsPage') {
                loadReportsPage();
            }
        }

        // مسح الباركود
        scanBarcodeBtn.addEventListener('click', function() {
            const barcode = barcodeInput.value.trim();
            if (barcode) {
                searchByBarcode(barcode);
            }
        });

        barcodeInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const barcode = barcodeInput.value.trim();
                if (barcode) {
                    searchByBarcode(barcode);
                }
            }
        });

        // البحث بالباركود
        function searchByBarcode(barcode) {
            const product = db.getProductByBarcode(barcode);
            if (product) {
                addToCart(product);
                barcodeInput.value = '';
                barcodeInput.focus();
            } else {
                alert('المنتج غير موجود!');
            }
        }

        // تحميل المنتجات
        function loadProducts() {
            const products = db.getProducts();
            productsGrid.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // إضافة تحذير إذا كان المخزون منخفضاً
                const stockWarning = product.stock <= product.minStock ? `<div class="stock-low"><i class="bi bi-exclamation-triangle-fill"></i> منخفض (${product.stock})</div>` : '';
                
                productCard.innerHTML = `
                    <img src="${product.image}" onerror="this.src='https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=300'" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <div class="price">${product.price} جنيه</div>
                    <div class="barcode"><i class="bi bi-upc-scan"></i> ${product.barcode}</div>
                    ${stockWarning}
                `;
                
                productCard.addEventListener('click', () => addToCart(product));
                
                productsGrid.appendChild(productCard);
            });
        }

        // إضافة منتج إلى السلة
        function addToCart(product) {
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    existingItem.quantity += 1;
                } else {
                    alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                    return;
                }
            } else {
                if (product.stock > 0) {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        barcode: product.barcode,
                        quantity: 1,
                        stock: product.stock
                    });
                } else {
                    alert('المنتج غير متوفر في المخزون!');
                    return;
                }
            }
            
            updateCart();
        }

        // تحديث السلة
        function updateCart() {
            cartItems.innerHTML = '';
            
            let subtotal = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <div>${item.name}</div>
                            <div>${item.price} جنيه</div>
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease-btn"><i class="bi bi-dash"></i></button>
                        <span>${item.quantity}</span>
                        <button class="increase-btn"><i class="bi bi-plus"></i></button>
                    </div>
                    <div>${itemTotal.toFixed(2)} جنيه</div>
                    <button class="remove-item"><i class="bi bi-trash"></i></button>
                `;
                
                // إضافة أحداث للأزرار
                const decreaseBtn = cartItem.querySelector('.decrease-btn');
                const increaseBtn = cartItem.querySelector('.increase-btn');
                const removeBtn = cartItem.querySelector('.remove-item');
                
                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        updateCart();
                    }
                });
                
                increaseBtn.addEventListener('click', () => {
                    const product = db.getProductById(item.id);
                    if (item.quantity < product.stock) {
                        item.quantity += 1;
                        updateCart();
                    } else {
                        alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                    }
                });
                
                removeBtn.addEventListener('click', () => {
                    cart = cart.filter(cartItem => cartItem.id !== item.id);
                    updateCart();
                });
                
                cartItems.appendChild(cartItem);
            });
            
            // حساب الضريبة والإجمالي
            const tax = subtotal * 0.14;
            const total = subtotal + tax;
            
            subtotalElement.textContent = `${subtotal.toFixed(2)} جنيه`;
            taxElement.textContent = `${tax.toFixed(2)} جنيه`;
            totalElement.textContent = `${total.toFixed(2)} جنيه`;
        }

        // إتمام عملية الشراء
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('السلة فارغة. أضف منتجات قبل إتمام الشراء.');
                return;
            }
            
            const subtotal = parseFloat(subtotalElement.textContent);
            const tax = parseFloat(taxElement.textContent);
            const total = parseFloat(totalElement.textContent);
            
            // حفظ عملية البيع في قاعدة البيانات
            const saleId = db.addSale({
                items: [...cart],
                subtotal: subtotal,
                tax: tax,
                total: total,
                cashier: currentUser.username
            });
            
            // تحديث المخزون
            cart.forEach(item => {
                db.updateProductStock(item.id, item.quantity);
            });
            
            alert(`تم إتمام عملية الشراء بنجاح! \nرقم الفاتورة: ${saleId} \nالمبلغ الإجمالي: ${total.toFixed(2)} جنيه`);
            
            // تفريغ السلة بعد إتمام الشراء
            cart = [];
            updateCart();
            loadProducts(); // إعادة تحميل المنتجات لتحديث المخزون
            loadRecentTransactions(); // تحديث المعاملات الحديثة
        });

        // تحميل جدول المنتجات في صفحة الإدارة
        function loadProductsTable() {
            const products = db.getProducts();
            productsTableBody.innerHTML = '';
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.barcode}</td>
                    <td>${product.name}</td>
                    <td>${product.price} جنيه</td>
                    <td>${product.stock}</td>
                    <td>${product.category}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${product.id}"><i class="bi bi-pencil"></i> تعديل</button>
                        <button class="action-btn delete-btn" data-id="${product.id}"><i class="bi bi-trash"></i> حذف</button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار التعديل والحذف
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                        db.deleteProduct(productId);
                        loadProductsTable();
                        loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
                    }
                });
            });
        }

        // تعديل منتج
        function editProduct(productId) {
            const product = db.getProductById(productId);
            const newName = prompt('تعديل اسم المنتج:', product.name);
            if (newName) {
                const newPrice = prompt('تعديل السعر:', product.price);
                if (newPrice) {
                    db.updateProduct(productId, { 
                        name: newName, 
                        price: parseFloat(newPrice) 
                    });
                    loadProductsTable();
                    loadProducts();
                }
            }
        }

        // إضافة منتج جديد
        addProductBtn.addEventListener('click', function() {
            const name = productNameInput.value.trim();
            const price = parseFloat(productPriceInput.value);
            const barcode = productBarcodeInput.value.trim();
            const category = productCategoryInput.value;
            const stock = parseInt(productStockInput.value);
            
            if (!name || !price || !barcode || !stock) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            const newProduct = {
                name: name,
                price: price,
                barcode: barcode,
                category: category,
                image: `https://via.placeholder.com/80?text=${encodeURIComponent(name)}`,
                stock: stock,
                minStock: 5,
                wholesalePrice: price * 0.8 // سعر الجملة 80% من سعر التجزئة
            };
            
            db.addProduct(newProduct);
            loadProductsTable();
            loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
            
            // تفريغ الحقول
            productNameInput.value = '';
            productPriceInput.value = '';
            productBarcodeInput.value = '';
            productStockInput.value = '';
            
            alert('تم إضافة المنتج بنجاح!');
        });

        // تحميل صفحة تخزين الباركود
        function loadBarcodeMemoryPage() {
            // تحميل قائمة المنتجات في القائمة المنسدلة
            const products = db.getProducts();
            memoryProductSelect.innerHTML = '';
            
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - ${product.barcode}`;
                memoryProductSelect.appendChild(option);
            });
            
            // تحميل جدول الباركود المخزن
            const barcodeMemory = db.getBarcodeMemory();
            barcodeMemoryTable.innerHTML = '';
            
            barcodeMemory.forEach(item => {
                const product = db.getProductById(item.productId);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.barcode}</td>
                    <td>${product ? product.name : 'منتج غير معروف'}</td>
                    <td>${new Date(item.storedAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <button class="action-btn delete-btn" data-id="${item.id}"><i class="bi bi-trash"></i> حذف</button>
                    </td>
                `;
                barcodeMemoryTable.appendChild(row);
            });
            
            // إضافة أحداث لأزرار الحذف
            document.querySelectorAll('#barcodeMemoryTable .delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const barcodeId = parseInt(this.getAttribute('data-id'));
                    if (confirm('هل أنت متأكد من حذف هذا الباركود من الذاكرة؟')) {
                        db.removeBarcodeFromMemory(barcodeId);
                        loadBarcodeMemoryPage();
                    }
                });
            });
        }

        // حفظ الباركود في الذاكرة
        saveBarcodeBtn.addEventListener('click', function() {
            const barcode = memoryBarcodeInput.value.trim();
            const productId = parseInt(memoryProductSelect.value);
            
            if (!barcode || !productId) {
                alert('يرجى إدخال الباركود واختيار المنتج');
                return;
            }
            
            const barcodeData = {
                barcode: barcode,
                productId: productId
            };
            
            db.addBarcodeToMemory(barcodeData);
            loadBarcodeMemoryPage();
            
            memoryBarcodeInput.value = '';
            alert('تم حفظ الباركود في الذاكرة بنجاح!');
        });

        // تحميل صفحة الفواتير
        function loadInvoicesPage() {
            const sales = db.getSales();
            invoicesTableBody.innerHTML = '';
            
            sales.forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                    <td>${sale.cashier}</td>
                    <td>${sale.total.toFixed(2)} جنيه</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${sale.id}"><i class="bi bi-eye"></i> عرض التفاصيل</button>
                    </td>
                `;
                invoicesTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار العرض
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const saleId = parseInt(this.getAttribute('data-id'));
                    viewInvoiceDetails(saleId);
                });
            });
            
            // إضافة حدث البحث
            invoiceSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = invoicesTableBody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // عرض تفاصيل الفاتورة
        function viewInvoiceDetails(saleId) {
            const sales = db.getSales();
            const sale = sales.find(s => s.id === saleId);
            
            if (sale) {
                let itemsHtml = '';
                sale.items.forEach(item => {
                    itemsHtml += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price} جنيه</td>
                            <td>${(item.price * item.quantity).toFixed(2)} جنيه</td>
                        </tr>
                    `;
                });
                
                const invoiceDetails = `
                    <div class="invoice-details">
                        <h4>تفاصيل الفاتورة #${sale.id}</h4>
                        <p><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleString('ar-EG')}</p>
                        <p><strong>الكاشير:</strong> ${sale.cashier}</p>
                        <table class="invoice-items">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span>${sale.subtotal.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (14%):</span>
                            <span>${sale.tax.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row total">
                            <span>الإجمالي:</span>
                            <span>${sale.total.toFixed(2)} جنيه</span>
                        </div>
                    </div>
                `;
                
                // عرض التفاصيل في نافذة منبثقة
                alert(`تفاصيل الفاتورة #${saleId}\n\n${invoiceDetails.replace(/<[^>]*>/g, '')}`);
            }
        }

        // تحميل صفحة فواتير الجملة
        function loadWholesalePage() {
            // تحميل فواتير الجملة السابقة
            const wholesaleInvoices = db.getWholesaleInvoices();
            wholesaleTableBody.innerHTML = '';
            
            wholesaleInvoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.id}</td>
                    <td>${invoice.customer}</td>
                    <td>${new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                    <td>${invoice.discount}%</td>
                    <td>${invoice.total.toFixed(2)} جنيه</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${invoice.id}"><i class="bi bi-eye"></i> عرض</button>
                    </td>
                `;
                wholesaleTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار العرض
            document.querySelectorAll('#wholesaleTableBody .view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const invoiceId = parseInt(this.getAttribute('data-id'));
                    viewWholesaleInvoice(invoiceId);
                });
            });
        }

        // إضافة منتج إلى سلة الجملة
        function addProductToWholesaleCart(barcode) {
            const product = db.getProductByBarcode(barcode);
            if (product) {
                const existingItem = wholesaleCart.find(item => item.id === product.id);
                
                if (existingItem) {
                    if (existingItem.quantity < product.stock) {
                        existingItem.quantity += 1;
                    } else {
                        alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                        return;
                    }
                } else {
                    if (product.stock > 0) {
                        wholesaleCart.push({
                            id: product.id,
                            name: product.name,
                            price: product.wholesalePrice || product.price * 0.8, // استخدام سعر الجملة إذا موجود
                            image: product.image,
                            barcode: product.barcode,
                            quantity: 1,
                            stock: product.stock
                        });
                    } else {
                        alert('المنتج غير متوفر في المخزون!');
                        return;
                    }
                }
                
                updateWholesaleCart();
            } else {
                alert('المنتج غير موجود!');
            }
        }

        // تحديث سلة الجملة
        function updateWholesaleCart() {
            wholesaleCartItems.innerHTML = '';
            
            let subtotal = 0;
            
            wholesaleCart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <div>${item.name}</div>
                            <div>${item.price} جنيه (جملة)</div>
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease-btn"><i class="bi bi-dash"></i></button>
                        <span>${item.quantity}</span>
                        <button class="increase-btn"><i class="bi bi-plus"></i></button>
                    </div>
                    <div>${itemTotal.toFixed(2)} جنيه</div>
                    <button class="remove-item"><i class="bi bi-trash"></i></button>
                `;
                
                // إضافة أحداث للأزرار
                const decreaseBtn = cartItem.querySelector('.decrease-btn');
                const increaseBtn = cartItem.querySelector('.increase-btn');
                const removeBtn = cartItem.querySelector('.remove-item');
                
                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        updateWholesaleCart();
                    }
                });
                
                increaseBtn.addEventListener('click', () => {
                    const product = db.getProductById(item.id);
                    if (item.quantity < product.stock) {
                        item.quantity += 1;
                        updateWholesaleCart();
                    } else {
                        alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                    }
                });
                
                removeBtn.addEventListener('click', () => {
                    wholesaleCart = wholesaleCart.filter(cartItem => cartItem.id !== item.id);
                    updateWholesaleCart();
                });
                
                wholesaleCartItems.appendChild(cartItem);
            });
            
            // حساب الخصم والضريبة والإجمالي
            const discountRate = parseFloat(wholesaleDiscount.value) / 100;
            const discountAmount = subtotal * discountRate;
            const afterDiscount = subtotal - discountAmount;
            const tax = afterDiscount * 0.14;
            const total = afterDiscount + tax;
            
            wholesaleSubtotal.textContent = `${subtotal.toFixed(2)} جنيه`;
            wholesaleDiscountAmount.textContent = `${discountAmount.toFixed(2)} جنيه`;
            wholesaleTax.textContent = `${tax.toFixed(2)} جنيه`;
            wholesaleTotal.textContent = `${total.toFixed(2)} جنيه`;
        }

        // إضافة حدث لإضافة منتج إلى سلة الجملة
        addWholesaleProductBtn.addEventListener('click', function() {
            const barcode = wholesaleBarcode.value.trim();
            if (barcode) {
                addProductToWholesaleCart(barcode);
                wholesaleBarcode.value = '';
                wholesaleBarcode.focus();
            }
        });

        wholesaleBarcode.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const barcode = wholesaleBarcode.value.trim();
                if (barcode) {
                    addProductToWholesaleCart(barcode);
                    wholesaleBarcode.value = '';
                    wholesaleBarcode.focus();
                }
            }
        });

        // إتمام فاتورة الجملة
        wholesaleCheckoutBtn.addEventListener('click', function() {
            if (wholesaleCart.length === 0) {
                alert('سلة الجملة فارغة. أضف منتجات قبل إتمام الفاتورة.');
                return;
            }
            
            const customer = wholesaleCustomer.value.trim();
            if (!customer) {
                alert('يرجى إدخال اسم العميل');
                return;
            }
            
            const subtotal = parseFloat(wholesaleSubtotal.textContent);
            const discountAmount = parseFloat(wholesaleDiscountAmount.textContent);
            const tax = parseFloat(wholesaleTax.textContent);
            const total = parseFloat(wholesaleTotal.textContent);
            const discountRate = parseFloat(wholesaleDiscount.value);
            
            // حفظ فاتورة الجملة في قاعدة البيانات
            const invoiceId = db.addWholesaleInvoice({
                customer: customer,
                items: [...wholesaleCart],
                subtotal: subtotal,
                discount: discountRate,
                discountAmount: discountAmount,
                tax: tax,
                total: total,
                cashier: currentUser.username
            });
            
            // تحديث المخزون
            wholesaleCart.forEach(item => {
                db.updateProductStock(item.id, item.quantity);
            });
            
            alert(`تم إتمام فاتورة الجملة بنجاح! \nرقم الفاتورة: ${invoiceId} \nالمبلغ الإجمالي: ${total.toFixed(2)} جنيه`);
            
            // تفريغ سلة الجملة بعد إتمام الفاتورة
            wholesaleCart = [];
            wholesaleCustomer.value = '';
            updateWholesaleCart();
            loadWholesalePage(); // تحديث صفحة فواتير الجملة
            loadRecentTransactions(); // تحديث المعاملات الحديثة
        });

        // عرض فاتورة الجملة
        function viewWholesaleInvoice(invoiceId) {
            const invoices = db.getWholesaleInvoices();
            const invoice = invoices.find(i => i.id === invoiceId);
            
            if (invoice) {
                let itemsHtml = '';
                invoice.items.forEach(item => {
                    itemsHtml += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price} جنيه</td>
                            <td>${(item.price * item.quantity).toFixed(2)} جنيه</td>
                        </tr>
                    `;
                });
                
                const invoiceDetails = `
                    <div class="invoice-details">
                        <h4>تفاصيل فاتورة الجملة #${invoice.id}</h4>
                        <p><strong>العميل:</strong> ${invoice.customer}</p>
                        <p><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleString('ar-EG')}</p>
                        <p><strong>الكاشير:</strong> ${invoice.cashier}</p>
                        <table class="invoice-items">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span>${invoice.subtotal.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>خصم الجملة (${invoice.discount}%):</span>
                            <span>${invoice.discountAmount.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (14%):</span>
                            <span>${invoice.tax.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row total">
                            <span>الإجمالي:</span>
                            <span>${invoice.total.toFixed(2)} جنيه</span>
                        </div>
                    </div>
                `;
                
                alert(`تفاصيل فاتورة الجملة #${invoiceId}\n\n${invoiceDetails.replace(/<[^>]*>/g, '')}`);
            }
        }

        // تحديث سلة الجملة عند تغيير نسبة الخصم
        wholesaleDiscount.addEventListener('input', updateWholesaleCart);

        // تحميل صفحة المخزون
        function loadInventoryPage() {
            const products = db.getProducts();
            const inventoryLog = db.getInventoryLog();
            inventoryTableBody.innerHTML = '';
            
            products.forEach(product => {
                // الحصول على آخر تحديث للمخزون
                const lastUpdate = inventoryLog
                    .filter(log => log.productId === product.id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                
                const lastUpdateDate = lastUpdate ? new Date(lastUpdate.date).toLocaleDateString('ar-EG') : 'لا يوجد';
                
                // تحديد حالة المخزون
                let status = 'جيد';
                let statusClass = '';
                let statusIcon = 'bi-check-circle-fill';
                if (product.stock === 0) {
                    status = 'نفذ';
                    statusClass = 'stock-low';
                    statusIcon = 'bi-x-circle-fill';
                } else if (product.stock <= product.minStock) {
                    status = 'منخفض';
                    statusClass = 'stock-low';
                    statusIcon = 'bi-exclamation-triangle-fill';
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.barcode}</td>
                    <td>${product.stock}</td>
                    <td>${lastUpdateDate}</td>
                    <td class="${statusClass}"><i class="bi ${statusIcon}"></i> ${status}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${product.id}"><i class="bi bi-pencil"></i> تعديل المخزون</button>
                    </td>
                `;
                inventoryTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار التعديل
            document.querySelectorAll('#inventoryTableBody .edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    editInventory(productId);
                });
            });
            
            // إضافة حدث البحث
            inventorySearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = inventoryTableBody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // تعديل المخزون
        function editInventory(productId) {
            const product = db.getProductById(productId);
            const newStock = prompt(`إدارة مخزون ${product.name}\nالمخزون الحالي: ${product.stock}\nأدخل الكمية الجديدة:`, product.stock);
            
            if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                const stockChange = parseInt(newStock) - product.stock;
                const reason = prompt('سبب التعديل:', stockChange > 0 ? 'إضافة مخزون' : 'خصم مخزون');
                
                if (reason !== null) {
                    db.updateProduct(productId, { stock: parseInt(newStock) });
                    loadInventoryPage();
                    loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
                    alert('تم تحديث المخزون بنجاح!');
                }
            }
        }

        // تحميل صفحة التقارير
        function loadReportsPage() {
            const sales = db.getSales();
            const products = db.getProducts();
            const wholesaleInvoices = db.getWholesaleInvoices();
            
            // إحصائيات سريعة
            const totalSales = sales.length;
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
            const totalWholesale = wholesaleInvoices.length;
            const wholesaleRevenue = wholesaleInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
            const totalProducts = products.length;
            const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
            const outOfStockProducts = products.filter(p => p.stock === 0).length;
            
            document.getElementById('reportResults').innerHTML = `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4><i class="bi bi-graph-up"></i> إحصائيات سريعة</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--primary-color); margin-bottom: 10px;"><i class="bi bi-receipt"></i> فواتير التجزئة</h5>
                            <p style="font-size: 24px; font-weight: bold;">${totalSales}</p>
                            <p style="color: #666;">${totalRevenue.toFixed(2)} ج.م</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--secondary-color); margin-bottom: 10px;"><i class="bi bi-truck"></i> فواتير الجملة</h5>
                            <p style="font-size: 24px; font-weight: bold;">${totalWholesale}</p>
                            <p style="color: #666;">${wholesaleRevenue.toFixed(2)} ج.م</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--accent-color); margin-bottom: 10px;"><i class="bi bi-box"></i> إجمالي المنتجات</h5>
                            <p style="font-size: 24px; font-weight: bold;">${totalProducts}</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--danger-color); margin-bottom: 10px;"><i class="bi bi-exclamation-triangle"></i> منتجات منخفضة المخزون</h5>
                            <p style="font-size: 24px; font-weight: bold;">${lowStockProducts}</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--danger-color); margin-bottom: 10px;"><i class="bi bi-x-circle"></i> منتجات نفذت</h5>
                            <p style="font-size: 24px; font-weight: bold;">${outOfStockProducts}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // التركيز على حقل الباركود عند تحميل الصفحة
        window.addEventListener('load', function() {
            if (barcodeInput) {
                barcodeInput.focus();
            }
        });















        //هنا الكود الأصلي في حالة المسح 
          // نظام إدارة الجلسات
        class SessionManager {
            constructor() {
                this.currentSessionKey = 'currentSession';
            }

            // حفظ جلسة المستخدم
            saveSession(user, rememberMe = false) {
                const sessionData = {
                    user: user,
                    loginTime: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString() // 30 يوم إذا تم التذكر، يوم واحد إذا لم يتم
                };
                
                if (rememberMe) {
                    // استخدام localStorage للتذكر الدائم
                    localStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
                } else {
                    // استخدام sessionStorage للجلسة المؤقتة
                    sessionStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
                }
            }

            // استعادة جلسة المستخدم
            getSession() {
                // البحث في localStorage أولاً ثم sessionStorage
                let sessionData = localStorage.getItem(this.currentSessionKey);
                let storageType = 'localStorage';
                
                if (!sessionData) {
                    sessionData = sessionStorage.getItem(this.currentSessionKey);
                    storageType = 'sessionStorage';
                }
                
                if (!sessionData) return null;

                const session = JSON.parse(sessionData);
                
                // التحقق من انتهاء صلاحية الجلسة
                if (new Date() > new Date(session.expiresAt)) {
                    this.clearSession();
                    return null;
                }

                return session.user;
            }

            // مسح جلسة المستخدم
            clearSession() {
                localStorage.removeItem(this.currentSessionKey);
                sessionStorage.removeItem(this.currentSessionKey);
            }

            // تحديث وقت انتهاء الجلسة
            refreshSession() {
                // البحث في localStorage أولاً ثم sessionStorage
                let sessionData = localStorage.getItem(this.currentSessionKey);
                let storageType = 'localStorage';
                
                if (!sessionData) {
                    sessionData = sessionStorage.getItem(this.currentSessionKey);
                    storageType = 'sessionStorage';
                }
                
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    
                    if (storageType === 'localStorage') {
                        localStorage.setItem(this.currentSessionKey, JSON.stringify(session));
                    } else {
                        sessionStorage.setItem(this.currentSessionKey, JSON.stringify(session));
                    }
                }
            }
        }

        // قاعدة بيانات محلية باستخدام localStorage
        class Database {
            constructor() {
                this.initializeDatabase();
            }

            initializeDatabase() {
                // التحقق من وجود البيانات في localStorage
                if (!localStorage.getItem('users')) {
                    const users = [
                        { id: 1, username: "admin", password: "admin123", role: "admin" },
                        { id: 2, username: "cashier", password: "cashier123", role: "cashier" }
                    ];
                    localStorage.setItem('users', JSON.stringify(users));
                }

                if (!localStorage.getItem('products')) {
                    const products = this.generateProducts();
                    localStorage.setItem('products', JSON.stringify(products));
                }

                if (!localStorage.getItem('sales')) {
                    localStorage.setItem('sales', JSON.stringify([]));
                }

                if (!localStorage.getItem('barcodeMemory')) {
                    localStorage.setItem('barcodeMemory', JSON.stringify([]));
                }

                if (!localStorage.getItem('inventoryLog')) {
                    localStorage.setItem('inventoryLog', JSON.stringify([]));
                }

                if (!localStorage.getItem('wholesaleInvoices')) {
                    localStorage.setItem('wholesaleInvoices', JSON.stringify([]));
                }

                if (!localStorage.getItem('recentTransactions')) {
                    localStorage.setItem('recentTransactions', JSON.stringify([]));
                }
            }

            generateProducts() {
                const products = [];
                const categories = [
                    "مأكولات", "مشروبات", "منتجات الألبان", "الفواكه", "الخضروات", 
                    "اللحوم", "المخبوزات", "الحلويات", "الأدوات المنزلية", "العناية الشخصية"
                ];
                // صور حقيقية للمنتجات من Pexels (مجانية للاستخدام)
                const productImages = [
                    // فواكه
                    "https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=300", // برتقال
                    "https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=300", // تفاح
                    "https://images.pexels.com/photos/7195524/pexels-photo-7195524.jpeg?auto=compress&cs=tinysrgb&w=300", // موز
                    "https://images.pexels.com/photos/7195470/pexels-photo-7195470.jpeg?auto=compress&cs=tinysrgb&w=300", // فراولة
                    
                    // خضروات
                    "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300", // جزر
                    "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300", // طماطم
                    "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=300", // خس
                    "https://images.pexels.com/photos/4117746/pexels-photo-4117746.jpeg?auto=compress&cs=tinysrgb&w=300", // بصل
                    
                    // مأكولات
                    "https://images.pexels.com/photos/4109116/pexels-photo-4109116.jpeg?auto=compress&cs=tinysrgb&w=300", // أرز
                    "https://images.pexels.com/photos/4110097/pexels-photo-4110097.jpeg?auto=compress&cs=tinysrgb&w=300", // مكرونة
                    "https://images.pexels.com/photos/4108815/pexels-photo-4108815.jpeg?auto=compress&cs=tinysrgb&w=300", // دقيق
                    "https://images.pexels.com/photos/4108839/pexels-photo-4108839.jpeg?auto=compress&cs=tinysrgb&w=300", // سكر
                    
                    // مشروبات
                    "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300", // قهوة
                    "https://images.pexels.com/photos/312420/pexels-photo-312420.jpeg?auto=compress&cs=tinysrgb&w=300", // شاي
                    "https://images.pexels.com/photos/327095/pexels-photo-327095.jpeg?auto=compress&cs=tinysrgb&w=300", // عصير
                    "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=300", // مياه
                    
                    // منتجات الألبان
                    "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300", // حليب
                    "https://images.pexels.com/photos/5410322/pexels-photo-5410322.jpeg?auto=compress&cs=tinysrgb&w=300", // جبن
                    "https://images.pexels.com/photos/5410328/pexels-photo-5410328.jpeg?auto=compress&cs=tinysrgb&w=300", // زبادي
                    "https://images.pexels.com/photos/5410325/pexels-photo-5410325.jpeg?auto=compress&cs=tinysrgb&w=300", // زبدة
                    
                    // لحوم
                    "https://images.pexels.com/photos/618775/pexels-photo-618775.jpeg?auto=compress&cs=tinysrgb&w=300", // لحم
                    "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=300", // دجاج
                    "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=300", // سمك
                    
                    // مخبوزات
                    "https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=300", // خبز
                    "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=300", // كعك
                    "https://images.pexels.com/photos/4791267/pexels-photo-4791267.jpeg?auto=compress&cs=tinysrgb&w=300", // بسكويت
                    
                    // حلويات
                    "https://images.pexels.com/photos/2144200/pexels-photo-2144200.jpeg?auto=compress&cs=tinysrgb&w=300", // شوكولاتة
                    "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=300", // حلوى
                    "https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=300", // آيس كريم
                    
                    // أدوات منزلية
                    "https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=300", // منظفات
                    "https://images.pexels.com/photos/545014/pexels-photo-545014.jpeg?auto=compress&cs=tinysrgb&w=300", // ورق
                    "https://images.pexels.com/photos/4481257/pexels-photo-4481257.jpeg?auto=compress&cs=tinysrgb&w=300", // أدوات مطبخ
                    
                    // عناية شخصية
                    "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=300", // شامبو
                    "https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=300", // صابون
                    "https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg?auto=compress&cs=tinysrgb&w=300"  // معجون أسنان
                ];

                // أسماء منتجات حقيقية
                const productNames = {
                    "مأكولات": ["أرز مصرى", "سكر أبيض", "دقيق القمح", "زيت زيتون", "عسل نحل", "معكرونة", "عدس أصفر", "فول مدمس", "حمص شامي", "فاصوليا بيضاء"],
                    "مشروبات": ["شاي أحمد", "قهوة تركية", "نسكافيه", "عصير برتقال", "مياه معدنية", "بيبسي", "سفن أب", "شاي ليبتون", "قهوة نسكافيه", "عصير مانجو"],
                    "منتجات الألبان": ["حليب طازج", "جبنة رومي", "زبادي طبيعي", "قشطة", "لبنة", "جبنة فيتا", "حليب مجفف", "زبدة", "جبنة شيدر", "روب"],
                    "الفواكه": ["تفاح", "برتقال", "موز", "فراولة", "عنب", "مانجو", "بطيخ", "شمام", "كمثرى", "خوخ"],
                    "الخضروات": ["طماطم", "خيار", "جزر", "بصل", "ثوم", "فلفل رومي", "بطاطس", "باذنجان", "كوسة", "خس"],
                    "اللحوم": ["لحم بقري", "لحم ضأن", "دجاج طازج", "سمك بلطي", "جمبري", "كبدة", "لحم مفروم", "دجاج مجمد", "سجق", "همبرجر"],
                    "المخبوزات": ["خبز بلدي", "خبز توست", "كعك", "بسكويت", "كرواسون", "دونات", "كيك", "معمول", "بقلاوة", "كنافة"],
                    "الحلويات": ["شوكولاتة", "حلوى جيلي", "آيس كريم", "مهلبية", "أم علي", "بسبوسة", "قطايف", "لقيمات", "حلاوة طحينية", "ملبن"],
                    "الأدوات المنزلية": ["صابون أطباق", "منظف زجاج", "مطهر أرضيات", "منعم أقمشة", "كلور", "إسفنج", "مناديل ورقية", "أكياس قمامة", "شمع", "معطر جو"],
                    "العناية الشخصية": ["شامبو", "بلسم", "صابون", "معجون أسنان", "فرشاة أسنان", "مزيل عرق", "غسول وجه", "كريم ترطيب", "مستحضر حلاقة", "مناديل مبللة"]
                };

                for (let i = 1; i <= 100; i++) {
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    const categoryProducts = productNames[category];
                    const productName = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
                    
                    // اختيار صورة عشوائية من مجموعة الصور المتاحة
                    const randomImage = productImages[Math.floor(Math.random() * productImages.length)];
                    
                    products.push({
                        id: i,
                        name: productName,
                        price: Math.floor(Math.random() * 100) + 1,
                        barcode: this.generateBarcode(),
                        category: category,
                        image: randomImage,
                        stock: Math.floor(Math.random() * 100) + 10,
                        minStock: 5,
                        wholesalePrice: Math.floor(Math.random() * 80) + 1 // سعر الجملة
                    });
                }
                return products;
            }

            generateBarcode() {
                return 'EG' + Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
            }

            // وظائف المستخدمين
            getUsers() {
                return JSON.parse(localStorage.getItem('users')) || [];
            }

            // وظائف المنتجات
            getProducts() {
                return JSON.parse(localStorage.getItem('products')) || [];
            }

            getProductByBarcode(barcode) {
                const products = this.getProducts();
                return products.find(product => product.barcode === barcode);
            }

            getProductById(id) {
                const products = this.getProducts();
                return products.find(product => product.id === parseInt(id));
            }

            addProduct(product) {
                const products = this.getProducts();
                product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                products.push(product);
                localStorage.setItem('products', JSON.stringify(products));
                
                // تسجيل في سجل المخزون
                this.addInventoryLog({
                    productId: product.id,
                    productName: product.name,
                    change: product.stock,
                    type: 'add',
                    reason: 'إضافة منتج جديد',
                    date: new Date().toISOString()
                });
                
                return product.id;
            }

            updateProduct(productId, updatedData) {
                const products = this.getProducts();
                const productIndex = products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    const oldStock = products[productIndex].stock;
                    products[productIndex] = { ...products[productIndex], ...updatedData };
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    // تسجيل في سجل المخزون إذا تغير المخزون
                    if (oldStock !== updatedData.stock) {
                        this.addInventoryLog({
                            productId: productId,
                            productName: products[productIndex].name,
                            change: updatedData.stock - oldStock,
                            type: updatedData.stock > oldStock ? 'add' : 'subtract',
                            reason: 'تعديل المخزون',
                            date: new Date().toISOString()
                        });
                    }
                    
                    return true;
                }
                return false;
            }

            deleteProduct(productId) {
                const products = this.getProducts();
                const product = products.find(p => p.id === productId);
                const filteredProducts = products.filter(p => p.id !== productId);
                localStorage.setItem('products', JSON.stringify(filteredProducts));
                
                // تسجيل في سجل المخزون
                this.addInventoryLog({
                    productId: productId,
                    productName: product.name,
                    change: -product.stock,
                    type: 'subtract',
                    reason: 'حذف المنتج',
                    date: new Date().toISOString()
                });
                
                return true;
            }

            updateProductStock(productId, quantity) {
                const products = this.getProducts();
                const productIndex = products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    const oldStock = products[productIndex].stock;
                    products[productIndex].stock -= quantity;
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    // تسجيل في سجل المخزون
                    this.addInventoryLog({
                        productId: productId,
                        productName: products[productIndex].name,
                        change: -quantity,
                        type: 'subtract',
                        reason: 'بيع منتج',
                        date: new Date().toISOString()
                    });
                }
            }

            // وظائف المبيعات
            getSales() {
                return JSON.parse(localStorage.getItem('sales')) || [];
            }

            addSale(saleData) {
                const sales = this.getSales();
                saleData.id = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
                saleData.date = new Date().toISOString();
                sales.push(saleData);
                localStorage.setItem('sales', JSON.stringify(sales));

                // إضافة إلى المعاملات الحديثة
                this.addRecentTransaction({
                    type: 'بيع',
                    amount: saleData.total,
                    details: `${saleData.items.length} منتج`,
                    cashier: saleData.cashier,
                    time: new Date().toISOString()
                });
                
                return saleData.id;
            }

            // وظائف فواتير الجملة
            getWholesaleInvoices() {
                return JSON.parse(localStorage.getItem('wholesaleInvoices')) || [];
            }

            addWholesaleInvoice(invoiceData) {
                const invoices = this.getWholesaleInvoices();
                invoiceData.id = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
                invoiceData.date = new Date().toISOString();
                invoices.push(invoiceData);
                localStorage.setItem('wholesaleInvoices', JSON.stringify(invoices));

                // إضافة إلى المعاملات الحديثة
                this.addRecentTransaction({
                    type: 'جملة',
                    amount: invoiceData.total,
                    details: `عميل: ${invoiceData.customer}`,
                    cashier: invoiceData.cashier,
                    time: new Date().toISOString()
                });
                
                return invoiceData.id;
            }

            // وظائف المعاملات الحديثة
            getRecentTransactions() {
                return JSON.parse(localStorage.getItem('recentTransactions')) || [];
            }

            addRecentTransaction(transaction) {
                const transactions = this.getRecentTransactions();
                transactions.unshift(transaction);
                // الاحتفاظ فقط بآخر 100 معاملة
                if (transactions.length > 100) {
                    transactions.pop();
                }
                localStorage.setItem('recentTransactions', JSON.stringify(transactions));
                return transaction;
            }

            // وظائف ذاكرة الباركود
            getBarcodeMemory() {
                return JSON.parse(localStorage.getItem('barcodeMemory')) || [];
            }

            addBarcodeToMemory(barcodeData) {
                const barcodeMemory = this.getBarcodeMemory();
                barcodeData.id = barcodeMemory.length > 0 ? Math.max(...barcodeMemory.map(b => b.id)) + 1 : 1;
                barcodeData.storedAt = new Date().toISOString();
                barcodeMemory.push(barcodeData);
                localStorage.setItem('barcodeMemory', JSON.stringify(barcodeMemory));
                return barcodeData.id;
            }

            removeBarcodeFromMemory(barcodeId) {
                const barcodeMemory = this.getBarcodeMemory();
                const filteredMemory = barcodeMemory.filter(b => b.id !== barcodeId);
                localStorage.setItem('barcodeMemory', JSON.stringify(filteredMemory));
                return true;
            }

            // وظائف سجل المخزون
            getInventoryLog() {
                return JSON.parse(localStorage.getItem('inventoryLog')) || [];
            }

            addInventoryLog(logData) {
                const inventoryLog = this.getInventoryLog();
                logData.id = inventoryLog.length > 0 ? Math.max(...inventoryLog.map(l => l.id)) + 1 : 1;
                inventoryLog.push(logData);
                localStorage.setItem('inventoryLog', JSON.stringify(inventoryLog));
                return logData.id;
            }
        }

        // إنشاء كائن قاعدة البيانات
        const db = new Database();

        // بيانات المستخدمين المسموح لهم بالدخول
        const users = db.getUsers();

        // سلة المشتريات
        let cart = [];
        let wholesaleCart = [];
        let currentUser = null;

        // عناصر DOM
        const loginPage = document.getElementById('loginPage');
        const dashboard = document.getElementById('dashboard');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const userDisplay = document.getElementById('userDisplay');
        const transactionsList = document.getElementById('transactionsList');

        // صفحات النظام
        const cashierPage = document.getElementById('cashierPage');
        const productsPage = document.getElementById('productsPage');
        const barcodeMemoryPage = document.getElementById('barcodeMemoryPage');
        const invoicesPage = document.getElementById('invoicesPage');
        const wholesalePage = document.getElementById('wholesalePage');
        const inventoryPage = document.getElementById('inventoryPage');
        const reportsPage = document.getElementById('reportsPage');

        // عناصر صفحة الكاشير
        const barcodeInput = document.getElementById('barcodeInput');
        const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
        const productsGrid = document.getElementById('productsGrid');
        const cartItems = document.getElementById('cartItems');
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');

        // عناصر صفحة إدارة المنتجات
        const productNameInput = document.getElementById('productName');
        const productPriceInput = document.getElementById('productPrice');
        const productBarcodeInput = document.getElementById('productBarcode');
        const productCategoryInput = document.getElementById('productCategory');
        const productStockInput = document.getElementById('productStock');
        const addProductBtn = document.getElementById('addProductBtn');
        const productsTableBody = document.getElementById('productsTableBody');

        // عناصر صفحة تخزين الباركود
        const memoryBarcodeInput = document.getElementById('memoryBarcode');
        const memoryProductSelect = document.getElementById('memoryProduct');
        const saveBarcodeBtn = document.getElementById('saveBarcodeBtn');
        const barcodeMemoryTable = document.getElementById('barcodeMemoryTable');

        // عناصر صفحة الفواتير
        const invoiceSearch = document.getElementById('invoiceSearch');
        const invoicesTableBody = document.getElementById('invoicesTableBody');

        // عناصر صفحة فواتير الجملة
        const wholesaleCustomer = document.getElementById('wholesaleCustomer');
        const wholesaleDiscount = document.getElementById('wholesaleDiscount');
        const wholesaleBarcode = document.getElementById('wholesaleBarcode');
        const addWholesaleProductBtn = document.getElementById('addWholesaleProductBtn');
        const wholesaleCartItems = document.getElementById('wholesaleCartItems');
        const wholesaleSubtotal = document.getElementById('wholesaleSubtotal');
        const wholesaleDiscountAmount = document.getElementById('wholesaleDiscountAmount');
        const wholesaleTax = document.getElementById('wholesaleTax');
        const wholesaleTotal = document.getElementById('wholesaleTotal');
        const wholesaleCheckoutBtn = document.getElementById('wholesaleCheckoutBtn');
        const wholesaleTableBody = document.getElementById('wholesaleTableBody');

        // عناصر صفحة المخزون
        const inventorySearch = document.getElementById('inventorySearch');
        const inventoryTableBody = document.getElementById('inventoryTableBody');

        // التحقق من وجود جلسة سابقة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            const sessionManager = new SessionManager();
            const savedUser = sessionManager.getSession();
            
            if (savedUser) {
                // استعادة الجلسة
                currentUser = savedUser;
                loginPage.style.display = 'none';
                dashboard.style.display = 'block';
                userDisplay.textContent = `مرحباً، ${savedUser.username}`;
                loadSidebarMenu();
                showPage('cashierPage');
                loadProducts();
                loadRecentTransactions();
                
                // تحديث وقت انتهاء الجلسة
                sessionManager.refreshSession();
                
                if (barcodeInput) {
                    barcodeInput.focus();
                }
            } else {
                loginPage.style.display = 'flex';
                dashboard.style.display = 'none';
            }
        });

        // وظيفة تسجيل الدخول
        loginBtn.addEventListener('click', function() {
            const username = usernameInput.value;
            const password = passwordInput.value;
            const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
            
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                currentUser = user;
                
                // حفظ الجلسة مع خاصية تذكرني
                const sessionManager = new SessionManager();
                sessionManager.saveSession(user, rememberMe);
                
                loginPage.style.display = 'none';
                dashboard.style.display = 'block';
                userDisplay.textContent = `مرحباً، ${username}`;
                loadSidebarMenu();
                showPage('cashierPage');
                loadProducts();
                loadRecentTransactions();
                barcodeInput.focus();
            } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        });

        // وظيفة تسجيل الخروج
        logoutBtn.addEventListener('click', function() {
            dashboard.style.display = 'none';
            loginPage.style.display = 'flex';
            usernameInput.value = '';
            passwordInput.value = '';
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = false;
            }
            cart = [];
            wholesaleCart = [];
            updateCart();
            updateWholesaleCart();
            currentUser = null;
            
            // مسح الجلسة من SessionManager
            const sessionManager = new SessionManager();
            sessionManager.clearSession();
        });

        // السماح بالدخول باستخدام زر Enter
        passwordInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                loginBtn.click();
            }
        });

        // تحميل القائمة الجانبية حسب صلاحية المستخدم
        function loadSidebarMenu() {
            sidebarMenu.innerHTML = '';
            
    // عناصر القائمة الأساسية للجميع
            const baseMenuItems = [
                { id: 'cashierPage', name: 'نقطة البيع', icon: 'bi-cash-register' },
                { id: 'invoicesPage', name: 'الفواتير', icon: 'bi-receipt' }
            ];
            
            // عناصر القائمة للإدمن فقط
            const adminMenuItems = [
                { id: 'productsPage', name: 'إدارة المنتجات', icon: 'bi-boxes' },
                { id: 'barcodeMemoryPage', name: 'تخزين الباركود', icon: 'bi-memory' },
                { id: 'wholesalePage', name: 'فواتير الجملة', icon: 'bi-truck' },
                { id: 'inventoryPage', name: 'إدارة المخزون', icon: 'bi-bar-chart' },
                { id: 'reportsPage', name: 'التقارير', icon: 'bi-pie-chart' }
            ];

   // إضافة عناصر القائمة الأساسية
            baseMenuItems.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" data-page="${item.id}"><i class="bi ${item.icon}"></i> ${item.name}</a>`;
                sidebarMenu.appendChild(li);
            });
            
            // إضافة عناصر القائمة للإدمن فقط
            if (currentUser && currentUser.role === 'admin') {
                adminMenuItems.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#" data-page="${item.id}"><i class="bi ${item.icon}"></i> ${item.name}</a>`;
                    sidebarMenu.appendChild(li);
                });
            }            
            // إضافة أحداث النقر لعناصر القائمة
            const menuLinks = sidebarMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('data-page');
                    showPage(pageId);
                    
                    // تحديث العنصر النشط في القائمة
                    menuLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // تفعيل العنصر الأول في القائمة
            if (menuLinks.length > 0) {
                menuLinks[0].classList.add('active');
            }
        }

        // تحميل المعاملات الحديثة
        function loadRecentTransactions() {
            const transactions = db.getRecentTransactions();
            transactionsList.innerHTML = '';
            
            transactions.forEach(transaction => {
                const li = document.createElement('li');
                li.className = 'transaction-item';
                li.innerHTML = `
                    <div class="transaction-info">
                        <h4>${transaction.type} - ${transaction.details}</h4>
                        <p>${transaction.cashier}</p>
                        <div class="transaction-time">${new Date(transaction.time).toLocaleTimeString('ar-EG')}</div>
                    </div>
                    <div class="transaction-amount">${transaction.amount.toFixed(2)} ج.م</div>
                `;
                transactionsList.appendChild(li);
            });
        }

        // عرض الصفحة المحددة
        function showPage(pageId) {
            // إخفاء جميع الصفحات
            cashierPage.style.display = 'none';
            productsPage.style.display = 'none';
            barcodeMemoryPage.style.display = 'none';
            invoicesPage.style.display = 'none';
            wholesalePage.style.display = 'none';
            inventoryPage.style.display = 'none';
            reportsPage.style.display = 'none';
            
            // عرض الصفحة المحددة
            document.getElementById(pageId).style.display = 'block';
            
            // تحميل البيانات الخاصة بكل صفحة عند عرضها
            if (pageId === 'productsPage') {
                loadProductsTable();
            } else if (pageId === 'barcodeMemoryPage') {
                loadBarcodeMemoryPage();
            } else if (pageId === 'invoicesPage') {
                loadInvoicesPage();
            } else if (pageId === 'wholesalePage') {
                loadWholesalePage();
            } else if (pageId === 'inventoryPage') {
                loadInventoryPage();
            } else if (pageId === 'reportsPage') {
                loadReportsPage();
            }
        }

        // مسح الباركود
        scanBarcodeBtn.addEventListener('click', function() {
            const barcode = barcodeInput.value.trim();
            if (barcode) {
                searchByBarcode(barcode);
            }
        });

        barcodeInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const barcode = barcodeInput.value.trim();
                if (barcode) {
                    searchByBarcode(barcode);
                }
            }
        });

        // البحث بالباركود
        function searchByBarcode(barcode) {
            const product = db.getProductByBarcode(barcode);
            if (product) {
                addToCart(product);
                barcodeInput.value = '';
                barcodeInput.focus();
            } else {
                alert('المنتج غير موجود!');
            }
        }

        // تحميل المنتجات
        function loadProducts() {
            const products = db.getProducts();
            productsGrid.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // إضافة تحذير إذا كان المخزون منخفضاً
                const stockWarning = product.stock <= product.minStock ? `<div class="stock-low">منخفض (${product.stock})</div>` : '';
                
                productCard.innerHTML = `
                    <img src="${product.image}" onerror="this.src='https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=300'" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <div class="price">${product.price} جنيه</div>
                    <div class="barcode">${product.barcode}</div>
                    ${stockWarning}
                `;
                
                productCard.addEventListener('click', () => addToCart(product));
                
                productsGrid.appendChild(productCard);
            });
        }

        // إضافة منتج إلى السلة
        function addToCart(product) {
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    existingItem.quantity += 1;
                } else {
                    alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                    return;
                }
            } else {
                if (product.stock > 0) {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        barcode: product.barcode,
                        quantity: 1,
                        stock: product.stock
                    });
                } else {
                    alert('المنتج غير متوفر في المخزون!');
                    return;
                }
            }
            
            updateCart();
        }

        // تحديث السلة
        function updateCart() {
            cartItems.innerHTML = '';
            
            let subtotal = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <div>${item.name}</div>
                            <div>${item.price} جنيه</div>
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease-btn">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-btn">+</button>
                    </div>
                    <div>${itemTotal.toFixed(2)} جنيه</div>
                    <button class="remove-item">×</button>
                `;
                
                // إضافة أحداث للأزرار
                const decreaseBtn = cartItem.querySelector('.decrease-btn');
                const increaseBtn = cartItem.querySelector('.increase-btn');
                const removeBtn = cartItem.querySelector('.remove-item');
                
                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        updateCart();
                    }
                });
                
                increaseBtn.addEventListener('click', () => {
                    const product = db.getProductById(item.id);
                    if (item.quantity < product.stock) {
                        item.quantity += 1;
                        updateCart();
                    } else {
                        alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                    }
                });
                
                removeBtn.addEventListener('click', () => {
                    cart = cart.filter(cartItem => cartItem.id !== item.id);
                    updateCart();
                });
                
                cartItems.appendChild(cartItem);
            });
            
            // حساب الضريبة والإجمالي
            const tax = subtotal * 0.14;
            const total = subtotal + tax;
            
            subtotalElement.textContent = `${subtotal.toFixed(2)} جنيه`;
            taxElement.textContent = `${tax.toFixed(2)} جنيه`;
            totalElement.textContent = `${total.toFixed(2)} جنيه`;
        }

        // إتمام عملية الشراء
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('السلة فارغة. أضف منتجات قبل إتمام الشراء.');
                return;
            }
            
            const subtotal = parseFloat(subtotalElement.textContent);
            const tax = parseFloat(taxElement.textContent);
            const total = parseFloat(totalElement.textContent);
            
            // حفظ عملية البيع في قاعدة البيانات
            const saleId = db.addSale({
                items: [...cart],
                subtotal: subtotal,
                tax: tax,
                total: total,
                cashier: currentUser.username
            });
            
            // تحديث المخزون
            cart.forEach(item => {
                db.updateProductStock(item.id, item.quantity);
            });
            
            alert(`تم إتمام عملية الشراء بنجاح! \nرقم الفاتورة: ${saleId} \nالمبلغ الإجمالي: ${total.toFixed(2)} جنيه`);
            
            // تفريغ السلة بعد إتمام الشراء
            cart = [];
            updateCart();
            loadProducts(); // إعادة تحميل المنتجات لتحديث المخزون
            loadRecentTransactions(); // تحديث المعاملات الحديثة
        });

        // تحميل جدول المنتجات في صفحة الإدارة
        function loadProductsTable() {
            const products = db.getProducts();
            productsTableBody.innerHTML = '';
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.barcode}</td>
                    <td>${product.name}</td>
                    <td>${product.price} جنيه</td>
                    <td>${product.stock}</td>
                    <td>${product.category}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${product.id}">تعديل</button>
                        <button class="action-btn delete-btn" data-id="${product.id}">حذف</button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار التعديل والحذف
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                        db.deleteProduct(productId);
                        loadProductsTable();
                        loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
                    }
                });
            });
        }

        // تعديل منتج
        function editProduct(productId) {
            const product = db.getProductById(productId);
            const newName = prompt('تعديل اسم المنتج:', product.name);
            if (newName) {
                const newPrice = prompt('تعديل السعر:', product.price);
                if (newPrice) {
                    db.updateProduct(productId, { 
                        name: newName, 
                        price: parseFloat(newPrice) 
                    });
                    loadProductsTable();
                    loadProducts();
                }
            }
        }

        // إضافة منتج جديد
        addProductBtn.addEventListener('click', function() {
            const name = productNameInput.value.trim();
            const price = parseFloat(productPriceInput.value);
            const barcode = productBarcodeInput.value.trim();
            const category = productCategoryInput.value;
            const stock = parseInt(productStockInput.value);
            
            if (!name || !price || !barcode || !stock) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            const newProduct = {
                name: name,
                price: price,
                barcode: barcode,
                category: category,
                image: `https://via.placeholder.com/80?text=${encodeURIComponent(name)}`,
                stock: stock,
                minStock: 5,
                wholesalePrice: price * 0.8 // سعر الجملة 80% من سعر التجزئة
            };
            
            db.addProduct(newProduct);
            loadProductsTable();
            loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
            
            // تفريغ الحقول
            productNameInput.value = '';
            productPriceInput.value = '';
            productBarcodeInput.value = '';
            productStockInput.value = '';
            
            alert('تم إضافة المنتج بنجاح!');
        });

        // تحميل صفحة تخزين الباركود
        function loadBarcodeMemoryPage() {
            // تحميل قائمة المنتجات في القائمة المنسدلة
            const products = db.getProducts();
            memoryProductSelect.innerHTML = '';
            
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - ${product.barcode}`;
                memoryProductSelect.appendChild(option);
            });
            
            // تحميل جدول الباركود المخزن
            const barcodeMemory = db.getBarcodeMemory();
            barcodeMemoryTable.innerHTML = '';
            
            barcodeMemory.forEach(item => {
                const product = db.getProductById(item.productId);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.barcode}</td>
                    <td>${product ? product.name : 'منتج غير معروف'}</td>
                    <td>${new Date(item.storedAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <button class="action-btn delete-btn" data-id="${item.id}">حذف</button>
                    </td>
                `;
                barcodeMemoryTable.appendChild(row);
            });
            
            // إضافة أحداث لأزرار الحذف
            document.querySelectorAll('#barcodeMemoryTable .delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const barcodeId = parseInt(this.getAttribute('data-id'));
                    if (confirm('هل أنت متأكد من حذف هذا الباركود من الذاكرة؟')) {
                        db.removeBarcodeFromMemory(barcodeId);
                        loadBarcodeMemoryPage();
                    }
                });
            });
        }

        // حفظ الباركود في الذاكرة
        saveBarcodeBtn.addEventListener('click', function() {
            const barcode = memoryBarcodeInput.value.trim();
            const productId = parseInt(memoryProductSelect.value);
            
            if (!barcode || !productId) {
                alert('يرجى إدخال الباركود واختيار المنتج');
                return;
            }
            
            const barcodeData = {
                barcode: barcode,
                productId: productId
            };
            
            db.addBarcodeToMemory(barcodeData);
            loadBarcodeMemoryPage();
            
            memoryBarcodeInput.value = '';
            alert('تم حفظ الباركود في الذاكرة بنجاح!');
        });

        // تحميل صفحة الفواتير
        function loadInvoicesPage() {
            const sales = db.getSales();
            invoicesTableBody.innerHTML = '';
            
            sales.forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                    <td>${sale.cashier}</td>
                    <td>${sale.total.toFixed(2)} جنيه</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${sale.id}">عرض التفاصيل</button>
                    </td>
                `;
                invoicesTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار العرض
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const saleId = parseInt(this.getAttribute('data-id'));
                    viewInvoiceDetails(saleId);
                });
            });
            
            // إضافة حدث البحث
            invoiceSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = invoicesTableBody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // عرض تفاصيل الفاتورة
        function viewInvoiceDetails(saleId) {
            const sales = db.getSales();
            const sale = sales.find(s => s.id === saleId);
            
            if (sale) {
                let itemsHtml = '';
                sale.items.forEach(item => {
                    itemsHtml += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price} جنيه</td>
                            <td>${(item.price * item.quantity).toFixed(2)} جنيه</td>
                        </tr>
                    `;
                });
                
                const invoiceDetails = `
                    <div class="invoice-details">
                        <h4>تفاصيل الفاتورة #${sale.id}</h4>
                        <p><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleString('ar-EG')}</p>
                        <p><strong>الكاشير:</strong> ${sale.cashier}</p>
                        <table class="invoice-items">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span>${sale.subtotal.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (14%):</span>
                            <span>${sale.tax.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row total">
                            <span>الإجمالي:</span>
                            <span>${sale.total.toFixed(2)} جنيه</span>
                        </div>
                    </div>
                `;
                
                // عرض التفاصيل في نافذة منبثقة
                alert(`تفاصيل الفاتورة #${saleId}\n\n${invoiceDetails.replace(/<[^>]*>/g, '')}`);
            }
        }

        // تحميل صفحة فواتير الجملة
        function loadWholesalePage() {
            // تحميل فواتير الجملة السابقة
            const wholesaleInvoices = db.getWholesaleInvoices();
            wholesaleTableBody.innerHTML = '';
            
            wholesaleInvoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.id}</td>
                    <td>${invoice.customer}</td>
                    <td>${new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                    <td>${invoice.discount}%</td>
                    <td>${invoice.total.toFixed(2)} جنيه</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${invoice.id}">عرض</button>
                    </td>
                `;
                wholesaleTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار العرض
            document.querySelectorAll('#wholesaleTableBody .view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const invoiceId = parseInt(this.getAttribute('data-id'));
                    viewWholesaleInvoice(invoiceId);
                });
            });
        }

        // إضافة منتج إلى سلة الجملة
        function addProductToWholesaleCart(barcode) {
            const product = db.getProductByBarcode(barcode);
            if (product) {
                const existingItem = wholesaleCart.find(item => item.id === product.id);
                
                if (existingItem) {
                    if (existingItem.quantity < product.stock) {
                        existingItem.quantity += 1;
                    } else {
                        alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                        return;
                    }
                } else {
                    if (product.stock > 0) {
                        wholesaleCart.push({
                            id: product.id,
                            name: product.name,
                            price: product.wholesalePrice || product.price * 0.8, // استخدام سعر الجملة إذا موجود
                            image: product.image,
                            barcode: product.barcode,
                            quantity: 1,
                            stock: product.stock
                        });
                    } else {
                        alert('المنتج غير متوفر في المخزون!');
                        return;
                    }
                }
                
                updateWholesaleCart();
            } else {
                alert('المنتج غير موجود!');
            }
        }

        // تحديث سلة الجملة
        function updateWholesaleCart() {
            wholesaleCartItems.innerHTML = '';
            
            let subtotal = 0;
            
            wholesaleCart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <div>${item.name}</div>
                            <div>${item.price} جنيه (جملة)</div>
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease-btn">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-btn">+</button>
                    </div>
                    <div>${itemTotal.toFixed(2)} جنيه</div>
                    <button class="remove-item">×</button>
                `;
                
                // إضافة أحداث للأزرار
                const decreaseBtn = cartItem.querySelector('.decrease-btn');
                const increaseBtn = cartItem.querySelector('.increase-btn');
                const removeBtn = cartItem.querySelector('.remove-item');
                
                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        updateWholesaleCart();
                    }
                });
                
                increaseBtn.addEventListener('click', () => {
                    const product = db.getProductById(item.id);
                    if (item.quantity < product.stock) {
                        item.quantity += 1;
                        updateWholesaleCart();
                    } else {
                        alert(`لا يوجد مخزون كافي! المخزون المتاح: ${product.stock}`);
                    }
                });
                
                removeBtn.addEventListener('click', () => {
                    wholesaleCart = wholesaleCart.filter(cartItem => cartItem.id !== item.id);
                    updateWholesaleCart();
                });
                
                wholesaleCartItems.appendChild(cartItem);
            });
            
            // حساب الخصم والضريبة والإجمالي
            const discountRate = parseFloat(wholesaleDiscount.value) / 100;
            const discountAmount = subtotal * discountRate;
            const afterDiscount = subtotal - discountAmount;
            const tax = afterDiscount * 0.14;
            const total = afterDiscount + tax;
            
            wholesaleSubtotal.textContent = `${subtotal.toFixed(2)} جنيه`;
            wholesaleDiscountAmount.textContent = `${discountAmount.toFixed(2)} جنيه`;
            wholesaleTax.textContent = `${tax.toFixed(2)} جنيه`;
            wholesaleTotal.textContent = `${total.toFixed(2)} جنيه`;
        }

        // إضافة حدث لإضافة منتج إلى سلة الجملة
        addWholesaleProductBtn.addEventListener('click', function() {
            const barcode = wholesaleBarcode.value.trim();
            if (barcode) {
                addProductToWholesaleCart(barcode);
                wholesaleBarcode.value = '';
                wholesaleBarcode.focus();
            }
        });

        wholesaleBarcode.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const barcode = wholesaleBarcode.value.trim();
                if (barcode) {
                    addProductToWholesaleCart(barcode);
                    wholesaleBarcode.value = '';
                    wholesaleBarcode.focus();
                }
            }
        });

        // إتمام فاتورة الجملة
        wholesaleCheckoutBtn.addEventListener('click', function() {
            if (wholesaleCart.length === 0) {
                alert('سلة الجملة فارغة. أضف منتجات قبل إتمام الفاتورة.');
                return;
            }
            
            const customer = wholesaleCustomer.value.trim();
            if (!customer) {
                alert('يرجى إدخال اسم العميل');
                return;
            }
            
            const subtotal = parseFloat(wholesaleSubtotal.textContent);
            const discountAmount = parseFloat(wholesaleDiscountAmount.textContent);
            const tax = parseFloat(wholesaleTax.textContent);
            const total = parseFloat(wholesaleTotal.textContent);
            const discountRate = parseFloat(wholesaleDiscount.value);
            
            // حفظ فاتورة الجملة في قاعدة البيانات
            const invoiceId = db.addWholesaleInvoice({
                customer: customer,
                items: [...wholesaleCart],
                subtotal: subtotal,
                discount: discountRate,
                discountAmount: discountAmount,
                tax: tax,
                total: total,
                cashier: currentUser.username
            });
            
            // تحديث المخزون
            wholesaleCart.forEach(item => {
                db.updateProductStock(item.id, item.quantity);
            });
            
            alert(`تم إتمام فاتورة الجملة بنجاح! \nرقم الفاتورة: ${invoiceId} \nالمبلغ الإجمالي: ${total.toFixed(2)} جنيه`);
            
            // تفريغ سلة الجملة بعد إتمام الفاتورة
            wholesaleCart = [];
            wholesaleCustomer.value = '';
            updateWholesaleCart();
            loadWholesalePage(); // تحديث صفحة فواتير الجملة
            loadRecentTransactions(); // تحديث المعاملات الحديثة
        });

        // عرض فاتورة الجملة
        function viewWholesaleInvoice(invoiceId) {
            const invoices = db.getWholesaleInvoices();
            const invoice = invoices.find(i => i.id === invoiceId);
            
            if (invoice) {
                let itemsHtml = '';
                invoice.items.forEach(item => {
                    itemsHtml += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price} جنيه</td>
                            <td>${(item.price * item.quantity).toFixed(2)} جنيه</td>
                        </tr>
                    `;
                });
                
                const invoiceDetails = `
                    <div class="invoice-details">
                        <h4>تفاصيل فاتورة الجملة #${invoice.id}</h4>
                        <p><strong>العميل:</strong> ${invoice.customer}</p>
                        <p><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleString('ar-EG')}</p>
                        <p><strong>الكاشير:</strong> ${invoice.cashier}</p>
                        <table class="invoice-items">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span>${invoice.subtotal.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>خصم الجملة (${invoice.discount}%):</span>
                            <span>${invoice.discountAmount.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (14%):</span>
                            <span>${invoice.tax.toFixed(2)} جنيه</span>
                        </div>
                        <div class="summary-row total">
                            <span>الإجمالي:</span>
                            <span>${invoice.total.toFixed(2)} جنيه</span>
                        </div>
                    </div>
                `;
                
                alert(`تفاصيل فاتورة الجملة #${invoiceId}\n\n${invoiceDetails.replace(/<[^>]*>/g, '')}`);
            }
        }

        // تحديث سلة الجملة عند تغيير نسبة الخصم
        wholesaleDiscount.addEventListener('input', updateWholesaleCart);

        // تحميل صفحة المخزون
        function loadInventoryPage() {
            const products = db.getProducts();
            const inventoryLog = db.getInventoryLog();
            inventoryTableBody.innerHTML = '';
            
            products.forEach(product => {
                // الحصول على آخر تحديث للمخزون
                const lastUpdate = inventoryLog
                    .filter(log => log.productId === product.id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                
                const lastUpdateDate = lastUpdate ? new Date(lastUpdate.date).toLocaleDateString('ar-EG') : 'لا يوجد';
                
                // تحديد حالة المخزون
                let status = 'جيد';
                let statusClass = '';
                if (product.stock === 0) {
                    status = 'نفذ';
                    statusClass = 'stock-low';
                } else if (product.stock <= product.minStock) {
                    status = 'منخفض';
                    statusClass = 'stock-low';
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.barcode}</td>
                    <td>${product.stock}</td>
                    <td>${lastUpdateDate}</td>
                    <td class="${statusClass}">${status}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${product.id}">تعديل المخزون</button>
                    </td>
                `;
                inventoryTableBody.appendChild(row);
            });
            
            // إضافة أحداث لأزرار التعديل
            document.querySelectorAll('#inventoryTableBody .edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    editInventory(productId);
                });
            });
            
            // إضافة حدث البحث
            inventorySearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = inventoryTableBody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // تعديل المخزون
        function editInventory(productId) {
            const product = db.getProductById(productId);
            const newStock = prompt(`إدارة مخزون ${product.name}\nالمخزون الحالي: ${product.stock}\nأدخل الكمية الجديدة:`, product.stock);
            
            if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                const stockChange = parseInt(newStock) - product.stock;
                const reason = prompt('سبب التعديل:', stockChange > 0 ? 'إضافة مخزون' : 'خصم مخزون');
                
                if (reason !== null) {
                    db.updateProduct(productId, { stock: parseInt(newStock) });
                    loadInventoryPage();
                    loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
                    alert('تم تحديث المخزون بنجاح!');
                }
            }
        }

        // تحميل صفحة التقارير
        function loadReportsPage() {
            const sales = db.getSales();
            const products = db.getProducts();
            const wholesaleInvoices = db.getWholesaleInvoices();
            
            // إحصائيات سريعة
            const totalSales = sales.length;
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
            const totalWholesale = wholesaleInvoices.length;
            const wholesaleRevenue = wholesaleInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
            const totalProducts = products.length;
            const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
            const outOfStockProducts = products.filter(p => p.stock === 0).length;
            
            document.getElementById('reportResults').innerHTML = `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4>إحصائيات سريعة</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--primary-color); margin-bottom: 10px;">فواتير التجزئة</h5>
                            <p style="font-size: 24px; font-weight: bold;">${totalSales}</p>
                            <p style="color: #666;">${totalRevenue.toFixed(2)} ج.م</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--secondary-color); margin-bottom: 10px;">فواتير الجملة</h5>
                            <p style="font-size: 24px; font-weight: bold;">${totalWholesale}</p>
                            <p style="color: #666;">${wholesaleRevenue.toFixed(2)} ج.م</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--accent-color); margin-bottom: 10px;">إجمالي المنتجات</h5>
                            <p style="font-size: 24px; font-weight: bold;">${totalProducts}</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--danger-color); margin-bottom: 10px;">منتجات منخفضة المخزون</h5>
                            <p style="font-size: 24px; font-weight: bold;">${lowStockProducts}</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h5 style="color: var(--danger-color); margin-bottom: 10px;">منتجات نفذت</h5>
                            <p style="font-size: 24px; font-weight: bold;">${outOfStockProducts}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // التركيز على حقل الباركود عند تحميل الصفحة
        window.addEventListener('load', function() {
            if (barcodeInput) {
                barcodeInput.focus();
            }
        });


















        //html complete//
        <!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Badeen+Display&family=Cairo:wght@200..1000&family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Kufam:ital,wght@0,400..900;1,400..900&family=Lalezar&family=Noto+Kufi+Arabic:wght@100..900&family=Rakkas&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="style/styles.css">
    <title>بــَيــَّــاع</title>
</head>
<body>
    <!-- صفحة تسجيل الدخول -->
    <div class="login-container" id="loginPage">
        <div class="login-form">
                                <img src="assets/logo.png">
            <!-- <h2> 
                <i class="bi bi-box-arrow-in-right"></i>
                تسجيل الدخول 
            </h2> -->
            <div class="form-group">
                <label for="username">              
                <i class="bi bi-person"></i>
                    اسم المستخدم
                </label>
                <input type="text" id="username" placeholder="أدخل اسم المستخدم">
            </div>
            <div class="form-group">
                <label for="password">         
                 <i class="bi bi-lock"></i>
                    كلمة المرور
                </label>
                <input type="password" id="password" placeholder="أدخل كلمة المرور">
            </div>
                <div class="remember-me">
                <input type="checkbox" id="rememberMe">
                <label for="rememberMe">
                    <i class="bi bi-check-circle"></i>
                    تذكرني
                </label>
            </div>
            <button class="btn" id="loginBtn">تسجيل الدخول</button>
        </div>
    </div>

    <!-- لوحة التحكم -->
    <div class="dashboard" id="dashboard">
        <header class="header">
            <div class="container header-content">
                <div class="logo"> 
                    <img src="assets/logo.png">
                </div>
                <div class="user-info">
                    <i class="bi bi-person-circle"></i>
                    <button class="logout-btn" id="logoutBtn">                       
                         <i class="bi bi-box-arrow-right"></i>
                        تسجيل الخروج
                    </button>
                    <span id="userDisplay">مرحباً</span>
                </div>
            </div>
        </header>

        <div class="container main-layout">
            <!-- القائمة الجانبية -->
            <aside class="sidebar">
                <h3>القائمة الرئيسية</h3>
                <ul class="sidebar-menu" id="sidebarMenu">
                    <!-- سيتم ملء القائمة ديناميكياً حسب صلاحية المستخدم -->
                </ul>
            </aside>

            <!-- المحتوى الرئيسي -->
            <div class="content-area" style="flex: 1; display: flex; gap: 20px;">
                <!-- القائمة الحظية للمعاملات -->
                <aside class="transactions-sidebar" id="transactionsSidebar">
                    <h3>                            
                        <i class="bi bi-clock-history"></i>
                        المعاملات الحديثة
                    </h3>
                    <ul class="transactions-list" id="transactionsList">
                        <!-- سيتم ملء المعاملات ديناميكياً -->
                    </ul>
                </aside>

                <!-- المحتوى الرئيسي -->
                <div style="flex: 1;">
                    <!-- صفحة الكاشير (للكاشير والأدمن) -->
                    <div class="cashier-page" id="cashierPage">
                        <h2>
                        <i class="bi bi-cash-register"></i>
                        نقطة البيع
                    </h2>
                        <section class="barcode-section">
                            <h3>مسح الباركود</h3>
                            <div class="barcode-input">
                                <input type="text" id="barcodeInput" placeholder="أدخل الباركود أو استخدم الماسح الضوئي">
                                <button id="scanBarcodeBtn">
                                 <i class="bi bi-upc-scan"></i>
                                    بحث
                                </button>
                            </div>
                        </section>

                        <div class="main-content">
                            <section class="products-section">
                                <h3>
                                <i class="bi bi-grid-3x3-gap-fill"></i>
                                    المنتجات 
                                </h3>
                                <div class="products-grid" id="productsGrid">
                                    <!-- سيتم ملء المنتجات ديناميكياً باستخدام JavaScript -->
                                </div>
                            </section>

                            <section class="cart-section">
                                <h3>
                                    <i class="bi bi-cart"></i>
                                    سلة المشتريات

                                </h3>
                                <div class="cart-items" id="cartItems">
                                    <!-- سيتم ملء عناصر السلة ديناميكياً باستخدام JavaScript -->
                                </div>
                                <div class="cart-summary">
                                    <div class="summary-row">
                                        <span>المجموع الفرعي:</span>
                                        <span id="subtotal">0.00 جنيه</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>الضريبة (14%):</span>
                                        <span id="tax">0.00 جنيه</span>
                                    </div>
                                    <div class="summary-row total">
                                        <span>الإجمالي:</span>
                                        <span id="total">0.00 جنيه</span>
                                    </div>
                                    <button class="checkout-btn" id="checkoutBtn">                                
                                        <i class="bi bi-check-circle"></i>
                                        إتمام الشراء
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>

                    <!-- صفحة إدارة المنتجات (للأدمن فقط) -->
                    <div class="admin-page" id="productsPage">
                        <h3>    
                          <i class="bi bi-boxes"></i>
                            إدارة المنتجات
                        </h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productName">اسم المنتج</label>
                                <input type="text" id="productName" placeholder="أدخل اسم المنتج">
                            </div>
                            <div class="form-group">
                                <label for="productPrice">السعر (جنيه)</label>
                                <input type="number" id="productPrice" placeholder="أدخل السعر">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productBarcode">الباركود</label>
                                <input type="text" id="productBarcode" placeholder="أدخل الباركود">
                            </div>
                            <div class="form-group">
                                <label for="productCategory">الفئة</label>
                                <select id="productCategory">
                                    <option value="مأكولات">مأكولات</option>
                                    <option value="مشروبات">مشروبات</option>
                                    <option value="منتجات الألبان">منتجات الألبان</option>
                                    <option value="الفواكه">الفواكه</option>
                                    <option value="الخضروات">الخضروات</option>
                                    <option value="اللحوم">اللحوم</option>
                                    <option value="المخبوزات">المخبوزات</option>
                                    <option value="الحلويات">الحلويات</option>
                                    <option value="الأدوات المنزلية">الأدوات المنزلية</option>
                                    <option value="العناية الشخصية">العناية الشخصية</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productStock">المخزون</label>
                                <input type="number" id="productStock" placeholder="أدخل كمية المخزون">
                            </div>
                            <div class="form-group">
                                <button class="btn" id="addProductBtn">
                                     <i class="bi bi-plus-circle"></i>
                                    إضافة منتج
                                </button>
                            </div>
                        </div>
                        <div class="card-header">
                            <h3>
                             <i class="bi bi-list-ul"></i>
                                قائمة المنتجات
                            </h3>
                        </div>
                        <table class="products-table">
                            <thead>
                                <tr>
                                    <th>الباركود</th>
                                    <th>اسم المنتج</th>
                                    <th>السعر</th>
                                    <th>المخزون</th>
                                    <th>الفئة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody">
                                <!-- سيتم ملء الجدول ديناميكياً -->
                            </tbody>
                        </table>
                    </div>

                    <!-- صفحة تخزين الباركود في الذاكرة (للأدمن فقط) -->
                    <div class="admin-page" id="barcodeMemoryPage">
                        <h3>         
                         <i class="bi bi-memory"></i>
                            تخزين الباركود في الذاكرة
                        </h3>
                         <div style="background: white; padding: 20px; border-radius: var(--border-radius-lg); margin-bottom: 30px; box-shadow: var(--box-shadow-md);">
                        <div class="card-header">
                            <h3>
                            <i class="bi bi-save"></i>
                                حفظ باركود جديد
                            </h3>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="memoryBarcode">الباركود</label>
                                <input type="text" id="memoryBarcode" placeholder="أدخل الباركود">
                            </div>
                            <div class="form-group">
                                <label for="memoryProduct">المنتج المرتبط</label>
                                <select id="memoryProduct">
                                    <!-- سيتم ملء الخيارات ديناميكياً -->
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <button class="btn" id="saveBarcodeBtn"> 
                                  <i class="bi bi-save"></i>
                                حفظ الباركود</button>
                            </div>
                        </div>

                    <div style="background: white; padding: 20px; border-radius: var(--border-radius-lg); box-shadow: var(--box-shadow-md);">
                        <div class="card-header">
                            <h3>
                            <i class="bi bi-database"></i>
                                الباركود المخزن

                            </h3>
                        </div>                    
                            <table class="products-table">
                            <thead>
                                <tr>
                                    <th>الباركود</th>
                                    <th>اسم المنتج</th>
                                    <th>تاريخ التخزين</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="barcodeMemoryTable">
                                <!-- سيتم ملء الجدول ديناميكياً -->
                            </tbody>
                        </table>
                    </div>

                    <!-- صفحة الفواتير (للأدمن فقط) -->
                    <div class="admin-page" id="invoicesPage">
                        <h3>
                         <i class="bi bi-receipt"></i>
                            تخزين وإدارة الفواتير
                        </h3>
                        <div class="search-box">
                            <input type="text" id="invoiceSearch" placeholder="ابحث برقم الفاتورة أو اسم الكاشير...">
                        </div>
                        <table class="invoices-table">
                            <thead>
                                <tr>
                                    <th>رقم الفاتورة</th>
                                    <th>التاريخ</th>
                                    <th>الكاشير</th>
                                    <th>المجموع</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="invoicesTableBody">
                                <!-- سيتم ملء الجدول ديناميكياً -->
                            </tbody>
                        </table>
                    </div>

                    <!-- صفحة فواتير الجملة (للأدمن فقط) -->
                    <div class="admin-page" id="wholesalePage">
                        <h3>فواتير الجملة</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="wholesaleCustomer">اسم العميل</label>
                                <input type="text" id="wholesaleCustomer" placeholder="أدخل اسم العميل">
                            </div>
                            <div class="form-group">
                                <label for="wholesaleDiscount">خصم الجملة (%)</label>
                                <input type="number" id="wholesaleDiscount" value="10" min="0" max="100">
                            </div>
                        </div>
                        
                        <div class="barcode-input" style="margin-bottom: 15px;">
                            <input type="text" id="wholesaleBarcode" placeholder="أدخل باركود المنتج">
                            <button id="addWholesaleProductBtn">إضافة</button>
                        </div>

                        <div class="cart-items" id="wholesaleCartItems" style="max-height: 300px; margin-bottom: 20px;">
                            <!-- سيتم ملء عناصر سلة الجملة هنا -->
                        </div>

                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>المجموع الفرعي:</span>
                                <span id="wholesaleSubtotal">0.00 جنيه</span>
                            </div>
                            <div class="summary-row">
                                <span>خصم الجملة:</span>
                                <span id="wholesaleDiscountAmount">0.00 جنيه</span>
                            </div>
                            <div class="summary-row">
                                <span>الضريبة (14%):</span>
                                <span id="wholesaleTax">0.00 جنيه</span>
                            </div>
                            <div class="summary-row total">
                                <span>الإجمالي بعد الخصم:</span>
                                <span id="wholesaleTotal">0.00 جنيه</span>
                            </div>
                            <button class="checkout-btn" id="wholesaleCheckoutBtn">إتمام فاتورة الجملة</button>
                        </div>

                        <h4 style="margin-top: 30px;">فواتير الجملة السابقة</h4>
                        <table class="wholesale-table">
                            <thead>
                                <tr>
                                    <th>رقم الفاتورة</th>
                                    <th>العميل</th>
                                    <th>التاريخ</th>
                                    <th>الخصم</th>
                                    <th>المجموع</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="wholesaleTableBody">
                                <!-- سيتم ملء الجدول ديناميكياً -->
                            </tbody>
                        </table>
                    </div>

                    <!-- صفحة إدارة المخزون (للأدمن فقط) -->
                    <div class="admin-page" id="inventoryPage">
                        <h3>إدارة المخزون</h3>
                        <div class="search-box">
                            <input type="text" id="inventorySearch" placeholder="ابحث باسم المنتج أو الباركود...">
                        </div>
                        <table class="inventory-table">
                            <thead>
                                <tr>
                                    <th>اسم المنتج</th>
                                    <th>الباركود</th>
                                    <th>المخزون الحالي</th>
                                    <th>آخر تحديث</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="inventoryTableBody">
                                <!-- سيتم ملء الجدول ديناميكياً -->
                            </tbody>
                        </table>
                    </div>

                    <!-- صفحة التقارير (للأدمن فقط) -->
                    <div class="admin-page" id="reportsPage">
                        <h3>التقارير والإحصائيات</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="reportDateFrom">من تاريخ</label>
                                <input type="date" id="reportDateFrom">
                            </div>
                            <div class="form-group">
                                <label for="reportDateTo">إلى تاريخ</label>
                                <input type="date" id="reportDateTo">
                            </div>
                            <div class="form-group">
                                <button class="btn" id="generateReportBtn">إنشاء التقرير</button>
                            </div>
                        </div>

                        <div id="reportResults">
                            <!-- سيتم عرض نتائج التقرير هنا -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<script src="js/script.js"></script>
</body>
</html>
</body>








/* css complete*/
:root {
    /* نظام ألوان محسن */
    --primary-color: #1a73e8;
    --primary-dark: #0d62d9;
    --primary-light: #e8f0fe;
    --secondary-color: #34a853;
    --secondary-dark: #2e8b47;
    --secondary-light: #e6f4ea;
    --accent-color: #fbbc05;
    --accent-dark: #f29900;
    --accent-light: #fef7e0;
    --danger-color: #ea4335;
    --danger-dark: #d33426;
    --danger-light: #fce8e6;
    --warning-color: #f29900;
    --success-color: #34a853;
    --info-color: #4285f4;
    
    /* ألوان محايدة أكثر احترافية */
    --light-color: #f8f9fa;
    --lighter-color: #fafafa;
    --dark-color: #202124;
    --darker-color: #171717;
    --gray-50: #f8f9fa;
    --gray-100: #f1f3f4;
    --gray-200: #e8eaed;
    --gray-300: #dadce0;
    --gray-400: #bdc1c6;
    --gray-500: #9aa0a6;
    --gray-600: #80868b;
    --gray-700: #5f6368;
    --gray-800: #3c4043;
    --gray-900: #202124;
    
    /* أبعاد وتخطيط */
    --sidebar-width: 280px;
    --transactions-width: 320px;
    --header-height: 70px;
    --border-radius: 12px;
    --border-radius-sm: 8px;
    --border-radius-lg: 16px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --box-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* انتقالات وتحريك */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}

/* إعادة تعيين وتحسينات عامة */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    background-color: var(--gray-50);
    color: var(--gray-900);
    line-height: 1.6;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-family: "Cairo", sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* تحسينات النصوص والعناوين */
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 0.5em;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.75rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

/* تصميم صفحة تسجيل الدخول المحسن */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('https://scontent.fcai20-2.fna.fbcdn.net/v/t39.30808-6/637880196_5265380893687274_3772103432015485003_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeHknTIED2QtCD8h-kx3_wvuRbnf-4CWfutFud_7gJZ-6wseFJyopel3FMDm6BsyScF33ESGnZ1CpSyYIgvR407U&_nc_ohc=8oSDKqEbI2wQ7kNvwHMg8vM&_nc_oc=Adkjn8reWabZZzSiBa8BoA9e_hIPX1XHdWUmJDI7N1KhNuX-cNEHpQCj4_1cAhpQ6EQ&_nc_zt=23&_nc_ht=scontent.fcai20-2.fna&_nc_gid=w9Wr8eEL-dOnePZFJAnlWg&oh=00_Aft1GaPQpKdoqrfzncHCh6DeoXZ8FahMuSmgfTXH1xiPOw&oe=699DE0A9');
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.login-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    animation: float 20s linear infinite;
    z-index: 0;
}

@keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(-20px, -20px) rotate(360deg); }
}

.login-form {
    background-color: white;
    padding: 40px;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow-xl);
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    display: flex;
    flex-direction: column;
    align-items: center;    
}

.login-form:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-form h2 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--primary-color);
    position: relative;
    padding-bottom: 15px;
}

.login-form h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    border-radius: 3px;
}
.login-form img{
    width: 150px;
    height: 150px;
    margin-bottom: 20px;      /* مسافة أسفل الصورة */
}
.form-group {
    margin-bottom: 24px;
    position: relative;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--gray-700);
    transition: color var(--transition-fast);
}

.form-group:focus-within label {
    color: var(--primary-color);
}

.form-group input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    font-size: 16px;
    transition: all var(--transition-fast);
    background-color: var(--gray-50);
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    background-color: white;
}

.btn {
    display: block;
    width: 100%;
    padding: 14px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
}

.btn:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.btn:active::after {
    animation: ripple 1s ease-out;
}

@keyframes ripple {
    0% {
        transform: scale(0, 0);
        opacity: 0.5;
    }
    100% {
        transform: scale(20, 20);
        opacity: 0;
    }
}

/* تصميم لوحة التحكم المحسن */
.dashboard {
    display: none;
}

.header {
    background-color: white;
    padding: 0;
    box-shadow: var(--box-shadow);
    position: sticky;
    top: 0;
    z-index: 100;
    height: var(--header-height);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.logo {
    font-size: 26px;
    font-weight: bold;
    color: var(--primary-color);
    font-family: "Reem Kufi", sans-serif;
    display: flex;
    align-items: center;
}
.logo img{
    width: 80px;
    height: 80px;
}

.logo::before {
    margin-left: 10px;
    font-size: 28px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}

.logout-btn {
    background-color: var(--danger-color);
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    gap: 8px;
}

.logout-btn:hover {
    background-color: var(--danger-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(234, 67, 53, 0.3);
}

.main-layout {
    display: flex;
    gap: 24px;
    padding: 24px 0;
}

/* القائمة الجانبية المحسنة */
.sidebar {
    width: var(--sidebar-width);
    background-color: white;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: calc(var(--header-height) + 24px);
    transition: all var(--transition-normal);
}

.sidebar:hover {
    box-shadow: var(--box-shadow-lg);
}

.sidebar h3 {
    margin-bottom: 20px;
    color: var(--primary-color);
    border-bottom: 2px solid var(--gray-200);
    padding-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar h3::before {
    font-size: 20px;
}

.sidebar-menu {
    list-style: none;
}

.sidebar-menu li {
    margin-bottom: 8px;
}

.sidebar-menu a {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    color: var(--gray-700);
    text-decoration: none;
    border-radius: var(--border-radius);
    transition: all var(--transition-fast);
    font-weight: 500;
}

.sidebar-menu a i {
    margin-left: 12px;
    width: 20px;
    text-align: center;
}

.sidebar-menu a:hover {
    background-color: var(--primary-light);
    color: var(--primary-color);
    transform: translateX(5px);
}

.sidebar-menu a.active {
    background-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 6px rgba(26, 115, 232, 0.2);
}

/* القائمة الحظية للمعاملات المحسنة */
.transactions-sidebar {
    width: var(--transactions-width);
    background-color: white;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    padding: 24px;
    max-height: calc(100vh - var(--header-height) - 48px);
    overflow-y: auto;
    position: sticky;
    top: calc(var(--header-height) + 24px);
}

.transactions-sidebar h3 {
    margin-bottom: 20px;
    color: var(--primary-color);
    border-bottom: 2px solid var(--gray-200);
    padding-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.transactions-sidebar h3 span {
    font-size: 14px;
    color: var(--gray-500);
    font-weight: normal;
}

.transactions-list {
    list-style: none;
}

.transaction-item {
    padding: 16px;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all var(--transition-fast);
    border-radius: var(--border-radius);
    margin-bottom: 8px;
}

.transaction-item:hover {
    background-color: var(--gray-50);
    transform: translateY(-2px);
    box-shadow: var(--box-shadow);
}

.transaction-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.transaction-info h4 {
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
}

.transaction-info p {
    font-size: 12px;
    color: var(--gray-600);
}

.transaction-amount {
    font-weight: bold;
    font-size: 16px;
}

.transaction-amount.positive {
    color: var(--success-color);
}

.transaction-amount.negative {
    color: var(--danger-color);
}

.transaction-time {
    font-size: 11px;
    color: var(--gray-500);
    display: block;
    margin-top: 4px;
}

/* المحتوى الرئيسي المحسن */
.main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;
}

/* قسم الباركود المحسن */
.barcode-section {
    background-color: white;
    padding: 24px;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    margin-bottom: 24px;
    transition: all var(--transition-normal);
}

.barcode-section:hover {
    box-shadow: var(--box-shadow-lg);
}

.barcode-section h3 {
    margin-bottom: 20px;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 10px;
}

.barcode-input {
    display: flex;
    gap: 12px;
}

.barcode-input input {
    flex: 1;
    padding: 14px 16px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    font-size: 16px;
    transition: all var(--transition-fast);
    background-color: var(--gray-50);
}

.barcode-input input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    background-color: white;
}

.barcode-input button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 0 24px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 600;
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    gap: 8px;
}

.barcode-input button:hover {
    background-color: var(--secondary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 168, 83, 0.3);
}

/* قسم المنتجات المحسن */
.products-section {
    background-color: white;
    padding: 24px;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    max-height: 70vh;
    overflow-y: auto;
    transition: all var(--transition-normal);
}

.products-section:hover {
    box-shadow: var(--box-shadow-lg);
}

.products-section h3 {
    margin-bottom: 20px;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 10px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
}

.product-card {
    background-color: var(--gray-50);
    border-radius: var(--border-radius);
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
}

.product-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    transform: scaleX(0);
    transition: transform var(--transition-normal);
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-lg);
    border-color: var(--primary-light);
}

.product-card:hover::before {
    transform: scaleX(1);
}

.product-card img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 12px;
    border: 3px solid white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-card h4 {
    margin-bottom: 8px;
    font-weight: 600;
}

.product-card .price {
    color: var(--secondary-color);
    font-weight: bold;
    font-size: 16px;
}

.product-card .barcode {
    font-size: 11px;
    color: var(--gray-500);
    margin-top: 6px;
}

.stock-low {
    color: var(--danger-color);
    font-weight: bold;
    font-size: 12px;
    display: inline-block;
    padding: 2px 8px;
    background-color: var(--danger-light);
    border-radius: 20px;
    margin-top: 6px;
}

/* قسم السلة المحسن */
.cart-section {
    background-color: white;
    padding: 24px;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    transition: all var(--transition-normal);
}

.cart-section:hover {
    box-shadow: var(--box-shadow-lg);
}

.cart-section h3 {
    margin-bottom: 20px;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 10px;
}

.cart-items {
    margin-bottom: 24px;
    max-height: 400px;
    overflow-y: auto;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--gray-200);
    transition: all var(--transition-fast);
}

.cart-item:hover {
    background-color: var(--gray-50);
    border-radius: var(--border-radius);
    padding-left: 12px;
    padding-right: 12px;
}

.cart-item-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.cart-item-info img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50%;
    margin-left: 12px;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item-details {
    flex: 1;
}

.cart-item-name {
    font-weight: 600;
    margin-bottom: 4px;
}

.cart-item-price {
    color: var(--secondary-color);
    font-weight: bold;
}

.quantity-controls {
    display: flex;
    align-items: center;
    background-color: var(--gray-100);
    border-radius: var(--border-radius);
    padding: 4px;
}

.quantity-controls button {
    background-color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quantity-controls button:hover {
    background-color: var(--primary-color);
    color: white;
    transform: scale(1.1);
}

.quantity-controls span {
    margin: 0 12px;
    font-weight: 600;
    min-width: 20px;
    text-align: center;
}

.remove-item {
    color: var(--danger-color);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.remove-item:hover {
    background-color: var(--danger-light);
    transform: scale(1.1);
}

.cart-summary {
    border-top: 2px solid var(--gray-200);
    padding-top: 20px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 8px 0;
}

.summary-row:not(.total) {
    border-bottom: 1px dashed var(--gray-300);
}

.total {
    font-weight: bold;
    font-size: 20px;
    color: var(--primary-color);
    border-top: 2px solid var(--gray-300);
    margin-top: 8px;
    padding-top: 12px;
}

.checkout-btn {
    background: linear-gradient(to right, var(--secondary-color), var(--success-color));
    color: white;
    border: none;
    padding: 16px;
    border-radius: var(--border-radius);
    width: 100%;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 20px;
    transition: all var(--transition-normal);
    box-shadow: 0 4px 6px rgba(52, 168, 83, 0.2);
    position: relative;
    overflow: hidden;
}

.checkout-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.7s;
}

.checkout-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(52, 168, 83, 0.3);
}

.checkout-btn:hover::before {
    left: 100%;
}

/* صفحات الإدارة المحسنة */
.admin-page {
    display: none;
    background-color: white;
    padding: 24px;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    transition: all var(--transition-normal);
}

.admin-page:hover {
    box-shadow: var(--box-shadow-lg);
}

.admin-page h3 {
    margin-bottom: 24px;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 10px;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    flex: 1;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--gray-700);
}

.form-group input, .form-group select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    transition: all var(--transition-fast);
    background-color: var(--gray-50);
}

.form-group input:focus, .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    background-color: white;
}

.products-table, .invoices-table, .inventory-table, .wholesale-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-radius: var(--border-radius);
    overflow: hidden;
}

.products-table th, .products-table td,
.invoices-table th, .invoices-table td,
.inventory-table th, .inventory-table td,
.wholesale-table th, .wholesale-table td {
    padding: 16px;
    text-align: right;
    border-bottom: 1px solid var(--gray-200);
}

.products-table th, .invoices-table th, .inventory-table th, .wholesale-table th {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    position: sticky;
    top: 0;
}

.products-table tr:last-child td,
.invoices-table tr:last-child td,
.inventory-table tr:last-child td,
.wholesale-table tr:last-child td {
    border-bottom: none;
}

.products-table tr:hover,
.invoices-table tr:hover,
.inventory-table tr:hover,
.wholesale-table tr:hover {
    background-color: var(--gray-50);
}

.action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    margin-left: 8px;
    font-weight: 500;
    transition: all var(--transition-fast);
}

.edit-btn {
    background-color: var(--accent-color);
    color: white;
}

.edit-btn:hover {
    background-color: var(--accent-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(251, 188, 5, 0.3);
}

.delete-btn {
    background-color: var(--danger-color);
    color: white;
}

.delete-btn:hover {
    background-color: var(--danger-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(234, 67, 53, 0.3);
}

.view-btn {
    background-color: var(--primary-color);
    color: white;
}

.view-btn:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
}

.invoice-details {
    background-color: var(--gray-50);
    padding: 20px;
    border-radius: var(--border-radius);
    margin-top: 20px;
    border-left: 4px solid var(--primary-color);
}

.invoice-items {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-radius: var(--border-radius);
    overflow: hidden;
}

.invoice-items th, .invoice-items td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid var(--gray-200);
}

.invoice-items th {
    background-color: var(--gray-200);
    font-weight: 600;
}

.search-box {
    margin-bottom: 24px;
    position: relative;
}

.search-box input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    transition: all var(--transition-fast);
    background-color: var(--gray-50);
}

.search-box input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    background-color: white;
}

.search-box::before {
    content: '🔍';
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-500);
}

/* إشعارات وتنبيهات */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 500;
    box-shadow: var(--box-shadow-lg);
    z-index: 1000;
    transform: translateX(150%);
    transition: transform var(--transition-normal);
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background-color: var(--success-color);
}

.notification.error {
    background-color: var(--danger-color);
}

.notification.warning {
    background-color: var(--warning-color);
}

.notification.info {
    background-color: var(--info-color);
}

/* تحميل وشحن */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* تصميم متجاوب محسن */
@media (max-width: 1200px) {
    .main-content {
        grid-template-columns: 1fr;
    }
    
    .transactions-sidebar {
        display: none;
    }
}

@media (max-width: 992px) {
    .sidebar {
        width: 100%;
        position: static;
    }
    
    .main-layout {
        flex-direction: column;
    }
    
    .form-row {
        flex-direction: column;
        gap: 15px;
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .user-info {
        order: 3;
        width: 100%;
        justify-content: flex-end;
        margin-top: 10px;
    }
    
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
    }
    
    .barcode-input {
        flex-direction: column;
    }
    
    .barcode-input button {
        width: 100%;
        justify-content: center;
        padding: 14px;
    }
    
    .cart-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .quantity-controls {
        align-self: flex-end;
    }
    
    .login-form {
        padding: 30px 24px;
    }
}

@media (max-width: 576px) {
    .container {
        padding: 0 15px;
    }
    
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .products-section, .cart-section, .barcode-section, .admin-page {
        padding: 20px;
    }
    
    .sidebar {
        padding: 20px;
    }
    
    .products-table, .invoices-table, .inventory-table, .wholesale-table {
        display: block;
        overflow-x: auto;
    }
}

/* طباعة */
@media print {
    .header, .sidebar, .transactions-sidebar, .checkout-btn, .action-btn {
        display: none !important;
    }
    
    .main-content, .admin-page {
        box-shadow: none !important;
        padding: 0 !important;
    }
    
    body {
        background-color: white !important;
    }
}




/*Adding*/
/* إخفاء جميع الصفحات بشكل افتراضي */
.page {
    display: none;
}

/* إظهار الصفحة النشطة فقط */
.page.active {
    display: block;
}

/* تحسين مظهر البطاقات */
.form-card, .table-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 30px;
}

/* تحسين مظهر الجداول */
.products-table, .invoices-table, .wholesale-table, .inventory-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

.products-table th, .invoices-table th, .wholesale-table th, .inventory-table th {
    background: #f8f9fa;
    padding: 12px;
    text-align: right;
    font-weight: 600;
}

.products-table td, .invoices-table td, .wholesale-table td, .inventory-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #dee2e6;
}

/* تحسين مظهر شريط البحث */
.search-box {
    margin-bottom: 20px;
}

.search-box input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

/* تحسين مظهر التخطيط */
.content-area {
    display: flex;
    gap: 20px;
}

.transactions-sidebar {
    width: 300px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pages-container {
    flex: 1;
}

.pos-container {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 20px;
}