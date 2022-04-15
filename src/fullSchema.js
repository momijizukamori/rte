import {extMarks, extNodes} from "./extended-schema.js";
import {Schema} from "prosemirror-model";
import {schema as BaseSchema} from "prosemirror-schema-basic";
import {addListNodes} from "prosemirror-schema-list";
import {tableNodes}  from "prosemirror-tables";
import OrderedMap from "orderedmap";

const mappedNodes = OrderedMap.from(extNodes);

const listnodes = addListNodes(mappedNodes, "text_wrapper block*", "block");

export const mySchema = new Schema({
  nodes: listnodes.append(tableNodes({
    tableGroup: "block",
    cellContent: "block+",
    cellAttributes: {
      background: {
        default: null,
        getFromDOM(dom) { return dom.style.backgroundColor || null; },
        setDOMAttr(value, attrs) { if (value) attrs.style = (attrs.style || "") + `background-color: ${value};`; }
      }
    }
  })),
  marks: BaseSchema.spec.marks.append(extMarks)
});

export const blockWithWrapper = [mySchema.nodes.blockquote, mySchema.nodes.div, mySchema.nodes.cut ];