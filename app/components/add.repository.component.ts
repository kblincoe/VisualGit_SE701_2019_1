import { Component } from '@angular/core';

@Component({
  selector: 'add-repository-panel',
  template: `
    <div class="add-repository-panel" id="add-repository-panel">
      <img src="./assets/Back.svg" (click)="returnToMainPanel()" class="back-button">
      <div class="add-repository-body flex-container-col">
        <div id="open-recent-repository" class="open-recent-repository">
          <div class="title">
            <h1>Open Recent</h1>
          </div>
          <ul class="list-group recents-list" id="recents-list">
          </ul>
        </div>
        <div>
          <div class="clone-body flex-container-col">
            <div class="title">
              <h1>Clone from Internet</h1>
            </div>
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
        <div id="open-local-repository" class="open-local-repository">
          <div class="title">
            <h1>Open Local Repository</h1>
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
  `,
})

export class AddRepositoryComponent {

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

  // Add function that determines if directory written or not
  selectDirectory(): void {
    if (document.getElementById('repoOpen').value == null || document.getElementById('repoOpen').value === '') {
      // If no directory specified, launch file browser
      document.getElementById('dirPickerOpenLocal').click();
    } else {
      // If directory is specified, continue as normal
      this.openLocalRepository();
    }
  }

  updateDir(): void {
    updateCustomPath(document.getElementById('dirPickerSaveNew').files[0].path);
  }

  openRepository(): void {
    openLocalRepository();
    switchToMainPanel();
  }

  returnToMainPanel(): void {
    switchToMainPanel();
  }
}
