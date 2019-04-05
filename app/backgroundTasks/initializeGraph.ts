/** Script to be run in the background for initializing the graph.
 * Parameters are sent as messages via the relevant electron modules.
 */

import { ipcRenderer } from 'electron';

/** Input params */
export interface InitGraphParams {
    fullPathToRepo: string;
}

/** Output structure */
export interface IGraphData {
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

function sendOutput(output: IGraphData) {
    log('finished processing, sending result...');
    ipcRenderer.send('finishGraph', output);
}

function ready() {
    ipcRenderer.on('initGraph', (event, param) => {
        initGraph(param);
    });

    ipcRenderer.send('ready');
}

function initGraph(params: InitGraphParams) {
    // Perform graph initialization work here.
    // sendOutput(output);
}

// when script runs, tell the creator that it is ready to do work.
ready();
