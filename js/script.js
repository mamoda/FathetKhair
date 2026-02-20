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

