import * as nodegit from 'git';
import NodeGit, { Status } from 'nodegit';

import async = require('async');
import fs = require('fs');
import readFile = require('fs-sync');
import $ = require('jquery');
import Git = require('nodegit');
import opn = require('opn');
const green = '#84db00';
const repo;
let index;
let oid;
const remote;
let commitMessage;
let filesToAdd = [];
let theirCommit = null;
let modifiedFiles;
const warnbool;
let changes = false;
let unpushedCommits = false;
let previousId = '';

function cloneFromRemote(){
  switchToClonePanel();
}

function addAndCommit() {
  let repository;

  Git.Repository.open(repoFullPath)
  .then(function(repoResult) {
    repository = repoResult;
    return repository.refreshIndex();
  })

  .then(function(indexResult) {
    index = indexResult;
    const filesToStage = [];
    filesToAdd = [];
    const fileElements = document.getElementsByClassName('file');
    for (let i = 0; i < fileElements.length; i++) {
      const fileElementChildren = fileElements[i].childNodes;
      if (fileElementChildren[1].checked === true) {
        filesToStage.push(fileElementChildren[0].innerHTML);
        filesToAdd.push(fileElementChildren[0].innerHTML);
      }
    }
    if (filesToStage.length > 0) {
      return index.addAll(filesToStage);
    } else {
      // If no files checked, then throw error to stop empty commits
      throw new Error('No files selected to commit.');
    }
  })

  .then(function() {
    return index.write();
  })

  .then(function() {
    return index.writeTree();
  })

  .then(function(oidResult) {
    oid = oidResult;
    return Git.Reference.nameToId(repository, 'HEAD');
  })

  .then(function(head) {
    return repository.getCommit(head);
  })

  .then(function(parent) {
    const sign = Git.Signature.default(repository);
    commitMessage = document.getElementById('commit-message-input').value;
    if (readFile.exists(repoFullPath + '/.git/MERGE_HEAD')) {
      const tid = readFile.read(repoFullPath + '/.git/MERGE_HEAD', null);
      return repository.createCommit('HEAD', sign, sign, commitMessage, oid, [parent.id().toString(), tid.trim()]);
    } else {
      return repository.createCommit('HEAD', sign, sign, commitMessage, oid, [parent]);
    }
  })
  .then(function(oid) {
    theirCommit = null;
    changes = false;
    unpushedCommits = true;
    console.log(`Commit successful:  + ${oid.tostrS()}`);
    hideDiffPanel();
    clearModifiedFilesList();
    clearCommitMessage();
    clearSelectAllCheckbox();
    for (let i = 0; i < filesToAdd.length; i++) {
      addCommand('git add ' + filesToAdd[i]);
    }
    addCommand('git commit -m "' + commitMessage + '"');
    refreshAll(repository);
  }, function(err) {
    console.log(`Error in git.ts. Attempting to commit, the error is: ${err}`);
    // Added error thrown for if files not selected
    if (err.message === 'No files selected to commit.') {
      displayModal(err.message);
    } else {
      updateModalText('No repository has been cloned yet. Please clone a repository and try again.');
    }
  });
}

// Clear all modified files from the left file panel
function clearModifiedFilesList() {
  const filePanel = document.getElementById('files-changed');
  while (filePanel.firstChild) {
    filePanel.removeChild(filePanel.firstChild);
  }
  const filesChangedMessage = document.createElement('p');
  filesChangedMessage.className = 'modified-files-message';
  filesChangedMessage.id = 'modified-files-message';
  filesChangedMessage.innerHTML = 'Your modified files will appear here';
  filePanel.appendChild(filesChangedMessage);
}

function clearCommitMessage() {
  document.getElementById('commit-message-input').value = '';
}

function clearSelectAllCheckbox() {
  document.getElementById('select-all-checkbox').checked = false;
}

