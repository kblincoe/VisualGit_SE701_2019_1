import { Component } from '@angular/core';
import { GraphService } from '../../services/graph.service';
import { RepositoryService } from '../../services/repository.service';

@Component({
  moduleId: module.id,
  selector: 'app-header',
  templateUrl: './header.component.html',
  providers: [GraphService, RepositoryService],
})

export class HeaderComponent   {
  repoName: string = 'Repo name';
  repoBranch: string = 'Repo branch';
  repository: any;

  promptUserToAddRepository(): void {
    switchToAddRepositoryPanel();
  }

  switchToMainPanel(): void {
    signInHead(collapseSignPanel);
  }

  signOut(): void {
    ipcRenderer.send('signout');
    redirectToHomePage();
  }

}
