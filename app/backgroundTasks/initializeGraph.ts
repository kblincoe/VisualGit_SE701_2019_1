/** Script to be run in the background for initializing the graph. 
 * Parameters are sent as messages via the relevant electron modules. */

const { ipcRenderer } = require('electron');

/** Input params */
export interface InitGraphParams {
    fullPathToRepo: string;
}

/** Output structure */
export interface GraphData {
    bsNodes: {};
    bsEdges: {};
    abNodes: {};
    abEdges: {};
    nodes: {};
    edges: {};
}

/** Send logs back to the main thread to print to the console. */
function log(msg) {
    ipcRenderer.send('log', msg);
}

function sendOutput(output) {
    log('finished processing, sending result...');
    ipcRenderer.send('finishGraph', output);
}

function ready() {
    ipcRenderer.on('initGraph', (event, param) => {
        console.log(event);
        initGraph(param);
    });
    
    ipcRenderer.send('ready');
}

function initGraph(params) {
    console.log(params);
    // log(`initializing graph. full path is ${params.fullPathToRepo}`);
    // TODO: perform initialization work.
    sendOutput({ hello: 'yeet' });
}



// when script runs, tell the creator that it is ready to do work.
ready();