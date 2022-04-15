import {blockWithWrapper, mySchema} from "./fullSchema.js";
import { NodeSelection, TextSelection } from 'prosemirror-state';

export function toggleUser(state, dispatch) {
    let {doc, selection} = state;
    let {from, to} = selection;
    var username = null;
    if (selection.empty) {
      username = prompt("Username:", "");
    } else {
      doc.nodesBetween(from, to, (node, position) => {
        // we only processing text, must be a selection
        if (!node.isTextblock) return;
        // grab the content
        const substringFrom = Math.max(0, from - position - 1);
        const substringTo = Math.max(0, to - position - 1);
        const textSelect = node.textContent.substring(substringFrom, substringTo);
        let badChars = textSelect.match(/[^\w\d]/);
        if (badChars) return; // usernames can only be alphanumeric, no spaces.
        username = textSelect;
      });
    }
    if (username) {
    let user = mySchema.nodes.username.create({name: username});
    return dispatch(state.tr.replaceSelectionWith(user));
    } else {return false;}
  }

export function createStyledNode(type, style) {
  return function(state, dispatch) {
     let {doc, selection, tr} = state;
     let {from, to} = selection;
     let validAttr = canApplyNodeStyle('align')(state);
     console.log(validAttr);
     if (validAttr) {
      if (dispatch) {
        doc.nodesBetween(from - 1, to, (node, pos) => { 
          let styles = {...node.attrs, ...style};
          tr.setNodeMarkup(pos, undefined, styles); return false; });
        return dispatch(tr);
      }
     } else {
       return createBlock(type, style) (state, dispatch);
     }
  }
}

export function createBlock(type, attrs) {
  return function(state, dispatch) {
    let {selection, doc} = state;
    let text;
    let pos = selection.to + 1;
 
    if (selection.empty) {
        text = mySchema.text(" ");
    } else {
      text = doc.slice(selection.from, selection.to).content;
    }

    if (blockWithWrapper.includes(type)) {
      text = mySchema.nodes.text_wrapper.createAndFill({}, text);
    }
    let newNode = type.createAndFill(attrs, text);
    let tr = state.tr.replaceSelectionWith(newNode);
    let resolved = tr.doc.resolve(tr.selection.to - 1);
    let select = TextSelection.near(resolved, -1);
    if (dispatch) {
       return dispatch(tr.setSelection(select));
    }
  }
}

export function canAddNode(type) {
  return function(state) {
    let {doc, selection} = state;
    let {$anchor, $head} = selection;

    return doc.canReplaceWith($anchor.index(0), $head.index(0), mySchema.nodes[type]);
  }
}

export function canApplyNodeStyle(attr) {
  return function(state) {
      let {doc, selection} = state;
      let {from, to} = selection;
      let canApply = true;
      if (selection.empty) {
          let pos = selection.$head;
          let { depth } = pos;
          for (let i = 0; i <= depth; i++) {
              let parent = pos.node(i);
              if (parent.attrs[attr]) {
                  return true;
              }
          }
      } else {
        doc.nodesBetween(from - 1, to, (node) => {
          if (!node.type.attrs[attr]) {
            canApply = false;
          }
          return false; 
        });
      }
        return canApply;
      };
  }


export function insertCut(state, dispatch) {
  let {doc, selection} = state;
  let cutText = prompt("Cut Text", ""); 
  let attrs = cutText ? {text: cutText} : null;
  var cutNode;
  if (selection.empty) {
    let text = mySchema.text(" ");
    let textNode = mySchema.nodes.text_wrapper.create(null, text);
    cutNode = mySchema.nodes.cut.create(attrs, textNode);
  } else {
    let text = doc.slice(selection.from, selection.to).content;
    let textNode = mySchema.nodes.text_wrapper.createAndFill({}, text);
    cutNode = mySchema.nodes.cut.create(attrs, textNode);
  }
  
  let tr = state.tr.replaceSelectionWith(cutNode);
  let pos = tr.selection.to - 3;
  let resolved = tr.doc.resolve(pos);
  
  return dispatch(tr.setSelection(TextSelection.near(resolved)));


}

export function makeList(type) {
  return function(state, dispatch) {
    let {doc, selection, tr} = state;
    console.log(selection);
    if (selection.empty) {
      let text = mySchema.text(" ");
      let textNode = mySchema.nodes.text_wrapper.create(null, text);
      tr = tr.replaceSelectionWith(textNode);
      console.log(textNode.nodeSize);
    } else {
      console.log(selection.content().content);
    }
    return true;
  }
}