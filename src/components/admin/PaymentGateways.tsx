import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CreditCard, Wallet, Bitcoin, Globe, ShieldCheck, ShieldAlert, ChevronRight, Plus, Search,
  Settings2, Edit, Copy, Activity, AlertTriangle, CheckCircle2, Banknote, Smartphone,
  Building2, Coins, Lock, ArrowRightLeft, TrendingUp, Webhook, Repeat, Sparkles, Eye,
} from "lucide-react";

type Channel = "card" | "wallet" | "bank" | "bnpl" | "crypto" | "web3";
type Status = "live" | "test" | "disabled" | "review";
type Mode = "test" | "live";

type Provider = {
  id: string;
  name: string;
  channel: Channel;
  logo: string;          // emoji/short label
  status: Status;
  mode: Mode;
  regions: string[];
  currencies: string[];
  methods: string[];
  feePct: number;
  feeFlat: number;       // in USD-equivalent cents (display only)
  payoutDays: number;
  threeDS: boolean;
  recurring: boolean;
  refunds: boolean;
  webhook: string;
  successRate: number;   // %
  volume24h: number;     // USD
  notes?: string;
  recommended?: boolean;
  isWallet?: boolean;
  description: string;
};

type UseCaseKey =
  | "subscription" | "session" | "boost" | "featured" | "marketplace"
  | "tip" | "donation" | "topup" | "withdrawal" | "escrow";

type UseCase = {
  key: UseCaseKey;
  label: string;
  icon: typeof CreditCard;
  description: string;
  allowedProviders: string[];   // provider ids
  minAmount: number;            // USD-equivalent
  maxAmount: number;            // 0 = unlimited
  require3DS: boolean;
  requireKYCAbove: number;      // USD threshold for KYC
  blockPrepaid: boolean;
  enabled: boolean;
};

type RoutingRule = {
  id: string;
  name: string;
  ifCurrency?: string;
  ifCountry?: string;
  ifChannel?: Channel;
  ifAmountAbove?: number;
  primary: string;     // provider id
  fallback: string[];  // provider ids
  enabled: boolean;
};

