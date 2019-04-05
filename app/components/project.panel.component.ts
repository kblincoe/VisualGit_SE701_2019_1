import { Component, ChangeDetectorRef } from '@angular/core';
import { ProjectDirectoryService } from '../services/projectDirectory.service';

@Component({
  selector: 'project-panel',
  template: `
  <div class="project-panel" id="project-panel">

    <button class="project-back-button" (click)="handleBackClick()">
      &lt;
    </button>
    <div class="project-window">
      <div class="dir-cell" *ngFor="let dir of dirs" (click)="handleClickedDir(dir)">
        <p>
          <b>{{ dir }}</b>
        </p>
      </div>
      <div class="file-cell" *ngFor="let file of files" (click)="handleClickedFile(file)">
        <p>
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
    this.files = this.projectDirectoryService.getFiles();
    this.dirs = this.projectDirectoryService.getDirectories();
    this.changeDetectorRef.detectChanges();
  }

  handleClickedFile(file:string):void {
    switchToEditorPanel();
    // Read the contents of the file specified
    fileLocation = this.projectDirectoryService.getFullPathName(file);
    fileOpenInEditor = fileLocation;
    readFromFileEditor(fileLocation);
  }

  handleClickedDir(dir:string):void {
    this.projectDirectoryService.moveDownInDirectory(dir);
    this.files = this.projectDirectoryService.getFiles();
    this.dirs = this.projectDirectoryService.getDirectories();
    this.changeDetectorRef.detectChanges();
  }

  handleBackClick():void {
    this.projectDirectoryService.moveUpInDirectory();
    this.files = this.projectDirectoryService.getFiles();
    this.dirs = this.projectDirectoryService.getDirectories();
    this.changeDetectorRef.detectChanges();
  }
}
