// https://codepen.io/rustybailey/pen/GJjvYB
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'add-gitignore-panel',
    templateUrl: './add.gitignore.component.html',
})

export class AddGitignoreComponent {

    @Output('ngInit') initEvent: EventEmitter<any> = new EventEmitter();

    types: string[] = [];
    checked: boolean[] = [];
    query: string = '';
    selectedItems: string[] = [];
    show = false;

    // Runs on creation of component
    ngOnInit() {
        console.log('Init gitignore list');
        queryGitignoreTypes((types: string[]) => {
            this.types = types;
            this.checked = this.types.map((_) => false);
        });
    }

    onChange(e) {
        this.selectedItems = this.checked
            .reduce((out, bool, index) => bool ? out.concat(index) : out, [] as number[])
            .map((val) => this.types[val]);
        console.log(this.selectedItems);
    }

    onContainerClick(e) {
        this.show = !this.show;
    }
}
