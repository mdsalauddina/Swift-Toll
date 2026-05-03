import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const darkMap: Record<string, string> = {
  // Backgrounds
  'bg-white': 'dark:bg-slate-900',
  'bg-slate-50': 'dark:bg-slate-800/80',
  'bg-slate-100': 'dark:bg-slate-800/50',
  'bg-slate-200': 'dark:bg-slate-700/50',
  'bg-[#F9FAFB]': 'dark:bg-slate-950',
  'bg-slate-800': 'dark:bg-indigo-500', 
  'bg-slate-900': 'dark:bg-indigo-500',
  'bg-indigo-50': 'dark:bg-indigo-500/10',
  'bg-emerald-50': 'dark:bg-emerald-500/10',
  'bg-rose-50': 'dark:bg-rose-500/10',
  'bg-amber-50': 'dark:bg-amber-500/10',

  // Hovers
  'hover:bg-slate-50': 'dark:hover:bg-slate-800/80',
  'hover:bg-slate-100': 'dark:hover:bg-slate-800/50',
  'hover:bg-slate-200': 'dark:hover:bg-slate-700/50',
  'hover:bg-slate-800': 'dark:hover:bg-indigo-600',
  'hover:bg-slate-900': 'dark:hover:bg-indigo-600',
  'hover:bg-indigo-50': 'dark:hover:bg-indigo-500/20',
  'hover:bg-indigo-100': 'dark:hover:bg-indigo-500/30',

  // Text
  'text-slate-900': 'dark:text-white',
  'text-slate-800': 'dark:text-slate-100',
  'text-slate-700': 'dark:text-slate-200',
  'text-slate-600': 'dark:text-slate-300',
  'text-slate-500': 'dark:text-slate-400',
  'text-slate-400': 'dark:text-slate-400', 
  
  'text-indigo-900': 'dark:text-indigo-100',
  'text-indigo-700': 'dark:text-indigo-300',
  'text-indigo-600': 'dark:text-indigo-400',
  'text-indigo-500': 'dark:text-indigo-400',
  'text-indigo-400': 'dark:text-indigo-300',
  
  'text-emerald-600': 'dark:text-emerald-400',
  'text-emerald-500': 'dark:text-emerald-400',
  
  'text-amber-600': 'dark:text-amber-400',
  'text-amber-500': 'dark:text-amber-400',
  
  'text-rose-600': 'dark:text-rose-400',
  'text-rose-500': 'dark:text-rose-400',

  // Borders
  'border-slate-50': 'dark:border-slate-800/80',
  'border-slate-100': 'dark:border-slate-700/50',
  'border-slate-200': 'dark:border-slate-700',
  'border-slate-300': 'dark:border-slate-600',
  'border-indigo-100/50': 'dark:border-indigo-500/20',
  'border-indigo-200': 'dark:border-indigo-500/30',
  'border-rose-100': 'dark:border-rose-900/50',

  // Focus
  'focus:bg-white': 'dark:focus:bg-slate-900',
  'focus:ring-indigo-50': 'dark:focus:ring-slate-700',
  'focus:border-indigo-200': 'dark:focus:border-slate-600',
  'group-focus-within:bg-white': 'dark:group-focus-within:bg-slate-900',
  'group-focus-within:ring-indigo-50': 'dark:group-focus-within:ring-slate-700',
  'group-focus-within:border-indigo-200': 'dark:group-focus-within:border-slate-600',

  // Shadows
  'shadow-slate-100': 'dark:shadow-none',
  'shadow-slate-200': 'dark:shadow-slate-900/50',
  'shadow-slate-200/50': 'dark:shadow-slate-900/50',
  'shadow-slate-300': 'dark:shadow-slate-900/80',
};

let fixedContent = content.replace(/className=(["`])(.*?)\1/gs, (match, quote, classes) => {
    if (quote === '`') {
        const parts = classes.split(/(\$\{.*?\})/g);
        let reconstructed = '';
        for (let i = 0; i < parts.length; i++) {
           if (!parts[i].startsWith('${')) {
               const clsArr = parts[i].split(/\s+/).filter(Boolean);
               
               // Remove existing dark classes
               const noDark = clsArr.filter(c => !c.startsWith('dark:'));
               
               // Generate new dark classes
               const newDark = new Set<string>();
               for (const c of noDark) {
                   if (darkMap[c]) {
                       newDark.add(darkMap[c]);
                   }
               }
               
               let str = [...noDark, ...Array.from(newDark)].join(' ');
               
               // Preserve leading and trailing spaces around non-expression segments if needed
               // but split already strips them. We will add a single space to combine safely,
               // but we must be careful around boundaries.
               if (str) {
                 reconstructed += (i > 0 && parts[i].startsWith(' ') ? ' ' : '') + str + (parts[i].endsWith(' ') ? ' ' : ' ');
               } else {
                 if (parts[i].includes(' ')) reconstructed += ' ';
               }
           } else {
             reconstructed += parts[i];
           }
        }
        reconstructed = reconstructed.replace(/\s+/g, ' ').trim();
        return `className=\`${reconstructed}\``;
    } else {
       const clsArr = classes.split(/\s+/).filter(Boolean);
       const noDark = clsArr.filter(c => !c.startsWith('dark:'));
       
       const newDark = new Set<string>();
       for (const c of noDark) {
           if (darkMap[c]) {
               newDark.add(darkMap[c]);
           }
       }
       
       return `className="${[...noDark, ...Array.from(newDark)].join(' ')}"`;
    }
});

fs.writeFileSync('src/App.tsx', fixedContent);
console.log('App.tsx dark mode cleanly regenerated!');
