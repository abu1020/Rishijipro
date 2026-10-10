import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import {
  generateTaxComputationPDF,
  TaxComputationPDFData,
} from '../utils/pdfReceiptGenerator';
import { useToast } from '../context/ToastContext';
import {
  Calculator,
  Percent,
  X,
  ArrowRight,
  Sparkles,
  Receipt,
  HelpCircle,
  Copy,
  Check,
  Plus,
  Download,
  Printer,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Coins,
  ArrowDownRight,
  ChevronDown,
  Search,
  Calendar,
  Bookmark,
  Trash2,
  Share2,
  Scale,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface GstTdsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToEarning?: (data: {
    grossAmount: number;
    deductions: number;
    category: string;
    notes: string;
  }) => void;
}

export type TdsCategory =
  | 'all'
  | 'professional'
  | 'contractor'
  | 'rent'
  | 'brokerage'
  | 'digital_goods'
  | 'interest'
  | 'other';

export interface TdsSectionDef {
  code: string;
  section: string;
  category: TdsCategory;
  label: string;
  description: string;
  defaultRate: number;
  threshold: number; // in INR
  thresholdText: string;
}

export const TDS_SECTIONS: TdsSectionDef[] = [
  {
    code: '194J-prof',
    section: '194J(a)',
    category: 'professional',
    label: '194J(a) Professional & Advisory Fees (10%)',
    description: 'Professional, legal, accounting, medical, architectural, management consultancy, and royalty fees.',
    defaultRate: 10,
    threshold: 30000,
    thresholdText: '₹30,000 / fiscal year',
  },
  {
    code: '194J-tech',
    section: '194J(b)',
    category: 'professional',
    label: '194J(b) Technical & IT Services (2%)',
    description: 'Fees for technical services (FTS), call center operations, software dev, routine IT maintenance.',
    defaultRate: 2,
    threshold: 30000,
    thresholdText: '₹30,000 / fiscal year',
  },
  {
    code: '194C-ind',
    section: '194C (Ind)',
    category: 'contractor',
    label: '194C Contractor: Individual / HUF (1%)',
    description: 'Works contract, civil works, advertising, transport, catering, sub-contracts for Individual/HUF payee.',
    defaultRate: 1,
    threshold: 30000,
    thresholdText: '₹30,000 single bill / ₹1,00,000 aggregate',
  },
  {
    code: '194C-co',
    section: '194C (Co)',
    category: 'contractor',
    label: '194C Contractor: Company / Firm / LLP (2%)',
    description: 'Contract payments to Companies, Partnership Firms, LLPs, or Corporate corporate entities.',
    defaultRate: 2,
    threshold: 30000,
    thresholdText: '₹30,000 single bill / ₹1,00,000 aggregate',
  },
  {
    code: '194H',
    section: '194H',
    category: 'brokerage',
    label: '194H Commission & Brokerage (5%)',
    description: 'Commission, brokerage, agency commission, real estate marketing agent fees, DSA commission.',
    defaultRate: 5,
    threshold: 15000,
    thresholdText: '₹15,000 / fiscal year',
  },
  {
    code: '194I-mach',
    section: '194I(a)',
    category: 'rent',
    label: '194I(a) Rent: Plant, Machinery & Equipment (2%)',
    description: 'Hire charges for equipment, tools, machinery, plant or technical computing equipment.',
    defaultRate: 2,
    threshold: 240000,
    thresholdText: '₹2,40,000 / fiscal year',
  },
  {
    code: '194I-land',
    section: '194I(b)',
    category: 'rent',
    label: '194I(b) Rent: Land, Building & Commercial Office (10%)',
    description: 'Commercial rent for land, building, office space, warehouse, or furniture fixtures.',
    defaultRate: 10,
    threshold: 240000,
    thresholdText: '₹2,40,000 / fiscal year',
  },
  {
    code: '194IB',
    section: '194IB',
    category: 'rent',
    label: '194IB Rent by Non-Audit Ind / HUF (5%)',
    description: 'Rent paid by non-audit Individual or HUF exceeding ₹50,000 per month.',
    defaultRate: 5,
    threshold: 50000,
    thresholdText: '₹50,000 / month',
  },
  {
    code: '194Q',
    section: '194Q',
    category: 'digital_goods',
    label: '194Q Purchase of Goods (0.1%)',
    description: 'Buyer turnover > ₹10 Cr purchasing goods exceeding ₹50 Lakhs in aggregate during the fiscal year.',
    defaultRate: 0.1,
    threshold: 5000000,
    thresholdText: '₹50,00,000 aggregate purchase',
  },
  {
    code: '194O',
    section: '194-O',
    category: 'digital_goods',
    label: '194-O E-Commerce Participant Payout (1%)',
    description: 'E-commerce operator deducting TDS on sale of goods/services facilitated via digital platform.',
    defaultRate: 1,
    threshold: 500000,
    thresholdText: '₹5,00,000 / fiscal year (Ind/HUF)',
  },
  {
    code: '194R',
    section: '194R',
    category: 'professional',
    label: '194R Business Perquisites & Benefits (10%)',
    description: 'Benefits, gifts, incentives or perquisites arising from business or exercise of a profession.',
    defaultRate: 10,
    threshold: 20000,
    thresholdText: '₹20,000 / fiscal year',
  },
  {
    code: '194S',
    section: '194S',
    category: 'digital_goods',
    label: '194S Virtual Digital Assets & Crypto Transfer (1%)',
    description: 'Payment on transfer of Virtual Digital Asset (VDA), cryptocurrency, token, or NFT.',
    defaultRate: 1,
    threshold: 50000,
    thresholdText: '₹50,000 / ₹10,000 threshold',
  },
  {
    code: '194M',
    section: '194M',
    category: 'contractor',
    label: '194M Personal Contract / Commission (5%)',
    description: 'Contract or commission payments by Individuals/HUF not liable for tax audit under 44AB.',
    defaultRate: 5,
    threshold: 5000000,
    thresholdText: '₹50,00,000 / fiscal year',
  },
  {
    code: '194A',
    section: '194A',
    category: 'interest',
    label: '194A Interest other than Securities (10%)',
    description: 'Interest on unsecured loans, advances, non-banking deposits, or promissory notes.',
    defaultRate: 10,
    threshold: 40000,
    thresholdText: '₹40,000 / fiscal year (₹50k sr. citizen)',
  },
  {
    code: '194DA',
    section: '194DA',
    category: 'other',
    label: '194DA Life Insurance Policy Payout (5%)',
    description: 'Taxable maturity amount on life insurance policy exceeding statutory exemption.',
    defaultRate: 5,
    threshold: 100000,
    thresholdText: '₹1,00,000 / fiscal year',
  },
  {
    code: '194K',
    section: '194K',
    category: 'other',
    label: '194K Mutual Fund Income / Dividend (10%)',
    description: 'Income in respect of units of a mutual fund specified under Section 10(23D).',
    defaultRate: 10,
    threshold: 5000,
    thresholdText: '₹5,000 / fiscal year',
  },
  {
    code: '195',
    section: '195',
    category: 'professional',
    label: '195 Non-Resident / Foreign Remittance (20%)',
    description: 'Payments to non-residents / foreign corporations subject to DTAA treaty rates.',
    defaultRate: 20,
    threshold: 0,
    thresholdText: 'No minimum threshold',
  },
];

