export interface User {
  id: string;
  name: string;
  email: string;
  carNumber: string;
  carType: string;
  balance: number;
  role: 'admin' | 'user';
  password?: string;
  rfid?: string;
  profilePic?: string;
  createdAt?: any;
}

export interface TravelRecord {
  id: string;
  userId: string;
  plazaName: string;
  amount: number;
  timestamp: string;
}

export interface BalanceRecord {
  id: string;
  userId: string;
  amount: number;
  type: 'recharge' | 'toll';
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: string;
}

export type AuthState = {
  user: User | null;
  loading: boolean;
};
