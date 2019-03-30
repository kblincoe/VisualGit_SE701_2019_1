import { Component } from '@angular/core';

@Component({
  selector: 'user-auth',
  template: `
  <div class="authenticate" id="authenticate">
  <form role="form" style="text-align:center; margin-top:100px">
    <label>
        <h1><img src="./assets/VisualGit_Logo.png" class="auth-logo"> VisualGit</h1>
    </label>
    <br><br>
    <div class="input-group" style="width:280px;">
      <input id="auth-username" type="text" class="form-control" placeholder="Username or Email" aria-describedby="basic-addon1">
    </div>
    <br>

    <div class="input-group" style="width:280px;">
      <input id="auth-password" type="password" class="form-control" placeholder="Password" aria-describedby="basic-addon1">
      <br><br>
      <p id="personalAccessTokenMsg" style="display: none;"><i>Your account has Two-Factor Authentication enabled.
        Please enter you personal access token, if you don't know
        how to setup a personal access token click <a (click)="personalAccessTokenHelp()">here</a></i></p>
    </div>
    <br>
    <input id="rememberLogin" type="checkbox"> Remember Login<br/>

    <br>
    <div>
      <button type="submit" style="width:280px;" class="btn btn-success" (click)="switchToMainPanel()">Sign In</button>
      <br>
    </div>

    <br>
    <button type="submit" style="width:280px;" class="btn btn-primary" onclick="useSaved()">Load Saved Credentials</button>
    <br>
    <br>

    <button style="width:280px;" class="btn btn-link" (click)="openGitHubPasswordResetPage()">Forgot your password?</button>

    <br>

    <button style="width:280px;" class="btn btn-link" (click)="createNewAccount()">Create New Account?</button>

    <br>
    <button type="submit" style="width:280px;" class="btn btn-primary" onclick="switchToAddRepositoryPanel()"
    >Continue without sign in</button>
  </form>
</div>
  `,
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
}
