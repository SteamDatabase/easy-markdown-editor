'use strict';
var CodeMirror = require('codemirror');
require('codemirror/addon/edit/continuelist.js');
require('./codemirror/tablist');
require('codemirror/mode/markdown/markdown.js');
require('codemirror/addon/mode/overlay.js');
require('codemirror/addon/display/placeholder.js');
require('codemirror/addon/selection/mark-selection.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/mode/gfm/gfm.js');
require('codemirror/mode/xml/xml.js');

// Some variables
var isMac = /Mac/.test(navigator.platform);

// Mapping of actions that can be bound to keyboard shortcuts or toolbar buttons
var bindings = {
    'toggleBold': toggleBold,
    'toggleItalic': toggleItalic,
    'drawLink': drawLink,
    'toggleHeadingSmaller': toggleHeadingSmaller,
    'toggleHeadingBigger': toggleHeadingBigger,
    'drawImage': drawImage,
    'toggleBlockquote': toggleBlockquote,
    'toggleOrderedList': toggleOrderedList,
    'toggleUnorderedList': toggleUnorderedList,
    'toggleCodeBlock': toggleCodeBlock,
    'toggleStrikethrough': toggleStrikethrough,
    'toggleHeading1': toggleHeading1,
    'toggleHeading2': toggleHeading2,
    'toggleHeading3': toggleHeading3,
    'drawTable': drawTable,
    'drawHorizontalRule': drawHorizontalRule,
    'undo': undo,
    'redo': redo,
};

var shortcuts = {
    'toggleBold': 'Cmd-B',
    'toggleItalic': 'Cmd-I',
    'drawLink': 'Cmd-K',
    'toggleHeadingSmaller': 'Cmd-H',
    'toggleHeadingBigger': 'Shift-Cmd-H',
    'drawImage': 'Cmd-Alt-I',
    'toggleBlockquote': 'Cmd-\'',
    'toggleOrderedList': 'Cmd-Alt-L',
    'toggleUnorderedList': 'Cmd-L',
    'toggleCodeBlock': 'Cmd-Alt-C',
};

var getBindingName = function (f) {
    for (var key in bindings) {
        if (bindings[key] === f) {
            return key;
        }
    }
    return null;
};

var isMobile = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


/**
 * Fix shortcut. Mac use Command, others use Ctrl.
 */
function fixShortcut(name) {
    if (isMac) {
        name = name.replace('Ctrl', 'Cmd');
    } else {
        name = name.replace('Cmd', 'Ctrl');
    }
    return name;
}

/**
 * Create button element for toolbar.
 */
function createToolbarButton(options, enableActions, enableTooltips, shortcuts, markup, parent) {
    options = options || {};
    var el = document.createElement(markup);
    el.className = 'cm-btn tooltipped tooltipped-s ' + options.name;
    el.setAttribute('type', markup);
    enableTooltips = (enableTooltips == undefined) ? true : enableTooltips;

    // Properly hande custom shortcuts
    if (options.name && options.name in shortcuts) {
        bindings[options.name] = options.action;
    }

    if (options.title && enableTooltips) {
        var title = createTooltip(options.title, options.action, shortcuts);

        if (isMac) {
            title = title.replace('Ctrl', '⌘');
            title = title.replace('Alt', '⌥');
        }

        el.ariaLabel = title;
    }

    if (options.noDisable) {
        el.classList.add('no-disable');
    }

    if (options.noMobile) {
        el.classList.add('no-mobile');
    }

    // Prevent errors if there is no class name in custom options
    var classNameParts = [];
    if(typeof options.className !== 'undefined') {
        classNameParts = options.className.split(' ');
    }

    // Provide backwards compatibility with simple-markdown-editor by adding custom classes to the button.
    var iconClasses = [];
    for (var classNameIndex = 0; classNameIndex < classNameParts.length; classNameIndex++) {
        var classNamePart = classNameParts[classNameIndex];
        // Split icon classes from the button.
        // Regex will detect "fa", "fas", "fa-something" and "fa-some-icon-1", but not "fanfare".
        if (classNamePart.match(/^fa([srlb]|(-[\w-]*)|$)/)) {
            iconClasses.push(classNamePart);
        } else {
            el.classList.add(classNamePart);
        }
    }

    el.tabIndex = -1;

    // If there is a custom icon markup set, use that
    if (typeof options.icon !== 'undefined') {
        el.innerHTML = options.icon;
    }

    if (options.action && enableActions) {
        if (typeof options.action === 'function') {
            el.onclick = function (e) {
                e.preventDefault();
                options.action(parent);
            };
        } else if (typeof options.action === 'string') {
            el.onclick = function (e) {
                e.preventDefault();
                window.open(options.action, '_blank');
            };
        }
    }

    return el;
}

function createSep() {
    var el = document.createElement('i');
    el.className = 'separator';
    el.innerHTML = '|';
    return el;
}

function createTooltip(title, action, shortcuts) {
    var actionName;
    var tooltip = title;

    if (action) {
        actionName = getBindingName(action);
        if (shortcuts[actionName]) {
            tooltip += ' (' + fixShortcut(shortcuts[actionName]) + ')';
        }
    }

    return tooltip;
}

/**
 * The state of CodeMirror at the given position.
 */
function getState(cm, pos) {
    pos = pos || cm.getCursor('start');
    var stat = cm.getTokenAt(pos);
    if (!stat.type) return {};

    var types = stat.type.split(' ');

    var ret = {},
        data, text;
    for (var i = 0; i < types.length; i++) {
        data = types[i];
        if (data === 'strong') {
            ret.bold = true;
        } else if (data === 'variable-2') {
            text = cm.getLine(pos.line);
            if (/^\s*\d+\.\s/.test(text)) {
                ret['ordered-list'] = true;
            } else {
                ret['unordered-list'] = true;
            }
        } else if (data === 'atom') {
            ret.quote = true;
        } else if (data === 'em') {
            ret.italic = true;
        } else if (data === 'quote') {
            ret.quote = true;
        } else if (data === 'strikethrough') {
            ret.strikethrough = true;
        } else if (data === 'comment') {
            ret.code = true;
        } else if (data === 'link') {
            ret.link = true;
        } else if (data === 'tag') {
            ret.image = true;
        } else if (data.match(/^header(-[1-6])?$/)) {
            ret[data.replace('header', 'heading')] = true;
        }
    }
    return ret;
}


