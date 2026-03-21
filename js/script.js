// ==================== نظام المصروفات وإدارة التكاليف ====================
class ExpensesManager {
    constructor() {
        this.initExpensesStorage();
    }

    initExpensesStorage() {
        if (!localStorage.getItem('expenses')) {
            localStorage.setItem('expenses', JSON.stringify([]));
        }
        if (!localStorage.getItem('productCosts')) {
            localStorage.setItem('productCosts', JSON.stringify({}));
        }
    }

    addExpense(expenseData) {
        const expenses = this.getExpenses();
        expenseData.id = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
        expenseData.date = new Date().toISOString();
        expenseData.createdBy = typeof currentUser !== 'undefined' && currentUser ? currentUser.username : 'system';
        expenses.push(expenseData);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        return expenseData.id;
    }

    getExpenses() {
        return JSON.parse(localStorage.getItem('expenses')) || [];
    }

    updateProductCost(productId, costPrice) {
        const productCosts = JSON.parse(localStorage.getItem('productCosts')) || {};
        productCosts[productId] = {
            cost: costPrice,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('productCosts', JSON.stringify(productCosts));
    }

    getProductCost(productId) {
        const productCosts = JSON.parse(localStorage.getItem('productCosts')) || {};
        return productCosts[productId] ? productCosts[productId].cost : null;
    }

    calculateNetProfit(startDate, endDate) {
        const sales = this.getSalesInRange(startDate, endDate);
        const expenses = this.getExpensesInRange(startDate, endDate);
        
        let totalRevenue = 0;
        let totalCost = 0;
        
        sales.forEach(sale => {
            totalRevenue += sale.total;
            sale.items.forEach(item => {
                const productCost = this.getProductCost(item.id);
                if (productCost) {
                    totalCost += productCost * item.quantity;
                } else {
                    totalCost += (item.price * 0.7) * item.quantity;
                }
            });
        });
        
        const grossProfit = totalRevenue - totalCost;
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = grossProfit - totalExpenses;
        
        return {
            totalRevenue,
            totalCost,
            grossProfit,
            totalExpenses,
            netProfit,
            profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        };
    }

    getSalesInRange(startDate, endDate) {
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });
    }

    getExpensesInRange(startDate, endDate) {
        const expenses = this.getExpenses();
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= start && expenseDate <= end;
        });
    }

    generateDetailedProfitReport(startDate, endDate) {
        const sales = this.getSalesInRange(startDate, endDate);
        const expenses = this.getExpensesInRange(startDate, endDate);
        const profitCalculation = this.calculateNetProfit(startDate, endDate);
        
        const salesByCategory = {};
        const salesByProduct = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const product = this.getProductById(item.id);
                if (product) {
                    const category = product.category;
                    if (!salesByCategory[category]) {
                        salesByCategory[category] = { quantity: 0, revenue: 0 };
                    }
                    salesByCategory[category].quantity += item.quantity;
                    salesByCategory[category].revenue += item.price * item.quantity;
                    
                    if (!salesByProduct[item.name]) {
                        salesByProduct[item.name] = { quantity: 0, revenue: 0, cost: 0 };
                    }
                    salesByProduct[item.name].quantity += item.quantity;
                    salesByProduct[item.name].revenue += item.price * item.quantity;
                    
                    const productCost = this.getProductCost(item.id);
                    if (productCost) {
                        salesByProduct[item.name].cost += productCost * item.quantity;
                    }
                }
            });
        });
        
        const expensesByCategory = {};
        expenses.forEach(expense => {
            const category = expense.category || 'أخرى';
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = 0;
            }
            expensesByCategory[category] += expense.amount;
        });
        
        return {
            period: { startDate, endDate },
            summary: {
                totalSales: sales.length,
                totalRevenue: profitCalculation.totalRevenue,
                totalCost: profitCalculation.totalCost,
                grossProfit: profitCalculation.grossProfit,
                totalExpenses: profitCalculation.totalExpenses,
                netProfit: profitCalculation.netProfit,
                profitMargin: profitCalculation.profitMargin
            },
            salesByCategory,
            salesByProduct,
            expensesByCategory,
            dailyBreakdown: this.getDailyBreakdown(startDate, endDate)
        };
    }

    getDailyBreakdown(startDate, endDate) {
        const sales = this.getSalesInRange(startDate, endDate);
        const expenses = this.getExpensesInRange(startDate, endDate);
        const dailyData = {};
        
        sales.forEach(sale => {
            const day = new Date(sale.date).toDateString();
            if (!dailyData[day]) {
                dailyData[day] = { revenue: 0, cost: 0, expenses: 0, profit: 0, salesCount: 0 };
            }
            dailyData[day].revenue += sale.total;
            dailyData[day].salesCount++;
            
            sale.items.forEach(item => {
                const productCost = this.getProductCost(item.id);
                if (productCost) {
                    dailyData[day].cost += productCost * item.quantity;
                } else {
                    dailyData[day].cost += (item.price * 0.7) * item.quantity;
                }
            });
        });
        
        expenses.forEach(expense => {
            const day = new Date(expense.date).toDateString();
            if (dailyData[day]) {
                dailyData[day].expenses += expense.amount;
            } else {
                dailyData[day] = { revenue: 0, cost: 0, expenses: expense.amount, profit: 0, salesCount: 0 };
            }
        });
        
        Object.keys(dailyData).forEach(day => {
            dailyData[day].profit = dailyData[day].revenue - dailyData[day].cost - dailyData[day].expenses;
        });
        
        return dailyData;
    }

    getProductById(id) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return products.find(p => p.id === id);
    }

    exportReportToExcel(report) {
        const workbook = XLSX.utils.book_new();
        
        const summaryData = [
            ['تقرير الأرباح المفصل'],
            ['الفترة:', `${new Date(report.period.startDate).toLocaleDateString('ar-EG')} - ${new Date(report.period.endDate).toLocaleDateString('ar-EG')}`],
            [''],
            ['الملخص'],
            ['إجمالي المبيعات', report.summary.totalSales],
            ['إجمالي الإيرادات', `${report.summary.totalRevenue.toFixed(2)} ج.م`],
            ['إجمالي التكلفة', `${report.summary.totalCost.toFixed(2)} ج.م`],
            ['إجمالي الربح الإجمالي', `${report.summary.grossProfit.toFixed(2)} ج.م`],
            ['إجمالي المصروفات', `${report.summary.totalExpenses.toFixed(2)} ج.م`],
            ['صافي الربح', `${report.summary.netProfit.toFixed(2)} ج.م`],
            ['هامش الربح', `${report.summary.profitMargin.toFixed(2)}%`]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');
        
        const categoryData = [['الفئة', 'الكمية', 'الإيرادات']];
        Object.entries(report.salesByCategory).forEach(([category, data]) => {
            categoryData.push([category, data.quantity, `${data.revenue.toFixed(2)} ج.م`]);
        });
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'المبيعات_حسب_الفئة');
        
        const dailyData = [['التاريخ', 'عدد المبيعات', 'الإيرادات', 'التكلفة', 'المصروفات', 'الربح']];
        Object.entries(report.dailyBreakdown).forEach(([day, data]) => {
            dailyData.push([
                day,
                data.salesCount,
                `${data.revenue.toFixed(2)} ج.م`,
                `${data.cost.toFixed(2)} ج.م`,
                `${data.expenses.toFixed(2)} ج.م`,
                `${data.profit.toFixed(2)} ج.م`
            ]);
        });
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'التفاصيل_اليومية');
        
        const fileName = `profit_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }
}

// ==================== نظام النسخ الاحتياطي ====================
class BackupManager {
    constructor() {
        this.db = null;
    }

    exportAllDataToExcel() {
        const data = {
            products: JSON.parse(localStorage.getItem('products')) || [],
            sales: JSON.parse(localStorage.getItem('sales')) || [],
            wholesaleInvoices: JSON.parse(localStorage.getItem('wholesaleInvoices')) || [],
            inventoryLog: JSON.parse(localStorage.getItem('inventoryLog')) || [],
            barcodeMemory: JSON.parse(localStorage.getItem('barcodeMemory')) || [],
            expenses: JSON.parse(localStorage.getItem('expenses')) || [],
            productCosts: JSON.parse(localStorage.getItem('productCosts')) || {},
            backupDate: new Date().toISOString()
        };

        const workbook = XLSX.utils.book_new();

        this.addSheetToWorkbook(workbook, data.products, 'المنتجات');
        this.addSheetToWorkbook(workbook, data.sales, 'المبيعات');
        this.addSheetToWorkbook(workbook, data.wholesaleInvoices, 'فواتير_الجملة');
        this.addSheetToWorkbook(workbook, data.inventoryLog, 'سجل_المخزون');
        this.addSheetToWorkbook(workbook, data.barcodeMemory, 'ذاكرة_الباركود');
        this.addSheetToWorkbook(workbook, data.expenses, 'المصروفات');
        
        const productCostsData = Object.entries(data.productCosts).map(([id, costData]) => [id, costData.cost, costData.updatedAt]);
        if (productCostsData.length > 0) {
            const costSheet = XLSX.utils.aoa_to_sheet([['المنتج ID', 'سعر التكلفة', 'تاريخ التحديث'], ...productCostsData]);
            XLSX.utils.book_append_sheet(workbook, costSheet, 'تكاليف_المنتجات');
        }

        const backupInfo = [[`تاريخ النسخ الاحتياطي: ${new Date().toLocaleString('ar-EG')}`]];
        const infoSheet = XLSX.utils.aoa_to_sheet(backupInfo);
        XLSX.utils.book_append_sheet(workbook, infoSheet, 'معلومات_النسخة');

        const fileName = `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        return true;
    }

    addSheetToWorkbook(workbook, data, sheetName) {
        if (data && data.length > 0) {
            const headers = Object.keys(data[0]);
            const rows = data.map(item => headers.map(header => {
                let value = item[header];
                if (value && typeof value === 'string' && value.includes('T')) {
                    value = new Date(value).toLocaleString('ar-EG');
                }
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                return value;
            }));
            
            const worksheetData = [headers, ...rows];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        } else {
            const emptySheet = XLSX.utils.aoa_to_sheet([['لا توجد بيانات']]);
            XLSX.utils.book_append_sheet(workbook, emptySheet, sheetName);
        }
    }

    importDataFromExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const importedData = {};
                    
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        if (jsonData.length > 0 && sheetName !== 'معلومات_النسخة') {
                            importedData[sheetName] = jsonData;
                        }
                    });
                    
                    resolve(importedData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    async restoreFromBackup(file) {
        const importedData = await this.importDataFromExcel(file);
        
        if (importedData.المنتجات) {
            localStorage.setItem('products', JSON.stringify(importedData.المنتجات));
        }
        if (importedData.المبيعات) {
            localStorage.setItem('sales', JSON.stringify(importedData.المبيعات));
        }
        if (importedData.فواتير_الجملة) {
            localStorage.setItem('wholesaleInvoices', JSON.stringify(importedData.فواتير_الجملة));
        }
        if (importedData.سجل_المخزون) {
            localStorage.setItem('inventoryLog', JSON.stringify(importedData.سجل_المخزون));
        }
        if (importedData.ذاكرة_الباركود) {
            localStorage.setItem('barcodeMemory', JSON.stringify(importedData.ذاكرة_الباركود));
        }
        if (importedData.المصروفات) {
            localStorage.setItem('expenses', JSON.stringify(importedData.المصروفات));
        }
        
        return importedData;
    }

    setupAutoBackup() {
        setInterval(() => {
            const lastBackup = localStorage.getItem('lastBackup');
            const today = new Date().toDateString();
            
            if (lastBackup !== today) {
                this.exportAllDataToExcel();
                localStorage.setItem('lastBackup', today);
                this.showBackupNotification();
            }
        }, 3600000);
    }

    showBackupNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = '<i class="bi bi-cloud-check"></i> تم إنشاء نسخة احتياطية تلقائية للبيانات';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }
}

