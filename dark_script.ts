import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements: Record<string, string> = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-800',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800/50',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'text-slate-900': 'text-slate-900 dark:text-white',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'border-slate-100': 'border-slate-100 dark:border-slate-700/50',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'border-white/20': 'border-white/20 dark:border-slate-700/50',
};

for (const [key, val] of Object.entries(replacements)) {
  // Use regex to avoid replacing already replaced ones.
  // e.g. replacing 'bg-white' shouldn't replace 'bg-white dark:bg-slate-900' again if we run it twice, but since it's a one-off we can just do a replaceAll with word boundaries.
  const regex = new RegExp(`\\b${key}\\b(?! dark:)`, 'g');
  content = content.replace(regex, val);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Done modifying App.tsx classes');