const seedProviders: Provider[] = [
  // ── Cards / Global
  { id: "stripe", name: "Stripe", channel: "card", logo: "S", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USD","EUR","GBP","INR","AED","SGD"], methods: ["Visa","Mastercard","Amex","Apple Pay","Google Pay","Link"],
    feePct: 2.9, feeFlat: 30, payoutDays: 2, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/stripe", successRate: 96.4, volume24h: 184320,
    description: "Primary processor for USD and most non-MENA currencies. Subscriptions, one-time, and Connect for marketplace payouts." },
  { id: "successpay", name: "SuccessPay", channel: "card", logo: "✓", status: "live", mode: "live",
    regions: ["UAE","KSA","Bahrain"], currencies: ["AED","SAR"], methods: ["Visa","Mastercard","Mada"],
    feePct: 2.5, feeFlat: 0, payoutDays: 3, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/successpay", successRate: 94.1, volume24h: 42100,
    description: "AED-native acquirer for UAE merchants. Local settlement, lower FX cost than Stripe for AED." },
  { id: "mamopay", name: "Mamo Pay", channel: "card", logo: "M", status: "live", mode: "live",
    regions: ["UAE"], currencies: ["AED","USD"], methods: ["Visa","Mastercard","Apple Pay","Pay-by-link"],
    feePct: 2.79, feeFlat: 100, payoutDays: 2, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/mamopay", successRate: 95.2, volume24h: 18430,
    description: "UAE-licensed gateway with strong pay-by-link & invoicing UX. Fallback for SuccessPay." },
  { id: "razorpay", name: "Razorpay", channel: "card", logo: "R", status: "live", mode: "live",
    regions: ["India"], currencies: ["INR"], methods: ["UPI","Cards","NetBanking","Wallets","EMI"],
    feePct: 2.0, feeFlat: 0, payoutDays: 2, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/razorpay", successRate: 92.8, volume24h: 96720,
    description: "INR-native with UPI Autopay for subscriptions; mandatory for Indian customers." },

  // ── Crypto
  { id: "binance_pay", name: "Binance Pay", channel: "crypto", logo: "₿", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USDT","BUSD","BTC","ETH","BNB"], methods: ["Binance Pay ID","QR"],
    feePct: 0, feeFlat: 0, payoutDays: 0, threeDS: false, recurring: false, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/binance-pay", successRate: 99.1, volume24h: 28100,
    description: "Zero-fee crypto checkout for Binance users. Best for cross-border high-ticket investor flows." },
  { id: "nowpayments", name: "NOWPayments", channel: "crypto", logo: "◉", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USDT","USDC","BTC","ETH","SOL","TRX","MATIC"], methods: ["On-chain","Lightning"],
    feePct: 0.5, feeFlat: 0, payoutDays: 1, threeDS: false, recurring: false, refunds: false,
    webhook: "https://api.zynk.ing/webhooks/nowpayments", successRate: 97.8, volume24h: 9540,
    description: "Multi-chain crypto with auto-conversion to a stablecoin payout currency." },

  // ── Recommended additions
  { id: "paypal", name: "PayPal", channel: "wallet", logo: "P", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USD","EUR","GBP","AUD"], methods: ["PayPal","Venmo","Pay Later"],
    feePct: 3.49, feeFlat: 49, payoutDays: 1, threeDS: false, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/paypal", successRate: 93.2, volume24h: 31200,
    recommended: true, description: "Buyer trust in NA/EU + PayPal Credit. Useful as a third option on session checkout." },
  { id: "tap", name: "Tap Payments", channel: "card", logo: "T", status: "test", mode: "test",
    regions: ["UAE","KSA","Kuwait","Bahrain","Qatar","Egypt"], currencies: ["AED","SAR","KWD","BHD","QAR","EGP"],
    methods: ["Mada","KNET","Benefit","Visa","Mastercard","Apple Pay"],
    feePct: 2.5, feeFlat: 0, payoutDays: 3, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/tap", successRate: 0, volume24h: 0,
    recommended: true, description: "Best multi-country MENA coverage including KNET (KW), Benefit (BH), Mada (KSA)." },
  { id: "checkout", name: "Checkout.com", channel: "card", logo: "C", status: "review", mode: "test",
    regions: ["Global","MENA"], currencies: ["USD","EUR","AED","SAR","GBP"], methods: ["Cards","Apple Pay","Google Pay","Sofort","iDEAL"],
    feePct: 2.4, feeFlat: 25, payoutDays: 2, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/checkout", successRate: 0, volume24h: 0,
    recommended: true, description: "Enterprise-grade fallback acquirer with strong auth-rate optimisation across MENA + EU." },
  { id: "adyen", name: "Adyen", channel: "card", logo: "A", status: "disabled", mode: "test",
    regions: ["Global"], currencies: ["USD","EUR","GBP","AED","INR"], methods: ["Cards","Wallets","Klarna","iDEAL","Sofort"],
    feePct: 2.2, feeFlat: 12, payoutDays: 2, threeDS: true, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/adyen", successRate: 0, volume24h: 0,
    recommended: true, description: "Best routing intelligence at scale. Enable when monthly volume > $250k for measurable lift." },
  { id: "tabby", name: "Tabby", channel: "bnpl", logo: "≡", status: "test", mode: "test",
    regions: ["UAE","KSA","Kuwait"], currencies: ["AED","SAR","KWD"], methods: ["Pay in 4","Pay later"],
    feePct: 4.0, feeFlat: 0, payoutDays: 5, threeDS: false, recurring: false, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/tabby", successRate: 0, volume24h: 0,
    recommended: true, description: "BNPL for boosts and event tickets in MENA. Higher fee, but lifts AOV ~40%." },
  { id: "tamara", name: "Tamara", channel: "bnpl", logo: "T", status: "disabled", mode: "test",
    regions: ["UAE","KSA","Kuwait","Bahrain"], currencies: ["AED","SAR"], methods: ["Pay in 3","Pay in 4"],
    feePct: 4.5, feeFlat: 0, payoutDays: 5, threeDS: false, recurring: false, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/tamara", successRate: 0, volume24h: 0,
    description: "MENA BNPL alternative to Tabby; pick one based on partner economics." },
  { id: "applepay", name: "Apple Pay", channel: "wallet", logo: "", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USD","EUR","GBP","AED","INR"], methods: ["Apple Pay"],
    feePct: 0, feeFlat: 0, payoutDays: 0, threeDS: true, recurring: true, refunds: true,
    webhook: "—", successRate: 98.6, volume24h: 38450,
    description: "Routed through underlying acquirer (Stripe/SuccessPay/Tap). Highest mobile auth-rate." },
  { id: "googlepay", name: "Google Pay", channel: "wallet", logo: "G", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USD","EUR","INR","AED"], methods: ["Google Pay"],
    feePct: 0, feeFlat: 0, payoutDays: 0, threeDS: true, recurring: true, refunds: true,
    webhook: "—", successRate: 97.9, volume24h: 22100,
    description: "Routes through underlying acquirer; mandatory for Android UPI in India via Razorpay." },
  { id: "wise", name: "Wise (Bank Payouts)", channel: "bank", logo: "W", status: "live", mode: "live",
    regions: ["Global"], currencies: ["USD","EUR","GBP","AED","INR","SGD"], methods: ["SWIFT","SEPA","Local rails"],
    feePct: 0.6, feeFlat: 0, payoutDays: 1, threeDS: false, recurring: false, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/wise", successRate: 99.4, volume24h: 14200,
    description: "Cheapest cross-border payouts to mentors, vendors and investors. Pair with Stripe Connect for marketplace." },
  { id: "stcpay", name: "STC Pay", channel: "wallet", logo: "س", status: "disabled", mode: "test",
    regions: ["KSA"], currencies: ["SAR"], methods: ["STC Pay wallet"],
    feePct: 1.5, feeFlat: 0, payoutDays: 2, threeDS: false, recurring: false, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/stcpay", successRate: 0, volume24h: 0,
    description: "Saudi-native wallet — enable once KSA founders cohort grows past 1k MAU." },
  { id: "paytabs", name: "PayTabs", channel: "card", logo: "PT", status: "disabled", mode: "test",
    regions: ["KSA","UAE","Egypt","Jordan","Oman"], currencies: ["AED","SAR","EGP","JOD","OMR"],
    methods: ["Cards","Mada","KNET"], feePct: 2.85, feeFlat: 0, payoutDays: 3,
    threeDS: true, recurring: true, refunds: true, webhook: "https://api.zynk.ing/webhooks/paytabs",
    successRate: 0, volume24h: 0, description: "Backup MENA acquirer; redundancy if SuccessPay/Tap have outages." },
  { id: "ni", name: "Network International", channel: "card", logo: "N", status: "disabled", mode: "test",
    regions: ["UAE","KSA","Egypt","Jordan"], currencies: ["AED","SAR","EGP"], methods: ["Cards","Mada"],
    feePct: 2.6, feeFlat: 0, payoutDays: 2, threeDS: true, recurring: true, refunds: true,
    webhook: "—", successRate: 0, volume24h: 0,
    description: "Direct acquirer relationship; lowest interchange when volume justifies." },

  // ── Web3 / Wallets
  { id: "metamask", name: "MetaMask / WalletConnect", channel: "web3", logo: "🦊", status: "test", mode: "test",
    regions: ["Global"], currencies: ["USDC","USDT","ETH","MATIC","BNB"],
    methods: ["EVM wallets"], feePct: 0, feeFlat: 0, payoutDays: 0, threeDS: false, recurring: false, refunds: false,
    webhook: "—", successRate: 0, volume24h: 0, isWallet: true,
    description: "Web3 wallet checkout for investor club + tokenised SPV settlement." },
  { id: "coinbase_commerce", name: "Coinbase Commerce", channel: "crypto", logo: "₿", status: "disabled", mode: "test",
    regions: ["Global"], currencies: ["USDC","BTC","ETH"], methods: ["On-chain","Coinbase wallet"],
    feePct: 1.0, feeFlat: 0, payoutDays: 1, threeDS: false, recurring: false, refunds: false,
    webhook: "—", successRate: 0, volume24h: 0,
    description: "US-compliant crypto checkout. Lower regulatory risk than NOWPayments for accredited investor flows." },
  { id: "capshield", name: "CAPShield Wallet", channel: "wallet", logo: "🛡", status: "test", mode: "test",
    regions: ["Global"], currencies: ["USD","AED","INR"], methods: ["CAPShield balance"],
    feePct: 0, feeFlat: 0, payoutDays: 0, threeDS: false, recurring: true, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/capshield", successRate: 0, volume24h: 0, isWallet: true,
    description: "In-app escrow wallet — credits from refunds, partial subscription pauses, or referral bonuses live here." },
  { id: "angelseed", name: "AngelSEED Wallet", channel: "wallet", logo: "🌱", status: "test", mode: "test",
    regions: ["Global"], currencies: ["USD","AED"], methods: ["AngelSEED balance"],
    feePct: 0, feeFlat: 0, payoutDays: 0, threeDS: false, recurring: false, refunds: true,
    webhook: "https://api.zynk.ing/webhooks/angelseed", successRate: 0, volume24h: 0, isWallet: true,
    description: "Investor commitment wallet — pre-funded balance for SPV calls and follow-ons." },
];

