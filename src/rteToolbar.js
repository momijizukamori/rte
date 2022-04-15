import {mySchema, blockWithWrapper} from './fullSchema.js';
import { undo, redo} from "prosemirror-history";
import { lift, setBlockType, toggleMark, wrapIn}  from "prosemirror-commands";
import {addColumnAfter, addColumnBefore, deleteColumn, addRowAfter, addRowBefore, deleteRow,
    mergeCells, splitCell, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell,
    deleteTable}  from "prosemirror-tables";
import {toolbarPlugin, markItem, isNodeAttrActive, isAttrActive} from '../js/ProsemirrorToolbar.js';
import {wrapInList} from "prosemirror-schema-list";
import {toggleUser, createStyledNode, makeList, canAddNode, createBlock, insertCut} from './utils.js';
import { NodeSelection, TextSelection } from 'prosemirror-state';
import { NodeRange } from 'prosemirror-model';
import { Transform, findWrapping } from 'prosemirror-transform';
import {mdiConsoleLine, 
  mdiFormatAlignCenter, 
  mdiFormatAlignRight, 
  mdiFormatAlignLeft, 
  mdiFormatStrikethroughVariant,
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatUnderline,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiFormatPageBreak,
  mdiTable,
} from '@mdi/js'; 


function insertLink(state, dispatch) {
    let {doc, selection} = state;
  
    if (selection.empty) {
        let text = prompt("Link Text", "");
        let href = prompt("Link Location", "");
  
        let tr = state.tr.setStoredMarks([mySchema.marks.link.create({href: href})]);
  
        return dispatch(tr.insertText(text));
  
    } else {
        let href = prompt("Link Location", "");
        return toggleMark(mySchema.marks.link, {href: href})(state, dispatch);
    }
  }

  const insertImage = (state, _, view) =>{
    var ref = state.selection;
    var from = ref.from;
    var to = ref.to;
    var attrs = null;
    if (state.selection instanceof NodeSelection && state.selection.node.type == mySchema.nodes.image)
      { attrs = state.selection.node.attrs; }
      document.getElementById("imageselector").click();
  };
  
  function insertEmbed(state, dispatch) {
    let {doc, selection} = state;
    let {from, to} = selection;
  
      let embedStr = prompt("Embed Code", "");
      let embedNode = document.createRange().createContextualFragment(embedStr).querySelector('iframe');
      if (embedNode) {
        let attrs = {
          src: embedNode.getAttribute("src"),
          title: embedNode.getAttribute("title"),
          alt: embedNode.getAttribute("alt"),
          width: embedNode.getAttribute("width"),
          height: embedNode.getAttribute("height"),
        };
        let embed = mySchema.nodes.embed.create(attrs);
        return dispatch(state.tr.replaceWith(from, to, embed));
        } else {return false;}
  
  }

  function nodeEq(node, type, attrs) {
    let flag = false;
    flag = node.type == type;

    if (attrs && flag) {
      flag = Object.keys(attrs).every(key => {
        return node.attrs[key] == attrs[key];
      });
    }
    return flag;
  }

  function isBlockActive(type, attrs) {
    return function(state) {
      let {selection, doc} = state;
      if(selection.$head.parent == selection.$anchor.parent) {
        if (blockWithWrapper.includes(type)) {
          let gparent = selection.$head.node(-1);
          return nodeEq(gparent, type, attrs);
        } else {
          let parent = selection.$head.parent;
          return nodeEq(parent, type, attrs);
        }
      }
    }
  }

  export function blockItem(type, attrs, label, icon) {
    const value = label.toLowerCase().replace(/ /, "-");
    const finalIcon = icon || value;

    return {
        icon: finalIcon,
        value: value,
        label: label,
        action: createBlock(type, attrs),
        active: isBlockActive(type, attrs)
    };
}

export const menu = toolbarPlugin([
    markItem(mySchema.marks.strong, "Bold"),
    markItem(mySchema.marks.em, "Italic"),
    markItem(mySchema.marks.underline, "Underline"),
    markItem(mySchema.marks.strikethrough, "Strikethrough"),
    markItem(mySchema.marks.code, "Code", "terminal"),
    {action: wrapInList(mySchema.nodes.bullet_list), label: 'Bullet List', icon: 'list-ul', value: 'bullet-list', enabled: true},
    {action: wrapInList(mySchema.nodes.ordered_list), label: 'Ordered List', icon: 'list-ol', value: 'ordered-list'},
    {...blockItem(mySchema.nodes.blockquote, undefined, 'Blockquote', 'quote-left'), enabled: true},
    {action: insertImage, label: 'Insert image', icon: 'image', value: 'image', enabled: true},
    {action: insertEmbed, label: 'Insert embed', icon: 'video', value: 'embed', enabled: true},
    {action: insertLink, label: 'Insert link', icon: 'link', value: 'link', enabled: true},
    {action: toggleUser, label: 'Insert user', icon: 'user', value: 'user', enabled: true },
    {action: insertCut, label: 'Insert cut', icon: 'cut', value: 'cut', enabled: true },
    {type: 'buttongroup', label: 'alignment', items: [
      {action: createStyledNode(mySchema.nodes.div, {align: "left"}), label: 'left', icon: 'align-left', value: 'left', active: isAttrActive("align", "left"), default_item: true, enabled: canAddNode('div')},
      {action: createStyledNode(mySchema.nodes.div, {align: "center"}), label: 'center', icon: 'align-center', value: 'center', active: isAttrActive("align", "center"), enabled: canAddNode('div')},
      {action: createStyledNode(mySchema.nodes.div, {align: "right"}), label: 'right', icon: 'align-right', value: 'right', active: isAttrActive("align", "right"), enabled: canAddNode('div')},
      {action: createStyledNode(mySchema.nodes.div, {align: "justify"}), label: 'justify', icon: 'align-justify', value: 'justify', active: isAttrActive("align", "justify"), enabled: canAddNode('div')}
    ]},
    {type: 'dropdown', label: 'heading', id: 'heading', items: [
      {...blockItem(mySchema.nodes.heading, {level : 1}, 'Heading 1', 'heading'), default_item: true},
      blockItem(mySchema.nodes.heading, {level : 2}, 'Heading 2', 'heading'),
      blockItem(mySchema.nodes.heading, {level : 3}, 'Heading 3', 'heading'),
      blockItem(mySchema.nodes.heading, {level : 4}, 'Heading 4', 'heading'),
      blockItem(mySchema.nodes.heading, {level : 5}, 'Heading 5', 'heading'),
      blockItem(mySchema.nodes.heading, {level : 6}, 'Heading 6', 'heading'),
    ]},
    {action: createBlock(mySchema.nodes.table), label: 'Insert Table', icon: 'table', value: 'table', enabled: true},
    {type: 'menu', label: "Table Actions", id: 'tables', items: [
      {label:"Insert column before", action: addColumnBefore},
      {label:"Insert column after", action: addColumnAfter},
      {label:"Delete column", action: deleteColumn},
      {label:"Insert row before", action: addRowBefore},
      {label:"Insert row after", action: addRowAfter},
      {label:"Delete row", action: deleteRow},
      {label:"Delete table", action: deleteTable},
      {label:"Merge cells", action: mergeCells},
      {label:"Split cell", action: splitCell},
      {label:"Toggle header column", action: toggleHeaderColumn},
      {label:"Toggle header row", action: toggleHeaderRow},
      {label:"Toggle header cells", action: toggleHeaderCell},
    ]},
    {action:undo, label: 'Undo'},
    {action:redo, label: 'Redo'}
  ]);
  