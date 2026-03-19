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
                { id: 2, username: "cashier", password: "cashier123", role: "cashier" },
                { id: 3, username: "owner", password: "esd17237", role: "owner"}
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
            "https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=200", // برتقال
            "https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&w=200", // فراولة
            "https://images.pexels.com/photos/225593/pexels-photo-225593.jpeg?auto=compress&cs=tinysrgb&w=200", // تفاح
            "https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=200", // خضروات
            "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=200", // لحوم
            "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=200", // ألبان
            "https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=200", // مخبوزات
            "https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=200" // شوكولاتة
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
                price: Math.floor(Math.random() * 100) + 5,
                barcode: this.generateBarcode(),
                category: category,
                image: randomImage,
                stock: Math.floor(Math.random() * 100) + 10,
                minStock: 5,
                wholesalePrice: Math.floor(Math.random() * 80) + 3 // سعر الجملة
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
        
        if (product) {
            // تسجيل في سجل المخزون
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

// عناصر النافذة المنبثقة للفاتورة
const invoiceModal = document.getElementById('invoiceModal');
const closeModal = document.querySelector('.close-modal');
const modalInvoiceNumber = document.getElementById('modalInvoiceNumber');
const modalInvoiceDate = document.getElementById('modalInvoiceDate');
const modalCashier = document.getElementById('modalCashier');
const modalCustomer = document.getElementById('modalCustomer');
const modalInvoiceItems = document.getElementById('modalInvoiceItems');
const modalSubtotal = document.getElementById('modalSubtotal');
const modalDiscount = document.getElementById('modalDiscount');
const modalTax = document.getElementById('modalTax');
const modalTotal = document.getElementById('modalTotal');
const printInvoiceBtn = document.getElementById('printInvoiceBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// إضافة عناصر النافذة المنبثقة إلى HTML
function addModalToHTML() {
    const modalHTML = `
        <div id="invoiceModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>تفاصيل الفاتورة</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="invoice-header">
                        <div class="invoice-info">
                            <p><strong>رقم الفاتورة:</strong> <span id="modalInvoiceNumber"></span></p>
                            <p><strong>التاريخ:</strong> <span id="modalInvoiceDate"></span></p>
                            <p><strong>الكاشير:</strong> <span id="modalCashier"></span></p>
                            <p id="customerInfo" style="display: none;"><strong>العميل:</strong> <span id="modalCustomer"></span></p>
                        </div>
                    </div>
                    <div class="invoice-items">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody id="modalInvoiceItems">
                            </tbody>
                        </table>
                    </div>
                    <div class="invoice-summary">
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span id="modalSubtotal">0.00 جنيه</span>
                        </div>
                        <div class="summary-row" id="discountRow" style="display: none;">
                            <span>الخصم:</span>
                            <span id="modalDiscount">0.00 جنيه</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (14%):</span>
                            <span id="modalTax">0.00 جنيه</span>
                        </div>
                        <div class="summary-row total">
                            <span>الإجمالي:</span>
                            <span id="modalTotal">0.00 جنيه</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="printInvoiceBtn" class="action-btn print-btn">
                        <i class="bi bi-printer"></i> طباعة الفاتورة
                    </button>
                    <button id="closeModalBtn" class="action-btn close-btn">
                        <i class="bi bi-x-lg"></i> إغلاق
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// استدعاء الدالة لإضافة النافذة المنبثقة
addModalToHTML();

// إعادة تعريف عناصر النافذة المنبثقة بعد إضافتها
const invoiceModalNew = document.getElementById('invoiceModal');
const closeModalNew = document.querySelector('.close-modal');
const modalInvoiceNumberNew = document.getElementById('modalInvoiceNumber');
const modalInvoiceDateNew = document.getElementById('modalInvoiceDate');
const modalCashierNew = document.getElementById('modalCashier');
const modalCustomerNew = document.getElementById('modalCustomer');
const modalInvoiceItemsNew = document.getElementById('modalInvoiceItems');
const modalSubtotalNew = document.getElementById('modalSubtotal');
const modalDiscountNew = document.getElementById('modalDiscount');
const modalTaxNew = document.getElementById('modalTax');
const modalTotalNew = document.getElementById('modalTotal');
const printInvoiceBtnNew = document.getElementById('printInvoiceBtn');
const closeModalBtnNew = document.getElementById('closeModalBtn');
const discountRow = document.getElementById('discountRow');
const customerInfo = document.getElementById('customerInfo');

// وظيفة عرض تفاصيل الفاتورة في النافذة المنبثقة
function showInvoiceModal(invoiceData, isWholesale = false) {
    // تعيين معلومات الفاتورة
    modalInvoiceNumberNew.textContent = invoiceData.id;
    modalInvoiceDateNew.textContent = new Date(invoiceData.date).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    modalCashierNew.textContent = invoiceData.cashier;

    // إظهار/إخفاء معلومات العميل
    if (isWholesale && invoiceData.customer) {
        customerInfo.style.display = 'block';
        modalCustomerNew.textContent = invoiceData.customer;
    } else {
        customerInfo.style.display = 'none';
    }

    // عرض منتجات الفاتورة
    modalInvoiceItemsNew.innerHTML = '';
    invoiceData.items.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)} جنيه</td>
            <td>${itemTotal.toFixed(2)} جنيه</td>
        `;
        modalInvoiceItemsNew.appendChild(row);
    });

    // عرض المجاميع
    modalSubtotalNew.textContent = `${invoiceData.subtotal.toFixed(2)} جنيه`;
    
    if (isWholesale && invoiceData.discountAmount) {
        discountRow.style.display = 'flex';
        modalDiscountNew.textContent = `${invoiceData.discountAmount.toFixed(2)} جنيه (${invoiceData.discount}%)`;
    } else {
        discountRow.style.display = 'none';
    }
    
    modalTaxNew.textContent = `${invoiceData.tax.toFixed(2)} جنيه`;
    modalTotalNew.textContent = `${invoiceData.total.toFixed(2)} جنيه`;

    // إظهار النافذة المنبثقة
    invoiceModalNew.style.display = 'flex';
}

