// ==================== إعدادات النظام المتقدمة ====================
const TAX_RATE = 0.14; // 14% ضريبة القيمة المضافة
const POINTS_RATE = 0.01; // كل 100 جنيه = 1 نقطة (1 نقطة = 0.1 جنيه)
const POINTS_VALUE = 0.1; // قيمة النقطة الواحدة بالجنيه
const LOW_STOCK_THRESHOLD = 10; // حد التنبيه للمخزون المنخفض

// ==================== إدارة الجلسات ====================
class SessionManager {
    constructor() {
        this.currentSessionKey = 'currentSession';
    }

    saveSession(user, rememberMe = false) {
        const sessionData = {
            user: user,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString()
        };
        
        if (rememberMe) {
            localStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
        }
    }

    getSession() {
        let sessionData = localStorage.getItem(this.currentSessionKey);
        let storageType = 'localStorage';
        
        if (!sessionData) {
            sessionData = sessionStorage.getItem(this.currentSessionKey);
            storageType = 'sessionStorage';
        }
        
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);
        
        if (new Date() > new Date(session.expiresAt)) {
            this.clearSession();
            return null;
        }

        return session.user;
    }

    clearSession() {
        localStorage.removeItem(this.currentSessionKey);
        sessionStorage.removeItem(this.currentSessionKey);
    }

    refreshSession() {
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

// ==================== قاعدة البيانات المتقدمة ====================
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // المستخدمين
        if (!localStorage.getItem('users')) {
            const users = [
                { id: 1, username: "admin", password: "admin123", role: "admin", name: "مدير النظام" },
                { id: 2, username: "cashier", password: "cashier123", role: "cashier", name: "محمد الكاشير" },
                { id: 3, username: "owner", password: "esd17237", role: "owner", name: "صاحب العمل" }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }

        // المنتجات
        if (!localStorage.getItem('products')) {
            const products = this.generateProducts();
            localStorage.setItem('products', JSON.stringify(products));
        }

        // المبيعات
        if (!localStorage.getItem('sales')) {
            localStorage.setItem('sales', JSON.stringify([]));
        }

        // العملاء
        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify([]));
        }

        // العروض
        if (!localStorage.getItem('offers')) {
            localStorage.setItem('offers', JSON.stringify([]));
        }

        // المصروفات
        if (!localStorage.getItem('expenses')) {
            localStorage.setItem('expenses', JSON.stringify([]));
        }

        // ذاكرة الباركود
        if (!localStorage.getItem('barcodeMemory')) {
            localStorage.setItem('barcodeMemory', JSON.stringify([]));
        }

        // فواتير الجملة
        if (!localStorage.getItem('wholesaleInvoices')) {
            localStorage.setItem('wholesaleInvoices', JSON.stringify([]));
        }

        // سجل المخزون
        if (!localStorage.getItem('inventoryLog')) {
            localStorage.setItem('inventoryLog', JSON.stringify([]));
        }

        // المعاملات الحديثة
        if (!localStorage.getItem('recentTransactions')) {
            localStorage.setItem('recentTransactions', JSON.stringify([]));
        }

        // سجل نقاط الولاء
        if (!localStorage.getItem('pointsHistory')) {
            localStorage.setItem('pointsHistory', JSON.stringify([]));
        }
    }

    generateProducts() {
        const products = [];
        const categories = ["مأكولات", "مشروبات", "منتجات الألبان", "الفواكه", "الخضروات", "اللحوم", "المخبوزات", "الحلويات", "الأدوات المنزلية", "العناية الشخصية"];
        const defaultImage = '/assets/background.png';

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
            const costPrice = Math.floor(Math.random() * 50) + 5;
            const sellingPrice = costPrice + Math.floor(Math.random() * 30) + 10;
            
            products.push({
                id: i,
                name: productName,
                price: sellingPrice,
                cost: costPrice,
                wholesalePrice: sellingPrice * 0.8,
                barcode: this.generateBarcode(),
                category: category,
                image: defaultImage,
                stock: Math.floor(Math.random() * 100) + 10,
                minStock: LOW_STOCK_THRESHOLD,
                salesCount: Math.floor(Math.random() * 200)
            });
        }
        return products;
    }

    generateBarcode() {
        return 'EG' + Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    }

    // ==================== دوال المستخدمين ====================
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    // ==================== دوال المنتجات ====================
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
        product.salesCount = 0;
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        
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
        
        if (product) {
            this.addInventoryLog({
                productId: productId,
                productName: product.name,
                change: -product.stock,
                type: 'subtract',
                reason: 'حذف المنتج',
                date: new Date().toISOString()
            });
        }
        return true;
    }

    updateProductStock(productId, quantity, reason = 'بيع') {
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            const oldStock = products[productIndex].stock;
            products[productIndex].stock -= quantity;
            localStorage.setItem('products', JSON.stringify(products));
            
            this.addInventoryLog({
                productId: productId,
                productName: products[productIndex].name,
                change: -quantity,
                type: 'subtract',
                reason: reason,
                date: new Date().toISOString()
            });
            
            // تحديث عدد المبيعات للمنتج
            if (reason === 'بيع') {
                products[productIndex].salesCount = (products[productIndex].salesCount || 0) + quantity;
                localStorage.setItem('products', JSON.stringify(products));
            }
        }
    }

    // ==================== دوال المبيعات ====================
    getSales() {
        return JSON.parse(localStorage.getItem('sales')) || [];
    }

    addSale(saleData) {
        const sales = this.getSales();
        saleData.id = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
        saleData.date = new Date().toISOString();
        sales.push(saleData);
        localStorage.setItem('sales', JSON.stringify(sales));

        this.addRecentTransaction({
            type: 'بيع',
            amount: saleData.total,
            details: `${saleData.items.length} منتج`,
            cashier: saleData.cashier,
            customer: saleData.customer || 'عميل عادي',
            points: saleData.pointsEarned || 0,
            time: new Date().toISOString()
        });
        
        return saleData.id;
    }

    // ==================== دوال العملاء ====================
    getCustomers() {
        return JSON.parse(localStorage.getItem('customers')) || [];
    }

    getCustomerByPhone(phone) {
        const customers = this.getCustomers();
        return customers.find(c => c.phone === phone);
    }

    addCustomer(customerData) {
        const customers = this.getCustomers();
        customerData.id = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        customerData.points = customerData.points || 0;
        customerData.totalSpent = customerData.totalSpent || 0;
        customerData.lastPurchase = null;
        customerData.createdAt = new Date().toISOString();
        customers.push(customerData);
        localStorage.setItem('customers', JSON.stringify(customers));
        return customerData.id;
    }

    updateCustomerPoints(customerId, points, reason) {
        const customers = this.getCustomers();
        const customerIndex = customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            customers[customerIndex].points += points;
            localStorage.setItem('customers', JSON.stringify(customers));
            
            // تسجيل تاريخ النقاط
            const pointsHistory = this.getPointsHistory();
            pointsHistory.push({
                customerId: customerId,
                customerName: customers[customerIndex].name,
                points: points,
                reason: reason,
                date: new Date().toISOString()
            });
            localStorage.setItem('pointsHistory', JSON.stringify(pointsHistory));
            return true;
        }
        return false;
    }

    updateCustomerSpending(customerId, amount) {
        const customers = this.getCustomers();
        const customerIndex = customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            customers[customerIndex].totalSpent += amount;
            customers[customerIndex].lastPurchase = new Date().toISOString();
            localStorage.setItem('customers', JSON.stringify(customers));
            return true;
        }
        return false;
    }

    getPointsHistory() {
        return JSON.parse(localStorage.getItem('pointsHistory')) || [];
    }

    // ==================== دوال العروض ====================
    getOffers() {
        return JSON.parse(localStorage.getItem('offers')) || [];
    }

    addOffer(offerData) {
        const offers = this.getOffers();
        offerData.id = offers.length > 0 ? Math.max(...offers.map(o => o.id)) + 1 : 1;
        offerData.createdAt = new Date().toISOString();
        offerData.active = true;
        offers.push(offerData);
        localStorage.setItem('offers', JSON.stringify(offers));
        return offerData.id;
    }

    getActiveOffers() {
        const offers = this.getOffers();
        const now = new Date();
        return offers.filter(offer => {
            if (!offer.active) return false;
            if (offer.startDate && new Date(offer.startDate) > now) return false;
            if (offer.endDate && new Date(offer.endDate) < now) return false;
            return true;
        });
    }

    applyOffersToCart(cartItems, subtotal) {
        const activeOffers = this.getActiveOffers();
        let discount = 0;
        let appliedOffers = [];
        
        for (const offer of activeOffers) {
            if (offer.type === 'percentage') {
                // خصم نسبة مئوية
                if (offer.productId) {
                    const productItem = cartItems.find(item => item.id === offer.productId);
                    if (productItem) {
                        const itemTotal = productItem.price * productItem.quantity;
                        discount += itemTotal * (offer.value / 100);
                        appliedOffers.push(offer.name);
                    }
                } else {
                    discount += subtotal * (offer.value / 100);
                    appliedOffers.push(offer.name);
                }
            } 
            else if (offer.type === 'fixed') {
                // خصم ثابت
                if (offer.productId) {
                    const productItem = cartItems.find(item => item.id === offer.productId);
                    if (productItem && productItem.quantity >= (offer.minQuantity || 1)) {
                        discount += offer.value;
                        appliedOffers.push(offer.name);
                    }
                } else {
                    discount += offer.value;
                    appliedOffers.push(offer.name);
                }
            }
            else if (offer.type === 'buyXGetY') {
                // اشتر X واحصل على Y مجاناً
                const productItem = cartItems.find(item => item.id === offer.productId);
                if (productItem && productItem.quantity >= offer.buyQuantity) {
                    const freeItems = Math.floor(productItem.quantity / offer.buyQuantity) * offer.freeQuantity;
                    const freeAmount = freeItems * productItem.price;
                    discount += freeAmount;
                    appliedOffers.push(offer.name);
                }
            }
        }
        
        return { discount, appliedOffers };
    }

    // ==================== دوال المصروفات ====================
    getExpenses() {
        return JSON.parse(localStorage.getItem('expenses')) || [];
    }

    addExpense(expenseData) {
        const expenses = this.getExpenses();
        expenseData.id = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
        expenseData.date = new Date().toISOString();
        expenses.push(expenseData);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        return expenseData.id;
    }

    deleteExpense(expenseId) {
        const expenses = this.getExpenses();
        const filteredExpenses = expenses.filter(e => e.id !== expenseId);
        localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
        return true;
    }

    // ==================== دوال فواتير الجملة ====================
    getWholesaleInvoices() {
        return JSON.parse(localStorage.getItem('wholesaleInvoices')) || [];
    }

    addWholesaleInvoice(invoiceData) {
        const invoices = this.getWholesaleInvoices();
        invoiceData.id = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
        invoiceData.date = new Date().toISOString();
        invoices.push(invoiceData);
        localStorage.setItem('wholesaleInvoices', JSON.stringify(invoices));

        this.addRecentTransaction({
            type: 'جملة',
            amount: invoiceData.total,
            details: `عميل: ${invoiceData.customer}`,
            cashier: invoiceData.cashier,
            time: new Date().toISOString()
        });
        
        return invoiceData.id;
    }

    // ==================== دوال المعاملات الحديثة ====================
    getRecentTransactions() {
        return JSON.parse(localStorage.getItem('recentTransactions')) || [];
    }

    addRecentTransaction(transaction) {
        const transactions = this.getRecentTransactions();
        transactions.unshift(transaction);
        if (transactions.length > 100) transactions.pop();
        localStorage.setItem('recentTransactions', JSON.stringify(transactions));
        return transaction;
    }

    // ==================== دوال ذاكرة الباركود ====================
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

    // ==================== دوال سجل المخزون ====================
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

    // ==================== دوال الإحصائيات ====================
    getProfitStats(startDate, endDate) {
        const sales = this.getSales();
        const expenses = this.getExpenses();
        const products = this.getProducts();
        
        let filteredSales = sales;
        let filteredExpenses = expenses;
        
        if (startDate) {
            filteredSales = sales.filter(s => new Date(s.date) >= new Date(startDate));
            filteredExpenses = expenses.filter(e => new Date(e.date) >= new Date(startDate));
        }
        if (endDate) {
            filteredSales = filteredSales.filter(s => new Date(s.date) <= new Date(endDate));
            filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= new Date(endDate));
        }
        
        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
        
        // حساب تكلفة المبيعات
        let totalCost = 0;
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    totalCost += (product.cost || product.price * 0.7) * item.quantity;
                }
            });
        });
        
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const grossProfit = totalRevenue - totalCost;
        const netProfit = grossProfit - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        return {
            totalRevenue,
            totalCost,
            totalExpenses,
            grossProfit,
            netProfit,
            profitMargin
        };
    }

    getTopProducts(limit = 10) {
        const products = this.getProducts();
        return products
            .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
            .slice(0, limit);
    }

    getTopCustomers(limit = 10) {
        const customers = this.getCustomers();
        return customers
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);
    }
}

