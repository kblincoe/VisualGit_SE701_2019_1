import { Component } from '@angular/core';
import { GraphService } from '../services/graph.service';
import { RepositoryService } from '../services/repository.service';

@Component({
  selector: 'app-header',
  template: `
    <nav class="navbar navbar-inverse" role="navigation">
      <div class="container-fluid row">
        <div class="navbar-header">
          <button type="button" id="navbarToggle" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a href="#"><img src="./assets/AddRepositoryFolder.svg" onclick="switchToAddRepositoryPanel()" class="add-repository-button"
          title="Add Repository"></a>
        </div>
        <div class="collapse navbar-collapse" id="navbar">
          <ul class="nav navbar-nav col-md-5 hidden-xs">
            <li><img src="./assets/RightArrow.svg" class="right-arrow"></li>
            <li class="repo-name dropdown-toggle">
                <a href="#" id="repo-name" data-toggle="modal" data-target="#repo-modal">repository</a>
            </li>
            <li><img src="./assets/RightArrow.svg" class="right-arrow"></li>
            <li class="branch-name dropdown">
              <a href="#" class="dropdown-toggle" id="branch-name" data-toggle="dropdown" onclick="clearBranchSearchField()">
                branch<span class="caret"></span>
              </a>
              <ul class="dropdown-menu" id="branch-dropdown" role="menu" aria-labelledby="branch-name">
                <li role="presentation" id="create-branch">
                  <div class="input-group menuitem">
                    <input type="text" id="branchName" onkeyup="sortBranches(); checkBranch(this)" class="form-control" placeholder="Search or create branch">
                    <span class="input-group-btn">
                      <button class="btn btn-default masterTooltip" id = "branch-btn" type="button" disabled="disabled" onclick="createBranch(this)" title="Must meet Git branch standards">OK</button>
                    </span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>

          <ul class="navbar-nav col-md-4 hidden-xs">
            <li class="upload"><a href="#"><i class="iconbar fa fa-upload fa-lg col-md-2" aria-hidden="true" onclick="pushToRemote()"
              title="Push"></i></a></li>
            <li class="download"><a href="#"><i class="iconbar fa fa-download fa-lg col-md-2" aria-hidden="true" onclick="pullFromRemote()"
              title="Pull"></i></a></li>
            <li class="clone"><a href="#"><i class="iconbar fa fa-clone fa-lg col-md-2" aria-hidden="true" onclick="cloneFromRemote()"
              title="Clone"></i></a></li>
            <li class="eraser"><a href="#"><i class="iconbar fa fa-eraser fa-lg col-md-2" aria-hidden="true" onclick="cleanRepo()"
              title="Clean"></i></a></li>
            <li class="sync"><a href="#"><i class="iconbar fa fa-sync-alt fa-lg col-md-2" aria-hidden="true" onclick="requestLinkModal()"
              title="Sync"></i></a></li>
          </ul>

          <ul id="github_account" class="navbar-nav navbar-right hidden-xs">
            <li class="account_group"><img id="github_avatar" src=""></li>
            <li class="account_group"><p id="github_name"></p></li>
            <li class="account_group"><p class="divider">|</p></li>
            <li class="account_group" style="padding-left: 12px;"><a href="" id="signOut" class="fas fa-sign-out-alt"
            (click)="signOut()"></a></li>
          </ul>

          <ul id="return_main_menu" class="navbar-nav navbar-right hidden-xs">
            <li class="account_group"><p class="divider">|</p></li>
            <li class="account_group" style="padding-left: 12px;"><a href="" id="signOut" class="fas fa-sign-out-alt"
            (click)="signOut()" title="Back to Login"></a></li>
          </ul>

          <ul class="nav navbar-nav visible-xs">
            <li (click)="promptUserToAddRepository()"><a>&nbsp;&nbsp;add repository</a></li>
            <li class="dropdown">
              <a id="repo-name" data-toggle="modal" data-target="#repo-modal" href="#">
                &nbsp;&nbsp;repository
                <span class="caret"></span>
              </a>
            </li>
            <li class="dropdown">
              <a id="branch-name" data-toggle="dropdown" href="#">
                &nbsp;&nbsp;branch
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" id="branch-dropdown" role="menu" aria-labelledby="branch-name" style="margin: 5px 20px">
                <li role="presentation" id="create-branch">
                  <div class="input-group menuitem">
                    <input type="text" id="branchName2" onkeyup="sortBranches(); checkBranch(this)" class="form-control" placeholder="Search or create branch">
                    <span class="input-group-btn">
                      <button class="btn btn-default masterTooltip" id = "branch-btn2" type="button" disabled="disabled" title="Must meet Git branch standards" onclick="createBranch(this)">OK</button>
                    </span>
                  </div>
                </li>
              </ul>
            </li>
            <li class="dropdown">
              <a id="merge-name" onclick="getOtherBranches()" data-toggle="dropdown" href="#">
                &nbsp;&nbsp;update from
                <span class="caret"></span>
              </a>
              <ul class="dropdown-menu" id="merge-dropdown" role="menu" >
              </ul>
            </li>
            <li class="upload" onclick="pushToRemote()"><a href="#">&nbsp;&nbsp;push</a></li>
            <li class="download"onclick="pullFromRemote()"><a href="#">&nbsp;&nbsp;pull</a></li>
            <li class="clone"onclick="cloneFromRemote()"><a href="#">&nbsp;&nbsp;clone</a></li>
            <li class="clean" onclick="cleanRepo()"><a href="#">&nbsp;&nbsp;clean</a></li>
            <li class="sync" onclick="requestLinkModal()"><a href="#">&nbsp;&nbsp;sync</a></li>
          </ul>
        </div>
      </div>
    </nav>



    <div id="modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Info</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            unset
          </div>
          <div class="modal-footer">
			<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalWarnNotCommittedExit" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"
    aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            You have changes that are not yet committed. Do you want to commit these before exiting?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="Reload()">Reload</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="Close()">Exit</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalWarnNotPushedExit" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            You have commits saved locally that have not been pushed. Do you want to push these to your remote repository before exiting?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="Reload()">Reload</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="Close()">Exit</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalWarnNotCommittedLogout" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"
    aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
          You have changes that are not yet committed. Do you want to commit these before logging out?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal" (click)="signOut()">Sign Out</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalWarnNotPushedLogout" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"
    aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
          You have commits saved locally that have not been pushed. Do you want to push these to your remote repository before logging out?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal" (click)="signOut()">Sign Out</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="modalWarnNotCommittedPull" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"
    aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Warning!</h4>
          </div>
          <div class="modal-body" id="modal-text-box">
            You have changes that have not been committed. Please discard or commit these changes before pulling.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div id="repo-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Repositories</h4>
          </div>
          <ul class="list-group"id="repo-dropdown" role="menu" aria-labelledby="repo-name">
            <li class="list-group-item" id="empty-message">
              You have no repositories to view. You may not be logged in.
            </li>
          </ul>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary disabled" id="cloneButton" onclick="cloneRepo()">Clone</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div>

    <div id="fetch-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content" style=" width: 602px !important">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title">Info</h4>
            </div>
            <div class="modal-body" id="modal-text-box">
              Please provide the HTTP path to the original repository:
              <input type="text" id="origin-path" style=" width: 554px !important"
                placeholder="https://github.com/ORIGINAL_OWNER/ORIGINAL_OWNER_REPOSITORY.git">
            </div>
            <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal" onClick="fetchFromOrigin()">Confirm</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
    </div>
  `,
  providers: [GraphService, RepositoryService],
})

export class HeaderComponent   {
  repoName: string = 'Repo name';
  repoBranch: string = 'Repo branch';
  repository: any;

  promptUserToAddRepository(): void {
    switchToAddRepositoryPanel();
  }

  switchToMainPanel(): void {
    signInHead(collapseSignPanel);
  }

  signOut(): void {
    ipcRenderer.send('authenticate', false);
  }

}
