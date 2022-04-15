import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DOMParser, DOMSerializer, Schema } from "prosemirror-model";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import { schema as BaseSchema } from "prosemirror-schema-basic";
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor";
const { Plugin, TextSelection } = require("prosemirror-state");
const { Decoration, DecorationSet } = require("prosemirror-view");

import { tableEditing, columnResizing, fixTables } from "prosemirror-tables";

import { mySchema } from "./fullSchema.js";
import { keys } from "./keyCommands.js";
import { menu } from "./rteToolbar.js";
import { ResizeView } from "./imageView.js";
import { placeholderPlugin, startImageUpload } from './imagePlugin.js';
import { ExportView } from "./exportPlugin.js";
import {initCutPlugin} from "./cutView.js";

let exportPlugin = new Plugin({
    view(editorView) {
        return new ExportView(editorView, document.querySelector('textarea[name=event]'));
    }
});

var rte = null;

let selectPlugin = new Plugin({
    props: {
        decorations(state) {
            let { doc, selection } = state;
            let { from, to } = selection;
            if (from != to) {
                let deco = Decoration.inline(from, to, { class: "selected" });
                return DecorationSet.create(doc, [deco]);
            } else {
                return DecorationSet.empty;

            }
        }
    },
});


function updateUser(value) {
    return function(state, dispatch) {
        let { doc, selection } = state;
        let { from, to } = selection;
        let trx = state.tr;
        if (dispatch) {
            doc.nodesBetween(from - 1, to, (node, pos) => {
                let styles = { ...node.attrs, ...style };
                trx.setNodeMarkup(pos, node.type, styles);
                return false;
            });
            return dispatch(trx);
        }
        return true;
    };
}

function isNodeSelected(selection) {
    const { anchor, head } = selection;
    let selectSize = select.to - select.from;
    if (anchor.parent.eq(head.parent) && anchor.parent.content.size == selectSize) {
        return anchor.parent;
    } else {
        return false;
    }
}



function setupRTE() {

  // Grab any existing text in the entry textarea and convert it to a
  // format ProseMirror likes (close <user> tags, replace newlines with hard breaks)
    let domStr = document.querySelector("textarea[name=event]").value;
    domStr = domStr.replaceAll(/(<user .*?>)/g, "$1</user>");
    domStr = domStr.replaceAll(/\n/g, "<br>");
    let domDoc = document.createRange().createContextualFragment(domStr);

    let doc = DOMParser.fromSchema(mySchema).parse(domDoc);
    let state = EditorState.create({
        doc: doc,
        plugins: [
            dropCursor(),
            gapCursor(),
            keymap(keys),
            keymap(baseKeymap),
            history(),

            initCutPlugin,
            menu,
            selectPlugin,
            placeholderPlugin,
            tableEditing(),
            columnResizing(),
            exportPlugin
        ],
    });
    let fix = fixTables(state);
    if (fix) state = state.apply(fix.setMeta("addToHistory", false));

    let view = window.view = new EditorView(document.querySelector("#rte"), {
        state: state,
        nodeViews: {
            image(node, view, getPos) { return new ResizeView(node, view, getPos, 'img'); },
        //     //cut(node, view, getPos) {return new CutView(node, view, getPos);}
        //     //embed(node, view, getPos) { return new ResizeView(node, view, getPos, 'iframe'); }
        //     // username(node, view, getPos) { console.log(node); return new UserView(node, view, getPos) }
        }
    });

    document.execCommand("enableObjectResizing", false, false);
    document.execCommand("enableInlineTableEditing", false, false);

    document.querySelector("textarea[name=event]").classList = "rte-enabled";
    document.querySelector("#rte").style.display = "";

    document.getElementById("imageselector").addEventListener("change", (e) => {
        if (
            view.state.selection.$from.parent.inlineContent &&
            e.target.files.length
        ) {
            const file = e.target.files[0];
            startImageUpload(
                view,
                file,
                mySchema
            );
        }
    });
    return view;
}

// Set up RTE on load if it's set as default format
if (document.querySelector('#editor').value == 'rte0') {
  rte = setupRTE();
}

// Watch the format select for changes, and add or destroy the RTE as necessary
document.querySelector('#editor').addEventListener('change', e => {
  let format = e.target.value;
  if (format == 'rte0') {
    rte = setupRTE();
  }
  if (format != 'rte0' && rte) {
    rte.destroy();
    document.querySelector("#rte").style.display = "none";
    document.querySelector("textarea[name=event]").classList = "";
  }
})
