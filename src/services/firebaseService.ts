import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  deleteDoc,
  limit,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, TravelRecord, BalanceRecord } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // --- Authentication ---

  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        console.error("Authentication provider not enabled in Firebase Console. Please enable Email/Password in Auth settings.");
        throw new Error("সার্ভারে লগইন সিস্টেম (Email/Password) চালু করা হয়নি। Firebase Console থেকে এটি চালু করুন।");
      }
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData: Omit<User, 'id'>, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const uid = userCredential.user.uid;
      const finalUser = {
        ...userData,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', uid), finalUser);
      return { id: uid, ...finalUser } as User;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error("সার্ভারে রেজিস্ট্রেশন সিস্টেম (Email/Password) চালু করা হয়নি। Firebase Console থেকে এটি চালু করুন।");
      }
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  onAuthChanged: (callback: (user: User | null) => void) => {
    let unsubDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        
        // Use onSnapshot to keep the user document in sync
        unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            callback({ id: fbUser.uid, ...docSnap.data() } as User);
          } else {
            // Document might not exist yet if called immediately after signup
            // We just wait as the listener will trigger once it's created
          }
        }, (error) => {
          console.error("User data sync error:", error);
        });

      } else {
        callback(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  },

  // --- User Management ---
  
  getUsers: async (): Promise<User[]> => {
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  updateUser: async (user: User) => {
    const path = `users/${user.id}`;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { ...user });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  addUser: async (userData: Omit<User, 'id'>) => {
    const path = 'users';
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        role: userData.role || 'user',
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...userData } as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  deleteUser: async (userId: string) => {
    const path = `users/${userId}`;
    try {
      await deleteDoc(doc(db, 'users', userId));
      // Ideally also clean up their history records
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  adjustBalance: async (userId: string, amount: number, note: string) => {
    const path = `adjustBalance/${userId}`;
    try {
      const result = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("ইউজার পাওয়া যায়নি");
        
        const currentBalance = (userDoc.data() as User).balance || 0;
        const newBalance = currentBalance + amount;
        
        transaction.update(userRef, { balance: newBalance });
        
        const balanceRef = doc(collection(db, 'balanceHistory'));
        transaction.set(balanceRef, {
          userId,
          amount: Math.abs(amount),
          type: amount >= 0 ? 'recharge' : 'toll',
          status: 'completed',
          note: note || 'অ্যাডমিন অ্যাডজাস্টমেন্ট',
          timestamp: new Date().toISOString()
        });
        return { success: true, newBalance };
      });
      return result;
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { success: false, message: error.message };
    }
  },

  // --- Global Admin Reports ---

  getAllTravelHistory: async (): Promise<TravelRecord[]> => {
    const path = 'travelHistory';
    try {
      const q = query(collection(db, 'travelHistory'));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TravelRecord));
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // --- Travel History ---

  getTravelHistory: async (userId: string): Promise<TravelRecord[]> => {
    const path = 'travelHistory';
    try {
      const q = query(
        collection(db, 'travelHistory'), 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TravelRecord));
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // --- Balance History & Recharges ---

  getBalanceHistory: async (userId: string): Promise<BalanceRecord[]> => {
    const path = 'balanceHistory';
    try {
      const q = query(
        collection(db, 'balanceHistory'), 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BalanceRecord));
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  addRechargeRequest: async (userId: string, amount: number) => {
    const path = 'balanceHistory';
    try {
      await addDoc(collection(db, 'balanceHistory'), {
        userId,
        amount,
        type: 'recharge',
        status: 'pending',
        timestamp: new Date().toISOString() // or serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  approveRecharge: async (recordId: string, userId: string, amount: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        const recordRef = doc(db, 'balanceHistory', recordId);
        const userRef = doc(db, 'users', userId);
        
        const recordSnap = await transaction.get(recordRef);
        if (!recordSnap.exists()) throw new Error("Record not found");
        if (recordSnap.data().status !== 'pending') throw new Error("Already processed");

        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");
        
        const currentBalance = userDoc.data().balance || 0;
        transaction.update(userRef, { balance: currentBalance + amount });
        transaction.update(recordRef, { status: 'completed' });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `approveRecharge/${recordId}`);
    }
  },

  cancelRecharge: async (recordId: string) => {
    try {
      const recordRef = doc(db, 'balanceHistory', recordId);
      await updateDoc(recordRef, { 
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `cancelRecharge/${recordId}`);
    }
  },

  updateUserRole: async (userId: string, role: 'admin' | 'user') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `updateUserRole/${userId}`);
    }
  },

  directRecharge: async (userId: string, amount: number) => {
    const path = `directRecharge/${userId}`;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("ইউজার পাওয়া যায়নি");
        
        const currentBalance = (userDoc.data() as User).balance || 0;
        transaction.update(userRef, { balance: currentBalance + amount });
        
        const balanceRef = doc(collection(db, 'balanceHistory'));
        transaction.set(balanceRef, {
          userId,
          amount,
          type: 'recharge',
          status: 'completed',
          note: 'অ্যাডমিন সরাসরি রিচার্জ',
          timestamp: new Date().toISOString()
        });
      });
      return { success: true };
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { success: false, message: error.message };
    }
  },

  // --- RFID Simulation & Realtime Updates ---

  listenToRfidScans: (onScan: (rfid: string) => void) => {
    const scansRef = collection(db, 'scans');
    const q = query(scansRef, orderBy('timestamp', 'desc'), limit(1));
    
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lastScan = snapshot.docs[0].data();
        if (lastScan && lastScan.rfid) {
          onScan(lastScan.rfid);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'scans');
    });
  },

  processToll: async (rfid: string, plazaName: string, amount: number) => {
    const path = 'processToll';
    try {
      // Find the user by RFID first
      const usersQ = query(collection(db, 'users'), where('rfid', '==', rfid));
      const userSnapshot = await getDocs(usersQ);
      
      if (userSnapshot.empty) {
        return { success: false, message: 'এই RFID কার্ডটি নিবন্ধিত নয়।' };
      }
      
      const userDocInitial = userSnapshot.docs[0];
      const userId = userDocInitial.id;

      const result = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) throw new Error("ইউজার পাওয়া যায়নি");
        
        const userData = userDoc.data() as User;
        if (userData.balance < amount) {
          return { success: false, message: 'অপর্যাপ্ত ব্যালেন্স! দয়া করে রিচার্জ করুন।' };
        }

        // 1. Update user balance
        transaction.update(userRef, { 
          balance: userData.balance - amount,
          lastTravelAt: serverTimestamp()
        });
        
        // 2. Add to travel history
        const travelRef = doc(collection(db, 'travelHistory'));
        transaction.set(travelRef, {
          userId,
          plazaName,
          amount,
          timestamp: new Date().toISOString()
        });

        // 3. Add to balance history (as a toll payment)
        const balanceRef = doc(collection(db, 'balanceHistory'));
        transaction.set(balanceRef, {
          userId,
          amount,
          type: 'toll',
          status: 'completed',
          timestamp: new Date().toISOString()
        });

        return { success: true };
      });

      return result;
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { success: false, message: 'লেনদেন সম্পন্ন করতে সমস্যা হয়েছে: ' + error.message };
    }
  },

  processPendingTollRequest: async (requestId: string, rfid: string, tollNumber: number | string) => {
    const path = `toll_requests/${requestId}`;
    
    // Determine fee and plaza based on toll_number
    let amount = 100;
    let plaza = 'Hardware Gate';
    
    // Make sure it handles both string and number parsing safely
    const tollNum = Number(tollNumber);

    if (tollNum === 1) {
       plaza = 'Padma Bridge Toll Plaza';
       amount = 100;
    } else if (tollNum === 2) {
       plaza = 'Ibrahim (A:) Road';
       amount = 50;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const tollRequestRef = doc(db, 'toll_requests', requestId);
        const reqDoc = await transaction.get(tollRequestRef);
        if(!reqDoc.exists() || reqDoc.data().status !== 'pending') return;

        const gateControlRef = doc(db, 'gate_control', 'status');
        
        // Find user by RFID field
        const usersQ = query(collection(db, 'users'), where('rfid', '==', rfid));
        const usersSnap = await getDocs(usersQ);
        
        if (usersSnap.empty) {
          transaction.set(gateControlRef, { 
            state: "fail", 
            message: "Invalid RFID!",
            lastRfid: rfid,
            lastReqId: requestId,
            tollNumber: tollNumber,
            timestamp: new Date().toISOString()
          });
          transaction.update(tollRequestRef, { status: "fail", message: "Invalid RFID!" });
          return;
        }
        
        const userId = usersSnap.docs[0].id;
        const actualUserRef = doc(db, 'users', userId);
        const freshUserDoc = await transaction.get(actualUserRef);
        const freshUserData = freshUserDoc.data() as User;

        if (freshUserData.balance >= amount) {
          // Success Path
          const newBalance = freshUserData.balance - amount;
          transaction.update(actualUserRef, { balance: newBalance });
          
          const successMsg = `Welcome! Tk${amount} Paid`;
          transaction.set(gateControlRef, { 
            state: "success", 
            amount: amount,
            message: successMsg,
            lastRfid: rfid,
            lastReqId: requestId,
            tollNumber: tollNumber,
            timestamp: new Date().toISOString()
          });
          
          // Log records
          const travelRef = doc(collection(db, 'travelHistory'));
          transaction.set(travelRef, {
            userId,
            plazaName: plaza,
            amount,
            timestamp: new Date().toISOString()
          });
          
          const balanceRef = doc(collection(db, 'balanceHistory'));
          transaction.set(balanceRef, {
            userId,
            amount,
            type: 'toll',
            status: 'completed',
            note: `${plaza} Toll`,
            timestamp: new Date().toISOString()
          });

          transaction.update(tollRequestRef, { status: "complete", message: successMsg });

        } else {
          // Fail Path: Insufficient Balance
          const failMsg = "Low Balance! Recharge";
          transaction.set(gateControlRef, { 
            state: "fail", 
            message: failMsg,
            lastRfid: rfid,
            lastReqId: requestId,
            tollNumber: tollNumber,
            timestamp: new Date().toISOString()
          });
          transaction.update(tollRequestRef, { status: "fail", message: failMsg });
        }
      });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
