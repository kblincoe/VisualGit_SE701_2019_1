// This file uses the API of gitignore.io

// vcache result of types query
let gitignoretypes;

// passes a string[] to the callback with is the list of possible gitignore catagories
function queryGitignoreTypes(callback) {
    if (gitignoretypes !== undefined){
        callback(gitignoretypes);
    }
    let data;

    $.ajax({
        url: 'https://www.gitignore.io/api/list',
        success: function(response) {
            data = response;
            data = data.split('\n').join(',');
            gitignoretypes = data.split(',');
            callback(gitignoretypes);
        },
        error: function() {
            console.log('Error using gitignore API');
        },
    });
}

// returns a string with the .gitignore file generated with the types given
function queryGitignore(types: string[], callback){
    const csv = types.join(',');
    $.ajax({
        url: 'https://www.gitignore.io/api/' + csv,
        success: function(response) {
            callback(response);
        },
        error: function() {
            console.log('Error using gitignore API');
        },
    });
}