function getAllCommits(callback) {
  // Git.Repository.open(repoFullPath)
  // .then(function(repo) {
  //   return repo.getHeadCommit();
  // })
  // .then(function(firstCommitOnMaster){
  //   let history = firstCommitOnMaster.history(Git.Revwalk.SORT.Time);
  //
  //   history.on('end', function(commits) {
  //     callback(commits);
  //   });
  //
  //   history.start();
  // });
  let repos;
  const allCommits = [];
  const aclist = [];
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    return repo.getReferences(Git.Reference.TYPE.LISTALL);
  })
  .then(function(refs) {
    let count = 0;
    async.whilst(
      function() {
        return count < refs.length;
      },

      function(cb) {
        if (!refs[count].isRemote()) {
          repos.getReferenceCommit(refs[count])
          .then(function(commit) {
            const history = commit.history(Git.Revwalk.SORT.Time);
            history.on('end', function(commits) {
              for (let i = 0; i < commits.length; i++) {
                if (aclist.indexOf(commits[i].toString()) < 0) {
                  allCommits.push(commits[i]);
                  aclist.push(commits[i].toString());
                }
              }
              count++;
              cb();
            });

            history.start();
          });
        } else {
          count++;
          cb();
        }
      },

      function(err) {
        console.log(`Error in git.ts. Atempting to get all commits, the error is: ${err}`);
        callback(allCommits);
      });
    });
}

function PullBuffer() {
  if (changes) {
    $('#modalWarnNotCommittedPull').modal();
  } else {
    pullFromRemote();
  }
}

function pullFromRemote() {
  let repository;
  const branch = document.getElementById('branch-name').innerText;
  if (modifiedFiles.length > 0) {
    updateModalText('Please commit before pulling from remote!');
  }
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repository = repo;
    console.log('Pulling changes from remote...');
    addCommand('git pull');
    displayModal('Pulling new changes from the remote repository');

    return repository.fetchAll({
      callbacks: {
        credentials: function() {
          return cred;
        },
        certificateCheck: function() {
          return 1;
        },
      },
    });
  })
  // Now that we're finished fetching, go ahead and merge our local branch
  // with the new one
  .then(function() {
    return Git.Reference.nameToId(repository, 'refs/remotes/origin/' + branch);
  })
  .then(function(oid) {
    return Git.AnnotatedCommit.lookup(repository, oid);
  })
  .then(function(annotated) {
    Git.Merge.merge(repository, annotated, null, {
      checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
    });
    theirCommit = annotated;
  })
  .then(function() {
    let conflicsExist = false;

    if (readFile.exists(repoFullPath + '/.git/MERGE_MSG')) {
      const tid = readFile.read(repoFullPath + '/.git/MERGE_MSG', null);
      conflicsExist = tid.indexOf('Conflicts') !== -1;
    }

    if (conflicsExist) {
      updateModalText('Conflicts exists! Please check files list on right side and solve conflicts before you commit again!');
      refreshAll(repository);
    } else {
      updateModalText('Successfully pulled from remote branch ' + branch + ', and your repo is up to date now!');
      refreshAll(repository);
    }
  }, function(err) {
    if (err == 'Error: String path is required.'){
      updateModalText('Failed to pull from remote as no repository is currently open. Either clone one from a remote location or open one locally.');
    } else {
      updateModalText(`${err} Failed to pull from remote`);
    }
    console.log(`Error in git.ts. Attempting to pull from remote, the error is: ${err}`);
  });
//   .then(function(updatedRepository) {
//     refreshAll(updatedRepository);

// });
}





function pushToRemote() {
  const branch = document.getElementById('branch-name').innerText;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    console.log('Pushing changes to remote...');
    displayModal('Pushing changes to remote...');
    addCommand('git push -u origin ' + branch);
    repo.getRemotes()
    .then(function(remotes) {
      repo.getRemote(remotes[0])
      .then(function(remote) {
        return remote.push(
          ['refs/heads/' + branch + ':refs/heads/' + branch],
          {
            callbacks: {
              credentials: function() {
                return cred;
              },
            },
          },
        );
      })
      .then(function() {
        unpushedCommits = false;
        window.onbeforeunload = Confirmed;
        console.log('Push successful');
        updateModalText('Push successful');
        refreshAll(repo);
      });
    });
  });
}

