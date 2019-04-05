import { Component } from '@angular/core';
import { AddRepositoryComponent } from './add.repository.component';
import { AuthenticateComponent } from './authenticate.component';
import { BodyPanelComponent } from './body.panel.component';
import { EditorComponent } from './editor.component';
import { FilePanelComponent } from './file.panel.component';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'my-app',
  template: `
    <user-auth></user-auth>
    <app-header></app-header>
    <file-panel></file-panel>
    <body-panel></body-panel>
    <add-repository-panel></add-repository-panel>
    <editor-component></editor-component>
    <app-footer></app-footer>
  `,
  directives: [
    AddRepositoryComponent,
    AuthenticateComponent,
    BodyPanelComponent,
    FilePanelComponent,
    FooterComponent,
    HeaderComponent,
    EditorComponent,
  ],
})

export class AppComponent { }
