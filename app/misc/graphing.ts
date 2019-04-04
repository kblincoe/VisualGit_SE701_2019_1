import * as nodegit from 'git';

import github1 = require('octonode');
import vis = require('vis');
let nodeId = 1;
let absNodeId = 1;
let basicNodeId = 1;
const abstractList = [];
const basicList = [];
const bDict = {};
let commitHistory = [];
let commitList = [];
const spacingY = 100;
const spacingX = 80;
let parentCount = {};
let columns: boolean[] = [];
const edgeDic = {};
const abstractCount = 0;
const basicCount = 0;
let numOfCommits = 0;
import githubUsername = require('github-username');
const avatarUrls = {};
const branchIds = {};

function processGraph(commits: nodegit.Commit[]) {
  commitHistory = [];
  numOfCommits = commits.length;
  sortCommits(commits);
  makeBranchColor();
  populateCommits();
}

function sortCommits(commits) {
  while (commits.length > 0) {
    const commit = commits.shift();
    const parents = commit.parents();
    if (parents === null || parents.length === 0) {
      commitHistory.push(commit);
    } else {
      let count = 0;
      for (let i = 0; i < parents.length; i++) {
        const psha = parents[i].toString();
        for (let j = 0; j < commitHistory.length; j++) {
          if (commitHistory[j].toString() === psha) {
            count++;
            break;
          }
        }
        if (count < i + 1) {
          break;
        }
      }
      if (count === parents.length) {
        commitHistory.push(commit);
      } else {
        commits.push(commit);
      }
    }
  }
}

function populateCommits() {
  // reset variables for idempotency, shouldn't be needed when a class is created instead
  nodeId = 1;
  absNodeId = 1;
  basicNodeId = 1;
  commitList = [];
  parentCount = {};
  columns = [];
  // Sort
  // commitHistory = commits.sort(function(a, b) {
  //   return a.timeMs() - b.timeMs();
  // });

  // Plot the graph
  for (let i = 0; i < commitHistory.length; i++) {
    const parents: string[] = commitHistory[i].parents();
    let nodeColumn;
    for (let j = 0; j < parents.length; j++) {
      const parent = parents[j];
      if (!(parent in parentCount)) {
        parentCount[parent] = 1;
      } else {
        parentCount[parent]++;
      }
    }
    if (parents.length === 0) {
      // no parents means first commit so assign the first column
      columns[0] = true;
      nodeColumn = 0;
    } else if (parents.length === 1) {
      const parent = parents[0];
      const parentId = getNodeId(parent.toString());
      const parentColumn = commitList[parentId - 1]['column'];
      if (parentCount[parent] === 1) {
        // first child
        nodeColumn = parentColumn;
      } else {
        nodeColumn = nextFreeColumn(parentColumn);
      }
    } else {
      let desiredColumn: number = -1;
      let desiredParent: string = '';
      const freeableColumns: number[] = [];
      for (let j = 0; j < parents.length; j++) {
        const parent: string = parents[j];
        const parentId = getNodeId(parent.toString());
        const proposedColumn = commitList[parentId - 1]['column'];

        if (desiredColumn === -1 || desiredColumn > proposedColumn) {
          desiredColumn = proposedColumn;
          desiredParent = parent;
        } else {
          freeableColumns.push(proposedColumn);
        }

      }
      for (let k = 0; k < freeableColumns.length; k++) {
        const index = freeableColumns[k];
        columns[index] = false;
      }
      if (parentCount[desiredParent] === 1) {
        // first child
        nodeColumn = desiredColumn;
      } else {
        nodeColumn = nextFreeColumn(desiredColumn);
      }
    }


    makeNode(commitHistory[i], nodeColumn);
    makeAbsNode(commitHistory[i], nodeColumn);
    makeBasicNode(commitHistory[i], nodeColumn);
  }

  // Add edges
  for (let i = 0; i < commitHistory.length; i++) {
    addEdges(commitHistory[i]);
  }

  for (let i = 0; i < abstractList.length; i++) {
    addAbsEdge(abstractList[i]);
  }

  for (let i = 0; i < basicList.length; i++) {
    addBasicEdge(basicList[i]);
  }
  sortBasicGraph();

  commitList = commitList.sort(timeCompare);
  reCenter();
}

function timeCompare(a, b) {
  return a.time - b.time;
}

function nextFreeColumn(column: number) {
  while (columns[column] === true) {
    column++;
  }
  return column;
}

function addEdges(c) {
  const parents = c.parents();
  if (parents.length !== 0) {
    parents.forEach(function(parent) {
      const sha: string = c.sha();
      const parentSha: string = parent.toString();
      makeEdge(sha, parentSha);
    });
  }
}