const seedUseCases: UseCase[] = [
  { key: "subscription", label: "Plan Subscription", icon: Repeat,
    description: "Recurring monthly/annual plans (Pro, Investor Club, Enterprise).",
    allowedProviders: ["stripe","razorpay","successpay","mamopay","applepay","googlepay","capshield"],
    minAmount: 5, maxAmount: 2000, require3DS: true, requireKYCAbove: 0, blockPrepaid: true, enabled: true },
  { key: "session", label: "Expert Session Booking", icon: Sparkles,
    description: "1:1 mentor / advisor / investor sessions.",
    allowedProviders: ["stripe","razorpay","successpay","mamopay","tap","applepay","googlepay","paypal","tabby","capshield"],
    minAmount: 10, maxAmount: 5000, require3DS: true, requireKYCAbove: 1000, blockPrepaid: false, enabled: true },
  { key: "boost", label: "Profile / Post Boost", icon: TrendingUp,
    description: "Pay-to-promote profile, pitch or post for time-boxed visibility.",
    allowedProviders: ["stripe","razorpay","successpay","mamopay","applepay","googlepay","tabby","capshield","binance_pay"],
    minAmount: 3, maxAmount: 1500, require3DS: false, requireKYCAbove: 500, blockPrepaid: true, enabled: true },
  { key: "featured", label: "Featured Listing / Event Ticket", icon: Activity,
    description: "Marketplace featured slots, paid event tickets, premium directory.",
    allowedProviders: ["stripe","razorpay","successpay","mamopay","tap","tabby","applepay","googlepay","paypal","capshield"],
    minAmount: 5, maxAmount: 10000, require3DS: true, requireKYCAbove: 2000, blockPrepaid: false, enabled: true },
  { key: "marketplace", label: "Vendor Marketplace Purchase", icon: Building2,
    description: "Buy services from vendors (legal, design, dev). Split payouts.",
    allowedProviders: ["stripe","razorpay","successpay","mamopay","tap","wise","capshield"],
    minAmount: 25, maxAmount: 50000, require3DS: true, requireKYCAbove: 5000, blockPrepaid: true, enabled: true },
  { key: "tip", label: "Mentor / Creator Tip", icon: Coins,
    description: "Optional tip after a session or to a creator post.",
    allowedProviders: ["stripe","razorpay","successpay","applepay","googlepay","binance_pay","capshield"],
    minAmount: 1, maxAmount: 500, require3DS: false, requireKYCAbove: 0, blockPrepaid: false, enabled: true },
  { key: "donation", label: "Cause / Crowdfunding Donation", icon: Banknote,
    description: "Donations to startup causes, hackathons, scholarships.",
    allowedProviders: ["stripe","paypal","razorpay","successpay","binance_pay","nowpayments"],
    minAmount: 1, maxAmount: 0, require3DS: false, requireKYCAbove: 0, blockPrepaid: false, enabled: true },
  { key: "topup", label: "Wallet Top-up", icon: Wallet,
    description: "Add credit to CAPShield / AngelSEED wallet.",
    allowedProviders: ["stripe","razorpay","successpay","mamopay","wise","binance_pay","nowpayments","metamask"],
    minAmount: 20, maxAmount: 100000, require3DS: true, requireKYCAbove: 1000, blockPrepaid: true, enabled: true },
  { key: "withdrawal", label: "Withdrawal / Payout", icon: ArrowRightLeft,
    description: "Mentor, vendor and investor payouts.",
    allowedProviders: ["wise","stripe","razorpay","binance_pay","nowpayments","successpay"],
    minAmount: 25, maxAmount: 0, require3DS: false, requireKYCAbove: 0, blockPrepaid: false, enabled: true },
  { key: "escrow", label: "Investor Escrow / SPV Call", icon: Lock,
    description: "Capital call into an SPV; held in escrow until close.",
    allowedProviders: ["wise","stripe","successpay","binance_pay","metamask","angelseed"],
    minAmount: 1000, maxAmount: 0, require3DS: true, requireKYCAbove: 0, blockPrepaid: true, enabled: true },
];

