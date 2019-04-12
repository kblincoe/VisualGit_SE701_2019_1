import { Component } from '@angular/core';

const DIFF_PANEL_COMPONENT_REF: string = 'diffPanelComponent';

@Component({
  moduleId: module.id,
  selector: 'diff-panel',
  templateUrl: './diff.panel.component.html',
})

export class DiffPanelComponent {

  constructor() {
    window[DIFF_PANEL_COMPONENT_REF] = {
      close: () => this.close(),
      open: () => this.open(),
    };
  }

  disableDiffPanelEditOnHide(): void {
    const doc = document.getElementById('diff-panel-body');
    doc.contentEditable = 'false';
  }

  hideDiffPanel(): void {
    document.getElementById('diff-panel').style.width = '0';
    document.getElementById('graph-panel').style.width = '80%';
    this.disableDiffPanelEditOnHide();
  }

  displayDiffPanel(): void {
    document.getElementById('graph-panel').style.width = '20%';
    document.getElementById('diff-panel').style.width = '60%';
  }

  open(): void {
    this.displayDiffPanel();
  }

  close(): void {
    this.hideDiffPanel();
  }

}
