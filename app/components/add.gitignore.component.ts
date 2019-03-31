//https://codepen.io/rustybailey/pen/GJjvYB
import { Component, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "add-gitignore-panel",
    template: `
<div class="dropdown-container" >
    <div class="dropdown-button noselect" (click)="onContainerClick(e)">
        <div class="dropdown-label">Project Type</div>
        <i class="fa fa-filter"></i>
    </div>
    <div class="dropdown-list" *ngIf="show">
        <input type="search" [(ngModel)]="query" placeholder="Search types" class="dropdown-search"/>
        <div id="listhere">
        <ul *ngFor="let type of types; let i = index">
            <li *ngIf="type.toLowerCase().indexOf(query) !== -1">
                <input [name]="type" [(ngModel)]="checked[i]" (ngModelChange)="onChange(e)" type="checkbox">
                <label>{{type}}</label>
            </li>
        </ul>
        </div>
    </div>
</div>
`
})

export class AddGitignoreComponent {

    @Output('ngInit') initEvent: EventEmitter<any> = new EventEmitter();

    types: String[] = [];
    checked: boolean[] = [];
    query: string = "";
    selectedItems: String[] = [];
    show = false;

    //Runs on creation of component
    ngOnInit() {
        console.log('Init gitignore list');
        queryGitignoreTypes((types: String[]) => {
            this.types = types;
            this.checked = this.types.map(_ => false);
        })
    }

    onChange(e) {
        this.selectedItems = this.checked
            .reduce((out, bool, index) => bool ? out.concat(index) : out, [] as number[])
            .map(val => this.types[val]);
        console.log(this.selectedItems);
    }

    onContainerClick(e) {
        this.show = !this.show;
    }
}