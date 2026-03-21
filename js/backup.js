// js/backup.js - نظام النسخ الاحتياطي المتقدم

class BackupManager {
    constructor() {
        this.db = new Database();
    }

    // تصدير جميع البيانات إلى ملف Excel
    exportAllDataToExcel() {
        const data = {
            products: this.db.getProducts(),
            sales: this.db.getSales(),
            wholesaleInvoices: this.db.getWholesaleInvoices(),
            inventoryLog: this.db.getInventoryLog(),
            barcodeMemory: this.db.getBarcodeMemory(),
            expenses: this.db.getExpenses ? this.db.getExpenses() : [],
            backupDate: new Date().toISOString()
        };

        // إنشاء مصنف Excel
        const workbook = XLSX.utils.book_new();

        // إضافة كل جدول على حدة
        this.addSheetToWorkbook(workbook, data.products, 'المنتجات');
        this.addSheetToWorkbook(workbook, data.sales, 'المبيعات');
        this.addSheetToWorkbook(workbook, data.wholesaleInvoices, 'فواتير_الجملة');
        this.addSheetToWorkbook(workbook, data.inventoryLog, 'سجل_المخزون');
        this.addSheetToWorkbook(workbook, data.barcodeMemory, 'ذاكرة_الباركود');
        
        if (data.expenses.length > 0) {
            this.addSheetToWorkbook(workbook, data.expenses, 'المصروفات');
        }

        // إضافة صفحة معلومات النسخة
        const backupInfo = [[`تاريخ النسخ الاحتياطي: ${new Date().toLocaleString('ar-EG')}`]];
        const infoSheet = XLSX.utils.aoa_to_sheet(backupInfo);
        XLSX.utils.book_append_sheet(workbook, infoSheet, 'معلومات_النسخة');

        // حفظ الملف
        const fileName = `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        return true;
    }

    // إضافة جدول إلى المصنف
    addSheetToWorkbook(workbook, data, sheetName) {
        if (data && data.length > 0) {
            // تحويل البيانات إلى مصفوفة ثنائية الأبعاد
            const headers = Object.keys(data[0]);
            const rows = data.map(item => headers.map(header => {
                let value = item[header];
                // تنسيق التواريخ
                if (value && typeof value === 'string' && value.includes('T')) {
                    value = new Date(value).toLocaleString('ar-EG');
                }
                // تنسيق الكائنات
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                return value;
            }));
            
            const worksheetData = [headers, ...rows];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            
            // ضبط عرض الأعمدة
            const colWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
            worksheet['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        } else {
            // إضافة ورقة فارغة
            const emptySheet = XLSX.utils.aoa_to_sheet([['لا توجد بيانات']]);
            XLSX.utils.book_append_sheet(workbook, emptySheet, sheetName);
        }
    }

    // استيراد البيانات من ملف Excel
    importDataFromExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const importedData = {};
                    
                    // قراءة كل ورقة عمل
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

    // استعادة البيانات من النسخة الاحتياطية
    async restoreFromBackup(file) {
        const importedData = await this.importDataFromExcel(file);
        
        // التحقق من صحة البيانات
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

    // تصدير النسخة الاحتياطية إلى Google Sheets (API)
    async exportToGoogleSheets() {
        // هذا يتطلب إعداد Google Sheets API
        // يمكن إضافته لاحقاً عند الحاجة
        console.log('Google Sheets export requires API setup');
    }

    // إنشاء نسخة احتياطية تلقائية
    setupAutoBackup() {
        // نسخة احتياطية يومية
        setInterval(() => {
            const lastBackup = localStorage.getItem('lastBackup');
            const today = new Date().toDateString();
            
            if (lastBackup !== today) {
                this.exportAllDataToExcel();
                localStorage.setItem('lastBackup', today);
                this.showBackupNotification();
            }
        }, 3600000); // التحقق كل ساعة
    }

    showBackupNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="bi bi-cloud-check"></i>
            تم إنشاء نسخة احتياطية تلقائية للبيانات
        `;
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