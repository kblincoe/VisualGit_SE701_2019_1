import fetch from 'node-fetch';
import { parse } from 'path';

import $ = require('jQuery');
import jsonfile = require('jsonfile');
import NetworkSpeed = require('network-speed');
import Git = require('nodegit');
import ProgressBar = require('progressbar.js');

let repoFullPath;
let repoLocalPath;
const projectPanelComponent: ProjectPanelComponent;
let bname = {};
const branchCommit = [];
const remoteName = {};
const localBranches = [];
const recentsFile = 'recents.json';
import checkFile = require('fs');
import readFile = require('fs-sync');
import { ProjectPanelComponent } from '../components/project.panel/project.panel.component';
const repoCurrentBranch = 'master';
const modal;
const span;
const REPO_SCREEN_VISABLE_Z_INDEX_VALUE = '10';

let progressBar;
let isErrorOpeningRepo;

function downloadRepository() {
  // Full path is always in repoSave
  const localPath = document.getElementById('repoSave').value;
  const cloneURL = document.getElementById('repoClone').value;

  if (!cloneURL || cloneURL.length === 0) {
      updateModalText('Clone Failed - Empty URL Given');
  } else {
      downloadFunc(cloneURL, localPath);
  }
}

function getRecentRepositories(): string[] {
  if (checkFile.existsSync(recentsFile)) {
    const objRead = jsonfile.readFileSync(recentsFile);
    if (objRead.recents == null) {
      return [];
    } else {
      return objRead.recents;
    }
  } else {
    return [];
  }
}

function saveRecentRepository(path: string) {
  const recentsArray = getRecentRepositories();
  // Remove path from array if it's already there (so we move it back to the front)
  const recentsArrayFiltered = recentsArray.filter((e) => e !== path);
  // Append new path and write back to JSON
  recentsArrayFiltered.push(path);
  if (recentsArrayFiltered.length > 10) {
    // Max length of 10
    recentsArrayFiltered.shift();
  }
  const JSONobj = {
    recents: recentsArrayFiltered,
  };
  jsonfile.writeFileSync(recentsFile, JSONobj);
}

function populateRecents(): void {
  // Populates the recents list
  const list = document.getElementById('recents-list');

  while (list.firstChild) {
    // Remove all children
    list.removeChild(list.firstChild);
  }

  // Reverse so we have newly accessed first
  getRecentRepositories().reverse().forEach((element) => {
    const entry = document.createElement('a');
    entry.href = '#';
    entry.addEventListener('click', () => {
      if (checkFile.existsSync(element)) {
        openRepository(element, element);
        switchToMainPanel();
      } else {
        displayModal('Repository no longer exists on disk');
      }
    });
    entry.className = 'list-group-item';
    entry.innerHTML = element as string;
    list.appendChild(entry);
  });
}

function downloadFunc(cloneURL: string, fullLocalPath) {
  let options = {};

  // Get user host of the repo and the name of the repo from the url
  const urlParts = cloneURL.split('/');
  const repoUser = urlParts[3];
  const repoName = parse(urlParts[4]).name;
  // Get the size of the repo in KB by making an api call
  fetch(`https://api.github.com/repos/${repoUser}/${repoName}`)
    .then(
      function(response) {
        if (response.status === 200) {  // OK
          response.json().then(function(data) {
            if (!isErrorOpeningRepo) {
              saveRecentRepository(fullLocalPath);
              setCloneStatistics(`${repoUser}/${repoName}`, data.size);
            }
          });
        }
      },
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });

  options = {
    fetchOpts: {
      callbacks: {
        certificateCheck: function() { return 1; },
        credentials: function() {
          return cred;
        },
        transferProgress(stats) { // During clone update network speed and download percent
          const progress = (100 * (stats.receivedObjects() + stats.indexedObjects())) / (stats.totalObjects() * 2);
          updateDownloadPercentage(progress);
          getNetworkDownloadSpeed();
        },
      },
    },
  };

  console.log('Cloning into ' + fullLocalPath);
  const repository = Git.Clone.clone(cloneURL, fullLocalPath, options)
  .then(function(repository) {
    isErrorOpeningRepo = false;
    console.log('Repo successfully cloned');
    updateModalText('Clone Successful, repository saved under: ' + fullLocalPath);
    addCommand('git clone ' + cloneURL + ' ' + fullLocalPath);
    repoFullPath = fullLocalPath;
    projectPanelComponent.updateProjectWindow();
    repoLocalPath = fullLocalPath;
    openRepository(repoFullPath, repoLocalPath);
  },
  function(err) {
    updateModalText('Clone Failed - ' + err);
    console.log(`Error in repo.ts. Attempting to clone repo, the error is: ${err}`);
    isErrorOpeningRepo = true;
  });
}