/**
 * Action for toggling bold.
 */
function toggleBold(editor) {
    _toggleBlock(editor, 'bold', editor.options.blockStyles.bold);
}


/**
 * Action for toggling italic.
 */
function toggleItalic(editor) {
    _toggleBlock(editor, 'italic', editor.options.blockStyles.italic);
}


/**
 * Action for toggling strikethrough.
 */
function toggleStrikethrough(editor) {
    _toggleBlock(editor, 'strikethrough', '~~');
}

/**
 * Action for toggling code block.
 */
function toggleCodeBlock(editor) {
    var fenceCharsToInsert = editor.options.blockStyles.code;

    function fencing_line(line) {
        /* return true, if this is a ``` or ~~~ line */
        if (typeof line !== 'object') {
            throw 'fencing_line() takes a \'line\' object (not a line number, or line text).  Got: ' + typeof line + ': ' + line;
        }
        return line.styles && line.styles[2] && line.styles[2].indexOf('formatting-code-block') !== -1;
    }

    function token_state(token) {
        // base goes an extra level deep when mode backdrops are used, e.g. spellchecker on
        return token.state.base.base || token.state.base;
    }

    function code_type(cm, line_num, line, firstTok, lastTok) {
        /*
         * Return "single", "indented", "fenced" or false
         *
         * cm and line_num are required.  Others are optional for efficiency
         *   To check in the middle of a line, pass in firstTok yourself.
         */
        line = line || cm.getLineHandle(line_num);
        firstTok = firstTok || cm.getTokenAt({
            line: line_num,
            ch: 1,
        });
        lastTok = lastTok || (!!line.text && cm.getTokenAt({
            line: line_num,
            ch: line.text.length - 1,
        }));
        var types = firstTok.type ? firstTok.type.split(' ') : [];
        if (lastTok && token_state(lastTok).indentedCode) {
            // have to check last char, since first chars of first line aren"t marked as indented
            return 'indented';
        } else if (types.indexOf('comment') === -1) {
            // has to be after "indented" check, since first chars of first indented line aren"t marked as such
            return false;
        } else if (token_state(firstTok).fencedChars || token_state(lastTok).fencedChars || fencing_line(line)) {
            return 'fenced';
        } else {
            return 'single';
        }
    }

    function insertFencingAtSelection(cm, cur_start, cur_end, fenceCharsToInsert) {
        var start_line_sel = cur_start.line + 1,
            end_line_sel = cur_end.line + 1,
            sel_multi = cur_start.line !== cur_end.line,
            repl_start = fenceCharsToInsert + '\n',
            repl_end = '\n' + fenceCharsToInsert;
        if (sel_multi) {
            end_line_sel++;
        }
        // handle last char including \n or not
        if (sel_multi && cur_end.ch === 0) {
            repl_end = fenceCharsToInsert + '\n';
            end_line_sel--;
        }
        _replaceSelection(cm, false, [repl_start, repl_end]);
        cm.setSelection({
            line: start_line_sel,
            ch: 0,
        }, {
            line: end_line_sel,
            ch: 0,
        });
    }

    var cm = editor.codemirror,
        cur_start = cm.getCursor('start'),
        cur_end = cm.getCursor('end'),
        tok = cm.getTokenAt({
            line: cur_start.line,
            ch: cur_start.ch || 1,
        }), // avoid ch 0 which is a cursor pos but not token
        line = cm.getLineHandle(cur_start.line),
        is_code = code_type(cm, cur_start.line, line, tok);
    var block_start, block_end, lineCount;

    if (is_code === 'single') {
        // similar to some EasyMDE _toggleBlock logic
        var start = line.text.slice(0, cur_start.ch).replace('`', ''),
            end = line.text.slice(cur_start.ch).replace('`', '');
        cm.replaceRange(start + end, {
            line: cur_start.line,
            ch: 0,
        }, {
            line: cur_start.line,
            ch: 99999999999999,
        });
        cur_start.ch--;
        if (cur_start !== cur_end) {
            cur_end.ch--;
        }
        cm.setSelection(cur_start, cur_end);
        cm.focus();
    } else if (is_code === 'fenced') {
        if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
            // use selection

            // find the fenced line so we know what type it is (tilde, backticks, number of them)
            for (block_start = cur_start.line; block_start >= 0; block_start--) {
                line = cm.getLineHandle(block_start);
                if (fencing_line(line)) {
                    break;
                }
            }
            var fencedTok = cm.getTokenAt({
                line: block_start,
                ch: 1,
            });
            var fence_chars = token_state(fencedTok).fencedChars;
            var start_text, start_line;
            var end_text, end_line;
            // check for selection going up against fenced lines, in which case we don't want to add more fencing
            if (fencing_line(cm.getLineHandle(cur_start.line))) {
                start_text = '';
                start_line = cur_start.line;
            } else if (fencing_line(cm.getLineHandle(cur_start.line - 1))) {
                start_text = '';
                start_line = cur_start.line - 1;
            } else {
                start_text = fence_chars + '\n';
                start_line = cur_start.line;
            }
            if (fencing_line(cm.getLineHandle(cur_end.line))) {
                end_text = '';
                end_line = cur_end.line;
                if (cur_end.ch === 0) {
                    end_line += 1;
                }
            } else if (cur_end.ch !== 0 && fencing_line(cm.getLineHandle(cur_end.line + 1))) {
                end_text = '';
                end_line = cur_end.line + 1;
            } else {
                end_text = fence_chars + '\n';
                end_line = cur_end.line + 1;
            }
            if (cur_end.ch === 0) {
                // full last line selected, putting cursor at beginning of next
                end_line -= 1;
            }
            cm.operation(function () {
                // end line first, so that line numbers don't change
                cm.replaceRange(end_text, {
                    line: end_line,
                    ch: 0,
                }, {
                    line: end_line + (end_text ? 0 : 1),
                    ch: 0,
                });
                cm.replaceRange(start_text, {
                    line: start_line,
                    ch: 0,
                }, {
                    line: start_line + (start_text ? 0 : 1),
                    ch: 0,
                });
            });
            cm.setSelection({
                line: start_line + (start_text ? 1 : 0),
                ch: 0,
            }, {
                line: end_line + (start_text ? 1 : -1),
                ch: 0,
            });
            cm.focus();
        } else {
            // no selection, search for ends of this fenced block
            var search_from = cur_start.line;
            if (fencing_line(cm.getLineHandle(cur_start.line))) { // gets a little tricky if cursor is right on a fenced line
                if (code_type(cm, cur_start.line + 1) === 'fenced') {
                    block_start = cur_start.line;
                    search_from = cur_start.line + 1; // for searching for "end"
                } else {
                    block_end = cur_start.line;
                    search_from = cur_start.line - 1; // for searching for "start"
                }
            }
            if (block_start === undefined) {
                for (block_start = search_from; block_start >= 0; block_start--) {
                    line = cm.getLineHandle(block_start);
                    if (fencing_line(line)) {
                        break;
                    }
                }
            }
            if (block_end === undefined) {
                lineCount = cm.lineCount();
                for (block_end = search_from; block_end < lineCount; block_end++) {
                    line = cm.getLineHandle(block_end);
                    if (fencing_line(line)) {
                        break;
                    }
                }
            }
            cm.operation(function () {
                cm.replaceRange('', {
                    line: block_start,
                    ch: 0,
                }, {
                    line: block_start + 1,
                    ch: 0,
                });
                cm.replaceRange('', {
                    line: block_end - 1,
                    ch: 0,
                }, {
                    line: block_end,
                    ch: 0,
                });
            });
            cm.focus();
        }
    } else if (is_code === 'indented') {
        if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
            // use selection
            block_start = cur_start.line;
            block_end = cur_end.line;
            if (cur_end.ch === 0) {
                block_end--;
            }
        } else {
            // no selection, search for ends of this indented block
            for (block_start = cur_start.line; block_start >= 0; block_start--) {
                line = cm.getLineHandle(block_start);
                if (line.text.match(/^\s*$/)) {
                    // empty or all whitespace - keep going
                    continue;
                } else {
                    if (code_type(cm, block_start, line) !== 'indented') {
                        block_start += 1;
                        break;
                    }
                }
            }
            lineCount = cm.lineCount();
            for (block_end = cur_start.line; block_end < lineCount; block_end++) {
                line = cm.getLineHandle(block_end);
                if (line.text.match(/^\s*$/)) {
                    // empty or all whitespace - keep going
                    continue;
                } else {
                    if (code_type(cm, block_end, line) !== 'indented') {
                        block_end -= 1;
                        break;
                    }
                }
            }
        }
        // if we are going to un-indent based on a selected set of lines, and the next line is indented too, we need to
        // insert a blank line so that the next line(s) continue to be indented code
        var next_line = cm.getLineHandle(block_end + 1),
            next_line_last_tok = next_line && cm.getTokenAt({
                line: block_end + 1,
                ch: next_line.text.length - 1,
            }),
            next_line_indented = next_line_last_tok && token_state(next_line_last_tok).indentedCode;
        if (next_line_indented) {
            cm.replaceRange('\n', {
                line: block_end + 1,
                ch: 0,
            });
        }

        for (var i = block_start; i <= block_end; i++) {
            cm.indentLine(i, 'subtract'); // TODO: this doesn't get tracked in the history, so can't be undone :(
        }
        cm.focus();
    } else {
        // insert code formatting
        var no_sel_and_starting_of_line = (cur_start.line === cur_end.line && cur_start.ch === cur_end.ch && cur_start.ch === 0);
        var sel_multi = cur_start.line !== cur_end.line;
        if (no_sel_and_starting_of_line || sel_multi) {
            insertFencingAtSelection(cm, cur_start, cur_end, fenceCharsToInsert);
        } else {
            _replaceSelection(cm, false, ['`', '`']);
        }
    }
}