const INDUSTRY_PRESETS = [
  {
    label: 'Software / Freelancer',
    desc: '18% GST + 10% 194J(a) TDS',
    amount: '50000',
    gstRate: 18,
    gstType: 'intra' as const,
    tdsSection: '194J(a)',
    tdsRate: 10,
    applyGst: true,
    applyTds: true,
    isRcm: false,
  },
  {
    label: 'IT / Tech Services',
    desc: '18% GST + 2% 194J(b) TDS',
    amount: '100000',
    gstRate: 18,
    gstType: 'intra' as const,
    tdsSection: '194J(b)',
    tdsRate: 2,
    applyGst: true,
    applyTds: true,
    isRcm: false,
  },
  {
    label: 'Works Contractor',
    desc: '18% GST + 1% 194C TDS',
    amount: '150000',
    gstRate: 18,
    gstType: 'intra' as const,
    tdsSection: '194C (Ind)',
    tdsRate: 1,
    applyGst: true,
    applyTds: true,
    isRcm: false,
  },
  {
    label: 'Commercial Office Rent',
    desc: '18% GST + 10% 194I(b) TDS',
    amount: '65000',
    gstRate: 18,
    gstType: 'intra' as const,
    tdsSection: '194I(b)',
    tdsRate: 10,
    applyGst: true,
    applyTds: true,
    isRcm: false,
  },
  {
    label: 'Inter-State Consultant',
    desc: '18% IGST + 10% 194J TDS',
    amount: '75000',
    gstRate: 18,
    gstType: 'inter' as const,
    tdsSection: '194J(a)',
    tdsRate: 10,
    applyGst: true,
    applyTds: true,
    isRcm: false,
  },
  {
    label: 'Advocate / Legal (RCM)',
    desc: '18% RCM GST + 10% 194J TDS',
    amount: '80000',
    gstRate: 18,
    gstType: 'intra' as const,
    tdsSection: '194J(a)',
    tdsRate: 10,
    applyGst: true,
    applyTds: true,
    isRcm: true,
  },
  {
    label: 'Direct Professional (Exempt)',
    desc: '0% GST + 10% 194J TDS',
    amount: '40000',
    gstRate: 0,
    gstType: 'intra' as const,
    tdsSection: '194J(a)',
    tdsRate: 10,
    applyGst: false,
    applyTds: true,
    isRcm: false,
  },
];

interface SavedScenario {
  id: string;
  name: string;
  date: string;
  baseAmount: number;
  clientOrParty: string;
  gstRate: number;
  gstType: 'intra' | 'inter';
  tdsSection: string;
  tdsRate: number;
  isRcm: boolean;
  netPayout: number;
}

const STORAGE_SAVED_SCENARIOS = 'rj_tax_saved_scenarios_v1';

