import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /fill: "#1e293b",/g,
  'fill: isDarkMode ? "#cbd5e1" : "#1e293b",'
);

fs.writeFileSync('src/App.tsx', content);
