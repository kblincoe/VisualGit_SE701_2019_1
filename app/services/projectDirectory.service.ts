import Git = require('nodegit');

export class ProjectDirectoryService {

    getDirectories(dir:string): string[] {

        dir = repoFullPath + dir;
        let fileList = this.searchDirectory(dir, 'directories');

        return fileList;
    }

    getFiles(dir:string): string[] {
        
        dir = repoFullPath + dir;
        let fileList = this.searchDirectory(dir, 'files');

        return fileList;
    }

    searchDirectory(dirPath:string, type:string): string[] {
        let fileList = [''];
        var files = fs.readdirSync(dirPath);
        for (var i in files) {
            if (!files.hasOwnProperty(i)) continue;
            var fullName = dirPath+'/'+files[i];
            if (fs.statSync(fullName).isDirectory() && type === 'directories'){
                fileList.push(fullName.replace(dirPath, ''))
            } else if (type === 'files') {
                fileList.push(fullName.replace(dirPath, ''));
            }
        }

        return fileList;
    }
}