function createBranch(obj) {

  let branchName;
  // Checking where the branch is being created from, clears its text field and disables button associated button
  if (obj.id == 'branch-btn') {
    branchName = document.getElementById("branchName").value;
    document.getElementById("branchName").value = "";
    obj.disabled = true;
  } else {
    branchName = document.getElementById("branchName2").value;
    document.getElementById("branchName2").value = "";
    obj.disabled = true;
  }

  let repos;
  console.log(`Creating branch: ${branchName}`);

  // Check if there's a repo open
  if (repoFullPath == null) {
    displayModal(`No repository has been found. Please open or clone a repository and try again.`);
  } else {
    Git.Repository.open(repoFullPath)
        .then(function(repo) {

          // Create a new branch on head
          repos = repo;
          addCommand("git branch " + branchName);
          return repo.getHeadCommit()
              .then(function(commit) {
                return repo.createBranch(
                    branchName,
                    commit,
                    0,
                    repo.defaultSignature(),
                    "Created new-branch on HEAD");
              }, function(err) {
                console.log(`Error in git.ts. Attempting to create a branch, the error is: ${err}`);
              });
        }).done(function() {
      refreshAll(repos);
      console.log("Branch successfully created.");
    });
  }
}

function mergeLocalBranches(element) {
  const bn = element.innerHTML;
  let fromBranch;
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
  })
  .then(function() {
    addCommand('git merge ' + bn);
    return repos.getBranch('refs/heads/' + bn);
  })
  .then(function(branch) {
    fromBranch = branch;
    return repos.getCurrentBranch();
  })
  .then(function(toBranch) {
    return repos.mergeBranches(toBranch,
       fromBranch,
       repos.defaultSignature(),
       Git.Merge.PREFERENCE.NONE,
       null);
  })
  .then(function(index) {
    let text;
    if (index instanceof Git.Index) {
      text = 'Conflicts Exist';
    } else {
      text = 'Merge Successfully';
    }
    updateModalText(text);
    refreshAll(repos);
  });
}

function mergeCommits(from) {
  let repos;
  const index;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    // return repos.getCommit(fromSha);
    addCommand('git merge ' + from);
    return Git.Reference.nameToId(repos, 'refs/heads/' + from);
  })
  .then(function(oid) {
    return Git.AnnotatedCommit.lookup(repos, oid);
  })
  .then(function(annotated) {
    Git.Merge.merge(repos, annotated, null, {
      checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
    });
    theirCommit = annotated;
  })
  .then(function() {
    if (fs.existsSync(repoFullPath + '/.git/MERGE_MSG')) {
      updateModalText('Conflicts exists! Please check files list on right side and solve conflicts before you commit again!');
      refreshAll(repos);
    } else {
      updateModalText('Successfully Merged!');
      refreshAll(repos);
    }
  });
}

function rebaseCommits(from: string, to: string) {
  let repos;
  const index;
  let branch;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    // return repos.getCommit(fromSha);
    addCommand('git rebase ' + to);
    return Git.Reference.nameToId(repos, 'refs/heads/' + from);
  })
  .then(function(oid) {
    return Git.AnnotatedCommit.lookup(repos, oid);
  })
  .then(function(annotated) {
    branch = annotated;
    return Git.Reference.nameToId(repos, 'refs/heads/' + to);
  })
  .then(function(oid) {
    return Git.AnnotatedCommit.lookup(repos, oid);
  })
  .then(function(annotated) {
    return Git.Rebase.init(repos, branch, annotated, null, null);
  })
  .then(function(rebase) {
    return rebase.next();
  })
  .then(function(operation) {
    refreshAll(repos);
  });
}

function rebaseInMenu(from: string, to: string) {
  const p1 = document.getElementById('fromRebase');
  const p2 = document.getElementById('toRebase');
  const p3 = document.getElementById('rebaseModalBody');
  p1.innerHTML = from;
  p2.innerHTML = to;
  p3.innerHTML = 'Do you want to rebase branch ' + from + ' to ' + to + ' ?';
  $('#rebaseModal').modal('show');
}

