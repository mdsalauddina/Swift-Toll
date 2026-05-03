import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('bg-slate-900 backdrop-blur-sm dark:bg-indigo-500', 'bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/80');
content = content.replace('bg-emerald-50 text-emerald-600', 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400');
fs.writeFileSync('src/App.tsx', content);
