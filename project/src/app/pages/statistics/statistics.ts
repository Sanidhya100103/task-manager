import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ChartData, ChartOptions } from 'chart.js';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatCardModule, MatIconModule],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics implements OnInit {

  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;
  overdueTasks = 0;
  completionPercentage = 0;

  pieChartData: ChartData<'pie'> = {
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#2e7d32', '#f9a825', '#c62828']
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  priorityChartData: ChartData<'bar'> = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Tasks by Priority',
      data: [0, 0, 0],
      backgroundColor: ['#2e7d32', '#f57c00', '#c62828']
    }]
  };

  priorityChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.totalTasks = tasks.length;
        this.completedTasks = tasks.filter(t => t.status === 'Completed').length;
        this.pendingTasks = tasks.filter(t => t.status === 'Pending').length;
        this.overdueTasks = tasks.filter(t => {
          const due = new Date(t.dueDate);
          return t.status === 'Pending' && due < today;
        }).length;

        this.completionPercentage = this.totalTasks > 0
          ? Math.round((this.completedTasks / this.totalTasks) * 100)
          : 0;

        // Split pending into on-time vs overdue
        const pendingOnTime = this.pendingTasks - this.overdueTasks;

        // Update pie chart with 3 segments
        this.pieChartData = {
          ...this.pieChartData,
          labels: ['Completed', 'Pending', 'Overdue'],
          datasets: [{
            data: [this.completedTasks, pendingOnTime, this.overdueTasks],
            backgroundColor: ['#2e7d32', '#f9a825', '#c62828']
          }]
        };

        // Update priority bar chart
        const low = tasks.filter(t => t.priority === 'Low').length;
        const medium = tasks.filter(t => t.priority === 'Medium').length;
        const high = tasks.filter(t => t.priority === 'High').length;

        this.priorityChartData = {
          ...this.priorityChartData,
          datasets: [{
            label: 'Tasks by Priority',
            data: [low, medium, high],
            backgroundColor: ['#2e7d32', '#f57c00', '#c62828']
          }]
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading statistics:', err)
    });
  }
}