/**
 * Action for toggling blockquote.
 */
function toggleBlockquote(editor) {
    var cm = editor.codemirror;
    _toggleLine(cm, 'quote');
}

/**
 * Action for toggling heading size: normal -> h1 -> h2 -> h3 -> h4 -> h5 -> h6 -> normal
 */
function toggleHeadingSmaller(editor) {
    var cm = editor.codemirror;
    _toggleHeading(cm, 'smaller');
}

/**
 * Action for toggling heading size: normal -> h6 -> h5 -> h4 -> h3 -> h2 -> h1 -> normal
 */
function toggleHeadingBigger(editor) {
    var cm = editor.codemirror;
    _toggleHeading(cm, 'bigger');
}

/**
 * Action for toggling heading size 1
 */
function toggleHeading1(editor) {
    var cm = editor.codemirror;
    _toggleHeading(cm, undefined, 1);
}

/**
 * Action for toggling heading size 2
 */
function toggleHeading2(editor) {
    var cm = editor.codemirror;
    _toggleHeading(cm, undefined, 2);
}

/**
 * Action for toggling heading size 3
 */
function toggleHeading3(editor) {
    var cm = editor.codemirror;
    _toggleHeading(cm, undefined, 3);
}


/**
 * Action for toggling ul.
 */
function toggleUnorderedList(editor) {
    var cm = editor.codemirror;
    _toggleLine(cm, 'unordered-list');
}


/**
 * Action for toggling ol.
 */
