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
  hideGraphPanel();
  displayClonePanel();
}

function switchToMainPanel() {
  hideAuthenticatePanel();
  hideAddRepositoryPanel();
  displayFilePanel();
  displayGraphPanel();
}

function switchToAddRepositoryPanel() {
  hideAuthenticatePanel();
  hideFilePanel();
  hideGraphPanel();
  displayAddRepositoryPanel();
}

function wait(ms){
  const start = new Date().getTime();
  const end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function displayClonePanel(){

  const vals = 'add-repository-panel';
  document.getElementById('add-repository-panel').style.zIndex = '10';
  $('#open-local-repository').hide();
}

function displayFilePanel() {
  document.getElementById('file-panel').style.zIndex = '10';
}

function displayGraphPanel() {
  document.getElementById('graph-panel').style.zIndex = '10';
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

function hideAddRepositoryPanel() {
  document.getElementById('add-repository-panel').style.zIndex = '-10';
}

function displayDiffPanel() {
  document.getElementById('graph-panel').style.width = '60%';
  document.getElementById('diff-panel').style.width = '40%';
  displayDiffPanelButtons();
}

function hideDiffPanel() {
  document.getElementById('diff-panel').style.width = '0';
  document.getElementById('graph-panel').style.width = '100%';
  disableDiffPanelEditOnHide();
  hideDiffPanelButtons();
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

function displayDiffPanelButtons(){
  document.getElementById('save-button').style.visibility = 'visible';
  document.getElementById('cancel-button').style.visibility = 'visible';
}

function hideDiffPanelButtons(){
  document.getElementById('save-button').style.visibility = 'hidden';
  document.getElementById('cancel-button').style.visibility = 'hidden';
  disableSaveCancelButton();
  disableDiffPanelEditOnHide();
}

function disableSaveCancelButton() {
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');
  saveButton.disabled = true;
  saveButton.style.backgroundColor = gray;
  cancelButton.disabled = true;
  cancelButton.style.backgroundColor = gray;
}

function enableSaveCancelButton() {
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');
  saveButton.disabled = false;
  saveButton.style.backgroundColor = blue;
  cancelButton.disabled = false;
  cancelButton.style.backgroundColor = blue;
}

function disableDiffPanelEditOnHide(){
  const doc = document.getElementById('diff-panel-body');
  doc.contentEditable = 'false';
}

async function useSaved() {
  await loginWithSaved(switchToMainPanel);
}
