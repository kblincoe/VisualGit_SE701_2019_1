import { Injectable } from '@angular/core';
import Git = require('nodegit');

@Injectable()
export class ProjectDirectoryService {

    currentDir: string;
    fileSep: string;

    constructor() {
        if (process.platform === 'win32') {
            this.fileSep = '\\';
        } else {
            this.fileSep = '/';
        }
    }

    moveDownInDirectory(dir: string): void {
        if (!this.currentDir) { this.currentDir = repoFullPath; }
        this.currentDir = this.currentDir + this.fileSep + dir;
    }

    moveUpInDirectory(): void {
        if (this.currentDir !== repoFullPath) {
            this.currentDir = this.currentDir.substr(0, this.currentDir.lastIndexOf(this.fileSep));
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
        return this.currentDir + this.fileSep + fileName;
    }

    private searchDirectory(dirPath: string, type: string): string[] {
        const fileList = [''];
        const files = fs.readdirSync(dirPath);
        for (const i in files) {
            if (!files.hasOwnProperty(i)) { continue; }
            const isUnixHiddenPath = files[i].startsWith(".");
            if (!isUnixHiddenPath) {
                const fullName = dirPath + this.fileSep + files[i];
                if (fs.statSync(fullName).isDirectory() && type === 'directories'){
                    fileList.push(fullName.replace(dirPath + this.fileSep, ''));
                } else if (!fs.statSync(fullName).isDirectory() && type === 'files') {
                    fileList.push(fullName.replace(dirPath + this.fileSep, ''));
                }
            }
        }

        return fileList;
    }
}
