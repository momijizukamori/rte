import {stripLabel} from './toolbar-utils.js';

/**
 * A plain button representing a standalone action.
 *
 * @export
 * @class ToolbarItem
 */
export class ToolbarItem {
  /**
   * Creates an instance of ToolbarItem.
   * @param {SimpleToolbar} toolbar - Parent toolbar this item belongs to.
   * @param {Object} item - Item configuration.
   * @param {string} item.label - Item label, used for display tooltip.
   * @param {string} item.value - Value of the item button. Defaults to lowercase, 
   *  space-stripped version of label if not set.
   * @param {string} item.icon - Class name for this item's icon. Defaults to value if not set.
   * @param {Function} item.action - Callback function to fire when the item is activated.
   * @param {activeCallback} item.active - Callback function to determine if the item should be styled as active.
   * @param {enabledCallback} item.enabled - Callback function to determine if the item should be styled as enabled.
   * @memberof ToolbarItem
   */
  constructor(toolbar, item) {
    let {value, icon, label, action, active, enabled} = item;
    this.label = label;
    this.value = value || stripLabel(label);
    this.icon = icon || value || stripLabel(label);
    this.toolbar = toolbar;
    this.action = action;

    this.baseActive = active;
    if (enabled) {
      if (typeof(enabled) == "boolean") {
      this.baseEnabled = () => {return enabled;};
      } else {
        this.baseEnabled = enabled;
      }
    } else if (action) {
      this.baseEnabled = action;
    }
    this.active = (state) => {
      if (this.baseActive && this.baseActive(state)) {
        this.setPressed();
      } else {
        this.resetPressed();
      }
    };

    this.enabled = (state) => {
      if (this.baseEnabled && this.baseEnabled(state)) {
        this.enable();
      } else {
        this.disable();
      }
    };

    this.domNode = this.createElement();

    this.domNode.addEventListener('click', e => {
      this.toolbar.setFocusItem(this);
      this.toolbar.activateItem(this);
      this.toolbar.editorView.focus();
    });

    this.domNode.addEventListener('focus', e => {
      this.toolbar.domNode.classList.add('focus');
    });
    this.domNode.addEventListener('blur', e => {
      this.toolbar.domNode.classList.remove('focus');
    });

  }

  /**
   * Returns this item for the list of navigable items.
   *
   * @return {Object} 
   * @memberof ToolbarItem
   */
  navItem() {
    return this;
  }

  /**
   * Returns whether this element has the 'pressed' state.
   *
   * @return {boolean} 
   * @memberof ToolbarItem
   */
  isPressed() {
    return this.domNode.getAttribute('aria-pressed') === 'true';
  }

  /**
   * Sets element 'pressed' state
   *
   * @memberof ToolbarItem
   */
  setPressed() {
    this.domNode.setAttribute('aria-pressed', 'true');
  }

  /**
   * Clears element 'pressed' state
   *
   * @memberof ToolbarItem
   */
  resetPressed() {
    this.domNode.setAttribute('aria-pressed', 'false');
  }

  /**
   * Marks the element as disabled.
   *
   * @memberof ToolbarItem
   */
  disable() {
    this.domNode.setAttribute('aria-disabled', 'true');
    this.domNode.setAttribute('disabled', 'true');
  }

  /**
   * Clears element 'disabled' state.
   *
   * @memberof ToolbarItem
   */
  enable() {
    this.domNode.removeAttribute('aria-disabled');
    this.domNode.removeAttribute('disabled');
  }

  /**
   * Returns the DOM element for this item.
   *
   * @return {Element} 
   * @memberof ToolbarItem
   */
  createElement() {
    let btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', this.label);
    btn.setAttribute('data-balloon-pos', 'up');
    btn.setAttribute('data-balloon-blunt', true);
    btn.setAttribute('value', this.value);
    btn.setAttribute('tabindex', '-1');
    btn.classList = "st-item popup " + this.value;

    let icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList = this.toolbar.iconClass + this.icon;

    btn.appendChild(icon);

    return btn;
  }

}

export class LinkItem {
  constructor(toolbar, link, icon, label) {
    this.toolbar = toolbar;
    this.link = link;
    this.icon = icon;
    this.label = label;
    this.domNode = this.createElement();
  }

  navItem() { return this; }

  createElement() {
    let a = document.createElement('a');
    a.setAttribute('aria-pressed', 'false');
    a.setAttribute('aria-label', this.label);
    a.setAttribute('data-balloon-pos', 'up');
    a.setAttribute('data-balloon-blunt', true);
    a.setAttribute('href', this.link);
    a.setAttribute('tabindex', '-1');
    a.classList = "st-item st-link popup button";

    let icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList = this.toolbar.iconClass + this.icon;

    a.appendChild(icon);

    return a;
  }
}

export class SpacerItem {
  constructor(toolbar, item) {
    let {width, expanding} = item;
    this.toolbar = toolbar;
    this.width = width;
    this.expanding = expanding || false;
    this.domNode = this.createElement();
  }

  navItem() { return []; }

  createElement() {
    let div = document.createElement('div');
    div.classList = "st-spacer";
    div.style.display = "inline-block";
    if (this.width) {
      div.style.width = this.width;
    }
    if (this.expanding) {
      div.style.flexGrow = 1;
    }
    return div;
  }
}