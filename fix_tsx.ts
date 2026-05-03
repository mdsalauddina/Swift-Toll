import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the start of the buggy flex container
const targetStart = '<div className="flex-1 flex flex-col gap-3 pb-8">';
const targetEnd = ') : balanceHistory.length > 0 ? (';

const indexStart = content.indexOf(targetStart);
const indexEnd = content.indexOf(targetEnd);

// I will just replace the whole part up to balanceHistory.length > 0 ? (
// so that there are no unmatched tags!
const fixedBlock = `
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-3 pb-8"
              >
                {activeTab === "travel" ? (
                  travelHistory.length > 0 ? (
                    travelHistory.slice(0, 5).map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all flex justify-between items-center dark:bg-slate-800/80 dark:border-transparent dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:shadow-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-900 dark:border-slate-700/50">
                            <MapPin className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-slate-900 text-lg dark:text-white">
                              {item.plazaName}
                            </p>
                            <p className="text-xs text-slate-400 font-semibold tracking-wide mt-0.5 dark:text-slate-400">
                              {new Date(
                                item.timestamp,
                              ).toLocaleDateString("bn-BD", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              •{" "}
                              {new Date(
                                item.timestamp,
                              ).toLocaleTimeString("bn-BD", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-slate-900 text-lg dark:text-white">
                            -৳{item.amount}
                          </p>
                          <Badge status="toll">পরিশোধিত</Badge>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                      <History className="w-16 h-16 mb-4 opacity-10" />
                      <p className="font-medium">
                        এখনো কোনো ট্রাভেল রেকর্ড নেই
                      </p>
                    </div>
                  )
                ) : balanceHistory.length > 0 ? (`;

if (indexStart !== -1 && indexEnd !== -1) {
    const chunkToReplace = content.substring(indexStart, indexEnd + targetEnd.length);
    content = content.replace(chunkToReplace, fixedBlock);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Fixed AnimatePresence mismatch!");
} else {
    console.log("Could not find boundaries.");
}
