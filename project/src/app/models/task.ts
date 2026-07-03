export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  status: 'Pending' | 'Completed';
  dueDate: string;
  createdAt: string;
  userId: number;
}