function toggleOrderedList(editor) {
    var cm = editor.codemirror;
    _toggleLine(cm, 'ordered-list');
}

/**
 * Action for drawing a link.
 */
function drawLink(editor) {
    var cm = editor.codemirror;
    var stat = getState(cm);
    var options = editor.options;
    var url = 'https://';
    if (options.promptURLs) {
        url = prompt(options.promptTexts.link, 'https://');
        if (!url) {
            return false;
        }
    }
    _replaceSelection(cm, stat.link, options.insertTexts.link, url);
}

/**
 * Action for drawing an img.
 */
function drawImage(editor) {
    var cm = editor.codemirror;
    var stat = getState(cm);
    var options = editor.options;
    var url = 'https://';
    if (options.promptURLs) {
        url = prompt(options.promptTexts.image, 'https://');
        if (!url) {
            return false;
        }
    }
    _replaceSelection(cm, stat.image, options.insertTexts.image, url);
}

/**
 * Action for drawing a table.
 */
function drawTable(editor) {
    var cm = editor.codemirror;
    var stat = getState(cm);
    var options = editor.options;
    _replaceSelection(cm, stat.table, options.insertTexts.table);
}

/**
 * Action for drawing a horizontal rule.
 */
function drawHorizontalRule(editor) {
    var cm = editor.codemirror;
    var stat = getState(cm);
    var options = editor.options;
    _replaceSelection(cm, stat.image, options.insertTexts.horizontalRule);
}


/**
 * Undo action.
 */
function undo(editor) {
    var cm = editor.codemirror;
    cm.undo();
    cm.focus();
}


/**
 * Redo action.
 */
function redo(editor) {
    var cm = editor.codemirror;
    cm.redo();
    cm.focus();
}


function _replaceSelection(cm, active, startEnd, url) {
    var text;
    var start = startEnd[0];
    var end = startEnd[1];
    var startPoint = {},
        endPoint = {};
    Object.assign(startPoint, cm.getCursor('start'));
    Object.assign(endPoint, cm.getCursor('end'));
    if (url) {
        start = start.replace('#url#', url);  // url is in start for upload-image
        end = end.replace('#url#', url);
    }
    if (active) {
        text = cm.getLine(startPoint.line);
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        cm.replaceRange(start + end, {
            line: startPoint.line,
            ch: 0,
        });
    } else {
        text = cm.getSelection();
        cm.replaceSelection(start + text + end);

        startPoint.ch += start.length;
        if (startPoint !== endPoint) {
            endPoint.ch += start.length;
        }
    }
    cm.setSelection(startPoint, endPoint);
    cm.focus();
}


function _toggleHeading(cm, direction, size) {
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    for (var i = startPoint.line; i <= endPoint.line; i++) {
        (function (i) {
            var text = cm.getLine(i);
            var currHeadingLevel = text.search(/[^#]/);

            if (direction !== undefined) {
                if (currHeadingLevel <= 0) {
                    if (direction == 'bigger') {
                        text = '###### ' + text;
                    } else {
                        text = '# ' + text;
                    }
                } else if (currHeadingLevel == 6 && direction == 'smaller') {
                    text = text.substr(7);
                } else if (currHeadingLevel == 1 && direction == 'bigger') {
                    text = text.substr(2);
                } else {
                    if (direction == 'bigger') {
                        text = text.substr(1);
                    } else {
                        text = '#' + text;
                    }
                }
            } else {
                if (size == 1) {
                    if (currHeadingLevel <= 0) {
                        text = '# ' + text;
                    } else if (currHeadingLevel == size) {
                        text = text.substr(currHeadingLevel + 1);
                    } else {
                        text = '# ' + text.substr(currHeadingLevel + 1);
                    }
                } else if (size == 2) {
                    if (currHeadingLevel <= 0) {
                        text = '## ' + text;
                    } else if (currHeadingLevel == size) {
                        text = text.substr(currHeadingLevel + 1);
                    } else {
                        text = '## ' + text.substr(currHeadingLevel + 1);
                    }
                } else {
                    if (currHeadingLevel <= 0) {
                        text = '### ' + text;
                    } else if (currHeadingLevel == size) {
                        text = text.substr(currHeadingLevel + 1);
                    } else {
                        text = '### ' + text.substr(currHeadingLevel + 1);
                    }
                }
            }

            cm.replaceRange(text, {
                line: i,
                ch: 0,
            }, {
                line: i,
                ch: 99999999999999,
            });
        })(i);
    }
    cm.focus();
}


function _toggleLine(cm, name) {
    var listRegexp = /^(\s*)(\*|-|\+|\d*\.)(\s+)/;
    var whitespacesRegexp = /^\s*/;

    var stat = getState(cm);
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    var repl = {
        'quote': /^(\s*)>\s+/,
        'unordered-list': listRegexp,
        'ordered-list': listRegexp,
    };

    var _getChar = function (name, i) {
        var map = {
            'quote': '>',
            'unordered-list': '*',
            'ordered-list': '%%i.',
        };

        return map[name].replace('%%i', i);
    };

    var _checkChar = function (name, char) {
        var map = {
            'quote': '>',
            'unordered-list': '*',
            'ordered-list': '\\d+.',
        };
        var rt = new RegExp(map[name]);

        return char && rt.test(char);
    };

    var _toggle = function (name, text, untoggleOnly) {
        var arr = listRegexp.exec(text);
        var char = _getChar(name, line);
        if (arr !== null) {
            if (_checkChar(name, arr[2])) {
                char = '';
            }
            text = arr[1] + char + arr[3] + text.replace(whitespacesRegexp, '').replace(repl[name], '$1');
        } else if (untoggleOnly == false) {
            text = char + ' ' + text;
        }
        return text;
    };

    var line = 1;
    for (var i = startPoint.line; i <= endPoint.line; i++) {
        (function (i) {
            var text = cm.getLine(i);
            if (stat[name]) {
                text = text.replace(repl[name], '$1');
            } else {
                // If we're toggling unordered-list formatting, check if the current line
                // is part of an ordered-list, and if so, untoggle that first.
                // Workaround for https://github.com/Ionaru/easy-markdown-editor/issues/92
                if (name == 'unordered-list') {
                    text = _toggle('ordered-list', text, true);
                }
                text = _toggle(name, text, false);
                line += 1;
            }
            cm.replaceRange(text, {
                line: i,
                ch: 0,
            }, {
                line: i,
                ch: 99999999999999,
            });
        })(i);
    }
    cm.focus();
}

function _toggleBlock(editor, type, start_chars, end_chars) {
    end_chars = (typeof end_chars === 'undefined') ? start_chars : end_chars;
    var cm = editor.codemirror;
    var stat = getState(cm);

    var text;
    var start = start_chars;
    var end = end_chars;

    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');

    if (stat[type]) {
        text = cm.getLine(startPoint.line);
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        if (type == 'bold') {
            start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '');
            end = end.replace(/(\*\*|__)/, '');
        } else if (type == 'italic') {
            start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '');
            end = end.replace(/(\*|_)/, '');
        } else if (type == 'strikethrough') {
            start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, '');
            end = end.replace(/(\*\*|~~)/, '');
        }
        cm.replaceRange(start + end, {
            line: startPoint.line,
            ch: 0,
        }, {
            line: startPoint.line,
            ch: 99999999999999,
        });

        if (type == 'bold' || type == 'strikethrough') {
            startPoint.ch -= 2;
            if (startPoint !== endPoint) {
                endPoint.ch -= 2;
            }
        } else if (type == 'italic') {
            startPoint.ch -= 1;
            if (startPoint !== endPoint) {
                endPoint.ch -= 1;
            }
        }
    } else {
        text = cm.getSelection();
        if (type == 'bold') {
            text = text.split('**').join('');
            text = text.split('__').join('');
        } else if (type == 'italic') {
            text = text.split('*').join('');
            text = text.split('_').join('');
        } else if (type == 'strikethrough') {
            text = text.split('~~').join('');
        }
        cm.replaceSelection(start + text + end);

        startPoint.ch += start_chars.length;
        endPoint.ch = startPoint.ch + text.length;
    }

    cm.setSelection(startPoint, endPoint);
    cm.focus();
}

