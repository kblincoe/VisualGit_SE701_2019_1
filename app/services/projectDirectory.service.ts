import { Injectable } from '@angular/core';
import * as path from 'path'
import Git = require('nodegit');

@Injectable()
export class ProjectDirectoryService {

    currentDir: string;
    fileSep: string;

    moveDownInDirectory(dir: string): void {
        if (!this.currentDir) { this.currentDir = repoFullPath; }
        this.currentDir = this.currentDir + path.sep + dir;
    }

    moveUpInDirectory(): void {
        if (this.currentDir != repoFullPath) {
            this.currentDir = this.currentDir.substr(0, this.currentDir.lastIndexOf(path.sep));
        }
    }

    getDirectories(): string[] {

        if (!this.currentDir) { this.currentDir = repoFullPath; }
        const fileList = this.searchDirectory(this.currentDir, 'directories');

        return fileList;
    }

    getFiles(): string[] {

        if (!this.currentDir) { this.currentDir = repoFullPath; }
        const fileList = this.searchDirectory(this.currentDir, 'files');

        return fileList;
    }

    getFullPathName(fileName: string): string {
        return this.currentDir + path.sep + fileName;
    }

    private searchDirectory(dirPath: string, type: string): string[] {
        const fileList = [''];
        const files = fs.readdirSync(dirPath);
        for (const i in files) {
            if (!files.hasOwnProperty(i)) { continue; }
            const fullName = dirPath + path.sep + files[i];
            if (fs.statSync(fullName).isDirectory() && type === 'directories'){
                fileList.push(fullName.replace(dirPath + path.sep, ''));
            } else if (!fs.statSync(fullName).isDirectory() && type === 'files') {
                fileList.push(fullName.replace(dirPath + path.sep, ''));
            }
        }

        return fileList;
    }
}
