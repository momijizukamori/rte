import {stripLabel} from './toolbar-utils.js';

/**
 * A toolbar item with expandable dropdown of unrelated actions to select from
 * (for related actions, see {ToolbarDropdown})
 *
 * @export
 * @class ToolbarDropdown
 */
export class ToolbarMenu {
    constructor(toolbar, opts) {
        this.toolbar = toolbar;
        let { label, id, items} = opts;
        this.label = label;
        this.id = id || stripLabel(label);
        this.current = 0;
        this.items = items.map((item) => { return new DropdownItem(this, item);});
        this.action = () => {};
        this.last = this.items.length - 1;

        this.btn = new DropdownButton(this);

        this.domNode = this.createElement();

        this.domNode.addEventListener('keydown', e => {
            if (e.key == 'Home' || e.key == 'PageUp') {
                this.current = 0;
                this.items[0].domNode.focus();
                e.stopPropagation();
                e.preventDefault();
            }

            if (e.key == 'End' || e.key == 'PageDown') {
                this.current = this.last;
                this.items[this.last].domNode.focus();
                e.stopPropagation();
                e.preventDefault();
            }

            if (['ArrowRight', 'Right', 'Left', 'ArrowLeft', 'Tab'].includes(e.key)) {
                this.close(true);
            }
        });
        
        this.domNode.addEventListener("focusout", e => {
            setTimeout(() => { 
           if (!this.domNode.contains(document.activeElement)) {this.close();}
            });
        });

        this.domNode.addEventListener("blur", e => {
            this.close();
        });

    }

    /**
     * Opens the dropdown list.
     *
     * @memberof ToolbarDropdown
     */
    open() {
        // Set CSS properties
        this.list.style.display = 'block';
        this.list.style.zIndex = 100;

        // Set aria-expanded attribute
        this.btn.domNode.setAttribute('aria-expanded', 'true');
    }

    /**
     * Hides the dropdown list.
     *
     * @memberof ToolbarDropdown
     */
    close() {
        this.list.style.display = 'none';
        this.btn.domNode.removeAttribute('aria-expanded');
    }

    /**
     * Returns whether the dropdown list is currently open.
     *
     * @return {boolean} 
     * @memberof ToolbarDropdown
     */
    isOpen() {
        return this.btn.domNode.getAttribute('aria-expanded') === 'true';
    }

    /**
     * Set focus to the dropdown button.
     *
     * @memberof ToolbarDropdown
     */
    buttonFocus() {
        this.btn.domNode.focus();
    }

    createElement() {
        let dropdown = document.createElement("div");
        dropdown.classList = 'st-menu menu-popup group';
        dropdown.setAttribute('tabindex', '-1');

        let list = document.createElement('ul');
        list.setAttribute('role', 'menu');
        list.setAttribute('aria-label', this.label);
        list.setAttribute('id', this.id);
        dropdown.appendChild(this.btn.domNode);

        this.items.forEach(item => {
            list.appendChild(item.domNode);
        });
        this.list = list;
        dropdown.appendChild(list);

        return dropdown;
    }

    /**
     * Returns the dropdown button as the navigable item for this element.
     *
     * @return {Object} 
     * @memberof ToolbarDropdown
     */
    navItem() {
        return this.btn;
    }

    setSelected(item) {
        this.toolbar.activateItem(item);
        this.buttonFocus();
        this.close(true);
    }

    /**
     * Move focus from current dropdown item to next.
     *
     * @memberof ToolbarDropdown
     */
    setFocusToNext() {
        this.current = this.current === this.last ? 0 : this.current + 1;
        this.items[this.current].domNode.focus();
    }

    /**
     * Move focus from current dropdown to previous.
     *
     * @memberof ToolbarDropdown
     */
    setFocusToPrevious() {
        this.current = this.current === 0 ? this.last : this.current - 1;
        this.items[this.current].domNode.focus();
    }

}

/**
 * The button element that represents the dropdown in the toolbar.
 * Activating it toggles the dropdown open and closed.
 *
 * @class DropdownButton
 */
class DropdownButton {
    /**
     * Creates an instance of DropdownButton.
     * @param {ToolbarDropdown} menu - Parent Dropdown item this button belongs to.
     * @memberof DropdownButton
     */
    constructor(menu) {
        this.menu = menu;
        this.domNode = this.createElement();


        this.domNode.addEventListener('click', e => {
            this.menu.toolbar.setFocusItem(this);
            this.menu.isOpen() ? this.menu.close(true) : this.menu.open();
        });

        this.domNode.addEventListener('keydown', e => {
            let keys = [" ", "Spacebar", "Up", "ArrowUp", "Down", "ArrowDown", "Enter"];
            if (keys.includes(e.key)) {
                this.menu.open();
                this.menu.items[0].domNode.focus();
                e.stopPropagation();
                e.preventDefault();
            }
        });

    }

    /**
     * Creates DOM element for the dropdown button.
     *
     * @return {Element} 
     * @memberof DropdownButton
     */
    createElement() {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button')
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-label', this.menu.label);
        btn.setAttribute('tabindex', '-1');
        btn.classList = "st-item st-menu-button";
        let selectedText = document.createTextNode(this.menu.label);
        btn.appendChild(selectedText);
        let arrow = document.createElement('span');
        arrow.classList = "st-button-arrow";
        btn.appendChild(arrow);

        return btn;

    }
}

class DropdownItem {
    constructor(menu, item) {
        let {label, action, enable} = item;

        this.menu = menu;
        this.action = action;
        this.enable = enable;
        this.label = label;
        this.domNode = this.createElement();

        this.domNode.addEventListener('click', e => {
            this.menu.setSelected(this);
        });

        this.domNode.addEventListener('keydown', e => {
            if (e.key == 'Up' || e.key == 'ArrowUp') {
                this.menu.setFocusToPrevious();
                e.stopPropagation();
                e.preventDefault();
            }
            if (e.key == 'Down' | e.key == 'ArrowDown') {
                this.menu.setFocusToNext();
                e.stopPropagation();
                e.preventDefault();
            }

            if (e.key == ' ' || e.key == 'Spacebar' || e.key == 'Enter') {
                this.menu.setSelected(this);
                e.stopPropagation();
                e.preventDefault();
            }
        });


    }

    createElement() {
        let liItem = document.createElement('li');
        liItem.setAttribute('role', 'menuitem');
        liItem.setAttribute('aria-pressed', false);
        liItem.setAttribute('tabindex', '-1');
        liItem.appendChild(document.createTextNode(this.label));
        liItem.classList = "st-menu-item";

        return liItem;
    }
}