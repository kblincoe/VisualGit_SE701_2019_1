import { Component, OnInit, ViewChild} from '@angular/core';
import { AddRepositoryComponent } from './add.repository/add.repository.component';
import { AuthenticateComponent } from './authenticate/authenticate.component';
import { BodyPanelComponent } from './body.panel/body.panel.component';
import { EditorComponent } from './editor/editor.component';
import { FilePanelComponent } from './file.panel/file.panel.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';


@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: './app.component.html',
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

export class AppComponent implements OnInit {

  @ViewChild(AuthenticateComponent) authComp: AuthenticateComponent;

  ngOnInit(){
    if (sessionStorage.getItem('firstLogin') === null){
        sessionStorage.setItem('firstLogin', 'firstLogin');
        hasSavedCredentials().then((response)  => {
            if (response) {
                this.authComp.switchToMainPanel();
            } else {
                closeSplashScreen();
            }
        });
    } else {
        closeSplashScreen();
    }
  }
}
