import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Deduping identical classes
content = content.replace(/className=(["`])(.*?)\1/gs, (match, quote, classes) => {
    if (quote === '`') {
        const parts = classes.split(/(\$\{.*?\})/g);
        let reconstructed = '';
        for (let i = 0; i < parts.length; i++) {
           if (!parts[i].startsWith('${')) {
               const clsArr = parts[i].split(/\s+/).filter(Boolean);
               const uniqueCls = [...new Set(clsArr)];
               
               let str = uniqueCls.join(' ');
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
       const uniqueCls = [...new Set(clsArr)];
       return `className="${uniqueCls.join(' ')}"`;
    }
});

fs.writeFileSync('src/App.tsx', content);
