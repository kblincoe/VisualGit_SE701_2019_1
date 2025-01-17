/// <reference path='git.ts' />


import * as nodegit from 'git';
import NodeGit, { Status } from 'nodegit';

import { ipcRenderer } from 'electron';
import Git = require('nodegit');

import github = require('octonode');
let client;
const repoList = {};
let url;
let signedIn = false;

function signInHead(callback) {
  if (signedIn) {
    confirmSignOut();
  } else {
    getUserInfo(callback);
  }
}

function LogInAfterConfirm(callback){
  getUserInfo(callback);
}

function ModalSignIn(callback){
  getUserInfo(callback);
}

function signInPage(callback) {
  if (document.getElementById('rememberLogin').checked === true) {
    storeCredentials(document.getElementById('auth-username').value, document.getElementById('auth-password').value);
  }
  getUserInfo(callback);
}


async function loginWithSaved(callback) {
  const credentials = await readCredentials();
  if (credentials) {
    document.getElementById('auth-username').value = credentials.username;
    document.getElementById('auth-password').value = credentials.password;
    return true;
  }
  return false;
}

/**
 * This function reads the input fields for signing in and attempts to sign
 * the user in to their GitHub account.
 */
function getUserInfo(callback) {
  let userid = 'auth-username';
  let passid = 'auth-password';

  // Determine which form the user is using to sign in
  if (document.getElementById('auth-username').value === '' && document.getElementById('auth-password').value === '') {
    userid = 'head-username';
    passid = 'head-password';
  }

  const username = document.getElementById(userid).value;
  const password = document.getElementById(passid).value;

  cred = Git.Cred.userpassPlaintextNew(username, password);

  client = github.client({
    username: username,
    password: password,
  });

  const ghme = client.me();
  ghme.info(function(err, data, head) {
    if (err) {
      /*
      I know this is bad, but our hands are tied since the HTTP callback is encapsulated in the octonode module.
      Effectively, if verifying the github account fails, the github module (octonode) returns an 'informative'
      message. In this case, we want to provide 2FA support, hence when the error message is regarding the OTP
      code, we change to personal access token. Otherwise, we display the error in the modal window.
        */
      if (err.toString() === 'Error: Must specify two-factor authentication OTP code.') {
        const password = document.getElementById(passid);
        password.value = '';
        password.placeholder = 'personal access token';

        document.getElementById('personalAccessTokenMsg').style.display = 'block';
      } else {
        /*
        Again, this is a bit of a hack but unfortunately due to the encapsulation in the octonode module, there is
        no other way to implement this. Without this, when the user inputs no username but inputs a password, the message
        in the modal switches between two messages and is not helpful to the user.
          */
        if (err.toString() !== 'Error: Requires authentication') {
          displayModal(err);
        }
      }
    } else {
      setAccountInfo(data);
      signedIn = true;
      ipcRenderer.send('authenticate', signedIn);
      callback();

      ghme.repos(function(err, data, head) {
        if (err) {
            return;
        } else {
          if (data.length > 0){
            let ul = document.getElementById('repo-dropdown');
            ul = ul.removeChild(document.getElementById('empty-message'));
          }

          for (let i = 0; i < data.length; i++) {
              const rep = Object.values(data)[i];
              console.log(`Getting repo info from: ${rep['html_url']}`);
              displayRepo(rep['full_name'], 'repo-dropdown');
              repoList[rep['full_name']] = rep['html_url'];
          }
        }
      });
    }
  });
}

/**
 * Populates the repository list
 */
function displayRepo(name, id) {

  let parent = name.split('/')[1];
  parent = parent.replace(/\./g, '-'); // Remove invalid characters for a data-togle name

  const fork = name.split('/')[0];

  const branchList = document.getElementById(id);

  if (document.getElementById(parent) == null){ // If main repository isnt in lsit yet, add it
    const liParent = document.createElement('li');

    const titleParent = document.createElement('a');
    titleParent.setAttribute('class', 'list-group-item collapsed');
    titleParent.appendChild(document.createTextNode(parent));

    // Start drop down as closed
    titleParent.setAttribute('data-toggle', 'collapse');
    titleParent.setAttribute('data-target', '#' + parent);
    titleParent.setAttribute('aria-expanded', 'false');
    titleParent.setAttribute('href', '#');
    liParent.appendChild(titleParent);

    const ulParent = document.createElement('ul');
    ulParent.setAttribute('aria-expanded', 'false');
    ulParent.setAttribute('class', 'collapse');
    ulParent.setAttribute('style', 'height: 0px;');
    ulParent.setAttribute('style', 'padding-left: 0px');
    ulParent.setAttribute('id', parent);
    liParent.appendChild(ulParent);
    if (branchList != null){
      branchList.appendChild(liParent);
    }
  }

  // Now create a fork option for the main repo
  const li = document.createElement('li');
  const a = document.createElement('a');
  const ulParent = document.getElementById(parent);

  a.setAttribute('href', '#');
  a.setAttribute('class', 'list-group-item');
  a.addEventListener('click', () => {
    // Set button to clone selected repo
    url = repoList[name];
    const button = document.getElementById('cloneButton');
    button.innerHTML = 'Clone ' + name;
    button.setAttribute('class', 'btn btn-primary');
    button.onclick = function() {cloneRepo(); };
  });
  li.setAttribute('role', 'presentation');
  a.appendChild(document.createTextNode(fork));
  li.appendChild(a);
  if (ulParent != null){
    ulParent.appendChild(li);
  }
}

function cloneRepo() {
  if (url === null) {
    updateModalText(
      'Web URL for repo could not be found. Try cloning by providing the repo\'s web URL directly in the \'Add repository\' window');
    return;
  }

  console.log(`Cloning repo from: ${url}`);
  const splitUrl = url.split('/');
  let local;
  if (splitUrl.length >= 2) {
    local = splitUrl[splitUrl.length - 1];
  }

  if (local == null) {
    updateModalText('Error: could not define name of repo');
    return;
  }

  downloadFunc(url, local);
  url = null;
  $('#repo-modal').modal('hide');
}

function confirmSignOut() {
  if (signedIn) {
    if (hasChanges()) {
      $('#modalWarnNotCommittedLogout').modal();
    } else if (hasUnpushedCommits()) {
      $('#modalWarnNotPushedLogout').modal();
    } else {
      redirectToHomePage();
    }
  }
}

function redirectToHomePage() {
  window.onbeforeunload = Confirmed;
  window.location.href = 'index.html';
  signedIn = false;
  clear();
}

function setAccountInfo(data) {
    if (data != null) {
        // As were logged in, we display account
        const accountGroup = document.getElementById('github_account');
        const returnMainMenu = document.getElementById('return_main_menu');
        accountGroup.style.display = 'block';
        returnMainMenu.style.display = 'none';

        // Populate elements with account data from GitHub callback
        const avatar = document.getElementById('github_avatar');
        const name = document.getElementById('github_name');
        avatar.src = data.avatar_url;
        name.innerText = data.login;
    }
}

function continueWithoutSignIn() {
  const returnMainMenu = document.getElementById('return_main_menu');
  returnMainMenu.style.display = 'block';
}
