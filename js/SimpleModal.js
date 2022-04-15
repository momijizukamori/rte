//import '../sass/simple-modal.scss';

export class SimpleModal{
    constructor(title, content, submit, cancel) {
        this.title = title;
        this.content = content;
        this.submit = submit;
        this.cancel = cancel || this.close;

        this.domNode = this.createElement();

        this.domNode.querySelector("form").addEventListener("submit", e => {
            e.stopPropagation();
            e.preventDefault();
            let values = new FormData(e.target);
            this.submit(values);
            this.close();
        });

        this.domNode.querySelector('#modal-close').addEventListener("click", e => this.close());

   }

    open() {
        document.body.classList.add("has-dialog");
        this.backdrop = document.createElement("div");
        this.backdrop.className = "dialog-backdrop";
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.domNode);
        this.domNode.querySelector('input').focus();
    }

    close() {
        this.domNode.remove();
        this.backdrop.remove();
    }

    createElement() {
        let markup = `
        <div role="dialog" aria-labelledby="modal-title" aria-modal="true" id="modal-window">
            <div id="modal-title">${this.title}</div> 
            <button id="modal-close"><span class="fas fa-window-close"></span></button>
            <form id="modal-form">
                <div id="modal-content">
                ${this.content}
                </div>
                <button id="modal-cancel">Cancel</button>
                <button type="submit" id="modal-submit">Ok</button>
            </form>
        </div>`;

        return document.createRange().createContextualFragment(markup).querySelector('div');
    }
}