function initRepo(gitignoreTypes: string[]){
  let fullLocalPath;

  const localPath = document.getElementById('newRepoSaveLocal').value;
  if (checkFile.existsSync(localPath)) {
    fullLocalPath = localPath;
  } else {
    fullLocalPath = require('path').join(__dirname, localPath);
  }

  const createAndAdd = function(){
    let repository;
    let index;
    // Most of this part is based off of
    // https://github.com/nodegit/nodegit/blob/master/examples/create-new-repo.js
    Git.Repository.init(fullLocalPath, 0).then(function(repo) {
      addCommand('git init');
      repository = repo;
    })
    .then(function(){
      return repository.refreshIndex();
    })
    .then(function(idx: any) {
      index = idx;
    })
    .then(function() {
      addCommand('git add .gitignore');
      return index.addByPath('.gitignore');
    })
    .then(function() {
      return index.write();
    })
    .then(function() {
      return index.writeTree();
    })
    .then(function(oid: any) {
      const sign = Git.Signature.default(repository);
      // Since we're creating an inital commit, it has no parents. Note that unlike
      // normal we don't get the head either, because there isn't one yet.
      return repository.createCommit('HEAD', sign, sign, 'add gitignore', oid, []);
    })
    .done(function(commitId) {
      console.log('New Commit: ', commitId);
      addCommand('git commit');
      openRepository(fullLocalPath, localPath);
    });
  };

  const fs = require('fs');
  // There is a race condition if you try to init the repo while the .gitignore is being written
  // which is why we have this callback
  const onWrite = function(err: any){
    if (err) {
      return console.log(err);
    }
    console.log('.gitignore created');
    if (fs.existsSync(fullLocalPath + '/.git')) {
      openRepository(fullLocalPath, localPath);
    }else{
      createAndAdd();
    }
  };
  if (gitignoreTypes.length > 0){
    queryGitignore(gitignoreTypes, function(gitignore) {
      fs.appendFile(fullLocalPath + '/.gitignore', gitignore, onWrite);
    });
  }else{
    fs.appendFile(fullLocalPath + '/.gitignore', '', onWrite);
  }

}

function openLocalRepository() {
  // Full path is determined by either handwritten directory or selected by file browser
  let localPath: string;
  let fullLocalPath: string;
  if (document.getElementById('repoOpen').value === null || document.getElementById('repoOpen').value === '') {
    localPath = document.getElementById('dirPickerOpenLocal').files[0].webkitRelativePath;
    fullLocalPath = document.getElementById('dirPickerOpenLocal').files[0].path;
    document.getElementById('repoOpen').value = fullLocalPath;
    document.getElementById('repoOpen').text = fullLocalPath;
  } else {
    localPath = document.getElementById('repoOpen').value;
    if (checkFile.existsSync(localPath)) {
      fullLocalPath = localPath;
    } else {
      fullLocalPath = require('path').join(__dirname, localPath);
    }
  }
  openRepository(fullLocalPath, localPath);
}

function openRepository(fullLocalPath: string, localPath: string) {
  // Open a reponsitory for which we have the file path for
  console.log(`Trying to open repository at ${fullLocalPath}`);
  saveRecentRepository(fullLocalPath);
  displayModal('Opening Local Repository...');

  Git.Repository.open(fullLocalPath).then(function(repository) {
    repoFullPath = fullLocalPath;
    projectPanelComponent.updateProjectWindow();
    repoLocalPath = localPath;
    if (readFile.exists(repoFullPath + '/.git/MERGE_HEAD')) {
      const tid = readFile.read(repoFullPath + '/.git/MERGE_HEAD', null);
    }

    const windowAny: any = window;
    windowAny.graphComponent.setLoading(true);
    refreshAll(repository, () => {
      console.log('Repo successfully opened');
      updateModalText('Repository successfully opened');
      windowAny.graphComponent.setLoading(false);
    });
  },
  function(err) {
    updateModalText('Opening Failed - ' + err);
    console.log(`Error in repo.ts. Attempting to open repo, the error is: ${err}`);
    isErrorOpeningRepo = true;
  });
}

