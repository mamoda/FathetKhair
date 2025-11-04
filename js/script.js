// ===============================
// نظام إدارة الجلسات المتقدم
// ===============================
class SessionManager {
    constructor() {
        this.currentSessionKey = 'currentSession';
        this.cartKey = 'currentCart';
        this.wholesaleCartKey = 'wholesaleCart';
        this.currentPageKey = 'currentPage';
        this.settingsKey = 'userSettings';
    }

    saveSession(user) {
        const sessionData = {
            user: user,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 ساعات
        };
        sessionStorage.setItem(this.currentSessionKey, JSON.stringify(sessionData));
    }

    getSession() {
        const sessionData = sessionStorage.getItem(this.currentSessionKey);
        if (!sessionData) return null;

        try {
            const session = JSON.parse(sessionData);
            if (new Date() > new Date(session.expiresAt)) {
                this.clearSession();
                return null;
            }
            return session.user;
        } catch {
            this.clearSession();
            return null;
        }
    }

    clearSession() {
        sessionStorage.removeItem(this.currentSessionKey);
        sessionStorage.removeItem(this.cartKey);
        sessionStorage.removeItem(this.wholesaleCartKey);
        sessionStorage.removeItem(this.currentPageKey);
    }

    refreshSession() {
        const sessionData = sessionStorage.getItem(this.currentSessionKey);
        if (sessionData) {
            const session = JSON.parse(sessionData);
            session.expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
            sessionStorage.setItem(this.currentSessionKey, JSON.stringify(session));
        }
    }

    saveCart(cart) {
        sessionStorage.setItem(this.cartKey, JSON.stringify(cart));
    }

    getCart() {
        try {
            const cartData = sessionStorage.getItem(this.cartKey);
            return cartData ? JSON.parse(cartData) : [];
        } catch {
            return [];
        }
    }

    saveWholesaleCart(cart) {
        sessionStorage.setItem(this.wholesaleCartKey, JSON.stringify(cart));
    }

    getWholesaleCart() {
        try {
            const cartData = sessionStorage.getItem(this.wholesaleCartKey);
            return cartData ? JSON.parse(cartData) : [];
        } catch {
            return [];
        }
    }

    saveCurrentPage(pageId) {
        sessionStorage.setItem(this.currentPageKey, pageId);
    }

    getCurrentPage() {
        return sessionStorage.getItem(this.currentPageKey) || 'cashierPage';
    }

    saveUserSettings(settings) {
        const userSettings = this.getUserSettings();
        const newSettings = { ...userSettings, ...settings };
        localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
    }

    getUserSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.settingsKey)) || {};
        } catch {
            return {};
        }
    }
}

