import { Component, ChangeDetectorRef } from '@angular/core';
import { ProjectDirectoryService } from '../services/projectDirectory.service';

@Component({
  selector: 'project-panel',
  template: `
  <div class="project-panel" id="project-panel">

    <div class="project-window">
      <div class="dir-cell" *ngFor="let dir of dirs">
        <p (click)="handleClickedDir(dir)">
          <b>{{ dir }}</b>
        </p>
      </div>
      <div class="file-cell" *ngFor="let file of files">
        <p (click)="handleClickedFile(file)">
          {{ file }}
        </p>
      </div>
    </div>

  </div>
  `,
  providers: [ProjectDirectoryService]
})

export class ProjectPanelComponent {

  changeDetectorRef:ChangeDetectorRef;
  projectDirectoryService:ProjectDirectoryService;

  constructor(changeDecetctoeref:ChangeDetectorRef, projectDirectoryService:ProjectDirectoryService) {
    projectPanelComponent = this;
    this.changeDetectorRef = changeDecetctoeref;
    this.projectDirectoryService = projectDirectoryService;
  }

  files;
  dirs;

  updateProjectWindow():void {
    this.files = this.projectDirectoryService.getFiles('');
    this.dirs = this.projectDirectoryService.getDirectories('');
    this.changeDetectorRef.detectChanges();
  }

  handleClickedFile(file:string):void {
    console.log('OPEN: ' + file);
  }

  handleClickedDir(dir:string):void {
    this.files = this.projectDirectoryService.getFiles(dir);
    this.dirs = this.projectDirectoryService.getDirectories(dir);
    this.changeDetectorRef.detectChanges();
  }
}
