let cred;
let blue = '#39c0ba';
let gray = '#5b6969';

const {authenticate} = require('authenticate');

function collapseSignPanel() {
  $('#nav-collapse1').collapse('hide');
  // Clear sign in input fields
  document.getElementById('head-username').value = '';
  document.getElementById('head-password').value = '';
}

function switchToClonePanel(){
  hideAuthenticatePanel();
  hideFilePanel();
  hideProjectPanel();
  hideGraphPanel();
  hideEditorPanel();
  displayClonePanel();
}

function switchToMainPanel() {
  hideAuthenticatePanel();
  hideAddRepositoryPanel();
  hideEditorPanel();
  displayFilePanel();
  displayProjectPanel();
  displayGraphPanel();
}

function switchToEditorPanel() {
  document.getElementById('editor').value = '';
  hideAuthenticatePanel();
  hideFilePanel();
  hideProjectPanel();
  hideGraphPanel();
  displayEditorPanel();
}

function switchToAddRepositoryPanel() {
  hideAuthenticatePanel();
  hideFilePanel();
  hideProjectPanel();
  hideGraphPanel();
  hideEditorPanel();
  displayAddRepositoryPanel();
}

function wait(ms){
  const start = new Date().getTime();
  const end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function displayEditorPanel() {
  document.getElementById('editor-component').style.zIndex = '10';
}

function hideEditorPanel() {
  document.getElementById('editor-component').style.zIndex = '-10';
}

function displayClonePanel(){
  const vals = 'add-repository-panel';
  document.getElementById('add-repository-panel').style.zIndex = '10';
}

function displayFilePanel() {
  document.getElementById('file-panel').style.zIndex = '10';
}

function displayGraphPanel() {
  document.getElementById('graph-panel').style.zIndex = '10';
}

function displayProjectPanel() {
  document.getElementById('project-panel').style.zIndex = '10';
}

function displayAddRepositoryPanel() {
  document.getElementById('add-repository-panel').style.zIndex = '10';
  populateRecents();
  $('#open-local-repository').show();
}

function hideFilePanel() {
  document.getElementById('file-panel').style.zIndex = '-10';
}

function hideGraphPanel() {
  document.getElementById('graph-panel').style.zIndex = '-10';
}

function hideProjectPanel() {
  document.getElementById('project-panel').style.zIndex = '-10';
}

function hideAddRepositoryPanel() {
  document.getElementById('add-repository-panel').style.zIndex = '-10';
}

function displayDiffPanel() {
  document.getElementById('graph-panel').style.width = '20%';
  document.getElementById('diff-panel').style.width = '60%';
}

function hideDiffPanel() {
  document.getElementById('diff-panel').style.width = '0';
  document.getElementById('graph-panel').style.width = '80%';
  disableDiffPanelEditOnHide();
}

function hideAuthenticatePanel() {
  document.getElementById('authenticate').style.zIndex = '-20';
  // Clear sign in input fields
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-password').value = '';
}

function displayAuthenticatePanel() {
  document.getElementById('authenticate').style.zIndex = '20';
}

function disableDiffPanelEditOnHide(){
  const doc = document.getElementById('diff-panel-body');
  doc.contentEditable = 'false';
}

function clearCloneButtonCache() {
  const butt = document.getElementById('cloneButton');
  butt.innerHTML = 'Clone';
  butt.setAttribute('class', 'btn btn-primary disabled');
}

async function hasSavedCredentials() {
  return await loginWithSaved(switchToMainPanel);
}

function closeSplashScreen(): void {
  document.getElementById("splash").style.display = "none";
  document.getElementById("content").style.display = "block";
}
