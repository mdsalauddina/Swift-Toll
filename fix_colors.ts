import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix primary button
content = content.replace(
  '"bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:bg-slate-200 shadow-xl shadow-slate-200 dark:shadow-slate-900/50"',
  '"bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-xl shadow-slate-200 dark:shadow-none"'
);

// We should also check for any raw className matches like that
content = content.replace(
  'dark:bg-slate-200', 
  'dark:bg-indigo-500'
);

// Fix chart colors
// CartesianGrid stroke
content = content.replace(
  /stroke="#f1f5f9"/g,
  'stroke={isDarkMode ? "#334155" : "#f1f5f9"}'
);

// Customizing the tooltips for charts
content = content.replace(
  /labelStyle=\{\{ fontWeight: 800, color: "#1e293b" \}\}/g,
  'labelStyle={{ fontWeight: 800, color: isDarkMode ? "#f8fafc" : "#1e293b" }} itemStyle={{ color: isDarkMode ? "#f8fafc" : "#1e293b" }}'
);

content = content.replace(
  /contentStyle=\{\{\n(.*?)borderRadius: "16px",\n(.*?)border: "none",\n(.*?)boxShadow: "0 10px 15px -3px rgb\(0 0 0 \/ 0\.1\)",\n(.*?)\}\}/g,
  'contentStyle={{\n$1borderRadius: "16px",\n$2border: isDarkMode ? "1px solid #334155" : "none",\n$3boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",\n$4backgroundColor: isDarkMode ? "#1e293b" : "#ffffff"\n}}'
);

// Actually, multiline regex in JS can be tricky, let's just do simple replace with string since it's exact in App.tsx

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed button and graph colors');
