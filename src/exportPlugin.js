import { DOMParser, DOMSerializer, Schema} from "prosemirror-model";

export class ExportView {
    constructor(view, input, newNodes, newMarks) {
      this.view = view;
      this.input = input;
      let nnewNodes = [['embed', {toDOM(node) { let {src, alt, title, height, width} = node.attrs; return ['iframe', {src, alt, title, height, width}];}}],
      ['username', {toDOM(node) {let {name, site} = node.attrs; return ['user', {name, site} ];}}]]; //serializers;
  
      this.nodes = this.view.state.schema.spec.nodes;
      this.marks = this.view.state.schema.spec.marks;
  
      nnewNodes.forEach(item => {     
        this.nodes = this.nodes.update(item[0], {...this.nodes.get(item[0]), ...item[1]});
  
      });
      this.spec = {nodes: this.nodes, marks: this.marks};
      this.schema = new Schema(this.spec);
      this.serializer = DOMSerializer.fromSchema(this.schema);
    }
  
    update() {
      let output = this.serializer.serializeFragment(this.view.state.doc);
  
      let temp = document.createElement("div");
      temp.appendChild(output);
      temp.querySelectorAll('text').forEach(block => block.outerHTML = block.innerHTML);
      let tempStr = temp.innerHTML.replaceAll(/<br>/g, '\n').replaceAll(/<\/user>/g, '');
      this.input.value = tempStr;
    }
  }
  
