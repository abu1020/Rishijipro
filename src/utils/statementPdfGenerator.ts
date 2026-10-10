import jsPDF from 'jspdf';
import { Earning, SUPPORTED_CURRENCIES } from '../types';
import { formatHumanDate } from './dateUtils';

/**
 * Generates an executive, audit-ready Consolidated Financial & Tax Statement PDF.
 * Letterhead: rishi Jha · Professional GST and TDS Accountant
 * Includes turnover analysis, TDS withholding summary, settlement ratios, and itemized ledger table.
 */
export function generateStatementPDF(
  earnings: Earning[],
  periodLabel: string = 'Current Financial Period',
  currencyCode: string = 'INR',
  userEmail: string = ''
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  const formatMoney = (amount: number) => {
    return `${currency.symbol} ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm
  const rightX = pageWidth - margin; // 198mm

  // Aggregates
  const totalGross = earnings.reduce((sum, e) => sum + e.grossAmount, 0);
  const totalDeductions = earnings.reduce((sum, e) => sum + e.deductions, 0);
  const totalNet = earnings.reduce((sum, e) => sum + e.netAmount, 0);
  const effectiveTaxRate = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;

  const settledCount = earnings.filter((e) => e.paymentStatus === 'Received').length;
  const pendingCount = earnings.filter((e) => e.paymentStatus === 'Pending').length;
  const partialCount = earnings.filter((e) => e.paymentStatus === 'Partially Paid').length;

  let y = 10;

  // 1. HEADER BANNER
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, y, contentWidth, 32, 'F');

  // Emerald Accent Rim
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(margin, y + 32, contentWidth, 1.5, 'F');

  // Insignia Monogram
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin + 4, y + 5, 14, 14, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RJ', margin + 11, y + 14.5, { align: 'center' });

  // Accountant Identity
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('rishi Jha', margin + 22, y + 12);

  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.setFontSize(8);
  doc.text('PROFESSIONAL GST AND TDS ACCOUNTANT', margin + 22, y + 17.5);

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Statutory Taxation · GST Compliance · TDS Audits · Financial Ledgers', margin + 22, y + 22.5);

  // Right Header: Document Title & Period
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TAX & REVENUE AUDIT STATEMENT', rightX - 4, y + 11.5, { align: 'right' });

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`PERIOD: ${periodLabel.toUpperCase()}`, rightX - 4, y + 17, { align: 'right' });

  const datePrinted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setTextColor(148, 163, 184);
  doc.text(`GENERATED ON: ${datePrinted}`, rightX - 4, y + 22, { align: 'right' });

  y += 38;

  // 2. EXECUTIVE SUMMARY METRICS CARDS (4 Columns)
  const colWidth = (contentWidth - 6) / 4;

  // Card 1: Gross Revenue
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colWidth, 18, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL GROSS INVOICED', margin + 3, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(formatMoney(totalGross), margin + 3, y + 12);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`${earnings.length} Total Transaction(s)`, margin + 3, y + 15.5);

  // Card 2: Total Deductions
  const c2x = margin + colWidth + 2;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(c2x, y, colWidth, 18, 1.5, 1.5, 'FD');
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX & TDS WITHHOLDING', c2x + 3, y + 5);
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(9.5);
  doc.text(`-${formatMoney(totalDeductions)}`, c2x + 3, y + 12);
  doc.setFontSize(6);
  doc.setTextColor(153, 27, 27);
  doc.text(`${effectiveTaxRate.toFixed(1)}% Effective Tax Cut`, c2x + 3, y + 15.5);

  // Card 3: Net Realized
  const c3x = margin + (colWidth + 2) * 2;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(c3x, y, colWidth, 18, 1.5, 1.5, 'FD');
  doc.setTextColor(4, 120, 87);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('NET REALIZED REVENUE', c3x + 3, y + 5);
  doc.setTextColor(4, 120, 87);
  doc.setFontSize(9.5);
  doc.text(formatMoney(totalNet), c3x + 3, y + 12);
  doc.setFontSize(6);
  doc.setTextColor(5, 150, 105);
  doc.text('Net Take-Home Funds', c3x + 3, y + 15.5);

  // Card 4: Settlement Health
  const c4x = margin + (colWidth + 2) * 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(c4x, y, colWidth, 18, 1.5, 1.5, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SETTLEMENT AUDIT', c4x + 3, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(`${settledCount} Received`, c4x + 3, y + 12);
  doc.setFontSize(6);
  doc.setTextColor(pendingCount > 0 ? 225 : 100, pendingCount > 0 ? 29 : 116, pendingCount > 0 ? 72 : 139);
  doc.text(`${pendingCount} Pending · ${partialCount} Partial`, c4x + 3, y + 15.5);

  y += 24;

  // 3. TABLE SECTION HEADER
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEMIZED TRANSACTION LEDGER REGISTER', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Sorted chronologically · All currency figures in ${currency.code} (${currency.name})`, rightX, y, { align: 'right' });

  y += 3.5;

  // 4. TABLE HEADER
  const thHeight = 6.5;
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(margin, y, contentWidth, thHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);

  // Column X offsets
  const xDate = margin + 3;
  const xRef = margin + 22;
  const xClient = margin + 46;
  const xCategory = margin + 84;
  const xMethod = margin + 116;
  const xGross = margin + 144;
  const xDed = margin + 165;
  const xNet = rightX - 3;

  doc.text('DATE', xDate, y + 4.2);
  doc.text('REF / INVOICE', xRef, y + 4.2);
  doc.text('CLIENT / PAYER', xClient, y + 4.2);
  doc.text('CATEGORY', xCategory, y + 4.2);
  doc.text('SETTLEMENT', xMethod, y + 4.2);
  doc.text('GROSS', xGross, y + 4.2, { align: 'right' });
  doc.text('TDS/TAX', xDed, y + 4.2, { align: 'right' });
  doc.text('NET AMOUNT', xNet, y + 4.2, { align: 'right' });

  y += thHeight;

  // 5. TABLE ROWS
  const rowHeight = 6;
  const maxRowsPerPage = 32;
  let rowsCount = 0;

  earnings.forEach((item, index) => {
    // Check if new page is needed
    if (y + rowHeight > pageHeight - 25) {
      // Add page
      doc.addPage();
      y = 14;

      // Repeat Table Header on next page
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, contentWidth, thHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('DATE', xDate, y + 4.2);
      doc.text('REF / INVOICE', xRef, y + 4.2);
      doc.text('CLIENT / PAYER', xClient, y + 4.2);
      doc.text('CATEGORY', xCategory, y + 4.2);
      doc.text('SETTLEMENT', xMethod, y + 4.2);
      doc.text('GROSS', xGross, y + 4.2, { align: 'right' });
      doc.text('TDS/TAX', xDed, y + 4.2, { align: 'right' });
      doc.text('NET AMOUNT', xNet, y + 4.2, { align: 'right' });
      y += thHeight;
    }

    // Row zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    // Row bottom border
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, rightX, y + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);

    // Date
    doc.text(item.date, xDate, y + 4);

    // Ref ID truncated
    let refStr = item.referenceId ? item.referenceId : item.id.slice(0, 8);
    if (refStr.length > 12) refStr = refStr.slice(0, 11) + '…';
    doc.setTextColor(71, 85, 105);
    doc.text(refStr, xRef, y + 4);

    // Client
    let clientStr = item.clientName || 'General / Direct';
    if (clientStr.length > 22) clientStr = clientStr.slice(0, 21) + '…';
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(clientStr, xClient, y + 4);

    // Category
    let catStr = item.category;
    if (catStr.length > 18) catStr = catStr.slice(0, 17) + '…';
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(catStr, xCategory, y + 4);

    // Method & Status
    let methodStr = `${item.paymentMethod || 'Bank'} (${item.paymentStatus === 'Received' ? 'Paid' : item.paymentStatus === 'Pending' ? 'Pend' : 'Part'})`;
    if (methodStr.length > 18) methodStr = methodStr.slice(0, 17) + '…';
    doc.text(methodStr, xMethod, y + 4);

    // Gross
    doc.text(item.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), xGross, y + 4, { align: 'right' });

    // Deductions
    doc.setTextColor(item.deductions > 0 ? 185 : 100, item.deductions > 0 ? 28 : 116, item.deductions > 0 ? 28 : 139);
    doc.text(
      item.deductions > 0 ? `-${item.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '0.00',
      xDed,
      y + 4,
      { align: 'right' }
    );

    // Net
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.text(item.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), xNet, y + 4, { align: 'right' });

    y += rowHeight;
    rowsCount++;
  });

  // 6. TOTALS ROW
  if (y + 12 > pageHeight - 20) {
    doc.addPage();
    y = 14;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`GRAND TOTALS (${earnings.length} RECORDS):`, margin + 4, y + 5.2);

  doc.text(formatMoney(totalGross), xGross, y + 5.2, { align: 'right' });
  doc.setTextColor(185, 28, 28);
  doc.text(`-${formatMoney(totalDeductions)}`, xDed, y + 5.2, { align: 'right' });
  doc.setTextColor(4, 120, 87);
  doc.setFontSize(8.5);
  doc.text(formatMoney(totalNet), xNet, y + 5.2, { align: 'right' });

  y += 14;

  // 7. ACCOUNTANT'S DECLARATION & AUDIT SEAL
  if (y + 24 > pageHeight - 15) {
    doc.addPage();
    y = 14;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text("ACCOUNTANT'S CERTIFICATION & ATTESTATION:", margin + 3.5, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Certified that the entries above represent bona fide daily income, billings, and statutory tax withholdings recorded in this accounting ledger.',
    margin + 3.5,
    y + 8.5
  );
  doc.text(
    `Prepared under the supervision of rishi Jha · Professional GST and TDS Accountant · Ledger ID: #${earnings[0]?.id.slice(0, 10) || 'LEDGER-01'}`,
    margin + 3.5,
    y + 12.5
  );

  // Digital Signature Stamp
  doc.setFillColor(16, 185, 129);
  doc.rect(rightX - 35, y + 3, 32, 12, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('rishi Jha', rightX - 19, y + 7, { align: 'center' });
  doc.setFontSize(5);
  doc.text('VERIFIED AUDIT SEAL', rightX - 19, y + 11.5, { align: 'center' });

  // Document Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `rishi Jha · Professional GST and TDS Accountant | Page ${p} of ${totalPages} | Confidential Ledger Document`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const cleanPeriod = periodLabel.replace(/\s+/g, '_').toLowerCase();
  doc.save(`rishi_Jha_GST_TDS_Statement_${cleanPeriod}.pdf`);
}
