// Run scripts
var URL = "http://localhost:3000/python";
function run() {
    var code = editor.getSession().getValue();

    restart();
    //addOutput("Testing script...");
    $.ajax({
        type: "POST",
        url: URL,
        data: {
            code: code
        },
        success: function(data) {

            /*
            console.log(JSON.stringify(data));
            if (!data.success) {
                console.log("There is a syntax error on line " + data.line);
            } else {

                // The script executed successfully
                var status = data.status;
                var output = data.output;
                var error = data.error;

                addOutput(status + "\n");
            }
            */

            // Restart the socket interpreter
            addOutput("\n");
            flushSocket();


            /*
            var display = "";
            var out = data['output'];
            for (var i = 0; i < out.length; i++) {
                display += out[i];
                display += "\n";
            }
            output.getSession().setValue(display);
            */
        },
        dataType: "json"
    });

    $('#graph').modal('toggle');
    output.focus(); //To focus the ace editor
    session = output.getSession();
    count = session.getLength();
    output.gotoLine(count, session.getLine(count-1).length);
}

var ws = undefined;
var server = "";
var serverCursor = undefined;
var serverLength = 0;

// Render timer (faster)
var needsRedraw = false;
function restart() {
    output.$blockScrolling = Infinity
    output.moveCursorTo(Infinity, Infinity);
    output.session.setValue("");
    output.renderer.scrollToRow(Infinity);
    needsRedraw = true;
    serverCursor = output.getSession().getSelection().getCursor();
    serverLength = 0;

    //addOutput("\n================================ RESTART ================================\n");
}
function addOutput(data) {
    /*
	output.$blockScrolling = Infinity
    output.moveCursorTo(Infinity, Infinity);
    output.insert(data);
    output.renderer.scrollToRow(Infinity);
    output.renderer.updateFull();
    serverCursor = output.getSession().getSelection().getCursor();
    server = output.getSession().getValue();
	*/

	// Faster
	output.$blockScrolling = Infinity
    output.moveCursorTo(Infinity, Infinity);
    output.insert(data);
    output.renderer.scrollToRow(Infinity);
	needsRedraw = true;
    serverCursor = output.getSession().getSelection().getCursor();
    serverLength += data.length;
}
function flushSocket() {
    if (typeof ws !== 'undefined') {
        ws.close();
    }

    if ("WebSocket" in window) {

        // Add INSERT

        ws = new WebSocket("ws://localhost:3333");
        ws.onopen = function () {

        };
        ws.onmessage = function (evt) {
            //output.focus();
            addOutput(evt.data);
        };
        ws.onclose = function () {
            console.error("Socket closed");
            setTimeout(1000, flushSocket);
        };
    } else {
        console.error("Sockets are not supported");
    }
}

$(document).ready(function() {
	setInterval(function() {
		if (needsRedraw) {
			needsRedraw = false;
			output.renderer.updateFull();
		}
	}, 500);

    // Stack overflow http://stackoverflow.com/questions/263743/caret-position-in-textarea-in-characters-from-the-start
    function getInputSelection(el) {
        var start = 0, end = 0, normalizedValue, range,
            textInputRange, len, endRange;

        if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
            start = el.selectionStart;
            end = el.selectionEnd;
        } else {
            range = document.selection.createRange();

            if (range && range.parentElement() == el) {
                len = el.value.length;
                normalizedValue = el.value.replace(/\r\n/g, "\n");

                // Create a working TextRange that lives only in the input
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());

                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = el.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    start = end = len;
                } else {
                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("\n").length - 1;

                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                    }
                }
            }
        }

        return {
            start: start,
            end: end
        };
    }

    /*
     var clientCursor = output.getSession().getSelection().getCursor();

     console.log(clientCursor.row + " " + serverCursor.row + " " + clientCursor.column + " " + serverCursor.column);
     if (clientCursor.row < serverCursor.row || clientCursor.column < serverCursor.column) {
     var large = 1000000;
     output.getSession().setValue(server, 1);
     output.moveCursorTo(large, large);
     serverCursor = output.getSession().getSelection().getCursor();
     }
     */

    // Create handlers
    output.on('change', function (event) {
        if (!(output.curOp && output.curOp.command.name)) return;
        if (event.data.action == "insertText" && event.data.text == "\n") {
            if (typeof ws !== 'undefined') {
                var client = output.getSession().getValue();
                ws.send(client.substring(serverLength));
				serverLength = client.length;
            }
        }
        if (event.data.action == "removeText" && event.data.text.length > 0 &&
                (event.data.range.start.column < serverCursor.column || event.data.range.start.row < serverCursor.row)) {
            output.insert(event.data.text);
            output.moveCursorTo(Infinity, Infinity);
        }
    });


    // Open a WebSocket to the python server
    flushSocket();
});