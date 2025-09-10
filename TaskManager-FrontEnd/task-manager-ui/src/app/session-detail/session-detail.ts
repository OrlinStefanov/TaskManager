import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Auth, Sesison_Full, Task, UserSessionFull } from '../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { showAlert } from '../services/helper';

@Component({
  selector: 'app-session-detail',
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.scss'
})

export class SessionDetail {
  session : Sesison_Full | null = null;
  createdTaskModel : Task = { title: '', description: '', dueDate: new Date(), sessionId: '', assignedToUserId: '', createdByUserId: '', status: 'To Do' };

  assignedToUserName : string = "";
  users : UserSessionFull[] = [];

  constructor(private route: ActivatedRoute, private authService: Auth) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.authService.getSessionById(id!).subscribe({
      next: (session) => {
        console.log('Fetched session details:', session);
        this.session = session;
        this.users = session.userSessions;
        this.assignedToUserName = this.users.length > 0 ? this.users[0].userName : '';
      },
      error: (error) => {
        console.error('Error fetching session details:', error);
      }
    });
  }

  public createTask() {
    if(!this.session) return;
    if(!this.assignedToUserName) return;

    const assignedToUserId = this.users.find(user => user.userName === this.assignedToUserName).userId;
    if(!assignedToUserId) return;

    const newTask: Task = {
      title: this.createdTaskModel.title,
      description: this.createdTaskModel.description,
      dueDate: this.createdTaskModel.dueDate,
      sessionId: this.session.id!,
      assignedToUserId: assignedToUserId,
      createdByUserId: this.authService.userid,
      status: 'To Do'
    };

    console.log('Creating task with data:', newTask);

    this.authService.createTask(this.session.id!, newTask).subscribe({
      next: (res) => {
        showAlert(this, 'success', 'Task created successfully!');
        console.log('Task created:', res);
        this.createdTaskModel = { title: '', description: '', dueDate: new Date(), sessionId: '', assignedToUserId: '', createdByUserId: '', status: 'To Do' };
        this.assignedToUserName = '';
        this.session?.tasks?.push(res);
      },
      error: (error) => {
        console.error('Error creating task:', error);
      }
    });
  }

  public updateTaskStatus (taskId: string | undefined, status: "To Do" | "In Progress" | "Done") {
    if(!taskId) return;
    
    this.authService.updateTaskStatus(taskId, status).subscribe({
      next: (res) => {
        showAlert(this, 'success', 'Task status updated successfully!');
        console.log('Task status updated:', res);
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  get todoTaskCount(): number {
    return this.session?.tasks?.filter(t => t.status === "To Do").length ?? 0;
  }

  get inProgressTaskCount(): number {
    return this.session?.tasks?.filter(t => t.status === "In Progress").length ?? 0;
  }
  
  get doneTaskCount(): number {
    return this.session?.tasks?.filter(t => t.status === "Done").length ?? 0;
  }
}
