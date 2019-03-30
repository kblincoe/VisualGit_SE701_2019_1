/// <reference path='git.ts' />


// import * as nodegit from 'git';
// import NodeGit, { Status } from 'nodegit';

import Git = require('nodegit');
const repo;

import github = require('octonode');
const aid;
const atoken;
let client;
let avaterImg;
const repoList = {};
let url;
let signed = 0;
let changes = 0;


// Called then user pushes to sign out even if they have commited changes but not pushed; prompts a confirmation modal

function CommitNoPush(){
  if (CommitButNoPush === 1){
    $('#modalW2').modal();
  }
}

function signInHead(callback) {
  if (signed === 1){
    if ((changes === 1) || (CommitButNoPush === 1)){
      $('#modalW2').modal();
    }
    else {
      getUserInfo(callback);
    }
  }
  else{
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
  if (document.getElementById("rememberLogin").checked == true) {
    storeCredentials(document.getElementById("auth-username").value, document.getElementById("auth-password").value);
  }
  getUserInfo(callback);
}


async function loginWithSaved(callback) {
  const credentials = await readCredentials();
  if (credentials) {
    document.getElementById("auth-username").value = credentials.username;
    document.getElementById("auth-password").value = credentials.password;
  }
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
        password: password
    });

    var ghme = client.me();
    ghme.info(function (err, data, head) {
        if (err) {
            /*
            I know this is bad, but our hands are tied since the HTTP callback is encapsulated in the octonode module.
            Effectively, if verifying the github account fails, the github module (octonode) returns an 'informative'
            message. In this case, we want to provide 2FA support, hence when the error message is regarding the OTP
            code, we change to personal access token. Otherwise, we display the error in the modal window.
             */
            if (err.toString() === "Error: Must specify two-factor authentication OTP code.") {
                let password = document.getElementById(passid);
                password.value = "";
                password.placeholder = "personal access token";

                document.getElementById("personalAccessTokenMsg").style.display = "block";
            } else {
                displayModal(err);
            }
        } else {
            setAccountInfo(data);
            signed = 1;
            callback();

            ghme.repos(function(err, data, head) {
                if (err) {
                    return;
                } else {
		    if (data.length > 0){
			let ul = document.getElementById("repo-dropdown");
			ul = ul.removeChild(document.getElementById("empty-message"));
    		    }
		
                    for (let i = 0; i < data.length; i++) {
                        let rep = Object.values(data)[i];
                        console.log(`Getting repo info from: ${rep['html_url']}`);
                        displayBranch(rep['full_name'], "repo-dropdown", "selectRepo(this)");
                        repoList[rep['full_name']] = rep['html_url'];
                    }
                }
            });
        }
    });
}

function selectRepo(ele) {
  url = repoList[ele.innerHTML];
  const butt = document.getElementById('cloneButton');
  butt.innerHTML = 'Clone ' + ele.innerHTML;
  butt.setAttribute('class', 'btn btn-primary');
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

function signInOrOut() {
  const doc = document.getElementById('avatar');
  if (doc.innerHTML === 'Sign Out'){
    $('#avatar').removeAttr('data-toggle');

    if ((changes === 1) || (CommitButNoPush === 1)){
      $('#modalW2').modal();
    }
    else {
      redirectToHomePage();
    }
  }
  // Clear sign in input fields
  document.getElementById('head-username').value = '';
  document.getElementById('head-password').value = '';
}

function redirectToHomePage() {
  window.onbeforeunload = Confirmed;
  window.location.href = 'index.html';
  signed = 0;
  changes = 0;
  CommitButNoPush = 0;
  //LogInAfterConfirm();
}

function setAccountInfo(data) {
    if (data != null) {
        // As were logged in, we display account instead of sign in button
        let account_group = document.getElementById("github_account");
        let sign_in = document.getElementById("sign_in");
        account_group.style.display = "block";
        sign_in.style.display = "none";

        // Populate elements with account data from GitHub callback
        let avatar = document.getElementById("github_avatar");
        let name = document.getElementById("github_name");
        avatar.src = data.avatar_url;
        name.innerText = data.login;
    }
}