// Merge the properties of one object into another.
function _mergeProperties(target, source) {
    for (var property in source) {
        if (Object.prototype.hasOwnProperty.call(source, property)) {
            if (source[property] instanceof Array) {
                target[property] = source[property].concat(target[property] instanceof Array ? target[property] : []);
            } else if (
                source[property] !== null &&
                typeof source[property] === 'object' &&
                source[property].constructor === Object
            ) {
                target[property] = _mergeProperties(target[property] || {}, source[property]);
            } else {
                target[property] = source[property];
            }
        }
    }

    return target;
}

// Merge an arbitrary number of objects into one.
function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        target = _mergeProperties(target, arguments[i]);
    }

    return target;
}

var toolbarBuiltInButtons = {
    'bold': {
        name: 'bold',
        action: toggleBold,
        icon: '<svg class="octicon octicon-bold" viewBox="0 0 10 16" version="1.1" width="10" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M1 2h3.83c2.48 0 4.3.75 4.3 2.95 0 1.14-.63 2.23-1.67 2.61v.06c1.33.3 2.3 1.23 2.3 2.86 0 2.39-1.97 3.52-4.61 3.52H1V2zm3.66 4.95c1.67 0 2.38-.66 2.38-1.69 0-1.17-.78-1.61-2.34-1.61H3.13v3.3h1.53zm.27 5.39c1.77 0 2.75-.64 2.75-1.98 0-1.27-.95-1.81-2.75-1.81h-1.8v3.8h1.8v-.01z"></path></svg>',
        title: 'Bold',
        default: true,
    },
    'italic': {
        name: 'italic',
        action: toggleItalic,
        icon: '<svg class="octicon octicon-italic" viewBox="0 0 6 16" version="1.1" width="6" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M2.81 5h1.98L3 14H1l1.81-9zm.36-2.7c0-.7.58-1.3 1.33-1.3.56 0 1.13.38 1.13 1.03 0 .75-.59 1.3-1.33 1.3-.58 0-1.13-.38-1.13-1.03z"></path></svg>',
        title: 'Italic',
        default: true,
    },
    'heading': {
        name: 'heading',
        action: toggleHeadingSmaller,
        icon: '<svg class="octicon octicon-text-size" viewBox="0 0 18 16" version="1.1" width="18" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M13.62 9.08L12.1 3.66h-.06l-1.5 5.42h3.08zM5.7 10.13S4.68 6.52 4.53 6.02h-.08l-1.13 4.11H5.7zM17.31 14h-2.25l-.95-3.25h-4.07L9.09 14H6.84l-.69-2.33H2.87L2.17 14H0l3.3-9.59h2.5l2.17 6.34L10.86 2h2.52l3.94 12h-.01z"></path></svg>',
        title: 'Heading',
        default: true,
    },
    'separator-1': {
        name: 'separator-1',
    },
    'code': {
        name: 'code',
        action: toggleCodeBlock,
        icon: '<svg class="octicon octicon-code" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M9.5 3L8 4.5 11.5 8 8 11.5 9.5 13 14 8 9.5 3zm-5 0L0 8l4.5 5L6 11.5 2.5 8 6 4.5 4.5 3z"></path></svg>',
        title: 'Code',
        default: true,
    },
    'quote': {
        name: 'quote',
        action: toggleBlockquote,
        icon: '<svg class="octicon octicon-quote" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M6.16 3.5C3.73 5.06 2.55 6.67 2.55 9.36c.16-.05.3-.05.44-.05 1.27 0 2.5.86 2.5 2.41 0 1.61-1.03 2.61-2.5 2.61-1.9 0-2.99-1.52-2.99-4.25 0-3.8 1.75-6.53 5.02-8.42L6.16 3.5zm7 0c-2.43 1.56-3.61 3.17-3.61 5.86.16-.05.3-.05.44-.05 1.27 0 2.5.86 2.5 2.41 0 1.61-1.03 2.61-2.5 2.61-1.89 0-2.98-1.52-2.98-4.25 0-3.8 1.75-6.53 5.02-8.42l1.14 1.84h-.01z"></path></svg>',
        title: 'Quote',
        default: true,
    },
    'unordered-list': {
        name: 'unordered-list',
        action: toggleUnorderedList,
        icon: '<svg class="octicon octicon-list-unordered" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M2 13c0 .59 0 1-.59 1H.59C0 14 0 13.59 0 13c0-.59 0-1 .59-1h.81c.59 0 .59.41.59 1H2zm2.59-9h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1H4.59C4 2 4 2.41 4 3c0 .59 0 1 .59 1zM1.41 7H.59C0 7 0 7.41 0 8c0 .59 0 1 .59 1h.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm0-5H.59C0 2 0 2.41 0 3c0 .59 0 1 .59 1h.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm10 5H4.59C4 7 4 7.41 4 8c0 .59 0 1 .59 1h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01zm0 5H4.59C4 12 4 12.41 4 13c0 .59 0 1 .59 1h6.81c.59 0 .59-.41.59-1 0-.59 0-1-.59-1h.01z"></path></svg>',
        title: 'Generic List',
        default: true,
    },
    'ordered-list': {
        name: 'ordered-list',
        action: toggleOrderedList,
        icon: '<svg class="octicon octicon-list-ordered" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12.01 13c0 .59 0 1-.59 1H4.6c-.59 0-.59-.41-.59-1 0-.59 0-1 .59-1h6.81c.59 0 .59.41.59 1h.01zM4.6 4h6.81C12 4 12 3.59 12 3c0-.59 0-1-.59-1H4.6c-.59 0-.59.41-.59 1 0 .59 0 1 .59 1zm6.81 3H4.6c-.59 0-.59.41-.59 1 0 .59 0 1 .59 1h6.81C12 9 12 8.59 12 8c0-.59 0-1-.59-1zm-9.4-6h-.72c-.3.19-.58.25-1.03.34V2h.75v2.14H.17V5h2.84v-.86h-1V1zm.392 8.12c-.129 0-.592.04-.802.07.53-.56 1.14-1.25 1.14-1.89C2.72 6.52 2.18 6 1.38 6c-.59 0-.97.2-1.38.64l.58.58c.19-.19.38-.38.64-.38.28 0 .48.16.48.52 0 .53-.77 1.2-1.7 2.06V10h3v-.88h-.598zm-.222 3.79v-.03c.44-.19.64-.47.64-.86 0-.7-.56-1.11-1.44-1.11-.48 0-.89.19-1.28.52l.55.64c.25-.2.44-.31.69-.31.27 0 .42.13.42.36 0 .27-.2.44-.86.44v.75c.83 0 .98.17.98.47 0 .25-.23.38-.58.38-.28 0-.56-.14-.81-.38l-.48.66c.3.36.77.56 1.41.56.83 0 1.53-.41 1.53-1.16 0-.5-.31-.81-.77-.94v.01z"></path></svg>',
        title: 'Numbered List',
        default: true,
    },
    'separator-2': {
        name: 'separator-2',
    },
    'link': {
        name: 'link',
        action: drawLink,
        icon: '<svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>',
        title: 'Create Link',
        default: true,
    },
    'image': {
        name: 'image',
        action: drawImage,
        icon: '<svg class="octicon octicon-file-media" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M6 5h2v2H6V5zm6-.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v11l3-5 2 4 2-2 3 3V5z"></path></svg>',
        title: 'Insert Image',
        default: true,
    },
    'table': {
        name: 'table',
        action: drawTable,
        icon: '<svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 100 1.5h12.5a.75.75 0 100-1.5H1.75z"></path></svg>',
        title: 'Insert Table',
        default: true,
    },
    'horizontal-rule': {
        name: 'horizontal-rule',
        action: drawHorizontalRule,
        icon: '<svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M0 7.75A.75.75 0 01.75 7h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 7.75z"></path></svg>',
        title: 'Insert Horizontal Line',
        default: true,
    },
    'separator-3': {
        name: 'separator-3',
    },
    'guide': {
        name: 'guide',
        action: 'https://www.markdownguide.org/basic-syntax/',
        icon: '<svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.613.613 0 019 6.25c0 .177-.04.264-.077.318a.956.956 0 01-.277.245c-.076.051-.158.1-.258.161l-.007.004a7.728 7.728 0 00-.313.195 2.416 2.416 0 00-.692.661.75.75 0 001.248.832.956.956 0 01.276-.245 6.3 6.3 0 01.26-.16l.006-.004c.093-.057.204-.123.313-.195.222-.149.487-.355.692-.662.214-.32.329-.702.329-1.15 0-.76-.36-1.348-.863-1.725A2.76 2.76 0 008 4c-.631 0-1.155.16-1.572.438-.413.276-.68.638-.849.977a.75.75 0 101.342.67z"></path></svg>',
        noDisable: true,
        title: 'Markdown Guide',
        default: true,
    },
    'separator-4': {
        name: 'separator-5',
    },
    'undo': {
        name: 'undo',
        action: undo,
        icon: '<svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"></path></svg>',
        noDisable: true,
        title: 'Undo',
    },
    'redo': {
        name: 'redo',
        action: redo,
        icon: '<svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"></path></svg>',
        noDisable: true,
        title: 'Redo',
    },
};

