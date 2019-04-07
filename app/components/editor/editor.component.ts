import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'editor-component',
  templateUrl: './editor.component.html',
})

export class EditorComponent {

    handleBackClick(): void {
        switchToMainPanel();
    }

    handleSaveClick(): void {
        saveFileFromEditor();
    }
}
