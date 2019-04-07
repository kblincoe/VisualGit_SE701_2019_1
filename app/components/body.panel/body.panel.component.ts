import { Component } from '@angular/core';
import { DiffPanelComponent } from '../diff.panel/diff.panel.component';
import { GraphPanelComponent } from '../graph.panel/graph.panel.component';
import { ProjectPanelComponent } from '../project.panel/project.panel.component';

@Component({
  moduleId: module.id,
  selector: 'body-panel',
  templateUrl: './body.panel.component.html',
  directives: [DiffPanelComponent, GraphPanelComponent, ProjectPanelComponent],
})

export class BodyPanelComponent {

}