var insertTexts = {
    link: ['[', '](#url#)'],
    image: ['![](', '#url#)'],
    table: ['', '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n'],
    horizontalRule: ['', '\n-----\n'],
};

var promptTexts = {
    link: 'URL for the link:',
    image: 'URL of the image:',
};

var blockStyles = {
    'bold': '**',
    'code': '```',
    'italic': '*',
};

/**
 * Interface of EasyMDE.
 */
function EasyMDE(options) {
    // Handle options parameter
    options = options || {};

    // Used later to refer to it"s parent
    options.parent = this;

    // Find the textarea to use
    if (options.element) {
        this.element = options.element;
    } else if (options.element === null) {
        // This means that the element option was specified, but no element was found
        console.log('EasyMDE: Error. No element was found.');
        return;
    }


    // Handle toolbar
    if (options.toolbar === undefined) {
        // Initialize
        options.toolbar = [];


        // Loop over the built in buttons, to get the preferred order
        for (var key in toolbarBuiltInButtons) {
            if (Object.prototype.hasOwnProperty.call(toolbarBuiltInButtons, key)) {
                if (key.indexOf('separator-') != -1) {
                    options.toolbar.push('|');
                }

                if (toolbarBuiltInButtons[key].default === true || (options.showIcons && options.showIcons.constructor === Array && options.showIcons.indexOf(key) != -1)) {
                    options.toolbar.push(key);
                }
            }
        }
    }


    // Set default options for parsing config
    options.parsingConfig = extend({
        highlightFormatting: true, // needed for toggleCodeBlock to detect types of code
    }, options.parsingConfig || {});


    // Merging the insertTexts, with the given options
    options.insertTexts = extend({}, insertTexts, options.insertTexts || {});


    // Merging the promptTexts, with the given options
    options.promptTexts = extend({}, promptTexts, options.promptTexts || {});


    // Merging the blockStyles, with the given options
    options.blockStyles = extend({}, blockStyles, options.blockStyles || {});

    // Merging the shortcuts, with the given options
    options.shortcuts = extend({}, shortcuts, options.shortcuts || {});

    options.maxHeight = options.maxHeight || undefined;

    if (typeof options.maxHeight !== 'undefined') {
        // Min and max height are equal if maxHeight is set
        options.minHeight = options.maxHeight;
    } else {
        options.minHeight = options.minHeight || '300px';
    }

    options.errorCallback = options.errorCallback || function (errorMessage) {
        alert(errorMessage);
    };

    // If overlay mode is specified and combine is not provided, default it to true
    if (options.overlayMode && options.overlayMode.combine === undefined) {
      options.overlayMode.combine = true;
    }

    // Update this options
    this.options = options;


    // Auto render
    this.render();
}

