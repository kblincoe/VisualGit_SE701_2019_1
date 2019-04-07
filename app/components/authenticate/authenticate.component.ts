import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'user-auth',
  templateUrl: './authenticate.component.html',
})

export class AuthenticateComponent {

  switchToMainPanel(): void {
    signInPage(switchToAddRepositoryPanel);
  }

  createNewAccount(): void {
    window.open('https://github.com/join?', '_blank');
  }

  personalAccessTokenHelp(): void {
    window.open('https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line');
  }
  openGitHubPasswordResetPage(): void {
    window.open('https://github.com/password_reset', '');
  }

}
