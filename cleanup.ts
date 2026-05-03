import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexes = [
  // Fix bg-slate-900 dark:bg-indigo-600
  { pattern: /dark:bg-slate-900 dark:bg-indigo-600/g, replace: 'dark:bg-slate-900' },
  { pattern: /dark:bg-indigo-600\/40/g, replace: 'bg-slate-900/40' }, // on line 152
  { pattern: /bg-slate-900 dark:bg-indigo-600\/80/g, replace: 'dark:bg-slate-900/80' },
  { pattern: /dark:text-slate-400 dark:text-slate-500/g, replace: 'dark:text-slate-400' },
  { pattern: /dark:text-slate-400 dark:text-slate-300/g, replace: 'dark:text-slate-400' },
  { pattern: /dark:bg-slate-800 dark:bg-slate-200/g, replace: 'dark:bg-slate-800' },
  { pattern: /dark:shadow-slate-900\/50\/50/g, replace: 'dark:shadow-slate-900/50' },
  { pattern: /dark:bg-slate-800\/50 dark:bg-slate-200\/50/g, replace: 'dark:bg-slate-800/50' },
];

for (const { pattern, replace } of regexes) {
    content = content.replace(pattern, replace);
}

// More comprehensive deduplication of tailwind classes
// Let's do it with a function for the whole file
let fixedContent = content.replace(/className=(["`])(.*?)\1/gs, (match, quote, classes) => {
    // some className might have ${} inside if it's a template literal
    if (quote === '`') {
        const parts = classes.split(/(\$\{.*?\})/g);
        for (let i = 0; i < parts.length; i++) {
           if (!parts[i].startsWith('${')) {
               const clsArr = parts[i].split(/\s+/).filter(Boolean);
               const uniqueCls = [...new Set(clsArr)];
               parts[i] = uniqueCls.join(' ') + (parts[i].endsWith(' ') ? ' ' : '') + (parts[i].startsWith(' ') && i > 0 ? ' ' : '');
           }
        }
        return `className=\`${parts.join('')}\``;
    } else {
       const clsArr = classes.split(/\s+/).filter(Boolean);
       const uniqueCls = [...new Set(clsArr)];
       return `className="${uniqueCls.join(' ')}"`;
    }
});

fs.writeFileSync('src/App.tsx', fixedContent);
console.log('App.tsx classes cleaned up');