// وظيفة طباعة الفاتورة
function printInvoice() {
    const printContent = document.querySelector('.modal-content').cloneNode(true);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                    direction: rtl;
                }
                .invoice-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .invoice-info {
                    margin-bottom: 20px;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .items-table th,
                .items-table td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: right;
                }
                .items-table th {
                    background-color: #f8f9fa;
                }
                .invoice-summary {
                    margin-top: 20px;
                    text-align: left;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                }
                .summary-row.total {
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #333;
                }
                .modal-footer {
                    display: none;
                }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// إضافة أحداث للنافذة المنبثقة
if (closeModalNew) {
    closeModalNew.addEventListener('click', () => {
        invoiceModalNew.style.display = 'none';
    });
}

if (closeModalBtnNew) {
    closeModalBtnNew.addEventListener('click', () => {
        invoiceModalNew.style.display = 'none';
    });
}

if (printInvoiceBtnNew) {
    printInvoiceBtnNew.addEventListener('click', printInvoice);
}

// إغلاق النافذة عند النقر خارجها
window.addEventListener('click', (event) => {
    if (event.target === invoiceModalNew) {
        invoiceModalNew.style.display = 'none';
    }
});

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
        updateSidebarData();
        
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
        updateSidebarData();
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
if (passwordInput) {
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            loginBtn.click();
        }
    });
}

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

    // عناصر القائمة للمالك
    const ownerMenuItems = [
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
    // إضافة عناصر القائمة للمالك فقط
    if (currentUser && currentUser.role === 'owner') {
        ownerMenuItems.forEach(item => {
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
    if (!transactionsList) return;
    
    transactionsList.innerHTML = '';
    
    transactions.slice(0, 5).forEach(transaction => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="transaction-icon">
                <i class="bi ${transaction.type === 'بيع' ? 'bi-cart' : 'bi-truck'}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-title">${transaction.type} - ${transaction.details}</span>
                    <span class="transaction-badge completed">مكتملة</span>
                </div>
                <div class="transaction-details">
                    <span class="transaction-customer">
                        <i class="bi bi-person"></i>
                        ${transaction.cashier}
                    </span>
                    <span class="transaction-amount">${transaction.amount.toFixed(2)} ج</span>
                </div>
                <div class="transaction-time">
                    <i class="bi bi-clock"></i>
                    ${new Date(transaction.time).toLocaleTimeString('ar-EG')}
                </div>
            </div>
        `;
        transactionsList.appendChild(li);
    });
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <li class="transaction-item" style="justify-content: center; text-align: center; color: var(--gray-500);">
                <i class="bi bi-inbox" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>لا توجد معاملات حديثة</p>
            </li>
        `;
    }
}

// عرض الصفحة المحددة
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
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
if (scanBarcodeBtn) {
    scanBarcodeBtn.addEventListener('click', function() {
        const barcode = barcodeInput.value.trim();
        if (barcode) {
            searchByBarcode(barcode);
        }
    });
}

if (barcodeInput) {
    barcodeInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const barcode = barcodeInput.value.trim();
            if (barcode) {
                searchByBarcode(barcode);
            }
        }
    });
}

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
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // إضافة تحذير إذا كان المخزون منخفضاً
        const stockWarning = product.stock <= product.minStock ? `<div class="stock-low">منخفض (${product.stock})</div>` : '';
        
        productCard.innerHTML = `
            <img src="${product.image}" onerror="this.src='https://via.placeholder.com/80'" alt="${product.name}">
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
    if (!cartItems) return;
    
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
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} جنيه</div>
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
    
    if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)} جنيه`;
    if (taxElement) taxElement.textContent = `${tax.toFixed(2)} جنيه`;
    if (totalElement) totalElement.textContent = `${total.toFixed(2)} جنيه`;
}

