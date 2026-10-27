export type CurrencyCode = '₹' | '$' | '€' | '£';

export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'entertainment' 
  | 'education' 
  | 'shopping' 
  | 'utilities' 
  | 'other';

export type ExpenseType = 'need' | 'want' | 'spooky-splurge';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
  notes?: string;
}

export interface BudgetConfig {
  totalBudget: number;
  period: 'daily' | 'weekly' | 'monthly';
  currency: CurrencyCode;
  alertThreshold: number; // e.g. 80%
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: 'tech' | 'college' | 'travel' | 'emergency' | 'custom';
  deadline?: string;
  icon?: string;
}

export interface Quest {
  id: string;
  title: string;
  action: string;
  potentialSavings: string;
  pumpkinPoints: number;
  completed: boolean;
  category: 'food' | 'impulse' | 'habits' | 'savings';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedDate?: string;
  criteria: string;
}

export interface MentorAnalysis {
  diagnosis: string;
  dangerLevel: 'Peaceful Graveyard' | 'Creaking Floorboards' | 'Witching Hour' | 'Full Moon Nightmare';
  spookyRoast: string;
  encouragement: string;
  missions: {
    title: string;
    action: string;
    potentialSavings: string;
    pumpkinPoints: number;
  }[];
}

export interface ImpulseAnalysis {
  verdict: 'Spooky Trap' | 'Worthy Treat' | 'Haunted Dilemma';
  score: number;
  analysis: string;
  alternative: string;
  savingsEquivalent: string;
}

export interface TrickOrTreatRecord {
  id: string;
  itemName: string;
  cost: number;
  decision: 'trick' | 'treat';
  date: string;
  pointsAwarded: number;
  aiRemark: string;
}

export interface TrickOrTreatStats {
  totalTrickedSavings: number;
  tricksCount: number;
  treatsCount: number;
  currentStreak: number;
}

