import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
const searchString = `{user?.role === "admin" && (
            <div className="ml-1 sm:ml-4 flex gap-1 bg-slate-100 p-1 rounded-[16px] border border-slate-200 overflow-x-auto hide-scrollbar dark:bg-slate-800/50 dark:border-slate-700">
              <button
                onClick={() => setViewMode("user")}
                className={\`px-3 sm:px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap \${viewMode === "user" ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}\`}
              >
                <span className="hidden sm:inline">ইউজার</span> মোড
              </button>
              <button
                onClick={() => setViewMode("admin")}
                className={\`px-3 sm:px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap \${viewMode === "admin" ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}\`}
              >
                এডমিন<span className="hidden sm:inline"> মোড</span>
              </button>
            </div>
          )}`;
const index = content.indexOf(searchString);
if (index > -1) {
  content = content.replace(searchString, '');
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced fixed string.");
} else {
  // Regex approach
  const regex = /\{user\?\.role === "admin" && \([\s\S]*?\}\)/g;
  content = content.replace(regex, '');
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced regex");
}
