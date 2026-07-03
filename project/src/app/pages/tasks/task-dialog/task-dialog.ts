import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Task } from '../../../models/task';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css'
})
export class TaskDialog {
  formData: any;
  isEditMode: boolean;

  constructor(
    public dialogRef: MatDialogRef<TaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Task | null
  ) {
    this.isEditMode = !!this.data;
    this.formData = {
      title: this.data?.title || '',
      description: this.data?.description || '',
      priority: this.data?.priority || 'Medium',
      category: this.data?.category || '',
      status: this.data?.status || 'Pending',
      dueDate: this.data?.dueDate ? new Date(this.data.dueDate) : null
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const result = {
      ...this.formData,
      dueDate: this.formData.dueDate
        ? new Date(this.formData.dueDate).toISOString().split('T')[0]
        : ''
    };
    this.dialogRef.close(result);
  }
}