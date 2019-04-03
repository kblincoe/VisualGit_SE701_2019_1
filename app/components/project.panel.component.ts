import { Component } from '@angular/core';
import { ProjectDirectoryServcie } from '../services/projectDirectory.service';

@Component({
  selector: 'project-panel',
  template: `
  <div class="project-panel" id="project-panel">

    <div (click)="updateFiles()" class="project-window" *ngFor="let file of files">
      <p (click)="handleClickedFile(file)">
        {{ file }}
      </p>
    </div>

  </div>
  `,
})

export class ProjectPanelComponent {

  // projectDirectoryService:ProjectDirectoryServcie;

  // ProjectPanelComponent(projectDirectoryServcie:ProjectDirectoryServcie) {
  //   this.projectDirectoryService = projectDirectoryServcie;
  // }

  projectDirectoryService = new ProjectDirectoryServcie(); // TODO: maybe inject?
  files = [""];

  updateFiles():void {
    this.files = this.projectDirectoryService.getFolders();
  }

  handleClickedFile(file:string):void {
    console.log(file);
  }
}
