import { TextSelection } from "prosemirror-state";
import { Plugin } from 'prosemirror-state';

class CutView {
    constructor(node, view, getPos) {
        this.view = view;
        this.node = node;
        this.getPos = getPos;
        this.id = {};
        this.text = node.attrs.text;
        this.expanded = node.attrs.expanded;
        this.innerView = null;

        this.textWrapper = document.createElement("span");
        this.wrapper = document.createElement("span");
        this.wrapper.classList = this.expanded ? "cuttag cuttag-open" : "cuttag cuttag-closed";

        this.cutStart = document.createElement("img");
        this.cutStart.className = "cuttag-start";
        let startImg = this.expanded ? "https://www.dreamwidth.org/img/expand.svg" : "https://www.dreamwidth.org/img/collapse.svg";
        this.cutStart.setAttribute("src", startImg);
        this.cutStart.setAttribute("tabindex", "-1");

        this.cutEnd = document.createElement("img");
        this.cutEnd.className = "cuttag-end";
        this.cutEnd.setAttribute("src", "https://www.dreamwidth.org/img/collapse-end.svg");
        this.cutEnd.setAttribute("tabindex", "-1");

        this.cutText = document.createElement("span");
        this.cutText.className = "cuttag-text";
        this.cutText.insertAdjacentText('afterbegin', this.text);
        this.cutText.setAttribute('tabindex', '-1');

        this.cutText.addEventListener('keydown', e => {
            let selection = document.getSelection();
            let text = e.target.innerHTML;

            if (e.key == "Right" || e.key == "ArrowRight") {
                if (text && selection.focusOffset >= text.length) {
                    // at the end of the text field
                    if (this.expanded) {
                    view.dom.focus();
                  } else {
                    moveTo(view, getPos() + node.nodeSize);
                    e.target.parentNode.lastChild.focus();
                  }
                }
            }

            if (e.key == "Left" || e.key == "ArrowLeft") {
                if (selection.focusOffset < 1) {
                    // at the start of the text field                    
                    e.target.previousSibling.focus();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }

            if (["Backspace", "Del", "Delete"].includes(e.key)) {
              // Weird behavior with node deletion if we don't stop propagation
              e.stopPropagation();

              if (text.length == 1) {
                // about to delete the last character, replace with default text instead
                e.preventDefault();
                e.target.innerHTML = node.type.defaultAttrs.text;
              }
            }

            if (['Down', 'ArrowDown', 'Up', 'ArrowUp', 'Tab', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) {
                view.dom.focus();
            }
        });

        this.cutText.addEventListener('blur', e => {
            let newText = e.target.innerHTML;
            newText = newText.length > 0 ? newText : node.type.defaultAttrs.text;
            let transaction = view.state.tr.setNodeMarkup(getPos(), null, { text: newText, expanded: this.expanded });

            view.dispatch(transaction);
        });

        this.cutText.addEventListener('click', e => {
          let { doc, tr } = view.state;
          let resolved = doc.resolve(getPos());
          let newSelect = new TextSelection(resolved, resolved);
          view.dispatch(tr.setSelection(newSelect));
        });

        this.contentDOM = document.createElement("span");
        this.contentDOM.className = "cuttag-content";

        this.wrapper.appendChild(this.cutStart);
        this.wrapper.appendChild(this.cutText);
        this.wrapper.appendChild(this.contentDOM);
        this.wrapper.appendChild(this.cutEnd);

        let cutToggle = e => {
            e.preventDefault();
            e.stopPropagation();
            this.expanded = !this.expanded;
            if (this.expanded) {
                this.wrapper.classList = "cuttag cuttag-open";
                this.cutStart.setAttribute("src", "https://www.dreamwidth.org/img/expand.svg");
            } else {
                this.wrapper.classList = "cuttag cuttag-closed";
                this.cutStart.setAttribute("src", "https://www.dreamwidth.org/img/collapse.svg");
            }

            let transaction = view.state.tr.setNodeMarkup(getPos(), null, { text: node.attrs.text, expanded: this.expanded });

            view.dispatch(transaction);
        };

        this.cutStart.addEventListener('click', cutToggle);
        this.cutStart.addEventListener('keydown', e => {
            e.stopPropagation();
            e.preventDefault();
            if (e.key == 'Right' || e.key == 'ArrowRight') {
                let cutText = e.target.nextSibling;
                document.getSelection().collapse(cutText, 0);
                cutText.focus();
            }
            if (e.key == 'Left' || e.key == 'ArrowLeft') {
                view.dom.focus();
                moveBack(view);
            }
            if ([" ", "Spacebar", "Enter"].includes(e.key)) {
                view.dom.focus();
                moveBack(view);
                cutToggle(e);
            }
        })
        this.cutEnd.addEventListener('click', cutToggle);
        this.cutEnd.addEventListener('keydown', e => {
            e.stopPropagation();
            e.preventDefault();
            if (e.key == 'Right' || e.key == 'ArrowRight') {
                view.dom.focus();
                moveForward(view);
            }
            if (e.key == 'Left' || e.key == 'ArrowLeft') {
              if (this.expanded) {
                view.dom.focus();
                moveBack(view);
              } else {
                moveTo(view, getPos());
                let cutText = e.target.previousSibling.previousSibling;
                 document.getSelection().collapse(cutText, 1);
                cutText.focus();
              }
                
            }
            if ([" ", "Spacebar", "Enter"].includes(e.key)) {
                view.dom.focus();
                moveForward(view);
                cutToggle(e);
            }
        });

        this.dom = this.wrapper;
    }

}


const escapeCut = function(view, event) {
    let { selection, doc, tr } = view.state;
    if (event.key == 'Left' || event.key == 'ArrowLeft') {
        let pos = selection.to - 1 ;
        let resolved = doc.resolve(pos);
        let prev = resolved.node(resolved.depth -1);
        let curr = selection.$anchor;
        if (curr.depth > 1 && curr.node(curr.depth - 1).type.name == 'cut' && prev.type.name != 'cut') {
          // Trying to escape from the front!
          if (selection.empty && view.hasFocus()) {
            let docSelect = document.getSelection();
            let cutText = docSelect.focusNode.parentNode.parentNode.previousSibling;
            moveBack(view);
            docSelect.collapse(cutText, 1);
            cutText.focus();
            return true;
          } else {
            let select = new TextSelection(curr, resolved);
            view.dispatch(tr.setSelection(select));
          }

        }

    }
}

function moveForward(view) {
    let { selection, doc, tr } = view.state;
    let pos = selection.to + 2;
    let resolved = doc.resolve(pos);
    let newSelect = new TextSelection(resolved, resolved);
    view.dispatch(tr.setSelection(newSelect));
}

function moveBack(view) {
    let { selection, doc, tr } = view.state;
    let pos = selection.to - 2;
    let resolved = doc.resolve(pos);
    let newSelect = new TextSelection(resolved, resolved);
    view.dispatch(tr.setSelection(newSelect));
}

function moveTo(view, pos) {
  let { doc, tr } = view.state;

  let resolved = doc.resolve(pos);
  let newSelect = new TextSelection(resolved, resolved);
  view.dispatch(tr.setSelection(newSelect));
}

export const initCutPlugin = new Plugin({
  key: "cutPlugin",
  filterTransaction(tr, state) {
    let cuts = [];

    if (tr.getMeta("pointer")) {
        state.doc.descendants((node, pos, parent) => {
          if (node.type.name == 'cut') {
              cuts.push(node.nodeSize + pos + 1);
          }
          return true;
      });

      if (cuts.includes(tr.curSelection.$head.pos)) {
        document.getSelection().focusNode.focus();
        return false;
      }
    }
    return true;
  },
  appendTransaction(tr, oldState, newState) {
    let cutNode = document.getSelection().focusNode;
    if (cutNode.classList && cutNode.classList.contains("cuttag")) {

      let newPos = newState.selection.$head.pos;
      let oldPos = oldState.selection.$head.pos;



      let cuts = [];
      oldState.doc.descendants((node, pos, parent) => {
          if (node.type.name == 'cut') {
              cuts.push({ node: node, start: pos, end: node.nodeSize + pos });
          }
          return true;
      });
      var trans = null;
      cuts.forEach(item => {
           
            if (newPos - oldPos == 3 && item.start < newPos < item.end && oldPos < item.start) {
                // Entered cut from start - selection will skip two positions
                if (newState.selection.empty) {
                  let resolved = newState.doc.resolve(item.start);
                  let select = new TextSelection(resolved, resolved);
                  cutNode.firstChild.focus();
                  trans = newState.tr.setSelection(select);
                }                     
            }

          if (oldPos == item.end - 2 && newPos == item.start - 1) {
              // Hit the end of the cut, causing us to loop back to the start
              
              var select = null;
              if (newState.selection.empty) {
                let resolved = newState.doc.resolve(item.end);
                select = new TextSelection(resolved, resolved);
                cutNode.lastChild.focus();
              } else {
                let resolved = newState.doc.resolve(item.end + 2);
                select = new TextSelection(newState.selection.$anchor, resolved);
              }
              trans = newState.tr.setSelection(select);
          }
          if (oldPos == item.end + 1 && newPos == item.start - 1) {
              // Entered cut from the end, which causes cursor to jump to start
              var select = null;
              if (newState.selection.empty) {
                let resolved = newState.doc.resolve(item.end);
                select = new TextSelection(resolved, resolved);
                cutNode.lastChild.focus();
              } else {
                let resolved = newState.doc.resolve(item.end - 2 );
                select = new TextSelection(newState.selection.$anchor, resolved);
              }
              trans = newState.tr.setSelection(select);
          }

      });
      return trans;
    }
  },
  props: { nodeViews: { cut(node, view, getPos) { return new CutView(node, view, getPos);} }, handleKeyDown: escapeCut }
});