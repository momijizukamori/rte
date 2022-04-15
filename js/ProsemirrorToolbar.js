import { SimpleToolbar } from './SimpleToolbar.js';
import { Plugin } from 'prosemirror-state';
import { toggleMark } from 'prosemirror-commands';

class ProsemirrorToolbar extends SimpleToolbar {
    constructor(items, label, editorView, opts) {
        super(items, label, editorView.dom.id, opts);
        this.editorView = editorView;
        this.update();

    }
    activateItem(item) {
        item.action(this.editorView.state, this.editorView.dispatch, this.editorView);
    }

    update() {
        this.navItems.forEach((item) => {
            if (item.hasOwnProperty("enabled") && item.enabled) {
                item.enabled(this.editorView.state, null, this.editorView);
            } else if (item.hasOwnProperty("action") && item.action) {
                if (item.action(this.editorView.state)) {
                    item.enabled();
                } else { item.disable(); }
            }
            if (item.hasOwnProperty("active") && item.active) {
                item.active(this.editorView.state, null, this.editorView);

            }
        });
    }


}

export function toolbarPlugin(items) {
    return new Plugin({
        view(editorView) {
            let toolbarView = new ProsemirrorToolbar(items, "toolbar", editorView);
            editorView.dom.parentNode.insertBefore(toolbarView.domNode, editorView.dom);
            return toolbarView;
        }
    });
}


function isMarkActive(mark) {
    return function(state) {
        let docMarks = state.storedMarks || state.selection.$head.marks();
        return mark.isInSet(docMarks);
    };
}

export function isNodeActive(node) {
    return function(state) {
        let { doc, selection } = state;
        if (selection.empty) {
            let pos = selection.$head;
            let { depth } = pos;
            for (i = 0; i <= depth; i++) {
                let parent = pos.node(i);
                if (parent.type == node) {
                    return true;
                }
            }
        }
        return false;
    };
}

export function isNodeAttrActive(node, attr, val) {
    return function(state) {
        let { doc, selection } = state;
        if (selection.empty) {
            let pos = selection.$head;
            let { depth } = pos;
            for (let i = 0; i <= depth; i++) {
                let parent = pos.node(i);
                if (parent.type == node && parent.attrs[attr] == val) {
                    return true;
                }
            }
        }
        return false;
    };
}

export function isAttrActive(attr, val) {
    return function(state) {
        let { doc, selection } = state;
        let flag = false;
        if (selection.empty) {
            let pos = selection.$head;
            let { depth } = pos;
            for (let i = 0; i <= depth; i++) {
                let parent = pos.node(i);
                if (parent.attrs[attr] == val) {
                    console.log(parent);
                    flag = true;
                }
            }
        }
        return flag;
    };
}

export function markItem(mark, label, icon) {
    const value = label.toLowerCase().replace(/ /, "-");
    const finalIcon = icon || value;

    return {
        icon: finalIcon,
        value: value,
        label: label,
        action: toggleMark(mark),
        active: isMarkActive(mark)
    };
}