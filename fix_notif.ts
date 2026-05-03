import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  'const [showNotifications, setShowNotifications] = useState(false);',
  'const [showNotifications, setShowNotifications] = useState(false);\n  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, read: boolean}[]>([]);\n  const unreadCount = notifications.filter((n) => !n.read).length;'
);
fs.writeFileSync('src/App.tsx', content);