// ==================== نظام إدارة الجلسات ====================
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
        
        if (!sessionData) {
            sessionData = sessionStorage.getItem(this.currentSessionKey);
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

// ==================== نظام الفواتير الاحترافي ====================
class InvoiceSystem {
    constructor() {
        this.storeName = "سوبر ماركت فتحة خير";
        this.storeAddress = "مصر - القاهرة";
        this.storePhone = "01234567890";
        this.storeTaxNumber = "123-456-789";
    }

    generateInvoiceHTML(invoiceData, type = 'sale') {
        const invoiceNumber = invoiceData.id;
        const date = new Date(invoiceData.date).toLocaleString('ar-EG');
        const cashier = invoiceData.cashier || 'نظام';
        
        let itemsHTML = '';
        let totalAmount = 0;
        
        invoiceData.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;
            itemsHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        let extraRows = '';
        let subtotal = invoiceData.subtotal || totalAmount;
        let tax = invoiceData.tax || (subtotal * 0.14);
        let discount = invoiceData.discountAmount || 0;
        let finalTotal = invoiceData.total || (subtotal + tax - discount);
        
        if (type === 'wholesale') {
            extraRows = `
                <tr class="total-row">
                    <td colspan="4"><strong>الخصم (${invoiceData.discount}%)</strong></td>
                    <td><strong>- ${discount.toFixed(2)} ج.م</strong></td>
                </tr>
            `;
        }
        
return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة #${invoiceNumber}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Tahoma', 'Arial', 'Segoe UI', sans-serif;
                padding: 20px;
                min-height: 100vh;
            }
            
            .invoice-container {
                max-width: 850px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: hidden;
                animation: slideIn 0.5s ease;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .invoice-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 35px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .invoice-header::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 1%, transparent 1%);
                background-size: 50px 50px;
                animation: shimmer 20s linear infinite;
            }
            
            @keyframes shimmer {
                from {
                    transform: translate(0, 0);
                }
                to {
                    transform: translate(50px, 50px);
                }
            }
            
            .store-name {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            }
            
            .store-info {
                font-size: 14px;
                opacity: 0.95;
                line-height: 1.6;
                position: relative;
                z-index: 1;
            }
            
            .invoice-title {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px;
                text-align: center;
                border-bottom: 3px solid #667eea;
            }
            
            .invoice-title h2 {
                color: #495057;
                font-size: 26px;
                font-weight: bold;
                margin: 0;
            }
            
            .invoice-details {
                padding: 25px;
                background: white;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            
            .detail-group {
                text-align: center;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 12px;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            
            .detail-group:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .detail-label {
                font-size: 12px;
                color: #6c757d;
                margin-bottom: 8px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .detail-value {
                font-size: 18px;
                font-weight: bold;
                color: #495057;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            
            .items-table th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 12px;
                text-align: center;
                font-weight: bold;
                font-size: 14px;
            }
            
            .items-table td {
                padding: 12px;
                text-align: center;
                border-bottom: 1px solid #e9ecef;
                color: #495057;
                font-size: 14px;
            }
            
            .items-table tr:hover {
                background: #f8f9fa;
                transition: background 0.3s;
            }
            
            .items-table tr:last-child td {
                border-bottom: none;
            }
            
            .totals {
                padding: 25px;
                background: #f8f9fa;
                border-top: 3px solid #667eea;
                margin-top: 20px;
            }
            
            .totals-table {
                width: 100%;
                max-width: 400px;
                margin-right: 0;
                margin-left: auto;
                border-collapse: collapse;
            }
            
            .totals-table td {
                padding: 12px 15px;
                text-align: right;
                border-bottom: 1px solid #dee2e6;
            }
            
            .totals-table tr:last-child td {
                border-bottom: none;
            }
            
            .discount-row td {
                background: #fff3cd;
                color: #856404;
                font-weight: bold;
            }
            
            .total-row td {
                background: #d4edda;
                font-size: 18px;
                font-weight: bold;
                color: #155724;
                border-top: 2px solid #28a745;
            }
            
            .total-row td:first-child {
                font-size: 18px;
            }
            
            .total-row td:last-child {
                font-size: 20px;
                color: #28a745;
            }
            
            .invoice-footer {
                padding: 25px;
                text-align: center;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                color: #6c757d;
                font-size: 13px;
            }
            
            .invoice-footer p {
                margin: 5px 0;
            }
            
            .invoice-footer p:first-child {
                font-size: 16px;
                font-weight: bold;
                color: #667eea;
            }
            
            .action-buttons {
                padding: 25px;
                display: flex;
                gap: 15px;
                justify-content: center;
                background: white;
                border-top: 1px solid #e9ecef;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .btn i {
                font-size: 16px;
            }
            
            .btn-print {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
            }
            
            .btn-print:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(40,167,69,0.3);
            }
            
            .btn-whatsapp {
                background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                color: white;
            }
            
            .btn-whatsapp:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(37,211,102,0.3);
            }
            
            .btn-close {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
            }
            
            .btn-close:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(108,117,125,0.3);
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                    margin: 0;
                }
                .action-buttons {
                    display: none;
                }
                .invoice-container {
                    box-shadow: none;
                    border-radius: 0;
                    max-width: 100%;
                }
                .btn {
                    display: none;
                }
                .items-table th {
                    background: #e9ecef;
                    color: #495057;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .invoice-header {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
            
            @media (max-width: 768px) {
                body {
                    padding: 10px;
                }
                .invoice-details {
                    grid-template-columns: 1fr;
                    gap: 10px;
                    padding: 15px;
                }
                .items-table {
                    font-size: 11px;
                }
                .items-table th,
                .items-table td {
                    padding: 8px 4px;
                }
                .btn {
                    padding: 8px 16px;
                    font-size: 12px;
                }
                .totals-table {
                    max-width: 100%;
                }
                .detail-value {
                    font-size: 14px;
                }
                .store-name {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="invoice-header">
                <div class="store-name">${this.storeName}</div>
                <div class="store-info">
                    <i class="bi bi-geo-alt-fill"></i> ${this.storeAddress}<br>
                    <i class="bi bi-telephone-fill"></i> ${this.storePhone} | 
                    <i class="bi bi-building"></i> الرقم الضريبي: ${this.storeTaxNumber}
                </div>
            </div>
            
            <div class="invoice-title">
                <h2><i class="bi bi-receipt"></i> ${type === 'wholesale' ? 'فاتورة بيع بالجملة' : 'فاتورة بيع بالتجزئة'}</h2>
            </div>
            
            <div class="invoice-details">
                <div class="detail-group">
                    <div class="detail-label"><i class="bi bi-hash"></i> رقم الفاتورة</div>
                    <div class="detail-value">#${invoiceNumber}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label"><i class="bi bi-calendar3"></i> التاريخ</div>
                    <div class="detail-value">${date}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label"><i class="bi bi-person-badge"></i> الكاشير</div>
                    <div class="detail-value">${cashier}</div>
                </div>
                ${type === 'wholesale' ? `
                <div class="detail-group">
                    <div class="detail-label"><i class="bi bi-person"></i> اسم العميل</div>
                    <div class="detail-value">${invoiceData.customer || 'عميل جملة'}</div>
                </div>
                ` : ''}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 10%">#</th>
                        <th style="width: 40%">المنتج</th>
                        <th style="width: 15%">الكمية</th>
                        <th style="width: 15%">السعر</th>
                        <th style="width: 20%">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="totals">
                <table class="totals-table">
                    <tr>
                        <td><strong>المجموع الفرعي</strong></td>
                        <td>${subtotal.toFixed(2)} ج.م</td>
                    </tr>
                    ${extraRows}
                    <tr>
                        <td><strong>الضريبة (14%)</strong></td>
                        <td>${tax.toFixed(2)} ج.م</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>الإجمالي النهائي</strong></td>
                        <td><strong>${finalTotal.toFixed(2)} ج.م</strong></td>
                    </tr>
                </table>
            </div>
            
            <div class="invoice-footer">
                <p><i class="bi bi-heart-fill"></i> شكراً لتسوقكم في ${this.storeName} <i class="bi bi-heart-fill"></i></p>
                <p>نتمنى لكم يوماً سعيداً - معنا دائماً الجودة والثقة</p>
                <p><i class="bi bi-clock"></i> ${new Date().toLocaleString('ar-EG')}</p>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-print" onclick="window.print()">
                    <i class="bi bi-printer"></i> طباعة الفاتورة
                </button>
                <button class="btn btn-whatsapp" onclick="sendInvoiceToWhatsApp()">
                    <i class="bi bi-whatsapp"></i> إرسال إلى واتساب
                </button>
                <button class="btn btn-close" onclick="window.close()">
                    <i class="bi bi-x-lg"></i> إغلاق
                </button>
            </div>
        </div>
        
        <script>
            function sendInvoiceToWhatsApp() {
                const phone = prompt('📱 أدخل رقم الهاتف مع رمز الدولة (مثال: 201234567890):', '20');
                if (phone && phone.trim()) {
                    const invoiceContent = document.querySelector('.invoice-container').cloneNode(true);
                    const actionButtons = invoiceContent.querySelector('.action-buttons');
                    if (actionButtons) actionButtons.remove();
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.appendChild(invoiceContent);
                    
                    let messageText = tempDiv.innerText;
                    messageText = '📄 *فاتورة ' + (${type === 'wholesale' ? "'جملة'" : "'تجزئة'"}) + '*\\n\\n' + messageText;
                    messageText = encodeURIComponent(messageText);
                    
                    window.open('https://wa.me/' + phone.replace(/^0+/, '') + '?text=' + messageText, '_blank');
                } else if (phone === '') {
                    alert('❌ الرجاء إدخال رقم الهاتف');
                }
            }
        </script>
    </body>
    </html>
`;      
    }

    showInvoice(invoiceId, type = 'sale') {
        let invoiceData;
        
        if (type === 'sale') {
            const sales = db.getSales();
            invoiceData = sales.find(s => s.id === invoiceId);
        } else if (type === 'wholesale') {
            const invoices = db.getWholesaleInvoices();
            invoiceData = invoices.find(i => i.id === invoiceId);
        }
        
        if (!invoiceData) {
            showNotification('الفاتورة غير موجودة', 'error');
            return;
        }
        
        const invoiceHTML = this.generateInvoiceHTML(invoiceData, type);
        const invoiceWindow = window.open('', '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
    }
}

// ==================== قاعدة البيانات المحلية ====================
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
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
            
            products.push({
                id: i,
                name: productName,
                price: Math.floor(Math.random() * 100) + 5,
                barcode: this.generateBarcode(),
                category: category,
                image: '/assets/background.png',
                stock: Math.floor(Math.random() * 100) + 10,
                minStock: 5,
                wholesalePrice: Math.floor(Math.random() * 80) + 3
            });
        }
        return products;
    }

    generateBarcode() {
        return 'EG' + Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

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

    updateProductStock(productId, quantity) {
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            products[productIndex].stock -= quantity;
            localStorage.setItem('products', JSON.stringify(products));
            
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
            details: saleData.items.length + ' منتج',
            cashier: saleData.cashier,
            time: new Date().toISOString()
        });
        
        return saleData.id;
    }

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
            details: 'عميل: ' + invoiceData.customer,
            cashier: invoiceData.cashier,
            time: new Date().toISOString()
        });
        
        return invoiceData.id;
    }

    getRecentTransactions() {
        return JSON.parse(localStorage.getItem('recentTransactions')) || [];
    }

    addRecentTransaction(transaction) {
        const transactions = this.getRecentTransactions();
        transactions.unshift(transaction);
        if (transactions.length > 100) {
            transactions.pop();
        }
        localStorage.setItem('recentTransactions', JSON.stringify(transactions));
        return transaction;
    }

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

// ==================== تهيئة المتغيرات العامة ====================
const db = new Database();
const users = db.getUsers();
const expensesManager = new ExpensesManager();

let cart = [];
let wholesaleCart = [];
let currentUser = null;

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

// ==================== الدوال الرئيسية ====================
function showNotification(message, type = 'info') {
    // إزالة أي نوتيفيكشن موجود مسبقاً لمنع التراكم
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = '<i class="bi bi-' + (type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle') + '"></i> ' + message;
    document.body.appendChild(notification);
    
    // فرض ارتفاع ثابت للنوتيفيكشن
    notification.style.minHeight = '50px';
    notification.style.maxHeight = '80px';
    notification.style.height = 'auto';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}



function loadProducts() {
    const products = db.getProducts();
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        const stockWarning = product.stock <= product.minStock ? '<div class="stock-low">منخفض (' + product.stock + ')</div>' : '';
        
        productCard.innerHTML = `
            <img src="${product.image}" onerror="this.src='/assets/background.png'" alt="${product.name}">
            <h4>${product.name}</h4>
            <div class="price">${product.price} جنيه</div>
            <div class="barcode">${product.barcode}</div>
            ${stockWarning}
        `;
        
        productCard.addEventListener('click', () => addToCart(product));
        productsGrid.appendChild(productCard);
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
        } else {
            alert('لا يوجد مخزون كافي! المخزون المتاح: ' + product.stock);
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
                alert('لا يوجد مخزون كافي! المخزون المتاح: ' + product.stock);
            }
        });
        
        removeBtn.addEventListener('click', () => {
            cart = cart.filter(cartItem => cartItem.id !== item.id);
            updateCart();
        });
        
        cartItems.appendChild(cartItem);
    });
    
    const tax = subtotal * 0.14;
    const total = subtotal + tax;
    
    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2) + ' جنيه';
    if (taxElement) taxElement.textContent = tax.toFixed(2) + ' جنيه';
    if (totalElement) totalElement.textContent = total.toFixed(2) + ' جنيه';
}

function searchByBarcode(barcode) {
    if (!barcode || barcode.trim() === '') return;
    
    const product = db.getProductByBarcode(barcode);
    if (product) {
        addToCart(product);
        if (barcodeInput) barcodeInput.value = '';
        showNotification('تم إضافة ' + product.name, 'success');
    } else {
        showNotification('المنتج غير موجود!', 'error');
        if (barcodeInput) barcodeInput.value = '';
    }
}

let lastProcessedBarcode = '';

if (barcodeInput) {
    barcodeInput.addEventListener('input', function() {
        const barcode = this.value.trim();
        if (barcode && barcode !== lastProcessedBarcode) {
            lastProcessedBarcode = barcode;
            searchByBarcode(barcode);
        }
    });
    
    barcodeInput.addEventListener('focus', function() {
        this.select();
        lastProcessedBarcode = '';
    });
}

// ==================== دوال الفواتير المحسنة ====================
function loadInvoicesPage() {
    const sales = db.getSales();
    if (!invoicesTableBody) return;
    
    invoicesTableBody.innerHTML = '';
    sales.slice().reverse().forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${new Date(sale.date).toLocaleDateString('ar-EG')}</td>
            <td>${new Date(sale.date).toLocaleTimeString('ar-EG')}</td>
            <td>${sale.cashier}</td>
            <td>${sale.items.length} منتج</td>
            <td>${sale.total.toFixed(2)} جنيه</td>
            <td>
                <button class="action-btn view-invoice-btn" data-id="${sale.id}" data-type="sale">
                    <i class="bi bi-eye"></i> عرض
                </button>
            </td>
        `;
        invoicesTableBody.appendChild(row);
    });
    
    document.querySelectorAll('.view-invoice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const type = this.dataset.type;
            const invoiceSystem = new InvoiceSystem();
            invoiceSystem.showInvoice(id, type);
        });
    });
    
    if (invoiceSearch) {
        invoiceSearch.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            const rows = invoicesTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }
}

