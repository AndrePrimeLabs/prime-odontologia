import { createEntity } from "./primeos";

export interface Customer {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  segment?: string;
  total_spent?: number;
  created_date?: string;
}

export interface Activity {
  id: string;
  title?: string;
  status?: string;
  due_date?: string;
}

export interface Expense {
  id: string;
  category?: string;
  amount?: number;
  status?: string;
  date?: string;
}

export interface Sale {
  id: string;
  total_amount?: number;
  channel?: string;
  customer_id?: string;
  created_date?: string;
}

export interface Lead {
  id: string;
  name?: string;
  status?: string;
  source?: string;
  created_date?: string;
}

export interface Task {
  id: string;
  title?: string;
  status?: string;
  due_date?: string;
  completed_at?: string;
}

export interface Appointment {
  id: string;
  patient_id?: string;
  status?: string;
  scheduled_at?: string;
}

export interface Product {
  id: string;
  name?: string;
  price?: number;
}

export const Customer = createEntity<Customer>("customers");
export const Activity = createEntity<Activity>("activities");
export const Expense = createEntity<Expense>("expenses");
export const Product = createEntity<Product>("products");
export const Sale = createEntity<Sale>("sales");
export const Lead = createEntity<Lead>("leads");
export const Task = createEntity<Task>("tasks");
export const Appointment = createEntity<Appointment>("appointments");
