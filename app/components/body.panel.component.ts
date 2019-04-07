import { Component } from '@angular/core';
import { DiffPanelComponent } from './diff.panel.component';
import { GraphPanelComponent } from './graph.panel.component';
import { ProjectPanelComponent } from './project.panel.component';

@Component({
  selector: 'body-panel',
  template: `
  <div class="body-panel" id="body-panel">
    <diff-panel></diff-panel>
    <project-panel></project-panel>
    <graph-panel></graph-panel>
  </div>
  `,
  directives: [DiffPanelComponent, GraphPanelComponent, ProjectPanelComponent],
})

export class BodyPanelComponent {

}