function loadWholesalePage() {
    const invoices = db.getWholesaleInvoices();
    if (!wholesaleTableBody) return;
    
    wholesaleTableBody.innerHTML = '';
    invoices.slice().reverse().forEach(inv => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${inv.id}</td>
            <td>${inv.customer}</td>
            <td>${new Date(inv.date).toLocaleDateString('ar-EG')}</td>
            <td>${new Date(inv.date).toLocaleTimeString('ar-EG')}</td>
            <td>${inv.discount}%</td>
            <td>${inv.items.length} منتج</td>
            <td>${inv.total.toFixed(2)} جنيه</td>
            <td>
                <button class="action-btn view-invoice-btn" data-id="${inv.id}" data-type="wholesale">
                    <i class="bi bi-eye"></i> عرض
                </button>
            </td>
        `;
        wholesaleTableBody.appendChild(row);
    });
    
    document.querySelectorAll('.view-invoice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const type = this.dataset.type;
            const invoiceSystem = new InvoiceSystem();
            invoiceSystem.showInvoice(id, type);
        });
    });
}

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
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const product = db.getProductById(productId);
            const newName = prompt('تعديل اسم المنتج:', product.name);
            if (newName) {
                const newPrice = prompt('تعديل السعر:', product.price);
                if (newPrice) {
                    db.updateProduct(productId, { name: newName, price: parseFloat(newPrice) });
                    loadProductsTable();
                    loadProducts();
                }
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            if (confirm('هل أنت متأكد من الحذف؟')) {
                db.deleteProduct(productId);
                loadProductsTable();
                loadProducts();
            }
        });
    });
}

if (addProductBtn) {
    addProductBtn.addEventListener('click', function() {
        const name = productNameInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const barcode = productBarcodeInput.value.trim();
        const category = productCategoryInput.value;
        const stock = parseInt(productStockInput.value);
        
        if (!name || !price || !barcode || !stock) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        
        db.addProduct({
            name, price, barcode, category,
            image: '/assets/background.png',
            stock, minStock: 5,
            wholesalePrice: price * 0.8
        });
        
        loadProductsTable();
        loadProducts();
        
        productNameInput.value = '';
        productPriceInput.value = '';
        productBarcodeInput.value = '';
        productStockInput.value = '';
        
        showNotification('تم إضافة المنتج', 'success');
    });
}

function loadBarcodeMemoryPage() {
    const products = db.getProducts();
    if (memoryProductSelect) {
        memoryProductSelect.innerHTML = '';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name + ' - ' + product.barcode;
            memoryProductSelect.appendChild(option);
        });
    }
    
    const barcodeMemory = db.getBarcodeMemory();
    if (barcodeMemoryTable) {
        barcodeMemoryTable.innerHTML = '';
        barcodeMemory.forEach(item => {
            const product = db.getProductById(item.productId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.barcode}</td>
                <td>${product ? product.name : 'منتج غير معروف'}</td>
                <td>${new Date(item.storedAt).toLocaleDateString('ar-EG')}</td>
                <td><button class="action-btn delete-btn" data-id="${item.id}">حذف</button></td>
            `;
            barcodeMemoryTable.appendChild(row);
        });
        
        document.querySelectorAll('#barcodeMemoryTable .delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                if (confirm('هل أنت متأكد؟')) {
                    db.removeBarcodeFromMemory(id);
                    loadBarcodeMemoryPage();
                }
            });
        });
    }
}

