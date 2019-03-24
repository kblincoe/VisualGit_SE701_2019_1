"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var repository_service_1 = require("../services/repository.service");
var graph_service_1 = require("../services/graph.service");
var HeaderComponent = /** @class */ (function () {
    function HeaderComponent() {
        this.repoName = "Repo name";
        this.repoBranch = "Repo branch";
    }
    HeaderComponent.prototype.promptUserToAddRepository = function () {
        switchToAddRepositoryPanel();
    };
    HeaderComponent.prototype.switchToMainPanel = function () {
        signInHead(collpaseSignPanel);
    };
    HeaderComponent.prototype.WarningSignIn = function () {
        redirectToHomePage();
    };
    HeaderComponent = __decorate([
        core_1.Component({
            selector: "app-header",

            template: "\n    <nav class=\"navbar navbar-inverse\" role=\"navigation\">\n      <div class=\"container-fluid row\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a href=\"#\"><img src=\"./assets/AddRepositoryFolder.svg\" onclick=\"switchToAddRepositoryPanel()\" class=\"add-repository-button\" title=\"Add Repository\"></a>\n        </div>\n        <div class=\"collapse navbar-collapse\" id=\"navbar\">\n          <ul class=\"nav navbar-nav col-md-5 hidden-xs\">\n            <li><img src=\"./assets/RightArrow.svg\" class=\"right-arrow\"></li>\n            <li class=\"repo-name dropdown-toggle\">\n                <a href=\"#\" id=\"repo-name\" data-toggle=\"modal\" data-target=\"#repo-modal\">repository</a>\n            </li>\n            <li><img src=\"./assets/RightArrow.svg\" class=\"right-arrow\"></li>\n            <li class=\"branch-name dropdown\">\n              <a href=\"#\" class=\"dropdown-toggle\" id=\"branch-name\" data-toggle=\"dropdown\" onclick=\"switchToMainPanel()\">\n                branch<span class=\"caret\"></span>\n              </a>\n              <ul class=\"dropdown-menu\" id=\"branch-dropdown\" role=\"menu\" aria-labelledby=\"branch-name\">\n                <li role=\"presentation\" id=\"create-branch\">\n                  <div class=\"input-group menuitem\">\n                    <input type=\"text\" id=\"branchName\" class=\"form-control\" placeholder=\"Search or create branch\">\n                    <span class=\"input-group-btn\">\n                      <button class=\"btn btn-default\" type=\"button\" onclick=\"createBranch()\">OK</button>\n                    </span>\n                  </div>\n                </li>\n              </ul>\n            </li>\n          </ul>\n\n          <ul class=\"navbar-nav col-md-4 hidden-xs\">\n            <li class=\"upload\"><a href=\"#\"><i class=\"fa fa-cloud-upload fa-2x col-md-2\" aria-hidden=\"true\" style=\"color:white\" onclick=\"pushToRemote()\" title=\"Push\"></i></a></li>\n            <li class=\"download\"><a href=\"#\"><i class=\"fa fa-cloud-download fa-2x col-md-2\" aria-hidden=\"true\" style=\"color:white\" onclick=\"pullBuffer()\" title=\"Pull\"></i></a></li>\n            <a href=\"#\"><img src=\"./assets/Clean-Dark.svg\" height=\"48\" width=\"48\" onclick=\"cleanRepo()\" class=\"add-repository-button\" title=\"Clean\"></a>\n          </ul>\n\n          <ul class=\"navbar-nav navbar-right hidden-xs\">\n            <li>\n              <a class=\"btn btn-default btn-outline btn-circle\"  id=\"avatar\" data-toggle=\"collapse\" href=\"#nav-collapse1\" aria-expanded=\"false\" aria-controls=\"nav-collapse1\" onclick=\"signInOrOut()\">Sign in</a>\n            </li>\n          </ul>\n          <div class=\"collapse nav navbar-nav nav-collapse\" id=\"nav-collapse1\">\n            <form class=\"navbar-form navbar-right form-inline\" role=\"form\">\n              <div class=\"form-group\">\n                <label class=\"sr-only\" for=\"Email\">User name</label>\n                <input type=\"text\" class=\"form-control\" id=\"Email1\" placeholder=\"Email\" autofocus required />\n              </div>\n              <div class=\"form-group\">\n                <label class=\"sr-only\" for=\"Password\">Password</label>\n                <input type=\"password\" class=\"form-control\" id=\"Password1\" placeholder=\"Password\" required />\n              </div>\n              <button type=\"submit\" class=\"btn btn-success\" (click)=\"switchToMainPanel()\">Sign in</button>\n            </form>\n          </div>\n\n          <ul class=\"nav navbar-nav visible-xs\">\n            <li (click)=\"promptUserToAddRepository()\"><a>&nbsp;&nbsp;add repository</a></li>\n            <li class=\"dropdown\">\n              <a id=\"repo-name\" data-toggle=\"modal\" data-target=\"#repo-modal\" href=\"#\">\n                &nbsp;&nbsp;repository\n                <span class=\"caret\"></span>\n              </a>\n            </li>\n            <li class=\"dropdown\">\n              <a id=\"branch-name\" data-toggle=\"dropdown\" href=\"#\">\n                &nbsp;&nbsp;branch\n                <span class=\"caret\"></span>\n              </a>\n              <ul class=\"dropdown-menu\" id=\"branch-dropdown\" role=\"menu\" aria-labelledby=\"branch-name\">\n                <li role=\"presentation\" id=\"create-branch\">\n                  <div class=\"input-group menuitem\">\n                    <input type=\"text\" id=\"branchName\" class=\"form-control\" placeholder=\"Search or create branch\">\n                    <span class=\"input-group-btn\">\n                      <button class=\"btn btn-default\" type=\"button\" onclick=\"createBranch()\">OK</button>\n                    </span>\n                  </div>\n                </li>\n              </ul>\n            </li>\n            <li class=\"dropdown\">\n              <a id=\"merge-name\" onclick=\"getOtherBranches()\" data-toggle=\"dropdown\" href=\"#\">\n                &nbsp;&nbsp;update from\n                <span class=\"caret\"></span>\n              </a>\n              <ul class=\"dropdown-menu\" id=\"merge-dropdown\" role=\"menu\" >\n              </ul>\n            </li>\n            <li class=\"upload\" onclick=\"pushToRemote()\"><a href=\"#\">&nbsp;&nbsp;pull</a></li>\n            <li class=\"download\"onclick=\"pullFromRemote()\"><a href=\"#\">&nbsp;&nbsp;push</a></li>\n            <li class=\"clean\" onclick=\"cleanRepo()\"><a href=\"#\">&nbsp;&nbsp;clean</a></li>\n          </ul>\n        </div>\n      </div>\n    </nav>\n\t\n\t\n\t\n    <div id=\"modal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"mySmallModalLabel\" aria-hidden=\"true\">\n      <div class=\"modal-dialog modal-sm\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n              <span aria-hidden=\"true\">&times;</span>\n            </button>\n            <h4 class=\"modal-title\">Info</h4>\n          </div>\n          <div class=\"modal-body\" id=\"modal-text-box\">\n            unset\n          </div>\n          <div class=\"modal-footer\">\n\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">Close</button>\t\n          </div>\n        </div>\n      </div>\n    </div>\n\t\n\t<div id=\"modalW\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"mySmallModalLabel\" aria-hidden=\"true\">\n      <div class=\"modal-dialog modal-sm\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n              <span aria-hidden=\"true\">&times;</span>\n            </button>\n            <h4 class=\"modal-title\">Warning!</h4>\n          </div>\n          <div class=\"modal-body\" id=\"modal-text-box\">\n            You have changes that have not been committed or pushed. If you exit or reload now you will lose progress.\n          </div>\n          <div class=\"modal-footer\">\n\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\"  onclick=\"Reload()\"  >Reload</button>\n\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\"  onclick=\"Close()\"  >Exit</button>\n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Back</button>\t\n          </div>\n        </div>\n      </div>\n    </div>\n\t\n\t\n\t<div id=\"modalW2\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"mySmallModalLabel\" aria-hidden=\"true\">\n      <div class=\"modal-dialog modal-sm\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n              <span aria-hidden=\"true\">&times;</span>\n            </button>\n            <h4 class=\"modal-title\">Warning!</h4>\n          </div>\n          <div class=\"modal-body\" id=\"modal-text-box\">\n\n            You have changes that have not been committed or pushed. If you log out now you will lose progress.\n          </div>\n          <div class=\"modal-footer\">\n\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\"  (click)=\"WarningSignIn()\">OK</button>\n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Back</button>\t\n          </div>\n        </div>\n      </div>\n    </div>\n\t\n\t<div id=\"modalW3\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"mySmallModalLabel\" aria-hidden=\"true\">\n      <div class=\"modal-dialog modal-sm\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n              <span aria-hidden=\"true\">&times;</span>\n            </button>\n            <h4 class=\"modal-title\">Warning!</h4>\n          </div>\n          <div class=\"modal-body\" id=\"modal-text-box\">\n            You have changes that have not been committed or pushed. If you Pull now you will lose progress.\n          </div>\n          <div class=\"modal-footer\">\n\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\"  (click)=\"pullFromRemote()\">OK</button>\n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Back</button>\t\n          </div>\n        </div>\n      </div>\n    </div>\n\t\n\t\n    <div id=\"repo-modal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\">\n      <div class=\"modal-dialog\">\n        <div class=\"modal-content\">\n          <ul class=\"list-group\"id=\"repo-dropdown\" role=\"menu\" aria-labelledby=\"repo-name\">\n          </ul>\n          <div class=\"modal-footer\">\n            <button type=\"button\" class=\"btn btn-primary disabled\" id=\"cloneButton\" onclick=\"cloneRepo()\">Clone</button>\n          </div>\n        </div><!-- /.modal-content -->\n      </div><!-- /.modal-dialog -->\n    </div>\n  ",

            providers: [repository_service_1.RepositoryService, graph_service_1.GraphService]
        })
    ], HeaderComponent);
    return HeaderComponent;
}());
exports.HeaderComponent = HeaderComponent;