/**
 * Render editor to the given element.
 */
EasyMDE.prototype.render = function (el) {
    if (!el) {
        el = this.element || document.getElementsByTagName('textarea')[0];
    }

    if (this._rendered && this._rendered === el) {
        // Already rendered.
        return;
    }

    this.element = el;
    var options = this.options;

    var self = this;
    var keyMaps = {};

    for (var key in options.shortcuts) {
        // null stands for "do not bind this command"
        if (options.shortcuts[key] !== null && bindings[key] !== null) {
            (function (key) {
                keyMaps[fixShortcut(options.shortcuts[key])] = function () {
                    var action = bindings[key];
                    if (typeof action === 'function') {
                        action(self);
                    } else if (typeof action === 'string') {
                        window.open(action, '_blank');
                    }
                };
            })(key);
        }
    }

    keyMaps['Enter'] = 'newlineAndIndentContinueMarkdownList';
    keyMaps['Tab'] = 'tabAndIndentMarkdownList';
    keyMaps['Shift-Tab'] = 'shiftTabAndUnindentMarkdownList';

    var mode, backdrop;

    // CodeMirror overlay mode
    if (options.overlayMode) {
      CodeMirror.defineMode('overlay-mode', function(config) {
        return CodeMirror.overlayMode(CodeMirror.getMode(config, 'gfm'), options.overlayMode.mode, options.overlayMode.combine);
      });

      mode = 'overlay-mode';
      backdrop = options.parsingConfig;
      backdrop.gitHubSpice = false;
      backdrop.name = 'gfm';
    } else {
        mode = options.parsingConfig;
        mode.name = 'gfm';
        mode.gitHubSpice = false;
    }

    // eslint-disable-next-line no-unused-vars
    function configureMouse(cm, repeat, event) {
        return {
            addNew: false,
        };
    }

    this.codemirror = CodeMirror.fromTextArea(el, {
        mode: mode,
        backdrop: backdrop,
        theme: (options.theme != undefined) ? options.theme : 'easymde',
        tabSize: (options.tabSize != undefined) ? options.tabSize : 2,
        indentUnit: (options.tabSize != undefined) ? options.tabSize : 2,
        indentWithTabs: (options.indentWithTabs === false) ? false : true,
        lineNumbers: (options.lineNumbers === true) ? true : false,
        autofocus: (options.autofocus === true) ? true : false,
        extraKeys: keyMaps,
        lineWrapping: (options.lineWrapping === false) ? false : true,
        allowDropFileTypes: ['text/plain'],
        placeholder: options.placeholder || el.getAttribute('placeholder') || '',
        styleSelectedText: (options.styleSelectedText != undefined) ? options.styleSelectedText : !isMobile(),
        scrollbarStyle: (options.scrollbarStyle != undefined) ? options.scrollbarStyle : 'native',
        configureMouse: configureMouse,
        inputStyle: (options.inputStyle != undefined) ? options.inputStyle : isMobile() ? 'contenteditable' : 'textarea',
        spellcheck: (options.nativeSpellcheck != undefined) ? options.nativeSpellcheck : true,
    });

    this.codemirror.getScrollerElement().style.minHeight = options.minHeight;

    if (typeof options.maxHeight !== 'undefined') {
        this.codemirror.getScrollerElement().style.height = options.maxHeight;
    }

    if (options.forceSync === true) {
        var cm = this.codemirror;
        cm.on('change', function () {
            cm.save();
        });
    }

    this.gui = {};

    // Wrap Codemirror with container before create toolbar, etc,
    // to use with sideBySideFullscreen option.
    var easyMDEContainer = document.createElement('div');
    easyMDEContainer.classList.add('EasyMDEContainer');
    var cmWrapper = this.codemirror.getWrapperElement();
    cmWrapper.parentNode.insertBefore(easyMDEContainer, cmWrapper);
    easyMDEContainer.appendChild(cmWrapper);

    if (options.toolbar !== false) {
        this.gui.toolbar = this.createToolbar();
    }

    this._rendered = this.element;

    // Fixes CodeMirror bug (#344)
    var temp_cm = this.codemirror;
    setTimeout(function () {
        temp_cm.refresh();
    }.bind(temp_cm), 0);
};