function addBranchestoNode(thisB: string) {
  const elem = document.getElementById('otherBranches');
  elem.innerHTML = '';
  for (let i = 0; i < localBranches.length; i++) {
    if (localBranches[i] !== thisB) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.appendChild(document.createTextNode(localBranches[i]));
      a.setAttribute('tabindex', '0');
      a.setAttribute('href', '#');
      li.appendChild(a);
      elem.appendChild(li);
    }
  }
}

function refreshAll(repository, cb?: () => void) {
  let branch;
  bname = [];
  repository.getCurrentBranch()
  .then(function(reference) {
    const branchParts = reference.name().split('/');
    branch = branchParts[branchParts.length - 1];
  }, function(err) {
    console.log(`Error in repo.ts. Attempting to refresh branch, the error is: ${err}`); // TODO show error on screen
  })
  .then(function() {
    return repository.getReferences(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    const count = 0;
    clearBranchElement();
    for (let i = 0; i < branchList.length; i++) {
      const bp = branchList[i].name().split('/');
      Git.Reference.nameToId(repository, branchList[i].name()).then(function(oid) {
        // Use oid
        if (branchList[i].isRemote()) {
          remoteName[bp[bp.length - 1]] = oid;
        } else {
          branchCommit.push(branchList[i]);
          if (oid.tostrS() in bname) {
            bname[oid.tostrS()].push(branchList[i]);
          } else {
            bname[oid.tostrS()] = [branchList[i]];
          }
        }
      }, function(err) {
        console.log(`Error in repo.ts. Attempting to convert repo name to id, the error is: ${err}`);
      });
      if (branchList[i].isRemote()) {
        if (localBranches.indexOf(bp[bp.length - 1]) < 0) {
          displayBranch(bp[bp.length - 1], 'branch-dropdown', 'checkoutRemoteBranch(this)');
        }
      } else {
        localBranches.push(bp[bp.length - 1]);
        displayBranch(bp[bp.length - 1], 'branch-dropdown', 'checkoutLocalBranch(this)');
      }

    }
  })
  .then(function() {
    console.log('Updating the graph and the labels');
    drawGraph(cb);
    document.getElementById('repo-name').innerHTML = repoLocalPath;
    document.getElementById('branch-name').innerHTML = branch + '<span class="caret"></span>';
  });
}

function getAllBranches() {
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    return repo.getReferenceNames(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    clearBranchElement();
    for (let i = 0; i < branchList.length; i++) {
      const bp = branchList[i].split('/');
      if (bp[1] !== 'remotes') {
        displayBranch(bp[bp.length - 1], 'branch-dropdown', 'checkoutLocalBranch(this)');
      }
      Git.Reference.nameToId(repos, branchList[i]).then(function(oid) {
        // linter is complaining about this method call being empty so i added this here
        console.log('getting name to Id');
      });
    }
  });
}

function getOtherBranches() {
  let list;
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    return repo.getReferenceNames(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    clearMergeElement();
    list = branchList;
  })
  .then(function() {
    return repos.getCurrentBranch();
  })
  .then(function(ref) {
    const name = ref.name().split('/');
    clearBranchElement();
    for (let i = 0; i < list.length; i++) {
      const bp = list[i].split('/');
      if (bp[1] !== 'remotes' && bp[bp.length - 1] !== name[name.length - 1]) {
        displayBranch(bp[bp.length - 1], 'merge-dropdown', 'mergeLocalBranches(this)');
      }
    }
  });
}

function clearMergeElement() {
  const ul = document.getElementById('merge-dropdown');
  ul.innerHTML = '';
}

function clearBranchElement() {
  const ul = document.getElementById('branch-dropdown');
  const li = document.getElementById('create-branch');
  ul.innerHTML = '';
  ul.appendChild(li);
}