const seedRouting: RoutingRule[] = [
  { id: "r1", name: "AED → SuccessPay (primary)", ifCurrency: "AED", primary: "successpay", fallback: ["mamopay","tap","stripe"], enabled: true },
  { id: "r2", name: "INR → Razorpay (mandatory)", ifCurrency: "INR", primary: "razorpay", fallback: ["stripe"], enabled: true },
  { id: "r3", name: "USD → Stripe (default)", ifCurrency: "USD", primary: "stripe", fallback: ["paypal","checkout"], enabled: true },
  { id: "r4", name: "SAR → Tap (Mada coverage)", ifCurrency: "SAR", primary: "tap", fallback: ["successpay","paytabs"], enabled: true },
  { id: "r5", name: "Crypto large-ticket → Binance Pay", ifChannel: "crypto", ifAmountAbove: 1000, primary: "binance_pay", fallback: ["nowpayments"], enabled: true },
  { id: "r6", name: "BNPL for boosts ≥ $50", ifChannel: "bnpl", ifAmountAbove: 50, primary: "tabby", fallback: ["tamara"], enabled: false },
  { id: "r7", name: "Investor escrow ≥ $5k → Wise", ifAmountAbove: 5000, primary: "wise", fallback: ["stripe"], enabled: true },
];

const channelMeta: Record<Channel, { label: string; icon: typeof CreditCard; cls: string }> = {
  card:   { label: "Cards",  icon: CreditCard, cls: "bg-blue-500/10 text-blue-500" },
  wallet: { label: "Wallet", icon: Wallet,     cls: "bg-violet-500/10 text-violet-500" },
  bank:   { label: "Bank",   icon: Building2,  cls: "bg-emerald-500/10 text-emerald-500" },
  bnpl:   { label: "BNPL",   icon: TrendingUp, cls: "bg-amber-500/10 text-amber-500" },
  crypto: { label: "Crypto", icon: Bitcoin,    cls: "bg-orange-500/10 text-orange-500" },
  web3:   { label: "Web3",   icon: Coins,      cls: "bg-fuchsia-500/10 text-fuchsia-500" },
};

