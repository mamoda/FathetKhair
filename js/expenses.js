// js/expenses.js - نظام المصروفات وإدارة التكاليف

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

    // إضافة مصروف جديد
    addExpense(expenseData) {
        const expenses = this.getExpenses();
        expenseData.id = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
        expenseData.date = new Date().toISOString();
        expenseData.createdBy = currentUser ? currentUser.username : 'system';
        expenses.push(expenseData);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        return expenseData.id;
    }

    // الحصول على المصروفات
    getExpenses() {
        return JSON.parse(localStorage.getItem('expenses')) || [];
    }

    // تحديث تكلفة المنتج
    updateProductCost(productId, costPrice) {
        const productCosts = JSON.parse(localStorage.getItem('productCosts')) || {};
        productCosts[productId] = {
            cost: costPrice,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('productCosts', JSON.stringify(productCosts));
    }

    // الحصول على تكلفة المنتج
    getProductCost(productId) {
        const productCosts = JSON.parse(localStorage.getItem('productCosts')) || {};
        return productCosts[productId] ? productCosts[productId].cost : null;
    }

    // حساب الربح الصافي
    calculateNetProfit(startDate, endDate) {
        const sales = this.getSalesInRange(startDate, endDate);
        const expenses = this.getExpensesInRange(startDate, endDate);
        
        let totalRevenue = 0;
        let totalCost = 0;
        
        // حساب تكلفة المبيعات
        sales.forEach(sale => {
            totalRevenue += sale.total;
            
            sale.items.forEach(item => {
                const productCost = this.getProductCost(item.id);
                if (productCost) {
                    totalCost += productCost * item.quantity;
                } else {
                    // تقدير التكلفة بـ 70% من السعر
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

    // الحصول على المبيعات في نطاق زمني
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

    // الحصول على المصروفات في نطاق زمني
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

    // إنشاء تقرير ربح مفصل
    generateDetailedProfitReport(startDate, endDate) {
        const sales = this.getSalesInRange(startDate, endDate);
        const expenses = this.getExpensesInRange(startDate, endDate);
        const profitCalculation = this.calculateNetProfit(startDate, endDate);
        
        // تحليل المبيعات حسب الفئة
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
        
        // تحليل المصروفات حسب النوع
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

    // الحصول على تفاصيل يومية
    getDailyBreakdown(startDate, endDate) {
        const sales = this.getSalesInRange(startDate, endDate);
        const expenses = this.getExpensesInRange(startDate, endDate);
        const dailyData = {};
        
        // تجميع المبيعات حسب اليوم
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
                }
            });
        });
        
        // تجميع المصروفات حسب اليوم
        expenses.forEach(expense => {
            const day = new Date(expense.date).toDateString();
            if (dailyData[day]) {
                dailyData[day].expenses += expense.amount;
            } else {
                dailyData[day] = { revenue: 0, cost: 0, expenses: expense.amount, profit: 0, salesCount: 0 };
            }
        });
        
        // حساب الربح اليومي
        Object.keys(dailyData).forEach(day => {
            dailyData[day].profit = dailyData[day].revenue - dailyData[day].cost - dailyData[day].expenses;
        });
        
        return dailyData;
    }

    getProductById(id) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return products.find(p => p.id === id);
    }

    // تصدير التقرير إلى Excel
    exportReportToExcel(report) {
        const workbook = XLSX.utils.book_new();
        
        // صفحة الملخص
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
        
        // صفحة المبيعات حسب الفئة
        const categoryData = [['الفئة', 'الكمية', 'الإيرادات']];
        Object.entries(report.salesByCategory).forEach(([category, data]) => {
            categoryData.push([category, data.quantity, `${data.revenue.toFixed(2)} ج.م`]);
        });
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'المبيعات_حسب_الفئة');
        
        // صفحة التفاصيل اليومية
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