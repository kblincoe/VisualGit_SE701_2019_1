'use strict';

const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Add library for triggering hot electron reloads
require('electron-reload')(__dirname, {
	electron: require('${__dirname}/../../node_modules/electron'),
	ignored: /recents.json|[\/\\]\./, // avoid reload when we write to recents
});

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor : "#000",
		icon: __dirname + '/assets/VisualGit_Logo.png'
	});

	
	win.maximize();

	win.setTitle(require('./package.json').name);
	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	return win;
}

function setMyMenu() {
	const myMenu = [
		{
			label: 'View',
			submenu: [
				{role: 'togglefullscreen'},
			]
		},
		{
			label: 'Window',
			submenu: [
				{role: 'minimize'},
				{type: 'separator'},
				{role: 'close'}
			]
		},
		{
			label: 'Style',
			submenu: [
				{
					label: 'White',
					click() {
						var focusedWindow = BrowserWindow.getFocusedWindow();
						focusedWindow.webContents.send('change-to-white-style');
					}
				},
				{
					label: 'Pink',
					click() {
						var focusedWindow = BrowserWindow.getFocusedWindow();
						focusedWindow.webContents.send('change-to-pink-style');
					}
				},
				{
					label: 'Blue',
					click() {
						var focusedWindow = BrowserWindow.getFocusedWindow();
						focusedWindow.webContents.send('change-to-blue-style');
					}
				},
				{
					label: 'Navy',
					click() {
						var focusedWindow = BrowserWindow.getFocusedWindow();
						focusedWindow.webContents.send('change-to-navy-style');
					}
				},
				{
					label: 'Green',
					click() {
						var focusedWindow = BrowserWindow.getFocusedWindow();
						focusedWindow.webContents.send('change-to-green-style');
					}
				},
				{
					label: 'Default',
					click() {
						var focusedWindow = BrowserWindow.getFocusedWindow();
						focusedWindow.webContents.send('change-to-default-style');
					}
				}]
		},
		{
			label: 'Help',
			submenu: [
				{
					label: require('./package.json').name + ': ' + require('./package.json').description,
					enabled: false
				},
				{type: 'separator'},
				{
					label: 'Version ' + require('./package.json').version,
					enabled: false
				},
				{
					label: 'GitHub Homepage',
					click () { 
						require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1'); 
					}
				},
				{
					label: 'Features',
					submenu: [
						{
							label: 'Opening/Cloning Repositories',
							click () { 
								require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1/wiki/Opening-or-Cloning-Repositories'); 
							}
						},
						{
							label: 'Adding and Committing',
							click () { 
								require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1/wiki/Adding-&-Committing'); 
							}
						},
						{
							label: 'Pushing and Pulling from Remote',
							click () { 
								require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1/wiki/Pushing-&-Pulling-from-Remote'); 
							}
						},
						{
							label: 'Complete List of Features',
							click () { 
								require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1/wiki/Features'); 
							}
						}
						
					]	
				},
				{
					label: 'Report Bugs or Request New Features',
					click () { 
						require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1/issues'); 
					}
				},
				{
					label: 'Offline Support',
					click () { 
						require('electron').shell.openItem(__dirname + '/README.pdf');   
					}
				},
				{
					label: 'Learn More',
					click () { 
						require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1/wiki'); 
					}  
				},
				{type: 'separator'},
				{
					label: 'More Info on External Libraries',
					click () { 
						require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701_2019_1#help'); 
					}
				}
			]
		}, {
			label: "Edit",
			submenu: [
				{label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
				{label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
				{label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
				{label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"},
				{label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
				{label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"}
			]
		}, {
			label: "Mac_Application",
			submenu: [
				{label: "Quit", accelerator: "Command+Q", click: function () {app.quit();}}
			]
		}];

	return myMenu;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
	Menu.setApplicationMenu(Menu.buildFromTemplate(setMyMenu()));
});
