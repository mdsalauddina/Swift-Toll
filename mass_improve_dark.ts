import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Mass improve dark mode borders and backgrounds
content = content.replace(/dark:border-slate-700\/50/g, 'dark:border-slate-800/60');
content = content.replace(/dark:border-slate-700/g, 'dark:border-slate-800');
content = content.replace(/dark:bg-slate-800\/80/g, 'dark:bg-slate-800/40');
content = content.replace(/dark:bg-indigo-500\/10/g, 'dark:bg-indigo-500/5');

// Improve input fields in dark mode
content = content.replace(
    /dark:bg-slate-800\/80 dark:border-slate-700\/50 dark:group-focus-within:bg-slate-900/g,
    'dark:bg-slate-900/80 dark:border-slate-800 dark:group-focus-within:bg-slate-950'
);

// Improve the balance card badge/icon area
content = content.replace(
    /dark:bg-indigo-500\/10/g,
    'dark:bg-indigo-500/20'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Mass improved dark mode colors");
