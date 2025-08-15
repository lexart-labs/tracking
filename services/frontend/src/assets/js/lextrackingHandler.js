var lextrackingDebug = {};
var captureUrl       = window.location.href;
var captureOrigin    = window.location.origin;


lextrackingDebug = function(error) {

        //ERROR
        console.log("exception:::: ", error);

        var errorMessage = error.message;

        //NOMBRE ERROR
        console.log("Nombre error:: ", errorMessage);
        window.localStorage.setItem("Nombre Error", errorMessage);

        //URL ERROR
        console.log("errorLocation:: ", captureUrl);
        window.localStorage.setItem("Url Error", captureUrl);

        //ORIGIN LOCATION ERROR
        console.log("Origin Error:: ", captureOrigin);
        window.localStorage.setItem("Origin Error", captureOrigin);

        //LINE ERROR
        if(error){
        var splitError   = error.stack;
        var arrError     = splitError.split(" ")
        var strError     = arrError[10].toString();
        var lineError    = strError.split("/");
        var fLineError   = lineError[7].split("\)");
        var CLError      = fLineError[0].split(":");
        var lineError    = CLError[1];
        var columnError  = CLError[2]
        var archiveError = CLError[0]
        console.log("Line Error:: ", lineError);
        console.log("Column Error:: ", columnError);

        //ARCHIVO ERROR
        console.log("Archive Error:: ", archiveError);
        }

        var obj = {
            error: errorMessage,
            url: captureUrl,
            origin: captureOrigin,
            line: lineError,
            column: columnError,
            file: archiveError
        };

        var Jobj = JSON.stringify(obj);

        console.log("xhr:: ", Jobj);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost/lextracking-api/taskAutomatic/new', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(Jobj);

    return lextrackingDebug;

}