// ===============================
// نظام الإشعارات المتقدم
// ===============================
class NotificationManager {
    constructor() {
        this.notificationContainer = null;
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.injectStyles();
    }

    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.notificationContainer);
    }

    injectStyles() {
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notificationSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes notificationSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification {
                    animation: notificationSlideIn 0.3s ease-out;
                }
                .notification.hiding {
                    animation: notificationSlideOut 0.3s ease-in;
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-right: 4px solid ${this.getBorderColor(type)};
            min-width: 300px;
        `;

        notification.innerHTML = `
            <div style="flex: 1;">
                <strong style="display: block; margin-bottom: 5px;">${this.getTypeText(type)}</strong>
                <div style="font-size: 14px;">${message}</div>
            </div>
            <button class="notification-close" style="background: none; border: none; color: white; cursor: pointer; margin-right: 10px; font-size: 18px; padding: 0 5px;">×</button>
        `;

        this.notificationContainer.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    removeNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#34a853',
            error: '#ea4335',
            warning: '#fbbc05',
            info: '#1a73e8'
        };
        return colors[type] || colors.info;
    }

    getBorderColor(type) {
        const colors = {
            success: '#2e8b47',
            error: '#d32f2f',
            warning: '#e6a700',
            info: '#0d62d9'
        };
        return colors[type] || colors.info;
    }

    getTypeText(type) {
        const texts = {
            success: '✅ نجاح',
            error: '❌ خطأ',
            warning: '⚠️ تحذير',
            info: 'ℹ️ معلومة'
        };
        return texts[type] || texts.info;
    }
}

// ===============================
// نظام البحث المتقدم
// ===============================
class SearchManager {
    constructor() {
        this.searchIndex = null;
        this.initializeSearchIndex();
    }

    initializeSearchIndex() {
        const products = db.getProducts();
        this.searchIndex = products.map(product => ({
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            category: product.category,
            price: product.price,
            stock: product.stock,
            searchText: `${product.name} ${product.barcode} ${product.category}`.toLowerCase()
        }));
    }

    searchProducts(query, fields = ['name', 'barcode', 'category']) {
        if (!query.trim()) return this.searchIndex;

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return this.searchIndex.filter(item => {
            return searchTerms.every(term => {
                return fields.some(field => {
                    const value = String(item[field] || '').toLowerCase();
                    return value.includes(term);
                });
            });
        });
    }

    searchSales(query) {
        const sales = db.getSales();
        if (!query.trim()) return sales;

        const searchTerm = query.toLowerCase();
        return sales.filter(sale => {
            return sale.id.toString().includes(query) ||
                   sale.cashier.toLowerCase().includes(searchTerm) ||
                   sale.total.toString().includes(query) ||
                   sale.items.some(item => item.name.toLowerCase().includes(searchTerm));
        });
    }

    searchWholesaleInvoices(query) {
        const invoices = db.getWholesaleInvoices();
        if (!query.trim()) return invoices;

        const searchTerm = query.toLowerCase();
        return invoices.filter(invoice => {
            return invoice.id.toString().includes(query) ||
                   invoice.customer.toLowerCase().includes(searchTerm) ||
                   invoice.total.toString().includes(query) ||
                   invoice.items.some(item => item.name.toLowerCase().includes(searchTerm));
        });
    }

    searchInventory(query) {
        const products = db.getProducts();
        if (!query.trim()) return products;

        const searchTerm = query.toLowerCase();
        return products.filter(product => {
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.barcode.includes(query) ||
                   product.category.toLowerCase().includes(searchTerm) ||
                   product.id.toString().includes(query);
        });
    }
}

// ===============================
// نظام النسخ الاحتياطي
// ===============================
class BackupManager {
    constructor() {
        this.backupKey = 'systemBackups';
        this.maxBackups = 10;
    }

    createBackup(name = null) {
        try {
            const backupData = {
                name: name || `نسخة احتياطية ${new Date().toLocaleString('ar-EG')}`,
                date: new Date().toISOString(),
                timestamp: Date.now(),
                data: {
                    users: db.getUsers(),
                    products: db.getProducts(),
                    sales: db.getSales(),
                    wholesaleInvoices: db.getWholesaleInvoices(),
                    barcodeMemory: db.getBarcodeMemory(),
                    inventoryLog: db.getInventoryLog(),
                    recentTransactions: db.getRecentTransactions(),
                    settings: db.getSettings()
                }
            };

            const backups = this.getBackups();
            backups.push(backupData);
            
            backups.sort((a, b) => b.timestamp - a.timestamp);
            
            if (backups.length > this.maxBackups) {
                backups.splice(this.maxBackups);
            }

            localStorage.setItem(this.backupKey, JSON.stringify(backups));
            return { success: true, backup: backupData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getBackups() {
        try {
            return JSON.parse(localStorage.getItem(this.backupKey)) || [];
        } catch {
            return [];
        }
    }

    restoreBackup(backupIndex) {
        try {
            const backups = this.getBackups();
            if (backupIndex < 0 || backupIndex >= backups.length) {
                throw new Error('النسخة الاحتياطية غير موجودة');
            }

            const backup = backups[backupIndex];
            
            localStorage.setItem('users', JSON.stringify(backup.data.users || []));
            localStorage.setItem('products', JSON.stringify(backup.data.products || []));
            localStorage.setItem('sales', JSON.stringify(backup.data.sales || []));
            localStorage.setItem('wholesaleInvoices', JSON.stringify(backup.data.wholesaleInvoices || []));
            localStorage.setItem('barcodeMemory', JSON.stringify(backup.data.barcodeMemory || []));
            localStorage.setItem('inventoryLog', JSON.stringify(backup.data.inventoryLog || []));
            localStorage.setItem('recentTransactions', JSON.stringify(backup.data.recentTransactions || []));
            localStorage.setItem('systemSettings', JSON.stringify(backup.data.settings || {}));

            return { success: true, backup: backup };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteBackup(backupIndex) {
        try {
            const backups = this.getBackups();
            if (backupIndex < 0 || backupIndex >= backups.length) {
                throw new Error('النسخة الاحتياطية غير موجودة');
            }

            backups.splice(backupIndex, 1);
            localStorage.setItem(this.backupKey, JSON.stringify(backups));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    exportData() {
        try {
            const data = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                data: {
                    users: db.getUsers(),
                    products: db.getProducts(),
                    sales: db.getSales(),
                    wholesaleInvoices: db.getWholesaleInvoices(),
                    barcodeMemory: db.getBarcodeMemory(),
                    inventoryLog: db.getInventoryLog(),
                    recentTransactions: db.getRecentTransactions(),
                    settings: db.getSettings()
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!this.validateImportData(data)) {
                        throw new Error('ملف غير صالح أو تالف');
                    }

                    localStorage.setItem('users', JSON.stringify(data.data.users || []));
                    localStorage.setItem('products', JSON.stringify(data.data.products || []));
                    localStorage.setItem('sales', JSON.stringify(data.data.sales || []));
                    localStorage.setItem('wholesaleInvoices', JSON.stringify(data.data.wholesaleInvoices || []));
                    localStorage.setItem('barcodeMemory', JSON.stringify(data.data.barcodeMemory || []));
                    localStorage.setItem('inventoryLog', JSON.stringify(data.data.inventoryLog || []));
                    localStorage.setItem('recentTransactions', JSON.stringify(data.data.recentTransactions || []));
                    localStorage.setItem('systemSettings', JSON.stringify(data.data.settings || {}));

                    resolve({ success: true, data: data });
                } catch (error) {
                    reject({ success: false, error: error.message });
                }
            };
            reader.onerror = () => reject({ success: false, error: 'خطأ في قراءة الملف' });
            reader.readAsText(file);
        });
    }

    validateImportData(data) {
        return data && 
               typeof data === 'object' && 
               data.data && 
               Array.isArray(data.data.products);
    }
}

// ===============================
// نظام التحليلات والإحصائيات
// ===============================
class AnalyticsManager {
    constructor() {
        this.cache = {};
        this.cacheDuration = 5 * 60 * 1000; // 5 دقائق
    }

    getDailyStats(date = new Date()) {
        const cacheKey = `daily_${date.toISOString().split('T')[0]}`;
        if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < this.cacheDuration) {
            return this.cache[cacheKey].data;
        }

        const sales = db.getSales();
        const wholesaleInvoices = db.getWholesaleInvoices();
        const targetDate = date.toISOString().split('T')[0];

        const dailySales = sales.filter(sale => sale.date.split('T')[0] === targetDate);
        const dailyWholesale = wholesaleInvoices.filter(invoice => invoice.date.split('T')[0] === targetDate);

        const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.total, 0) +
                           dailyWholesale.reduce((sum, invoice) => sum + invoice.total, 0);

        const totalTransactions = dailySales.length + dailyWholesale.length;
        
        const totalItemsSold = this.calculateTotalItemsSold(dailySales, dailyWholesale);

        const result = {
            date: targetDate,
            totalRevenue,
            totalTransactions,
            totalItemsSold,
            retailSales: dailySales.length,
            wholesaleSales: dailyWholesale.length,
            averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
            averageItemsPerTransaction: totalTransactions > 0 ? totalItemsSold / totalTransactions : 0
        };

        this.cache[cacheKey] = {
            data: result,
            timestamp: Date.now()
        };

        return result;
    }

    getWeeklyStats(startDate = new Date()) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const sales = db.getSales();
        const wholesaleInvoices = db.getWholesaleInvoices();

        const weeklySales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const weeklyWholesale = wholesaleInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= startDate && invoiceDate <= endDate;
        });

        const dailyBreakdown = this.getDailyBreakdown(startDate, endDate, weeklySales, weeklyWholesale);

        return {
            period: `${startDate.toLocaleDateString('ar-EG')} - ${endDate.toLocaleDateString('ar-EG')}`,
            totalRevenue: weeklySales.reduce((sum, sale) => sum + sale.total, 0) +
                         weeklyWholesale.reduce((sum, invoice) => sum + invoice.total, 0),
            totalTransactions: weeklySales.length + weeklyWholesale.length,
            retailSales: weeklySales.length,
            wholesaleSales: weeklyWholesale.length,
            dailyBreakdown
        };
    }

    getMonthlyStats(year = new Date().getFullYear(), month = new Date().getMonth()) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        const sales = db.getSales();
        const wholesaleInvoices = db.getWholesaleInvoices();

        const monthlySales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const monthlyWholesale = wholesaleInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= startDate && invoiceDate <= endDate;
        });

        const categoryStats = this.getCategoryStats(monthlySales, monthlyWholesale);

        return {
            period: `${year}-${month + 1}`,
            totalRevenue: monthlySales.reduce((sum, sale) => sum + sale.total, 0) +
                         monthlyWholesale.reduce((sum, invoice) => sum + invoice.total, 0),
            totalTransactions: monthlySales.length + monthlyWholesale.length,
            retailSales: monthlySales.length,
            wholesaleSales: monthlyWholesale.length,
            categoryStats,
            topProducts: this.getTopProducts(monthlySales, monthlyWholesale, 10)
        };
    }

    getProductStats() {
        const products = db.getProducts();
        const sales = db.getSales();
        const wholesaleInvoices = db.getWholesaleInvoices();

        return products.map(product => {
            let totalSold = 0;
            let totalRevenue = 0;
            let lastSoldDate = null;

            [...sales, ...wholesaleInvoices].forEach(transaction => {
                transaction.items.forEach(item => {
                    if (item.id === product.id) {
                        totalSold += item.quantity;
                        totalRevenue += item.price * item.quantity;
                        lastSoldDate = transaction.date;
                    }
                });
            });

            return {
                ...product,
                totalSold,
                totalRevenue,
                stockValue: product.stock * product.price,
                turnoverRate: product.stock > 0 ? totalSold / product.stock : 0,
                lastSoldDate,
                profitability: totalRevenue - (product.wholesalePrice * totalSold)
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    getCategoryStats(sales = null, wholesaleInvoices = null) {
        const productStats = this.getProductStats();
        const categoryStats = {};

        productStats.forEach(product => {
            if (!categoryStats[product.category]) {
                categoryStats[product.category] = {
                    totalRevenue: 0,
                    totalSold: 0,
                    productsCount: 0,
                    stockValue: 0,
                    profitability: 0
                };
            }

            categoryStats[product.category].totalRevenue += product.totalRevenue;
            categoryStats[product.category].totalSold += product.totalSold;
            categoryStats[product.category].productsCount++;
            categoryStats[product.category].stockValue += product.stockValue;
            categoryStats[product.category].profitability += product.profitability;
        });

        return categoryStats;
    }

    getTopProducts(sales, wholesaleInvoices, limit = 5) {
        const productStats = this.getProductStats();
        return productStats.slice(0, limit);
    }

    calculateTotalItemsSold(sales, wholesaleInvoices) {
        let total = 0;
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                total += item.quantity;
            });
        });

        wholesaleInvoices.forEach(invoice => {
            invoice.items.forEach(item => {
                total += item.quantity;
            });
        });

        return total;
    }

    getDailyBreakdown(startDate, endDate, sales, wholesaleInvoices) {
        const breakdown = {};
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            breakdown[dateStr] = {
                date: dateStr,
                revenue: 0,
                transactions: 0,
                itemsSold: 0
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }

        [...sales, ...wholesaleInvoices].forEach(transaction => {
            const dateStr = transaction.date.split('T')[0];
            if (breakdown[dateStr]) {
                breakdown[dateStr].revenue += transaction.total;
                breakdown[dateStr].transactions += 1;
                breakdown[dateStr].itemsSold += this.calculateTotalItemsSold(
                    transaction.type === 'sale' ? [transaction] : [],
                    transaction.type === 'wholesale' ? [transaction] : []
                );
            }
        });

        return Object.values(breakdown);
    }

    clearCache() {
        this.cache = {};
    }
}

// ===============================
// نظام إدارة المخزون المتقدم
// ===============================
class InventoryManager {
    constructor() {
        this.lowStockThreshold = 5;
    }

    getLowStockProducts() {
        const products = db.getProducts();
        return products.filter(product => product.stock <= this.lowStockThreshold);
    }

    getOutOfStockProducts() {
        const products = db.getProducts();
        return products.filter(product => product.stock === 0);
    }

    getInventoryValue() {
        const products = db.getProducts();
        return products.reduce((total, product) => {
            return total + (product.stock * product.price);
        }, 0);
    }

    getStockMovement(productId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const inventoryLog = db.getInventoryLog();
        return inventoryLog.filter(log => 
            log.productId === productId && 
            new Date(log.date) >= startDate
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    adjustStock(productId, newStock, reason = 'تعديل يدوي') {
        const product = db.getProductById(productId);
        if (!product) {
            return { success: false, error: 'المنتج غير موجود' };
        }

        const stockChange = newStock - product.stock;
        const result = db.updateProduct(productId, { stock: newStock });

        if (result) {
            db.addInventoryLog({
                productId: productId,
                productName: product.name,
                change: stockChange,
                type: stockChange > 0 ? 'add' : 'subtract',
                reason: reason,
                date: new Date().toISOString(),
                previousStock: product.stock,
                newStock: newStock
            });

            return { success: true, stockChange, previousStock: product.stock, newStock };
        }

        return { success: false, error: 'فشل في تحديث المخزون' };
    }

    bulkStockUpdate(updates) {
        const results = [];
        updates.forEach(update => {
            const result = this.adjustStock(update.productId, update.newStock, update.reason);
            results.push({
                productId: update.productId,
                ...result
            });
        });
        return results;
    }

    getInventoryAlerts() {
        const lowStock = this.getLowStockProducts();
        const outOfStock = this.getOutOfStockProducts();
        
        return {
            lowStock: lowStock.map(p => ({ ...p, alert: 'منخفض' })),
            outOfStock: outOfStock.map(p => ({ ...p, alert: 'نفذ' })),
            totalAlerts: lowStock.length + outOfStock.length
        };
    }
}

// ===============================
// قاعدة البيانات الرئيسية
// ===============================
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        const defaultSettings = {
            taxRate: 14,
            lowStockThreshold: 5,
            backupAuto: true,
            printReceipt: false,
            language: 'ar',
            currency: 'ج.م',
            companyName: 'متجرنا',
            companyAddress: '',
            companyPhone: ''
        };

        if (!localStorage.getItem('users')) {
            const users = [
                { 
                    id: 1, 
                    username: "admin", 
                    password: "admin123", 
                    role: "admin", 
                    name: "مدير النظام",
                    email: "admin@store.com",
                    phone: "+201234567890",
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                { 
                    id: 2, 
                    username: "cashier", 
                    password: "cashier123", 
                    role: "cashier", 
                    name: "كاشير",
                    email: "cashier@store.com",
                    phone: "+201234567891",
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }

        if (!localStorage.getItem('products')) {
            const products = this.generateProducts();
            localStorage.setItem('products', JSON.stringify(products));
        }

        if (!localStorage.getItem('systemSettings')) {
            localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
        }

        // تهيئة التخزين الآخر إذا لم يكن موجوداً
        const storageKeys = ['sales', 'barcodeMemory', 'inventoryLog', 'wholesaleInvoices', 'recentTransactions'];
        storageKeys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }

    generateProducts() {
        const products = [];
        const categories = [
            "مأكولات", "مشروبات", "منتجات الألبان", "الفواكه", "الخضروات", 
            "اللحوم", "المخبوزات", "الحلويات", "الأدوات المنزلية", "العناية الشخصية"
        ];

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

        const productImages = [
            "https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/7195524/pexels-photo-7195524.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/7195470/pexels-photo-7195470.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=300",
            "https://images.pexels.com/photos/4117746/pexels-photo-4117746.jpeg?auto=compress&cs=tinysrgb&w=300"
        ];

        for (let i = 1; i <= 1000; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const categoryProducts = productNames[category];
            const productName = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
            const randomImage = productImages[Math.floor(Math.random() * productImages.length)];
            
            const price = Math.floor(Math.random() * 100) + 1;
            const wholesalePrice = Math.floor(price * 0.7); // 70% من سعر التجزئة

            products.push({
                id: i,
                name: productName,
                price: price,
                wholesalePrice: wholesalePrice,
                barcode: this.generateBarcode(),
                category: category,
                image: randomImage,
                stock: Math.floor(Math.random() * 100) + 10,
                minStock: 5,
                createdAt: new Date().toISOString(),
                isActive: true,
                supplier: `مورد ${Math.floor(Math.random() * 10) + 1}`,
                weight: `${Math.floor(Math.random() * 1000) + 100} جرام`
            });
        }
        return products;
    }

    generateBarcode() {
        return 'EG' + Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    }

    // ==================== دوال الجلب ====================
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem('users')) || [];
        } catch {
            return [];
        }
    }

    getProducts() {
        try {
            return JSON.parse(localStorage.getItem('products')) || [];
        } catch {
            return [];
        }
    }

    getSales() {
        try {
            return JSON.parse(localStorage.getItem('sales')) || [];
        } catch {
            return [];
        }
    }

    getWholesaleInvoices() {
        try {
            return JSON.parse(localStorage.getItem('wholesaleInvoices')) || [];
        } catch {
            return [];
        }
    }

    getRecentTransactions() {
        try {
            return JSON.parse(localStorage.getItem('recentTransactions')) || [];
        } catch {
            return [];
        }
    }

    getBarcodeMemory() {
        try {
            return JSON.parse(localStorage.getItem('barcodeMemory')) || [];
        } catch {
            return [];
        }
    }

    getInventoryLog() {
        try {
            return JSON.parse(localStorage.getItem('inventoryLog')) || [];
        } catch {
            return [];
        }
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('systemSettings')) || {};
        } catch {
            return {};
        }
    }

    getProductByBarcode(barcode) {
        const products = this.getProducts();
        return products.find(product => product.barcode === barcode);
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === parseInt(id));
    }

    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(user => user.username === username);
    }

    // ==================== دوال التحديث ====================
    updateSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const newSettings = { ...currentSettings, ...settings };
            localStorage.setItem('systemSettings', JSON.stringify(newSettings));
            return true;
        } catch {
            return false;
        }
    }

    addProduct(product) {
        try {
            const products = this.getProducts();
            product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            product.createdAt = new Date().toISOString();
            product.isActive = true;
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
            
            return { success: true, productId: product.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateProduct(productId, updatedData) {
        try {
            const products = this.getProducts();
            const productIndex = products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                return { success: false, error: 'المنتج غير موجود' };
            }

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
                    date: new Date().toISOString(),
                    previousStock: oldStock,
                    newStock: updatedData.stock
                });
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteProduct(productId) {
        try {
            const products = this.getProducts();
            const product = products.find(p => p.id === productId);
            if (!product) {
                return { success: false, error: 'المنتج غير موجود' };
            }

            const filteredProducts = products.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(filteredProducts));
            
            this.addInventoryLog({
                productId: productId,
                productName: product.name,
                change: -product.stock,
                type: 'subtract',
                reason: 'حذف المنتج',
                date: new Date().toISOString()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateProductStock(productId, quantity) {
        try {
            const products = this.getProducts();
            const productIndex = products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                return { success: false, error: 'المنتج غير موجود' };
            }

            const oldStock = products[productIndex].stock;
            products[productIndex].stock -= quantity;
            localStorage.setItem('products', JSON.stringify(products));
            
            this.addInventoryLog({
                productId: productId,
                productName: products[productIndex].name,
                change: -quantity,
                type: 'subtract',
                reason: 'بيع منتج',
                date: new Date().toISOString(),
                previousStock: oldStock,
                newStock: products[productIndex].stock
            });
            
            return { success: true, newStock: products[productIndex].stock };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addSale(saleData) {
        try {
            const sales = this.getSales();
            saleData.id = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
            saleData.date = new Date().toISOString();
            saleData.type = 'sale';
            sales.push(saleData);
            localStorage.setItem('sales', JSON.stringify(sales));

            this.addRecentTransaction({
                type: 'بيع',
                amount: saleData.total,
                details: `${saleData.items.length} منتج`,
                cashier: saleData.cashier,
                time: new Date().toISOString(),
                invoiceId: saleData.id
            });
            
            return { success: true, saleId: saleData.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addWholesaleInvoice(invoiceData) {
        try {
            const invoices = this.getWholesaleInvoices();
            invoiceData.id = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
            invoiceData.date = new Date().toISOString();
            invoiceData.type = 'wholesale';
            invoices.push(invoiceData);
            localStorage.setItem('wholesaleInvoices', JSON.stringify(invoices));

            this.addRecentTransaction({
                type: 'جملة',
                amount: invoiceData.total,
                details: `عميل: ${invoiceData.customer}`,
                cashier: invoiceData.cashier,
                time: new Date().toISOString(),
                invoiceId: invoiceData.id
            });
            
            return { success: true, invoiceId: invoiceData.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addRecentTransaction(transaction) {
        try {
            const transactions = this.getRecentTransactions();
            transactions.unshift(transaction);
            if (transactions.length > 50) {
                transactions.splice(50);
            }
            localStorage.setItem('recentTransactions', JSON.stringify(transactions));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addBarcodeToMemory(barcodeData) {
        try {
            const barcodeMemory = this.getBarcodeMemory();
            barcodeData.id = barcodeMemory.length > 0 ? Math.max(...barcodeMemory.map(b => b.id)) + 1 : 1;
            barcodeData.storedAt = new Date().toISOString();
            barcodeMemory.push(barcodeData);
            localStorage.setItem('barcodeMemory', JSON.stringify(barcodeMemory));
            return { success: true, barcodeId: barcodeData.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    removeBarcodeFromMemory(barcodeId) {
        try {
            const barcodeMemory = this.getBarcodeMemory();
            const filteredMemory = barcodeMemory.filter(b => b.id !== barcodeId);
            localStorage.setItem('barcodeMemory', JSON.stringify(filteredMemory));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addInventoryLog(logData) {
        try {
            const inventoryLog = this.getInventoryLog();
            logData.id = inventoryLog.length > 0 ? Math.max(...inventoryLog.map(l => l.id)) + 1 : 1;
            inventoryLog.push(logData);
            localStorage.setItem('inventoryLog', JSON.stringify(inventoryLog));
            return { success: true, logId: logData.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addUser(userData) {
        try {
            const users = this.getUsers();
            userData.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            userData.createdAt = new Date().toISOString();
            userData.isActive = true;
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
            return { success: true, userId: userData.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateUser(userId, updatedData) {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return { success: false, error: 'المستخدم غير موجود' };
            }

            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== دوال خاصة بالتطبيق ====================
    validateLogin(username, password) {
        const user = this.getUserByUsername(username);
        if (!user) {
            return { success: false, error: 'اسم المستخدم غير صحيح' };
        }

        if (user.password !== password) {
            return { success: false, error: 'كلمة المرور غير صحيحة' };
        }

        if (!user.isActive) {
            return { success: false, error: 'الحساب معطل' };
        }

        return { success: true, user: user };
    }

    getDashboardStats() {
        const sales = this.getSales();
        const wholesaleInvoices = this.getWholesaleInvoices();
        const products = this.getProducts();
        const inventoryManager = new InventoryManager();
        const alerts = inventoryManager.getInventoryAlerts();

        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(sale => sale.date.split('T')[0] === today);
        const todayWholesale = wholesaleInvoices.filter(invoice => invoice.date.split('T')[0] === today);

        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0) +
                           todayWholesale.reduce((sum, invoice) => sum + invoice.total, 0);

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0) +
                           wholesaleInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

        return {
            todayRevenue,
            todayTransactions: todaySales.length + todayWholesale.length,
            totalRevenue,
            totalProducts: products.length,
            lowStockAlerts: alerts.lowStock.length,
            outOfStockAlerts: alerts.outOfStock.length,
            totalAlerts: alerts.totalAlerts,
            inventoryValue: inventoryManager.getInventoryValue()
        };
    }

    // ==================== دوال التنظيف ====================
    cleanupOldData(days = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            // تنظيف المعاملات القديمة
            const recentTransactions = this.getRecentTransactions().filter(transaction => 
                new Date(transaction.time) > cutoffDate
            );
            localStorage.setItem('recentTransactions', JSON.stringify(recentTransactions));

            // تنظيف سجل المخزون القديم
            const inventoryLog = this.getInventoryLog().filter(log =>
                new Date(log.date) > cutoffDate
            );
            localStorage.setItem('inventoryLog', JSON.stringify(inventoryLog));

            return { success: true, cleaned: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    exportDatabase() {
        return {
            users: this.getUsers(),
            products: this.getProducts(),
            sales: this.getSales(),
            wholesaleInvoices: this.getWholesaleInvoices(),
            barcodeMemory: this.getBarcodeMemory(),
            inventoryLog: this.getInventoryLog(),
            recentTransactions: this.getRecentTransactions(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }
}

// ===============================
// التهيئة الرئيسية للنظام
// ===============================
// إنشاء نسخ عالمية من المديرين
const db = new Database();
const sessionManager = new SessionManager();
const notificationManager = new NotificationManager();
const searchManager = new SearchManager();
const backupManager = new BackupManager();
const analyticsManager = new AnalyticsManager();
const inventoryManager = new InventoryManager();

// المتغيرات العالمية
let currentUser = null;
let cart = [];
let wholesaleCart = [];
let currentPage = 'cashierPage';

// تهيئة النظام
function initializeSystem() {
    try {
        // التحقق من الجلسة
        const savedUser = sessionManager.getSession();
        if (savedUser) {
            currentUser = savedUser;
            cart = sessionManager.getCart();
            wholesaleCart = sessionManager.getWholesaleCart();
            currentPage = sessionManager.getCurrentPage();
            showDashboard();
        } else {
            showLogin();
        }

        // إعداد النسخ الاحتياطي التلقائي
        if (db.getSettings().backupAuto) {
            setInterval(() => {
                if (currentUser) {
                    const result = backupManager.createBackup('نسخة تلقائية');
                    if (result.success) {
                        console.log('تم إنشاء نسخة احتياطية تلقائية');
                    }
                }
            }, 60 * 60 * 1000); // كل ساعة
        }

        // تنظيف البيانات القديمة أسبوعياً
        setInterval(() => {
            db.cleanupOldData(90);
        }, 7 * 24 * 60 * 60 * 1000); // أسبوعياً

        console.log('تم تهيئة النظام بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة النظام:', error);
        notificationManager.show('خطأ في تهيئة النظام', 'error');
    }
}

// دالة العرض الرئيسية
function showDashboard() {
    // هنا سيتم استدعاء دوال واجهة المستخدم
    console.log('عرض لوحة التحكم للمستخدم:', currentUser.username);
    
    // تحديث الجلسة
    sessionManager.refreshSession();
    sessionManager.saveCart(cart);
    sessionManager.saveWholesaleCart(wholesaleCart);
    sessionManager.saveCurrentPage(currentPage);
}

function showLogin() {
    // هنا سيتم عرض واجهة تسجيل الدخول
    console.log('عرض واجهة تسجيل الدخول');
}

// جعل الدوال متاحة globally للاختبار
window.db = db;
window.sessionManager = sessionManager;
window.notificationManager = notificationManager;
window.searchManager = searchManager;
window.backupManager = backupManager;
window.analyticsManager = analyticsManager;
window.inventoryManager = inventoryManager;
window.initializeSystem = initializeSystem;

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeSystem);