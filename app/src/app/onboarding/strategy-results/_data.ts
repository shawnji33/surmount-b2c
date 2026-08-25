export type Holding = {
  symbol: string;
  name: string;
  weight: string;
  logo: string;
  color: string;
};

export type SectorWeight = {
  name: string;
  weight: string;
  color: string;
};

export type Projection = {
  value: string;
  contributions: string;
  gains: string;
  investToday: string;
  investMonthly: string;
  points: number[];
};

export type Reason = {
  title: string;
  body: string;
};

export type Strategy = {
  id: string;
  name: string;
  oneYearReturn: string;
  risk: 'Low' | 'Medium';
  industry: string;
  holdingsCount: string;
  cover: string;
  badgeTone: 'success' | 'warning';
  tags: string[];
  description: string;
  projection: Projection;
  reasons: Reason[];
  holdings: Holding[];
  sectors: SectorWeight[];
};

export type BuyStep = 'about' | 'details' | 'review' | 'submitted';
export type ProjectionRange = '1Y' | '2Y' | '5Y' | '10Y';

export type ProjectionPoint = {
  month: number;
  label: string;
  value: number;
  contributions: number;
  gains: number;
};

export type DemoAccount = {
  id: string;
  name: string;
  balance: number;
  orderAmount: number;
  logo: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'webull', name: 'Webull', balance: 2423983.56, orderAmount: 3234.45, logo: '/assets/brokers/av-webull.png' },
  { id: 'schwab', name: 'Schwab IRA', balance: 89340.5, orderAmount: 1500, logo: '/assets/brokers/av-schwab.png' },
  { id: 'ibkr', name: 'IBKR Taxable', balance: 42670.88, orderAmount: 1000, logo: '/assets/brokers/av-ibkr.png' },
];

export const PROJECTION_RANGES: ProjectionRange[] = ['1Y', '2Y', '5Y', '10Y'];
export const RANGE_YEARS: Record<ProjectionRange, number> = {
  '1Y': 1,
  '2Y': 2,
  '5Y': 5,
  '10Y': 10,
};

const QUANTUM_HOLDINGS: Holding[] = [
  { symbol: 'NVDA', name: 'NVIDIA', weight: '18.75%', logo: '/assets/strategy-result/logos/nvda.webp', color: '#2f5fbd' },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: '16.50%', logo: '/assets/strategy-result/logos/aapl.webp', color: '#1f4f9f' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', weight: '15.24%', logo: '/assets/strategy-result/logos/amzn.webp', color: '#3f6fd8' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', weight: '13.45%', logo: '/assets/strategy-result/logos/goog.webp', color: '#8fb8ea' },
  { symbol: 'V', name: 'Visa', weight: '12.30%', logo: '/assets/strategy-result/logos/v.webp', color: '#c8dbf5' },
];

const QUANTUM_SECTORS: SectorWeight[] = [
  { name: 'Semiconductors', weight: '32.5%', color: '#2f5fbd' },
  { name: 'Cloud infrastructure', weight: '24.0%', color: '#345aa9' },
  { name: 'Consumer platforms', weight: '18.4%', color: '#4b73df' },
  { name: 'Payments', weight: '12.3%', color: '#8fb8ea' },
  { name: 'Utilities', weight: '12.8%', color: '#c8dbf5' },
];

const AI_HOLDINGS: Holding[] = [
  { symbol: 'NVDA', name: 'NVIDIA', weight: '23.40%', logo: '/assets/strategy-result/logos/nvda.webp', color: '#6d4aff' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', weight: '17.85%', logo: '/assets/strategy-result/logos/amzn.webp', color: '#4169e1' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', weight: '16.10%', logo: '/assets/strategy-result/logos/goog.webp', color: '#2f8fed' },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: '12.65%', logo: '/assets/strategy-result/logos/aapl.webp', color: '#8fb8ea' },
  { symbol: 'V', name: 'Visa', weight: '8.20%', logo: '/assets/strategy-result/logos/v.webp', color: '#c8dbf5' },
];

const AI_SECTORS: SectorWeight[] = [
  { name: 'Semiconductors', weight: '38.2%', color: '#6d4aff' },
  { name: 'Cloud infrastructure', weight: '25.8%', color: '#4169e1' },
  { name: 'Automation', weight: '14.5%', color: '#2f8fed' },
  { name: 'Consumer platforms', weight: '13.1%', color: '#8fb8ea' },
  { name: 'Payments', weight: '8.4%', color: '#c8dbf5' },
];

const NANO_HOLDINGS: Holding[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', weight: '17.90%', logo: '/assets/strategy-result/logos/aapl.webp', color: '#2d7a55' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', weight: '14.25%', logo: '/assets/strategy-result/logos/goog.webp', color: '#3b9c72' },
  { symbol: 'NVDA', name: 'NVIDIA', weight: '13.80%', logo: '/assets/strategy-result/logos/nvda.webp', color: '#5bb98d' },
  { symbol: 'V', name: 'Visa', weight: '11.70%', logo: '/assets/strategy-result/logos/v.webp', color: '#8ed3b1' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', weight: '9.65%', logo: '/assets/strategy-result/logos/amzn.webp', color: '#c5ead8' },
];

const NANO_SECTORS: SectorWeight[] = [
  { name: 'Healthcare', weight: '31.5%', color: '#2d7a55' },
  { name: 'Advanced materials', weight: '24.7%', color: '#3b9c72' },
  { name: 'Semiconductors', weight: '17.9%', color: '#5bb98d' },
  { name: 'Manufacturing', weight: '14.2%', color: '#8ed3b1' },
  { name: 'Payments', weight: '11.7%', color: '#c5ead8' },
];

export const STRATEGIES: Strategy[] = [
  {
    id: 'quantum',
    name: 'Quantum Computing Leaders',
    oneYearReturn: '+8.50%',
    risk: 'Low',
    industry: 'Utilities',
    holdingsCount: '24 assets',
    cover: '/assets/strategy-result/covers/quantum-computing-leaders.png',
    badgeTone: 'success',
    tags: ['Low risk', 'Technology'],
    description:
      'This strategy focuses on established technology leaders and infrastructure companies positioned to benefit from quantum computing adoption while keeping risk controlled through diversified holdings.',
    projection: {
      value: '$954k - $2.1M',
      contributions: '$70.0k',
      gains: '+134.5K',
      investToday: '50,000',
      investMonthly: '1,000',
      points: [44, 43, 45, 42, 43, 48, 47, 50, 48, 55, 54, 58, 57, 64, 60, 65, 62, 68, 67, 72, 70, 76, 73, 80],
    },
    reasons: [
      { title: 'Quantum infrastructure', body: 'Targets companies building the compute stack behind next-generation models.' },
      { title: '10+ years', body: 'Best suited for compounding through a full technology adoption cycle.' },
      { title: 'Controlled risk profile', body: 'Diversified exposure keeps the strategy aligned with a steadier risk tolerance.' },
      { title: 'Utilities', body: 'Utilities exposure helps balance the high-growth technology theme.' },
    ],
    holdings: QUANTUM_HOLDINGS,
    sectors: QUANTUM_SECTORS,
  },
  {
    id: 'ai',
    name: 'AI Infrastructure Leaders',
    oneYearReturn: '+9.10%',
    risk: 'Medium',
    industry: 'Technology',
    holdingsCount: '31 assets',
    cover: '/assets/strategy-result/covers/ai-innovators.png',
    badgeTone: 'warning',
    tags: ['Medium risk', 'AI'],
    description:
      'A more growth-oriented strategy built around AI infrastructure, data centers, and semiconductor companies with higher upside and higher volatility.',
    projection: {
      value: '$1.2M - $2.8M',
      contributions: '$88.0k',
      gains: '+196.2K',
      investToday: '65,000',
      investMonthly: '1,250',
      points: [38, 40, 39, 43, 42, 47, 45, 52, 49, 57, 54, 62, 58, 66, 61, 72, 68, 77, 71, 83, 78, 88, 82, 92],
    },
    reasons: [
      { title: 'Higher upside exposure', body: 'Concentrates around semiconductor, cloud, and automation leaders.' },
      { title: '5-10 years', body: 'Designed for users comfortable with more pronounced cycles and faster repricing.' },
      { title: 'Higher growth profile', body: 'More concentrated growth themes create higher upside with more expected volatility.' },
      { title: 'Technology', body: 'Technology exposure matches your appetite for AI-led market expansion.' },
    ],
    holdings: AI_HOLDINGS,
    sectors: AI_SECTORS,
  },
  {
    id: 'nano',
    name: 'Nanotechnology',
    oneYearReturn: '+7.40%',
    risk: 'Low',
    industry: 'Healthcare',
    holdingsCount: '18 assets',
    cover: '/assets/strategy-result/covers/nanotechnology-innovators.png',
    badgeTone: 'success',
    tags: ['Low risk', 'Innovation'],
    description:
      'A diversified strategy focused on nanotechnology applications across healthcare, materials, and manufacturing with a balanced risk profile.',
    projection: {
      value: '$822k - $1.7M',
      contributions: '$62.5k',
      gains: '+98.4K',
      investToday: '40,000',
      investMonthly: '850',
      points: [46, 46, 47, 45, 48, 49, 50, 52, 51, 54, 55, 56, 58, 59, 60, 62, 61, 64, 65, 66, 68, 69, 71, 72],
    },
    reasons: [
      { title: 'Healthcare innovation', body: 'Captures nanotechnology use cases across diagnostics, materials, and devices.' },
      { title: '7+ years', body: 'Works best for patient investors who want steady exposure to applied innovation.' },
      { title: 'Balanced risk profile', body: 'Spreads exposure across healthcare, materials, and manufacturing applications.' },
      { title: 'Healthcare', body: 'Healthcare exposure anchors the strategy with more defensive demand drivers.' },
    ],
    holdings: NANO_HOLDINGS,
    sectors: NANO_SECTORS,
  },
];
