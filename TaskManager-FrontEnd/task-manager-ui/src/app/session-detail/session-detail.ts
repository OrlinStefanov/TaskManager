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
  displayed_tasks : Task[] | null = null;
  userId : string;
  createdTaskModel : Task = { title: '', description: '', dueDate: new Date(), sessionId: '', assignedToUserId: '', createdByUserId: '', status: 'To Do' };
  editedTaskModel : Task = { title: '', description: '', dueDate: new Date(), sessionId: '', assignedToUserId: '', createdByUserId: '', status: 'To Do' };

  assignedToUserName : string = "";
  users : UserSessionFull[] = [];

  tobeDeletedTaskId: string | null = null;
  tobeEditedTaskId: string | null = null;

  constructor(private route: ActivatedRoute, private authService: Auth) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.authService.getSessionById(id!).subscribe({
      next: (session) => {

        this.session = session;
        this.users = session.userSessions;
        this.assignedToUserName = this.users.length > 0 ? this.users[0].userName : '';
        
        console.log('Fetched session details:', session);

        this.displayed_tasks = [...(this.session?.tasks || [])];
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

    this.userId = this.session?.userSessions.find(u => u.userName === this.authService.User)?.userId || '';
    console.log('Current userId:', this.userId);

    const newTask: Task = {
      title: this.createdTaskModel.title,
      description: this.createdTaskModel.description,
      dueDate: this.createdTaskModel.dueDate,
      sessionId: this.session.id!,
      assignedToUserId: assignedToUserId,
      createdByUserId: this.userId,
      status: 'To Do'
    };

    console.log('Creating task with data:', newTask);

    this.authService.createTask(this.session.id!, newTask).subscribe({
      next: (res) => {
        showAlert(this, 'success', 'Task created successfully!');
        
        var assignedToUserName = this.users.find(user => user.userId === res.assignedToUserId)?.userName || '';
        res['assignedToUserName'] = assignedToUserName;

        this.createdTaskModel = { title: '', description: '', dueDate: new Date(), sessionId: '', assignedToUserId: '', createdByUserId: '', status: 'To Do' };
        this.session?.tasks?.push(res);
        this.displayed_tasks = this.session.tasks;
        this.assignedToUserName = '';
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

  public deleteTask () {
    if(!this.tobeDeletedTaskId) return;

    this.authService.deleteTask(this.tobeDeletedTaskId).subscribe({
      next: () => {
        showAlert(this, 'success', 'Task deleted successfully!');

        this.session!.tasks = this.session!.tasks.filter(t => t.id !== this.tobeDeletedTaskId);
        this.displayed_tasks = this.session.tasks;
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }

  public editTask (task: Task) {
    if(!task.id) return;

    task.assignedToUserId = this.users.find(user => user.userName === this.assignedToUserName)?.userId || task.assignedToUserId;
    task.createdByUserId = this.session?.userSessions.find(u => u.userName === this.authService.User)?.userId || task.createdByUserId;

    this.authService.editTask(task.id, task).subscribe({
      next: (res) => {
        showAlert(this, 'success', 'Task edited successfully!');
        const index = this.session!.tasks.findIndex(t => t.id === task.id);

        if(index !== -1) {
          this.session!.tasks[index] = res;
        }

        this.tobeEditedTaskId = null;
        this.editedTaskModel = { title: '', description: '', dueDate: new Date(), sessionId: '', assignedToUserId: '', createdByUserId: '', status: 'To Do' };
      },
      error: (error) => {
        console.error('Error editing task:', error);
      }
    });
  }

  get todoTaskCount(): number {
    if (!this.displayed_tasks) return 0;
    return this.displayed_tasks?.filter(t => t.status === "To Do").length ?? 0;
  }

  get inProgressTaskCount(): number {
    if (!this.displayed_tasks) return 0;

    return this.displayed_tasks.filter(t => t.status === "In Progress").length ?? 0;
  }
  
  get doneTaskCount(): number {
    if (!this.displayed_tasks) return 0;
    return this.displayed_tasks.filter(t => t.status === "Done").length ?? 0;
  }

  public filterTasksByUser(userName: string) {
    if (userName === "All") {
      this.displayed_tasks = this.session?.tasks || [];
    } else {
      this.displayed_tasks = this.session?.tasks.filter(t => t['assignedToUserName'] === userName) || [];
    }
  }

  public SortBy(value : string)
  {
    if (!this.displayed_tasks) return;

    if(value === "Created")
    {
      this.displayed_tasks.sort((a, b) => {
        if (a.id && b.id) {
          return a.id.localeCompare(b.id);
        }
        return 0;
      });
    }
    else if(value === "DueDate")
    {
      this.displayed_tasks.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if(value === "MostRecent")
    {
      this.displayed_tasks.sort((a, b) => {
        if (a.id && b.id) {
          return b.id.localeCompare(a.id);
        }
        return 0;
      });
    }
  }

  public isDueSoon(dueDate: Date): boolean {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= 2;
  }

  public hasDueSoonTasks(): boolean {
    if (!this.displayed_tasks) return false;
    return this.displayed_tasks.some(task => this.isDueSoon(task.dueDate));
  }

  public formatTask(count : number)
  {
    if (count === 1) return "task";
    return "tasks";
  }
}