function addAbsEdge(c) {
  const parents = c['parents'];
  for (let i = 0; i < parents.length; i++) {
    for (let j = 0; j < abstractList.length; j++) {
      if (abstractList[j]['sha'].indexOf(parents[i].toString()) > -1) {
        abEdges.add({
          from: abstractList[j]['id'],
          to: c['id'],
        });
      }
    }
  }
}

function addBasicEdge(c) {
  let flag = true;
  const parents = c['parents'];
  edgeDic[c['id']] = [];
  for (let i = 0; i < parents.length; i++) {
    for (let j = 0; j < basicList.length; j++) {
      if (basicList[j]['sha'].indexOf(parents[i].toString()) > -1 && basicList[j] !== c) {
        flag = false;
        bsEdges.add({
          from: basicList[j]['id'],
          to: c['id'],
        });
        edgeDic[c['id']].push(basicList[j]['id']);
      }
    }
  }
}

function sortBasicGraph() {
  const tmp = basicList;
  const idList = [];
  while (tmp.length > 0) {

    const n = tmp.shift();
    const ta = edgeDic[n.id];
    let count = 0;
    for (let i = 0; i < ta.length; i++) {
      for (let j = 0; j < idList.length; j++) {
        if (idList[j].toString() === ta[i].toString()) {
          count++;
        }
      }
      if (count < i + 1) {
        break;
      }
    }
    if (count === ta.length) {
      idList.push(n.id);
    } else {
      tmp.push(n);
    }
  }
  for (let i = 0; i < idList.length; i++) {
    bsNodes.update({id: idList[i], y: i * spacingY});
    if (idList[i] in branchIds) {
      bsNodes.update({id: branchIds[idList[i]], y: (i + 0.7) * spacingY});
    }
  }
}

function makeBranchColor() {
  const bcList = [];
  let count = 0;
  for (let i = 0; i < commitHistory.length; i++) {
    if (commitHistory[i].toString() in bname) {
      bcList.push({
        oid: commitHistory[i],
        cid: i,
      });
    }
  }
  count = 0;
  while (bcList.length > 0) {
    const commit = bcList.pop();
    const oid = commit.oid.toString();
    const cid = commit.cid;
    if (oid in bDict) {
      bDict[oid].push(cid);
    } else {
      bDict[oid] = [cid];
    }
    const parents = commit.oid.parents();

    for (let i = 0; i < parents.length; i++) {
      for (let j = 0; j < commitHistory.length; j++) {
        if (commitHistory[j].toString() === parents[i].toString()) {
          bcList.push({
            oid: commitHistory[j],
            cid: cid,
          });
        }
      }
    }
  }
}

function makeBasicNode(c, column: number) {
  const reference;
  const name = getName(c.author().toString());
  const stringer = c.author().toString().replace(/</, '%').replace(/>/, '%');
  const email = stringer.split('%')[1];
  let flag = true;
  let count = 1;
  let id;
  const colors1 = JSON.stringify(bDict[c.toString()]);
  for (let i = 0; i < basicList.length; i++) {
    const colors2 = JSON.stringify(basicList[i]['colors']);
    if (colors1 === colors2) {
      flag = false;
      id = basicList[i]['id'];
      basicList[i]['count'] += 1;
      count = basicList[i]['count'];
      bsNodes.update({id: i + 1, title: 'Number of Commits: ' + count});
      basicList[i]['sha'].push(c.toString());
      basicList[i]['parents'] = basicList[i]['parents'].concat(c.parents());
      break;
    }
  }

  if (flag) {
    id = basicNodeId++;

    const title = 'Number of Commits: ' + count;
    const node = {
      id: id,
      shape: 'circularImage',
      title: title,
      image: '',
      physics: false,
      fixed: (id === 1),
      x: (column - 1) * spacingX,
      y: (id - 1) * spacingY,
    };

    node.image = getProfilePictureURL(name, email, function(url) {
      node.image = url;
    });

    bsNodes.add(node);

    const shaList = [];
    shaList.push(c.toString());

    basicList.push({
      sha: shaList,
      id: id,
      time: c.timeMs(),
      column: column,
      colors: bDict[c.toString()],
      reference: reference,
      parents: c.parents(),
      count: 1,
    });
  }

  if (c.toString() in bname) {
    for (let i = 0; i < bname[c.toString()].length; i++) {
      const branchName = bname[c.toString()][i];
      const bp = branchName.name().split('/');
      let shortName = bp[bp.length - 1];
      if (branchName.isHead()) {
        shortName = '*' + shortName;
      }
      bsNodes.add({
        id: id + numOfCommits * (i + 1),
        shape: 'box',
        title: branchName,
        label: shortName,
        physics: false,
        fixed: false,
        x: (column - 0.6 * (i + 1)) * spacingX,
        y: (id - 0.3) * spacingY,
      });

      bsEdges.add({
        from: id + numOfCommits * (i + 1),
        to: id,
      });

      branchIds[id] = id + numOfCommits * (i + 1);
    }
  }
}

