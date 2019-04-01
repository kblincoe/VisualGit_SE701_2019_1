import { ipcRenderer } from 'electron';
import { GraphData, InitGraphParams } from '../backgroundTasks/initializeGraph';
import $ = require('jquery');
import vis = require('vis');

let bsNodes;
let bsEdges;
let abNodes;
let abEdges;
let nodes;
let edges;
let network;
let startP;
let secP = null;
let fromNode = null;
let toNode;

export const OPTIONS = {
  configure: {
    enabled: false,
  },

  edges: {
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 0.6
      },
      middle: false,
      from: false,
    },
    color: "#39c0ba",
    hoverWidth: 0,
    physics: false,
    selectionWidth: 0,
    shadow: true,
    smooth: {
      enabled: true,
      type: "cubicBezier",
      // forceDirection: "horizontal",
      roundness: 0.5
    },
    width: 3,
  },

  groups: {},

  interaction: {
    dragNodes: true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideNodesOnDrag: false,
    hover: true,
    hoverConnectedEdges: false,
    keyboard: {
      enabled: false,
      speed: {x: 10, y: 10, zoom: 0.02},
      bindToWindow: true
    },
    multiselect: false,
    navigationButtons: false,
    selectable: true,
    selectConnectedEdges: false,
    tooltipDelay: 300,
    zoomView: true,
  },

  layout: {
    randomSeed: 1,
    improvedLayout: true,
  },

  manipulation: {
    enabled: false,
    initiallyActive: false,
    addNode: true,
    addEdge: true,
    editEdge: true,
    deleteNode: true,
    deleteEdge: true,
    controlNodeStyle: {
      shape: "dot",
      size: 6,
      color: {
        background: "#39c0ba",
        border: "#39c0ba",
        highlight: {
          background: "#07f968",
          border: "#3c3c3c"
        }
      },
      borderWidth: 2,
      borderWidthSelected: 2,
    }
  },

  nodes: {
    borderWidth: 8,
    borderWidthSelected: 8,
    color: {
      border: "#39c0ba",
      background: "#FFF",
      highlight: {
        border: "#FF0",
        background: "#FFF"
      },
      hover: {
        border: "#F00",
        background: "#FFF"
      },
    },
    shadow: true,
  },

  physics: {
    enabled: false,
  },
};

// messages must be logged in this process to be visible in devtools.
ipcRenderer.on('log', (event: any, param: string) => {
  console.log(`background process says: ${param}`);
});

function initGraphInBg(params: InitGraphParams, callback: (data: GraphData) => void) {
  ipcRenderer.send('initGraph', params);

  ipcRenderer.on('finishGraph', (event: any, results: GraphData) => {
    callback(results);
  });
}


function drawGraph(cb?: () => void) {
  const fullPathToRepo: string = repoFullPath;
  initGraphInBg({ fullPathToRepo }, (data) => {
    console.log('graph calculations finished')
    console.log(data);
    if (cb) cb();
  });

  console.log('started background processing of graph initialization');

  return;

  bsNodes = new vis.DataSet([]);
  bsEdges = new vis.DataSet([]);

  abNodes = new vis.DataSet([]);
  abEdges = new vis.DataSet([]);

  nodes = new vis.DataSet([]);
  edges = new vis.DataSet([]);

  // create a network
  const container = document.getElementById('my-network');
  container.innerHTML = '';

  const bsData = {
    nodes: bsNodes,
    edges: bsEdges,
  };

  const abData = {
    nodes: abNodes,
    edges: abEdges,
  };

  const data = {
    nodes: nodes,
    edges: edges,
  };

  network = new vis.Network(container, bsData, OPTIONS);

  network.on('stabilizationIterationsDone', function() {
    network.setOptions( { physics: false } );
  });

  network.on('click', function(callback) {
    if (callback.nodes[0] === undefined) {
      return;
    }

    const email = abNodes._data[callback.nodes[0]]['email'];

    if (email.includes('noreply.github.com')) {
      const username = email.match(new RegExp('[0-9]*\\+*([^@]+)@'))[1];
      updateModalText('Github Profile: <a onClick=\'window.open(\'https://github.com/' + username +
        '\')\'>https://github.com/' + username + '</a>' +
        '<br/><i><small>Note: this user has not made their email public</small></i>');
    } else {
      updateModalText('Email: <a onClick=\'window.open(\'mailto:' + email + '\')\'>' + email + '</a>');
    }
  }, false);

  network.on('doubleClick', function(callback) {
    if (callback.nodes[0] === undefined) {
      return;
    } else {
      const nodeId: number = callback.nodes[0];
    }

    const moveOptions = {
      animation: {
        duration: 1000,
        easingFunction: 'easeInOutQuad',
      },
      offset: {x: 0, y: 0},
      scale: 1,
    };

    network.focus(callback.nodes[0], moveOptions);
  }, false);

  let flag = 'basic';

  network.on('zoom', function(callback) {
    const moveOptions = {
      animation: {
        duration: 1000,
        easingFunction: 'easeInOutQuad',
      },
      scale: 1,
    };

    if (network.getScale() > 1.5 && callback.direction === '+' && flag === 'abstract') {
      network.setData(data);
      flag = 'node';
      network.fit(moveOptions);
      // network.redraw();
    } else if (network.getScale() < 0.4 && callback.direction === '-' && flag === 'node') {
      network.setData(abData);
      flag = 'abstract';
      network.fit(moveOptions);
      // network.redraw();
    } else if (network.getScale() > 1.5 && callback.direction === '+' && flag === 'basic') {
      network.setData(abData);
      flag = 'abstract';
      network.fit(moveOptions);
    } else if (network.getScale() < 0.4 && callback.direction === '-' && flag === 'abstract') {
      network.setData(bsData);
      flag = 'basic';
      network.fit(moveOptions);
    }
  }, false);

  network.on('dragStart', function(callback) {
    startP = callback.pointer.canvas;
  });

  network.on('dragEnd', function(cb) {
    fromNode = cb.nodes[0];
    network.moveNode(fromNode, startP.x, startP.y);
    secP = cb.pointer.DOM;
  }, false);

  network.on('animationFinished', function() {
    if (fromNode !== null && secP !== null) {
      const toNode = network.getNodeAt(secP);

      if (fromNode !== toNode && (nodes.get(fromNode)['shape'] === 'box') && (nodes.get(toNode)['shape'] === 'box')) {
        mergeCommits(nodes.get(fromNode)['title']);
      }
    }
    fromNode = null;
    secP = null;
  });

  network.on('oncontext', function(callback) {
    toNode = network.getNodeAt(callback.pointer.DOM);
    if (flag === 'node' && nodes.get(toNode)['shape'] === 'box') {
      toNode = nodes.get(toNode);
    } else if (flag === 'abstract' && abNodes.get(toNode)['shape'] === 'box') {
      toNode = abNodes.get(toNode);
    } else if (flag === 'basic' && bsNodes.get(toNode)['shape'] === 'box') {
      toNode = bsNodes.get(toNode);
    } else {
      toNode = undefined;
    }
  //   if (toNode !== undefined) {
  //     network.selectNodes([toNode], [false]);
  //     addBranchestoNode(nodes.get(toNode)['label']);
  //     $('#branchOptions').css({
  //     display: 'block',
  //     left: callback.pointer.DOM.x,
  //     top: callback.pointer.DOM.y
  //  });
  //   }
  });

  getAllCommits(function(commits) {
    processGraph(commits, () => {
      console.log(container);
      if (cb) {
        cb();
      }
    });
  });
}
