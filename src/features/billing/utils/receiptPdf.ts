import type { Payment } from '../types';

interface ReceiptAccount {
  accountName: string;
  accountEmail: string;
}

const ACCENT: [number, number, number] = [13, 148, 136];
const INK: [number, number, number] = [23, 23, 23];
const MUTE: [number, number, number] = [115, 115, 115];

function fmtAmount(payment: Pick<Payment, 'amount' | 'currency'>): string {
  if (payment.currency === 'PKR') return `Rs. ${payment.amount.toLocaleString('en-PK')}`;
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: payment.currency }).format(payment.amount);
}

function fmtLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Builds and downloads the receipt entirely in the browser — nothing is
 * uploaded or persisted. jsPDF is imported on demand so it never weighs
 * down the billing page bundle.
 */
export async function downloadReceiptPdf(payment: Payment, account: ReceiptAccount): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 22;

  // Brand header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...ACCENT);
  doc.text('AsaanRabta', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTE);
  doc.text('Payment receipt', pageWidth - margin, y, { align: 'right' });

  y += 6;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);

  // Receipt meta
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(...MUTE);
  doc.text(`Receipt no: ${payment.id}`, margin, y);
  y += 5;
  doc.text(`Issued: ${fmtLongDate(payment.paidAt ?? payment.createdAt)}`, margin, y);

  // Billed to
  y += 10;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed to', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  doc.text(account.accountName, margin, y);
  if (account.accountEmail) {
    y += 5;
    doc.setTextColor(...MUTE);
    doc.text(account.accountEmail, margin, y);
  }

  // Amount panel
  y += 12;
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTE);
  doc.text('AMOUNT PAID', margin + 6, y + 7);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text(fmtAmount(payment), margin + 6, y + 15);
  doc.setFont('helvetica', 'normal');

  // Detail rows
  y += 30;
  const rows: [string, string][] = [
    ['Status', humanize(payment.status)],
    ['Payment method', payment.method ? humanize(payment.method) : '—'],
    ['Reference', payment.reference ?? '—'],
    ['Currency', payment.currency],
  ];
  doc.setFontSize(9.5);
  for (const [label, value] of rows) {
    doc.setTextColor(...MUTE);
    doc.text(label, margin, y);
    doc.setTextColor(...INK);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...MUTE);
  doc.text(
    `Generated from AsaanRabta CRM on ${fmtLongDate(new Date().toISOString())}`,
    margin,
    doc.internal.pageSize.getHeight() - 12,
  );

  doc.save(`asaanrabta-receipt-${payment.id.slice(-8)}.pdf`);
}
