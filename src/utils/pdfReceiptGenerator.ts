import jsPDF from 'jspdf';
import { Earning, SUPPORTED_CURRENCIES } from '../types';
import { formatHumanDate } from './dateUtils';

/**
 * Generates an executive, pixel-perfect, audit-ready PDF Tax Invoice & Payment Bill.
 * Crafted specifically for:
 * rishi Jha · Professional GST and TDS Accountant
 *
 * Implements strict boundary checking, automatic text wrapping (splitTextToSize),
 * dynamic font scaling for large currency amounts, and zero text-overflow guarantees.
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
  const rightX = pageWidth - margin; // 196mm

  // Helper: Truncate text cleanly if it exceeds maximum width in mm
  const truncateToWidth = (text: string, maxWidth: number, fontName = 'helvetica', fontStyle = 'normal', fontSize = 8): string => {
    doc.setFont(fontName, fontStyle);
    doc.setFontSize(fontSize);
    if (doc.getTextWidth(text) <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 3 && doc.getTextWidth(truncated + '...') > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  };

  // Helper: Draw text with auto-clipping to prevent escaping container box
  const drawBoundedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    const currentSize = doc.getFontSize();
    // Check if text exceeds max width
    if (doc.getTextWidth(text) > maxWidth) {
      let trimmed = text;
      while (trimmed.length > 3 && doc.getTextWidth(trimmed + '...') > maxWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      doc.text(trimmed + '...', x, y, { align });
    } else {
      doc.text(text, x, y, { align });
    }
  };

  // =========================================================================
  // 1. OUTER EXECUTIVE BORDER & BACKGROUND CONSTRAINTS
  // =========================================================================
  // Subtle outer hairline frame
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

  doc.setDrawColor(241, 245, 249); // Slate 100
  doc.setLineWidth(0.2);
  doc.rect(7.5, 7.5, pageWidth - 15, pageHeight - 15);

  // =========================================================================
  // 2. EXECUTIVE TOP HEADER BANNER (DEEP SLATE NAVY & EMERALD)
  // =========================================================================
  // Solid Navy Banner Block
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(6, 6, pageWidth - 12, 33, 'F');

  // Emerald Divider Line
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(6, 39, pageWidth - 12, 1.8, 'F');

  // Monogram Logo Insignia [RJ] (X: 13, Y: 10, W: 18, H: 18)
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(13, 11, 17, 17, 2.5, 2.5, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RJ', 21.5, 22.5, { align: 'center' });

  // Brand Name & Professional Slogan
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('rishi Jha', 34, 18);

  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PROFESSIONAL GST AND TDS ACCOUNTANT', 34, 24);

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Statutory Taxation · GST Compliance · TDS Audits · Financial Ledgers', 34, 29);

  // Right Side: Tax Invoice & Bill Document Details
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text('TAX INVOICE & BILL', rightX, 16.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const rawVoucher = (earning.referenceId || earning.id.slice(0, 10)).toUpperCase();
  const boundedVoucher = truncateToWidth(`VOUCHER NO: ${rawVoucher}`, 55, 'helvetica', 'normal', 7.5);
  doc.text(boundedVoucher, rightX, 22.5, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.text(`DATE ISSUED: ${earning.date}`, rightX, 27.5, { align: 'right' });

  // =========================================================================
  // 3. STATUS & TRANSACTION SPECIFICATION STRIP
  // =========================================================================
  let y = 44;

  // Background Bar
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'FD');

  // Status Badge on Left (Width: 38mm)
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
  doc.roundedRect(margin + 2.5, y + 2.2, 38, 6.6, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const statusLabel = isPaid
    ? 'SETTLED & RECEIVED'
    : isPending
    ? 'PAYMENT PENDING'
    : 'PARTIALLY SETTLED';
  doc.text(statusLabel, margin + 21.5, y + 6.6, { align: 'center' });

  // Category Bounded Segment (X: margin + 44 to margin + 112, Width: 68mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CATEGORY:', margin + 44, y + 6.8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const safeCategory = truncateToWidth(earning.category || 'General', 48, 'helvetica', 'bold', 7);
  doc.text(safeCategory, margin + 62, y + 6.8);

  // Payment Mode Bounded Segment (X: margin + 114 to rightX - 2.5, Width: 64mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('MODE:', margin + 118, y + 6.8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const safeMode = truncateToWidth(earning.paymentMethod || 'Bank Transfer', 50, 'helvetica', 'bold', 7);
  doc.text(safeMode, margin + 130, y + 6.8);

  // =========================================================================
  // 4. TWO-COLUMN PARTICULARS CARDS (STRICT 88MM WIDTH EACH)
  // =========================================================================
  y = 58;
  const colWidth = (contentWidth - 6) / 2; // 88mm each
  const cardHeight = 31;

  // ----------------- Left Card: Billed To / Client Particulars -----------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colWidth, cardHeight, 2, 2, 'FD');

  // Header Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colWidth, 7, 2, 2, 'F');
  doc.rect(margin, y + 5, colWidth, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('BILLED TO / CLIENT PARTICULARS', margin + 4, y + 4.8);

  // Client Name (Guaranteed bounded to 80mm width)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const rawClient = earning.clientName || 'General Client / Direct Client';
  const safeClient = truncateToWidth(rawClient, colWidth - 8, 'helvetica', 'bold', 9.5);
  doc.text(safeClient, margin + 4, y + 13);

  // Engagement Details (Bounded)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const safeEngagement = truncateToWidth(`Engagement: ${earning.category}`, colWidth - 8, 'helvetica', 'normal', 7.5);
  doc.text(safeEngagement, margin + 4, y + 18);

  // Account / Email Reference (Bounded)
  const emailLine = userEmail ? `Account: ${userEmail}` : 'Verified Client Ledger';
  const safeEmail = truncateToWidth(emailLine, colWidth - 8, 'helvetica', 'normal', 7.5);
  doc.text(safeEmail, margin + 4, y + 22.5);

  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Status: Authorized Ledger Entry', margin + 4, y + 27);

  // ----------------- Right Card: Settlement Specifications -----------------
  const col2X = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(col2X, y, colWidth, cardHeight, 2, 2, 'FD');

  // Header Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, y, colWidth, 7, 2, 2, 'F');
  doc.rect(col2X, y + 5, colWidth, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('TRANSACTION & AUDIT SPECIFICATIONS', col2X + 4, y + 4.8);

  // Grid Rows with strict boundary protection
  const drawSpecRow = (rowY: number, label: string, val: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, col2X + 4, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    // Max width for value column is colWidth - 36mm
    const safeVal = truncateToWidth(val, colWidth - 36, 'helvetica', 'bold', 7.5);
    doc.text(safeVal, col2X + 32, rowY);
  };

  drawSpecRow(y + 13, 'Transaction Date:', formatHumanDate(earning.date));
  drawSpecRow(y + 17.8, 'Remittance Mode:', earning.paymentMethod || 'Bank Remittance');
  drawSpecRow(y + 22.5, 'Ref / UTR No:', earning.referenceId || 'N/A');
  drawSpecRow(y + 27, 'Ledger Record ID:', earning.id.slice(0, 14));

  // =========================================================================
  // 5. ITEMIZED FINANCIAL BREAKDOWN TABLE
  // =========================================================================
  y = 93;

  // Table Header (Solid Deep Navy)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 4, y + 5.2);
  doc.text('PARTICULARS / SCOPE OF SERVICES', margin + 14, y + 5.2);
  doc.text('TAX / TDS CODE', margin + 104, y + 5.2);
  doc.text('AMOUNT', rightX - 4, y + 5.2, { align: 'right' });

  // Table Row 1: Gross Invoiced Value
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 13.5, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, y + 13.5, rightX, y + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('01', margin + 4, y + 5.8);

  doc.setTextColor(15, 23, 42);
  const row1Title = truncateToWidth('Gross Revenue & Professional Fee', 85, 'helvetica', 'bold', 8);
  doc.text(row1Title, margin + 14, y + 5.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const row1Sub = truncateToWidth(`Service category: ${earning.category}`, 85, 'helvetica', 'normal', 7);
  doc.text(row1Sub, margin + 14, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('BASE INVOICE', margin + 104, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(earning.grossAmount), rightX - 4, y + 7.5, { align: 'right' });

  // Table Row 2: Deductions / TDS Withheld
  y += 13.5;
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, contentWidth, 13.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y + 13.5, rightX, y + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('02', margin + 4, y + 5.8);

  doc.setTextColor(225, 29, 72); // Rose 600
  const row2Title = truncateToWidth('Statutory Withholding / TDS / Deductions', 85, 'helvetica', 'bold', 8);
  doc.text(row2Title, margin + 14, y + 5.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const deductionPct =
    earning.grossAmount > 0 ? ((earning.deductions / earning.grossAmount) * 100).toFixed(1) : '0';
  const row2Sub = truncateToWidth(`Tax deductions & platform cuts at source (${deductionPct}%)`, 85, 'helvetica', 'normal', 7);
  doc.text(row2Sub, margin + 14, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(225, 29, 72);
  const taxCodeText = truncateToWidth(`TDS / WITHHELD (${deductionPct}%)`, 36, 'helvetica', 'bold', 7.5);
  doc.text(taxCodeText, margin + 104, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`-${formatMoney(earning.deductions)}`, rightX - 4, y + 7.5, { align: 'right' });

  // =========================================================================
  // 6. GRAND SETTLEMENT TOTAL BANNER (BOUNDED SUMMARY & TOTAL BOX)
  // =========================================================================
  y += 17.5;

  // Left Summary Pill (Width: 90mm)
  const leftSummaryWidth = 90;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, leftSummaryWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('TAX & REALIZATION SUMMARY', margin + 4, y + 5.5);

  // Row 1: Gross
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Gross Taxable Value:', margin + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const safeGrossSum = formatMoney(earning.grossAmount);
  doc.text(safeGrossSum, margin + leftSummaryWidth - 4, y + 10.5, { align: 'right' });

  // Row 2: Deductions
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory Deductions:', margin + 4, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  const safeDedSum = `-${formatMoney(earning.deductions)}`;
  doc.text(safeDedSum, margin + leftSummaryWidth - 4, y + 15, { align: 'right' });

  // Row 3: Margin Rate
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  const netMarginVal = (100 - parseFloat(deductionPct)).toFixed(1);
  doc.text(`✓ Realized Net Take-Home Margin: ${netMarginVal}%`, margin + 4, y + 19.5);

  // Right Total Box (Width: 88mm, strictly aligned to rightX)
  const totalBoxWidth = contentWidth - leftSummaryWidth - 4; // 88mm
  const totalBoxX = margin + leftSummaryWidth + 4;

  doc.setFillColor(15, 23, 42); // Slate 900
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.8);
  doc.roundedRect(totalBoxX, y, totalBoxWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('NET AMOUNT REALIZED / SETTLED', totalBoxX + 5, y + 6);

  // Dynamic Font Size for Net Amount to prevent ever escaping box
  const formattedNet = formatMoney(earning.netAmount);
  doc.setFont('helvetica', 'bold');
  let netFontSize = 14;
  doc.setFontSize(netFontSize);
  while (doc.getTextWidth(formattedNet) > totalBoxWidth - 10 && netFontSize > 8) {
    netFontSize -= 0.5;
    doc.setFontSize(netFontSize);
  }
  doc.setTextColor(255, 255, 255);
  doc.text(formattedNet, totalBoxX + totalBoxWidth - 5, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const currencyFooter = truncateToWidth(`Currency: ${currency.name} (${currency.code}) · Certified Settlement`, totalBoxWidth - 10, 'helvetica', 'normal', 6.5);
  doc.text(currencyFooter, totalBoxX + 5, y + 20);

  // =========================================================================
  // 7. NOTES & SERVICE REMARKS (BOUNDED & CAPPED TO PREVENT PAGE OVERFLOW)
  // =========================================================================
  y += 28;

  if (earning.notes && earning.notes.trim()) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);

    // Split text with margin padding
    const maxNotesWidth = contentWidth - 8;
    const splitNotesAll = doc.splitTextToSize(earning.notes.trim(), maxNotesWidth);
    // Cap to maximum 3 lines so notes never push the signature box into the footer
    const splitNotes = splitNotesAll.slice(0, 3);
    if (splitNotesAll.length > 3) {
      splitNotes[2] = truncateToWidth(splitNotes[2], maxNotesWidth - 6, 'helvetica', 'normal', 7) + '...';
    }

    const notesBoxHeight = Math.max(12, splitNotes.length * 4 + 7);
    doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('NOTES & WORK SPECIFICATIONS:', margin + 4, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    doc.text(splitNotes, margin + 4, y + 9);

    y += notesBoxHeight + 4;
  }

  // =========================================================================
  // 8. STATUTORY AUDIT CERTIFICATION & AUTHORIZED SIGNATORY BLOCK
  // =========================================================================
  // Ensure y leaves comfortable room for 33mm block + footer
  y = Math.min(Math.max(y, 184), 220);
  const certBlockHeight = 33;

  // Left Side: Statutory Audit Text Box (Width: 116mm)
  const certBoxWidth = contentWidth - 64; // 118mm
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, certBoxWidth, certBlockHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY AUDIT & COMPLIANCE CERTIFICATION', margin + 4, y + 5.5);

  // Auto-wrapped paragraph (GUARANTEED NEVER TO OVERFLOW)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  const certParagraph =
    'This tax invoice and payment voucher is authenticated by rishi Jha (Professional GST and TDS Accountant). It certifies that the recorded professional receipts, statutory GST and TDS deductions, and net realized proceeds conform with the official accounting ledger.';
  const wrappedCert = doc.splitTextToSize(certParagraph, certBoxWidth - 8);
  doc.text(wrappedCert, margin + 4, y + 10.5);

  // Security Checksum Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(71, 85, 105);
  const recIdShort = earning.id.length > 28 ? earning.id.slice(0, 28) + '...' : earning.id;
  doc.text(`RECORD UID: ${recIdShort}`, margin + 4, y + 24.5);
  doc.text('CERTIFIED BY: rishi Jha · GST & TDS PRACTICE', margin + 4, y + 28.5);

  // Right Side: Official Seal & Signature Block (Width: 60mm)
  const sigBoxWidth = contentWidth - certBoxWidth - 4; // 60mm
  const sigX = margin + certBoxWidth + 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(sigX, y, sigBoxWidth, certBlockHeight, 2, 2, 'FD');

  // Vector Accountant Seal (Left inside sig box: X: sigX + 12, Y: y + 16.5)
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.5);
  doc.circle(sigX + 12, y + 16.5, 8.5);
  doc.circle(sigX + 12, y + 16.5, 7.3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(5, 150, 105);
  doc.text('CERTIFIED', sigX + 12, y + 14.5, { align: 'center' });
  doc.setFontSize(5.8);
  doc.text('AUDIT', sigX + 12, y + 17, { align: 'center' });
  doc.setFontSize(4.2);
  doc.text('RJ PRACTICE', sigX + 12, y + 19.5, { align: 'center' });

  // Signature Line on the right side of the box (X: sigX + 24 to sigX + 56, W: 32mm)
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sigX + 25, y + 20, sigX + 56, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('rishi Jha', sigX + 40.5, y + 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', sigX + 40.5, y + 27.2, { align: 'center' });
  doc.text('GST & TDS Accountant', sigX + 40.5, y + 30.2, { align: 'center' });

  // =========================================================================
  // 9. CLEAN EXECUTIVE FOOTER
  // =========================================================================
  const footerY = pageHeight - 14;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, rightX, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('rishi Jha · Professional GST and TDS Accountant · Verified Financial Record', margin, footerY + 1.5);

  const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19);
  doc.text(`Page 1 of 1 · Generated ${nowFormatted} UTC`, rightX, footerY + 1.5, { align: 'right' });

  // Save the PDF with a clean sanitized filename
  const cleanRef = (earning.referenceId || earning.id.slice(0, 8)).replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `Bill-${cleanRef}-${earning.date}.pdf`;
  doc.save(fileName);
}

export interface TaxComputationPDFData {
  baseAmount: number;
  gstType: 'intra' | 'inter';
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  grossAmount: number;
  tdsSection: string;
  tdsRate: number;
  tdsAmount: number;
  hasCess: boolean;
  cessAmount: number;
  netPayout: number;
  clientOrParty?: string;
  notes?: string;
  isRcm?: boolean;
  isHigherTds206?: boolean;
}

/**
 * Generates an official, statutory GST & TDS Tax Computation Voucher PDF
 * designed for rishi Jha · Professional GST and TDS Accountant.
 */
