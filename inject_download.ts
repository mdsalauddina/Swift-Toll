import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = 'const handleDirectRecharge = async (userId: string) => {';
const insertion = `
  const handleDownloadUserData = () => {
    if (!user) return;
    
    let dataToExport: any[] = [];
    if (activeTab === "travel") {
      dataToExport = travelHistory.map(t => ({
        "তারিখ": new Date(t.timestamp).toLocaleString("bn-BD"),
        "প্লাজা": t.plazaName,
        "পরিমাণ": "৳" + t.amount,
        "ধরণ": "টোল"
      }));
    } else {
      dataToExport = balanceHistory.map(b => ({
        "তারিখ": new Date(b.timestamp).toLocaleString("bn-BD"),
        "ধরণ": b.type === "recharge" ? "রিচার্জ" : "টোল",
        "পরিমাণ": "৳" + b.amount,
        "অবস্থা": b.status === "completed" ? "সফল" : b.status === "pending" ? "পেন্ডিং" : "বাতিল"
      }));
    }

    if (dataToExport.length === 0) return alert("ডাউনলোড করার মত কোনো ডাটা নেই");

    const header = Object.keys(dataToExport[0]).join(",");
    const csvRows = dataToExport.map(row => 
      Object.values(row).map(value => '"' + String(value).replace(/"/g, '""') + '"').join(",")
    );
    const csvContent = [header, ...csvRows].join("\\n");
    const blob = new Blob(["\\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = user.name + "_" + (activeTab === "travel" ? "travel" : "payment") + "_history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
`;

// Insert the function before handleDirectRecharge
if (content.includes(anchor)) {
    const parts = content.split(anchor);
    content = parts[0] + insertion + '\n  ' + anchor + parts[1];
    fs.writeFileSync('src/App.tsx', content);
    console.log("Successfully injected handleDownloadUserData");
} else {
    console.log("Could not find anchor point");
}