function mergeInMenu(from: string) {
  const p1 = document.getElementById('fromMerge');
  const p3 = document.getElementById('mergeModalBody');
  p1.innerHTML = from;
  p3.innerHTML = 'Do you want to merge branch ' + from + ' to HEAD ?';
  $('#mergeModal').modal('show');
}

function resetCommit(name: string) {
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand('git reset --hard');
    return Git.Reference.nameToId(repo, name);
  })
  .then(function(id) {
    return Git.AnnotatedCommit.lookup(repos, id);
  })
  .then(function(commit) {
    const checkoutOptions = new Git.CheckoutOptions();
    return Git.Reset.fromAnnotated(repos, commit, Git.Reset.TYPE.HARD, checkoutOptions);
  })
  .then(function(resetStatus) {
    if (resetStatus !== 0) {
      updateModalText('Reset failed, please check if you have pushed the commit.');
    } else {
      updateModalText('Reset successfully.');
    }
    refreshAll(repos);
  }, function(err) {
    updateModalText(err);
  });
}

function revertCommit(name: string) {
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand('git revert ' + name + '~1');
    return Git.Reference.nameToId(repo, name);
  })
  .then(function(id) {
    return Git.Commit.lookup(repos, id);
  })
  .then(function(commit) {
    const revertOptions = new Git.RevertOptions();
    if (commit.parents().length > 1) {
      revertOptions.mainline = 1;
    }
    return Git.Revert.revert(repos, commit, revertOptions);
  })
  .then(function(revertStatus) {
    if (revertStatus === -1) {
      updateModalText('Revert failed, please check if you have pushed the commit.');
    } else {
      updateModalText('Revert successfully.');
    }
    refreshAll(repos);
  }, function(err) {
    updateModalText(err);
  });
}

// Makes a modal for confirmation pop up instead of actually exiting application for confirmation.
function Confirmed(){
  // Block is empty so console log was added to appease linter
  console.log('Confirmed');
}

// makes the onbeforeunload function nothing so the window actually closes; then closes it.
function Close(){
  window.onbeforeunload = Confirmed;
  window.close();

}



function Reload(){
  window.onbeforeunload = Confirmed;
  location.reload();
}


// clears all removed files from the sidebar display
function clearRemovedFiles() {

  const createdFiles = Array.from(document.getElementsByClassName('file file-created'));
  const prePath = '<p id="file-path-id-0" class="file-path">';
  const postPath = '</p><input type="checkbox" class="checkbox">';

  const removeFileFromModifiedFiles = (file: any, i: number) => {
    const createdFilePath = file.innerHTML.match(new RegExp(prePath + '(.*)' + postPath))[1];
    if (!(fs.existsSync(createdFilePath))) {
      document.getElementsByClassName('file file-created')[i].remove();
      if (previousId !== createdFilePath) {
        hideDiffPanel();
      }
    }
  };
  createdFiles.forEach(removeFileFromModifiedFiles);
}