export function generateTaxComputationPDF(
  data: TaxComputationPDFData,
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
  const rightX = pageWidth - margin; // 196mm

  // Outer frames
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  doc.rect(7.5, 7.5, pageWidth - 15, pageHeight - 15);

  // Navy Top Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(6, 6, pageWidth - 12, 33, 'F');

  // Emerald Divider Line
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(6, 39, pageWidth - 12, 1.8, 'F');

  // Insignia Monogram
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(13, 11, 17, 17, 2.5, 2.5, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RJ', 21.5, 22.5, { align: 'center' });

  // Brand Name & Slogan
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('rishi Jha', 34, 18);

  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PROFESSIONAL GST AND TDS ACCOUNTANT', 34, 24);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Statutory Taxation · GST Compliance · TDS Audits · Financial Ledgers', 34, 29);

  // Right Header Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TAX COMPUTATION VOUCHER', rightX, 16.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const nowIsoDate = new Date().toISOString().slice(0, 10);
  doc.text(`COMPUTATION REF: RJ-TAX-${Date.now().toString().slice(-6)}`, rightX, 22.5, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.text(`DATE ISSUED: ${nowIsoDate}`, rightX, 27.5, { align: 'right' });

  // Status Strip
  let y = 44;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, rightX - margin, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, rightX - margin, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY COMPUTATION STATEMENT', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const supplySuffix = data.isRcm ? ' (REVERSE CHARGE / RCM)' : '';
  const tdsSuffix = data.isHigherTds206 ? ' [SEC 206AA HIGHER RATE]' : '';
  doc.text(
    `SUPPLY: ${data.gstType === 'intra' ? 'INTRA-STATE' : 'INTER-STATE'}${supplySuffix}  ·  TDS SEC: ${data.tdsSection}${tdsSuffix}`,
    rightX - 4,
    y + 7.5,
    { align: 'right' }
  );

  y += 18;

  // Party Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, rightX - margin, 20, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, rightX - margin, 20, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PARTY / CLIENT DETAILS:', margin + 4, y + 6);
  doc.text('ACCOUNTANT AUDIT CREDENTIALS:', margin + 95, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(data.clientOrParty || 'Direct Professional Engagement', margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(userEmail ? `Verified User: ${userEmail}` : 'Verified Ledger Account', margin + 4, y + 16.5);

  doc.setFont('helvetica', 'bold');
  doc.text('rishi Jha Practice Management', margin + 95, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('CBDT Circular No. 23/2017 Compliant Engine', margin + 95, y + 16.5);

  y += 26;

  // Computation Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, rightX - margin, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PARTICULARS / TAX COMPONENT', margin + 4, y + 5.5);
  doc.text('STATUTORY RATE', margin + 95, y + 5.5);
  doc.text('AMOUNT', rightX - 4, y + 5.5, { align: 'right' });

  y += 8;

  // Computation Table Rows
  const rows: { name: string; rate: string; amount: number; isDeduction?: boolean; isHighlight?: boolean }[] = [
    { name: '1. Base Commercial / Service Value (Excl. Tax)', rate: '100.00%', amount: data.baseAmount },
  ];

  if (data.totalGst > 0) {
    if (data.gstType === 'intra') {
      const halfRate = (data.gstRate / 2).toFixed(1).replace('.0', '');
      rows.push({ name: `2. Central GST (CGST @ ${halfRate}%)`, rate: `${halfRate}%`, amount: data.cgstAmount });
      rows.push({ name: `3. State / UT GST (SGST @ ${halfRate}%)`, rate: `${halfRate}%`, amount: data.sgstAmount });
    } else {
      rows.push({ name: `2. Integrated GST (IGST @ ${data.gstRate}%)`, rate: `${data.gstRate}%`, amount: data.igstAmount });
    }
  }

  rows.push({ name: 'Total Billed Gross Value (Base + GST)', rate: 'Gross', amount: data.grossAmount, isHighlight: true });

  if (data.tdsAmount > 0) {
    rows.push({
      name: `Less: TDS Withheld under Section ${data.tdsSection}`,
      rate: `${data.tdsRate}% on Base`,
      amount: data.tdsAmount,
      isDeduction: true,
    });
  }

  if (data.hasCess && data.cessAmount > 0) {
    rows.push({
      name: 'Less: Health & Education Cess on TDS (4%)',
      rate: '4% on TDS',
      amount: data.cessAmount,
      isDeduction: true,
    });
  }

  rows.forEach((r, idx) => {
    const rowH = 8.5;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, rightX - margin, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowH, rightX, y + rowH);

    doc.setFont('helvetica', r.isHighlight ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(r.isDeduction ? 225 : r.isHighlight ? 15 : 51, r.isDeduction ? 29 : r.isHighlight ? 23 : 65, r.isDeduction ? 72 : r.isHighlight ? 42 : 85);
    doc.text(r.name, margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(r.rate, margin + 95, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const prefix = r.isDeduction ? '-' : r.amount > 0 && idx > 0 && !r.isHighlight ? '+' : '';
    doc.text(`${prefix}${formatMoney(r.amount)}`, rightX - 4, y + 5.5, { align: 'right' });

    y += rowH;
  });

  // Net Receivable Highlight Box
  y += 4;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(margin, y, rightX - margin, 16, 2, 2, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, rightX - margin, 16, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('NET SETTLEMENT AMOUNT RECEIVABLE IN BANK:', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(4, 120, 87);
  doc.text('Take-home payout after GST addition and statutory TDS deduction', margin + 5, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.text(formatMoney(data.netPayout), rightX - 5, y + 10.5, { align: 'right' });

  y += 22;

  // Statutory Citation Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, rightX - margin, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, rightX - margin, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY DIRECT TAX & GST NOTES:', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '1. CBDT Circular No. 23/2017: TDS is strictly deducted on the value of goods or services excluding the Goods & Services Tax (GST) component, provided GST is indicated separately on the invoice.',
    margin + 4,
    y + 10.5,
    { maxWidth: rightX - margin - 8 }
  );
  doc.text(
    `2. Section ${data.tdsSection}: Deductor must deposit TDS by the 7th of the following month and issue Form 16A TDS certificate quarterly. PAN must be furnished to avoid Section 206AA higher deduction (20%).`,
    margin + 4,
    y + 17,
    { maxWidth: rightX - margin - 8 }
  );

  y += 30;

  // Signature Block
  const sigX = rightX - 60;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(sigX, y, 60, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(sigX, y, 60, 28, 2, 2, 'S');

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.circle(sigX + 12, y + 14, 8);
  doc.circle(sigX + 12, y + 14, 6.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(5, 150, 105);
  doc.text('CERTIFIED', sigX + 12, y + 12.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('TAX AUDIT', sigX + 12, y + 15, { align: 'center' });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(sigX + 24, y + 17, sigX + 56, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('rishi Jha', sigX + 40, y + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text('GST & TDS Accountant', sigX + 40, y + 24.5, { align: 'center' });

  // Footer
  const footerY = pageHeight - 14;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, rightX, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('rishi Jha · Professional GST and TDS Accountant · Computation Voucher', margin, footerY + 1.5);

  const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19);
  doc.text(`Generated ${nowFormatted} UTC`, rightX, footerY + 1.5, { align: 'right' });

  const fileName = `Tax-Computation-${Date.now()}.pdf`;
  doc.save(fileName);
}

