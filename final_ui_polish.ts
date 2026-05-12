import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Refine the Balance Card (User View)
const balanceCardOld = /<Card\s+id="balance-card"\s+className="bg-white border-2 border-slate-200 overflow-hidden relative min-h-\[240px\] flex flex-col justify-between shadow-xl dark:bg-slate-900\/80 dark:border-slate-800 dark:shadow-none dark:backdrop-blur-sm"\s+>\s+<div className="absolute top-\[-20%\] right-\[-10%\] w-64 h-64 bg-indigo-50 rounded-full blur-3xl dark:bg-indigo-500\/5" \/>\s+<div className="absolute bottom-\[-10%\] left-\[-10%\] w-48 h-48 bg-emerald-50 rounded-full blur-3xl dark:bg-emerald-500\/10" \/>\s+[\s\S]+?<\/Card>/;

const balanceCardNew = `<Card 
                id="balance-card" 
                className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-600 dark:to-indigo-900 !p-0 overflow-hidden border-none shadow-[0_20px_50px_-20px_rgba(79,70,229,0.5)] dark:shadow-[0_20px_50px_-20px_rgba(79,70,229,0.3)] min-h-[220px]"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-xl" />
                
                <div className="relative z-10 p-6 flex flex-col h-full justify-between h-[220px]">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-indigo-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">ডিজিটাল টোল কার্ড</span>
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-6 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md shadow-inner" />
                         <span className="text-white font-display font-bold">SMART PASS</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <Car className="w-4 h-4 text-white" />
                       </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-indigo-100/50 text-[10px] font-bold uppercase tracking-widest">বর্তমান ব্যালেন্স</span>
                    <h3 className="text-4xl font-display font-bold text-white flex items-baseline gap-1 mt-1">
                      <span className="text-xl opacity-60">৳</span>
                      {user?.balance.toLocaleString("en-IN")}
                    </h3>
                  </div>

                  <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                       <p className="text-[8px] text-indigo-100/40 uppercase font-black tracking-tighter">গাড়ি নম্বর</p>
                       <p className="text-xs font-bold text-white tracking-widest">{user?.carNumber}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] text-indigo-100/40 uppercase font-black tracking-tighter">RFID ট্যাগ</p>
                       <p className="text-[10px] font-mono font-bold text-white/90">{user?.rfid}</p>
                    </div>
                  </div>
                </div>
              </Card>`;

content = content.replace(balanceCardOld, balanceCardNew);

// 2. Add some spacing and refinement to the notification item
content = content.replace(
    'className={`p-3 rounded-xl mb-1 ${notif.read ? "opacity-75" : "bg-indigo-50/50 dark:bg-indigo-500/5"}`}',
    'className={`p-3 rounded-xl mb-1 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${notif.read ? "opacity-60" : "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-2 border-indigo-500"}`}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Final UI refinements applied");