const statusMeta: Record<Status, { label: string; cls: string }> = {
  live:     { label: "Live",     cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  test:     { label: "Test",     cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  review:   { label: "In review",cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  disabled: { label: "Disabled", cls: "bg-muted text-muted-foreground border-border" },
};

export function PaymentGateways() {
  const [providers, setProviders] = useState<Provider[]>(seedProviders);
  const [useCases, setUseCases] = useState<UseCase[]>(seedUseCases);
  const [routing, setRouting] = useState<RoutingRule[]>(seedRouting);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Provider | null>(null);
  const [editingUC, setEditingUC] = useState<UseCase | null>(null);

  // Risk / chargeback global config
  const [risk, setRisk] = useState({
    force3DSAbove: 100,
    blockPrepaid: true,
    blockHighRiskCountries: true,
    velocityPerHour: 5,
    chargebackRateGuard: 0.8,    // %
    refundWindowDays: 14,
    aml_threshold: 10000,
    sanctionsScreen: true,
    deviceFingerprint: true,
    fraudScore: 75,
  });
  const [highRiskCountries] = useState<string[]>(["NG","RU","KP","IR","SY","VE","AF"]);
  const [globalMode, setGlobalMode] = useState<Mode>("live");

  const filtered = useMemo(() => providers.filter((p) => {
    if (channelFilter !== "all" && p.channel !== channelFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![p.name, p.description, ...p.regions, ...p.currencies, ...p.methods].some((x) => x.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [providers, search, channelFilter, statusFilter]);

  const stats = useMemo(() => {
    const live = providers.filter((p) => p.status === "live").length;
    const volume = providers.reduce((s, p) => s + p.volume24h, 0);
    const wallets = providers.filter((p) => p.isWallet || p.channel === "web3").length;
    const avgSr = providers.filter((p) => p.status === "live").reduce((s, p, _, a) => s + p.successRate / a.length, 0);
    return { live, volume, wallets, avgSr };
  }, [providers]);

  const updateProvider = (id: string, patch: Partial<Provider>) => {
    setProviders((ps) => ps.map((p) => p.id === id ? { ...p, ...patch } : p));
  };

  const toggleProvider = (id: string, enabled: boolean) => {
    updateProvider(id, { status: enabled ? "live" : "disabled" });
    toast.success(`${providers.find((p) => p.id === id)?.name} ${enabled ? "enabled" : "disabled"}`);
  };

  const updateUseCase = (key: UseCaseKey, patch: Partial<UseCase>) => {
    setUseCases((us) => us.map((u) => u.key === key ? { ...u, ...patch } : u));
  };

  const updateRouting = (id: string, patch: Partial<RoutingRule>) => {
    setRouting((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
  };

  const addRoutingRule = () => {
    const id = `r${Date.now()}`;
    setRouting((rs) => [...rs, { id, name: "New rule", primary: "stripe", fallback: [], enabled: false }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Settings</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Payment Gateway Config</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Payment Gateway Config</h1>
          <p className="text-sm text-muted-foreground">
            Multi-rail payments for Zynk.ing — cards, wallets, BNPL, crypto and web3. Routed by currency, country, amount and use case.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1 text-xs">
            <span className="text-muted-foreground">Global mode</span>
            <Select value={globalMode} onValueChange={(v) => setGlobalMode(v as Mode)}>
              <SelectTrigger className="h-7 w-20 border-0 bg-transparent px-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="gap-1"><Webhook className="h-4 w-4" /> Webhooks</Button>
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add provider</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Live providers", value: stats.live, icon: CheckCircle2, tone: "text-emerald-500" },
          { label: "Volume / 24h", value: `$${stats.volume.toLocaleString()}`, icon: Activity, tone: "text-blue-500" },
          { label: "Wallets & web3", value: stats.wallets, icon: Wallet, tone: "text-violet-500" },
          { label: "Avg success rate", value: `${stats.avgSr.toFixed(1)}%`, icon: TrendingUp, tone: "text-amber-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-md bg-muted p-2"><s.icon className={`h-4 w-4 ${s.tone}`} /></div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-base font-semibold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="providers">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="usecases">Use Cases</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
          <TabsTrigger value="risk" className="gap-1"><ShieldAlert className="h-3.5 w-3.5" />Risk &amp; Chargeback</TabsTrigger>
          <TabsTrigger value="wallets" className="gap-1"><Wallet className="h-3.5 w-3.5" />Wallets &amp; Web3</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* ============ Providers ============ */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by name, currency, region, method…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    {Object.entries(channelMeta).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="review">In review</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filtered.map((p) => {
                const Icon = channelMeta[p.channel].icon;
                return (
                  <div key={p.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-bold ${channelMeta[p.channel].cls}`}>
                          {p.logo || <Icon className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{p.name}</span>
                            <Badge variant="outline" className={statusMeta[p.status].cls}>{statusMeta[p.status].label}</Badge>
                            <Badge variant="outline" className="text-[10px]">{channelMeta[p.channel].label}</Badge>
                            {p.recommended && <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-500 text-[10px]"><Sparkles className="mr-1 h-3 w-3" />Recommended</Badge>}
                            {p.recurring && <Badge variant="outline" className="text-[10px]"><Repeat className="mr-1 h-3 w-3" />Recurring</Badge>}
                            {p.threeDS && <Badge variant="outline" className="text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" />3DS</Badge>}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{p.regions.slice(0,4).join(", ")}{p.regions.length>4?`+${p.regions.length-4}`:""}</span>
                            <span className="flex items-center gap-1"><Banknote className="h-3 w-3" />{p.currencies.join(" · ")}</span>
                            <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" />{p.methods.slice(0,4).join(", ")}{p.methods.length>4?`+${p.methods.length-4}`:""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <div className="text-muted-foreground">Fee</div>
                          <div className="font-mono font-semibold">{p.feePct}% {p.feeFlat ? `+ ${p.feeFlat}¢` : ""}</div>
                        </div>
                        <Switch checked={p.status === "live"} onCheckedChange={(v) => toggleProvider(p.id, v)} />
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid gap-3 md:grid-cols-4">
                      <Stat label="Success rate" value={`${p.successRate.toFixed(1)}%`} good={p.successRate >= 95} />
                      <Stat label="24h volume" value={`$${p.volume24h.toLocaleString()}`} />
                      <Stat label="Payout T+" value={`${p.payoutDays}d`} />
                      <Stat label="Refunds" value={p.refunds ? "Enabled" : "—"} good={p.refunds} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <code className="truncate rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">{p.webhook}</code>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(p.webhook); toast("Webhook copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(p)}><Settings2 className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => toast.success(`Test charge sent to ${p.name}`)}><Eye className="h-3.5 w-3.5" /> Test</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No providers match.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Use Cases ============ */}
        <TabsContent value="usecases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment use cases</CardTitle>
              <CardDescription>
                Each scenario has its own allowed providers, amount limits, KYC threshold and 3DS rule. Restrict high-risk flows to chargeback-safe providers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {useCases.map((u) => (
                <div key={u.key} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="rounded-md bg-primary/10 p-2 text-primary"><u.icon className="h-4 w-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{u.label}</span>
                          {u.require3DS && <Badge variant="outline" className="text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" />3DS required</Badge>}
                          {u.blockPrepaid && <Badge variant="outline" className="text-[10px]">Prepaid blocked</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{u.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {u.allowedProviders.map((id) => {
                            const pr = providers.find((p) => p.id === id);
                            return (<Badge key={id} variant="secondary" className="text-[10px]">{pr?.name ?? id}</Badge>);
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs">
                        <div className="text-muted-foreground">Limits</div>
                        <div className="font-mono font-semibold">${u.minAmount} – {u.maxAmount ? `$${u.maxAmount.toLocaleString()}` : "∞"}</div>
                        {u.requireKYCAbove > 0 && <div className="text-muted-foreground text-[10px]">KYC ≥ ${u.requireKYCAbove}</div>}
                      </div>
                      <Switch checked={u.enabled} onCheckedChange={(v) => updateUseCase(u.key, { enabled: v })} />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingUC(u)}><Edit className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Routing ============ */}
        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Smart routing rules</CardTitle>
                  <CardDescription>Pick a primary provider per currency/country/amount; auto-failover to fallbacks on decline.</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-1" onClick={addRoutingRule}><Plus className="h-3.5 w-3.5" /> Add rule</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {routing.map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Switch checked={r.enabled} onCheckedChange={(v) => updateRouting(r.id, { enabled: v })} />
                    <Input value={r.name} onChange={(e) => updateRouting(r.id, { name: e.target.value })} className="h-8 max-w-xs font-medium" />
                    <Badge variant="outline" className="text-[10px] gap-1"><ArrowRightLeft className="h-3 w-3" />Failover</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <div>
                      <Label className="text-[10px] uppercase">If currency</Label>
                      <Input className="h-8" placeholder="any" value={r.ifCurrency ?? ""} onChange={(e) => updateRouting(r.id, { ifCurrency: e.target.value || undefined })} />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase">If country</Label>
                      <Input className="h-8" placeholder="any" value={r.ifCountry ?? ""} onChange={(e) => updateRouting(r.id, { ifCountry: e.target.value || undefined })} />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase">If channel</Label>
                      <Select value={r.ifChannel ?? "any"} onValueChange={(v) => updateRouting(r.id, { ifChannel: v === "any" ? undefined : v as Channel })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">any</SelectItem>
                          {Object.entries(channelMeta).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase">Amount above ($)</Label>
                      <Input type="number" className="h-8" value={r.ifAmountAbove ?? ""} onChange={(e) => updateRouting(r.id, { ifAmountAbove: e.target.value ? Number(e.target.value) : undefined })} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-[10px] uppercase">Primary</Label>
                      <Select value={r.primary} onValueChange={(v) => updateRouting(r.id, { primary: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {providers.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase">Fallback chain</Label>
                      <div className="flex flex-wrap items-center gap-1 rounded-md border p-2">
                        {r.fallback.map((id, i) => (
                          <Badge key={id} variant="secondary" className="gap-1 text-[10px]">
                            {i + 1}. {providers.find((p) => p.id === id)?.name ?? id}
                            <button className="ml-1 text-muted-foreground hover:text-foreground" onClick={() => updateRouting(r.id, { fallback: r.fallback.filter((x) => x !== id) })}>×</button>
                          </Badge>
                        ))}
                        <Select value="" onValueChange={(v) => v && updateRouting(r.id, { fallback: [...r.fallback, v] })}>
                          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="+ add" /></SelectTrigger>
                          <SelectContent>
                            {providers.filter((p) => p.id !== r.primary && !r.fallback.includes(p.id)).map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Live route preview</CardTitle><CardDescription>How a charge would be routed right now.</CardDescription></CardHeader>
            <CardContent>
              <RoutePreview providers={providers} routing={routing} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Risk & Chargeback ============ */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-500" /> Risk &amp; chargeback controls</CardTitle>
              <CardDescription>Defaults applied across all providers. Each use case can also restrict further.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <RowSlider label="Force 3DS above ($)" value={risk.force3DSAbove} min={0} max={1000} step={10} onChange={(v) => setRisk({ ...risk, force3DSAbove: v })} />
                <RowSlider label="Velocity cap (txns/user/hour)" value={risk.velocityPerHour} min={1} max={50} step={1} onChange={(v) => setRisk({ ...risk, velocityPerHour: v })} />
                <RowSlider label="Chargeback rate guard (%)" value={risk.chargebackRateGuard} min={0.1} max={2} step={0.1} onChange={(v) => setRisk({ ...risk, chargebackRateGuard: v })} hint="Auto-pause provider if 30d rate exceeds this." />
                <RowSlider label="Refund window (days)" value={risk.refundWindowDays} min={0} max={90} step={1} onChange={(v) => setRisk({ ...risk, refundWindowDays: v })} />
                <RowSlider label="AML review threshold ($)" value={risk.aml_threshold} min={1000} max={100000} step={500} onChange={(v) => setRisk({ ...risk, aml_threshold: v })} />
                <RowSlider label="Block if fraud score ≥" value={risk.fraudScore} min={0} max={100} step={5} onChange={(v) => setRisk({ ...risk, fraudScore: v })} />
              </div>
              <Separator />
              <div className="grid gap-3 md:grid-cols-2">
                <RowSwitch label="Block prepaid cards" hint="Prepaid cards drive most subscription chargebacks." checked={risk.blockPrepaid} onChange={(v) => setRisk({ ...risk, blockPrepaid: v })} />
                <RowSwitch label="Block high-risk countries" hint={`Currently blocking: ${highRiskCountries.join(", ")}`} checked={risk.blockHighRiskCountries} onChange={(v) => setRisk({ ...risk, blockHighRiskCountries: v })} />
                <RowSwitch label="Sanctions screening (OFAC, UN, EU)" checked={risk.sanctionsScreen} onChange={(v) => setRisk({ ...risk, sanctionsScreen: v })} />
                <RowSwitch label="Device fingerprint + IP geo-mismatch check" checked={risk.deviceFingerprint} onChange={(v) => setRisk({ ...risk, deviceFingerprint: v })} />
              </div>
              <div className="rounded-md border bg-amber-500/5 p-3 text-xs text-muted-foreground">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
                Tip: route subscriptions through 3DS-mandatory providers (Stripe SCA, SuccessPay) and keep BNPL off recurring rails — issuer chargebacks on BNPL are non-recoverable.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Wallets & Web3 ============ */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" /> Internal wallets &amp; Web3</CardTitle>
              <CardDescription>
                In-app balances (CAPShield, AngelSEED) reduce processor fees on repeat actions; web3 wallets unlock investor / SPV settlement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {providers.filter((p) => p.isWallet || p.channel === "web3").map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md text-lg ${channelMeta[p.channel].cls}`}>{p.logo}</div>
                    <div className="min-w-0">
                      <div className="font-medium">{p.name}</div>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.currencies.map((c) => (<Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusMeta[p.status].cls}>{statusMeta[p.status].label}</Badge>
                    <Switch checked={p.status === "live"} onCheckedChange={(v) => toggleProvider(p.id, v)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Wallet settings</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <RowSwitch label="Allow wallet → wallet P2P transfer" hint="Founders can send credits to mentors." checked={true} onChange={() => {}} />
              <RowSwitch label="Auto-credit refunds to CAPShield" checked={true} onChange={() => {}} />
              <RowSwitch label="Require 2FA for wallet withdrawals" checked={true} onChange={() => {}} />
              <RowSwitch label="Web3: enforce signed nonce per session" checked={true} onChange={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ Payouts ============ */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payouts &amp; reconciliation</CardTitle>
              <CardDescription>How vendors, mentors and investors get paid out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Default payout rail</Label>
                  <Select defaultValue="wise"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{providers.filter((p) => p.payoutDays > 0 || p.channel === "bank" || p.channel === "crypto").map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Payout schedule</Label>
                  <Select defaultValue="weekly"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant (where supported)</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min payout amount ($)</Label>
                  <Input type="number" defaultValue={25} className="h-8" />
                </div>
              </div>
              <Separator />
              <div className="grid gap-3 md:grid-cols-2">
                <RowSwitch label="Hold first payout for 7 days (new payees)" checked={true} onChange={() => {}} hint="Prevents fraud loss on fresh accounts." />
                <RowSwitch label="Auto-convert to USD before payout" checked={false} onChange={() => {}} />
                <RowSwitch label="Generate tax docs (1099 / GST / VAT)" checked={true} onChange={() => {}} />
                <RowSwitch label="Reconcile to Lovable Cloud ledger nightly" checked={true} onChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Provider editor */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.name}</DialogTitle>
            <DialogDescription>Credentials, webhook and processing rules for this provider.</DialogDescription>
          </DialogHeader>
          {editing && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div><Label className="text-xs">API Key (live)</Label><Input type="password" placeholder="sk_live_…" className="h-8 font-mono" /></div>
                  <div><Label className="text-xs">API Key (test)</Label><Input type="password" placeholder="sk_test_…" className="h-8 font-mono" /></div>
                  <div><Label className="text-xs">Webhook secret</Label><Input type="password" placeholder="whsec_…" className="h-8 font-mono" /></div>
                  <div><Label className="text-xs">Account / Merchant ID</Label><Input placeholder="acct_…" className="h-8 font-mono" /></div>
                </div>
                <div><Label className="text-xs">Webhook URL</Label><Input value={editing.webhook} className="h-8 font-mono" readOnly /></div>
                <Separator />
                <div className="grid gap-3 md:grid-cols-2">
                  <RowSwitch label="3DS enforced" checked={editing.threeDS} onChange={(v) => updateProvider(editing.id, { threeDS: v })} />
                  <RowSwitch label="Recurring billing" checked={editing.recurring} onChange={(v) => updateProvider(editing.id, { recurring: v })} />
                  <RowSwitch label="Refunds enabled" checked={editing.refunds} onChange={(v) => updateProvider(editing.id, { refunds: v })} />
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => { setEditing(null); toast.success("Provider saved"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Use case editor */}
      <Dialog open={!!editingUC} onOpenChange={(o) => !o && setEditingUC(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUC?.label}</DialogTitle>
            <DialogDescription>{editingUC?.description}</DialogDescription>
          </DialogHeader>
          {editingUC && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label className="text-xs">Min amount ($)</Label><Input type="number" value={editingUC.minAmount} onChange={(e) => setEditingUC({ ...editingUC, minAmount: Number(e.target.value) })} className="h-8" /></div>
                <div><Label className="text-xs">Max amount ($) — 0 = unlimited</Label><Input type="number" value={editingUC.maxAmount} onChange={(e) => setEditingUC({ ...editingUC, maxAmount: Number(e.target.value) })} className="h-8" /></div>
                <div><Label className="text-xs">KYC required above ($)</Label><Input type="number" value={editingUC.requireKYCAbove} onChange={(e) => setEditingUC({ ...editingUC, requireKYCAbove: Number(e.target.value) })} className="h-8" /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <RowSwitch label="Require 3DS / SCA" checked={editingUC.require3DS} onChange={(v) => setEditingUC({ ...editingUC, require3DS: v })} />
                <RowSwitch label="Block prepaid cards" checked={editingUC.blockPrepaid} onChange={(v) => setEditingUC({ ...editingUC, blockPrepaid: v })} />
              </div>
              <div>
                <Label className="text-xs">Allowed providers</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {providers.map((p) => {
                    const on = editingUC.allowedProviders.includes(p.id);
                    return (
                      <button key={p.id} type="button"
                        onClick={() => setEditingUC({
                          ...editingUC,
                          allowedProviders: on ? editingUC.allowedProviders.filter((x) => x !== p.id) : [...editingUC.allowedProviders, p.id],
                        })}
                        className={`rounded-md border px-2.5 py-1 text-xs ${on ? "border-primary bg-primary/10 text-primary" : ""}`}>{p.name}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUC(null)}>Cancel</Button>
            <Button onClick={() => {
              if (editingUC) updateUseCase(editingUC.key, editingUC);
              setEditingUC(null);
              toast.success("Use case saved");
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${good ? "text-emerald-500" : ""}`}>{value}</div>
    </div>
  );
}

function RowSwitch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function RowSlider({ label, value, min, max, step, onChange, hint }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="font-mono text-xs">{value}</span>
      </div>
      <Slider className="mt-2" value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function RoutePreview({ providers, routing }: { providers: Provider[]; routing: RoutingRule[] }) {
  const [currency, setCurrency] = useState("AED");
  const [amount, setAmount] = useState(50);
  const [channel, setChannel] = useState<Channel | "any">("any");

  const matched = useMemo(() => {
    return routing.filter((r) => {
      if (!r.enabled) return false;
      if (r.ifCurrency && r.ifCurrency !== currency) return false;
      if (r.ifChannel && channel !== "any" && r.ifChannel !== channel) return false;
      if (r.ifAmountAbove && amount < r.ifAmountAbove) return false;
      return true;
    });
  }, [routing, currency, amount, channel]);

  const chosen = matched[0];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <div><Label className="text-[10px] uppercase">Currency</Label><Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="h-8" /></div>
        <div><Label className="text-[10px] uppercase">Amount ($)</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="h-8" /></div>
        <div><Label className="text-[10px] uppercase">Channel</Label>
          <Select value={channel} onValueChange={(v) => setChannel(v as Channel | "any")}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">any</SelectItem>
              <SelectItem value="card">Cards</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="bnpl">BNPL</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="web3">Web3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {chosen ? (
        <div className="rounded-md border bg-muted/20 p-3 text-sm">
          <div className="text-xs text-muted-foreground">Matched rule: <b className="text-foreground">{chosen.name}</b></div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" variant="outline">Primary: {providers.find((p) => p.id === chosen.primary)?.name}</Badge>
            {chosen.fallback.map((id, i) => (<Badge key={id} variant="outline">↳ Fallback #{i + 1}: {providers.find((p) => p.id === id)?.name}</Badge>))}
          </div>
        </div>
      ) : (
        <div className="rounded-md border p-3 text-xs text-muted-foreground">No matching rule — would fall back to global default (Stripe).</div>
      )}
    </div>
  );
}
