import Git = require('nodegit');

export class ProjectDirectoryServcie {

    getFolders(): string[] {

        let fileList = [];
        this.getFiles(repoFullPath, fileList)

        return [fileList];
    }

    getFiles(dir:string, fileList): [] {
        fileList = fileList || [];
    
        var files = fs.readdirSync(dir);
        for(var i in files){
            if (!files.hasOwnProperty(i)) continue;
            var name = dir+'/'+files[i];
            if (fs.statSync(name).isDirectory()){
                this.getFiles(name, fileList);
            } else {
                fileList.push(name);
            }
        }
        return fileList;
    }
}