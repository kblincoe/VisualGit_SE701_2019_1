import { Component } from '@angular/core';

@Component({
  selector: 'editor-component',
  template: `
    <div class="editor-component" id="editor-component">
        <button class="back-button" (click)="handleBackClick()">Back</button>
        <button class="save-button" (click)="handleSaveClick()">Save</button>
        <textarea class="input" id="editor"></textarea>
    </div>
  `
})

export class EditorComponent { 

    handleBackClick():void {
        switchToMainPanel();
    }

    handleSaveClick():void {
        saveFileFromEditor();
    }
}