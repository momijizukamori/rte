/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   FontToolbarItem.js
 */

export class MenuItem {
  constructor(toolbar, value, icon, label, action) {
    this.toolbar = toolbar;
    this.action = action;
    this.value = value;
    this.icon = icon;
    this.label = label;
    this.domNode = this.createElement();

    this.hasHover = false;

    this.domNode.addEventListener('click', e => {
      this.toolbar.setFocusItem(this);
      this.toolbar.activateItem(this);
    });

    this.domNode.addEventListener('focus', e => {
      this.toolbar.domNode.classList.add('focus');
    });
    this.domNode.addEventListener('blur', e => {
      this.toolbar.domNode.classList.remove('focus');
    });

    this.domNode.addEventListener('mouseover', e => {
      this.hasHover = true;
    });
    this.domNode.addEventListener('mouseleave', e => {
      this.hasHover = false;
    });

  }

  navItem() {
    return this;
  }

  isPressed() {
    return this.domNode.getAttribute('aria-pressed') === 'true';
  }
  setPressed() {
    this.domNode.setAttribute('aria-pressed', 'true');
  }
  resetPressed() {
    this.domNode.setAttribute('aria-pressed', 'false');
  }

  disable() {
    this.domNode.setAttribute('aria-disabled', 'true');
  }
  enable() {
    this.domNode.removeAttribute('aria-disabled');
  }

  createElement() {
    let btn = document.createElement('button');
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', this.label);
    btn.setAttribute('data-balloon-pos', 'up');
    btn.setAttribute('data-balloon-blunt', true);
    btn.setAttribute('value', this.value);
    btn.setAttribute('tabindex', '-1');
    btn.classList = "item popup " + this.value;

    let icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList = 'fas fa-' + this.icon;

    btn.appendChild(icon);

    return btn;
  }

}

// Menu groups are groups of mutually-exclusive options.
// They use radiogroups and allow cycling within the options set with up and down arrows
export class MenuGroup {
  constructor(toolbar, label, items) {
    this.toolbar = toolbar;
    this.label = label;
    this.items = items.map(item => {
      let {
        value,
        icon,
        label,
        action
      } = item;
      return new MenuGroupItem(toolbar, value, icon, label, action, this);
    });

    this.current = 0;
    this.last = this.items.length - 1;

    this.action = () => {
      this.items.forEach((item) => item.resetChecked());

      let actionItem = this.items[this.current];
      actionItem.setChecked();
      return actionItem.action;
    };

    this.domNode = this.createElement();

    this.domNode.addEventListener('focus', e => {
      this.items.forEach((item, i) => {
        if (item.domNode.getAttribute('tabindex').value == 0) {
          this.current = i;
        }
      });
    });


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

  navItem() {
    return this.items;
  }

  createElement() {
    let group = document.createElement('div');
    group.className = 'group';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', this.label);

    this.items.forEach(item => {
      group.appendChild(item.domNode);
    });
    return group;
  }

  resetChecked() {
    this.items.forEach(item => item.resetChecked());
  }

}

export class MenuGroupItem extends MenuItem {

  constructor(toolbar, value, icon, label, action, group) {
    super(toolbar, value, icon, label, action);

    this.group = group;
    this.action = () => {
      this.group.resetChecked();
      this.setChecked();
      return this.action;
    };

  }

  createElement() {
    let btn = super.createElement();
    document.createElement('button');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');

    return btn;
  }

  setChecked() {
    this.domNode.setAttribute('aria-checked', 'true');
    this.domNode.checked = true;

  }

  resetChecked() {
    this.domNode.setAttribute('aria-checked', 'false');
    this.domNode.checked = false;
  }

}