import { wrapInList, splitListItem} from "prosemirror-schema-list";
import { undo, redo} from "prosemirror-history";
import { setBlockType, toggleMark, wrapIn, exitCode, chainCommands, liftEmptyBlock, splitBlock}  from "prosemirror-commands";
import {mySchema} from './fullSchema.js';
import {toggleUser, createBlock, insertCut} from './utils.js';
import { Selection, TextSelection } from "prosemirror-state";


let lastEnterTime = Date.now();

const modEnter = chainCommands(exitCode, liftEmptyBlock, splitBlock, function (state, dispatch) {
    dispatch(state.tr.replaceSelectionWith(mySchema.nodes.hard_break.create()).scrollIntoView());
    return true;
  });

function doubleEnter(state, dispatch) {
  const currentTime = Date.now();
  if (currentTime - lastEnterTime < 300) {
    // we have double-tap

    console.log("double enter!");
    let {selection, tr, doc} = state;
    let pos = selection.$head;

    if ((pos.depth > 1 || (pos.depth == 1 && pos.parent.type != mySchema.nodes.text_wrapper)) && 
      (pos.parentOffset + 2 == pos.parent.nodeSize)) {
      console.log("in wrapper");
      // We're at the end of a block
      // Remove the <br> created by the first enter
      tr = tr.delete(pos.pos - 1, pos.pos);
      let newPos = tr.selection.$head;

      let afterPos = pos.depth == 1 ? newPos.after(pos.depth) + 1 : newPos.after(pos.depth - 1) + 1;

      if (tr.doc.nodeSize - afterPos < 2) {
        // We're at the end of the doc, and we have to insert a new text node first
        tr = tr.replaceWith(afterPos - 1, afterPos - 1, mySchema.nodes.text_wrapper.createAndFill());
      }
      let newSelect = Selection.near(tr.doc.resolve(afterPos), 1);
      dispatch(tr.setSelection(newSelect));
      return true;
    }
    chainCommands(liftEmptyBlock, splitBlock)
    return true;
  } else {
    lastEnterTime = currentTime;
    return false;
  }
}
  
const enter = chainCommands(doubleEnter, splitListItem(mySchema.nodes.list_item), function (state, dispatch) {
  dispatch(state.tr.replaceSelectionWith(mySchema.nodes.hard_break.create()).scrollIntoView());
  return true;
});

export const keys = {
    "Enter": enter,
    "Mod-z": undo,
    "Shift-Mod-z": redo,
    "Mod-y": redo,
    "Mod-b": toggleMark(mySchema.marks.strong),
    "Mod-B": toggleMark(mySchema.marks.strong),
    "Mod-i": toggleMark(mySchema.marks.em),
    "Mod-I": toggleMark(mySchema.marks.em),
    "Mod-u": toggleMark(mySchema.marks.underline),
    "Mod-U": toggleMark(mySchema.marks.underline),
    "Mod-s": toggleMark(mySchema.marks.strikethrough),
    "Mod-S": toggleMark(mySchema.marks.strikethrough),
    "Mod-`": toggleMark(mySchema.marks.code),
    "Mod-e": toggleUser,
    "Mod-c": insertCut,
    "Shift-Ctrl-1": createBlock(mySchema.nodes.heading, {level : 1}),
    "Shift-Ctrl-2": createBlock(mySchema.nodes.heading, {level : 2}),
    "Shift-Ctrl-3": createBlock(mySchema.nodes.heading, {level : 3}),
    "Shift-Ctrl-4": createBlock(mySchema.nodes.heading, {level : 4}),
    "Shift-Ctrl-5": createBlock(mySchema.nodes.heading, {level : 5}),
    "Shift-Ctrl-6": createBlock(mySchema.nodes.heading, {level : 6}),
    "Shift-Ctrl-8": wrapInList(mySchema.nodes.bullet_list),
    "Shift-Ctrl-9": wrapInList(mySchema.nodes.ordered_list),
    "Ctrl->": wrapIn(mySchema.nodes.blockquote),
    "Mod-~": function (state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(mySchema.nodes.hr.create()).scrollIntoView());
      return true;
    },
    "Mod-Enter": modEnter,
    "Shift-Enter": modEnter,
    "Ctrl-Enter": modEnter,
  };