import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to find and replace where the dark version isn't already present
const replacements = [
  { pattern: /\bbg-white(?! dark:bg-slate-900)/g, replace: 'bg-white dark:bg-slate-900' },
  { pattern: /\bbg-slate-50(?! dark:bg-slate-800| dark:-| dark:)/g, replace: 'bg-slate-50 dark:bg-slate-800/50' },
  { pattern: /\bbg-slate-100(?! dark:bg-slate-800| dark:-| dark:)/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { pattern: /\bbg-slate-800(?! dark:bg-slate-200| dark:-| dark:)/g, replace: 'bg-slate-800 dark:bg-slate-200' },
  { pattern: /\bbg-slate-900(?! dark:bg-indigo-600| dark:bg-white| dark:|-)/g, replace: 'bg-slate-900 dark:bg-indigo-600' },
  { pattern: /\bbg-\[\#F9FAFB\](?! dark:bg-slate-950)/g, replace: 'bg-[#F9FAFB] dark:bg-slate-950' },
  { pattern: /\btext-slate-900(?! dark:text-white)/g, replace: 'text-slate-900 dark:text-white' },
  { pattern: /\btext-slate-800(?! dark:text-slate-200)/g, replace: 'text-slate-800 dark:text-slate-200' },
  { pattern: /\btext-slate-700(?! dark:text-slate-300)/g, replace: 'text-slate-700 dark:text-slate-300' },
  { pattern: /\btext-slate-600(?! dark:text-slate-400)/g, replace: 'text-slate-600 dark:text-slate-400' },
  { pattern: /\btext-slate-500(?! dark:text-slate-400| dark:-| dark:)/g, replace: 'text-slate-500 dark:text-slate-400' },
  { pattern: /\btext-slate-400(?! dark:text-slate-500)/g, replace: 'text-slate-400 dark:text-slate-500' },
  { pattern: /\border-slate-50(?! dark:border-slate-800\/50| dark:-| dark:)/g, replace: 'border-slate-50 dark:border-slate-800/50' },
  { pattern: /\border-slate-100(?! dark:border-slate-800| dark:-| dark:)/g, replace: 'border-slate-100 dark:border-slate-800' },
  { pattern: /\border-slate-200(?! dark:border-slate-700)/g, replace: 'border-slate-200 dark:border-slate-700' },
  { pattern: /\bshadow-slate-200(?! dark:shadow-slate-900| dark:-| dark:)/g, replace: 'shadow-slate-200 dark:shadow-slate-900/50' },
  { pattern: /\bhover:bg-slate-50(?! dark:hover:bg-slate-800| dark:-| dark:)/g, replace: 'hover:bg-slate-50 dark:hover:bg-slate-800/50' },
  { pattern: /\bhover:bg-slate-100(?! dark:hover:bg-slate-800| dark:-| dark:)/g, replace: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
  { pattern: /\bhover:bg-slate-800(?! dark:hover:bg-indigo-700| dark:-| dark:)/g, replace: 'hover:bg-slate-800 dark:hover:bg-indigo-700' },
];

for (const { pattern, replace } of replacements) {
    content = content.replace(pattern, replace);
}

// Clean up some possible messy duplicate spacing
content = content.replace(/  +/g, ' ');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx dark mode updated aggressively.');
