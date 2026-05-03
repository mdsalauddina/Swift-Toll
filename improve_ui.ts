import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update the PDF button to use our new function
content = content.replace(
    /onClick=\{\(\) => window\.print\(\)\}\s+className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1\.5 group p-2 rounded-xl hover:bg-indigo-50 transition-all self-end sm:self-auto dark:text-indigo-400 dark:hover:bg-indigo-500\/20"/,
    'onClick={handleDownloadUserData} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1.5 group p-2 rounded-xl hover:bg-indigo-50 transition-all self-end sm:self-auto dark:text-indigo-400 dark:hover:bg-indigo-500/20"'
);

content = content.replace('পিডিএফ রিপোর্ট', 'রিপোর্ট ডাউনলোড');

// 2. Global background and dark mode colors
// Improve Card component dark mode borders
content = content.replace(
    'className={`premium-card p-5 sm:p-8 ${className}`}',
    'className={`premium-card p-5 sm:p-8 dark:border-slate-800/50 ${className}`}'
);

// Improve main layout padding and color consistency
content = content.replace(
    '<main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-20">',
    '<main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-20 dark:bg-slate-950 transition-colors duration-500">'
);

// Improve balance card (user view)
content = content.replace(
    'dark:bg-slate-900 dark:border-slate-700 dark:shadow-none',
    'dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none dark:backdrop-blur-sm'
);

// Improve history card (user view)
content = content.replace(
    'className="p-4 sm:p-6 bg-white border-2 border-slate-200 min-h-full flex flex-col shadow-xl dark:bg-slate-900 dark:border-slate-700"',
    'className="p-4 sm:p-6 bg-white border-2 border-slate-200 min-h-full flex flex-col shadow-xl dark:bg-slate-900/60 dark:border-slate-800 dark:backdrop-blur-xl"'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Improved UI and fixed download button");
