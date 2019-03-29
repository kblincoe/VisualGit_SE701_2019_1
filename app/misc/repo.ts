import { parse } from 'path';
import fetch from 'node-fetch';
const NetworkSpeed = require('network-speed');
const ProgressBar = require('progressbar.js');
let Git = require("nodegit");
let $ = require('jQuery');
let repoFullPath;
let repoLocalPath;
let bname = {};
let branchCommit = [];
let remoteName = {};
let localBranches = [];
let readFile = require("fs-sync");
let checkFile = require("fs");
let repoCurrentBranch = "master";
let modal;
let span;

let progressBar;
let isErrorOpeningRepo;


function downloadRepository() {
  // Full path is always in repoSave
  let localPath = document.getElementById("repoSave").value;
  let cloneURL = document.getElementById("repoClone").value;

  if (!cloneURL || cloneURL.length === 0) {
      updateModalText("Clone Failed - Empty URL Given");
  } else {
      downloadFunc(cloneURL, localPath);
  }

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
            if(!isErrorOpeningRepo) {
              setCloneStatistics(`${repoUser}/${repoName}`, data.size);
            }
          }); 
        };
      }
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
        }
      }
    }
  };

  console.log("Cloning into " + fullLocalPath);
  let repository = Git.Clone.clone(cloneURL, fullLocalPath, options)
  .then(function(repository) {
    isErrorOpeningRepo = false;
    console.log("Repo successfully cloned");
    refreshAll(repository);
    updateModalText("Clone Successful, repository saved under: " + fullLocalPath);
    addCommand("git clone " + cloneURL + " " + fullLocalPath);
    repoFullPath = fullLocalPath;
    repoLocalPath = fullLocalPath;
    refreshAll(repository);
  },
  function(err) {
    updateModalText("Clone Failed - " + err);
    console.log(`Error in repo.ts. Attempting to clone repo, the error is: ${err}`);
    isErrorOpeningRepo = true;
  });
}

function openRepository() {
  // Full path is determined by either handwritten directory or selected by file browser
  if (document.getElementById("repoOpen").value == null || document.getElementById("repoOpen").value == "") {
    let localPath = document.getElementById("dirPickerOpenLocal").files[0].webkitRelativePath;
    let fullLocalPath = document.getElementById("dirPickerOpenLocal").files[0].path;
    document.getElementById("repoOpen").value = fullLocalPath;
    document.getElementById("repoOpen").text = fullLocalPath;
  } else {
    let localPath = document.getElementById("repoOpen").value;
    let fullLocalPath;
    if (checkFile.existsSync(localPath)) {
      fullLocalPath = localPath;
    } else {
      fullLocalPath = require("path").join(__dirname, localPath);
    }
  }

  console.log(`Trying to open repository at ${fullLocalPath}`);
  displayModal("Opening Local Repository...");

  Git.Repository.open(fullLocalPath).then(function(repository) {
    repoFullPath = fullLocalPath;
    repoLocalPath = localPath;
    if (readFile.exists(repoFullPath + "/.git/MERGE_HEAD")) {
      let tid = readFile.read(repoFullPath + "/.git/MERGE_HEAD", null);
    }
    refreshAll(repository);
    console.log("Repo successfully opened");
    updateModalText("Repository successfully opened");
  },
  function(err) {
    updateModalText("Opening Failed - " + err);
    console.log(`Error in repo.ts. Attempting to open repo, the error is: ${err}`);
    isErrorOpeningRepo = true;
  });
}

function addBranchestoNode(thisB: string) {
  let elem = document.getElementById("otherBranches");
  elem.innerHTML = '';
  for (let i = 0; i < localBranches.length; i++) {
    if (localBranches[i] !== thisB) {
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.appendChild(document.createTextNode(localBranches[i]));
      a.setAttribute("tabindex", "0");
      a.setAttribute("href", "#");
      li.appendChild(a);
      elem.appendChild(li);
    }
  }
}

