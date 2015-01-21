/*
 *
 * Copyright (c) 2015, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 */

var criteria_util = module.exports;

// Server/client side functions
function calculateMarks(children, save) {
    var total = 0.0;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var id = childIdentifier(child);
        var sub = child['children'];

        var worth = 0.0;
        if (typeof sub === 'undefined') {
            var info = save[id];
            if (info && info.checked == 'true') {
                worth = child['weight'];
            }
        } else {
            worth = calculateMarks(sub, save);
        }
        total += worth;
    }
    return total;
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

// Export functions
criteria_util.calculateMarks = calculateMarks;
criteria_util.childIdentifier = childIdentifier;
criteria_util.findCriteria = findCriteria;
criteria_util.findRelated = findRelated;