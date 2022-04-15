import {ToolbarItem} from './ToolbarItem.js';

/**
 * ToolbarGroups represent a group of mutually exclusive actions - that is, the results of any action
 * will override the results of any of the other actions in the group.
 *
 * @export
 * @class ToolbarGroup
 */
export class ToolbarGroup {
    /**
     * Creates an instance of ToolbarGroup.
     * @param {SimpleToolbar} toolbar - Parent toolbar instance
     * @param {Object} opts - Configuration options
     * @param {string} opts.label - Label that describes the entire group, used by screenreaders
     * @param {Object[]} opts.items - Array of configuration options.
     * @memberof ToolbarGroup
     */
    constructor(toolbar, opts) {
      let {label, items} = opts;
      this.toolbar = toolbar;
      this.label = label;
      this.items = items.map(item => {
        return new ToolbarGroupItem(toolbar, this, item);
      });
  
      this.current = 0;
      this.last = this.items.length - 1;
  
      this.domNode = this.createElement();
  
      this.domNode.addEventListener('focus', e => {
        this.items.forEach((item, i) => {
          if (item.domNode.getAttribute('tabindex').value == 0) {
            this.current = i;
          }
        });
      });
  
      // Up and down arrow keys cycle through items within this group.
      this.domNode.addEventListener('keydown', e => {
  
        if (e.key == 'Down' || e.key == 'ArrowDown') {
          this.current = this.current === this.last ? 0 : this.current + 1;
          let newItem = this.items[this.current];
          this.toolbar.setFocusItem(newItem);
  
          e.stopPropagation();
          e.preventDefault();
        } else if (e.key == 'Up' || e.key == 'ArrowUp') {
          this.current = this.current === 0 ? this.last : this.current - 1;
          let newItem = this.items[this.current];
          this.toolbar.setFocusItem(newItem);
  
          e.stopPropagation();
          e.preventDefault();
        }
      });
  
    }
  
    /**
     * Returns the items that should be keyboard-navigable.
     *
     * @return {Object} 
     * @memberof ToolbarGroup
     */
    navItem() {
      return this.items;
    }
  
    /**
     * Returns the DOM element for this group, including all child items.
     *
     * @return {Element} 
     * @memberof ToolbarGroup
     */
    createElement() {
      let group = document.createElement('div');
      group.className = 'group';
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', this.label);
      group.classList = 'st-button-group';
  
      this.items.forEach(item => {
        group.appendChild(item.domNode);
      });
      return group;
    }
  
    /**
     * Clears the 'checked' state on every item in the group.
     *
     * @memberof ToolbarGroup
     */
    resetChecked() {
      this.items.forEach(item => item.resetChecked());
    }
  
  }
  
/**
 * Subclass of ToolbarItem that implements the 'radio' role and
 * functions for manipulating the state of it's 'checked' attribute.
 *
 * @class ToolbarGroupItem
 * @extends {ToolbarItem}
 */
class ToolbarGroupItem extends ToolbarItem {
  
    /**
     * Creates an instance of ToolbarGroupItem.
     * @param {SimpleToolbar} toolbar - Parent toolbar this item and it's group belong to.
     * @param {ToolbarGroup} group - Parent ToolbarGroup this item belongs to.
     * @param {Object} item - Item configuration object.
     * 
     * @memberof ToolbarGroupItem
     */
    constructor(toolbar, group, item) {
      let {action} = item;
      super(toolbar, item);
  
      this.group = group;
      this.baseAction = action;

      // Wrap action to handle radio toggle within the group.
      this.action = (...args) => {
        this.group.resetChecked();
        this.setChecked();
        this.baseAction(...args);
      };

      this.active = (state) => {
        if (this.baseActive && this.baseActive(state)) {
          this.setChecked();
        } else {
          this.resetChecked();
        }
      };
  
    }
  
    /**
     * Creates and returns the DOM element for a ToolbarGroupItem
     *
     * @return {Element} 
     * @memberof ToolbarGroupItem
     */
    createElement() {
      let btn = super.createElement();
      document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
  
      return btn;
    }
  
    /**
     * Toggle the item to 'checked' state
     *
     * @memberof ToolbarGroupItem
     */
    setChecked() {
      this.domNode.setAttribute('aria-checked', 'true');
      this.domNode.checked = true;
  
    }
  
    /**
     * Clear item 'checked' state.
     *
     * @memberof ToolbarGroupItem
     */
    resetChecked() {
      this.domNode.setAttribute('aria-checked', 'false');
      this.domNode.checked = false;
    }
  
  }