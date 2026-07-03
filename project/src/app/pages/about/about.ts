import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatChipsModule, CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  techStack = [
    { name: 'Angular 22', icon: 'web', color: '#dd0031' },
    { name: 'Angular Material', icon: 'palette', color: '#1976d2' },
    { name: 'Node.js', icon: 'dns', color: '#43a047' },
    { name: 'Express.js', icon: 'router', color: '#333' },
    { name: 'SQL Server', icon: 'storage', color: '#f57c00' },
    { name: 'JWT Auth', icon: 'lock', color: '#7b1fa2' },
    { name: 'Chart.js', icon: 'bar_chart', color: '#e53935' },
    { name: 'bcrypt', icon: 'security', color: '#00838f' }
  ];

  features = [
    'User Registration & Login',
    'JWT Authentication',
    'Task CRUD Operations',
    'Priority & Status Tracking',
    'Due Date Management',
    'Search & Filters',
    'Dashboard Statistics',
    'Visual Charts',
    'Responsive Design',
    'Password Management'
  ];
}