function displayBranch(name, id, onclick) {

  let parent = name.split('/')[1];
  parent = parent.replace(/\./g, '-');
  console.log('parent = ', parent);
  const fork = name.split('/')[0];
  console.log('parent', parent, 'fork', fork);
  const branchList = document.getElementById(id);

  if (document.getElementById(parent) == null){
    const liParent = document.createElement('li');

    const titleParent = document.createElement('a');
    titleParent.setAttribute('class', 'list-group-item collapsed');
    titleParent.appendChild(document.createTextNode(parent));
    titleParent.setAttribute('data-toggle', 'collapse');
    titleParent.setAttribute('data-target', '#' + parent);
    titleParent.setAttribute('aria-expanded', 'false');
    titleParent.setAttribute('href', '#');
    liParent.appendChild(titleParent);

    const ulParent = document.createElement('ul');
    ulParent.setAttribute('aria-expanded', 'false');
    ulParent.setAttribute('class', 'collapse');
    ulParent.setAttribute('style', 'height: 0px;');
    ulParent.setAttribute('id', parent);
    liParent.appendChild(ulParent);
    branchList.appendChild(liParent);
    console.log('adding parent repo');
  }
  const li = document.createElement('li');
  const a = document.createElement('a');
  const ulParent = document.getElementById(parent);

  a.setAttribute('href', '#');
  a.setAttribute('class', 'list-group-item');
  a.setAttribute('onclick', onclick);
  li.setAttribute('role', 'presentation');
  a.appendChild(document.createTextNode(fork));
  li.appendChild(a);
  ulParent.appendChild(li);

}

function clearBranchSearchField() {
  // This funciton will take any input that is left over in the text field from pervious searches and clear it when the user
  // selects the branch droplist to change branches on the repo
  if (document.getElementById('add-repository-panel').style.zIndex.toString() !== REPO_SCREEN_VISABLE_Z_INDEX_VALUE) {
    const textField = document.getElementById('branchName');
    textField.value = '';
    sortBranches();
  } else {
    displayModal('Unable to change branch while attempting to add, create or change repository.' +
    'Please ready a repository before changing branches');
  }
}

function sortBranches() {
  let txtValue;
  let i;
  let a;
  const input = document.getElementById('branchName');
  const filter = input.value.toUpperCase();
  const ul = document.getElementById('branch-dropdown');
  const li = ul.getElementsByTagName('li');
  for (i = 1; i < li.length; i++) {
    a = li[i].firstChild;
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
    } else {
        li[i].style.display = 'none';
    }
  }
}

function checkoutLocalBranch(element) {
  let bn;
  if (typeof element === 'string') {
    bn = element;
  } else {
    bn = element.innerHTML;
  }
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    addCommand('git checkout ' + bn);
    repo.checkoutBranch('refs/heads/' + bn)
    .then(function() {
      refreshAll(repo);
    }, function(err) {
      console.log(`Error in repo.ts. Attempting to checkout branch, the error is: ${err}`);
    });
  });

  // Clear branch creation text field
  document.getElementById('branchName').value = '';
}

function checkoutRemoteBranch(element) {
  let bn;
  if (typeof element === 'string') {
    bn = element;
  } else {
    bn = element.innerHTML;
  }
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand('git fetch');
    addCommand('git checkout -b ' + bn);
    const cid = remoteName[bn];
    return Git.Commit.lookup(repo, cid);
  })
  .then(function(commit) {
    return Git.Branch.create(repos, bn, commit, 0);
  })
  .then(function(code) {
    repos.mergeBranches(bn, 'origin/' + bn)
    .then(function() {
        refreshAll(repos);
        console.log('Pull successful');
    });
  }, function(err) {
    console.log(`Error in repo.ts. Attempting to checkout remote branch, the error is: ${err}`);
  });
}

