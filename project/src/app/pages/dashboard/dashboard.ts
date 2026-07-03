import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';
import { AuthService } from '../../services/auth';
import { Task } from '../../models/task';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatChipsModule, CommonModule, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userName: string = '';

  stats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  };

  completionPercentage = 0;
  recentTasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userName = user?.name || 'there';
    this.loadStats();
  }

  loadStats(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.stats.total = tasks.length;
        this.stats.completed = tasks.filter(t => t.status === 'Completed').length;
        this.stats.pending = tasks.filter(t => t.status === 'Pending').length;
        this.stats.overdue = tasks.filter(t => {
          const due = new Date(t.dueDate);
          return t.status === 'Pending' && due < today;
        }).length;

        this.completionPercentage = this.stats.total > 0
          ? Math.round((this.stats.completed / this.stats.total) * 100)
          : 0;

        this.recentTasks = tasks.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }
}