import {MenuDropdown} from './menu-dropdown.js';
import {MenuItem, MenuGroup} from './FormatToolbarItem.js';
//import './sass/menu-button.scss';

class MenuView {
  constructor(items, label, editorView) {
    this.items = this.createItems(items);
    this.label = label;
    this.editorView = editorView;
    this.navItems = this.items.flatMap(item => item.navItem());

    this.domNode = this.createElement();
    //this.update()
    this.current = 0;

    this.last = this.navItems.length - 1;

    this.navItems[this.current].domNode.setAttribute('tabindex', '0');

    // this.domNode.addEventListener("mousedown", e => {
    //   e.preventDefault()
    //   editorView.focus()
    //   items.forEach(({command, dom}) => {
    //     if (dom.contains(e.target))
    //       command(editorView.state, editorView.dispatch, editorView)
    //   })
    // })

    document.body.addEventListener('keydown', e => {
        if (e.key == 'Esc' || e.key == 'Escape') { this.hidePopupLabels(); }
    });

    this.domNode.addEventListener('keydown', e => {
        var flag = false;
        switch (e.key) {

        case " ":
        case "Spacebar":
        case "Enter":
            this.activateItem(this.navItems[this.current]);
            flag = true;
            break;

        case "ArrowRight":
        case "Right":
            this.setFocusToNext(this);
            flag = true;
            break;

        case "ArrowLeft":
        case "Left":
            this.setFocusToPrevious(this);
            flag = true;
            break;

        case "Home":
            this.current = 0;
            this.setFocusItem(this.navItems[0])
            flag = true;
            break;

        case "End":
            this.current = this.last;
            this.setFocusItem(this.navItems[this.last])
            flag = true;
            break;

        default:
            break;
        }

        if (flag) {
            e.stopPropagation();
            e.preventDefault();
        }

    })
  }

  setFocusItem (item) {
    this.navItems.forEach(item => {item.domNode.setAttribute('tabindex', '-1')})
    item.domNode.setAttribute('tabindex', '0');
    item.domNode.focus();
  }

  setFocusToNext () {
    this.current = this.current === this.last ? 0 : this.current + 1;
    let newItem = this.navItems[this.current];
    this.setFocusItem(newItem);
  }

  setFocusToPrevious () {
    this.current = this.current === 0 ? this.last : this.current - 1;
    let newItem = this.navItems[this.current];
    this.setFocusItem(newItem);
  };

  createItems(items) {
      return items.map( item => {
          if (item.type == "buttongroup") {
              let {label, items} = item;
              return new MenuGroup(this, label, items);
          } else if (item.type == 'dropdown') {
              let {label, id, items, action} = item;
              return new MenuDropdown(this, label, id, items, action);
          } else {
              let {value, icon, label, action} = item;
              return new MenuItem(this, value, icon, label, action);
          }
      })
  }

  createElement() {
      let toolbar = document.createElement("div");
      toolbar.classList = "menubar format";
      toolbar.setAttribute("role", "toolbar");
      toolbar.setAttribute("aria-label", this.label);
      toolbar.setAttribute("aria-controls", "editor");

      let inner = document.createElement("div");
      inner.classList = "group characteristics";

      this.items.forEach(item => inner.appendChild(item.domNode));

      toolbar.appendChild(inner);
      return toolbar;
  }

  activateItem(item) {
      console.log(item);
    item.action(this.editorView.state, this.editorView.dispatch, this.editorView);
  }

  hidePopupLabels() {
    var tps = this.domNode.querySelectorAll('button .popup-label');
    tps.forEach( tp => {tp.classList.remove('show');});
  }

//   update() {
//     this.items.forEach(({action, domNode}) => {
//       let active = action(this.editorView.state, null, this.editorView)
//       domNode.style.display = active ? "" : "none"
//     })
//   }

  destroy() { this.domNode.remove() }
}

const {Plugin} = require("prosemirror-state")

function menuPlugin(items) {
  return new Plugin({
    view(editorView) {
      let menuView = new MenuView(items, "toolbar", editorView)
      editorView.dom.parentNode.insertBefore(menuView.domNode, editorView.dom)
      return menuView
    }
  })
}

const {toggleMark} = require("prosemirror-commands")
const {schema} = require("prosemirror-schema-basic")

// Helper function to create menu icons
let menu = menuPlugin([
  {action: toggleMark(schema.marks.strong), label: 'strong', icon: 'bold', value: 'bold'},
  {action: toggleMark(schema.marks.em), label: 'em', icon: 'italic', value: 'i'},
  {type: 'dropdown', label: 'alignent', items: [
    {action: toggleMark(schema.marks.em), label: 'left', icon: 'align-left', value: 'left', selected: true},
    {action: toggleMark(schema.marks.em), label: 'center', icon: 'align-center', value: 'center'},
    {action: toggleMark(schema.marks.em), label: 'right', icon: 'align-right', value: 'right'}
  ]}
])

const {EditorState} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {baseKeymap} = require("prosemirror-commands")
const {keymap} = require("prosemirror-keymap")
const {DOMParser} = require("prosemirror-model")

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    plugins: [keymap(baseKeymap), menu]
  })
})
