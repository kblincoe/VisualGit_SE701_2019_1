import { Component, ViewChild } from '@angular/core';
import { AddGitignoreComponent } from './add.gitignore.component';
import { ProjectDirectoryService } from '../services/projectDirectory.service';
import { ProjectPanelComponent } from './project.panel.component';

@Component({
  selector: 'add-repository-panel',
  template: `
    <div class="add-repository-panel" id="add-repository-panel">
      <img src="./assets/Back.svg" (click)="returnToMainPanel()" class="back-button">
      <div class="add-repository-body flex-container-col">
      <h1>Open or Create Repository</h1>
      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#openRecentTab">Recent</a></li>
        <li><a data-toggle="tab" href="#openNewTab">Create New Repo</a></li>
        <li><a data-toggle="tab" href="#openInternetTab">Clone from Web</a></li>
        <li><a data-toggle="tab" href="#openLocalTab">Open Local</a></li>
      </ul>
      <div class="tab-content">
        <div id="openRecentTab" class="tab-pane fade in active">
          <div id="open-recent-repository" class="open-recent-repository">
            <div class="title">
              <h3>Open Recent</h3>
            </div>
            <ul class="list-group recents-list" id="recents-list">
            </ul>
          </div>
        </div>
        <div id="openNewTab" class="tab-pane fade">
          <div id="create-local-resitory" class="create-local-resitory">
          <div class="title">
            <h3 class="create-local-title">Create New Local Repository</h3>
          </div>
          <div class="form-group" style="max-width: 700px;">
              <div class="input-group">
                <input type="text" class="form-control" name="repositoryLocal"
                      placeholder="Clone destination" id="newRepoSaveLocal" readonly/>
                <div class="input-group-btn">
                  <button class="btn" type="button" (click)="selectDirOnlyLocal()">Browse</button>
                </div>
              </div>
              <input type="file" id="dirPickerSaveNewLocal"
              name="dirListSave" (change)="updateDirLocal()"
              style="display: none;" webkitdirectory />
          </div>
          </div>
          <div class="form-group">
                <button class="btn btn-primary btn-lg" type="button" id="initButton" (click)="initRepository()">Init Repo</button>
          </div>
          <add-gitignore-panel id="gitignore-selector"></add-gitignore-panel>
        </div>
        <div id="openInternetTab" class="tab-pane fade">
          <div class="title">
            <h3>Clone from Internet</h3>
          </div>
          <form style="max-width: 700px;">
            <div class="form-group">
              <div class="input-group input-group-lg">
                <input style="width: 700px;" type="text" class="form-control" oninput="updateLocalPath()" name="repositoryRemote"
                 id="repoClone" placeholder="https://github.com/user/repository.git"/>
              </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                  <input type="text" class="form-control" name="repositoryLocal" placeholder="Clone destination" id="repoSave" readonly/>
                  <div class="input-group-btn">
                    <button class="btn" type="button" (click)="selectDirOnly()">Browse</button>
                  </div>
                </div>
                <input type="file" id="dirPickerSaveNew" name="dirListSave" (change)="updateDir()" style="display: none;" webkitdirectory />
            </div>
            <div class="form-group">
              <button class="btn btn-primary btn-lg" type="button" id="cloneButton" (click)="selectSave()">Clone</button>
            </div>
          </form>
        </div>
        <div id="openLocalTab" class="tab-pane fade">
          <div id="open-local-repository" class="open-local-repository">
            <div class="title">
              <h3>Open Local Repository</h3>
            </div>
            <form style="max-width: 700px;">
              <div class="form-group">
                <div class="input-group input-group-lg">
                  <input type="text" class="form-control" name="repositoryLocal" id="repoOpen"/>
                  <div class="input-group-btn">
                    <button class="btn btn-primary" type="button" (click)="selectDirectory()">Browse and Open</button>
                  </div>
                </div>
                <input type="file" id="dirPickerOpenLocal" name="dirList" (change)="openRepository()" style="display: none;"
                  webkitdirectory />
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  `,
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
    this.projectPanel.updateProjectWindow();
    openLocalRepository();
    switchToMainPanel();
  }

  initRepository(): void {
    console.log('heyyyyyyyyyyyyyy')
    initRepo(this.gitignore.selectedItems);
    switchToMainPanel();
  }

  returnToMainPanel(): void {
    console.log('heyyyyyyyyyyyyyy')
    switchToMainPanel();
  }
}
