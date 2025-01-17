import { ChangeDetectorRef, Component } from '@angular/core';
import { ProjectDirectoryService } from '../../services/projectDirectory.service';

@Component({
  moduleId: module.id,
  selector: 'project-panel',
  templateUrl: './project.panel.component.html',
  providers: [ProjectDirectoryService],
})

export class ProjectPanelComponent {

  changeDetectorRef: ChangeDetectorRef;
  projectDirectoryService: ProjectDirectoryService;

  files;
  dirs;

  constructor(changeDecetctoeref: ChangeDetectorRef, projectDirectoryService: ProjectDirectoryService) {
    projectPanelComponent = this;
    this.changeDetectorRef = changeDecetctoeref;
    this.projectDirectoryService = projectDirectoryService;
  }

  updateProjectWindow(): void {
    this.files = this.projectDirectoryService.getFiles();
    this.dirs = this.projectDirectoryService.getDirectories();
    this.changeDetectorRef.detectChanges();
  }

  handleClickedFile(file: string): void {
    switchToEditorPanel();
    // Read the contents of the file specified
    fileLocation = this.projectDirectoryService.getFullPathName(file);
    fileOpenInEditor = fileLocation;
    readFromFileEditor(fileLocation);
  }

  handleClickedDir(dir: string): void {
    this.projectDirectoryService.moveDownInDirectory(dir);
    this.files = this.projectDirectoryService.getFiles();
    this.dirs = this.projectDirectoryService.getDirectories();
    this.changeDetectorRef.detectChanges();
  }

  handleBackClick(): void {
    this.projectDirectoryService.moveUpInDirectory();
    this.files = this.projectDirectoryService.getFiles();
    this.dirs = this.projectDirectoryService.getDirectories();
    this.changeDetectorRef.detectChanges();
  }
}