function updateLocalPath() {
  const text = document.getElementById('repoClone').value;
  const splitText = text.split(/\.|:|\//);
  if (splitText.length >= 2) {
    // Calculate full path by joining working dir + repo name
    const fullLocalPath = require('path').join(__dirname, splitText[splitText.length - 2]);
    document.getElementById('repoSave').value = fullLocalPath;
  }
}

function updateCustomPath(userPath: string) {
  const text = document.getElementById('repoClone').value;
  const splitText = text.split(/\.|:|\//);
  if (splitText.length >= 2) {
    // Calculate full path by joining working dir + repo name
    const fullLocalPath = require('path').join(userPath, splitText[splitText.length - 2]);
    document.getElementById('repoSave').value = fullLocalPath;
  } else {
    // Couldn't compute path
    document.getElementById('repoSave').value = userPath;
  }
}

// function initModal() {
//   modal = document.getElementById('modal');
//   btn = document.getElementById('new-repo-button');
//   confirmBtn = document.getElementById('confirm-button');
//   span = document.getElementsByClassName('close')[0];
// }

// function handleModal() {
//   // When the user clicks on <span> (x), close the modal
//   span.onclick = function() {
//     modal.style.display = 'none';
//   };
//
//   // When the user clicks anywhere outside of the modal, close it
//   window.onclick = function(event) {
//
//     if (event.target === modal) {
//       modal.style.display = 'none';
//     }
//   };
// }

function displayModal(text) {
//  initModal();
//  handleModal();
  document.getElementById('modal-text-box').innerHTML = text;
  $('#modal').modal('show');
}

function updateModalText(text) {
  const modal = document.getElementById('modal-text-box');
  if (modal) {
    modal.innerHTML = text;
    $('#modal').modal('show');
  }
}

function setCloneStatistics(repoName: string, repoSize: number) {
  updateModalText(`<div class="clone-stats">
    Cloning ${repoName} (${repoSize} kB)
    <div class="download-speed" id="download-speed">
      0 kB/s
    </div>
    <div id="download-percentage"></div>
  </div>`);
  progressBar = new ProgressBar.Line('#download-percentage', {
    strokeWidth: 4,
    easing: 'easeInOut',
    color: '#39C0BA',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: {width: '100%', height: '100%'},
    text: {
      style: {
        color: '#999',
        position: 'absolute',
        right: '5%',
        bottom: '5px',
        padding: 0,
        margin: 0,
        transform: null,
      },
      autoStyleContainer: false,
    },
    // Changes colour from a starting colour to a final colour
    from: {color: '#39C0BA' },
    to: {color: '#154744' },
    step: (state, bar) => {
      bar.path.setAttribute('stroke', state.color); // Colour transition
      bar.setText(`${(bar.value() * 100).toFixed(2)}%`); // Percentage Label
    },
  });
}

function updateDownloadPercentage(percentage: number) {
  if (progressBar) {
    progressBar.animate((percentage / 100)); // Supply a number between 0 and 1
  }
}

function updateDownloadSpeed(speed: number) {
  const speedRounded = Math.round(speed);
  if (!isNaN(speedRounded) && document.getElementById('download-speed')) {
    document.getElementById('download-speed')!.innerHTML = `${speedRounded} kB/s`;
  }
}

/**
 * Estimates users download speed by pinging a standard httpbin site
 */
async function getNetworkDownloadSpeed() {
  const networkSpeed = new NetworkSpeed();
  // Retrieve 250kB binaries from server host, same as speedtest
  // https://support.ookla.com/hc/en-us/articles/234575968-Speedtest-Configuration-Options
  const baseUrl = 'http://eu.httpbin.org/stream-bytes/250000';
  const fileSize = 250000;  // Size of the file retrived from the website, for calcs
  const speed = await networkSpeed.checkDownloadSpeed(baseUrl, fileSize);
  updateDownloadSpeed(speed.kbps);
}

/**
 * When creating branch, checks whether name is valid
 */
function checkBranch(input) {
  const regex = /^(?!^\.)(?!@)(?!\/|.*([/.]\.|\/\/|@\{|\\\\))[^\000-\037\177 ~^:?*\\[]+(?<!\.lock|[/])$/gi;
  const valid = regex.test(input.value);

  // If branch name is valid enables button, otherwise disables
  if (valid) {
    if (input.id === 'branchName') {
      $('#branch-btn').attr('disabled', false);
    } else {
      $('#branch-btn2').attr('disabled', false);
    }
  } else {
    if (input.id === 'branchName') {
      $('#branch-btn').attr('disabled', true);
    } else {
      $('#branch-btn2').attr('disabled', true);
    }
  }
}
