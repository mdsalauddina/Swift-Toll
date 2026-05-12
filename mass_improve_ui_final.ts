import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update Button variants
const buttonVariantsOld = /const variants: any = \{\s+primary:\s+"bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-xl shadow-slate-200 dark:shadow-none",\s+secondary: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",\s+outline:\s+"border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:border-slate-300",\s+ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800\/50",\s+\};/;

const buttonVariantsNew = `const variants: any = {
    primary:
      "bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-xl shadow-slate-200 dark:shadow-none glow-indigo",
    secondary:
      "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20",
    outline:
      "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
    ghost:
      "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50",
  };`;

content = content.replace(buttonVariantsOld, buttonVariantsNew);

// 2. Update stats cards in UserHistoryView
const statsOld = /return \(\s+<div className="space-y-6">\s+<div className="grid grid-cols-2 gap-4">\s+<div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 dark:bg-indigo-500\/5">\s+<p className="text-\[10px\] text-indigo-400 uppercase font-bold tracking-widest mb-1 dark:text-indigo-300">\s+মোট ভ্রমণ\s+<\/p>\s+<p className="text-xl font-display font-bold text-indigo-900 dark:text-indigo-100">\s+\{travels\.length\} বার\s+<\/p>\s+<\/div>\s+<div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 dark:bg-emerald-500\/10">\s+<p className="text-\[10px\] text-emerald-400 uppercase font-bold tracking-widest mb-1">\s+মোট ব্যয়\s+<\/p>\s+<p className="text-xl font-display font-bold text-emerald-900">\s+৳\{travels\.reduce\(\(acc, t\) => acc \+ t\.amount, 0\)\.toLocaleString\(\)\}\s+<\/p>\s+<\/div>\s+<\/div>/;

const statsNew = `return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-500/10 dark:to-transparent dark:border-indigo-500/20">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest dark:text-indigo-300">
              মোট ভ্রমণ
            </p>
            <History className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl font-display font-bold text-indigo-900 dark:text-indigo-100">
            {travels.length} <span className="text-sm font-sans font-medium text-slate-400">বার</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-500/10 dark:to-transparent dark:border-emerald-500/20">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">
              মোট ব্যয়
            </p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-display font-bold text-emerald-900 dark:text-white">
            ৳{travels.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>`;

content = content.replace(statsOld, statsNew);

// 3. Improve navigation glassmorphism
content = content.replace(
    'className="sticky top-0 z-40 px-4 py-3 sm:py-5 glass-morphism flex justify-between items-center"',
    'className="sticky top-0 z-40 px-4 py-3 sm:py-4 glass-morphism flex justify-between items-center dark:bg-slate-950/60 transition-all duration-300"'
);

// 4. Improve overall page padding and colors
content = content.replace(
    '<main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-20 dark:bg-slate-950 transition-colors duration-500">',
    '<main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-10 pb-24 transition-colors duration-500">'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Successfully improved UI via script");
