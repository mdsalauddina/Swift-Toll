import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update carType map in App.tsx user dashboard profile
// This was already done by my previous edit_file, but let's make sure admin view is also updated.

const adminTableSearch = `<p className="text-xs text-slate-500 font-medium dark:text-slate-400">\\n\\s+{u.carType}\\n\\s+</p>`;
// Use a more generic regex to find and replace
content = content.replace(
    /<p className="text-xs text-slate-500 font-medium dark:text-slate-400">\\s+{u.carType}\\s+<\\/p>/g,
    `<p className="text-xs text-slate-500 font-medium dark:text-slate-400">
                      {u.carType === 'Motorcycle' ? 'মোটর সাইকেল' : 
                       u.carType === 'Car/Jeep' ? 'কার, জীপ' : 
                       u.carType === 'Microbus' ? 'মাইক্রোবাস' : 
                       u.carType === 'Bus' ? 'বাস' : u.carType}
                    </p>`
);

// Update mobile view too
content = content.replace(
    /<h5 className="font-display font-medium text-slate-900 text-sm dark:text-white">\\s+{u\\.name}\\s+<\\/h5>\\s+<p className="text-\[10px\] text-slate-500 font-medium tracking-wide dark:text-slate-400">\\s+RFID: {u\\.rfid \|\| "None"}\\s+<\\/p>/g,
    `<h5 className="font-display font-medium text-slate-900 text-sm dark:text-white">
                      {u.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-500 font-medium tracking-wide dark:text-slate-400">
                        RFID: {u.rfid || "None"}
                      </p>
                      <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold dark:bg-indigo-500/20 dark:text-indigo-400">
                        {u.carType === 'Motorcycle' ? 'মোটর সাইকেল' : 
                         u.carType === 'Car/Jeep' ? 'কার, জীপ' : 
                         u.carType === 'Microbus' ? 'মাইক্রোবাস' : 
                         u.carType === 'Bus' ? 'বাস' : u.carType}
                      </span>
                    </div>`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated vehicle type in admin views via script");
