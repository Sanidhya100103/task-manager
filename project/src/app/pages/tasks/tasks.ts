import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { TaskDialog } from './task-dialog/task-dialog';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatTooltipModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, FormsModule, CommonModule, DatePipe,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements OnInit {
  columns: string[] = ['title', 'category', 'priority', 'status', 'dueDate', 'actions'];

  allTasks: Task[] = [];
  tasks: Task[] = [];
  isLoading = false;

  searchTerm = '';
  priorityFilter = 'All';
  statusFilter = 'All';
  categoryFilter = 'All';
  categories: string[] = [];

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  showToast(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.buildCategoryList();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.isLoading = false;
      }
    });
  }

  buildCategoryList(): void {
    const unique = new Set(this.allTasks.map(t => t.category));
    this.categories = Array.from(unique);
  }

  applyFilters(): void {
    this.tasks = this.allTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesPriority = this.priorityFilter === 'All' || task.priority === this.priorityFilter;
      const matchesStatus = this.statusFilter === 'All' || task.status === this.statusFilter;
      const matchesCategory = this.categoryFilter === 'All' || task.category === this.categoryFilter;
      return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
    });
  }

  toggleComplete(task: Task): void {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.loadTasks();
        this.cdr.detectChanges();
        this.showToast(newStatus === 'Completed' ? 'Task marked complete!' : 'Task marked pending!');
      },
      error: (err) => {
        console.error('Error toggling task:', err);
        this.showToast('Failed to update task.');
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loadTasks();
        this.showToast('Task deleted.');
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.showToast('Failed to delete task.');
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(TaskDialog, { data: null });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.addTask(result).subscribe({
          next: (newTask) => {
            this.allTasks = [...this.allTasks, newTask];
            this.buildCategoryList();
            this.applyFilters();
            this.cdr.detectChanges();
            this.showToast('Task added successfully!');
          },
          error: (err) => {
            console.error('Error adding task:', err);
            this.showToast('Failed to add task.');
          }
        });
      }
    });
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialog, { data: task });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.updateTask(task.id, result).subscribe({
          next: () => {
            this.loadTasks();
            this.showToast('Task updated successfully!');
          },
          error: (err) => {
            console.error('Error updating task:', err);
            this.showToast('Failed to update task.');
          }
        });
      }
    });
  }
}