// ==================== تهيئة قاعدة البيانات ====================
const db = new Database();

// ==================== المتغيرات العامة ====================
let cart = [];
let wholesaleCart = [];
let currentUser = null;
let currentCustomer = null;
let lastProcessedBarcode = '';

// ==================== عناصر DOM ====================
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
const offersPage = document.getElementById('offersPage');
const customersPage = document.getElementById('customersPage');
const reportsPage = document.getElementById('reportsPage');
const expensesPage = document.getElementById('expensesPage');
const barcodeMemoryPage = document.getElementById('barcodeMemoryPage');
const invoicesPage = document.getElementById('invoicesPage');
const wholesalePage = document.getElementById('wholesalePage');
const inventoryPage = document.getElementById('inventoryPage');

// عناصر صفحة الكاشير
const barcodeInput = document.getElementById('barcodeInput');
const customerPhone = document.getElementById('customerPhone');
const searchCustomerBtn = document.getElementById('searchCustomerBtn');
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const discountRow = document.getElementById('discountRow');
const discountAmountElement = document.getElementById('discountAmount');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const loyaltyPointsElement = document.getElementById('loyaltyPoints');
const checkoutBtn = document.getElementById('checkoutBtn');

// عناصر صفحة إدارة المنتجات
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productCostInput = document.getElementById('productCost');
const productWholesaleInput = document.getElementById('productWholesale');
const productBarcodeInput = document.getElementById('productBarcode');
const productCategorySelect = document.getElementById('productCategory');
const productStockInput = document.getElementById('productStock');
const addProductBtn = document.getElementById('addProductBtn');
const productsTableBody = document.getElementById('productsTableBody');

// عناصر صفحة العروض
const offerNameInput = document.getElementById('offerName');
const offerTypeSelect = document.getElementById('offerType');
const offerValueInput = document.getElementById('offerValue');
const offerProductSelect = document.getElementById('offerProduct');
const offerStartDate = document.getElementById('offerStartDate');
const offerEndDate = document.getElementById('offerEndDate');
const addOfferBtn = document.getElementById('addOfferBtn');
const offersTableBody = document.getElementById('offersTableBody');

// عناصر صفحة العملاء
const customerNameInput = document.getElementById('customerName');
const customerPhoneReg = document.getElementById('customerPhoneReg');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const customersTableBody = document.getElementById('customersTableBody');
const redeemCustomerSelect = document.getElementById('redeemCustomer');
const redeemPointsInput = document.getElementById('redeemPoints');
const redeemPointsBtn = document.getElementById('redeemPointsBtn');

