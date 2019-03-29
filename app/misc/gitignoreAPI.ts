//This file uses the API of gitignore.io

//cache result of types query
var gitignoretypes;

//passes a String[] to the callback with is the list of possible gitignore catagories
function queryGitignoreTypes(callback) {
    if (gitignoretypes !== undefined){
        callback(gitignoretypes);
    }
    var data;    

    $.ajax({
        url: "https://www.gitignore.io/api/list",
        success: function (response) {
            data = response;
            data.replace('\n',",");
            gitignoretypes = data.split(",");
            callback(gitignoretypes);
        },
        error: function () {
            console.log("Error using gitignore API");
        }
    });
}

//returns a String with the .gitignore file generated with the types given
function queryGitignore(types : String[], callback){
    var csv = types.join(',');
    $.ajax({
        url: "https://www.gitignore.io/api/" + csv,
        success: function (response) {
            callback(response);
        },
        error: function () {
            console.log("Error using gitignore API");
        }
    });
}