// إتمام عملية الشراء
if (checkoutBtn) {
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
        
        // عرض تفاصيل الفاتورة في النافذة المنبثقة
        const saleData = {
            id: saleId,
            date: new Date().toISOString(),
            cashier: currentUser.username,
            items: [...cart],
            subtotal: subtotal,
            tax: tax,
            total: total
        };
        
        showInvoiceModal(saleData, false);
        
        // تفريغ السلة بعد إتمام الشراء
        cart = [];
        updateCart();
        loadProducts(); // إعادة تحميل المنتجات لتحديث المخزون
        loadRecentTransactions(); // تحديث المعاملات الحديثة
        updateSidebarData(); // تحديث القائمة الجانبية
    });
}

// تحميل جدول المنتجات في صفحة الإدارة
function loadProductsTable() {
    const products = db.getProducts();
    if (!productsTableBody) return;
    
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
                updateSidebarData(); // تحديث القائمة الجانبية
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
            updateSidebarData();
        }
    }
}

// إضافة منتج جديد
if (addProductBtn) {
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
            image: `https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=200`,
            stock: stock,
            minStock: 5,
            wholesalePrice: price * 0.8 // سعر الجملة 80% من سعر التجزئة
        };
        
        db.addProduct(newProduct);
        loadProductsTable();
        loadProducts(); // تحديث قائمة المنتجات في صفحة الكاشير
        updateSidebarData(); // تحديث القائمة الجانبية
        
        // تفريغ الحقول
        productNameInput.value = '';
        productPriceInput.value = '';
        productBarcodeInput.value = '';
        productStockInput.value = '';
        
        alert('تم إضافة المنتج بنجاح!');
    });
}