// عناصر صفحة المصروفات
const expenseTypeSelect = document.getElementById('expenseType');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseDescInput = document.getElementById('expenseDesc');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expensesTableBody = document.getElementById('expensesTableBody');
const profitSummaryDiv = document.getElementById('profitSummary');

// عناصر صفحة التقارير
const reportDateFrom = document.getElementById('reportDateFrom');
const reportDateTo = document.getElementById('reportDateTo');
const reportTypeSelect = document.getElementById('reportType');
const generateReportBtn = document.getElementById('generateReportBtn');
const exportReportBtn = document.getElementById('exportReportBtn');
const reportResults = document.getElementById('reportResults');
const profitStatsDiv = document.getElementById('profitStats');

// عناصر باقي الصفحات
const memoryBarcodeInput = document.getElementById('memoryBarcode');
const memoryProductSelect = document.getElementById('memoryProduct');
const saveBarcodeBtn = document.getElementById('saveBarcodeBtn');
const barcodeMemoryTable = document.getElementById('barcodeMemoryTable');
const invoiceSearch = document.getElementById('invoiceSearch');
const invoicesTableBody = document.getElementById('invoicesTableBody');
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
const inventorySearch = document.getElementById('inventorySearch');
const inventoryTableBody = document.getElementById('inventoryTableBody');

// عناصر النافذة المنبثقة
const invoiceModal = document.getElementById('invoiceModal');
const closeModal = document.querySelector('.close-modal');
const modalInvoiceNumber = document.getElementById('modalInvoiceNumber');
const modalInvoiceDate = document.getElementById('modalInvoiceDate');
const modalCashier = document.getElementById('modalCashier');
const modalCustomer = document.getElementById('modalCustomer');
const modalPoints = document.getElementById('modalPoints');
const modalInvoiceItems = document.getElementById('modalInvoiceItems');
const modalSubtotal = document.getElementById('modalSubtotal');
const modalDiscount = document.getElementById('modalDiscount');
const modalTax = document.getElementById('modalTax');
const modalTotal = document.getElementById('modalTotal');
const printInvoiceBtn = document.getElementById('printInvoiceBtn');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const discountRowModal = document.getElementById('discountRowModal');
const customerInfo = document.getElementById('customerInfo');

