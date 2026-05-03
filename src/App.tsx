/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
 User as UserIcon,
 CreditCard,
 History,
 Car,
 LogOut,
 LogIn,
 Plus,
 Clock,
 CheckCircle2,
 XCircle,
 ChevronRight,
 TrendingUp,
 MapPin,
 Wallet,
 Trash2,
 Settings,
 Bell,
 Search,
 Download,
 Sun,
 Moon,
 AlertTriangle,
} from "lucide-react";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell,
 AreaChart,
 Area,
} from "recharts";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { User, TravelRecord, BalanceRecord } from "./types";
import { firebaseService } from "./services/firebaseService";
import { db, auth, firebaseConfig } from "./lib/firebase";
import {
 onSnapshot,
 collection,
 query,
 where,
 orderBy,
 doc,
 updateDoc,
 addDoc,
} from "firebase/firestore";

// --- UI Components ---

const Card = ({
 children,
 className = "",
 id,
 title,
}: {
 children: React.ReactNode;
 className?: string;
 id?: string;
 title?: string;
}) => (
 <div id={id} className={`premium-card p-5 sm:p-8 ${className}`}>
 {title && (
 <h4 className="font-display font-bold text-slate-900 dark:text-white mb-6 tracking-tight text-lg sm:text-xl">
 {title}
 </h4>
 )}
 {children}
 </div>
);

const Button = ({
 children,
 onClick,
 variant = "primary",
 className = "",
 id,
 disabled,
 icon: Icon,
 type = "button",
}: any) => {
 const variants: any = {
 primary:
 "bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:bg-slate-200 shadow-xl shadow-slate-200 dark:shadow-slate-900/50",
 secondary: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
 outline:
 "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:border-slate-300",
 ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50",
 };
 return (
 <button
 id={id}
 type={type}
 onClick={onClick}
 disabled={disabled}
 className={`relative min-h-[48px] flex items-center justify-center gap-2.5 px-6 py-3 sm:py-4 rounded-[20px] font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 group ${variants[variant]} ${className}`}
 >
 {Icon && (
 <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
 )}
 <span className="whitespace-nowrap">{children}</span>
 </button>
 );
};

const Badge = ({
 children,
 status,
}: {
 children: React.ReactNode;
 status: string;
}) => {
 const styles: any = {
 completed: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
 pending: "bg-amber-50 text-amber-700 border-amber-100/50",
 cancelled: "bg-rose-50 text-rose-700 border-rose-100/50",
 toll: "bg-indigo-50 text-indigo-700 border-indigo-100/50",
 recharge: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
 };
 return (
 <span
 className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}
 >
 {children}
 </span>
 );
};

