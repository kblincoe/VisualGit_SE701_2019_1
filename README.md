# Welcome

An easy-to-use, visually-oriented desktop client for Git aimed at helping students learn the standard Git workflow.
You can get a summary of our project by reading our [cool poster](https://github.com/ElliotWhiley/VisualGit/raw/resources/visualgit-poster.pdf)   :)

# Installation

### Prerequisites

npm (Node Package Manager) is used to manage VisualGit's dependencies, therefore it is required to install and run VisualGit.

Python 2.x is required, Python 3.x is unsupported by NodeGit.

Follow the installation instructions below:

#### RHEL-based systems
````
sudo yum install npm
````
Or on more modern RHEL-based systems (i.e. Fedora 27+)
````
sudo dnf install npm
````

#### Debian-based systems
````
sudo apt-get install npm
````

#### Mac
If you have homebrew installed:
````
brew install npm
````
Otherwise download and install the latest version of [Node.js](https://nodejs.org/en/) (v6.2.1 or later)

#### Windows
Download and install the latest version of  [Node.js](https://nodejs.org/en/) (v6.2.1 or later)
Download and install [python 2](https://www.python.org/downloads/release/python-2715/)
Set the enviroment variable PYTHON to point to the python executable

### Setup
Clone with either HTTPS or SSH:

_Please note you must clone this to a location **without** any spaces in the path, otherwise you will get errors when running `npm install`_

#### SSH
````
git clone git@github.com:kblincoe/VisualGit_SE701_2019_1.git
````

#### HTTPS
````
git clone https://github.com/kblincoe/VisualGit_SE701_2019_1.git
````
then...

````
cd VisualGit
npm install
npm start
````

If you are a windows user and are getting MSBuild-related errors during the install, try running `npm install --global windows-build-tools` in a terminal with **administrator privileges**. This will give you the necessary tools to compile the dependencies.

# Development

### TypeScript
[TypeScript](https://www.typescriptlang.org/) is a statically-typed superset of JavaScript that compiles into JavaScript. Most of our source files are written in TypeScript (.ts files), therefore you will need to run a TypeScript compiler to compile the source code to JavaScript (.js files) as you make changes, e.g. [typescript-compiler](https://www.npmjs.com/package/typescript-compiler) for Node.

To run the compiler use the following command:
````
npm run-script createjs
````

### Angular2
[Angular](https://angular.io/) is a framework that combines declarative templates, dependency injections, end to end tooling, and integrated best practices. The original source code was written using AngularJS and then reworked to use Angular2 instead, which was a complete rewrite of the former. As a result, note that the source code still retains conventions and code fragments from AngularJS in some places.

# Features

### Opening / Cloning repositories
Repositories can be added by two methods; either by cloning the remotely hosted repository or opening it from the local file system. This is achieved using the add repository button in the top left which will update the screen to the add repository view.

#### Clone
Currently, VisualGit only supports cloning via. HTTPS. HTTPS clones are authenticated using the same username/password that you use to log into VisualGit. 2FA OTP entry is unsupported, so you will have to use a Personal Access Token to log into VisualGit. While SSH cloning is technically supported, no authentication methods are supported and thus there is no way to push back to the repo if you clone using SSH.

#### Open local repository
Currently, when you clone a repository, it is saved to a directory under `./VisualGit/`. This means that when you open a repository which is saved locally, you can simply enter the name of the directory relative to the VisualGit directory. Other save locations are not currently supported but it is planned in future work.

### Adding & Committing
When changes are made in a repository which is open, the interface will update by showing each file which has uncommitted changes. These changes will be displayed as a traffic light scheme:
 - Green: Added file
 - Orange: Modified file
 - Red: Deleted file

This is used to allow users to see the different types of changes easily and once they click on the files, the file differences will be shown. The file differences are shown line by line with green lines representing added lines and red representing deleted lines. Any other parts of the file are unchanged.

### Pushing & Pulling from remote
The pulling and pushing currently works for changes which are made on master and origin/master by syncing these up. When the pull button is clicked, any changes on the remote repository will be added to the local repository and the graph will be updated. When pushing, the same process applies. The changes on master will be pushed to the remote repository.

# Contributing
We are open to pull requests with new features or improvements.

# Help
VisualGit utilises a range of libraries and frameworks, more information on them can be found below:

 - [Electron](http://electron.atom.io/)
 - [Node.js](https://nodejs.org/en/about/)
 - [AngularJS](https://angular.io/)
 - [nodegit](http://www.nodegit.org/)
 - [Vis.js](http://visjs.org/docs/network/)
 - [TypeScript](https://www.typescriptlang.org/)
