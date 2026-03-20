import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportPurchasesToExcel = (purchases: any[]) => {
  // 🟢 Updated mapping to match your state keys: storeName, invoiceDate, invoiceNo
  const worksheetData = purchases.map((p) => ({
    "Date": p.invoiceDate ? format(new Date(p.invoiceDate), "dd-MM-yyyy") : "N/A",
    "Invoice No": p.invoiceNo || "N/A",
    "Store Name": p.storeName || "N/A",
    "Status": p.status?.toUpperCase() || "PENDING",
    "Amount (₹)": p.totalAmount || 0,
    "Amount Paid (₹)": p.amountPaid || 0,
    "Created By": p.createdBy || "N/A",
    "Remarks": p.remarks || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

  // Adjust column widths for better readability
  worksheet["!cols"] = [
    { wch: 15 }, // Date
    { wch: 15 }, // Invoice No
    { wch: 25 }, // Store Name
    { wch: 15 }, // Status
    { wch: 15 }, // Amount
    { wch: 15 }, // Amount Paid
    { wch: 15 }, // Created By
    { wch: 30 }  // Remarks
  ];

  const fileName = `Purchases_Report_${format(new Date(), "dd_MMM_yyyy")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};