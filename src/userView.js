
class UserView {
    constructor(node, view, getPos) {
      // We'll need these later
      this.node = node
      this.outerView = view
      this.getPos = getPos
      this.start = this.outerView.state.selection.head
  
      // The node's representation in the editor (empty, for now)
      this.dom = document.createElement("span")
      this.dom.innerHTML = this.node.attrs.name;
      // These are used when the footnote is selected
      this.innerView = null
    }
    selectNode() {
      this.dom.classList.add("ProseMirror-selectednode")
      if (!this.innerView) this.open()
    }
  
    deselectNode() {
      this.dom.classList.remove("ProseMirror-selectednode")
      if (this.innerView) this.close()
    }
    open() {
      // Append a tooltip to the outer node
      let input = document.createElement("input");
      input.setAttribute("type", "text")
      input.value = this.node.attrs.name;
      input.addEventListener("change", e => {
  
      })
      this.innerView = this.dom.appendChild(input)
      // And put a sub-ProseMirror into that
      // this.innerView = new EditorView(tooltip, {
      //   // You can use any node as an editor document
      //   state: EditorState.create({
      //     doc: this.node,
      //     plugins: [keymap({
      //       "Mod-z": () => undo(this.outerView.state, this.outerView.dispatch),
      //       "Mod-y": () => redo(this.outerView.state, this.outerView.dispatch)
      //     })]
      //   }),
      //   // This is the magic part
      //   handleDOMEvents: {
      //     mousedown: () => {
      //       // Kludge to prevent issues due to the fact that the whole
      //       // footnote is node-selected (and thus DOM-selected) when
      //       // the parent editor is focused.
      //       if (this.outerView.hasFocus()) this.innerView.focus()
      //     }
      //   }
      // })
    }
  
    close() {
      if (this.innerView) {
        let newattrs = {name: this.innerView.value}
          let attrs = {...this.node.attrs, ...newattrs};
  
        let outerState = this.outerView.state;
        let {tr, selection} = outerState;
        this.outerView.dispatch(
          tr.setNodeMarkup(this.start + 1, this.node.type, attrs))
        }
      this.innerView.remove()
      this.innerView = null
  
    }
  
    update(node) {
      // console.log(node);
      // //if (!node.sameMarkup(this.node)) return false
      // console.log(this.innerView);
      // console.log(node);
      // this.node = node
      // if (this.innerView) {
      // let newattrs = {name: this.innerView.value}
      //   let attrs = {...node.attrs, ...newattrs};
      //   console.log(attrs);
      // let outerState = this.outerView.state;
      // this.outerView.dispatch(
      //   outerState.tr
      //     .setNodeMarkup(this.getPos() + 1, node.type, attrs))
      // }
    //   if (this.innerView) {
    //     let state = this.innerView.state
    //     let newattrs = {name: state.doc.content.content[0].text}
    //     let attrs = {...node.attrs, ...newattrs};
    //     console.log(attrs);
    //     console.log(this.getPos());
    //     this.outerView.dispatch(
    //       outerState.tr
    //         .setNodeMarkup(this.getPos() + 1, node.type, attrs))
    // }
      this.dom.innerHTML = this.node.attrs.name;
      return true
    }
    destroy() {
      if (this.innerView) this.close()
    }
  
    stopEvent(event) {
      return this.innerView && this.innerView.contains(event.target)
    }
  
    ignoreMutation() { return true }
  }