function displayModifiedFiles() {

  clearRemovedFiles();

  modifiedFiles = [];

  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repo.getStatus().then(function(statuses) {

      statuses.forEach(addModifiedFile);
      if (modifiedFiles.length !== 0) {
        if (document.getElementById('modified-files-message') !== null) {
          const filePanelMessage = document.getElementById('modified-files-message');
          filePanelMessage.parentNode.removeChild(filePanelMessage);
        }
      }
      modifiedFiles.forEach((f, i) => displayModifiedFile(f, i));

      // Add modified file to array of modified files 'modifiedFiles'
      function addModifiedFile(file) {
        // Check if modified file is already being displayed
        const filePaths = document.getElementsByClassName('file-path');
        for (let i = 0; i < filePaths.length; i++) {
          if (filePaths[i].innerHTML === file.path()) {
            return;
          }
        }

        const path = file.path();
        const modification = calculateModification(file);
        modifiedFiles.push({
            filePath: path,
            fileModification: modification,
          });
      }


      // Find HOW the file has been modified
      function calculateModification(status) {
        if (status.isNew()) {
          return 'NEW';
        } else if (status.isModified()) {
          return 'MODIFIED';
        } else if (status.isDeleted()) {
          return 'DELETED';
        } else if (status.isTypechange()) {
          return 'TYPECHANGE';
        } else if (status.isRenamed()) {
          return 'RENAMED';
        } else if (status.isIgnored()) {
          return 'IGNORED';
        }
      }

      // chrome requires returnValue to be set for events, otherwise the modal
      // will show but default is not prevented, and window will reload/close
      function confirmationModal(event) {
        event.preventDefault();
        event.returnValue = '';
        if (hasChanges()) {
          $('#modalWarnNotCommittedExit').modal();
        } else if (hasUnpushedCommits()) {
          $('#modalWarnNotPushedExit').modal();
        }
      }

      function displayModifiedFile(file, index) {
        const filePath = document.createElement('p');
        filePath.id = `file-path-id-${index}`;
        filePath.className = 'file-path';
        filePath.innerHTML = file.filePath;
        const fileElement = document.createElement('div');
        window.onbeforeunload = confirmationModal;
        changes = true;
        // Set how the file has been modified
        if (file.fileModification === 'NEW') {
          fileElement.className = 'file file-created';
        } else if (file.fileModification === 'MODIFIED') {
          fileElement.className = 'file file-modified';
        } else if (file.fileModification === 'DELETED') {
          fileElement.className = 'file file-deleted';
        } else {
          fileElement.className = 'file';
        }

        fileElement.appendChild(filePath);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.onclick = function(){
          if (!checkbox.checked){
            document.getElementById('select-all-checkbox').checked = false;
          }
        };
        fileElement.appendChild(checkbox);

        document.getElementById('files-changed').appendChild(fileElement);

        fileElement.onclick = function() {
          const doc = document.getElementById(`file-path-id-${index}`);

          if (previousId !== doc.innerHTML){
            hideDiffPanel();
          }


          const diffPanel = document.getElementById('diff-panel');
          if ((diffPanel.style.width === '0px' || diffPanel.style.width === '') && !checkbox.checked) {
            displayDiffPanel();
            document.getElementById('diff-panel-body').innerHTML = '';

            if (fileElement.className === 'file file-created') {
              printNewFile(file.filePath);
            } else {
              printFileDiff(file.filePath);
            }
          } else {
            hideDiffPanel();
          }
          previousId = doc.innerHTML;
        };
      }

      function printNewFile(filePath) {
        const fileLocation = require('path').join(repoFullPath, filePath);
        const lineReader = require('readline').createInterface({
          input: fs.createReadStream(fileLocation),
        });

        lineReader.on('line', function(line) {
          formatNewFileLine(line);
        });
      }

      function printFileDiff(filePath) {
        repo.getHeadCommit().then(function(commit) {
          getCurrentDiff(commit, filePath, function(changeType, lineno, line) {
            formatLine(changeType, lineno, line);
          });
        });
      }

      /**
       * This function gets lines from the selected file
       */
      function getCurrentDiff(commit, filePath, callback) {
        commit.getTree().then(function(tree) {
          Git.Diff.treeToWorkdir(repo, tree, null).then(function(diff) {
            diff.patches().then(function(patches) {
              patches.forEach(function(patch) {
                patch.hunks().then(function(hunks) {
                  hunks.forEach(function(hunk) {
                    hunk.lines().then(function(lines) {
                      const oldFilePath = patch.oldFile().path();
                      const newFilePath = patch.newFile().path();
                      if (newFilePath === filePath) {
                        lines.forEach(function(line) {
                          callback(String.fromCharCode(line.origin()),
                              line.newLineno().toString(),
                              line.content());
                        });
                      }
                    });
                  });
                });
              });
            });
          });
        });
      }

      function formatLine(changeType, lineno, line) {
        const element = document.createElement('div');

        if (changeType === '+') {
          element.style.backgroundColor = '#84db00';
          line = formatSpaces(lineno.toString().length, ' ' + lineno) + line;
        } else if (changeType.charAt(0) === '-') {
          element.style.backgroundColor = '#ff2448';
          line = formatSpaces(1, ' -') + line;
        } else if (changeType === '<' || changeType === '>') {
          line = '';
        } else {
          line = formatSpaces(lineno.toString().length, ' ' + lineno) + line;
        }

        element.innerText = line;
        document.getElementById('diff-panel-body').appendChild(element);
      }

      /**
       * Adds letying amount of spaces between line number and code depending on size
       * of line number.
       */
      function formatSpaces(sizeOfLineNumber, line) {
        const defaultSpaces = 8;
        for (let i = 0; i < defaultSpaces - sizeOfLineNumber; i++) {
          line = line + ' ';
        }
        return line;
      }

      function formatNewFileLine(text) {
        const element = document.createElement('div');
        element.style.backgroundColor = green;
        element.innerHTML = text;
        document.getElementById('diff-panel-body').appendChild(element);
      }
    });
  },
  function(err) {
    console.log(`Error in git.ts. Attempting to display modified files, the error is ${err}`);
  });
}