if (saveBarcodeBtn) {
    saveBarcodeBtn.addEventListener('click', function() {
        const barcode = memoryBarcodeInput.value.trim();
        const productId = parseInt(memoryProductSelect.value);
        
        if (!barcode || !productId) {
            alert('يرجى إدخال الباركود واختيار المنتج');
            return;
        }
        
        db.addBarcodeToMemory({ barcode, productId });
        loadBarcodeMemoryPage();
        memoryBarcodeInput.value = '';
        showNotification('تم حفظ الباركود', 'success');
    });
}

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
        
        cartItem.querySelector('.decrease-btn').addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                updateWholesaleCart();
            }
        });
        
        cartItem.querySelector('.increase-btn').addEventListener('click', () => {
            const product = db.getProductById(item.id);
            if (item.quantity < product.stock) {
                item.quantity++;
                updateWholesaleCart();
            } else {
                alert('لا يوجد مخزون كافي');
            }
        });
        
        cartItem.querySelector('.remove-item').addEventListener('click', () => {
            wholesaleCart = wholesaleCart.filter(i => i.id !== item.id);
            updateWholesaleCart();
        });
        
        wholesaleCartItems.appendChild(cartItem);
    });
    
    const discountRate = parseFloat(wholesaleDiscount.value) / 100;
    const discountAmount = subtotal * discountRate;
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * 0.14;
    const total = afterDiscount + tax;
    
    if (wholesaleSubtotal) wholesaleSubtotal.textContent = subtotal.toFixed(2) + ' جنيه';
    if (wholesaleDiscountAmount) wholesaleDiscountAmount.textContent = discountAmount.toFixed(2) + ' جنيه';
    if (wholesaleTax) wholesaleTax.textContent = tax.toFixed(2) + ' جنيه';
    if (wholesaleTotal) wholesaleTotal.textContent = total.toFixed(2) + ' جنيه';
}