export const GstTdsCalculatorModal: React.FC<GstTdsCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyToEarning,
}) => {
  const { currency, user } = useAuth();
  const { success, error } = useToast();

  // Modal Sub-Tabs: 'calculator' | 'advance-tax' | 'saved'
  const [activeTab, setActiveTab] = useState<'calculator' | 'advance-tax' | 'saved'>('calculator');

  // Mode: 'forward' (Base -> Gross + GST - TDS) or 'reverse' (Total Inclusive -> Extract Base & GST)
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse'>('forward');
  const [baseInput, setBaseInput] = useState<string>('50000');
  const [clientOrParty, setClientOrParty] = useState<string>('');

  // GST State
  const [applyGst, setApplyGst] = useState<boolean>(true);
  const [gstType, setGstType] = useState<'intra' | 'inter'>('intra'); // intra = CGST+SGST, inter = IGST
  const [gstRate, setGstRate] = useState<number>(18);
  const [isCustomGst, setIsCustomGst] = useState<boolean>(false);
  const [customGstRate, setCustomGstRate] = useState<string>('');
  const [isRcm, setIsRcm] = useState<boolean>(false); // Reverse Charge Mechanism (Sec 9(3)/9(4))

  // TDS State
  const [applyTds, setApplyTds] = useState<boolean>(true);
  const [selectedSectionCode, setSelectedSectionCode] = useState<string>('194J-prof');
  const [tdsSection, setTdsSection] = useState<string>('194J(a)');
  const [tdsRate, setTdsRate] = useState<number>(10);
  const [isCustomTds, setIsCustomTds] = useState<boolean>(false);
  const [customTdsRate, setCustomTdsRate] = useState<string>('');
  const [customTdsSection, setCustomTdsSection] = useState<string>('');
  const [applyCess, setApplyCess] = useState<boolean>(false); // 4% Health & Education Cess on TDS
  const [isHigherTds206, setIsHigherTds206] = useState<boolean>(false); // Section 206AA / 206AB Higher Rate (20%)

  // TDS Search & Filter
  const [tdsSearchQuery, setTdsSearchQuery] = useState<string>('');
  const [tdsCategoryFilter, setTdsCategoryFilter] = useState<TdsCategory>('all');

  // Saved Scenarios
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioNameInput, setScenarioNameInput] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Load saved scenarios from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_SCENARIOS);
      if (stored) {
        setSavedScenarios(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveScenariosToStorage = (list: SavedScenario[]) => {
    setSavedScenarios(list);
    try {
      localStorage.setItem(STORAGE_SAVED_SCENARIOS, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const rawAmount = parseFloat(baseInput) || 0;

  // Compute Active GST Rate
  const activeGstRate = applyGst
    ? isCustomGst
      ? parseFloat(customGstRate) || 0
      : gstRate
    : 0;

  // Base TDS Rate before 206AA
  const baseSelectedTdsRate = isCustomTds
    ? parseFloat(customTdsRate) || 0
    : tdsRate;

  // Higher TDS Rate under Section 206AA (flat 20% or twice normal rate, whichever is higher)
  const activeTdsRate = applyTds
    ? isHigherTds206
      ? Math.max(20, baseSelectedTdsRate * 2)
      : baseSelectedTdsRate
    : 0;

  const activeTdsSection = isCustomTds
    ? customTdsSection || 'Custom'
    : tdsSection;

  let baseAmount = 0;
  let gstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let grossWithGst = 0;
  let baseTdsAmount = 0;
  let cessAmount = 0;
  let totalTdsAmount = 0;
  let netPayout = 0;

  if (calcMode === 'forward') {
    baseAmount = Math.max(0, rawAmount);
    gstAmount = applyGst ? (baseAmount * activeGstRate) / 100 : 0;
    grossWithGst = baseAmount + gstAmount;

    // CBDT Circular No. 23/2017: TDS is strictly computed on Base Value excluding GST
    baseTdsAmount = applyTds ? (baseAmount * activeTdsRate) / 100 : 0;
    cessAmount = applyCess ? baseTdsAmount * 0.04 : 0;
    totalTdsAmount = baseTdsAmount + cessAmount;

    // Under Reverse Charge Mechanism (RCM), buyer deposits GST to government;
    // supplier bank settlement = Base Commercial Value - TDS.
    // Under Forward Charge, supplier receives Gross with GST - TDS.
    if (isRcm) {
      netPayout = baseAmount - totalTdsAmount;
    } else {
      netPayout = grossWithGst - totalTdsAmount;
    }
  } else {
    // Reverse mode: rawAmount is the Total Gross Invoiced with GST
    grossWithGst = Math.max(0, rawAmount);
    if (applyGst && activeGstRate > 0) {
      baseAmount = (grossWithGst * 100) / (100 + activeGstRate);
      gstAmount = grossWithGst - baseAmount;
    } else {
      baseAmount = grossWithGst;
      gstAmount = 0;
    }

    baseTdsAmount = applyTds ? (baseAmount * activeTdsRate) / 100 : 0;
    cessAmount = applyCess ? baseTdsAmount * 0.04 : 0;
    totalTdsAmount = baseTdsAmount + cessAmount;

    if (isRcm) {
      netPayout = baseAmount - totalTdsAmount;
    } else {
      netPayout = grossWithGst - totalTdsAmount;
    }
  }

  // Split GST into CGST+SGST or IGST
  if (gstType === 'intra') {
    cgstAmount = gstAmount / 2;
    sgstAmount = gstAmount / 2;
    igstAmount = 0;
  } else {
    cgstAmount = 0;
    sgstAmount = 0;
    igstAmount = gstAmount;
  }

  const activeSectionDef = TDS_SECTIONS.find((s) => s.code === selectedSectionCode);
  const isBelowThreshold =
    applyTds && activeSectionDef && baseAmount > 0 && baseAmount < activeSectionDef.threshold;

  // Handlers
  const handleSelectSection = (code: string) => {
    setSelectedSectionCode(code);
    setIsCustomTds(false);
    const def = TDS_SECTIONS.find((s) => s.code === code);
    if (def) {
      setTdsSection(def.section);
      setTdsRate(def.defaultRate);
    }
  };

  const handleApplyPreset = (p: typeof INDUSTRY_PRESETS[0]) => {
    setBaseInput(p.amount);
    setCalcMode('forward');
    setApplyGst(p.applyGst);
    setGstRate(p.gstRate);
    setGstType(p.gstType);
    setIsCustomGst(false);
    setIsRcm(p.isRcm || false);
    setApplyTds(p.applyTds);
    setTdsSection(p.tdsSection);
    setTdsRate(p.tdsRate);
    setIsCustomTds(false);
    setIsHigherTds206(false);
    const matched = TDS_SECTIONS.find((s) => s.section === p.tdsSection);
    if (matched) setSelectedSectionCode(matched.code);
  };

  const handleApply = () => {
    if (onApplyToEarning) {
      const gstDetails = applyGst
        ? isRcm
          ? `GST (RCM - Payable by Recipient) @ ${activeGstRate}%: ${formatCurrency(gstAmount, currency)}`
          : gstType === 'intra'
          ? `CGST ${(activeGstRate / 2).toFixed(1)}%: +${formatCurrency(cgstAmount, currency)}, SGST ${(activeGstRate / 2).toFixed(1)}%: +${formatCurrency(sgstAmount, currency)}`
          : `IGST ${activeGstRate}%: +${formatCurrency(igstAmount, currency)}`
        : 'GST Exempt';

      const notes = `Statutory Tax Computation (rishi Jha Engine):
Base Commercial Value: ${formatCurrency(baseAmount, currency)}
${gstDetails} -> Gross Invoice: ${formatCurrency(grossWithGst, currency)}
TDS Sec ${activeTdsSection} (${activeTdsRate}%): -${formatCurrency(totalTdsAmount, currency)}${applyCess ? ' (incl. 4% Cess)' : ''}${isHigherTds206 ? ' [Sec 206AA Penalty Rate]' : ''} (as per CBDT Cir. 23/2017)
Net Bank Settlement: ${formatCurrency(netPayout, currency)}${isRcm ? ' (RCM: GST paid by buyer directly)' : ''}`;

      onApplyToEarning({
        grossAmount: Math.round(grossWithGst * 100) / 100,
        deductions: Math.round(totalTdsAmount * 100) / 100,
        category: activeTdsSection.includes('194J')
          ? 'Professional Services'
          : activeTdsSection.includes('194C')
          ? 'Contractor Income'
          : activeTdsSection.includes('194I')
          ? 'Rental Income'
          : activeTdsSection.includes('194H')
          ? 'Commission & Agency'
          : 'Consulting & Advisory',
        notes,
      });
      onClose();
    }
  };

  const handleCopySummary = () => {
    const text = `rishi Jha · Statutory GST & TDS Computation Voucher
--------------------------------------------------
Party: ${clientOrParty || 'Direct Engagement'}
Supply: ${gstType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}${isRcm ? ' [Reverse Charge / RCM]' : ''}
Base Commercial Value: ${formatCurrency(baseAmount, currency)}
${
  applyGst
    ? isRcm
      ? `GST Liability @ ${activeGstRate}%: ${formatCurrency(gstAmount, currency)} (Payable by Recipient via RCM)`
      : gstType === 'intra'
      ? `CGST @ ${(activeGstRate / 2).toFixed(1)}%: +${formatCurrency(cgstAmount, currency)}
SGST @ ${(activeGstRate / 2).toFixed(1)}%: +${formatCurrency(sgstAmount, currency)}`
      : `IGST @ ${activeGstRate}%: +${formatCurrency(igstAmount, currency)}`
    : 'GST: Exempt (Nil)'
}
Total Invoiced Gross: ${formatCurrency(grossWithGst, currency)}
Less: TDS Sec ${activeTdsSection} @ ${activeTdsRate}%: -${formatCurrency(totalTdsAmount, currency)}${
      applyCess ? ' (with 4% Cess)' : ''
    }${isHigherTds206 ? ' [Sec 206AA Higher Deduction 20%]' : ''}
(Statutory TDS computed on Base as per CBDT Circular No. 23/2017)
--------------------------------------------------
Net Bank Settlement Receivable: ${formatCurrency(netPayout, currency)}${isRcm ? ' (GST remitted directly by Recipient)' : ''}
--------------------------------------------------
Calculated by: rishi Jha · Professional GST and TDS Accountant`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    success('Tax computation voucher copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyWhatsApp = () => {
    const text = `*rishi Jha · GST & TDS Tax Computation Voucher* 📄
━━━━━━━━━━━━━━━━━━━━
*Party / Client:* ${clientOrParty || 'Direct Engagement'}
*Supply:* ${gstType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}${isRcm ? ' ⚠️ *(Reverse Charge / RCM)*' : ''}
*Base Commercial Value:* ${formatCurrency(baseAmount, currency)}
${
  applyGst
    ? isRcm
      ? `*GST @ ${activeGstRate}%:* ${formatCurrency(gstAmount, currency)} *(Directly payable by Recipient to Govt)*`
      : gstType === 'intra'
      ? `*CGST @ ${(activeGstRate / 2).toFixed(1)}%:* +${formatCurrency(cgstAmount, currency)}\n*SGST @ ${(activeGstRate / 2).toFixed(1)}%:* +${formatCurrency(sgstAmount, currency)}`
      : `*IGST @ ${activeGstRate}%:* +${formatCurrency(igstAmount, currency)}`
    : '*GST:* Exempt (Nil)'
}
*Total Invoiced Gross:* ${formatCurrency(grossWithGst, currency)}
*Less TDS (Sec ${activeTdsSection} @ ${activeTdsRate}%):* -${formatCurrency(totalTdsAmount, currency)}${
      applyCess ? ' *(incl. 4% Cess)*' : ''
    }${isHigherTds206 ? ' *(Sec 206AA Higher Rate)*' : ''}
━━━━━━━━━━━━━━━━━━━━
*Net Bank Settlement Receivable:* *${formatCurrency(netPayout, currency)}*
━━━━━━━━━━━━━━━━━━━━
_Statutory compliance as per CBDT Circular No. 23/2017_
_Practice Engine: rishi Jha · Professional GST and TDS Accountant_`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    success('WhatsApp formatted voucher copied!');
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPdf(true);
      const pdfData: TaxComputationPDFData = {
        baseAmount: Math.round(baseAmount * 100) / 100,
        gstType,
        gstRate: activeGstRate,
        cgstAmount: Math.round(cgstAmount * 100) / 100,
        sgstAmount: Math.round(sgstAmount * 100) / 100,
        igstAmount: Math.round(igstAmount * 100) / 100,
        totalGst: Math.round(gstAmount * 100) / 100,
        grossAmount: Math.round(grossWithGst * 100) / 100,
        tdsSection: activeTdsSection,
        tdsRate: activeTdsRate,
        tdsAmount: Math.round(baseTdsAmount * 100) / 100,
        hasCess: applyCess,
        cessAmount: Math.round(cessAmount * 100) / 100,
        netPayout: Math.round(netPayout * 100) / 100,
        clientOrParty: clientOrParty.trim() || undefined,
        isRcm,
        isHigherTds206,
      };

      generateTaxComputationPDF(pdfData, currency, user?.email || '');
      success('Official GST & TDS Computation Voucher PDF downloaded!');
    } catch (err: unknown) {
      console.error('Failed to generate Tax Computation PDF:', err);
      error('Failed to generate Tax Computation PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSaveScenario = () => {
    const name = scenarioNameInput.trim() || clientOrParty.trim() || `Tax Plan ${savedScenarios.length + 1}`;
    const newScenario: SavedScenario = {
      id: `sc_${Date.now()}`,
      name,
      date: new Date().toISOString().slice(0, 10),
      baseAmount,
      clientOrParty,
      gstRate: activeGstRate,
      gstType,
      tdsSection: activeTdsSection,
      tdsRate: activeTdsRate,
      isRcm,
      netPayout,
    };
    const updated = [newScenario, ...savedScenarios];
    saveScenariosToStorage(updated);
    setScenarioNameInput('');
    success(`Saved template "${name}"!`);
  };

  const handleLoadScenario = (sc: SavedScenario) => {
    setBaseInput(String(sc.baseAmount));
    setClientOrParty(sc.clientOrParty || '');
    setCalcMode('forward');
    setApplyGst(sc.gstRate > 0);
    setGstRate(sc.gstRate);
    setGstType(sc.gstType);
    setIsRcm(sc.isRcm || false);
    setTdsSection(sc.tdsSection);
    setTdsRate(sc.tdsRate);
    setIsCustomGst(false);
    setIsCustomTds(false);
    setIsHigherTds206(false);
    const matched = TDS_SECTIONS.find((s) => s.section === sc.tdsSection);
    if (matched) setSelectedSectionCode(matched.code);
    setActiveTab('calculator');
    success(`Loaded scenario "${sc.name}"!`);
  };

  const handleDeleteScenario = (id: string) => {
    const updated = savedScenarios.filter((s) => s.id !== id);
    saveScenariosToStorage(updated);
    success('Saved scenario deleted.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter TDS sections based on search query and category
  const filteredTdsSections = TDS_SECTIONS.filter((s) => {
    const matchesCategory = tdsCategoryFilter === 'all' || s.category === tdsCategoryFilter;
    if (!matchesCategory) return false;
    if (!tdsSearchQuery.trim()) return true;
    const q = tdsSearchQuery.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  // Advance Tax Installment Calculations
  // Section 208 / 211 of Income Tax Act:
  // Presumptive income under 44ADA (50% profit for professionals) or standard estimated tax
  const estimatedAnnualBase = baseAmount > 0 ? baseAmount * 4 : 400000; // default benchmark
  const presumptiveTaxableIncome = estimatedAnnualBase * 0.5; // Section 44ADA 50%
  // Rough estimate of tax on 44ADA under New Regime / Standard rates
  const estimatedAnnualTaxLiability = Math.max(0, presumptiveTaxableIncome * 0.1); // ~10% effective tax

  const advanceTaxSchedule = [
    {
      quarter: '1st Installment (Q1)',
      dueDate: '15 June',
      cumulativePercent: 15,
      cumulativeAmount: (estimatedAnnualTaxLiability * 0.15),
      quarterlyAmount: (estimatedAnnualTaxLiability * 0.15),
      note: 'Minimum 15% of advance tax liability',
    },
    {
      quarter: '2nd Installment (Q2)',
      dueDate: '15 September',
      cumulativePercent: 45,
      cumulativeAmount: (estimatedAnnualTaxLiability * 0.45),
      quarterlyAmount: (estimatedAnnualTaxLiability * 0.30),
      note: 'Minimum 45% cumulative tax liability',
    },
    {
      quarter: '3rd Installment (Q3)',
      dueDate: '15 December',
      cumulativePercent: 75,
      cumulativeAmount: (estimatedAnnualTaxLiability * 0.75),
      quarterlyAmount: (estimatedAnnualTaxLiability * 0.30),
      note: 'Minimum 75% cumulative tax liability',
    },
    {
      quarter: '4th Installment (Q4)',
      dueDate: '15 March',
      cumulativePercent: 100,
      cumulativeAmount: estimatedAnnualTaxLiability,
      quarterlyAmount: (estimatedAnnualTaxLiability * 0.25),
      note: '100% of advance tax liability',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        title="Click outside to close (Esc)"
      />

      {/* Calculator Dialog Card */}
      <div className="relative liquid-glass-elevated border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full z-10 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-fadeIn print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Specular Highlight Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none print:hidden" />

        {/* Top Header */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-slate-950/40 backdrop-blur-md flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl liquid-glass-emerald text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Calculator className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  GST & TDS Statutory Tax Calculator
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                  CBDT Cir. 23/2017
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                rishi Jha · Professional GST and TDS Accountant Practice Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl liquid-glass-button text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Calculation"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl liquid-glass-button text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-white/[0.06] bg-slate-950/20 flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'liquid-glass-pill text-white border-white/20 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tax Voucher & Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advance-tax')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'advance-tax'
                ? 'liquid-glass-pill text-white border-white/20 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Advance Tax Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'liquid-glass-pill text-white border-white/20 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved Scenarios ({savedScenarios.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* TAB 1: TAX VOUCHER & CALCULATOR */}
          {activeTab === 'calculator' && (
            <>
              {/* Quick Industry Presets Carousel */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Industry Calculation Presets</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click to auto-populate</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  {INDUSTRY_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1.5 rounded-xl liquid-glass-button hover:border-emerald-500/40 text-left shrink-0 transition-all cursor-pointer group"
                    >
                      <span className="block text-xs font-semibold text-white group-hover:text-emerald-300">
                        {p.label}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Switcher: Forward vs Reverse */}
              <div className="grid grid-cols-2 p-1 rounded-xl liquid-glass-subtle">
                <button
                  type="button"
                  onClick={() => setCalcMode('forward')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    calcMode === 'forward'
                      ? 'liquid-glass-pill text-white shadow-sm font-bold border-white/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Base Value → Invoiced Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('reverse')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    calcMode === 'reverse'
                      ? 'liquid-glass-pill text-white shadow-sm font-bold border-white/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Total Gross → Extract Base & GST</span>
                </button>
              </div>

              {/* Amount & Client Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>
                      {calcMode === 'forward'
                        ? 'Base Commercial / Service Value (Excl. Tax)'
                        : 'Total Invoiced Bill Amount (Incl. GST)'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">({currency})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={baseInput}
                      onChange={(e) => setBaseInput(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-3.5 pr-14 py-2.5 rounded-xl liquid-glass-input text-white text-base font-mono font-bold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-emerald-400">
                      {currency}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 truncate">
                    Client / Payee Entity (Optional)
                  </label>
                  <input
                    type="text"
                    value={clientOrParty}
                    onChange={(e) => setClientOrParty(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2.5 rounded-xl liquid-glass-input text-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* SECTION 1: GST (Goods & Services Tax) CONTROLS */}
              <div className="p-4 rounded-2xl liquid-glass-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applyGst}
                      onChange={(e) => setApplyGst(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">Apply GST (Goods & Services Tax)</span>
                  </label>

                  {applyGst && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">Total GST:</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        +{formatCurrency(gstAmount, currency)}
                      </span>
                    </div>
                  )}
                </div>

                {applyGst && (
                  <div className="space-y-3 pt-1 border-t border-white/[0.06]">
                    {/* Supply Type & RCM Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-300 font-medium">Supply Type:</span>
                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setGstType('intra')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            gstType === 'intra'
                              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Intra-State (CGST + SGST)
                        </button>
                        <button
                          type="button"
                          onClick={() => setGstType('inter')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            gstType === 'inter'
                              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Inter-State (IGST)
                        </button>
                      </div>
                    </div>

                    {/* GST Rate Preset Buttons */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>Statutory GST Slabs:</span>
                        {isCustomGst ? (
                          <button
                            type="button"
                            onClick={() => setIsCustomGst(false)}
                            className="text-cyan-400 hover:underline cursor-pointer"
                          >
                            Use standard slabs
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsCustomGst(true)}
                            className="text-cyan-400 hover:underline cursor-pointer"
                          >
                            Custom GST %
                          </button>
                        )}
                      </div>

                      {!isCustomGst ? (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {[0, 3, 5, 12, 18, 28].map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => setGstRate(rate)}
                              className={`py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                                gstRate === rate
                                  ? 'liquid-glass-cyan text-white shadow-md'
                                  : 'liquid-glass-button text-slate-300'
                              }`}
                            >
                              {rate}%
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter custom GST rate %"
                            value={customGstRate}
                            onChange={(e) => setCustomGstRate(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl liquid-glass-input text-white text-xs font-mono font-semibold"
                          />
                          <span className="text-xs font-mono text-slate-400">%</span>
                        </div>
                      )}
                    </div>

                    {/* Reverse Charge Mechanism (RCM - Section 9(3)/9(4)) Toggle */}
                    <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={isRcm}
                          onChange={(e) => setIsRcm(e.target.checked)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold text-white">Reverse Charge Mechanism (RCM)</span>
                      </label>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        Sec 9(3)/9(4) CGST
                      </span>
                    </div>

                    {isRcm && (
                      <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-start gap-2">
                        <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                        <span>
                          RCM Active: GST liability is payable directly by the recipient (buyer) to the government.
                          Your net bank settlement is Base Value less TDS (GST is not paid to you).
                        </span>
                      </div>
                    )}

                    {/* GST Split Preview */}
                    {gstAmount > 0 && (
                      <div className="p-2 rounded-xl liquid-glass-subtle flex items-center justify-between text-[11px] font-mono text-slate-300">
                        {gstType === 'intra' ? (
                          <>
                            <span>
                              CGST ({(activeGstRate / 2).toFixed(1)}%):{' '}
                              <strong className="text-cyan-300">{formatCurrency(cgstAmount, currency)}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              SGST ({(activeGstRate / 2).toFixed(1)}%):{' '}
                              <strong className="text-cyan-300">{formatCurrency(sgstAmount, currency)}</strong>
                            </span>
                          </>
                        ) : (
                          <span>
                            IGST ({activeGstRate}%):{' '}
                            <strong className="text-cyan-300">{formatCurrency(igstAmount, currency)}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: TDS (Tax Deducted at Source) CONTROLS */}
              <div className="p-4 rounded-2xl liquid-glass-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applyTds}
                      onChange={(e) => setApplyTds(e.target.checked)}
                      className="rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">
                      TDS Deduction (Tax Deducted at Source)
                    </span>
                  </label>

                  {applyTds && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">Total TDS:</span>
                      <span className="text-xs font-mono text-rose-400 font-bold">
                        -{formatCurrency(totalTdsAmount, currency)}
                      </span>
                    </div>
                  )}
                </div>

                {applyTds && (
                  <div className="space-y-3 pt-1 border-t border-white/[0.06]">
                    {/* TDS Category Filters & Search */}
                    {!isCustomTds && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span className="font-semibold">Income Tax Section Code:</span>
                          <button
                            type="button"
                            onClick={() => setIsCustomTds(true)}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Custom Section
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={tdsSearchQuery}
                            onChange={(e) => setTdsSearchQuery(e.target.value)}
                            placeholder="Search section (e.g. 194J, rent, contractor, crypto, goods)..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl liquid-glass-input text-white text-xs"
                          />
                        </div>

                        {/* Category Chips */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'professional', label: '194J Professional' },
                            { id: 'contractor', label: '194C Contractor' },
                            { id: 'rent', label: '194I Rent' },
                            { id: 'brokerage', label: '194H Commission' },
                            { id: 'digital_goods', label: 'Digital & Goods' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setTdsCategoryFilter(cat.id as TdsCategory)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                tdsCategoryFilter === cat.id
                                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                                  : 'text-slate-400 hover:text-white bg-white/[0.04]'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Section Selector */}
                        <select
                          value={selectedSectionCode}
                          onChange={(e) => handleSelectSection(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white text-xs font-medium cursor-pointer"
                        >
                          {filteredTdsSections.map((s) => (
                            <option key={s.code} value={s.code} className="bg-slate-900 text-white">
                              {s.label} — {s.description.slice(0, 50)}...
                            </option>
                          ))}
                        </select>

                        {activeSectionDef && (
                          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10 text-[11px] space-y-1">
                            <p className="text-slate-300 leading-relaxed">
                              {activeSectionDef.description}
                            </p>
                            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] pt-1 border-t border-white/[0.06]">
                              <span>Statutory Threshold: {activeSectionDef.thresholdText}</span>
                              <span>Base Rate: {activeSectionDef.defaultRate}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isCustomTds && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
                          <span className="font-semibold">Custom Section Details:</span>
                          <button
                            type="button"
                            onClick={() => setIsCustomTds(false)}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Back to Standard Sections
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Section (e.g. 194-O)"
                            value={customTdsSection}
                            onChange={(e) => setCustomTdsSection(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white text-xs"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="Rate %"
                              value={customTdsRate}
                              onChange={(e) => setCustomTdsRate(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-xl liquid-glass-input text-white text-xs font-mono"
                            />
                            <span className="text-xs font-mono text-slate-400">%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 206AA / 206AB Penalty Higher Rate (20%) Toggle */}
                    <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={isHigherTds206}
                          onChange={(e) => setIsHigherTds206(e.target.checked)}
                          className="rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold text-rose-300">
                          Section 206AA / 206AB Higher Rate (20%)
                        </span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">No PAN / Non-Filer</span>
                    </div>

                    {isHigherTds206 && (
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <span>
                          Section 206AA Enforced: 20% flat TDS applied because PAN is unverified or deductor is a specified non-filer under Section 206AB.
                        </span>
                      </div>
                    )}

                    {/* Optional Health & Education Cess (4%) */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={applyCess}
                          onChange={(e) => setApplyCess(e.target.checked)}
                          className="rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                        />
                        <span>Add 4% Health & Education Cess on TDS</span>
                      </label>
                      {applyCess && (
                        <span className="text-[11px] font-mono text-rose-400">
                          +{formatCurrency(cessAmount, currency)} cess
                        </span>
                      )}
                    </div>

                    {/* Threshold warning notice */}
                    {isBelowThreshold && (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <span>
                          Notice: Base amount is below Section {activeTdsSection} statutory threshold of{' '}
                          {activeSectionDef?.thresholdText}. TDS deduction is typically exempt unless cumulative annual invoices exceed this limit.
                        </span>
                      </div>
                    )}

                    {/* Statutory Circular Reference */}
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 italic">
                      <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>
                        CBDT Circular No. 23/2017: TDS is deducted strictly on Base Commercial Value excluding the GST component.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: COMPREHENSIVE VOUCHER BREAKDOWN TABLE */}
              <div className="p-4 rounded-2xl liquid-glass border-emerald-500/30 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Statutory Computation Breakdown</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {gstType === 'intra' ? 'CGST+SGST' : 'IGST'} · Sec {activeTdsSection}
                    {isRcm ? ' · RCM' : ''}
                  </span>
                </div>

                {/* Line items */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">1. Base Commercial Value (Excl. Tax):</span>
                  <span className="font-mono font-semibold text-white">
                    {formatCurrency(baseAmount, currency)}
                  </span>
                </div>

                {applyGst && !isRcm && gstType === 'intra' && (
                  <>
                    <div className="flex items-center justify-between text-xs text-cyan-300">
                      <span>2. Central GST (CGST @ {(activeGstRate / 2).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">
                        +{formatCurrency(cgstAmount, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-cyan-300">
                      <span>3. State / UT GST (SGST @ {(activeGstRate / 2).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">
                        +{formatCurrency(sgstAmount, currency)}
                      </span>
                    </div>
                  </>
                )}

                {applyGst && !isRcm && gstType === 'inter' && (
                  <div className="flex items-center justify-between text-xs text-cyan-300">
                    <span>2. Integrated GST (IGST @ {activeGstRate}%):</span>
                    <span className="font-mono font-semibold">
                      +{formatCurrency(igstAmount, currency)}
                    </span>
                  </div>
                )}

                {applyGst && isRcm && (
                  <div className="flex items-center justify-between text-xs text-cyan-300">
                    <span>2. GST under Reverse Charge (RCM @ {activeGstRate}%):</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(gstAmount, currency)} (Paid by Recipient)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-semibold py-1 border-t border-b border-white/[0.06]">
                  <span className="text-slate-200">Total Billed Gross Invoice (Base + GST):</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(grossWithGst, currency)}
                  </span>
                </div>

                {applyTds && (
                  <div className="flex items-center justify-between text-xs text-rose-300">
                    <span>
                      Less: TDS Sec {activeTdsSection} @ {activeTdsRate}%
                      {applyCess ? ' (+4% Cess)' : ''}
                      {isHigherTds206 ? ' [206AA]' : ''}:
                    </span>
                    <span className="font-mono font-semibold">
                      -{formatCurrency(totalTdsAmount, currency)}
                    </span>
                  </div>
                )}

                {/* Bottom Final Bank Settlement */}
                <div className="pt-2.5 border-t border-white/[0.1] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                      Net Bank Settlement Receivable:
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Direct bank credit amount after GST {isRcm ? 'RCM disclosure' : 'addition'} & statutory TDS
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {formatCurrency(netPayout, currency)}
                    </div>
                    {baseAmount > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Net: {((netPayout / baseAmount) * 100).toFixed(1)}% of base
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Scenario Quick Bar */}
              <div className="p-3 rounded-xl liquid-glass-subtle flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Save calculation scenario name (e.g. Acme Tech Retainer)..."
                  value={scenarioNameInput}
                  onChange={(e) => setScenarioNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl liquid-glass-input text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: ADVANCE TAX SCHEDULE */}
          {activeTab === 'advance-tax' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl liquid-glass border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Quarterly Advance Tax Schedule (Section 208 / 211)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Taxpayers with an estimated tax liability of ₹10,000 or more in a financial year must pay advance tax in 4 statutory quarterly installments.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">Estimated Base Income:</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(estimatedAnnualBase, currency)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">Est. Tax Liability (Sec 44ADA ~10%):</span>
                    <span className="text-amber-400 font-bold text-sm">{formatCurrency(estimatedAnnualTaxLiability, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Installment Table */}
              <div className="space-y-2.5">
                {advanceTaxSchedule.map((inst, index) => (
                  <div
                    key={inst.quarter}
                    className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        Q{index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{inst.quarter}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                            Due by {inst.dueDate}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          {inst.note} ({inst.cumulativePercent}% cumulative)
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">
                        {formatCurrency(inst.quarterlyAmount, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Cumulative: {formatCurrency(inst.cumulativeAmount, currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interest Penalties under Section 234B & 234C</span>
                </div>
                <p>
                  Failure to pay advance tax or deferment of installments attracts simple interest @ 1% per month under Section 234C for the period of default.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED SCENARIOS */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 pb-1">
                <span className="font-semibold">Frequently Calculated Tax Profiles & Clients:</span>
                <span className="text-[10px] text-slate-400">Stored locally in your browser</span>
              </div>

              {savedScenarios.length > 0 ? (
                <div className="space-y-2">
                  {savedScenarios.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{sc.name}</span>
                          {sc.clientOrParty && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({sc.clientOrParty})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Base: {formatCurrency(sc.baseAmount, currency)} · GST {sc.gstRate}% · TDS Sec {sc.tdsSection} ({sc.tdsRate}%)
                          {sc.isRcm ? ' · RCM' : ''}
                        </div>
                        <div className="text-xs font-bold text-emerald-400 font-mono mt-1">
                          Net Bank Credit: {formatCurrency(sc.netPayout, currency)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadScenario(sc)}
                          className="px-3 py-1.5 rounded-xl liquid-glass-emerald text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScenario(sc.id)}
                          className="p-1.5 rounded-xl liquid-glass-button text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-600 mb-1" />
                  <span className="text-slate-300 font-semibold">No Saved Scenarios Yet</span>
                  <span className="text-slate-400 text-[11px] max-w-sm">
                    Enter calculations in the calculator tab, type a scenario name in the save bar, and save it here for fast 1-click recall!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-white/[0.08] bg-slate-950/40 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex-1 sm:flex-initial"
              title="Copy formatted summary to clipboard"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer flex-1 sm:flex-initial"
              title="Copy client-ready WhatsApp voucher format"
            >
              {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{copiedWhatsApp ? 'Copied WhatsApp!' : 'WhatsApp Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
              title="Download official PDF computation voucher"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isGeneratingPdf ? 'Generating...' : 'PDF Voucher'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onApplyToEarning && (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl liquid-glass-emerald hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex-1 sm:flex-initial"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Fill New Earning Form</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
