'use strict';

const electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu, } = electron;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Add library for triggering hot electron reloads
require('electron-reload')(__dirname, {
	electron: require('${__dirname}/../../node_modules/electron'),
	ignored: /recents.json|[\/\\]\./, // avoid reload when we write to recents
});

// prevent window being garbage collected
let mainWindow;
let bgProcess;

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
			// {role: 'close'},
			{label: "Quit", accelerator: "CmdOrCtrl+Q", click: function () {app.quit();}}
		]
	},
	{
		label: 'Tools',
		submenu: [
			{
				label: 'Git',
				submenu: [
					{
						label: 'Push',
						click() {
							var focusedWindow = BrowserWindow.getFocusedWindow();
							focusedWindow.webContents.send('push-to-remote');
						},
					},
					{
						label: 'Pull',
						click() {
							var focusedWindow = BrowserWindow.getFocusedWindow();
							focusedWindow.webContents.send('pull-from-remote');
						},
					},
					{
						label: 'Clone',
						click() {
							var focusedWindow = BrowserWindow.getFocusedWindow();
							focusedWindow.webContents.send('clone-from-remote');
						},
					},
					{
						label: 'Clean',
						click() {
							var focusedWindow = BrowserWindow.getFocusedWindow();
							focusedWindow.webContents.send('clean-repo');
						},
					},
					{
						label: 'Sync',
						click() {
							var focusedWindow = BrowserWindow.getFocusedWindow();
							focusedWindow.webContents.send('request-link-modal');
						}
					},
				],
				enabled: false,
			},
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
	}
];


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
	Menu.setApplicationMenu(Menu.buildFromTemplate(myMenu));

	// start background process to initialize graph
	ipcMain.on('initGraph', (event, param) => {
		bgProcess = new electron.BrowserWindow({ show: false });
		bgProcess.loadURL('file://' + __dirname + '/app/backgroundTasks/initializeGraph.html');

		ipcMain.on('ready', () => {
			bgProcess.webContents.send('initGraph', param);
		});
	});

	// notify main window when background graph initialization is finished
	ipcMain.on('finishGraph', (event, param) => {
		mainWindow.webContents.send('finishGraph', param);
	});

	// pass any messages back to the main window to display in console.
	ipcMain.on('log', (event, params) => {
		log(params);
	});
});

ipcMain.on('authenticate', (event, signedIn) => {
	const authMenu = myMenu;
	authMenu[2].submenu[0].enabled = signedIn;
	Menu.setApplicationMenu(Menu.buildFromTemplate(authMenu))
});


function log(msg) {
	mainWindow.webContents.send('log', msg);
}