function makeAbsNode(c, column: number) {
  const reference;
  const name = getName(c.author().toString());
  const stringer = c.author().toString().replace(/</, '%').replace(/>/, '%');
  const email = stringer.split('%')[1];
  let flag = true;
  let count = 1;
  if (c.parents().length === 1) {
    const cp = c.parents()[0].toString();
    for (let i = 0; i < abstractList.length; i++) {
      const index = abstractList[i]['sha'].indexOf(cp);
      if (index > -1 && abstractList[i]['email'] === email && abstractList[i]['column'] === column && !(c.toString() in bname)) {
        flag = false;
        abstractList[i]['count'] += 1;
        count = abstractList[i]['count'];
        abstractList[i]['sha'].push(c.toString());
        abNodes.update({id: i + 1, title: 'Author: ' + name + '<br>' + 'Number of Commits: ' + count});
        break;
      }
    }
  }

  if (flag) {
    const id = absNodeId++;
    const title = 'Author: ' + name + '<br>' + 'Number of Commits: ' + count;

    const node = {
      email: email,
      id: id,
      image: '',
      shape: 'circularImage',
      title: title,
      physics: false,
      fixed: (id === 1),
      x: (column - 1) * spacingX,
      y: (id - 1) * spacingY,
    };

    node.image = getProfilePictureURL(name, email, function(url) {
      node.image = url;
    });

    abNodes.add(node);

    if (c.toString() in bname) {
      for (let i = 0; i < bname[c.toString()].length; i++) {
        const branchName = bname[c.toString()][i];
        const bp = branchName.name().split('/');
        let shortName = bp[bp.length - 1];
        if (branchName.isHead()) {
          shortName = '*' + shortName;
        }
        abNodes.add({
          email: email,
          id: id + numOfCommits * (i + 1),
          shape: 'box',
          title: branchName,
          label: shortName,
          physics: false,
          fixed: false,
          x: (column - 0.6 * (i + 1)) * spacingX,
          y: (id - 0.3) * spacingY,
        });

        abEdges.add({
          from: id + numOfCommits * (i + 1),
          to: id,
        });
      }
    }

    const shaList = [];
    shaList.push(c.toString());

    abstractList.push({
      sha: shaList,
      id: id,
      time: c.timeMs(),
      column: column,
      email: email,
      reference: reference,
      parents: c.parents(),
      count: 1,
    });
  }
}

function makeNode(c, column: number) {
  const id = nodeId++;
  const reference;
  const name = getName(c.author().toString());
  const stringer = c.author().toString().replace(/</, '%').replace(/>/, '%');
  const email = stringer.split('%')[1];
  const title = 'Author: ' + name + '<br>' + 'Message: ' + c.message();
  let flag = false;

  const node = {
    id: id,
    shape: 'circularImage',
    title: title,
    image: '',
    physics: false,
    fixed: true,
    x: (column - 1) * spacingX,
    y: (id - 1) * spacingY,
  };

  node.image = getProfilePictureURL(name, email, function(url) {
    node.image = url;
  });

  nodes.add(node);

  if (c.toString() in bname) {
    for (let i = 0; i < bname[c.toString()].length; i++) {
      const branchName = bname[c.toString()][i];
      const bp = branchName.name().split('/');
      let shortName = bp[bp.length - 1];
      if (branchName.isHead()) {
        shortName = '*' + shortName;
      }
      nodes.add({
        id: id + numOfCommits * (i + 1),
        shape: 'box',
        title: branchName,
        label: shortName,
        physics: false,
        fixed: false,
        x: (column - 0.6 * (i + 1)) * spacingX,
        y: (id - 0.3) * spacingY,
      });

      edges.add({
        from: id + numOfCommits * (i + 1),
        to: id,
      });
    }
    flag = true;
  }

  commitList.push({
    branch: flag,
    column: column,
    email: email,
    id: id,
    reference: reference,
    sha: c.sha(),
    time: c.timeMs(),
  });
}

function makeEdge(sha: string, parentSha: string) {
  const fromNode = getNodeId(parentSha.toString());
  const toNode = getNodeId(sha);

  edges.add({
    from: fromNode,
    to: toNode,
  });
}

function getNodeId(sha: string) {
  for (let i = 0; i < commitList.length; i++) {
    const c = commitList[i];
    if (c['sha'] === sha) {
      return c['id'];
    }
  }
}

function reCenter() {
  const moveOptions = {
    animation: {
      duration: 1000,
      easingFunction: 'easeInOutQuad',
    },
    offset: {x: -150, y: 200},
    scale: 1,
  };

  network.focus(commitList[commitList.length - 1]['id'], moveOptions);
}