function addProductToWholesaleCart(barcode) {
    const product = db.getProductByBarcode(barcode);
    if (product) {
        const existing = wholesaleCart.find(i => i.id === product.id);
        if (existing) {
            if (existing.quantity < product.stock) existing.quantity++;
            else alert('لا يوجد مخزون كافي');
        } else {
            if (product.stock > 0) {
                wholesaleCart.push({
                    id: product.id, name: product.name,
                    price: product.wholesalePrice || product.price * 0.8,
                    image: product.image, quantity: 1
                });
            } else alert('المنتج غير متوفر');
        }
        updateWholesaleCart();
    } else {
        alert('المنتج غير موجود');
    }
}

if (addWholesaleProductBtn) {
    addWholesaleProductBtn.addEventListener('click', () => {
        const barcode = wholesaleBarcode.value.trim();
        if (barcode) {
            addProductToWholesaleCart(barcode);
            wholesaleBarcode.value = '';
        }
    });
}

function loadInventoryPage() {
    const products = db.getProducts();
    if (!inventoryTableBody) return;
    
    inventoryTableBody.innerHTML = '';
    products.forEach(product => {
        let status = 'جيد';
        let statusClass = '';
        if (product.stock === 0) { status = 'نفذ'; statusClass = 'stock-low'; }
        else if (product.stock <= product.minStock) { status = 'منخفض'; statusClass = 'stock-low'; }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.barcode}</td>
            <td>${product.stock}</td>
            <td>-</td>
            <td class="${statusClass}">${status}</td>
            <td><button class="action-btn edit-btn" data-id="${product.id}">تعديل</button></td>
        `;
        inventoryTableBody.appendChild(row);
    });
    
    document.querySelectorAll('#inventoryTableBody .edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const product = db.getProductById(id);
            const newStock = prompt('تعديل مخزون ' + product.name + '\nالمخزون الحالي: ' + product.stock, product.stock);
            if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                db.updateProduct(id, { stock: parseInt(newStock) });
                loadInventoryPage();
                loadProducts();
            }
        });
    });
    
    if (inventorySearch) {
        inventorySearch.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            const rows = inventoryTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }
}

function loadExpensesTable() {
    const expenses = expensesManager.getExpenses();
    const tableBody = document.getElementById('expensesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString('ar-EG')}</td>
            <td>${expense.name}</td>
            <td>${expense.category}</td>
            <td>${expense.amount.toFixed(2)} ج.م</td>
            <td>${expense.createdBy || 'نظام'}</td>
            <td><button class="action-btn delete-btn" data-id="${expense.id}">حذف</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    document.querySelectorAll('#expensesTableBody .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (confirm('هل أنت متأكد؟')) {
                const expenses = expensesManager.getExpenses();
                localStorage.setItem('expenses', JSON.stringify(expenses.filter(e => e.id !== id)));
                loadExpensesTable();
                updateSidebarData();
                showNotification('تم حذف المصروف', 'info');
            }
        });
    });
}

function loadProductCostTable() {
    const products = db.getProducts();
    const tableBody = document.getElementById('productCostTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    products.forEach(product => {
        const currentCost = expensesManager.getProductCost(product.id);
        const profit = currentCost ? product.price - currentCost : product.price * 0.3;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price} ج.م</td>
            <td><input type="number" class="cost-input" data-id="${product.id}" value="${currentCost || ''}" placeholder="سعر التكلفة" style="width:100px;padding:5px;"></td>
            <td class="profit-cell" data-id="${product.id}" style="color:${profit > 0 ? '#28a745' : '#dc3545'}">${profit.toFixed(2)} ج.م</td>
            <td><button class="action-btn save-cost-btn" data-id="${product.id}">حفظ</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    document.querySelectorAll('.save-cost-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const input = document.querySelector('.cost-input[data-id="' + id + '"]');
            const cost = parseFloat(input.value);
            if (cost && cost > 0) {
                expensesManager.updateProductCost(id, cost);
                const product = db.getProductById(id);
                const profit = product.price - cost;
                const profitCell = document.querySelector('.profit-cell[data-id="' + id + '"]');
                profitCell.textContent = profit.toFixed(2) + ' ج.م';
                profitCell.style.color = profit > 0 ? '#28a745' : '#dc3545';
                showNotification('تم حفظ سعر التكلفة', 'success');
            } else {
                alert('يرجى إدخال سعر تكلفة صحيح');
            }
        });
    });
    
    const searchInput = document.getElementById('productCostSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const name = row.cells[0]?.textContent.toLowerCase() || '';
                row.style.display = name.includes(term) ? '' : 'none';
            });
        });
    }
}

function generateAdvancedReport() {
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    
    if (!dateFrom || !dateTo) {
        alert('يرجى تحديد الفترة الزمنية');
        return;
    }
    
    const report = expensesManager.generateDetailedProfitReport(dateFrom, dateTo);
    displayProfitReport(report);
}

function displayProfitReport(report) {
    const reportResults = document.getElementById('reportResults');
    if (!reportResults) return;
    
    reportResults.innerHTML = `
        <div class="profit-report">
            <div class="report-header">
                <h4>تقرير الأرباح المفصل</h4>
                <p>الفترة: ${new Date(report.period.startDate).toLocaleDateString('ar-EG')} - ${new Date(report.period.endDate).toLocaleDateString('ar-EG')}</p>
            </div>
            <div class="summary-cards">
                <div class="summary-card"><div class="card-icon"><i class="bi bi-cash-stack"></i></div><div class="card-content"><div class="card-value">${report.summary.totalRevenue.toFixed(2)} ج.م</div><div class="card-label">إجمالي الإيرادات</div></div></div>
                <div class="summary-card"><div class="card-icon"><i class="bi bi-boxes"></i></div><div class="card-content"><div class="card-value">${report.summary.totalCost.toFixed(2)} ج.م</div><div class="card-label">إجمالي التكلفة</div></div></div>
                <div class="summary-card"><div class="card-icon"><i class="bi bi-wallet2"></i></div><div class="card-content"><div class="card-value">${report.summary.totalExpenses.toFixed(2)} ج.م</div><div class="card-label">إجمالي المصروفات</div></div></div>
                <div class="summary-card profit-card"><div class="card-icon"><i class="bi bi-graph-up"></i></div><div class="card-content"><div class="card-value">${report.summary.netProfit.toFixed(2)} ج.م</div><div class="card-label">صافي الربح</div><div class="card-sub">هامش الربح: ${report.summary.profitMargin.toFixed(2)}%</div></div></div>
            </div>
            <div class="report-actions">
                <button class="btn" id="exportReportExcelBtn"><i class="bi bi-file-excel"></i> تصدير إلى Excel</button>
                <button class="btn" onclick="window.print()"><i class="bi bi-printer"></i> طباعة</button>
            </div>
        </div>
    `;
    
    document.getElementById('exportReportExcelBtn').addEventListener('click', function() {
        expensesManager.exportReportToExcel(report);
    });
}

function addBackupButton() {
    const userInfo = document.querySelector('.user-info');
    if (!userInfo || document.querySelector('.backup-btn')) return;
    
    const backupBtn = document.createElement('button');
    backupBtn.className = 'logout-btn backup-btn';
    backupBtn.style.backgroundColor = '#28a745';
    backupBtn.style.marginLeft = '10px';
    backupBtn.innerHTML = '<i class="bi bi-cloud-upload"></i> نسخ احتياطي';
    backupBtn.onclick = () => {
        new BackupManager().exportAllDataToExcel();
        showNotification('تم إنشاء نسخة احتياطية', 'success');
    };
    
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'logout-btn restore-btn';
    restoreBtn.style.backgroundColor = '#17a2b8';
    restoreBtn.style.marginLeft = '10px';
    restoreBtn.innerHTML = '<i class="bi bi-cloud-download"></i> استعادة';
    restoreBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file && confirm('تحذير: استعادة النسخة ستستبدل جميع البيانات. هل أنت متأكد؟')) {
                await new BackupManager().restoreFromBackup(file);
                showNotification('تم استعادة البيانات، سيتم تحديث الصفحة', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        };
        input.click();
    };
    
    userInfo.appendChild(backupBtn);
    userInfo.appendChild(restoreBtn);
}

function loadSidebarMenu() {
    if (!sidebarMenu) return;
    sidebarMenu.innerHTML = '';
    
    const baseItems = [
        { id: 'cashierPage', name: 'نقطة البيع', icon: 'bi-cash-register' },
        { id: 'invoicesPage', name: 'الفواتير', icon: 'bi-receipt' }
    ];
    
    const adminItems = [
        { id: 'productsPage', name: 'إدارة المنتجات', icon: 'bi-boxes' },
        { id: 'barcodeMemoryPage', name: 'تخزين الباركود', icon: 'bi-memory' },
        { id: 'wholesalePage', name: 'فواتير الجملة', icon: 'bi-truck' },
        { id: 'inventoryPage', name: 'إدارة المخزون', icon: 'bi-bar-chart' },
        { id: 'reportsPage', name: 'التقارير', icon: 'bi-pie-chart' }
    ];
    
    const itemsToShow = [...baseItems];
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner')) {
        itemsToShow.push(...adminItems);
    }
    
    itemsToShow.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = '<a href="#" data-page="' + item.id + '"><i class="bi ' + item.icon + '"></i> ' + item.name + '</a>';
        sidebarMenu.appendChild(li);
    });
    
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
            document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function loadQuickLinks() {
    const container = document.getElementById('quickLinks');
    if (!container) return;
    container.innerHTML = '';
    
    const links = [
        { page: 'cashierPage', icon: 'bi-cash-register', name: 'نقطة البيع' },
        { page: 'invoicesPage', icon: 'bi-receipt', name: 'الفواتير' }
    ];
    
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner')) {
        links.push({ page: 'productsPage', icon: 'bi-box', name: 'المنتجات' });
        links.push({ page: 'inventoryPage', icon: 'bi-bar-chart', name: 'المخزون' });
        links.push({ page: 'reportsPage', icon: 'bi-pie-chart', name: 'التقارير' });
    }
    
    links.forEach(link => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'quick-link';
        a.onclick = () => { showPage(link.page); return false; };
        a.innerHTML = '<i class="bi ' + link.icon + '"></i> ' + link.name;
        container.appendChild(a);
    });
}

function loadRecentTransactions() {
    const list = document.getElementById('transactionsList');
    if (!list) return;
    const transactions = db.getRecentTransactions();
    list.innerHTML = transactions.slice(0, 5).map(t => `
        <li class="transaction-item">
            <div class="transaction-icon"><i class="bi ${t.type === 'بيع' ? 'bi-cart' : 'bi-truck'}"></i></div>
            <div class="transaction-info">
                <div class="transaction-header"><span class="transaction-title">${t.type}</span><span class="transaction-badge completed">مكتملة</span></div>
                <div class="transaction-details"><span>${t.details}</span><span class="transaction-amount">${t.amount.toFixed(2)} ج</span></div>
            </div>
        </li>
    `).join('');
}

function updateSidebarData() {
    const today = new Date().toDateString();
    const sales = db.getSales();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    
    const todayCount = document.getElementById('todaySalesCount');
    const todayRevenue = document.getElementById('todayRevenue');
    if (todayCount) todayCount.textContent = todaySales.length;
    if (todayRevenue) todayRevenue.textContent = todaySales.reduce((s, inv) => s + inv.total, 0).toFixed(2) + ' ج';
    
    const expenses = expensesManager.getExpenses();
    const todayExpenses = expenses.filter(e => new Date(e.date).toDateString() === today);
    const todayExpensesTotal = document.getElementById('todayExpenses');
    if (todayExpensesTotal) todayExpensesTotal.textContent = todayExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2);
    
    const products = db.getProducts();
    const lowStock = document.getElementById('lowStock');
    if (lowStock) lowStock.textContent = products.filter(p => p.stock < 10).length;
    
    loadRecentTransactions();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';
    
    if (pageId === 'productsPage') loadProductsTable();
    else if (pageId === 'barcodeMemoryPage') loadBarcodeMemoryPage();
    else if (pageId === 'invoicesPage') loadInvoicesPage();
    else if (pageId === 'wholesalePage') loadWholesalePage();
    else if (pageId === 'inventoryPage') loadInventoryPage();
    else if (pageId === 'reportsPage') {
        loadExpensesTable();
        loadProductCostTable();
    }
}

// ==================== أحداث تسجيل الدخول والخروج ====================
if (loginBtn) {
    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value;
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox?.checked || false;
        
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            new SessionManager().saveSession(user, rememberMe);
            
            loginPage.style.display = 'none';
            dashboard.style.display = 'block';
            userDisplay.textContent = 'مرحباً، ' + username;
            
            loadSidebarMenu();
            loadQuickLinks();
            showPage('cashierPage');
            loadProducts();
            loadRecentTransactions();
            updateSidebarData();
            addBackupButton();
            
            if (barcodeInput) barcodeInput.focus();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        dashboard.style.display = 'none';
        loginPage.style.display = 'flex';
        usernameInput.value = '';
        passwordInput.value = '';
        if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
        cart = [];
        wholesaleCart = [];
        currentUser = null;
        new SessionManager().clearSession();
    });
}

// ==================== أحداث الدفع المحسنة ====================
if (checkoutBtn) {
    const newCheckoutBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
    
    newCheckoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('السلة فارغة');
            return;
        }
        
        const subtotal = parseFloat(subtotalElement.textContent);
        const tax = parseFloat(taxElement.textContent);
        const total = parseFloat(totalElement.textContent);
        
        const saleId = db.addSale({
            items: [...cart],
            subtotal: subtotal,
            tax: tax,
            total: total,
            cashier: currentUser ? currentUser.username : 'system'
        });
        
        cart.forEach(item => db.updateProductStock(item.id, item.quantity));
        
        cart = [];
        updateCart();
        loadProducts();
        updateSidebarData();
        showNotification('تم إتمام عملية البيع بنجاح', 'success');
        
        setTimeout(() => {
            const invoiceSystem = new InvoiceSystem();
            invoiceSystem.showInvoice(saleId, 'sale');
        }, 500);
    });
}

if (wholesaleCheckoutBtn) {
    const newWholesaleCheckoutBtn = wholesaleCheckoutBtn.cloneNode(true);
    wholesaleCheckoutBtn.parentNode.replaceChild(newWholesaleCheckoutBtn, wholesaleCheckoutBtn);
    
    newWholesaleCheckoutBtn.addEventListener('click', () => {
        if (wholesaleCart.length === 0) {
            alert('سلة الجملة فارغة');
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
        
        const invoiceId = db.addWholesaleInvoice({
            customer, 
            items: [...wholesaleCart],
            subtotal, 
            discount: discountRate,
            discountAmount, 
            tax, 
            total,
            cashier: currentUser ? currentUser.username : 'system'
        });
        
        wholesaleCart.forEach(item => db.updateProductStock(item.id, item.quantity));
        
        wholesaleCart = [];
        wholesaleCustomer.value = '';
        updateWholesaleCart();
        loadWholesalePage();
        showNotification('تم إتمام فاتورة الجملة', 'success');
        
        setTimeout(() => {
            const invoiceSystem = new InvoiceSystem();
            invoiceSystem.showInvoice(invoiceId, 'wholesale');
        }, 500);
    });
}

// ==================== تهيئة الصفحة ====================
document.addEventListener('DOMContentLoaded', function() {
    const session = new SessionManager().getSession();
    if (session) {
        currentUser = session;
        loginPage.style.display = 'none';
        dashboard.style.display = 'block';
        userDisplay.textContent = 'مرحباً، ' + session.username;
        loadSidebarMenu();
        loadQuickLinks();
        showPage('cashierPage');
        loadProducts();
        loadRecentTransactions();
        updateSidebarData();
        addBackupButton();
        if (barcodeInput) barcodeInput.focus();
        new BackupManager().setupAutoBackup();
    } else {
        loginPage.style.display = 'flex';
        dashboard.style.display = 'none';
    }
    
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateAdvancedReport);
    
    const addExpense = document.getElementById('addExpenseBtn');
    if (addExpense) {
        addExpense.addEventListener('click', function() {
            const name = document.getElementById('expenseName')?.value.trim();
            const amount = parseFloat(document.getElementById('expenseAmount')?.value);
            const category = document.getElementById('expenseCategory')?.value;
            if (name && amount) {
                expensesManager.addExpense({ name, amount, category });
                document.getElementById('expenseName').value = '';
                document.getElementById('expenseAmount').value = '';
                loadExpensesTable();
                updateSidebarData();
                showNotification('تم إضافة المصروف', 'success');
            } else {
                alert('يرجى إدخال اسم المصروف والمبلغ');
            }
        });
    }
    
    setInterval(updateSidebarData, 30000);
});

// جعل الدوال متاحة عالمياً
window.showPage = showPage;
window.updateSidebarData = updateSidebarData;
window.expensesManager = expensesManager;









// ==================== شاشة التحميل ====================
class LoadingScreen {
    constructor() {
        this.createLoadingScreen();
    }
    
    createLoadingScreen() {
        // إنشاء عنصر شاشة التحميل إذا لم يكن موجوداً
        if (!document.getElementById('loadingScreen')) {
            const loadingHTML = `
                <div id="loadingScreen" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: url('/assets/loading-bg.png') no-repeat center center;
                    z-index: 999999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.5s ease;
                    opacity: 1;
                ">
                    <div style="text-align: center;">
                        <div class="spinner-container">
                            <div class="spinner"></div>
                            <div class="spinner-ring"></div>
                        </div>
                        <div style="margin-top: 30px; color: black; font-size: 18px; font-weight: bold;">
                 جاري تحميل ...
                        </div>
                        <div style="margin-top: 10px; color: black; font-size: 14px;">
                            يرجى الانتظار
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loadingHTML);
            
            // إضافة CSS للسبينر
            this.addSpinnerStyles();
        }
    }
    
    addSpinnerStyles() {
        if (!document.getElementById('spinnerStyles')) {
            const styles = `
                <style id="spinnerStyles">
                    .spinner-container {
                        position: relative;
                        width: 80px;
                        height: 80px;
                        margin: 0 auto;
                    }
                    
                    .spinner {
                        position: absolute;
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%);
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    
                    .spinner-ring {
                        position: absolute;
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        border: 3px solid rgba(255,255,255,0.3);
                        border-top: 3px solid white;
                        border-right: 3px solid white;
                        animation: spin 0.8s linear infinite;
                    }
                    
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(0.8);
                            opacity: 0.5;
                        }
                        50% {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                    
                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                        }
                        to {
                            opacity: 0;
                            visibility: hidden;
                        }
                    }
                    
                    .loading-fade-out {
                        animation: fadeOut 0.5s ease forwards;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    
    show() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            loadingScreen.classList.remove('loading-fade-out');
        }
    }
    
    hide() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('loading-fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
}

// إنشاء شاشة التحميل
const loadingScreen = new LoadingScreen();

// ==================== تهيئة الصفحة المحسنة مع شاشة التحميل ====================
document.addEventListener('DOMContentLoaded', function() {
    // إظهار شاشة التحميل
    loadingScreen.show();
    
    // محاولة استعادة الجلسة من localStorage أو sessionStorage
    const sessionManager = new SessionManager();
    const session = sessionManager.getSession();
    
    // محاكاة وقت تحميل بسيط للتأكد من ظهور شاشة التحميل
    setTimeout(() => {
        // التحقق من وجود مستخدم نشط
        if (session && session.username) {
            // استعادة المستخدم الحالي
            currentUser = session;
            
            // تحديث واجهة المستخدم
            loginPage.style.display = 'none';
            dashboard.style.display = 'block';
            userDisplay.textContent = 'مرحباً، ' + session.username;
            
            // تحميل جميع البيانات
            loadSidebarMenu();
            loadQuickLinks();
            showPage('cashierPage');
            loadProducts();
            loadRecentTransactions();
            updateSidebarData();
            addBackupButton();
            
            // تفعيل التركيز على حقل الباركود
            if (barcodeInput) barcodeInput.focus();
            
            // بدء النسخ الاحتياطي التلقائي
            new BackupManager().setupAutoBackup();
            
            // تحديث الجلسة لمنع انتهائها
            sessionManager.refreshSession();
            
            showNotification('تم استعادة الجلسة بنجاح', 'success');
        } else {
            // لا يوجد جلسة نشطة، عرض صفحة تسجيل الدخول
            loginPage.style.display = 'flex';
            dashboard.style.display = 'none';
            
            // تنظيف أي بيانات قديمة
            cart = [];
            wholesaleCart = [];
            currentUser = null;
        }
        
        // إخفاء شاشة التحميل بعد اكتمال التحميل
        setTimeout(() => {
            loadingScreen.hide();
        }, 500);
        
    }, 300); // تأخير بسيط لضمان ظهور شاشة التحميل
});

// دالة لتجميع جميع مستمعي الأحداث
function setupEventListeners() {
    // زر تقرير الأرباح
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateAdvancedReport);
    
    // زر إضافة المصروف
    const addExpense = document.getElementById('addExpenseBtn');
    if (addExpense) {
        addExpense.addEventListener('click', function() {
            const name = document.getElementById('expenseName')?.value.trim();
            const amount = parseFloat(document.getElementById('expenseAmount')?.value);
            const category = document.getElementById('expenseCategory')?.value;
            if (name && amount) {
                expensesManager.addExpense({ name, amount, category });
                document.getElementById('expenseName').value = '';
                document.getElementById('expenseAmount').value = '';
                loadExpensesTable();
                updateSidebarData();
                showNotification('تم إضافة المصروف', 'success');
            } else {
                alert('يرجى إدخال اسم المصروف والمبلغ');
            }
        });
    }
}