// ==================== دوال مساعدة ====================
function formatCurrency(amount) {
    return `${amount.toFixed(2)} جنيه`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function loadCategories() {
    const categories = ["مأكولات", "مشروبات", "منتجات الألبان", "الفواكه", "الخضروات", "اللحوم", "المخبوزات", "الحلويات", "الأدوات المنزلية", "العناية الشخصية"];
    if (productCategorySelect) {
        productCategorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

// ==================== إدارة الجلسة وتسجيل الدخول ====================
document.addEventListener('DOMContentLoaded', function() {
    const sessionManager = new SessionManager();
    const savedUser = sessionManager.getSession();
    
    if (savedUser) {
        currentUser = savedUser;
        loginPage.style.display = 'none';
        dashboard.style.display = 'block';
        userDisplay.textContent = `مرحباً، ${savedUser.name || savedUser.username}`;
        loadSidebarMenu();
        loadQuickLinks();
        showPage('cashierPage');
        loadProducts();
        loadRecentTransactions();
        updateSidebarData();
        loadCategories();
        sessionManager.refreshSession();
        
        if (barcodeInput) barcodeInput.focus();
    } else {
        loginPage.style.display = 'flex';
        dashboard.style.display = 'none';
    }
});

loginBtn.addEventListener('click', function() {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox?.checked || false;
    const users = db.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        const sessionManager = new SessionManager();
        sessionManager.saveSession(user, rememberMe);
        
        loginPage.style.display = 'none';
        dashboard.style.display = 'block';
        userDisplay.textContent = `مرحباً، ${user.name || user.username}`;
        loadSidebarMenu();
        loadQuickLinks();
        showPage('cashierPage');
        loadProducts();
        loadRecentTransactions();
        updateSidebarData();
        
        if (barcodeInput) barcodeInput.focus();
    } else {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
});

logoutBtn.addEventListener('click', function() {
    dashboard.style.display = 'none';
    loginPage.style.display = 'flex';
    usernameInput.value = '';
    passwordInput.value = '';
    if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
    cart = [];
    wholesaleCart = [];
    currentUser = null;
    currentCustomer = null;
    updateCart();
    updateWholesaleCart();
    const sessionManager = new SessionManager();
    sessionManager.clearSession();
});

passwordInput?.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') loginBtn.click();
});

// ==================== القائمة الجانبية ====================
function loadSidebarMenu() {
    sidebarMenu.innerHTML = '';
    
    const menuItems = [
        { id: 'cashierPage', name: 'نقطة البيع', icon: 'bi-cash-register', roles: ['cashier', 'admin', 'owner'] },
        { id: 'productsPage', name: 'المنتجات', icon: 'bi-boxes', roles: ['admin', 'owner'] },
        { id: 'offersPage', name: 'العروض', icon: 'bi-tags', roles: ['admin', 'owner'] },
        { id: 'customersPage', name: 'العملاء', icon: 'bi-people', roles: ['admin', 'owner'] },
        { id: 'expensesPage', name: 'المصروفات', icon: 'bi-receipt', roles: ['admin', 'owner'] },
        { id: 'reportsPage', name: 'التقارير', icon: 'bi-pie-chart', roles: ['admin', 'owner'] },
        { id: 'invoicesPage', name: 'الفواتير', icon: 'bi-receipt', roles: ['cashier', 'admin', 'owner'] },
        { id: 'wholesalePage', name: 'الجملة', icon: 'bi-truck', roles: ['admin', 'owner'] },
        { id: 'inventoryPage', name: 'المخزون', icon: 'bi-bar-chart', roles: ['admin', 'owner'] },
        { id: 'barcodeMemoryPage', name: 'ذاكرة الباركود', icon: 'bi-memory', roles: ['admin', 'owner'] }
    ];
    
    const filteredItems = menuItems.filter(item => item.roles.includes(currentUser?.role));
    
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-page="${item.id}"><i class="bi ${item.icon}"></i> ${item.name}</a>`;
        sidebarMenu.appendChild(li);
    });
    
    const menuLinks = sidebarMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    if (menuLinks.length > 0) menuLinks[0].classList.add('active');
}

function loadQuickLinks() {
    const quickLinksContainer = document.getElementById('quickLinks');
    if (!quickLinksContainer) return;
    quickLinksContainer.innerHTML = '';
    
    const quickLinks = [
        { page: 'cashierPage', icon: 'bi-cash-register', name: 'البيع', roles: ['cashier', 'admin', 'owner'] },
        { page: 'productsPage', icon: 'bi-box', name: 'المنتجات', roles: ['admin', 'owner'] },
        { page: 'offersPage', icon: 'bi-tags', name: 'العروض', roles: ['admin', 'owner'] },
        { page: 'customersPage', icon: 'bi-people', name: 'العملاء', roles: ['admin', 'owner'] },
        { page: 'reportsPage', icon: 'bi-pie-chart', name: 'التقارير', roles: ['admin', 'owner'] },
        { page: 'invoicesPage', icon: 'bi-receipt', name: 'الفواتير', roles: ['cashier', 'admin', 'owner'] }
    ];
    
    const filteredLinks = quickLinks.filter(link => link.roles.includes(currentUser?.role));
    
    filteredLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'quick-link';
        a.onclick = () => { showPage(link.page); return false; };
        a.innerHTML = `<i class="bi ${link.icon}"></i> ${link.name}`;
        quickLinksContainer.appendChild(a);
    });
}

// ==================== عرض الصفحات ====================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';
    
    if (pageId === 'cashierPage' && currentUser?.role === 'cashier') {
        setTimeout(() => barcodeInput?.focus(), 100);
    }
    
    // تحميل بيانات الصفحة
    if (pageId === 'productsPage') loadProductsTable();
    else if (pageId === 'offersPage') loadOffersPage();
    else if (pageId === 'customersPage') loadCustomersPage();
    else if (pageId === 'expensesPage') loadExpensesPage();
    else if (pageId === 'reportsPage') loadReportsPage();
    else if (pageId === 'invoicesPage') loadInvoicesPage();
    else if (pageId === 'wholesalePage') loadWholesalePage();
    else if (pageId === 'inventoryPage') loadInventoryPage();
    else if (pageId === 'barcodeMemoryPage') loadBarcodeMemoryPage();
}

// ==================== المعاملات الحديثة ====================
function loadRecentTransactions() {
    if (!transactionsList) return;
    const transactions = db.getRecentTransactions();
    transactionsList.innerHTML = transactions.slice(0, 5).map(t => `
        <li class="transaction-item">
            <div class="transaction-icon"><i class="bi ${t.type === 'بيع' ? 'bi-cart' : 'bi-truck'}"></i></div>
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-title">${t.type} - ${t.details}</span>
                    <span class="transaction-badge completed">مكتملة</span>
                </div>
                <div class="transaction-details">
                    <span class="transaction-customer"><i class="bi bi-person"></i> ${t.cashier}</span>
                    <span class="transaction-amount">${t.amount.toFixed(2)} ج</span>
                </div>
                <div class="transaction-time"><i class="bi bi-clock"></i> ${new Date(t.time).toLocaleTimeString('ar-EG')}</div>
            </div>
        </li>
    `).join('');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `<li class="transaction-item" style="justify-content:center;text-align:center;"><i class="bi bi-inbox" style="font-size:2rem;"></i><p>لا توجد معاملات حديثة</p></li>`;
    }
}

// ==================== تحديث القائمة الجانبية ====================
function updateSidebarData() {
    updateQuickStats();
    updateTransactionsList();
    updateTopProducts();
    updateActiveCashiers();
    updateStockAlerts();
    updatePerformanceMetrics();
}

function updateQuickStats() {
    const today = new Date().toDateString();
    const sales = db.getSales();
    const todayInvoices = sales.filter(inv => new Date(inv.date).toDateString() === today);
    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const products = db.getProducts();
    const lowStockCount = products.filter(p => p.stock < LOW_STOCK_THRESHOLD).length;
    
    document.getElementById('todaySalesCount') && (document.getElementById('todaySalesCount').textContent = todayInvoices.length);
    document.getElementById('todayRevenue') && (document.getElementById('todayRevenue').textContent = todayRevenue.toFixed(2) + ' ج');
    document.getElementById('activeCashiers') && (document.getElementById('activeCashiers').textContent = '3');
    document.getElementById('lowStock') && (document.getElementById('lowStock').textContent = lowStockCount);
}

function updateTransactionsList() {
    const list = document.getElementById('transactionsList');
    if (!list) return;
    const sales = db.getSales();
    const recent = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    list.innerHTML = recent.map(inv => `
        <li class="transaction-item" onclick="viewInvoiceDetails(${inv.id})">
            <div class="transaction-icon"><i class="bi bi-receipt"></i></div>
            <div class="transaction-info">
                <div class="transaction-header"><span class="transaction-title">فاتورة #${inv.id}</span><span class="transaction-badge completed">مكتملة</span></div>
                <div class="transaction-details"><span class="transaction-customer"><i class="bi bi-person"></i> ${inv.cashier}</span><span class="transaction-amount">${inv.total.toFixed(2)} ج</span></div>
                <div class="transaction-time"><i class="bi bi-clock"></i> ${new Date(inv.date).toLocaleTimeString('ar-EG')}</div>
            </div>
        </li>
    `).join('');
    
    if (recent.length === 0) list.innerHTML = `<li class="transaction-item" style="justify-content:center;">لا توجد معاملات</li>`;
}

function updateTopProducts() {
    const container = document.getElementById('topProductsList');
    if (!container) return;
    const topProducts = db.getTopProducts(5);
    container.innerHTML = topProducts.map((p, i) => `
        <div class="top-product-item"><span class="product-rank">${i + 1}</span>
            <div class="product-info"><div class="product-name">${p.name}</div>
            <div class="product-stats"><span>${p.salesCount || 0} مبيعات</span><span class="product-sales">${(p.price * (p.salesCount || 0)).toFixed(2)} ج</span></div></div>
        </div>
    `).join('');
}

function updateActiveCashiers() {
    const container = document.getElementById('activeCashiersList');
    if (!container) return;
    const cashiers = [{ name: 'أحمد علي', shift: 'صباحي', sales: 25 }, { name: 'محمد حسن', shift: 'صباحي', sales: 18 }, { name: 'سارة أحمد', shift: 'مسائي', sales: 15 }];
    container.innerHTML = cashiers.map(c => `
        <div class="cashier-item"><div class="cashier-avatar">${c.name.charAt(0)}</div>
            <div class="cashier-info"><div class="cashier-name">${c.name}</div>
            <div class="cashier-status"><span class="status-dot"></span> ${c.shift} - ${c.sales} فاتورة</div></div>
        </div>
    `).join('');
}

function updateStockAlerts() {
    const container = document.getElementById('stockAlertsList');
    if (!container) return;
    const products = db.getProducts();
    const lowStock = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
    
    container.innerHTML = lowStock.map(p => `
        <div class="alert-item ${p.stock < 5 ? 'danger' : ''}">
            <div class="alert-icon"><i class="bi ${p.stock < 5 ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill'}"></i></div>
            <div class="alert-content"><div class="alert-title">${p.name}</div><div class="alert-desc">المتبقي: ${p.stock} وحدة</div></div>
            <a href="#" class="alert-action" onclick="showPage('inventoryPage')"><i class="bi bi-arrow-left"></i></a>
        </div>
    `).join('');
    
    if (lowStock.length === 0) container.innerHTML = `<div style="text-align:center;padding:20px;"><i class="bi bi-check-circle" style="font-size:2rem;color:var(--success-color);"></i><p>المخزون جيد</p></div>`;
}

function updatePerformanceMetrics() {
    const sales = db.getSales();
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today).length;
    const dailyRate = Math.min(100, (todaySales / 50) * 100);
    
    document.getElementById('dailySalesRate') && (document.getElementById('dailySalesRate').textContent = dailyRate.toFixed(0) + '%');
    const progressBars = document.querySelectorAll('#statsTab .metric-progress');
    progressBars[0] && (progressBars[0].style.width = dailyRate + '%');
}

// ==================== البحث بالباركود ====================
function searchByBarcode(barcode) {
    if (!barcode?.trim()) return;
    const product = db.getProductByBarcode(barcode);
    if (product) {
        addToCart(product);
        barcodeInput.value = '';
        barcodeInput.style.borderColor = '#28a745';
        setTimeout(() => barcodeInput.style.borderColor = '', 300);
        if (currentUser?.role === 'cashier') setTimeout(() => barcodeInput.focus(), 10);
    } else {
        showNotification('المنتج غير موجود!', 'error');
        barcodeInput.value = '';
        barcodeInput.style.borderColor = '#dc3545';
        setTimeout(() => barcodeInput.style.borderColor = '', 300);
        if (currentUser?.role === 'cashier') setTimeout(() => barcodeInput.focus(), 10);
    }
}

if (barcodeInput) {
    barcodeInput.addEventListener('input', function() {
        const barcode = this.value.trim();
        if (barcode && barcode !== lastProcessedBarcode) {
            lastProcessedBarcode = barcode;
            searchByBarcode(barcode);
        }
    });
    barcodeInput.addEventListener('focus', () => { lastProcessedBarcode = ''; this.select(); });
}

// ==================== المنتجات والسلة ====================
function loadProducts() {
    if (!productsGrid) return;
    const products = db.getProducts();
    productsGrid.innerHTML = products.map(p => `
        <div class="product-card" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <img src="${p.image}" onerror="this.src='/assets/background.png'" alt="${p.name}">
            <h4>${p.name}</h4>
            <div class="price">${p.price} جنيه</div>
            <div class="barcode">${p.barcode}</div>
            ${p.stock <= p.minStock ? `<div class="stock-low">منخفض (${p.stock})</div>` : ''}
        </div>
    `).join('');
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        if (existingItem.quantity < product.stock) existingItem.quantity++;
        else { showNotification('لا يوجد مخزون كافي!', 'error'); return; }
    } else {
        if (product.stock > 0) cart.push({ ...product, quantity: 1 });
        else { showNotification('المنتج غير متوفر!', 'error'); return; }
    }
    updateCart();
}

function updateCart() {
    if (!cartItems) return;
    let subtotal = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info"><img src="${item.image}" onerror="this.src='/assets/background.png'"><div class="cart-item-details"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${item.price} جنيه</div></div></div>
                <div class="quantity-controls"><button class="decrease-btn" data-id="${item.id}">-</button><span>${item.quantity}</span><button class="increase-btn" data-id="${item.id}">+</button></div>
                <div>${itemTotal.toFixed(2)} جنيه</div>
                <button class="remove-item" data-id="${item.id}">×</button>
            </div>
        `;
    }).join('');
    
    // تطبيق العروض
    const { discount, appliedOffers } = db.applyOffersToCart(cart, subtotal);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;
    
    discountRow.style.display = discount > 0 ? 'flex' : 'none';
    discountAmountElement && (discountAmountElement.textContent = formatCurrency(discount));
    subtotalElement && (subtotalElement.textContent = formatCurrency(subtotal));
    taxElement && (taxElement.textContent = formatCurrency(tax));
    totalElement && (totalElement.textContent = formatCurrency(total));
    
    // نقاط الولاء
    const pointsEarned = Math.floor(total / 100);
    loyaltyPointsElement && (loyaltyPointsElement.textContent = pointsEarned);
    
    // إضافة أحداث الأزرار
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id == btn.dataset.id);
            if (item && item.quantity > 1) { item.quantity--; updateCart(); }
            else if (item) { cart = cart.filter(i => i.id != item.id); updateCart(); }
        });
    });
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id == btn.dataset.id);
            const product = db.getProductById(item.id);
            if (item && item.quantity < product.stock) { item.quantity++; updateCart(); }
            else showNotification('لا يوجد مخزون كافي!', 'error');
        });
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            cart = cart.filter(i => i.id != btn.dataset.id);
            updateCart();
        });
    });
}

