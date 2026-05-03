import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const styles: any = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
    pending: "bg-amber-50 text-amber-700 border-amber-100/50",
    cancelled: "bg-rose-50 text-rose-700 border-rose-100/50",
    toll: "bg-indigo-50 text-indigo-700 border-indigo-100/50",
    recharge: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
  };`;

const replacement = `  const styles: any = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    pending: "bg-amber-50 text-amber-700 border-amber-100/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    cancelled: "bg-rose-50 text-rose-700 border-rose-100/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    toll: "bg-indigo-50 text-indigo-700 border-indigo-100/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    recharge: "bg-emerald-50 text-emerald-700 border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Successfully updated Badge styles");
} else {
    // Try with different indentation if it fails
    const target2 = target.replace(/  /g, '\t');
    if (content.includes(target2)) {
        content = content.replace(target2, replacement);
        fs.writeFileSync('src/App.tsx', content);
        console.log("Successfully updated Badge styles (tabs)");
    } else {
        console.log("Could not find Badge styles anchor");
    }
}