// Find HOW the file has been modified
function calculateModification(status) {
  if (status.isNew()) {
    return 'NEW';
  } else if (status.isModified()) {
    return 'MODIFIED';
  } else if (status.isDeleted()) {
    return 'DELETED';
  } else if (status.isTypechange()) {
    return 'TYPECHANGE';
  } else if (status.isRenamed()) {
    return 'RENAMED';
  } else if (status.isIgnored()) {
    return 'IGNORED';
  }
}

function deleteFile(filePath: string) {
  const newFilePath = filePath.replace(/\\/gi, '/');
  if (fs.existsSync(newFilePath)) {
    fs.unlink(newFilePath, function(err) {
      if (err) {
        alert('An error occurred updating the file' + err.message);
        console.log(`Error in git.ts. Attempting to delete file, the error is: ${err}`);
        return;
      }
      console.log('File successfully deleted');
    });
  } else {
    alert('This file doesn\'t exist, cannot delete');
  }
}

function cleanRepo() {
  let fileCount = 0;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    console.log('Removing untracked files...');
    displayModal('Removing untracked files...');
    addCommand('git clean -f');
    repo.getStatus().then(function(arrayStatusFiles) {
      arrayStatusFiles.forEach(deleteUntrackedFiles);

      // Gets NEW/untracked files and deletes them
      function deleteUntrackedFiles(file) {
        const filePath = repoFullPath + '\\' + file.path();
        const modification = calculateModification(file);
        if (modification === 'NEW') {
          console.log(`Deleting file: ${filePath}`);
          deleteFile(filePath);
          console.log('DELETION SUCCESSFUL');
          fileCount++;
        }
      }

    })
    .then(function() {
      console.log('Cleanup successful');
      if (fileCount !== 0) {
        updateModalText('Cleanup successful. Removed ' + fileCount + ' files.');
      } else {
        updateModalText('Nothing to remove.');
      }
      refreshAll(repo);
    });
  },
  function(err) {
    console.log(`Error in git.ts. Attempting to clean repo, the error is: ${err}`);
    displayModal('Please select a valid repository');
  });
}

/**
 * This method is called when the sync button is pressed, and causes the fetch-modal
 * to appear on the screen.
 */
function requestLinkModal() {
  $('#fetch-modal').modal();
}

/**
 * This method is called when a valid URL is given via the fetch-modal, and runs the
 * series of git commands which fetch and merge from an upstream repository.
 */
function fetchFromOrigin() {
  console.log('Fetching from origin...');
  const upstreamRepoPath = document.getElementById('origin-path').value;
  if (upstreamRepoPath != null) {
    Git.Repository.open(repoFullPath)
    .then(function(repo) {
      displayModal('Beginning Synchronisation...');
      addCommand('git remote add upstream ' + upstreamRepoPath);
      addCommand('git fetch upstream');
      addCommand('git merge upstrean/master');
      console.log('Fetch successful');
      updateModalText('Synchronisation Successful');
      refreshAll(repo);
    },
    function(err) {
      console.log(`Error in git.ts. Attempting to fetch from origin, the error is: ${err}`);
      displayModal('Please select a valid repository');
    });
  } else {
    displayModal('No Path Found.');
  }
}

function hasChanges() {
  return changes;
}

function hasUnpushedCommits() {
  return unpushedCommits;
}

function clear() {
  changes = false;
  unpushedCommits = false;
}
