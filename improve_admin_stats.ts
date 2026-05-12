import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Refine admin summary stat cards
const adminStat1Old = /<Card className="bg-white border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800\/60">\s+<p className="text-slate-400 text-\[10px\] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 dark:text-slate-400">\s+<TrendingUp className="w-3\.5 h-3\.5 text-indigo-500 dark:text-indigo-400" \/> মোট\s+আদায়কৃত টোল\s+<\/p>\s+<h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">\s+৳\{calculateTotalIncome\(\)\.toLocaleString\(\)\}\s+<\/h3>\s+<p className="text-\[10px\] text-slate-500 font-bold mt-2 flex items-center gap-1 dark:text-slate-400">\s+আজ পর্যন্ত সর্বমোট সংগ্রহ\s+<\/p>\s+<\/Card>/;

const adminStat1New = `<Card icon={TrendingUp} title="মোট আদায়কৃত টোল" subtitle="আজ পর্যন্ত সর্বমোট সংগ্রহ" className="dark:bg-indigo-500/5 dark:border-indigo-500/10 transition-transform hover:scale-[1.02]">
  <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">
    ৳{calculateTotalIncome().toLocaleString()}
  </h3>
</Card>`;

content = content.replace(adminStat1Old, adminStat1New);

// Stat 2: Today's Income
const adminStat2Old = /<Card className="bg-white border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800\/60">\s+<p className="text-slate-400 text-\[10px\] font-bold uppercase tracking-widest mb-2 dark:text-slate-400">\s+আজকের ইনকাম\s+<\/p>\s+<h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">\s+৳\s+\{allTravelHistory[\s\S]+?\.toLocaleString\(\)\}\s+<\/h3>[\s\S]+?<\/Card>/;

const adminStat2New = `<Card icon={Clock} title="আজকের ইনকাম" subtitle="আজকের মোট কালেকশন" className="dark:bg-emerald-500/5 dark:border-emerald-500/10 transition-transform hover:scale-[1.02]">
    <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">
      ৳{allTravelHistory.filter((t) => isSameDay(parseISO(t.timestamp), new Date())).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
    </h3>
    <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" /> {allTravelHistory.filter((t) => isSameDay(parseISO(t.timestamp), new Date())).length} টি ট্রানজ্যাকশন
    </p>
</Card>`;

content = content.replace(adminStat2Old, adminStat2New);

// Stat 3: Recharge Total
const adminStat3Old = /<Card className="bg-white border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800\/60">\s+<p className="text-slate-400 text-\[10px\] font-bold uppercase tracking-widest mb-2 dark:text-slate-400">\s+মোট রিচার্জ আদায়\s+<\/p>\s+<h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">\s+৳\s+\{adminRequests[\s\S]+?\.toLocaleString\(\)\}\s+<\/h3>[\s\S]+?<\/Card>/;

const adminStat3New = `<Card icon={Wallet} title="মোট রিচার্জ আদায়" subtitle="বুটস্ট্র্যাপ ও রিচার্জ ফান্ড" className="dark:bg-amber-500/5 dark:border-amber-500/10 transition-transform hover:scale-[1.02]">
    <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">
      ৳{adminRequests.filter((r) => r.status === "completed").reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
    </h3>
</Card>`;

content = content.replace(adminStat3Old, adminStat3New);

// Stat 4: Top Plaza
const adminStat4Old = /<Card className="bg-white border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800\/60">\s+<p className="text-slate-400 text-\[10px\] font-bold uppercase tracking-widest mb-2 dark:text-slate-400">\s+সর্বোচ্চ ইনকাম প্লাজা\s+<\/p>\s+<h3 className="text-xl font-bold text-slate-900 truncate dark:text-white">[\s\S]+?<\/h3>[\s\S]+?<\/Card>/;

const adminStat4New = `<Card icon={MapPin} title="সর্বোচ্চ ইনকাম প্লাজা" subtitle="সবচেয়ে জনপ্রিয় গেট" className="dark:bg-indigo-500/5 dark:border-indigo-500/10 transition-transform hover:scale-[1.02]">
    <h3 className="text-xl font-bold text-slate-900 truncate dark:text-white mt-1">
      {allTravelHistory.length > 0
        ? Object.entries(
            allTravelHistory.reduce((acc: any, t) => {
              acc[t.plazaName] = (acc[t.plazaName] || 0) + t.amount;
              return acc;
            }, {}),
          ).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A"
        : "---"}
    </h3>
</Card>`;

content = content.replace(adminStat4Old, adminStat4New);

fs.writeFileSync('src/App.tsx', content);
console.log("Successfully improved Admin Stats via script");