// تحميل صفحة تخزين الباركود
function loadBarcodeMemoryPage() {
    // تحميل قائمة المنتجات في القائمة المنسدلة
    const products = db.getProducts();
    if (!memoryProductSelect) return;
    
    memoryProductSelect.innerHTML = '';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ${product.barcode}`;
        memoryProductSelect.appendChild(option);
    });
    
    // تحميل جدول الباركود المخزن
    const barcodeMemory = db.getBarcodeMemory();
    if (!barcodeMemoryTable) return;
    
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
if (saveBarcodeBtn) {
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
}

// تحميل صفحة الفواتير
function loadInvoicesPage() {
    const sales = db.getSales();
    if (!invoicesTableBody) return;
    
    invoicesTableBody.innerHTML = '';
    
    sales.slice().reverse().forEach(sale => {
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
    if (invoiceSearch) {
        invoiceSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = invoicesTableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// عرض تفاصيل الفاتورة
function viewInvoiceDetails(saleId) {
    const sales = db.getSales();
    const sale = sales.find(s => s.id === saleId);
    
    if (sale) {
        showInvoiceModal(sale, false);
    }
}

// تحميل صفحة فواتير الجملة
function loadWholesalePage() {
    // تحميل فواتير الجملة السابقة
    const wholesaleInvoices = db.getWholesaleInvoices();
    if (!wholesaleTableBody) return;
    
    wholesaleTableBody.innerHTML = '';
    
    wholesaleInvoices.slice().reverse().forEach(invoice => {
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
    if (!wholesaleCartItems) return;
    
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
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} جنيه (جملة)</div>
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
    
    if (wholesaleSubtotal) wholesaleSubtotal.textContent = `${subtotal.toFixed(2)} جنيه`;
    if (wholesaleDiscountAmount) wholesaleDiscountAmount.textContent = `${discountAmount.toFixed(2)} جنيه`;
    if (wholesaleTax) wholesaleTax.textContent = `${tax.toFixed(2)} جنيه`;
    if (wholesaleTotal) wholesaleTotal.textContent = `${total.toFixed(2)} جنيه`;
}

// إضافة حدث لإضافة منتج إلى سلة الجملة
if (addWholesaleProductBtn) {
    addWholesaleProductBtn.addEventListener('click', function() {
        const barcode = wholesaleBarcode.value.trim();
        if (barcode) {
            addProductToWholesaleCart(barcode);
            wholesaleBarcode.value = '';
            wholesaleBarcode.focus();
        }
    });
}

if (wholesaleBarcode) {
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
}

// إتمام فاتورة الجملة
if (wholesaleCheckoutBtn) {
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
        
        // عرض تفاصيل فاتورة الجملة في النافذة المنبثقة
        const invoiceData = {
            id: invoiceId,
            customer: customer,
            date: new Date().toISOString(),
            cashier: currentUser.username,
            items: [...wholesaleCart],
            subtotal: subtotal,
            discount: discountRate,
            discountAmount: discountAmount,
            tax: tax,
            total: total
        };
        
        showInvoiceModal(invoiceData, true);
        
        // تفريغ سلة الجملة بعد إتمام الفاتورة
        wholesaleCart = [];
        wholesaleCustomer.value = '';
        updateWholesaleCart();
        loadWholesalePage(); // تحديث صفحة فواتير الجملة
        loadRecentTransactions(); // تحديث المعاملات الحديثة
        updateSidebarData(); // تحديث القائمة الجانبية
    });
}

// عرض فاتورة الجملة
function viewWholesaleInvoice(invoiceId) {
    const invoices = db.getWholesaleInvoices();
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (invoice) {
        showInvoiceModal(invoice, true);
    }
}

// تحديث سلة الجملة عند تغيير نسبة الخصم
if (wholesaleDiscount) {
    wholesaleDiscount.addEventListener('input', updateWholesaleCart);
}

// تحميل صفحة المخزون
function loadInventoryPage() {
    const products = db.getProducts();
    const inventoryLog = db.getInventoryLog();
    if (!inventoryTableBody) return;
    
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
    if (inventorySearch) {
        inventorySearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = inventoryTableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
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
            updateSidebarData(); // تحديث القائمة الجانبية
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
    
    const reportResults = document.getElementById('reportResults');
    if (reportResults) {
        reportResults.innerHTML = `
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
}

// ==================== وظائف القائمة الجانبية المحسنة ====================

// إدارة التبويبات في القائمة الجانبية
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // إزالة الكلاس النشط من جميع الأزرار والمحتويات
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // إضافة الكلاس النشط للزر الحالي
        this.classList.add('active');
        
        // إظهار المحتوى المناسب
        const tabId = this.dataset.tab;
        const tabContent = document.getElementById(tabId + 'Tab');
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

// تحديث البيانات في القائمة الجانبية
function updateSidebarData() {
    // تحديث إحصائيات سريعة
    updateQuickStats();
    
    // تحديث قائمة المعاملات
    updateTransactionsList();
    
    // تحديث المنتجات الأكثر مبيعاً
    updateTopProducts();
    
    // تحديث الكاشير النشط
    updateActiveCashiers();
    
    // تحديث تنبيهات المخزون
    updateStockAlerts();
    
    // تحديث مؤشرات الأداء
    updatePerformanceMetrics();
}

