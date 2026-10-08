import jsPDF from 'jspdf';
import { Earning, SUPPORTED_CURRENCIES } from '../types';
import { formatHumanDate } from './dateUtils';

/**
 * Generates and downloads a clean, professional, corporate-grade PDF receipt for a single transaction.
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
  const currSym = currency.code === 'INR' ? 'INR ' : `${currency.symbol} `;

  const formatMoney = (amount: number) => {
    return `${currSym}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header Area
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('ProfitTrack', margin, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // Emerald text
  doc.text('DAILY FINANCIAL LEDGER', margin + 46, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Official Transaction Voucher & Payment Receipt', margin, 30);

  // Right Side Header (Receipt Info)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT RECEIPT', pageWidth - margin, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Voucher #: ${earning.referenceId || earning.id.slice(0, 10).toUpperCase()}`, pageWidth - margin, 26, {
    align: 'right',
  });
  doc.text(`Date Issued: ${earning.date}`, pageWidth - margin, 31, { align: 'right' });

  // Status Badge
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

  doc.roundedRect(pageWidth - margin - 35, 36, 35, 7, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    earning.paymentStatus.toUpperCase(),
    pageWidth - margin - 17.5,
    40.5,
    { align: 'center' }
  );

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(margin, 48, pageWidth - margin, 48);

  // 3. Billing & Payer Information Grid
  let y = 56;

  // Left Column: Client / Payer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / CLIENT', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(earning.clientName || 'General Client / Direct Client', margin, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Category: ${earning.category}`, margin, y + 11);
  if (userEmail) {
    doc.text(`Account: ${userEmail}`, margin, y + 16);
  }

  // Right Column: Payment Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT SPECIFICATIONS', pageWidth / 2 + 10, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Method: ${earning.paymentMethod || 'Bank Transfer'}`, pageWidth / 2 + 10, y + 6);
  doc.text(`Transaction Date: ${formatHumanDate(earning.date)}`, pageWidth / 2 + 10, y + 11);
  doc.text(`System ID: ${earning.id}`, pageWidth / 2 + 10, y + 16);

  // 4. Financial Line Items Table
  y = 82;

  // Table Header Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 9, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DESCRIPTION / LINE ITEM', margin + 4, y + 6);
  doc.text('CATEGORY / TYPE', margin + 90, y + 6);
  doc.text('AMOUNT', pageWidth - margin - 4, y + 6, { align: 'right' });

  // Row 1: Gross Amount
  y += 9;
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, y + 12, pageWidth - margin, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Gross Revenue / Contract Bill', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Gross Invoiced Value', margin + 4, y + 11);
  doc.text(earning.category, margin + 90, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(earning.grossAmount), pageWidth - margin - 4, y + 8, { align: 'right' });

  // Row 2: Deductions / Taxes
  y += 14;
  doc.line(margin, y + 12, pageWidth - margin, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(225, 29, 72); // Rose 600
  doc.text('Deductions / TDS / Taxes Withheld', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const deductionPct =
    earning.grossAmount > 0 ? ((earning.deductions / earning.grossAmount) * 100).toFixed(1) : '0';
  doc.text(`Tax Withholding & Platform Cuts (${deductionPct}%)`, margin + 4, y + 11);
  doc.text('Deduction / Withholding', margin + 90, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(225, 29, 72);
  doc.text(`-${formatMoney(earning.deductions)}`, pageWidth - margin - 4, y + 8, { align: 'right' });

  // 5. Net Settlement Grand Total Box
  y += 18;
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.6);
  doc.roundedRect(pageWidth - margin - 95, y, 95, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text('NET PAYOUT / SETTLED AMOUNT', pageWidth - margin - 88, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(earning.netAmount), pageWidth - margin - 6, y + 17, { align: 'right' });

  // 6. Notes & Work Remarks Section
  y += 32;
  if (earning.notes) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    
    // Calculate lines for notes
    const splitNotes = doc.splitTextToSize(earning.notes, contentWidth - 10);
    const boxHeight = Math.max(18, splitNotes.length * 5 + 10);
    
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('NOTES & WORK REMARKS:', margin + 5, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(splitNotes, margin + 5, y + 11);

    y += boxHeight + 8;
  }

  // 7. Security & Certification Box
  y = Math.max(y, 195);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('SYSTEM VERIFICATION & AUDIT INTEGRITY', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This financial voucher is generated automatically by ProfitTrack Daily. It certifies the recorded earning,',
    margin + 6,
    y + 12
  );
  doc.text(
    'gross revenue, applicable tax withholdings, and verified net settlement under your authenticated workspace.',
    margin + 6,
    y + 16
  );
  doc.text(
    `Cryptographic Record ID: ${earning.id} · Timestamp: ${earning.createdAt || earning.date}`,
    margin + 6,
    y + 20
  );

  // 8. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('ProfitTrack Daily · Built for Freelancers, Creators & Enterprises', margin, 285);
  doc.text(`Page 1 of 1 · Generated on ${new Date().toISOString().slice(0, 10)}`, pageWidth - margin, 285, {
    align: 'right',
  });

  // Save the PDF
  const cleanRef = (earning.referenceId || earning.id.slice(0, 8)).replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `Receipt-${cleanRef}-${earning.date}.pdf`;
  doc.save(fileName);
}
