import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const styles: any = \{\s+completed: "bg-emerald-50 text-emerald-700 border-emerald-100\/50",\s+pending: "bg-amber-50 text-amber-700 border-amber-100\/50",\s+cancelled: "bg-rose-50 text-rose-700 border-rose-100\/50",\s+toll: "bg-indigo-50 text-indigo-700 border-indigo-100\/50",\s+recharge: "bg-emerald-50 text-emerald-700 border-emerald-100\/50",\s+\};/;

const replacement = `const styles: any = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    pending: "bg-amber-50 text-amber-700 border-amber-100/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    cancelled: "bg-rose-50 text-rose-700 border-rose-100/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    toll: "bg-indigo-50 text-indigo-700 border-indigo-100/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    recharge: "bg-emerald-50 text-emerald-700 border-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Successfully updated Badge styles with Regex");
} else {
    console.log("Could not find Badge styles with Regex");
    // Just in case, try a more flexible match
    const flexible = /const styles: any = \{[\s\S]+?recharge: "bg-emerald-50 text-emerald-700 border-emerald-100\/50",\s+\};/;
    if (flexible.test(content)) {
        content = content.replace(flexible, replacement);
        fs.writeFileSync('src/App.tsx', content);
        console.log("Successfully updated Badge styles with Flexible Regex");
    } else {
        console.log("Flexible Regex also failed");
    }
}
