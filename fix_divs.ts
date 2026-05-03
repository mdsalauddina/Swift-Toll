import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the </div> after </AnimatePresence>
content = content.replace(
  /<\/AnimatePresence>\s*<\/div>\s*<div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center text-center dark:border-slate-700\/50">/,
  `</AnimatePresence>
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center text-center dark:border-slate-700/50">`
);

// Replace the last </div> before ) : (
content = content.replace(
  /<\/Card>\s*<\/motion\.div>\s*<\/div>\s*<\/div>\s*\) : \(/,
  `</Card>
          </motion.div>
        </div>
      ) : (`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed tags with regex');
