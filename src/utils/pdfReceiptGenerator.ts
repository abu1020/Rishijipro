import jsPDF from 'jspdf';
import { Earning, SUPPORTED_CURRENCIES } from '../types';
import { formatHumanDate } from './dateUtils';

/**
 * Generates an executive, high-end, audit-ready PDF Tax Invoice & Payment Voucher.
 * Designed with a luxury corporate accounting aesthetic for:
 * rishi Jha · Professional GST and TDS Accountant
 */
export function generateReceiptPDF(
  earning: Earning,
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
    return `${currency.code} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // =========================================================================
  // 1. OUTER ELEGANT DOUBLE BORDER & PAGE ACCENTS
  // =========================================================================
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

  doc.setDrawColor(241, 245, 249); // Slate 100
  doc.setLineWidth(0.2);
  doc.rect(7.5, 7.5, pageWidth - 15, pageHeight - 15);

  // =========================================================================
  // 2. EXECUTIVE TOP HEADER BANNER (DEEP NAVY & EMERALD)
  // =========================================================================
  // Deep Navy Header Box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(6, 6, pageWidth - 12, 34, 'F');

  // Emerald Divider Accent Line
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(6, 40, pageWidth - 12, 1.8, 'F');

  // Monogram Logo Badge [RJ]
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.roundedRect(margin, 11, 18, 18, 2.5, 2.5, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RJ', margin + 9, 23, { align: 'center' });

  // Main Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('rishi Jha', margin + 22, 19);

  // Slogan / Designation
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PROFESSIONAL GST AND TDS ACCOUNTANT', margin + 22, 25);

  // Practice Scope Tagline
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Statutory Taxation · GST Compliance · TDS Audits · Financial Ledgers', margin + 22, 30);

  // Right Side: Document Type & Voucher Details
  const rightX = pageWidth - margin;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAX INVOICE & BILL', rightX, 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const voucherNum = (earning.referenceId || earning.id.slice(0, 10)).toUpperCase();
  doc.text(`VOUCHER NO: ${voucherNum}`, rightX, 23, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.text(`DATE ISSUED: ${earning.date}`, rightX, 28, { align: 'right' });

  // =========================================================================
  // 3. STATUS & TRANSACTION QUICK-METRICS STRIP
  // =========================================================================
  let y = 46;

  // Background Bar
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'FD');

  // Status Badge on Left
  const isPaid = earning.paymentStatus === 'Received';
  const isPending = earning.paymentStatus === 'Pending';

  if (isPaid) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(16, 185, 129); // Emerald 500
    doc.setTextColor(5, 150, 105); // Emerald 600
  } else if (isPending) {
    doc.setFillColor(255, 241, 242); // Rose 50
    doc.setDrawColor(244, 63, 94); // Rose 500
    doc.setTextColor(225, 29, 72); // Rose 600
  } else {
    doc.setFillColor(254, 243, 199); // Amber 50
    doc.setDrawColor(245, 158, 11); // Amber 500
    doc.setTextColor(217, 119, 6); // Amber 600
  }

  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 3, y + 2.2, 40, 6.6, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const statusLabel = isPaid
    ? 'SETTLED & RECEIVED'
    : isPending
    ? 'PAYMENT PENDING'
    : 'PARTIALLY SETTLED';
  doc.text(statusLabel, margin + 23, y + 6.6, { align: 'center' });

  // Category Pill
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CATEGORY:', margin + 50, y + 6.8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(earning.category, margin + 68, y + 6.8);

  // Payment Mode Pill
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT MODE:', margin + 115, y + 6.8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(earning.paymentMethod || 'Bank Transfer', margin + 140, y + 6.8);

  // =========================================================================
  // 4. TWO-COLUMN PARTICULARS CARDS
  // =========================================================================
  y = 61;
  const colWidth = (contentWidth - 6) / 2; // 88mm each

  // Card 1: Billed To / Client Particulars (Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colWidth, 31, 2, 2, 'FD');

  // Left Card Header Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colWidth, 7, 2, 2, 'F');
  doc.rect(margin, y + 5, colWidth, 2, 'F'); // square bottom corners of top header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('BILLED TO / CLIENT PARTICULARS', margin + 4, y + 4.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  const clientDisplay = earning.clientName || 'General Client / Direct Client';
  doc.text(clientDisplay, margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Engagement: ${earning.category}`, margin + 4, y + 18.5);
  if (userEmail) {
    doc.text(`Account Email: ${userEmail}`, margin + 4, y + 23);
  }
  doc.text(`Billing Status: Authorized Ledger Entry`, margin + 4, y + 27.5);

  // Card 2: Settlement Specifications (Right)
  const col2X = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(col2X, y, colWidth, 31, 2, 2, 'FD');

  // Right Card Header Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, y, colWidth, 7, 2, 2, 'F');
  doc.rect(col2X, y + 5, colWidth, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TRANSACTION & AUDIT SPECIFICATIONS', col2X + 4, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Transaction Date:', col2X + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatHumanDate(earning.date), col2X + 32, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Remittance Mode:', col2X + 4, y + 18.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(earning.paymentMethod || 'Bank Remittance', col2X + 32, y + 18.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Ref / UTR No:', col2X + 4, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(earning.referenceId || 'N/A', col2X + 32, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Ledger Record ID:', col2X + 4, y + 27.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(earning.id.slice(0, 16), col2X + 32, y + 27.5);

  // =========================================================================
  // 5. ITEMIZED FINANCIAL BREAKDOWN TABLE
  // =========================================================================
  y = 97;

  // Table Header (Solid Deep Navy)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, y, contentWidth, 8.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 4, y + 5.5);
  doc.text('PARTICULARS / SCOPE OF SERVICES', margin + 14, y + 5.5);
  doc.text('TAX / TDS CODE', margin + 105, y + 5.5);
  doc.text('AMOUNT', rightX - 4, y + 5.5, { align: 'right' });

  // Table Row 1: Gross Invoiced Value
  y += 8.5;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, y + 14, rightX, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('01', margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.text('Gross Revenue & Professional Fee', margin + 14, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Invoiced service category: ${earning.category}`, margin + 14, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('BASE INVOICE', margin + 105, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(earning.grossAmount), rightX - 4, y + 7.5, { align: 'right' });

  // Table Row 2: Deductions / TDS Withheld
  y += 14;
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y + 14, rightX, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('02', margin + 4, y + 6);

  doc.setTextColor(225, 29, 72); // Rose 600
  doc.text('Statutory Withholding / TDS / Deductions', margin + 14, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const deductionPct =
    earning.grossAmount > 0 ? ((earning.deductions / earning.grossAmount) * 100).toFixed(1) : '0';
  doc.text(`Tax deductions & platform cuts at source (${deductionPct}%)`, margin + 14, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(225, 29, 72);
  doc.text(`TDS / WITHHELD (${deductionPct}%)`, margin + 105, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`-${formatMoney(earning.deductions)}`, rightX - 4, y + 7.5, { align: 'right' });

  // =========================================================================
  // 6. GRAND SETTLEMENT TOTAL BANNER (EXECUTIVE HIGH-CONTRAST FOCUS)
  // =========================================================================
  y += 18;

  // Left Metric Pill & Summary Note
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth - 92, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TAX & REALIZATION SUMMARY', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gross Taxable Value:`, margin + 5, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(earning.grossAmount), margin + 35, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Statutory Deductions:`, margin + 5, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`-${formatMoney(earning.deductions)} (${deductionPct}%)`, margin + 35, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text(`✓ Realized Net Margin: ${(100 - parseFloat(deductionPct)).toFixed(1)}%`, margin + 5, y + 22);

  // Right Grand Total Hero Box (Deep Navy & Emerald Border)
  const totalBoxX = pageWidth - margin - 88;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.8);
  doc.roundedRect(totalBoxX, y, 88, 25, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('NET AMOUNT REALIZED / SETTLED', totalBoxX + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(255, 255, 255);
  doc.text(formatMoney(earning.netAmount), totalBoxX + 82, y + 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Currency: ${currency.name} (${currency.code}) · Certified Settlement`, totalBoxX + 6, y + 21.5);

  // =========================================================================
  // 7. NOTES & SERVICE REMARKS (IF PROVIDED)
  // =========================================================================
  y += 29;
  if (earning.notes) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);

    const splitNotes = doc.splitTextToSize(earning.notes, contentWidth - 10);
    const boxHeight = Math.max(14, splitNotes.length * 4.2 + 8);

    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('NOTES & WORK SPECIFICATIONS:', margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(splitNotes, margin + 4, y + 10);

    y += boxHeight + 4;
  }

  // =========================================================================
  // 8. OFFICIAL SEAL & AUTHORIZED SIGNATORY BLOCK
  // =========================================================================
  y = Math.max(y, 215);

  // Left Side: Statutory Audit & Integrity Box
  const certWidth = contentWidth - 68; // 114mm
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, certWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY AUDIT & SYSTEM INTEGRITY', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This tax invoice & payment voucher is certified by rishi Jha (Professional GST and TDS Accountant).',
    margin + 5,
    y + 11.5
  );
  doc.text(
    'It authenticates that the gross contract receipts, statutory tax withholdings, and net realized take-home',
    margin + 5,
    y + 15.5
  );
  doc.text(
    'have been registered into the financial ledger in strict compliance with statutory accounting practices.',
    margin + 5,
    y + 19.5
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`RECORD ID: ${earning.id}`, margin + 5, y + 25);
  doc.text(`VERIFIED BY: rishi Jha · GST & TDS PRACTICE`, margin + 5, y + 29);

  // Right Side: Official Seal & Signature Block
  const sigX = pageWidth - margin - 62; // 62mm wide
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(sigX, y, 62, 34, 2, 2, 'FD');

  // Decorative Circular Stamp Emblem
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.5);
  doc.circle(sigX + 13, y + 17, 9);
  doc.circle(sigX + 13, y + 17, 7.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(5, 150, 105);
  doc.text('CERTIFIED', sigX + 13, y + 15, { align: 'center' });
  doc.setFontSize(6);
  doc.text('AUDIT', sigX + 13, y + 17.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.text('RJ PRACTICE', sigX + 13, y + 20, { align: 'center' });

  // Signature Line on the right side of the box
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sigX + 27, y + 21, sigX + 58, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('rishi Jha', sigX + 42.5, y + 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', sigX + 42.5, y + 28.5, { align: 'center' });
  doc.text('GST & TDS Accountant', sigX + 42.5, y + 31.5, { align: 'center' });

  // =========================================================================
  // 9. REFINED EXECUTIVE FOOTER
  // =========================================================================
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 16, rightX, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('rishi Jha · Professional GST and TDS Accountant · Verified Financial Record', margin, pageHeight - 11);

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  doc.text(`Page 1 of 1 · Generated on ${now} UTC`, rightX, pageHeight - 11, { align: 'right' });

  // Save the PDF with professional file naming
  const cleanRef = (earning.referenceId || earning.id.slice(0, 8)).replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `Bill-${cleanRef}-${earning.date}.pdf`;
  doc.save(fileName);
}