// تحديث الإحصائيات السريعة
function updateQuickStats() {
    const today = new Date().toDateString();
    const sales = db.getSales();
    const todayInvoices = sales.filter(inv => 
        new Date(inv.date).toDateString() === today
    );
    
    const todaySalesCount = todayInvoices.length;
    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    const todaySalesCountEl = document.getElementById('todaySalesCount');
    const todayRevenueEl = document.getElementById('todayRevenue');
    
    if (todaySalesCountEl) todaySalesCountEl.textContent = todaySalesCount;
    if (todayRevenueEl) todayRevenueEl.textContent = todayRevenue.toFixed(2) + ' ج';
    
    // عدد الكاشير النشط (محاكاة)
    const activeCashiersCount = 3;
    const activeCashiersEl = document.getElementById('activeCashiers');
    if (activeCashiersEl) activeCashiersEl.textContent = activeCashiersCount;
    
    // المنتجات منخفضة المخزون
    const products = db.getProducts();
    const lowStockProducts = products.filter(p => p.stock < 10);
    const lowStockEl = document.getElementById('lowStock');
    if (lowStockEl) lowStockEl.textContent = lowStockProducts.length;
}

// تحديث قائمة المعاملات
function updateTransactionsList() {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;
    
    const invoices = db.getSales();
    
    // أخذ آخر 5 فواتير
    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    transactionsList.innerHTML = recentInvoices.map(inv => {
        const status = inv.status || 'completed';
        const statusText = status === 'completed' ? 'مكتملة' : 'معلقة';
        const statusClass = status === 'completed' ? 'completed' : 'pending';
        
        return `
            <li class="transaction-item ${statusClass}" onclick="viewInvoiceDetails(${inv.id})">
                <div class="transaction-icon">
                    <i class="bi bi-receipt"></i>
                </div>
                <div class="transaction-info">
                    <div class="transaction-header">
                        <span class="transaction-title">فاتورة #${inv.id}</span>
                        <span class="transaction-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-customer">
                            <i class="bi bi-person"></i>
                            ${inv.cashier || 'كاشير'}
                        </span>
                        <span class="transaction-amount">${inv.total.toFixed(2)} ج</span>
                    </div>
                    <div class="transaction-time">
                        <i class="bi bi-clock"></i>
                        ${new Date(inv.date).toLocaleTimeString('ar-EG')}
                    </div>
                </div>
            </li>
        `;
    }).join('');
    
    // إذا لم توجد معاملات
    if (recentInvoices.length === 0) {
        transactionsList.innerHTML = `
            <li class="transaction-item" style="justify-content: center; text-align: center; color: var(--gray-500);">
                <i class="bi bi-inbox" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>لا توجد معاملات حديثة</p>
            </li>
        `;
    }
}

