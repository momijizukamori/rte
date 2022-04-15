import {ToolbarDropdown} from './ToolbarDropdown.js';
import {ToolbarItem, LinkItem, SpacerItem} from './ToolbarItem.js';
import {ToolbarGroup} from './ToolbarItemGroup.js';
import { ToolbarMenu } from './ToolbarMenu.js';
//import './sass/menu-button.scss';

export const itemTypes = {
    dropdown: ToolbarDropdown,
    menu: ToolbarMenu,
    buttongroup: ToolbarGroup,
    link: LinkItem,
    spacer: SpacerItem,
    defaultType: ToolbarItem
};

export class SimpleToolbar {
  constructor(items, label, editorId, opts) {
    this.opts = opts || {};
    this.iconClass = this.opts.iconClass || "fas fa-";
    this.itemTypes = this.opts.itemTypes || itemTypes;
    this.items = this.createItems(items);
    this.label = label;
    this.editorId = editorId;
    this.editorView = document.getElementById(editorId);
    this.navItems = this.items.flatMap(item => item.navItem());

    this.domNode = this.createElement();
    this.current = 0;

    this.last = this.navItems.length - 1;

    this.navItems[this.current].domNode.setAttribute('tabindex', '0');

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
            this.setFocusItem(this.navItems[0]);
            flag = true;
            break;

        case "End":
            this.current = this.last;
            this.setFocusItem(this.navItems[this.last]);
            flag = true;
            break;

        default:
            break;
        }

        if (flag) {
            e.stopPropagation();
            e.preventDefault();
        }

    });
  }

  updateOpts(opts) {
    this.activateItem = opts.activate  || this.activateItem;
    this.update = opts.update  || this.update;
    this.iconClass = opts.iconClass  || this.iconClass;
  }

  setFocusItem (item) {
    this.navItems.forEach(item => {item.domNode.setAttribute('tabindex', '-1');});
    this.current = this.navItems.indexOf(item);
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
  }

  createItems(items) {
      return items.map( item => {
          var itemClass;
          if (item.type) {
            itemClass = this.itemTypes[item.type];
          }
          itemClass = itemClass || this.itemTypes.defaultType;
          return new itemClass(this, item);
      });
  }

  createElement() {
      let toolbar = document.createElement("div");
      toolbar.classList = "st-menubar format";
      toolbar.setAttribute("role", "toolbar");
      toolbar.setAttribute("aria-label", this.label);
      toolbar.setAttribute("aria-controls", this.editorId);

      let inner = document.createElement("div");
      inner.classList = "group characteristics";

      this.items.forEach(item => inner.appendChild(item.domNode));

      toolbar.appendChild(inner);
      return toolbar;
  }

  activateItem(item) {
      item.action();
    }

  update() {return true; }

  destroy() { this.domNode.remove(); }
}


/**
 * Callback that determines if an item should be styled as currently-active
 * @callback activeCallback
 * @param {Object} state
 * @return {boolean} 
 */

 /**
 * Callback that determines if an item should be styled as enabled or not.
 * @callback enabledCallback
 * @param {Object} state
 * @return {boolean} 
 */