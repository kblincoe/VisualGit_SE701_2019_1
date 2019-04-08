import { Component, ViewChild } from '@angular/core';
import { AddGitignoreComponent } from '../add.gitignore/add.gitignore.component';
import { ProjectPanelComponent } from '../project.panel/project.panel.component';

@Component({
  moduleId: module.id,
  selector: 'add-repository-panel',
  templateUrl: './add.repository.component.html',
  directives: [AddGitignoreComponent],
})

export class AddRepositoryComponent {

  @ViewChild(AddGitignoreComponent)
  gitignore: AddGitignoreComponent;

  @ViewChild(ProjectPanelComponent)
  projectPanel: ProjectPanelComponent;

  addRepository(): void {

    downloadRepository();
    switchToMainPanel();
  }

  // Add function that determines if directory written or not
  selectSave(): void {
    if (document.getElementById('repoSave').value == null || document.getElementById('repoSave').value === '') {
      // If no directory specified, display error
      displayModal('Invalid clone destination');
    } else {
      // If directory is specified, continue as normal
      this.addRepository();
    }
  }

  selectDirOnly(): void {
    document.getElementById('dirPickerSaveNew').click();
  }

  selectDirOnlyLocal(): void {
    document.getElementById('dirPickerSaveNewLocal').click();
  }

  // Add function that determines if directory written or not
  selectDirectory(): void {
    if (document.getElementById('repoOpen').value == null || document.getElementById('repoOpen').value === '') {
      // If no directory specified, launch file browser
      document.getElementById('dirPickerOpenLocal').click();
    } else {
      // If directory is specified, continue as normal
      this.openRepository();
    }
  }

  updateDirLocal(): void{
    console.log(document.getElementById('dirPickerSaveNewLocal').files[0].path);
    document.getElementById('newRepoSaveLocal').value = document.getElementById('dirPickerSaveNewLocal').files[0].path;
  }
  updateDir(): void {
    updateCustomPath(document.getElementById('dirPickerSaveNew').files[0].path);
  }
  // There is quite a bit of dupe code
  selectNewRepoDirectory(): void {
    if (document.getElementById('newRepoOpen').value === null || document.getElementById('newRepoOpen').value === '') {
      // If no directory specified, launch file browser
      document.getElementById('dirPickerOpenNewLocal').click();
    } else {
      // If directory is specified, continue as normal
      this.initRepository();
    }
  }

  openRepository(): void {
    clearModifiedFilesList();
    openLocalRepository();
    switchToMainPanel();
  }

  initRepository(): void {
    clearModifiedFilesList();
    initRepo(this.gitignore.selectedItems);
    switchToMainPanel();
  }

  returnToMainPanel(): void {
    switchToMainPanel();
  }
}