const Modal = ({ isOpen, onClose, title, children, id }: any) => (
 <AnimatePresence>
 {isOpen && (
 <div
 id={id}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-left"
 >
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-white dark:bg-slate-900 rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
 >
 <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
 <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
 {title}
 </h3>
 <button
 onClick={onClose}
 className="p-2 -mr-2 hover:bg-slate-100 dark:bg-slate-800/50 rounded-full transition-colors flex shrink-0"
 >
 <XCircle className="w-6 h-6 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600" />
 </button>
 </div>
 <div className="p-6 overflow-y-auto overscroll-contain">
 {children}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
);

// --- Main Pages ---

const UserHistoryView = ({
 userId,
 currentUsers,
}: {
 userId: string;
 currentUsers: User[];
}) => {
 const [travels, setTravels] = useState<TravelRecord[]>([]);
 const [balances, setBalances] = useState<BalanceRecord[]>([]);

 useEffect(() => {
 if (!userId) return;
 const unsubTravel = onSnapshot(
 query(collection(db, "travelHistory"), where("userId", "==", userId)),
 (snap) => {
 const docs = snap.docs.map(
 (d) => ({ id: d.id, ...d.data() }) as TravelRecord,
 );
 setTravels(
 docs.sort(
 (a, b) =>
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
 ),
 );
 },
 );
 const unsubBalance = onSnapshot(
 query(collection(db, "balanceHistory"), where("userId", "==", userId)),
 (snap) => {
 const docs = snap.docs.map(
 (d) => ({ id: d.id, ...d.data() }) as BalanceRecord,
 );
 setBalances(
 docs.sort(
 (a, b) =>
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
 ),
 );
 },
 );
 return () => {
 unsubTravel();
 unsubBalance();
 };
 }, [userId]);

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
 <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mb-1">
 মোট ভ্রমণ
 </p>
 <p className="text-xl font-display font-bold text-indigo-900">
 {travels.length} বার
 </p>
 </div>
 <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
 <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mb-1">
 মোট ব্যয়
 </p>
 <p className="text-xl font-display font-bold text-emerald-900">
 ৳{travels.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
 </p>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <Car className="w-4 h-4" /> ট্রাভেল হিস্টোরি
 </h4>
 {travels.map((item) => (
 <div
 key={item.id}
 className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
 >
 <div>
 <p className="font-bold text-slate-900 dark:text-white text-sm">
 {item.plazaName}
 </p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
 {new Date(item.timestamp).toLocaleString("bn-BD")}
 </p>
 </div>
 <p className="font-bold text-slate-900 dark:text-white">৳{item.amount}</p>
 </div>
 ))}
 {travels.length === 0 && (
 <p className="text-center text-slate-400 dark:text-slate-500 dark:text-slate-400 py-4 text-sm">
 কোনো ট্রাভেল রেকর্ড পাওয়া যায়নি
 </p>
 )}
 </div>

 <div className="space-y-4">
 <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <Wallet className="w-4 h-4" /> ব্যালেন্স ও লেনদেন
 </h4>
 {balances.map((item) => (
 <div
 key={item.id}
 className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
 >
 <div>
 <p className="font-bold text-slate-900 dark:text-white text-sm">
 {item.type === "recharge" ? "রিচার্জ" : "টোল পেমেন্ট"}
 </p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
 {new Date(item.timestamp).toLocaleString("bn-BD")}
 </p>
 {item.note && (
 <p className="text-[10px] text-amber-600 font-medium">
 {item.note}
 </p>
 )}
 </div>
 <div className="text-right">
 <p
 className={`font-bold ${item.type === "recharge" ? "text-emerald-600" : "text-slate-900 dark:text-white"}`}
 >
 {item.type === "recharge" ? "+" : "-"}৳{item.amount}
 </p>
 <Badge status={item.status}>
 {item.status === "completed"
 ? "সফল"
 : item.status === "pending"
 ? "পেন্ডিং"
 : "বাতিল"}
 </Badge>
 </div>
 </div>
 ))}
 {balances.length === 0 && (
 <p className="text-center text-slate-400 dark:text-slate-500 dark:text-slate-400 py-4 text-sm">
 কোনো লেনদেন পাওয়া যায়নি
 </p>
 )}
 </div>
 </div>
 );
};

export default function App() {
 const [viewMode, setViewMode] = useState<"user" | "admin" | null>(null);
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [user, setUser] = useState<User | null>(null);
 const [users, setUsers] = useState<User[]>([]);
 const [travelHistory, setTravelHistory] = useState<TravelRecord[]>([]);
 const [balanceHistory, setBalanceHistory] = useState<BalanceRecord[]>([]);
 const [activeTab, setActiveTab] = useState<"travel" | "balance">("travel");
 const [activeAdminTab, setActiveAdminTab] = useState<
 "requests" | "users" | "reports"
 >("requests");
 const [showHistoryModal, setShowHistoryModal] = useState(false);
 const [showAddUserModal, setShowAddUserModal] = useState(false);
 const [showEditUserModal, setShowEditUserModal] = useState(false);
 const [selectedAdminUser, setSelectedAdminUser] = useState<User | null>(null);
 const [allTravelHistory, setAllTravelHistory] = useState<TravelRecord[]>([]);
 const [userSearch, setUserSearch] = useState("");
 const [reportFilter, setReportFilter] = useState({ date: "", plaza: "all" });
 const [rechargeAmount, setRechargeAmount] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [adminRequests, setAdminRequests] = useState<BalanceRecord[]>([]);

 // Dark Mode & Alerts State
 const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches));
 const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

 // Authentication & New User State
 const [showNotifications, setShowNotifications] = useState(false);
 const [authEmail, setAuthEmail] = useState("");
 const [authPassword, setAuthPassword] = useState("");
 const [authError, setAuthError] = useState("");
 const [newUser, setNewUser] = useState({
 name: "",
 email: "",
 password: "",
 carNumber: "",
 carType: "Car",
 balance: 0,
 rfid: "",
 });
 const [editingUser, setEditingUser] = useState<User | null>(null);

 const refreshData = async () => {
 if (!auth.currentUser) return;
 try {
 if (viewMode === "admin") {
 const allUsers = await firebaseService.getUsers();
 setUsers(allUsers);
 const allTravels = await firebaseService.getAllTravelHistory();
 setAllTravelHistory(allTravels);
 } else if (user) {
 const travels = await firebaseService.getTravelHistory(user.id);
 setTravelHistory(travels);
 const balances = await firebaseService.getBalanceHistory(user.id);
 setBalanceHistory(balances);
 }
 } catch (err) {
 console.error("Refresh error:", err);
 }
 };

 const handleEditUser = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingUser) return;
 await firebaseService.updateUser(editingUser);
 setShowEditUserModal(false);
 refreshData();
 };

 const handleDeleteUser = async (userId: string) => {
 if (confirm("আপনি কি নিশ্চিত যে এই ইউজারটি ডিলিট করতে চান?")) {
 await firebaseService.deleteUser(userId);
 refreshData();
 }
 };

 const handleAdjustBalance = async (userId: string) => {
 const amountStr = prompt(
 "ব্যালেন্স অ্যাডজাস্টমেন্ট পরিমাণ লিখুন (টাকা যোগ করতে পজিটিভ, কাটতে নেগেটিভ সংখ্যা দিন):",
 );
 if (!amountStr || isNaN(parseFloat(amountStr))) return;

 const note = prompt("অ্যাডজাস্টমেন্টের কারণ বা নোট লিখুন:");
 if (!note) return;

 try {
 const result = (await firebaseService.adjustBalance(
 userId,
 parseFloat(amountStr),
 note,
 )) as any;
 if (result && result.success) {
 alert(
 `সফলভাবে ৳${Math.abs(parseFloat(amountStr))} ${parseFloat(amountStr) >= 0 ? "যোগ" : "কাটা"} হয়েছে। বর্তমান ব্যালেন্স: ৳${result.newBalance}`,
 );
 refreshData();
 } else {
 alert("ব্যর্থ হয়েছে: " + (result?.message || "অজানা ত্রুটি"));
 }
 } catch (e: any) {
 let errorMessage = e.message;
 try {
 const parsed = JSON.parse(e.message);
 if (parsed.error) errorMessage = parsed.error;
 } catch (err) {}
 alert("সিস্টেম ত্রুটি: " + errorMessage);
 }
 };

 const handleExportCSV = () => {
 const data = allTravelHistory
 .filter((t) => {
 const matchesPlaza =
 reportFilter.plaza === "all" || t.plazaName === reportFilter.plaza;
 const matchesDate = !reportFilter.date || t.timestamp.startsWith(reportFilter.date);
 return matchesPlaza && matchesDate;
 })
 .map((t) => {
 const u = users.find((user) => user.id === t.userId);
 return {
 "Date & Time": new Date(t.timestamp).toLocaleString("bn-BD"),
 "User Name": u?.name || "Unknown",
 "Car Number": u?.carNumber || "N/A",
 "Plaza Name": t.plazaName,
 Amount: t.amount,
 };
 });

 if (data.length === 0) return alert("কোনো ডাটা পাওয়া যায়নি");

 const header = Object.keys(data[0]).join(",");
 const csvRows = data.map((row) =>
 Object.values(row)
 .map((value) => `"${value}"`)
 .join(","),
 );
 const csvContent = [header, ...csvRows].join("\n");
 const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `toll_report_${new Date().toISOString().split("T")[0]}.csv`;
 link.click();
 URL.revokeObjectURL(url);
 };

 const calculateTotalIncome = () => {
 return allTravelHistory
 .filter((t) => {
 const matchesPlaza =
 reportFilter.plaza === "all" || t.plazaName === reportFilter.plaza;
 const matchesDate =
 !reportFilter.date || t.timestamp.startsWith(reportFilter.date);
 return matchesPlaza && matchesDate;
 })
 .reduce((acc, curr) => acc + curr.amount, 0);
 };

 const handleApproveRecharge = async (
 id: string,
 userId: string,
 amount: number,
 ) => {
 try {
 await firebaseService.approveRecharge(id, userId, amount);
 refreshData();
 alert("Approved successfully.");
 } catch (err: any) {
 console.error("Approval error:", err);
 alert("সফল হয়নি: " + err.message);
 }
 };

 const handleCancelRecharge = async (id: string) => {
 try {
 await firebaseService.cancelRecharge(id);
 refreshData();
 alert("Cancelled successfully.");
 } catch (err: any) {
 console.error("Cancel recharge error:", err);
 alert("সফল হয়নি: " + err.message);
 }
 };

 const handleCreateUser = async (e: React.FormEvent) => {
 e.preventDefault();
 await firebaseService.addUser(newUser);
 setShowAddUserModal(false);
 setNewUser({
 name: "",
 email: "",
 password: "",
 carNumber: "",
 carType: "Car",
 balance: 0,
 rfid: "",
 });
 refreshData();
 };

 const handleDirectRecharge = async (userId: string) => {
 const amountStr = prompt("সরাসরি রিচার্জের পরিমাণ লিখুন (৳):");
 if (amountStr && !isNaN(parseFloat(amountStr))) {
 const amount = parseFloat(amountStr);
 if (amount <= 0) return alert("সঠিক পরিমাণ লিখুন");

 setIsLoading(true);
 try {
 const result = await firebaseService.directRecharge(userId, amount);
 if (result && result.success) {
 alert(`সফলভাবে ৳${amount} রিচার্জ করা হয়েছে।`);
 refreshData();
 } else {
 let errorMessage = result?.message || "অজানা ত্রুটি";
 try {
 const parsed = JSON.parse(errorMessage);
 if (parsed.error) errorMessage = parsed.error;
 } catch (e) {}
 alert("রিচার্জ সফল হয়নি: " + errorMessage);
 }
 } catch (err: any) {
 let errorMessage = err.message;
 try {
 const parsed = JSON.parse(err.message);
 if (parsed.error) errorMessage = parsed.error;
 } catch (e) {}
 alert("ত্রুটি: " + errorMessage);
 } finally {
 setIsLoading(false);
 }
 }
 };

 useEffect(() => {
 // Auth Listener
 const unsubAuth = firebaseService.onAuthChanged((dbUser) => {
 if (dbUser) {
 setUser(dbUser);
 setIsLoggedIn(true);
 setViewMode(dbUser.role === "admin" ? "admin" : "user");
 } else {
 setUser(null);
 setIsLoggedIn(false);
 }
 });

 return () => {
 unsubAuth();
 };
 }, []);

 useEffect(() => {
 if (!isLoggedIn || !user) return;

 refreshData();

 // RFID Scan simulation/listener
 const unsubRfid = firebaseService.listenToRfidScans(async (rfid) => {
 console.log("RFID Scanned:", rfid);
 const result = await firebaseService.processToll(
 rfid,
 "RFID টোল গেট",
 60,
 );
 if (result.success) {
 refreshData();
 }
 });

 let unsubTravels = () => {};
 let unsubUsers = () => {};
 if (user.role === "admin") {
 unsubUsers = onSnapshot(
 collection(db, "users"),
 (snapshot) => {
 const allUsers = snapshot.docs.map(
 (doc) => ({ id: doc.id, ...doc.data() }) as User,
 );
 setUsers(allUsers);
 },
 (err) => console.error("Users sync error:", err),
 );

 unsubTravels = onSnapshot(
 collection(db, "travelHistory"),
 (snapshot) => {
 const allTravels = snapshot.docs.map(
 (doc) => ({ id: doc.id, ...doc.data() }) as TravelRecord,
 );
 setAllTravelHistory(
 allTravels.sort(
 (a, b) =>
 new Date(b.timestamp).getTime() -
 new Date(a.timestamp).getTime(),
 ),
 );
 },
 (err) => console.error("All Travels sync error:", err),
 );
 }

 return () => {
 unsubRfid();
 unsubUsers();
 unsubTravels();
 };
 }, [isLoggedIn, user?.id]);

 useEffect(() => {
 if (!isLoggedIn || viewMode !== "admin") return;

 const q = query(
 collection(db, "balanceHistory"),
 where("type", "==", "recharge"),
 );
 const unsub = onSnapshot(
 q,
 (snap) => {
 const docs = snap.docs.map(
 (d) => ({ id: d.id, ...d.data() }) as BalanceRecord,
 );
 setAdminRequests(
 docs.sort(
 (a, b) =>
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
 ),
 );
 },
 (err) => console.error("Admin request history error:", err),
 );

 return unsub;
 }, [isLoggedIn, viewMode]);

 useEffect(() => {
 if (!isLoggedIn || !user) return;

 const qTravel = query(
 collection(db, "travelHistory"),
 where("userId", "==", user.id),
 );
 const unsubTravel = onSnapshot(
 qTravel,
 (snap) => {
 const docs = snap.docs.map(
 (d) => ({ id: d.id, ...d.data() }) as TravelRecord,
 );
 setTravelHistory(
 docs.sort(
 (a, b) =>
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
 ),
 );
 },
 (err) => console.error("Travel history sync error:", err),
 );

 const qBalance = query(
 collection(db, "balanceHistory"),
 where("userId", "==", user.id),
 );
 const unsubBalance = onSnapshot(
 qBalance,
 (snap) => {
 const docs = snap.docs.map(
 (d) => ({ id: d.id, ...d.data() }) as BalanceRecord,
 );
 setBalanceHistory(
 docs.sort(
 (a, b) =>
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
 ),
 );
 },
 (err) => console.error("Balance history sync error:", err),
 );

 return () => {
 unsubTravel();
 unsubBalance();
 };
 }, [isLoggedIn, user?.id]);

 // --- Real-time Hardware Listener ---
 useEffect(() => {
 // 1. Monitor request (ESP32 -> App)
 const q = query(
 collection(db, "toll_requests"),
 where("status", "==", "pending"),
 );
 const unsubRequest = onSnapshot(q, (snap) => {
 snap.docChanges().forEach((change) => {
 if (change.type === "added") {
 const data = change.doc.data();
 const rfid = data.rfid;
 const tollNumber = data.toll_number;
 if (rfid && tollNumber !== undefined) {
 firebaseService.processPendingTollRequest(
 change.doc.id,
 rfid,
 tollNumber,
 );
 }
 }
 });
 });

 return () => {
 unsubRequest();
 };
 }, []);

 // --- Dark Mode Effect ---
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add("dark");
 localStorage.setItem("theme", "dark");
 } else {
 document.documentElement.classList.remove("dark");
 localStorage.setItem("theme", "light");
 }
 }, [isDarkMode]);

 // --- Low Balance Effect ---
 useEffect(() => {
 if (isLoggedIn && viewMode === "user" && user && user.balance < 100) {
 if (!sessionStorage.getItem("lowBalanceShown_" + user.id)) {
 setShowLowBalanceModal(true);
 sessionStorage.setItem("lowBalanceShown_" + user.id, "true");
 }
 }
 }, [isLoggedIn, viewMode, user]);

 const [authMode, setAuthMode] = useState<"login" | "register">("login");

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 setAuthError("");
 try {
 await firebaseService.login(authEmail, authPassword);
 // onAuthChanged will handle the UI update
 } catch (err: any) {
 console.error("Login Error Details:", err);
 if (err.message && err.message.includes("চালু করা হয়নি")) {
 setAuthError(
 `সার্ভারে লগইন সিস্টেম চালু করা হয়নি। দয়া করে Firebase Console-এ (${firebaseConfig.projectId}) Authentication-এ গিয়ে Email/Password সক্রিয় (Enable) করুন।`,
 );
 } else if (
 err.code === "auth/user-not-found" ||
 err.code === "auth/wrong-password" ||
 err.code === "auth/invalid-credential"
 ) {
 setAuthError("ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করুন।");
 } else {
 setAuthError("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
 }
 } finally {
 setIsLoading(false);
 }
 };

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();

 if (newUser.password && newUser.password.length < 6) {
 setAuthError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
 return;
 }

 setIsLoading(true);
 setAuthError("");
 try {
 const { password, ...userToSave } = newUser;
 await firebaseService.register(
 {
 ...userToSave,
 balance: 0,
 role: "user", // Default role is always user
 rfid:
 newUser.rfid ||
 `RFID-${Math.floor(1000 + Math.random() * 9000).toString()}`,
 },
 password,
 );
 // onAuthChanged will handle the UI update
 } catch (err: any) {
 console.error("Register Error Details:", err);
 if (err.message && err.message.includes("চালু করা হয়নি")) {
 setAuthError(
 `সার্ভারে Email/Password রেজিস্ট্রেশন চালু করা হয়নি। দয়া করে Firebase Console-এ (${firebaseConfig.projectId}) প্রজেক্টটিতে Authentication > Sign-in method-এ গিয়ে "Email/Password" সক্ষম (Enable) করুন।`,
 );
 } else if (err.code === "auth/email-already-in-use") {
 setAuthError("এই ইমেইলটি ইতিপূর্বে ব্যবহার করা হয়েছে।");
 } else if (err.code === "auth/weak-password") {
 setAuthError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
 } else {
 setAuthError("রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
 }
 } finally {
 setIsLoading(false);
 }
 };

 const handleUpdateRole = async (userId: string, currentRole: string) => {
 const newRole = currentRole === "admin" ? "user" : "admin";
 if (
 confirm(
 `আপনি কি নিশ্চিত যে ইউজারটির রোল '${newRole}' এ পরিবর্তন করতে চান?`,
 )
 ) {
 await firebaseService.updateUserRole(userId, newRole);
 refreshData();
 }
 };

 const handleLogout = async () => {
 try {
 await firebaseService.logout();
 } catch (err) {
 console.error("Logout error:", err);
 }
 setIsLoggedIn(false);
 setUser(null);
 setViewMode("user");
 };

 const handleRecharge = async (e: React.FormEvent) => {
 e.preventDefault();
 const amount = parseFloat(rechargeAmount);
 if (isNaN(amount) || amount <= 0 || !user) return;

 setIsLoading(true);
 try {
 await firebaseService.addRechargeRequest(user.id, amount);
 setRechargeAmount("");
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 if (!isLoggedIn || viewMode === null) {
 return (
 <div className="min-h-[100dvh] bg-[#F9FAFB] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
 {/* Background Decorative Elements */}
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl" />

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 className="w-full max-w-md relative z-10"
 >
 <div className="text-center mb-10">
 <motion.div
 initial={{ y: -20 }}
 animate={{ y: 0 }}
 className="w-20 h-20 bg-slate-900 dark:bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-slate-300 overflow-hidden"
 >
 <img
 src="https://i.postimg.cc/L5ZtB5vr/1777431738491-2.jpg"
 alt="Logo"
 className="w-full h-full object-cover"
 />
 </motion.div>
 <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
 SwiftToll
 </h1>
 <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
 স্মার্ট হাইওয়ে, স্মার্ট পেমেন্ট
 </p>
 </div>

 <Card
 id="login-card"
 className="shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 p-6 sm:p-10 mb-6"
 >
 <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8">
 <button
 onClick={() => setAuthMode("login")}
 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authMode === "login" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 লগইন
 </button>
 <button
 onClick={() => setAuthMode("register")}
 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authMode === "register" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 রেজিস্ট্রেশন
 </button>
 </div>

 <AnimatePresence mode="wait">
 {authMode === "login" ? (
 <motion.form
 key="login"
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 10 }}
 onSubmit={handleLogin}
 className="space-y-5"
 >
 <div>
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 ইমেইল ঠিকানা
 </label>
 <input
 type="email"
 value={authEmail}
 onChange={(e) => setAuthEmail(e.target.value)}
 className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 focus:outline-none transition-all font-medium"
 placeholder="name@example.com"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 পাসওয়ার্ড
 </label>
 <input
 type="password"
 value={authPassword}
 onChange={(e) => setAuthPassword(e.target.value)}
 className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 focus:outline-none transition-all font-medium"
 placeholder="••••••••"
 required
 />
 </div>
 {authError && (
 <p className="text-rose-600 text-sm font-semibold text-center">
 {authError}
 </p>
 )}
 <Button
 id="login-button"
 className="w-full mt-4 py-4 text-lg"
 type="submit"
 icon={LogIn}
 >
 প্রবেশ করুন
 </Button>
 </motion.form>
 ) : (
 <motion.form
 key="register"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 onSubmit={handleRegister}
 className="space-y-4"
 >
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 সম্পূর্ণ নাম
 </label>
 <input
 type="text"
 value={newUser.name}
 onChange={(e) =>
 setNewUser({ ...newUser, name: e.target.value })
 }
 className="w-full px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
 placeholder="আপনার নাম"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 গাড়ির নম্বর
 </label>
 <input
 type="text"
 value={newUser.carNumber}
 onChange={(e) =>
 setNewUser({ ...newUser, carNumber: e.target.value })
 }
 className="w-full px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
 placeholder="যেমন: ঢাকা-মেট্রো..."
 required
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 গাড়ির ধরন
 </label>
 <select
 value={newUser.carType}
 onChange={(e) =>
 setNewUser({ ...newUser, carType: e.target.value })
 }
 className="w-full px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none"
 required
 >
 <option value="Mini Car">ছোট গাড়ি (৳৬০)</option>
 <option value="SUV">এসইউভি (৳৮০)</option>
 <option value="Bus">বাস (৳১৫০)</option>
 <option value="Truck">ট্রাক (৳৩০০)</option>
 </select>
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 আপনার ইমেইল
 </label>
 <input
 type="email"
 value={newUser.email}
 onChange={(e) =>
 setNewUser({ ...newUser, email: e.target.value })
 }
 className="w-full px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
 placeholder="email@example.com"
 required
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
 পাসওয়ার্ড
 </label>
 <input
 type="password"
 value={newUser.password}
 onChange={(e) =>
 setNewUser({ ...newUser, password: e.target.value })
 }
 className="w-full px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
 placeholder="••••••••"
 required
 />
 </div>
 </div>
 {authError && (
 <p className="text-rose-600 text-sm font-semibold text-center">
 {authError}
 </p>
 )}
 <Button
 className="w-full mt-4 py-4"
 type="submit"
 disabled={isLoading}
 icon={Plus}
 >
 {isLoading ? "নিবন্ধন হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
 </Button>
 </motion.form>
 )}
 </AnimatePresence>

 <div className="relative pt-6 border-t border-slate-50 mt-6">
 <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
 Secure Registration Gateway
 </p>
 </div>
 </Card>

 <div className="mt-10 flex items-center justify-center gap-6 opacity-30 grayscale contrast-125">
 {/* Mock Partner Logos */}
 <div className="w-8 h-8 bg-slate-400 rounded-full" />
 <div className="w-8 h-8 bg-slate-400 rounded-full" />
 <div className="w-8 h-8 bg-slate-400 rounded-full" />
 </div>

 <p className="text-center text-slate-400 dark:text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-12">
 © 2026 SwiftSystems Engineering
 </p>
 </motion.div>
 </div>
 );
 }

 return (
 <div className="min-h-[100dvh] bg-[#F9FAFB] dark:bg-slate-950 font-sans pb-24 sm:pb-20 pt-2 sm:pt-0">
 {/* Header */}
 <header className="glass-morphism sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-4 mb-6 sm:mb-8">
 <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
 <div className="flex items-center gap-3">
 <motion.div
 whileHover={{ rotate: 5 }}
 className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-slate-900 dark:bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-slate-900/50 overflow-hidden"
 >
 <img
 src="https://i.postimg.cc/L5ZtB5vr/1777431738491-2.jpg"
 alt="Logo"
 className="w-full h-full object-cover"
 />
 </motion.div>
 <div className="hidden lg:block shrink-0">
 <h2 className="font-display font-bold text-slate-900 dark:text-white leading-tight text-xl tracking-tight">
 SwiftToll
 </h2>
 <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold">
 Smart Expressway
 </p>
 </div>

 {user?.role === "admin" && (
 <div className="ml-1 sm:ml-4 flex gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-[16px] border border-slate-200 dark:border-slate-700 overflow-x-auto hide-scrollbar">
 <button
 onClick={() => setViewMode("user")}
 className={`px-3 sm:px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${viewMode === "user" ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 <span className="hidden sm:inline">ইউজার</span> মোড
 </button>
 <button
 onClick={() => setViewMode("admin")}
 className={`px-3 sm:px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${viewMode === "admin" ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 এডমিন<span className="hidden sm:inline"> মোড</span>
 </button>
 </div>
 )}
 </div>

 <div className="flex items-center gap-2 sm:gap-4 shrink-0">
 <div className="text-right hidden sm:block">
 <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
 <div className="flex items-center gap-2 justify-end">
 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
 ৳{(user?.balance ?? 0).toLocaleString()}
 </span>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
 {user?.carNumber}
 </p>
 </div>
 </div>
 
 <div className="relative">
 <button
 onClick={() => setIsDarkMode(!isDarkMode)}
 className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all shrink-0 mr-2"
 title={isDarkMode ? "Light Mode" : "Dark Mode"}
 >
 {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
 </button>
 </div>

 <div className="relative">
 <button
 onClick={() => setShowNotifications(!showNotifications)}
 className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 transition-all shrink-0"
 >
 <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
 <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
 </button>

 <AnimatePresence>
 {showNotifications && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden z-50 flex flex-col max-h-[400px]"
 >
 <div className="p-4 border-b border-slate-50 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0">
 <h4 className="font-bold text-slate-900 dark:text-white text-sm">নোটিফিকেশন</h4>
 <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">লাইভ</span>
 </div>
 <div className="overflow-y-auto p-2">
 {adminRequests.filter(r => r.status === 'pending').map((req) => (
 <div key={req.id} className="p-3 bg-amber-50 rounded-xl mb-2 border border-amber-100">
 <p className="text-xs font-bold text-amber-900">নতুন রিচার্জ রিকোয়েস্ট</p>
 <p className="text-[10px] text-amber-700 mt-1">পরিমাণ: ৳{req.amount} | {new Date(req.timestamp).toLocaleString("bn-BD")}</p>
 </div>
 ))}
 {adminRequests.filter(r => r.status === 'pending').length === 0 && (
 <div className="p-6 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400">
 <Bell className="w-8 h-8 opacity-20 mx-auto mb-2" />
 <p className="text-xs">নতুন কোনো নোটিফিকেশন নেই</p>
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <motion.div
 whileHover={{ scale: 1.05 }}
 className="w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm shrink-0"
 >
 <UserIcon className="w-5 h-5 text-indigo-600" />
 </motion.div>
 <button
 onClick={handleLogout}
 className="p-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shrink-0"
 title="লগআউট"
 >
 <LogOut className="w-5 h-5" />
 </button>
 </div>
 </div>
 </header>

 <main className="max-w-6xl mx-auto px-4 sm:px-6">
 {viewMode === "user" ? (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
 {/* Profile & Balance Card */}
 <div className="lg:col-span-4 space-y-6">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 >
 <Card
 id="balance-card"
 className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[240px] flex flex-col justify-between shadow-xl"
 >
 <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl" />
 <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-emerald-50 rounded-full blur-2xl" />

 <div className="relative z-10">
 <div className="flex items-center justify-between mb-10">
 <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em]">
 <CreditCard className="w-4 h-4" />
 স্মার্ট ডিজিটাল কার্ড
 </div>
 <div className="flex gap-1">
 <div className="w-8 h-5 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700" />
 <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800/50" />
 </div>
 </div>

 <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
 বর্তমান ব্যালেন্স
 </p>
 <h3 className="text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-2">
 <span className="text-2xl text-indigo-600 font-sans">
 ৳
 </span>
 {(user?.balance ?? 0).toLocaleString()}
 </h3>
 </div>

 <div className="relative z-10 space-y-5">
 <div className="flex justify-between items-end pt-6 border-t border-slate-100 dark:border-slate-700/50">
 <div>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
 কার্ড হোল্ডার
 </p>
 <p className="font-bold tracking-wide text-lg text-slate-900 dark:text-white">
 {user?.name || "লোডিং..."}
 </p>
 </div>
 <div className="text-right">
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
 গাড়ি নম্বর
 </p>
 <p className="font-mono font-bold text-slate-900 dark:text-white">
 {user?.carNumber || "---"}
 </p>
 </div>
 </div>
 <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
 <div className="flex flex-col">
 <span className="text-[8px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
 Vehicle Type
 </span>
 <span className="text-indigo-600">
 {user?.carType || "গাড়ির ধরণ"}
 </span>
 </div>
 <div className="flex flex-col text-right">
 <span className="text-[8px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
 RFID Chip ID
 </span>
 <span className="text-emerald-600 font-mono">
 {user?.rfid || "নির্ধারিত নয়"}
 </span>
 </div>
 </div>
 </div>
 </Card>
 </motion.div>

 <Card id="recharge-card" title="কুইক রিচার্জ">
 <form onSubmit={handleRecharge} className="space-y-4">
 <div className="relative group">
 <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold text-lg group-focus-within:text-slate-900 dark:text-white transition-colors">
 ৳
 </span>
 <input
 type="number"
 value={rechargeAmount}
 onChange={(e) => setRechargeAmount(e.target.value)}
 placeholder="পরিমাণ"
 className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 group-focus-within:bg-white dark:bg-slate-900 group-focus-within:ring-4 group-focus-within:ring-indigo-50 group-focus-within:border-indigo-200 transition-all outline-none font-display font-bold text-xl"
 required
 />
 </div>
 <Button
 id="recharge-button"
 className="w-full py-4 text-lg"
 type="submit"
 disabled={isLoading}
 icon={TrendingUp}
 >
 {isLoading ? "প্রক্রিয়াকরণ..." : "এখনই রিচার্জ করুন"}
 </Button>
 </form>
 </Card>
 </div>

 {/* History Section */}
 <div className="lg:col-span-8 space-y-6">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 >
 <Card className="flex flex-col h-full min-h-[600px]">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
 <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full sm:w-auto">
 <button
 onClick={() => setActiveTab("travel")}
 className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "travel" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md shadow-slate-200 dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 ট্রাভেল হিস্টোরি
 </button>
 <button
 onClick={() => setActiveTab("balance")}
 className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "balance" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md shadow-slate-200 dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 লেনদেন
 </button>
 </div>
 <button
 onClick={() => setShowHistoryModal(true)}
 className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1.5 group p-2 rounded-xl hover:bg-indigo-50 transition-all self-end sm:self-auto"
 >
 সব দেখুন{" "}
 <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>

 <div className="flex-1 space-y-4">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="space-y-4"
 >
 {activeTab === "travel" ? (
 travelHistory.length > 0 ? (
 travelHistory.slice(0, 6).map((item, idx) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05 }}
 className="group p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-slate-100 transition-all flex justify-between items-center"
 >
 <div className="flex items-center gap-5">
 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
 <MapPin className="w-6 h-6 text-indigo-500" />
 </div>
 <div>
 <p className="font-display font-bold text-slate-900 dark:text-white text-lg">
 {item.plazaName}
 </p>
 <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold tracking-wide mt-0.5">
 {new Date(
 item.timestamp,
 ).toLocaleDateString("bn-BD", {
 day: "numeric",
 month: "long",
 year: "numeric",
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
 <p className="font-display font-bold text-slate-900 dark:text-white text-lg">
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
 ) : balanceHistory.length > 0 ? (
 balanceHistory.slice(0, 6).map((item, idx) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05 }}
 className="group p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-slate-100 transition-all flex justify-between items-center"
 >
 <div className="flex items-center gap-5">
 <div
 className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${item.type === "recharge" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 dark:text-slate-400"}`}
 >
 {item.type === "recharge" ? (
 <TrendingUp className="w-6 h-6" />
 ) : (
 <Clock className="w-6 h-6" />
 )}
 </div>
 <div>
 <p className="font-display font-bold text-slate-900 dark:text-white text-lg">
 {item.type === "recharge"
 ? "রিচার্জ"
 : "টোল পেমেন্ট"}
 </p>
 <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold tracking-wide mt-0.5">
 {new Date(
 item.timestamp,
 ).toLocaleDateString("bn-BD", {
 day: "numeric",
 month: "long",
 hour: "numeric",
 minute: "numeric",
 })}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p
 className={`font-display font-bold text-lg ${item.type === "recharge" ? "text-emerald-600" : "text-slate-900 dark:text-white"}`}
 >
 {item.type === "recharge" ? "+" : "-"}৳
 {item.amount}
 </p>
 <Badge status={item.status}>
 {item.status === "completed"
 ? "সফল"
 : item.status === "pending"
 ? "পেন্ডিং"
 : "বাতিল"}
 </Badge>
 </div>
 </motion.div>
 ))
 ) : (
 <div className="flex flex-col items-center justify-center py-32 text-slate-300">
 <History className="w-16 h-16 mb-4 opacity-10" />
 <p className="font-medium">
 কোনো লেনদেন পাওয়া যায়নি
 </p>
 </div>
 )}
 </motion.div>
 </AnimatePresence>
 </div>

 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
 Secure Transaction Node
 </p>
 </div>
 <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 max-w-sm">
 যেকোনো সমস্যা বা ভুলের জন্য আমাদের সাপোর্ট টিমে ১৬XXX
 নম্বরে যোগাযোগ করুন।
 </p>
 </div>
 </Card>
 </motion.div>
 </div>
 </div>
 ) : (
 <div className="space-y-8">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div>
 <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
 অ্যাডমিন কন্ট্রোল
 </h3>
 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
 সিস্টেমের সকল কার্যক্রম এখান থেকে পরিচালনা করুন
 </p>
 </div>
 <div className="flex gap-1.5 bg-slate-200 dark:bg-slate-700/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto hide-scrollbar">
 <button
 onClick={() => setActiveAdminTab("requests")}
 className={`shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeAdminTab === "requests" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg shadow-slate-200 dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 অনুরোধ (
 {adminRequests.filter((r) => r.status === "pending").length})
 </button>
 <button
 onClick={() => setActiveAdminTab("users")}
 className={`shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeAdminTab === "users" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg shadow-slate-200 dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 ব্যবহারকারীগণ
 </button>
 <button
 onClick={() => setActiveAdminTab("reports")}
 className={`shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeAdminTab === "reports" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-lg shadow-slate-200 dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}
 >
 ইনকাম রিপোর্ট
 </button>
 </div>
 </div>

 {activeAdminTab === "requests" ? (
 <div className="space-y-8">
 <Card title="রিচার্জ অনুরোধ">
 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
 <div>
 <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1">
 পেন্ডিং অনুরোধ
 </p>
 <p className="text-3xl font-display font-bold text-amber-900">
 {
 adminRequests.filter((r) => r.status === "pending")
 .length
 }
 </p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-amber-500 shadow-sm">
 <Clock className="w-6 h-6" />
 </div>
 </div>
 <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
 <div>
 <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest mb-1">
 আজকের অনুমোদিত
 </p>
 <p className="text-3xl font-display font-bold text-emerald-900">
 ৳
 {adminRequests
 .filter(
 (r) =>
 r.status === "completed" &&
 isSameDay(parseISO(r.timestamp), new Date()),
 )
 .reduce((acc, r) => acc + r.amount, 0)
 .toLocaleString()}
 </p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500 shadow-sm">
 <CheckCircle2 className="w-6 h-6" />
 </div>
 </div>
 </div>
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-700/50 italic font-display">
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 ব্যবহারকারী
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 পরিমাণ
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 সময়
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 স্ট্যাটাস
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4 text-right">
 অ্যাকশন
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {adminRequests.map((item) => {
 const requestUser = users.find(
 (u) => u.id === item.userId,
 );
 return (
 <tr
 key={item.id}
 className="group hover:bg-slate-50 dark:bg-slate-800/50 transition-colors"
 >
 <td className="py-5 px-4">
 <p className="font-display font-bold text-slate-900 dark:text-white">
 {requestUser?.name || "Unknown"}
 </p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold tracking-wider">
 {requestUser?.carNumber || "N/A"}
 </p>
 </td>
 <td className="py-5 px-4">
 <p className="font-display font-bold text-slate-900 dark:text-white text-lg">
 ৳{item.amount}
 </p>
 </td>
 <td className="py-5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
 {new Date(item.timestamp).toLocaleString(
 "bn-BD",
 )}
 </td>
 <td className="py-5 px-4">
 <Badge status={item.status}>
 {item.status === "completed"
 ? "সফল"
 : item.status === "pending"
 ? "পেন্ডিং"
 : "বাতিল"}
 </Badge>
 </td>
 <td className="py-5 px-4">
 {item.status === "pending" && (
 <div className="flex gap-2 justify-end">
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleApproveRecharge(
 item.id,
 item.userId,
 item.amount,
 );
 }}
 className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors shadow-sm"
 title="অনুমোদন করুন"
 >
 <CheckCircle2 className="w-5 h-5" />
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleCancelRecharge(item.id);
 }}
 className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors shadow-sm"
 title="বাতিল করুন"
 >
 <XCircle className="w-5 h-5" />
 </button>
 </div>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Mobile View Requests */}
 <div className="md:hidden space-y-3">
 {adminRequests.map((item) => {
 const requestUser = users.find(
 (u) => u.id === item.userId,
 );
 return (
 <div
 key={item.id}
 className="p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3"
 >
 <div className="flex justify-between items-center">
 <div>
 <p className="font-display font-medium text-slate-900 dark:text-white text-sm">
 {requestUser?.name || "Unknown"}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
 {requestUser?.carNumber || "N/A"}
 </p>
 </div>
 <Badge status={item.status}>
 {item.status === "completed"
 ? "সফল"
 : item.status === "pending"
 ? "পেন্ডিং"
 : "বাতিল"}
 </Badge>
 </div>
 <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 px-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
 <p className="text-xl font-display font-bold text-slate-900 dark:text-white">
 ৳{item.amount}
 </p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">
 {new Date(item.timestamp).toLocaleString(
 "bn-BD",
 {
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 },
 )}
 </p>
 </div>
 {item.status === "pending" && (
 <div className="flex gap-2">
 <button
 className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
 onClick={() =>
 handleApproveRecharge(
 item.id,
 item.userId,
 item.amount,
 )
 }
 >
 <CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদন
 </button>
 <button
 className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 rounded-lg py-2 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
 onClick={() => handleCancelRecharge(item.id)}
 >
 <XCircle className="w-3.5 h-3.5" /> বাতিল
 </button>
 </div>
 )}
 </div>
 );
 })}
 </div>

 {adminRequests.length === 0 && (
 <div className="py-32 text-center text-slate-300">
 <Clock className="w-12 h-12 mx-auto mb-4 opacity-10" />
 <p className="font-medium">
 কোনো পেন্ডিং রিচার্জ অনুরোধ নেই
 </p>
 </div>
 )}
 </Card>
 </div>
 ) : activeAdminTab === "users" ? (
 <div className="space-y-8">
 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
 <div className="relative w-full sm:w-80">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
 <input
 type="text"
 placeholder="ইউজার বা গাড়ি খুঁজুন..."
 value={userSearch}
 onChange={(e) => setUserSearch(e.target.value)}
 className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium"
 />
 </div>
 <Button
 onClick={() => setShowAddUserModal(true)}
 icon={Plus}
 className="w-full sm:w-auto shadow-lg shadow-indigo-100"
 >
 নতুন ব্যবহারকারী
 </Button>
 </div>

 <Card title="ইউজার ম্যানেজমেন্ট">
 <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
 <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mb-1">
 মোট ইউজার
 </p>
 <p className="text-2xl font-display font-bold text-indigo-900">
 {users.length}
 </p>
 </div>
 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
 <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mb-1">
 মোট ব্যালেন্স
 </p>
 <p className="text-2xl font-display font-bold text-emerald-900">
 ৳
 {users
 .reduce((acc, u) => acc + (u.balance || 0), 0)
 .toLocaleString()}
 </p>
 </div>
 <div className="p-4 bg-slate-900 dark:bg-indigo-600 rounded-2xl">
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">
 মোট টোল কালেকশন
 </p>
 <p className="text-2xl font-display font-bold text-white">
 ৳{calculateTotalIncome().toLocaleString()}
 </p>
 </div>
 </div>

 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-700/50 italic font-display">
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 নাম ও RFID
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 গাড়ির তথ্য
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 ব্যালেন্স
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4 text-right">
 অ্যাকশন
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {users
 .filter(
 (u) =>
 u.name
 .toLowerCase()
 .includes(userSearch.toLowerCase()) ||
 u.carNumber
 .toLowerCase()
 .includes(userSearch.toLowerCase()) ||
 u.email
 .toLowerCase()
 .includes(userSearch.toLowerCase()),
 )
 .map((u) => (
 <tr
 key={u.id}
 className="group hover:bg-slate-50 dark:bg-slate-800/50 transition-colors"
 >
 <td className="py-6 px-4">
 <p className="font-display font-bold text-slate-900 dark:text-white text-lg">
 {u.name}
 </p>
 <div className="flex items-center gap-2 mt-1">
 <Badge status={u.role}>
 {u.role === "admin" ? "এডমিন" : "ইউজার"}
 </Badge>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
 RFID: {u.rfid || "Not Set"}
 </p>
 </div>
 </td>
 <td className="py-6 px-4">
 <p className="font-mono font-bold text-slate-700 dark:text-slate-300">
 {u.carNumber}
 </p>
 <div className="mt-1">
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 {u.carType}
 </p>
 </div>
 </td>
 <td className="py-6 px-4">
 <p className="font-display font-bold text-slate-900 dark:text-white text-xl">
 ৳{u.balance.toLocaleString()}
 </p>
 </td>
 <td className="py-6 px-4">
 <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
 <button
 onClick={() =>
 handleUpdateRole(u.id, u.role)
 }
 className="p-3 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:bg-slate-700 transition-colors shadow-sm"
 title="রোল পরিবর্তন"
 >
 <Settings className="w-5 h-5" />
 </button>
 <button
 onClick={() => {
 setSelectedAdminUser(u);
 setShowHistoryModal(true);
 }}
 className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors shadow-sm"
 title="হিস্টোরি"
 >
 <History className="w-5 h-5" />
 </button>
 <button
 onClick={() => handleDirectRecharge(u.id)}
 className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors shadow-sm"
 title="রিচার্জ"
 >
 <Plus className="w-5 h-5" />
 </button>
 <button
 onClick={() => handleAdjustBalance(u.id)}
 className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors shadow-sm"
 title="অ্যাডজাস্ট"
 >
 <Wallet className="w-5 h-5" />
 </button>
 <button
 onClick={() => {
 setEditingUser(u);
 setShowEditUserModal(true);
 }}
 className="p-3 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:bg-slate-700 transition-colors shadow-sm"
 title="সম্পাদনা"
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 <button
 onClick={() => handleDeleteUser(u.id)}
 className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors shadow-sm"
 title="ডিলিট"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile User Cards */}
 <div className="md:hidden space-y-3">
 {users
 .filter(
 (u) =>
 u.name
 .toLowerCase()
 .includes(userSearch.toLowerCase()) ||
 u.carNumber
 .toLowerCase()
 .includes(userSearch.toLowerCase()) ||
 u.email
 .toLowerCase()
 .includes(userSearch.toLowerCase()),
 )
 .map((u) => (
 <div
 key={u.id}
 className="p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3"
 >
 <div className="flex justify-between items-start">
 <div>
 <h5 className="font-display font-medium text-slate-900 dark:text-white text-sm">
 {u.name}
 </h5>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
 RFID: {u.rfid || "None"}
 </p>
 </div>
 <div className="text-right">
 <p className="font-display font-bold text-slate-900 dark:text-white text-lg">
 ৳{u.balance.toLocaleString()}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
 {u.carNumber}
 </p>
 </div>
 </div>
 <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/50">
 <button
 onClick={() => {
 setSelectedAdminUser(u);
 setShowHistoryModal(true);
 }}
 className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-indigo-600 transition-colors active:bg-slate-50 dark:bg-slate-800"
 >
 <History className="w-4 h-4" />
 <span className="text-[8px] font-bold uppercase tracking-tighter">
 হিস্টোরি
 </span>
 </button>
 <button
 onClick={() => handleDirectRecharge(u.id)}
 className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-emerald-600 transition-colors active:bg-slate-50 dark:bg-slate-800"
 >
 <Plus className="w-4 h-4" />
 <span className="text-[8px] font-bold uppercase tracking-tighter">
 রিচার্জ
 </span>
 </button>
 <button
 onClick={() => handleAdjustBalance(u.id)}
 className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-amber-600 transition-colors active:bg-slate-50 dark:bg-slate-800"
 >
 <Wallet className="w-4 h-4" />
 <span className="text-[8px] font-bold uppercase tracking-tighter">
 সমন্বয়
 </span>
 </button>
 <button
 onClick={() => handleUpdateRole(u.id, u.role)}
 className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 transition-colors active:bg-slate-50 dark:bg-slate-800"
 >
 <Settings className="w-4 h-4" />
 <span className="text-[8px] font-bold uppercase tracking-tighter">
 রোল
 </span>
 </button>
 <button
 onClick={() => {
 setEditingUser(u);
 setShowEditUserModal(true);
 }}
 className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 transition-colors active:bg-slate-50 dark:bg-slate-800"
 >
 <ChevronRight className="w-4 h-4" />
 <span className="text-[8px] font-bold uppercase tracking-tighter">
 এডিট
 </span>
 </button>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 ) : (
 <div className="space-y-8">
 <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white">
 ইনকাম এবং ট্রানজ্যাকশন রিপোর্ট
 </h4>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
 পূর্ণ রিপোর্ট জেনারেট করুন
 </p>
 </div>
 <button
 onClick={() => window.print()}
 className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 dark:bg-slate-200 transition-all shadow-lg shadow-slate-100"
 >
 <Download className="w-4 h-4" /> ডাউনলোড পিডিএফ
 </button>
 </div>

 {/* 1. Summary Statistics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/50 p-6">
 <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
 <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> মোট
 আদায়কৃত টোল
 </p>
 <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
 ৳{calculateTotalIncome().toLocaleString()}
 </h3>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2 flex items-center gap-1">
 আজ পর্যন্ত সর্বমোট সংগ্রহ
 </p>
 </Card>

 <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/50 p-6">
 <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
 আজকের ইনকাম
 </p>
 <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
 ৳
 {allTravelHistory
 .filter((t) =>
 isSameDay(parseISO(t.timestamp), new Date()),
 )
 .reduce((acc, t) => acc + t.amount, 0)
 .toLocaleString()}
 </h3>
 <p className="text-[10px] text-indigo-500 font-bold mt-2">
 {
 allTravelHistory.filter((t) =>
 isSameDay(parseISO(t.timestamp), new Date()),
 ).length
 }{" "}
 টি ট্রানজ্যাকশন
 </p>
 </Card>

 <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/50 p-6">
 <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
 মোট রিচার্জ আদায়
 </p>
 <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
 ৳
 {adminRequests
 .filter((r) => r.status === "completed")
 .reduce((acc, r) => acc + r.amount, 0)
 .toLocaleString()}
 </h3>
 <p className="text-[10px] text-indigo-500 font-bold mt-2">
 রিচার্জ ও অ্যাডজাস্টমেন্ট
 </p>
 </Card>

 <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/50 p-6">
 <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
 সর্বোচ্চ ইনকাম প্লাজা
 </p>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
 {allTravelHistory.length > 0
 ? Object.entries(
 allTravelHistory.reduce((acc: any, t) => {
 acc[t.plazaName] =
 (acc[t.plazaName] || 0) + t.amount;
 return acc;
 }, {}),
 ).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
 "N/A"
 : "---"}
 </h3>
 <p className="text-[10px] text-emerald-500 font-bold mt-2">
 সবচেয়ে জনপ্রিয়
 </p>
 </Card>
 </div>

 {/* 2. Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 <Card
 title="রেভিনিউ ট্রেন্ড (গত ৭ দিন)"
 className="lg:col-span-8"
 >
 <div className="h-[300px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart
 data={Array.from({ length: 7 }).map((_, i) => {
 const date = subDays(new Date(), 6 - i);
 const amount = allTravelHistory
 .filter((t) =>
 isSameDay(parseISO(t.timestamp), date),
 )
 .reduce((acc, t) => acc + t.amount, 0);
 return {
 name: format(date, "EEE", { locale: bn }),
 amount: amount,
 displayDate: format(date, "dd MMM", {
 locale: bn,
 }),
 };
 })}
 margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
 >
 <defs>
 <linearGradient
 id="colorAmount"
 x1="0"
 y1="0"
 x2="0"
 y2="1"
 >
 <stop
 offset="5%"
 stopColor="#6366f1"
 stopOpacity={0.1}
 />
 <stop
 offset="95%"
 stopColor="#6366f1"
 stopOpacity={0}
 />
 </linearGradient>
 </defs>
 <CartesianGrid
 strokeDasharray="3 3"
 vertical={false}
 stroke="#f1f5f9"
 />
 <XAxis
 dataKey="name"
 axisLine={false}
 tickLine={false}
 tick={{
 fontSize: 10,
 fontWeight: 700,
 fill: "#94a3b8",
 }}
 dy={10}
 />
 <YAxis
 axisLine={false}
 tickLine={false}
 tick={{
 fontSize: 10,
 fontWeight: 700,
 fill: "#94a3b8",
 }}
 />
 <Tooltip
 contentStyle={{
 borderRadius: "16px",
 border: "none",
 boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
 }}
 labelStyle={{ fontWeight: 800, color: "#1e293b" }}
 />
 <Area
 type="monotone"
 dataKey="amount"
 stroke="#6366f1"
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorAmount)"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </Card>

 <Card
 title="প্লাজা ভিত্তিক কালেকশন"
 className="lg:col-span-4"
 >
 <div className="h-[300px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={Object.entries(
 allTravelHistory.reduce((acc: any, t) => {
 acc[t.plazaName] =
 (acc[t.plazaName] || 0) + t.amount;
 return acc;
 }, {}),
 ).map(([name, value]) => ({ name, value }))}
 layout="vertical"
 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
 >
 <XAxis type="number" hide />
 <YAxis
 dataKey="name"
 type="category"
 axisLine={false}
 tickLine={false}
 tick={{
 fontSize: 10,
 fontWeight: 700,
 fill: "#1e293b",
 }}
 width={80}
 />
 <Tooltip
 cursor={{ fill: "transparent" }}
 contentStyle={{ borderRadius: "12px" }}
 />
 <Bar dataKey="value" radius={[0, 4, 4, 0]}>
 {Object.entries(
 allTravelHistory.reduce((acc: any, t) => {
 acc[t.plazaName] =
 (acc[t.plazaName] || 0) + t.amount;
 return acc;
 }, {}),
 ).map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={index % 2 === 0 ? "#6366f1" : "#10b981"}
 />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>
 </div>

 {/* 3. Detailed Filters & List */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
 <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">
 তারিখ ফিল্টার
 </label>
 <input
 type="date"
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
 value={reportFilter.date}
 onChange={(e) =>
 setReportFilter({
 ...reportFilter,
 date: e.target.value,
 })
 }
 />
 </Card>

 <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
 <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">
 টোল প্লাজা নির্বাচন
 </label>
 <select
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-bold outline-none appearance-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
 value={reportFilter.plaza}
 onChange={(e) =>
 setReportFilter({
 ...reportFilter,
 plaza: e.target.value,
 })
 }
 >
 <option value="all">সকল টোল প্লাজা</option>
 {Array.from(
 new Set(allTravelHistory.map((t) => t.plazaName)),
 ).map((p) => (
 <option key={p} value={p}>
 {p}
 </option>
 ))}
 </select>
 </Card>
 </div>

 <div className="flex items-center justify-between mb-4">
 <h4 className="font-display font-bold text-slate-900 dark:text-white tracking-tight text-lg sm:text-xl">
 লেনদেন রিপোর্ট (বিস্তারিত)
 </h4>
 <Button
 variant="outline"
 className="!py-2 !px-4 !min-h-[36px] text-sm"
 onClick={handleExportCSV}
 icon={Download}
 >
 CSV ডাউনলোড
 </Button>
 </div>
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-700/50 italic font-display">
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 ব্যবহারকারী
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 প্লাজা
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 পরিমাণ
 </th>
 <th className="py-5 font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest px-4">
 সময়
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 text-sm">
 {allTravelHistory
 .filter((t) => {
 const matchesPlaza =
 reportFilter.plaza === "all" ||
 t.plazaName === reportFilter.plaza;
 const matchesDate =
 !reportFilter.date ||
 t.timestamp.startsWith(reportFilter.date);
 return matchesPlaza && matchesDate;
 })
 .slice(0, 100) // Show last 100
 .map((t) => {
 const u = users.find(
 (user) => user.id === t.userId,
 );
 return (
 <tr
 key={t.id}
 className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors"
 >
 <td className="py-5 px-4 font-bold text-slate-800 dark:text-slate-200 dark:text-slate-100">
 <p>{u?.name || "Unknown"}</p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold tracking-wider">
 {u?.carNumber || "N/A"}
 </p>
 </td>
 <td className="py-5 px-4 text-slate-600 dark:text-slate-400 font-medium">
 {t.plazaName}
 </td>
 <td className="py-5 px-4 font-display font-bold text-slate-900 dark:text-white">
 ৳{t.amount}
 </td>
 <td className="py-5 px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
 {new Date(t.timestamp).toLocaleString(
 "bn-BD",
 {
 day: "2-digit",
 month: "2-digit",
 year: "2-digit",
 hour: "2-digit",
 minute: "2-digit",
 },
 )}
 </td>
 </tr>
 );
 })}
 {allTravelHistory.length === 0 && (
 <tr>
 <td
 colSpan={4}
 className="py-32 text-center text-slate-300"
 >
 <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
 <p className="font-medium">
 কোনো লেনদেন রিপোর্ট পাওয়া যায়নি
 </p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 )}
 </div>
 )}
 </main>

 {/* Add User Modal */}
 <Modal
 isOpen={showAddUserModal}
 onClose={() => setShowAddUserModal(false)}
 title="নতুন ব্যবহারকারী যোগ করুন"
 id="add-user-modal"
 >
 <form onSubmit={handleCreateUser} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 পুরো নাম
 </label>
 <input
 type="text"
 value={newUser.name}
 onChange={(e) =>
 setNewUser({ ...newUser, name: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 placeholder="e.g. Abul Kashem"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 ইমেইল ঠিকানা
 </label>
 <input
 type="email"
 value={newUser.email}
 onChange={(e) =>
 setNewUser({ ...newUser, email: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 placeholder="email@example.com"
 required
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 গাড়ির নম্বর
 </label>
 <input
 type="text"
 value={newUser.carNumber}
 onChange={(e) =>
 setNewUser({ ...newUser, carNumber: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 placeholder="DHAKA-METRO-KA-..."
 required
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 গাড়ির ধরন
 </label>
 <select
 value={newUser.carType}
 onChange={(e) =>
 setNewUser({ ...newUser, carType: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none bg-white dark:bg-slate-900"
 >
 <option value="Car">Car (৳৬০)</option>
 <option value="SUV">SUV (৳৮০)</option>
 <option value="Bus">Bus (৳১৫০)</option>
 <option value="Truck">Truck (৳৩০০)</option>
 </select>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 RFID নম্বর
 </label>
 <input
 type="text"
 value={newUser.rfid}
 onChange={(e) =>
 setNewUser({ ...newUser, rfid: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 placeholder="Ex: 00112233"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 প্রাথমিক ব্যালেন্স
 </label>
 <input
 type="number"
 value={newUser.balance}
 onChange={(e) =>
 setNewUser({
 ...newUser,
 balance: parseFloat(e.target.value) || 0,
 })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 placeholder="৳০"
 />
 </div>
 </div>
 <div className="pt-4 flex gap-3">
 <Button
 variant="outline"
 className="flex-1"
 type="button"
 onClick={() => setShowAddUserModal(false)}
 >
 বাতিল
 </Button>
 <Button className="flex-1" type="submit">
 সেভ করুন
 </Button>
 </div>
 </form>
 </Modal>

 {/* Edit User Modal */}
 <Modal
 isOpen={showEditUserModal}
 onClose={() => setShowEditUserModal(false)}
 title="ইউজার তথ্য পরিবর্তন"
 id="edit-user-modal"
 >
 {editingUser && (
 <form onSubmit={handleEditUser} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 পুরো নাম
 </label>
 <input
 type="text"
 value={editingUser.name}
 onChange={(e) =>
 setEditingUser({ ...editingUser, name: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 RFID নম্বর
 </label>
 <input
 type="text"
 value={editingUser.rfid || ""}
 onChange={(e) =>
 setEditingUser({ ...editingUser, rfid: e.target.value })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 গাড়ির নম্বর
 </label>
 <input
 type="text"
 value={editingUser.carNumber}
 onChange={(e) =>
 setEditingUser({
 ...editingUser,
 carNumber: e.target.value,
 })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
 গাড়ির ধরন
 </label>
 <select
 value={editingUser.carType}
 onChange={(e) =>
 setEditingUser({
 ...editingUser,
 carType: e.target.value as any,
 })
 }
 className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 outline-none bg-white dark:bg-slate-900"
 >
 <option value="Mini Car">ছোট গাড়ি (৳৬০)</option>
 <option value="SUV">এসইউভি (৳৮০)</option>
 <option value="Bus">বাস (৳১৫০)</option>
 <option value="Truck">ট্রাক (৳৩০০)</option>
 </select>
 </div>
 </div>
 <div className="pt-4 flex gap-3">
 <Button
 variant="outline"
 className="flex-1"
 type="button"
 onClick={() => setShowEditUserModal(false)}
 >
 বাতিল
 </Button>
 <Button className="flex-1" type="submit">
 আপডেট করুন
 </Button>
 </div>
 </form>
 )}
 </Modal>

 {/* History Modal */}
 <Modal
 isOpen={showHistoryModal}
 onClose={() => {
 setShowHistoryModal(false);
 setSelectedAdminUser(null);
 }}
 title={
 selectedAdminUser
 ? `${selectedAdminUser.name}-এর হিস্টোরি`
 : "ট্রানজ্যাকশন হিস্টোরি"
 }
 id="history-modal"
 >
 <div className="max-h-[60vh] overflow-y-auto pr-2">
 <UserHistoryView
 userId={selectedAdminUser?.id || user?.id || ""}
 currentUsers={users}
 />
 </div>
 <div className="mt-6 flex justify-center">
 <Button
 variant="outline"
 className="w-full"
 onClick={() => {
 setShowHistoryModal(false);
 setSelectedAdminUser(null);
 }}
 >
 বন্ধ করুন
 </Button>
 </div>
 </Modal>

 {/* Low Balance Alert Modal */}
 <AnimatePresence>
 {showLowBalanceModal && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 dark:bg-indigo-600/50 backdrop-blur-sm"
 >
 <motion.div
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: -20 }}
 className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-2xl max-w-sm w-full border border-rose-100 dark:border-rose-900/50 overflow-hidden relative"
 >
 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-rose-600" />
 <div className="flex flex-col items-center text-center mt-2">
 <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center mb-4">
 <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
 লো ব্যালেন্স এলার্ট!
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
 আপনার বর্তমান ব্যালেন্স <span className="font-bold text-rose-600 dark:text-rose-400">৳{user?.balance}</span>। বিল পরিশোধের ক্ষেত্রে অনাকাঙ্ক্ষিত বাধা এড়াতে অনুগ্রহ করে শিঘ্রই আপনার একাউন্ট রিচার্জ করুন।
 </p>
 <div className="flex gap-3 w-full">
 <Button
 variant="outline"
 className="flex-1"
 onClick={() => setShowLowBalanceModal(false)}
 >
 পরে করব
 </Button>
 <Button
 className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
 onClick={() => {
 setShowLowBalanceModal(false);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }}
 >
 রিচার্জ করুন
 </Button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 </div>
 );
}
