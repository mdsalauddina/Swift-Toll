import * as fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');
const insertBlock = `
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md dark:text-emerald-400 dark:bg-emerald-500/10">
                ৳{(user?.balance ?? 0).toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider dark:text-slate-400">
                {user?.carNumber}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100 transition-all shrink-0 mr-2 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700/50"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100 transition-all shrink-0 dark:bg-slate-800 dark:hover:bg-slate-800/50 dark:border-slate-700/50"
            id="notification-button"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[400px] dark:bg-slate-900 dark:border-slate-700/50"
              >
                <div className="p-4 border-b border-slate-50 bg-slate-50 flex justify-between items-center sticky top-0 dark:bg-slate-800/50 dark:border-slate-700/50">
                  <h4 className="font-bold text-slate-900 text-sm dark:text-white">নোটিফিকেশন</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-[10px] text-indigo-600 font-bold hover:text-indigo-700 uppercase tracking-wider dark:text-indigo-400"
                    >
                      সব পড়ুন
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 hide-scrollbar p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={\`p-3 rounded-xl mb-1 \${notif.read ? "opacity-75" : "bg-indigo-50/50 dark:bg-indigo-500/10"}\`}
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 dark:text-slate-400">
                      কোনো নোটিফিকেশন নেই
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shrink-0 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-4 sm:px-6">
      {viewMode === "user" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card
                id="balance-card"
                className="bg-white border-2 border-slate-200 overflow-hidden relative min-h-[240px] flex flex-col justify-between shadow-xl dark:bg-slate-900 dark:border-slate-700 dark:shadow-none"
              >
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl dark:bg-indigo-500/10" />
                <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-emerald-50 rounded-full blur-3xl dark:bg-emerald-500/10" />
                
                <div className="relative z-10 flex justify-between items-start mb-8">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest dark:text-indigo-400">ব্যালেন্স</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-slate-100 rounded border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700" />
                    <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800/50" />
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 dark:text-slate-400">
                    বর্তমান ব্যালেন্স
                  </p>
                  <h3 className="text-5xl font-display font-bold tracking-tight text-slate-900 flex items-baseline gap-2 dark:text-white">
                    <span className="text-2xl text-indigo-600 font-sans opacity-50 dark:text-indigo-400">৳</span>
                    {user?.balance.toLocaleString("en-IN")}
                  </h3>
                </div>

                <div className="relative z-10 flex justify-between items-end pt-6 border-t border-slate-100 mt-6 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 dark:text-slate-400">
                      গাড়ি নম্বর
                    </p>
                    <p className="font-bold tracking-wide text-lg text-slate-900 dark:text-white">
                      {user?.carNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 dark:text-slate-400">
                      RFID ট্যাগ
                    </p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white">
                      {user?.rfid}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50">
                <span className="text-[8px] text-slate-400 dark:text-slate-400">
                  সর্বশেষ রিচার্জ
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ৳1,500
                </span>
                <span className="text-[8px] text-slate-400 dark:text-slate-400">
                  আজ, ১০:৩০
                </span>
              </div>

              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10 dark:text-slate-400 dark:group-focus-within:text-indigo-400" />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg group-focus-within:text-slate-900 transition-colors dark:text-slate-400 dark:group-focus-within:text-white">
                  ৳
                </span>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="পরিমাণ"
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-indigo-50 group-focus-within:border-indigo-200 transition-all outline-none font-display font-bold text-xl dark:border-slate-700/50 dark:bg-slate-800/80 dark:group-focus-within:bg-slate-900 dark:group-focus-within:ring-slate-700 dark:group-focus-within:border-slate-600"
                />
              </div>

              <Button
                className="w-full mt-3 flex items-center justify-center gap-2 py-4"
                onClick={handleRecharge}
              >
                <Wallet className="w-5 h-5" />
                রকেট দিয়ে রিচার্জ করুন
              </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky top-[88px] bg-[#F9FAFB] z-30 py-2 sm:py-0 sm:bg-transparent dark:bg-slate-950 dark:sm:bg-transparent">
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto dark:bg-slate-800/50">
                <button
                  onClick={() => setActiveTab("travel")}
                  className={\`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all \${activeTab === "travel" ? "bg-white text-slate-900 shadow-md shadow-slate-200/50 dark:bg-slate-900 dark:text-white dark:shadow-slate-900/50" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}\`}
                >
                  ট্রাভেল হিস্ট্রি
                </button>
                <button
                  onClick={() => setActiveTab("balance")}
                  className={\`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all \${activeTab === "balance" ? "bg-white text-slate-900 shadow-md shadow-slate-200/50 dark:bg-slate-900 dark:text-white dark:shadow-slate-900/50" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}\`}
                >
                  রিচার্জ হিস্ট্রি
                </button>
              </div>

              {activeTab === "travel" && (
                <button
                  onClick={() => window.print()}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1.5 group p-2 rounded-xl hover:bg-indigo-50 transition-all self-end sm:self-auto dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  পিডিএফ রিপোর্ট
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-3 pb-8">
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
                            })}`;


let fileLines = content.split('\n');
// We need to replace what was messed up
// Lines 1121 to 1129 is:
// 1121: 
// 1122:   }{" "}
// 1123:   •{" "}
// 1124:   {new Date(
// 1125:   item.timestamp,
// 1126:   ).toLocaleTimeString("bn-BD", {
// 1127:   hour: "2-digit",
// 1128:   minute: "2-digit",
// 1129:   })}

// Find index of this part:
const buggyIndex = fileLines.findIndex(l => l.includes('}{" "}') && fileLines.indexOf(l) > 1115);
if (buggyIndex !== -1) {
    fileLines.splice(buggyIndex-1, 11, insertBlock);
    fs.writeFileSync('src/App.tsx', fileLines.join('\n'));
    console.log("Restored missing App.tsx block!");
} else {
    console.log("Could not find the buggy section to restore.");
}
