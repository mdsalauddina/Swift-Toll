import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update newUser carType
content = content.replace('carType: "Car",', 'carType: "Car/Jeep",');

// 2. Define the exact options block we want for both locations
const fullOptions = `<option value="Motorcycle">মোটর সাইকেল (৳১০০)</option>
  <option value="Car/Jeep">কার, জীপ (৳৭৫০)</option>
  <option value="Microbus">মাইক্রোবাস (৳১৩০০)</option>
  <option value="Bus">বাস (৳২০০০)</option>`;

// We will replace each specific line globally
content = content.replace(/<option value="Mini Car">ছোট গাড়ি \(৳৬০\)<\/option>/g, '<option value="Motorcycle">মোটর সাইকেল (৳১০০)</option>');
content = content.replace(/<option value="SUV">এসইউভি \(৳৮০\)<\/option>/g, '<option value="Car/Jeep">কার, জীপ (৳৭৫০)</option>');
content = content.replace(/<option value="Bus">বাস \(৳১৫০\)<\/option>/g, '<option value="Microbus">মাইক্রোবাস (৳১৩০০)</option>');
content = content.replace(/<option value="Truck">ট্রাক \(৳৩০০\)<\/option>/g, '<option value="Bus">বাস (৳২০০০)</option>');

content = content.replace(/processToll\(\s+rfid,\s+"RFID টোল গেট",\s+60,\s+\);/, 'processToll(rfid, "RFID টোল গেট");');

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx via script globally with processToll fix");