function refreshAll(repository) {
  let branch;
  bname = [];
  repository.getCurrentBranch()
  .then(function(reference) {
    let branchParts = reference.name().split("/");
    branch = branchParts[branchParts.length - 1];
  },function(err) {
    console.log(`Error in repo.ts. Attempting to refresh branch, the error is: ${err}`); // TODO show error on screen
  })
  .then(function() {
    return repository.getReferences(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    let count = 0;
    clearBranchElement();
    for (let i = 0; i < branchList.length; i++) {
      let bp = branchList[i].name().split("/");
      Git.Reference.nameToId(repository, branchList[i].name()).then(function(oid) {
        // Use oid
        if (branchList[i].isRemote()) {
          remoteName[bp[bp.length-1]] = oid;
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
          displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutRemoteBranch(this)");
        }
      } else {
        localBranches.push(bp[bp.length - 1]);
        displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutLocalBranch(this)");
      }

    }
  })
  .then(function() {
    console.log("Updating the graph and the labels");
    drawGraph();
    document.getElementById("repo-name").innerHTML = repoLocalPath;
    document.getElementById("branch-name").innerHTML = branch + '<span class="caret"></span>';
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
      let bp = branchList[i].split("/");
      if (bp[1] !== "remotes") {
        displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutLocalBranch(this)");
      }
      Git.Reference.nameToId(repos, branchList[i]).then(function(oid) {
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
    return repos.getCurrentBranch()
  })
  .then(function(ref) {
    let name = ref.name().split("/");
    clearBranchElement();
    for (let i = 0; i < list.length; i++) {
      let bp = list[i].split("/");
      if (bp[1] !== "remotes" && bp[bp.length - 1] !== name[name.length - 1]) {
        displayBranch(bp[bp.length - 1], "merge-dropdown", "mergeLocalBranches(this)");
      }
    }
  })

}

function clearMergeElement() {
  let ul = document.getElementById("merge-dropdown");
  ul.innerHTML = '';
}

function clearBranchElement() {
  let ul = document.getElementById("branch-dropdown");
  let li = document.getElementById("create-branch");
  ul.innerHTML = '';
  ul.appendChild(li);
}

function displayBranch(name, id, onclick) {
  let ul = document.getElementById(id);
  let li = document.createElement("li");
  let a = document.createElement("a");
  a.setAttribute("href", "#");
  a.setAttribute("class", "list-group-item");
  a.setAttribute("onclick", onclick);
  li.setAttribute("role", "presentation")
  a.appendChild(document.createTextNode(name));
  li.appendChild(a);
  ul.appendChild(li);
}

function checkoutLocalBranch(element) {
  let bn;
  if (typeof element === "string") {
    bn = element;
  } else {
    bn = element.innerHTML;
  }
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    addCommand("git checkout " + bn);
    repo.checkoutBranch("refs/heads/" + bn)
    .then(function() {
      refreshAll(repo);
    }, function(err) {
      console.log(`Error in repo.ts. Attempting to checkout branch, the error is: ${err}`);
    });
  })
}

function checkoutRemoteBranch(element) {
  let bn;
  if (typeof element === "string") {
    bn = element;
  } else {
    bn = element.innerHTML;
  }
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand("git fetch");
    addCommand("git checkout -b " + bn);
    let cid = remoteName[bn];
    return Git.Commit.lookup(repo, cid);
  })
  .then(function(commit) {
    return Git.Branch.create(repos, bn, commit, 0);
  })
  .then(function(code) {
    repos.mergeBranches(bn, "origin/" + bn)
    .then(function() {
        refreshAll(repos);
        console.log("Pull successful");
    });
  }, function(err) {
    console.log(`Error in repo.ts. Attempting to checkout remote branch, the error is: ${err}`);
  })
}

function updateLocalPath() {
  let text = document.getElementById("repoClone").value;
  let splitText = text.split(/\.|:|\//);
  if (splitText.length >= 2) {
    // Calculate full path by joining working dir + repo name
    let fullLocalPath = require("path").join(__dirname, splitText[splitText.length - 2]);
    document.getElementById("repoSave").value = fullLocalPath;
  }
}

function updateCustomPath(userPath: String) {
  let text = document.getElementById("repoClone").value;
  let splitText = text.split(/\.|:|\//);
  if (splitText.length >= 2) {
    // Calculate full path by joining working dir + repo name
    let fullLocalPath = require("path").join(userPath, splitText[splitText.length - 2]);
    document.getElementById("repoSave").value = fullLocalPath;
  } else {
    // Couldn't compute path
    document.getElementById("repoSave").value = userPath;
  }
}

// function initModal() {
//   modal = document.getElementById("modal");
//   btn = document.getElementById("new-repo-button");
//   confirmBtn = document.getElementById("confirm-button");
//   span = document.getElementsByClassName("close")[0];
// }

// function handleModal() {
//   // When the user clicks on <span> (x), close the modal
//   span.onclick = function() {
//     modal.style.display = "none";
//   };
//
//   // When the user clicks anywhere outside of the modal, close it
//   window.onclick = function(event) {
//
//     if (event.target === modal) {
//       modal.style.display = "none";
//     }
//   };
// }

function displayModal(text) {
//  initModal();
//  handleModal();
  document.getElementById("modal-text-box").innerHTML = text;
  $('#modal').modal('show');
}

function updateModalText(text) {
  const modal = document.getElementById("modal-text-box");
  if(modal) {
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
        transform: null
      },
      autoStyleContainer: false
    },
    // Changes colour from a starting colour to a final colour
    from: {color: '#39C0BA' },
    to: {color: '#154744' },
    step: (state, bar) => {
      bar.path.setAttribute('stroke', state.color); // Colour transition
      bar.setText(`${(bar.value() * 100).toFixed(2)}%`); // Percentage Label
    }
  });
}

function updateDownloadPercentage(percentage: number) {
  if(progressBar) {
    progressBar.animate((percentage / 100)); // Supply a number between 0 and 1
  }
}

function updateDownloadSpeed(speed: number) {
  const speedRounded = Math.round(speed);
  if(!isNaN(speedRounded) && document.getElementById("download-speed")) {
    document.getElementById("download-speed")!.innerHTML = `${speedRounded} kB/s`;
  }
}

/**
 * Estimates users download speed by pinging a standard httpbin site
 */
async function getNetworkDownloadSpeed() {
  const networkSpeed = new NetworkSpeed();
  // Retrieve 250kB binaries from server host, same as speedtest https://support.ookla.com/hc/en-us/articles/234575968-Speedtest-Configuration-Options
  const baseUrl = 'http://eu.httpbin.org/stream-bytes/250000'; 
  const fileSize = 250000;  // Size of the file retrived from the website, for calcs
  const speed = await networkSpeed.checkDownloadSpeed(baseUrl, fileSize);
  updateDownloadSpeed(speed.kbps);
}  