EasyMDE.prototype.createToolbar = function (items) {
    items = items || this.options.toolbar;

    if (!items || items.length === 0) {
        return;
    }
    var i;
    for (i = 0; i < items.length; i++) {
        if (toolbarBuiltInButtons[items[i]] != undefined) {
            items[i] = toolbarBuiltInButtons[items[i]];
        }
    }

    var bar = document.createElement('div');
    bar.className = 'editor-toolbar';

    var self = this;

    var toolbarData = {};
    self.toolbar = items;

    for (i = 0; i < items.length; i++) {
        if (items[i].name == 'guide' && self.options.toolbarGuideIcon === false)
            continue;

        if (self.options.hideIcons && self.options.hideIcons.indexOf(items[i].name) != -1)
            continue;

        // Don't include trailing separators
        if (items[i] === '|') {
            var nonSeparatorIconsFollow = false;

            for (var x = (i + 1); x < items.length; x++) {
                if (items[x] !== '|' && (!self.options.hideIcons || self.options.hideIcons.indexOf(items[x].name) == -1)) {
                    nonSeparatorIconsFollow = true;
                }
            }

            if (!nonSeparatorIconsFollow)
                continue;
        }


        // Create the icon and append to the toolbar
        (function (item) {
            var el;
            if (item === '|') {
                el = createSep();
            } else {
                el = createToolbarButton(item, true, self.options.toolbarTips, self.options.shortcuts, 'button', self);
            }


            toolbarData[item.name || item] = el;
            bar.appendChild(el);
        })(items[i]);
    }

    self.toolbar_div = bar;
    self.toolbarElements = toolbarData;

    var cm = this.codemirror;
    cm.on('cursorActivity', function () {
        var stat = getState(cm);

        for (var key in toolbarData) {
            (function (key) {
                var el = toolbarData[key];
                if (stat[key]) {
                    el.className += ' active';
                } else {
                    el.className = el.className.replace(/\s*active\s*/g, '');
                }
            })(key);
        }
    });

    var cmWrapper = cm.getWrapperElement();
    cmWrapper.parentNode.insertBefore(bar, cmWrapper);
    return bar;
};

/**
 * Get or set the text content.
 */
EasyMDE.prototype.value = function (val) {
    var cm = this.codemirror;
    if (val === undefined) {
        return cm.getValue();
    } else {
        cm.getDoc().setValue(val);
        return this;
    }
};


/**
 * Bind static methods for exports.
 */
EasyMDE.toggleBold = toggleBold;
EasyMDE.toggleItalic = toggleItalic;
EasyMDE.toggleStrikethrough = toggleStrikethrough;
EasyMDE.toggleBlockquote = toggleBlockquote;
EasyMDE.toggleHeadingSmaller = toggleHeadingSmaller;
EasyMDE.toggleHeadingBigger = toggleHeadingBigger;
EasyMDE.toggleHeading1 = toggleHeading1;
EasyMDE.toggleHeading2 = toggleHeading2;
EasyMDE.toggleHeading3 = toggleHeading3;
EasyMDE.toggleCodeBlock = toggleCodeBlock;
EasyMDE.toggleUnorderedList = toggleUnorderedList;
EasyMDE.toggleOrderedList = toggleOrderedList;
EasyMDE.drawLink = drawLink;
EasyMDE.drawImage = drawImage;
EasyMDE.drawTable = drawTable;
EasyMDE.drawHorizontalRule = drawHorizontalRule;
EasyMDE.undo = undo;
EasyMDE.redo = redo;

/**
 * Bind instance methods for exports.
 */
EasyMDE.prototype.toggleBold = function () {
    toggleBold(this);
};
EasyMDE.prototype.toggleItalic = function () {
    toggleItalic(this);
};
EasyMDE.prototype.toggleStrikethrough = function () {
    toggleStrikethrough(this);
};
EasyMDE.prototype.toggleBlockquote = function () {
    toggleBlockquote(this);
};
EasyMDE.prototype.toggleHeadingSmaller = function () {
    toggleHeadingSmaller(this);
};
EasyMDE.prototype.toggleHeadingBigger = function () {
    toggleHeadingBigger(this);
};
EasyMDE.prototype.toggleHeading1 = function () {
    toggleHeading1(this);
};
EasyMDE.prototype.toggleHeading2 = function () {
    toggleHeading2(this);
};
EasyMDE.prototype.toggleHeading3 = function () {
    toggleHeading3(this);
};
EasyMDE.prototype.toggleCodeBlock = function () {
    toggleCodeBlock(this);
};
EasyMDE.prototype.toggleUnorderedList = function () {
    toggleUnorderedList(this);
};
EasyMDE.prototype.toggleOrderedList = function () {
    toggleOrderedList(this);
};
EasyMDE.prototype.drawLink = function () {
    drawLink(this);
};
EasyMDE.prototype.drawImage = function () {
    drawImage(this);
};
EasyMDE.prototype.drawTable = function () {
    drawTable(this);
};
EasyMDE.prototype.drawHorizontalRule = function () {
    drawHorizontalRule(this);
};
EasyMDE.prototype.undo = function () {
    undo(this);
};
EasyMDE.prototype.redo = function () {
    redo(this);
};

EasyMDE.prototype.getState = function () {
    var cm = this.codemirror;

    return getState(cm);
};

module.exports = EasyMDE;
