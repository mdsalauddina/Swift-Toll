import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /<Tooltip\n\s*cursor=\{\{ fill: "transparent" \}\}\n\s*contentStyle=\{\{ borderRadius: "12px" \}\}\n\s*\/>/g,
  `<Tooltip
                      cursor={{ fill: isDarkMode ? "rgba(255,255,255,0.05)" : "transparent" }}
                      contentStyle={{ 
                        borderRadius: "16px",
                        border: isDarkMode ? "1px solid #334155" : "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff"
                      }}
                      labelStyle={{ fontWeight: 800, color: isDarkMode ? "#f8fafc" : "#1e293b" }} 
                      itemStyle={{ color: isDarkMode ? "#f8fafc" : "#1e293b" }}
                    />`
);
fs.writeFileSync('src/App.tsx', content);