// ==================== إتمام الشراء ====================
checkoutBtn?.addEventListener('click', function() {
    if (cart.length === 0) { showNotification('السلة فارغة!', 'error'); return; }
    
    const subtotal = parseFloat(subtotalElement.textContent) || 0;
    const tax = parseFloat(taxElement.textContent) || 0;
    const total = parseFloat(totalElement.textContent) || 0;
    const discount = parseFloat(discountAmountElement?.textContent) || 0;
    const pointsEarned = Math.floor(total / 100);
    
    // تحديث نقاط العميل
    let customerId = null;
    if (currentCustomer) {
        db.updateCustomerPoints(currentCustomer.id, pointsEarned, `شراء بقيمة ${total.toFixed(2)} جنيه`);
        db.updateCustomerSpending(currentCustomer.id, total);
        customerId = currentCustomer.id;
    }
    
    const saleId = db.addSale({
        items: [...cart],
        subtotal: subtotal + discount,
        discount: discount,
        tax: tax,
        total: total,
        cashier: currentUser.username,
        customer: currentCustomer?.name || null,
        customerId: customerId,
        pointsEarned: pointsEarned
    });
    
    cart.forEach(item => db.updateProductStock(item.id, item.quantity));
    
    showInvoiceModal({
        id: saleId,
        date: new Date().toISOString(),
        cashier: currentUser.username,
        customer: currentCustomer?.name,
        items: [...cart],
        subtotal: subtotal + discount,
        discount: discount,
        tax: tax,
        total: total,
        pointsEarned: pointsEarned
    }, false);
    
    cart = [];
    currentCustomer = null;
    if (customerPhone) customerPhone.value = '';
    updateCart();
    loadProducts();
    loadRecentTransactions();
    updateSidebarData();
    showNotification('تم إتمام الشراء بنجاح!', 'success');
});

// ==================== البحث عن العميل ====================
searchCustomerBtn?.addEventListener('click', function() {
    const phone = customerPhone.value.trim();
    if (!phone) { showNotification('أدخل رقم الهاتف', 'warning'); return; }
    const customer = db.getCustomerByPhone(phone);
    if (customer) {
        currentCustomer = customer;
        showNotification(`مرحباً ${customer.name} - لديك ${customer.points} نقطة ولاء`, 'success');
        loyaltyPointsElement && (loyaltyPointsElement.textContent = `${customer.points} نقطة متاحة`);
    } else {
        const name = prompt('العميل غير مسجل. أدخل الاسم للتسجيل:');
        if (name) {
            const newCustomer = { name, phone, points: 0, totalSpent: 0 };
            db.addCustomer(newCustomer);
            currentCustomer = db.getCustomerByPhone(phone);
            showNotification(`تم تسجيل ${name} بنجاح!`, 'success');
        }
    }
});

// ==================== إدارة المنتجات ====================
function loadProductsTable() {
    if (!productsTableBody) return;
    const products = db.getProducts();
    productsTableBody.innerHTML = products.map(p => {
        const profit = p.price - (p.cost || p.price * 0.7);
        return `
            <tr>
                <td>${p.barcode}</td>
                <td>${p.name}</td>
                <td>${p.price} ج</td>
                <td>${p.cost || (p.price * 0.7).toFixed(2)} ج</td>
                <td class="${profit > 0 ? 'text-success' : 'text-danger'}">${profit.toFixed(2)} ج</td>
                <td><span class="status-badge ${p.stock > p.minStock ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-of-stock'}">${p.stock}</span></td>
                <td>${p.category}</td>
                <td><button class="action-btn edit-btn" data-id="${p.id}"><i class="bi bi-pencil"></i></button><button class="action-btn delete-btn" data-id="${p.id}"><i class="bi bi-trash"></i></button></td>
            </tr>
        `;
    }).join('');
    
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => editProduct(btn.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => { if (confirm('حذف المنتج؟')) db.deleteProduct(parseInt(btn.dataset.id)) && loadProductsTable() && loadProducts(); }));
}

function editProduct(productId) {
    const product = db.getProductById(productId);
    const newName = prompt('اسم المنتج:', product.name);
    if (newName) {
        const newPrice = prompt('سعر البيع:', product.price);
        if (newPrice) {
            db.updateProduct(productId, { name: newName, price: parseFloat(newPrice) });
            loadProductsTable();
            loadProducts();
        }
    }
}

addProductBtn?.addEventListener('click', function() {
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const cost = parseFloat(productCostInput.value);
    const wholesale = parseFloat(productWholesaleInput.value);
    const barcode = productBarcodeInput.value.trim();
    const category = productCategorySelect.value;
    const stock = parseInt(productStockInput.value);
    
    if (!name || !price || !barcode) { showNotification('يرجى ملء جميع الحقول المطلوبة', 'error'); return; }
    
    db.addProduct({ name, price, cost: cost || price * 0.7, wholesalePrice: wholesale || price * 0.8, barcode, category, stock, minStock: LOW_STOCK_THRESHOLD, image: '/assets/background.png' });
    loadProductsTable();
    loadProducts();
    productNameInput.value = productPriceInput.value = productCostInput.value = productWholesaleInput.value = productBarcodeInput.value = productStockInput.value = '';
    showNotification('تم إضافة المنتج بنجاح!', 'success');
});

