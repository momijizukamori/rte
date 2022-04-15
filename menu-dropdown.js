export class MenuDropdown {
    constructor(toolbar, label, id, items, action) {
        this.toolbar = toolbar;
        this.label = label;
        this.action = action;
        this.id = id;
        this.items = items.map((item, i) => {

            let {
                value,
                icon,
                label,
                action,
                selected
            } = item;
            let ddItem = new DropdownItem(this, value, icon, label, action, selected);
            if (item.selected) {
                this.selected = ddItem;
                this.current = i;
            }
            return ddItem;
        });
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

    }

    open() {
        // Get bounding rectangle of controller object's DOM node

        // Set CSS properties
        this.list.style.display = 'block';
        this.list.style.zIndex = 100;

        // Set aria-expanded attribute
        this.btn.domNode.setAttribute('aria-expanded', 'true');
    }

    close(force) {
        if (typeof force !== 'boolean') {
            force = false;
        }

        if (force || (!this.hasFocus && !this.hasHover && !this.btn.hasHover)) {
            this.list.style.display = 'none';
            this.btn.domNode.removeAttribute('aria-expanded');
        }
    }

    isOpen() {
        return this.btn.domNode.getAttribute('aria-expanded') === 'true';
    }

    buttonFocus() {
        this.btn.domNode.focus();
    }

    createElement() {
        let dropdown = document.createElement("div");
        dropdown.classList = 'menu-popup group';
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

    navItem() {
        return this.btn;
    }

    setSelected(item) {
        this.selected = item;
        this.items.forEach(item => item.domNode.setAttribute("aria-checked", false));
        this.btn.domNode.setAttribute("aria-label", item.label);
        this.btn.domNode.innerText = item.label;
        item.domNode.setAttribute("aria-checked", true);
        this.toolbar.activateItem(item);
        this.buttonFocus();
        this.close(true);
    }

    setFocusToNext() {
        this.current = this.current === this.last ? 0 : this.current + 1;
        this.items[this.current].domNode.focus();
    }

    setFocusToPrevious() {
        this.current = this.current === 0 ? this.last : this.current - 1;
        this.items[this.current].domNode.focus();
    }

}

class DropdownButton {
    constructor(menu) {
        this.menu = menu;
        this.domNode = this.createElement();


        this.domNode.addEventListener('click', e => {
            this.menu.isOpen() ? this.menu.close(true) : this.menu.open();
        });

        this.domNode.addEventListener('keydown', e => {
            console.log(e);
            let keys = [" ", "Spacebar", "Up", "ArrowUp", "Down", "ArrowDown", "Enter"];
            if (keys.includes(e.key)) {
                this.menu.open();
                this.menu.selected.domNode.focus();
                e.stopPropagation();
                e.preventDefault();
            }
        });
    }

    createElement() {
        let btn = document.createElement('button');
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-label', this.menu.selected.label);
        btn.setAttribute('tabindex', '-1');
        btn.classList = "item menu-button";
        let selectedText = document.createTextNode(this.menu.selected.label);
        btn.appendChild(selectedText);
        let arrow = document.createElement('span');
        arrow.classList = "menu-button-arrow";
        btn.appendChild(arrow);

        return btn;

    }
}

class DropdownItem {
    constructor(menu, value, icon, label, action, selected) {

        this.menu = menu;
        this.action = action;
        this.value = value;
        this.icon = icon;
        this.label = label;
        this.selected = selected ? true : false;
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
        liItem.setAttribute('role', 'menuitemradio');
        liItem.setAttribute('aria-checked', this.selected);
        liItem.setAttribute('tabindex', '-1');
        liItem.appendChild(document.createTextNode(this.label));

        return liItem;
    }
}