// تحديث المنتجات الأكثر مبيعاً
function updateTopProducts() {
    const topProductsList = document.getElementById('topProductsList');
    if (!topProductsList) return;
    
    const products = db.getProducts();
    
    // محاكاة لأكثر المنتجات مبيعاً
    const topProducts = products
        .map(p => ({...p, sales: Math.floor(Math.random() * 100) + 20 }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
    
    topProductsList.innerHTML = topProducts.map((p, index) => `
        <div class="top-product-item">
            <span class="product-rank">${index + 1}</span>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-stats">
                    <span>${p.sales} مبيعات</span>
                    <span class="product-sales">${(p.price * p.sales).toFixed(2)} ج</span>
                </div>
            </div>
        </div>
    `).join('');
}

// تحديث الكاشير النشط
function updateActiveCashiers() {
    const activeCashiersList = document.getElementById('activeCashiersList');
    if (!activeCashiersList) return;
    
    const cashiers = [
        { name: 'أحمد علي', shift: 'صباحي', sales: 25 },
        { name: 'محمد حسن', shift: 'صباحي', sales: 18 },
        { name: 'سارة أحمد', shift: 'مسائي', sales: 15 },
        { name: 'نورا محمد', shift: 'مسائي', sales: 12 }
    ];
    
    activeCashiersList.innerHTML = cashiers.map(c => `
        <div class="cashier-item">
            <div class="cashier-avatar">
                ${c.name.charAt(0)}
            </div>
            <div class="cashier-info">
                <div class="cashier-name">${c.name}</div>
                <div class="cashier-status">
                    <span class="status-dot"></span>
                    ${c.shift} - ${c.sales} فاتورة
                </div>
            </div>
        </div>
    `).join('');
}

// تحديث تنبيهات المخزون
function updateStockAlerts() {
    const stockAlertsList = document.getElementById('stockAlertsList');
    if (!stockAlertsList) return;
    
    const products = db.getProducts();
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    stockAlertsList.innerHTML = lowStockProducts.map(p => {
        const alertClass = p.stock < 5 ? 'danger' : 'warning';
        const icon = p.stock < 5 ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill';
        
        return `
            <div class="alert-item ${alertClass}">
                <div class="alert-icon">
                    <i class="bi ${icon}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${p.name}</div>
                    <div class="alert-desc">المتبقي: ${p.stock} وحدة</div>
                </div>
                <a href="#" class="alert-action" onclick="showPage('inventoryPage')">
                    <i class="bi bi-arrow-left"></i>
                </a>
            </div>
        `;
    }).join('');
    
    if (lowStockProducts.length === 0) {
        stockAlertsList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--gray-500);">
                <i class="bi bi-check-circle" style="font-size: 2rem; color: var(--success-color);"></i>
                <p>المخزون جيد، لا توجد تنبيهات</p>
            </div>
        `;
    }
}

// تحديث مؤشرات الأداء
function updatePerformanceMetrics() {
    const sales = db.getSales();
    
    // حساب معدل المبيعات اليوم
    const today = new Date().toDateString();
    const todayInvoices = sales.filter(inv => 
        new Date(inv.date).toDateString() === today
    );
    
    const dailyTarget = 50; // الهدف اليومي 50 فاتورة
    const dailyRate = Math.min(100, (todayInvoices.length / dailyTarget) * 100);
    
    const dailySalesRateEl = document.getElementById('dailySalesRate');
    if (dailySalesRateEl) dailySalesRateEl.textContent = dailyRate.toFixed(0) + '%';
    
    const progressBars = document.querySelectorAll('#statsTab .metric-progress');
    if (progressBars[0]) progressBars[0].style.width = dailyRate + '%';
    
    // دوران المخزون (محاكاة)
    const turnover = 70;
    const inventoryTurnoverEl = document.getElementById('inventoryTurnover');
    if (inventoryTurnoverEl) inventoryTurnoverEl.textContent = turnover + '%';
    if (progressBars[1]) progressBars[1].style.width = turnover + '%';
    
    // رضا العملاء (محاكاة)
    const satisfaction = 92;
    const customerSatisfactionEl = document.getElementById('customerSatisfaction');
    if (customerSatisfactionEl) customerSatisfactionEl.textContent = satisfaction + '%';
    if (progressBars[2]) progressBars[2].style.width = satisfaction + '%';
}

// زر تحديث القائمة الجانبية
const refreshSidebar = document.getElementById('refreshSidebar');
if (refreshSidebar) {
    refreshSidebar.addEventListener('click', function() {
        this.classList.add('pulse');
        updateSidebarData();
        setTimeout(() => this.classList.remove('pulse'), 300);
        
        // إظهار إشعار بالتحديث
        showNotification('تم تحديث البيانات', 'info');
    });
}

// البحث في القائمة الجانبية
const sidebarSearch = document.getElementById('sidebarSearch');
if (sidebarSearch) {
    sidebarSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const transactions = document.querySelectorAll('.transaction-item');
        
        transactions.forEach(trans => {
            const text = trans.textContent.toLowerCase();
            if (text.includes(searchTerm) || searchTerm === '') {
                trans.style.display = 'flex';
            } else {
                trans.style.display = 'none';
            }
        });
    });
}

// دالة إظهار الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// تحديث البيانات كل 30 ثانية
setInterval(updateSidebarData, 30000);

// التركيز على حقل الباركود عند تحميل الصفحة
window.addEventListener('load', function() {
    if (barcodeInput) {
        barcodeInput.focus();
    }
    updateSidebarData();
});

// جعل الدوال متاحة عالمياً
window.showPage = showPage;
window.viewInvoiceDetails = viewInvoiceDetails;
window.viewWholesaleInvoice = viewWholesaleInvoice;