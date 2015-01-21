// Criteria util

/**
 * Calculates the total mark for a
 * @param criteria
 * @param save
 */
function calculateMarks(criteria, save) {
    for (key in save) {
        var value = save[key];
        if (value['checked']) {
            // How many marks is this key worth?

        }
    }
}

/**
 * Returns an identifier string for a child
 * @param child - the child
 * @returns identifier - a unique identifier for a child node
 */
function childIdentifier(child) {
    var identifier = child['id'];
    if (typeof identifier === 'undefined') {
        identifier = "row_" + child["criteria"];
    }
    return identifier;
}

/**
 *
 * @param children
 * @param id
 * @returns {*}
 */
function findCriteria(children, id) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var weight = child['weight'];
        var subchildren = child['children'];
        var identifier = childIdentifier(child);

        if (identifier == id) {
            return child;
        }
        if (typeof subchildren !== 'undefined') {
            var search = findCriteria(subchildren, id);
            if (typeof search !== 'undefined') {
                return search;
            }
        }
    }
    return undefined;
}

/**
 *
 * @param children
 * @param related
 * @param id
 * @returns {*}
 */
function findRelated(children, related, id) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (typeof child['requires'] !== 'undefined' && child['requires'].length > 0) {
            if (child['requires'].indexOf(id) != -1) {
                related.push(child);
            }
        }
        var subchildren = child['children'];
        if (typeof subchildren !== 'undefined') {
            findRelated(subchildren, related, id);
        }
    }
    return related;
}


// Client specific
/**
 *
 * @param children
 * @param output
 */
function exportChildren(children, output) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var subchildren = child['children'];

        if (typeof subchildren === 'undefined') {
            var id = childIdentifier(child);
            var textarea = document.getElementById(id + "_textarea");
            var checkbox = document.getElementById(id);

            output[id] = {
                checked: checkbox.checked,
                value: textarea.value
            }
        } else {
            exportChildren(subchildren, output);
        }
    }
}

/**
 *
 */
function save() {

    // Show the upload progress bar
    document.getElementById("save").innerHTML = "<span class='glyphicon glyphicon-save'></span> Saving</a>";
    var code = editor.getSession().getValue();

    // Save the comment and checkbox values
    var exported = {};
    exportChildren(criteria, exported);

    $.ajax({
        xhr: function()
        {
            var xhr = new window.XMLHttpRequest();
            //Upload progress
            xhr.upload.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                }
            }, false);
            return xhr;
        },
        type: 'POST',
        url: "/edit",
        data: {
            code: code,
            script: script,
            prac: prac,
            criteria: exported
        },
        success: function(data){
            if (data['success'] == true) {
                document.getElementById("save").innerHTML = "<span class='glyphicon glyphicon-save'></span> Saved</a>";
                window.location = "/";
            }
        },
        dataType: "json"
    });

}

$(document).ready(function() {

    /**
     *
     * @param children
     */
    function mark(children) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child['viewed'] = false;
            var subchildren = child['children'];
            if (typeof subchildren !== 'undefined') {
                mark(subchildren);
            }
        }
    }

    /**
     *
     * @param children
     * @returns {number}
     */
    function updateMarks(children) {
        var total = 0.0;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var id = childIdentifier(child);

            // Calculate the subtotal
            var subtotal = 0.0;
            var subchildren = child['children'];
            if (typeof subchildren !== 'undefined') {
                subtotal = updateMarks(subchildren);
            } else {
                subtotal = child['weight'] * document.getElementById(id).checked;
            }

            // Update the child mark
            var markfield = document.getElementById(id+"_marks");
            markfield.innerHTML = subtotal.toPrecision(2);
            child.mark = subtotal.toPrecision(2);

            // Update the parent total
            total += subtotal;
        }
        return total;
    }



    function computeComments(children) {
        var output = "";
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var subchildren = child['children'];

            if (typeof subchildren !== 'undefined') {
                output += computeComments(subchildren);
            } else {
                var id = childIdentifier(child);
                var textarea = document.getElementById(id + "_textarea");
                var value = textarea.value.trim();
                if (value != "") {
                    output += value + "\n";
                }
            }

        }
        return output;
    }

    function updateComments() {
        var output = computeComments(criteria);
        var rangeStart = editor.find(/General comments:/,{
            regExp: true,
            preventScroll: true // do not change selection
        })
        var rangeEnd = editor.find(/----------------------------------------------/,{
            regExp: true,
            start: rangeStart,
            preventScroll: true // do not change selection
        })
        rangeStart.end = rangeEnd.end;
        editor.session.replace(rangeStart, "General comments:\n"+output+"\n----------------------------------------------");
    }

    /**
     *
     * @param child
     */
    function updateChild(child) {
        if (typeof child !== 'undefined' && child['viewed'] == false) {

            // Populate the text area
            var id = childIdentifier(child);
            var textarea  = document.getElementById(id+"_textarea");
            var markfield = document.getElementById(id+"_marks");
            var checkbox  = document.getElementById(id);

            // Do we require any other criteria
            var required = true;
            if (typeof child['requires'] !== 'undefined' && child['requires'].length > 0) {
                for (var i=0; i < child['requires'].length; i++) {
                    if (!document.getElementById(child['requires'][i]).checked) required = false;
                }
            }

            // Save the current value


            // Update the fields
            if (!required) {
                textarea.value   = "";
                checkbox.checked = false;
            } else {
                if (checkbox.checked) {
                    textarea.value = child['true'] || "";
                } else {
                    textarea.value = child['false'] || "";
                }
            }
            child['viewed'] = true;

            // Find related
            var related = findRelated(criteria, [], id);
            for (var i = 0; i < related.length; i++) {
                updateChild(related[i]);
            }
        }
    }

    // Checkbox listener
    $('input[type=checkbox]').change(
        function(){

            // Find the child
            var id = this.id;
            var child = findCriteria(criteria, id);

            // Mark each child as unread
            mark(criteria);
            updateChild(child);

            // Update the marks
            updateMarks(criteria);

            // Update the code
            updateComments();

    });

    // Textarea listener (potentially laggy!)
    $('textarea').on('keyup', function (event) {
        updateComments();
    });

    // Update the marks
    updateMarks(criteria);

    // Update the code
    updateComments();

});