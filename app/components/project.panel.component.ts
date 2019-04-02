import { Component } from '@angular/core';
import { DirectoryTreeComponent } from 'ng2-directory-tree'

@Component({
  selector: 'project-panel',
  template: `
  <div class="project-panel" id="project-panel">

    <div class="project-window">
      <directory-tree [directory]="dir" (onChange)="logging($event)" [keyboardWatch]=true></directory-tree>
    </div>

  </div>
  `,
  directives: [DirectoryTreeComponent]
})

export class ProjectPanelComponent {

  dir = {
    "name": "photos",
    "children": [
      {
        "name": "summer",
        "children": [
          {
            "name": "june",
            "children": [
              {
                "name": "windsurf.jpg"
              }]
          }
        ]
      }
    ]
  }

  logging(node) {
      console.log(node)
  }
}
