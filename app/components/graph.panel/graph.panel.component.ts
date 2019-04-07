import { Component, NgZone } from '@angular/core';

const GRAPH_COMPONENT_REF: string = 'graphComponent';

@Component({
  moduleId: module.id,
  selector: 'graph-panel',
  templateUrl: './graph.panel.component.html',
})

export class GraphPanelComponent {
  isLoading: boolean;
  zone: NgZone;

  constructor(zone: NgZone) {
    this.zone = zone;
    this.isLoading = false;

    window[GRAPH_COMPONENT_REF] = {
      setLoading: (state: boolean) => this.setLoading(state),
    };
  }

  setLoading(loading: boolean) {
    this.zone.run(() => {
      this.isLoading = loading;
    });
  }

  mergeBranches(): void {
    const p1 = document.getElementById('fromMerge').innerHTML;
    mergeCommits(p1);
  }

  rebaseBranches(): void {
    const p1 = document.getElementById('fromRebase').innerHTML;
    const p2 = document.getElementById('toRebase').innerHTML;
    rebaseCommits(p1, p2);
  }
}