// ==================== إدارة العروض ====================
function loadOffersPage() {
    if (!offersTableBody) return;
    const products = db.getProducts();
    offerProductSelect.innerHTML = '<option value="">جميع المنتجات</option>' + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    const offers = db.getOffers();
    const now = new Date();
    offersTableBody.innerHTML = offers.map(o => `
        <tr>
            <td>${o.name}</td>
            <td>${o.type === 'percentage' ? 'نسبة مئوية' : o.type === 'fixed' ? 'خصم ثابت' : 'اشتر واحصل على مجاناً'}</td>
            <td>${o.value}${o.type === 'percentage' ? '%' : ' ج'}</td>
            <td>${o.productId ? db.getProductById(o.productId)?.name || 'الكل' : 'الكل'}</td>
            <td>${o.startDate ? new Date(o.startDate).toLocaleDateString() : 'بدون'} - ${o.endDate ? new Date(o.endDate).toLocaleDateString() : 'بدون'}</td>
            <td><span class="status-badge ${o.active && (!o.endDate || new Date(o.endDate) >= now) ? 'in-stock' : 'out-of-stock'}">${o.active && (!o.endDate || new Date(o.endDate) >= now) ? 'نشط' : 'منتهي'}</span></td>
            <td><button class="action-btn delete-btn" data-id="${o.id}"><i class="bi bi-trash"></i></button></td>
        </tr>
    `).join('');
    
    document.querySelectorAll('#offersTableBody .delete-btn').forEach(btn => btn.addEventListener('click', () => {
        if (confirm('حذف العرض؟')) {
            const offers = db.getOffers();
            localStorage.setItem('offers', JSON.stringify(offers.filter(o => o.id != btn.dataset.id)));
            loadOffersPage();
            showNotification('تم حذف العرض', 'success');
        }
    }));
}

addOfferBtn?.addEventListener('click', function() {
    const name = offerNameInput.value.trim();
    const type = offerTypeSelect.value;
    const value = parseFloat(offerValueInput.value);
    const productId = offerProductSelect.value ? parseInt(offerProductSelect.value) : null;
    const startDate = offerStartDate.value;
    const endDate = offerEndDate.value;
    
    if (!name || !value) { showNotification('يرجى ملء البيانات', 'error'); return; }
    
    db.addOffer({ name, type, value, productId, startDate, endDate, active: true });
    loadOffersPage();
    offerNameInput.value = offerValueInput.value = '';
    showNotification('تم إضافة العرض بنجاح!', 'success');
});

// ==================== إدارة العملاء ====================
function loadCustomersPage() {
    if (!customersTableBody) return;
    const customers = db.getCustomers();
    customersTableBody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.points} نقطة</td>
            <td>${c.totalSpent.toFixed(2)} ج</td>
            <td>${c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : 'لا يوجد'}</td>
            <td><button class="action-btn" onclick="selectCustomer(${c.id})">اختيار</button></td>
        </tr>
    `).join('');
    
    redeemCustomerSelect.innerHTML = customers.map(c => `<option value="${c.id}">${c.name} (${c.points} نقطة)</option>`).join('');
}

addCustomerBtn?.addEventListener('click', function() {
    const name = customerNameInput.value.trim();
    const phone = customerPhoneReg.value.trim();
    if (!name || !phone) { showNotification('يرجى إدخال الاسم والهاتف', 'error'); return; }
    if (db.getCustomerByPhone(phone)) { showNotification('رقم الهاتف موجود مسبقاً', 'error'); return; }
    db.addCustomer({ name, phone, points: 0, totalSpent: 0 });
    loadCustomersPage();
    customerNameInput.value = customerPhoneReg.value = '';
    showNotification('تم إضافة العميل بنجاح!', 'success');
});

redeemPointsBtn?.addEventListener('click', function() {
    const customerId = parseInt(redeemCustomerSelect.value);
    const points = parseInt(redeemPointsInput.value);
    if (!customerId || !points) { showNotification('اختر العميل وأدخل النقاط', 'error'); return; }
    const customer = db.getCustomers().find(c => c.id === customerId);
    if (!customer || customer.points < points) { showNotification('نقاط غير كافية', 'error'); return; }
    const discountValue = points * POINTS_VALUE;
    db.updateCustomerPoints(customerId, -points, `استبدال ${points} نقطة بقيمة ${discountValue} جنيه`);
    showNotification(`تم استبدال ${points} نقطة بقيمة ${discountValue.toFixed(2)} جنيه`, 'success');
    loadCustomersPage();
    redeemPointsInput.value = '';
});

window.selectCustomer = function(customerId) {
    const customer = db.getCustomers().find(c => c.id === customerId);
    if (customer) {
        currentCustomer = customer;
        showPage('cashierPage');
        if (customerPhone) customerPhone.value = customer.phone;
        showNotification(`تم اختيار العميل ${customer.name}`, 'success');
    }
};

// ==================== إدارة المصروفات ====================
function loadExpensesPage() {
    if (!expensesTableBody) return;
    const expenses = db.getExpenses();
    expensesTableBody.innerHTML = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => `
        <tr>
            <td>${new Date(e.date).toLocaleDateString()}</td>
            <td>${e.type === 'rent' ? 'إيجار' : e.type === 'salary' ? 'رواتب' : e.type === 'utilities' ? 'فواتير' : e.type === 'maintenance' ? 'صيانة' : 'أخرى'}</td>
            <td>${e.description || '-'}</td>
            <td>${e.amount.toFixed(2)} ج</td>
            <td><button class="action-btn delete-btn" data-id="${e.id}"><i class="bi bi-trash"></i></button></td>
        </tr>
    `).join('');
    
    document.querySelectorAll('#expensesTableBody .delete-btn').forEach(btn => btn.addEventListener('click', () => {
        if (confirm('حذف المصروف؟')) db.deleteExpense(parseInt(btn.dataset.id)) && loadExpensesPage() && updateProfitSummary();
    }));
    
    updateProfitSummary();
}

function updateProfitSummary() {
    if (!profitSummaryDiv) return;
    const stats = db.getProfitStats();
    profitSummaryDiv.innerHTML = `
        <div class="profit-stats">
            <div class="profit-card"><h4>إجمالي الإيرادات</h4><div class="value positive">${stats.totalRevenue.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>تكلفة المبيعات</h4><div class="value">${stats.totalCost.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>إجمالي المصروفات</h4><div class="value">${stats.totalExpenses.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>صافي الربح</h4><div class="value ${stats.netProfit >= 0 ? 'positive' : 'negative'}">${stats.netProfit.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>هامش الربح</h4><div class="value positive">${stats.profitMargin.toFixed(2)}%</div></div>
        </div>
    `;
}

addExpenseBtn?.addEventListener('click', function() {
    const type = expenseTypeSelect.value;
    const amount = parseFloat(expenseAmountInput.value);
    const description = expenseDescInput.value.trim();
    if (!amount) { showNotification('أدخل المبلغ', 'error'); return; }
    db.addExpense({ type, amount, description });
    loadExpensesPage();
    expenseAmountInput.value = expenseDescInput.value = '';
    showNotification('تم إضافة المصروف', 'success');
});

// ==================== التقارير ====================
function loadReportsPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    reportDateFrom.value = firstDay.toISOString().split('T')[0];
    reportDateTo.value = today.toISOString().split('T')[0];
    updateProfitStats();
}

function updateProfitStats() {
    if (!profitStatsDiv) return;
    const stats = db.getProfitStats(reportDateFrom.value, reportDateTo.value);
    profitStatsDiv.innerHTML = `
        <div class="profit-stats">
            <div class="profit-card"><h4>الإيرادات</h4><div class="value positive">${stats.totalRevenue.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>تكلفة المبيعات</h4><div class="value">${stats.totalCost.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>المصروفات</h4><div class="value">${stats.totalExpenses.toFixed(2)} ج</div></div>
            <div class="profit-card"><h4>صافي الربح</h4><div class="value ${stats.netProfit >= 0 ? 'positive' : 'negative'}">${stats.netProfit.toFixed(2)} ج</div></div>
        </div>
    `;
}

generateReportBtn?.addEventListener('click', function() {
    const from = reportDateFrom.value;
    const to = reportDateTo.value;
    const type = reportTypeSelect.value;
    const sales = db.getSales();
    const filteredSales = sales.filter(s => (!from || new Date(s.date) >= new Date(from)) && (!to || new Date(s.date) <= new Date(to)));
    
    if (type === 'sales') {
        const total = filteredSales.reduce((sum, s) => sum + s.total, 0);
        reportResults.innerHTML = `
            <h4>تقرير المبيعات (${from || 'البداية'} - ${to || 'النهاية'})</h4>
            <table><thead><tr><th>رقم</th><th>التاريخ</th><th>الكاشير</th><th>العميل</th><th>الإجمالي</th></tr></thead><tbody>
                ${filteredSales.map(s => `<tr><td>${s.id}</td><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.cashier}</td><td>${s.customer || 'عادي'}</td><td>${s.total.toFixed(2)} ج</td></tr>`).join('')}
            </tbody></table>
            <div class="profit-stats"><div class="profit-card"><h4>إجمالي المبيعات</h4><div class="value">${total.toFixed(2)} ج</div></div><div class="profit-card"><h4>عدد الفواتير</h4><div class="value">${filteredSales.length}</div></div></div>
        `;
    } else if (type === 'profit') {
        const stats = db.getProfitStats(from, to);
        reportResults.innerHTML = `
            <h4>تقرير الأرباح</h4>
            <div class="profit-stats">
                <div class="profit-card"><h4>إجمالي الإيرادات</h4><div class="value positive">${stats.totalRevenue.toFixed(2)} ج</div></div>
                <div class="profit-card"><h4>تكلفة المبيعات</h4><div class="value">${stats.totalCost.toFixed(2)} ج</div></div>
                <div class="profit-card"><h4>إجمالي المصروفات</h4><div class="value">${stats.totalExpenses.toFixed(2)} ج</div></div>
                <div class="profit-card"><h4>صافي الربح</h4><div class="value ${stats.netProfit >= 0 ? 'positive' : 'negative'}">${stats.netProfit.toFixed(2)} ج</div></div>
                <div class="profit-card"><h4>هامش الربح</h4><div class="value positive">${stats.profitMargin.toFixed(2)}%</div></div>
            </div>
        `;
    } else if (type === 'products') {
        const topProducts = db.getTopProducts(20);
        reportResults.innerHTML = `
            <h4>أكثر المنتجات مبيعاً</h4>
            <table><thead><tr><th>#</th><th>المنتج</th><th>السعر</th><th>عدد المبيعات</th><th>الإيرادات</th></tr></thead><tbody>
                ${topProducts.map((p, i) => `<tr><td>${i+1}</td><td>${p.name}</td><td>${p.price} ج</td><td>${p.salesCount || 0}</td><td>${(p.price * (p.salesCount || 0)).toFixed(2)} ج</td></tr>`).join('')}
            </tbody></table>
        `;
    } else if (type === 'customers') {
        const topCustomers = db.getTopCustomers(20);
        reportResults.innerHTML = `
            <h4>أفضل العملاء</h4>
            <table><thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>نقاط الولاء</th><th>إجمالي المشتريات</th></tr></thead><tbody>
                ${topCustomers.map((c, i) => `<tr><td>${i+1}</td><td>${c.name}</td><td>${c.phone}</td><td>${c.points}</td><td>${c.totalSpent.toFixed(2)} ج</td></tr>`).join('')}
            </tbody></table>
        `;
    }
});

exportReportBtn?.addEventListener('click', function() {
    const content = reportResults.innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `تقرير_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showNotification('تم تصدير التقرير', 'success');
});

// ==================== باقي الصفحات ====================
function loadBarcodeMemoryPage() {
    if (!memoryProductSelect) return;
    const products = db.getProducts();
    memoryProductSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.name} - ${p.barcode}</option>`).join('');
    
    const barcodeMemory = db.getBarcodeMemory();
    barcodeMemoryTable.innerHTML = barcodeMemory.map(b => `
        <tr><td>${b.barcode}</td><td>${db.getProductById(b.productId)?.name || 'غير معروف'}</td><td>${new Date(b.storedAt).toLocaleDateString()}</td>
        <td><button class="action-btn delete-btn" data-id="${b.id}"><i class="bi bi-trash"></i></button></td></tr>
    `).join('');
    
    document.querySelectorAll('#barcodeMemoryTable .delete-btn').forEach(btn => btn.addEventListener('click', () => {
        if (confirm('حذف الباركود؟')) db.removeBarcodeFromMemory(parseInt(btn.dataset.id)) && loadBarcodeMemoryPage();
    }));
}

saveBarcodeBtn?.addEventListener('click', function() {
    const barcode = memoryBarcodeInput.value.trim();
    const productId = parseInt(memoryProductSelect.value);
    if (!barcode || !productId) { showNotification('أدخل الباركود واختر المنتج', 'error'); return; }
    db.addBarcodeToMemory({ barcode, productId });
    loadBarcodeMemoryPage();
    memoryBarcodeInput.value = '';
    showNotification('تم حفظ الباركود', 'success');
});

function loadInvoicesPage() {
    if (!invoicesTableBody) return;
    const sales = db.getSales();
    invoicesTableBody.innerHTML = sales.slice().reverse().map(s => `
        <tr><td>${s.id}</td><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.cashier}</td><td>${s.customer || 'عادي'}</td><td>${s.total.toFixed(2)} ج</td>
        <td><button class="action-btn" onclick="viewInvoiceDetails(${s.id})">عرض</button></td></tr>
    `).join('');
    
    invoiceSearch?.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        document.querySelectorAll('#invoicesTableBody tr').forEach(row => row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none');
    });
}

function viewInvoiceDetails(saleId) {
    const sales = db.getSales();
    const sale = sales.find(s => s.id === saleId);
    if (sale) showInvoiceModal(sale, false);
}

function loadWholesalePage() {
    const invoices = db.getWholesaleInvoices();
    wholesaleTableBody.innerHTML = invoices.slice().reverse().map(i => `
        <tr><td>${i.id}</td><td>${i.customer}</td><td>${new Date(i.date).toLocaleDateString()}</td><td>${i.discount}%</td><td>${i.total.toFixed(2)} ج</td>
        <td><button class="action-btn" onclick="viewWholesaleInvoice(${i.id})">عرض</button></td></tr>
    `).join('');
}

function addProductToWholesaleCart(barcode) {
    const product = db.getProductByBarcode(barcode);
    if (!product) { showNotification('المنتج غير موجود!', 'error'); return; }
    const existing = wholesaleCart.find(i => i.id === product.id);
    if (existing) existing.quantity++;
    else wholesaleCart.push({ ...product, quantity: 1, price: product.wholesalePrice || product.price * 0.8 });
    updateWholesaleCart();
}

function updateWholesaleCart() {
    if (!wholesaleCartItems) return;
    let subtotal = 0;
    wholesaleCartItems.innerHTML = wholesaleCart.map(item => {
        const total = item.price * item.quantity;
        subtotal += total;
        return `
            <div class="cart-item"><div class="cart-item-info"><img src="${item.image}"><div><div>${item.name}</div><div>${item.price} ج (جملة)</div></div></div>
            <div class="quantity-controls"><button class="decrease-btn" data-id="${item.id}">-</button><span>${item.quantity}</span><button class="increase-btn" data-id="${item.id}">+</button></div>
            <div>${total.toFixed(2)} ج</div><button class="remove-item" data-id="${item.id}">×</button></div>
        `;
    }).join('');
    
    const discountRate = parseFloat(wholesaleDiscount.value) / 100;
    const discountAmount = subtotal * discountRate;
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;
    
    wholesaleSubtotal.textContent = formatCurrency(subtotal);
    wholesaleDiscountAmount.textContent = formatCurrency(discountAmount);
    wholesaleTax.textContent = formatCurrency(tax);
    wholesaleTotal.textContent = formatCurrency(total);
    
    document.querySelectorAll('#wholesaleCartItems .decrease-btn').forEach(btn => btn.addEventListener('click', () => {
        const item = wholesaleCart.find(i => i.id == btn.dataset.id);
        if (item && item.quantity > 1) item.quantity--;
        else if (item) wholesaleCart = wholesaleCart.filter(i => i.id != item.id);
        updateWholesaleCart();
    }));
    document.querySelectorAll('#wholesaleCartItems .increase-btn').forEach(btn => btn.addEventListener('click', () => {
        const item = wholesaleCart.find(i => i.id == btn.dataset.id);
        if (item) item.quantity++;
        updateWholesaleCart();
    }));
    document.querySelectorAll('#wholesaleCartItems .remove-item').forEach(btn => btn.addEventListener('click', () => {
        wholesaleCart = wholesaleCart.filter(i => i.id != btn.dataset.id);
        updateWholesaleCart();
    }));
}

addWholesaleProductBtn?.addEventListener('click', () => {
    const barcode = wholesaleBarcode.value.trim();
    if (barcode) { addProductToWholesaleCart(barcode); wholesaleBarcode.value = ''; wholesaleBarcode.focus(); }
});
wholesaleBarcode?.addEventListener('keyup', e => { if (e.key === 'Enter') addWholesaleProductBtn.click(); });
wholesaleDiscount?.addEventListener('input', updateWholesaleCart);

wholesaleCheckoutBtn?.addEventListener('click', function() {
    if (wholesaleCart.length === 0) { showNotification('السلة فارغة!', 'error'); return; }
    const customer = wholesaleCustomer.value.trim();
    if (!customer) { showNotification('أدخل اسم العميل', 'error'); return; }
    
    const subtotal = parseFloat(wholesaleSubtotal.textContent) || 0;
    const discountAmount = parseFloat(wholesaleDiscountAmount.textContent) || 0;
    const tax = parseFloat(wholesaleTax.textContent) || 0;
    const total = parseFloat(wholesaleTotal.textContent) || 0;
    const discountRate = parseFloat(wholesaleDiscount.value);
    
    db.addWholesaleInvoice({ customer, items: [...wholesaleCart], subtotal: subtotal + discountAmount, discount: discountRate, discountAmount, tax, total, cashier: currentUser.username });
    wholesaleCart.forEach(item => db.updateProductStock(item.id, item.quantity, 'بيع جملة'));
    
    showInvoiceModal({ id: Date.now(), customer, date: new Date().toISOString(), cashier: currentUser.username, items: [...wholesaleCart], subtotal: subtotal + discountAmount, discount: discountAmount, tax, total }, true);
    
    wholesaleCart = [];
    wholesaleCustomer.value = '';
    updateWholesaleCart();
    loadWholesalePage();
    showNotification('تم إتمام فاتورة الجملة', 'success');
});

function viewWholesaleInvoice(invoiceId) {
    const invoices = db.getWholesaleInvoices();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) showInvoiceModal(invoice, true);
}

function loadInventoryPage() {
    if (!inventoryTableBody) return;
    const products = db.getProducts();
    inventoryTableBody.innerHTML = products.map(p => `
        <tr><td>${p.name}</td><td>${p.barcode}</td><td><span class="status-badge ${p.stock > p.minStock ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-of-stock'}">${p.stock}</span></td>
        <td>${p.minStock}</td><td>${p.stock === 0 ? 'نفذ' : p.stock <= p.minStock ? 'منخفض' : 'جيد'}</td>
        <td><button class="action-btn edit-stock" data-id="${p.id}"><i class="bi bi-pencil"></i> تعديل</button></td></tr>
    `).join('');
    
    document.querySelectorAll('.edit-stock').forEach(btn => btn.addEventListener('click', () => {
        const product = db.getProductById(btn.dataset.id);
        const newStock = prompt(`تعديل مخزون ${product.name}\nالمخزون الحالي: ${product.stock}`, product.stock);
        if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
            db.updateProduct(product.id, { stock: parseInt(newStock) });
            loadInventoryPage();
            loadProducts();
            updateSidebarData();
            showNotification('تم تحديث المخزون', 'success');
        }
    }));
    
    inventorySearch?.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        document.querySelectorAll('#inventoryTableBody tr').forEach(row => row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none');
    });
}

// ==================== نافذة الفاتورة ====================
function showInvoiceModal(invoice, isWholesale = false) {
    modalInvoiceNumber.textContent = invoice.id;
    modalInvoiceDate.textContent = new Date(invoice.date).toLocaleString('ar-EG');
    modalCashier.textContent = invoice.cashier;
    if (isWholesale && invoice.customer) {
        customerInfo.style.display = 'block';
        modalCustomer.textContent = invoice.customer;
    } else customerInfo.style.display = 'none';
    
    modalPoints && (modalPoints.textContent = invoice.pointsEarned || 0);
    
    modalInvoiceItems.innerHTML = invoice.items.map(item => `
        <tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price.toFixed(2)} ج</td><td>${(item.price * item.quantity).toFixed(2)} ج</td></tr>
    `).join('');
    
    modalSubtotal.textContent = formatCurrency(invoice.subtotal);
    if (invoice.discount && invoice.discount > 0) {
        discountRowModal.style.display = 'flex';
        modalDiscount.textContent = formatCurrency(invoice.discount);
    } else discountRowModal.style.display = 'none';
    modalTax.textContent = formatCurrency(invoice.tax);
    modalTotal.textContent = formatCurrency(invoice.total);
    
    invoiceModal.style.display = 'flex';
}

closeModal?.addEventListener('click', () => invoiceModal.style.display = 'none');
closeModalBtn?.addEventListener('click', () => invoiceModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === invoiceModal) invoiceModal.style.display = 'none'; });

printInvoiceBtn?.addEventListener('click', () => {
    const content = document.querySelector('.modal-content').cloneNode(true);
    const win = window.open('', '_blank');
    win.document.write(`
        <html dir="rtl"><head><title>فاتورة</title><style>body{font-family:'Cairo',sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:right;}.modal-footer{display:none;}</style></head>
        <body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
});

sendWhatsAppBtn?.addEventListener('click', () => {
    const phone = currentCustomer?.phone || '';
    const message = `شكراً لتسوقكم معنا\nرقم الفاتورة: ${modalInvoiceNumber.textContent}\nالإجمالي: ${modalTotal.textContent}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
});

// ==================== تحديث دوري ====================
setInterval(() => { updateSidebarData(); }, 30000);
const refreshSidebarBtn = document.getElementById('refreshSidebar');
refreshSidebarBtn?.addEventListener('click', () => { updateSidebarData(); showNotification('تم تحديث البيانات', 'info'); });

// جعل الدوال متاحة عالمياً
window.showPage = showPage;
window.viewInvoiceDetails = viewInvoiceDetails;
window.viewWholesaleInvoice = viewWholesaleInvoice;
window.addToCart = addToCart;
window.selectCustomer = selectCustomer;