import { SimpleToolbar } from "./js/SimpleToolbar";

function wrappingItem(tag, label, icon) {
    const value = label.toLowerCase().replace(/ /, "-");
    const finalIcon = icon || value;

    return {
        icon: finalIcon,
        value: value,
        label: label,
        action: insertAround(`<${tag}>`, `</${tag}>`),
        active: false,
        enabled: true
    };
}

const TextArea = document.querySelector("textarea[name=event]");
const imageButton = document.getElementById("image-upload");

function insertImage(){
    imageButton.click()
}

function insertAround(startText, endText) {
    return function() {
    let [start, end] = [TextArea.selectionStart, TextArea.selectionEnd];
    TextArea.setRangeText(startText, start, start, 'preserve');
    end = end + startText.length;
    TextArea.setRangeText(endText, end, end, 'preserve');
    TextArea.setSelectionRange(start + startText.length, end);
    };
}

let items = [
    wrappingItem("b", "Bold"),
    wrappingItem("i", "Italic"),
    wrappingItem("u", "Underline"),
    wrappingItem("s", "Strikethrough"),
    wrappingItem("pre", "Code", "terminal"),
    {action: insertAround("<ul><li>", "</li></ul>"), label: 'Bullet List', icon: 'list-ul', value: 'bullet-list', enabled: true},
    wrappingItem("blockquote", 'Blockquote', 'quote-left'),
    {action: insertImage, label: 'Insert image', icon: 'image', value: 'image', enabled: true},
    {action: insertAround('<a href="">', "</a>"), label: 'Insert link', icon: 'link', value: 'link', enabled: true},
    {action: insertAround('<user name="', '">'), label: 'Insert user', icon: 'user', value: 'user', enabled: true },
    {action: insertAround('<cut text="Read more">', "</cut>"), label: 'Insert cut', icon: 'cut', value: 'cut', enabled: true },
    {type: 'dropdown', label: 'heading', id: 'heading', items: [
      {...wrappingItem("h1", 'Heading 1', 'heading'), default_item: true},
      wrappingItem("h2", 'Heading 2', 'heading'),
      wrappingItem("h3", 'Heading 3', 'heading'),
      wrappingItem("h4", 'Heading 4', 'heading'),
      wrappingItem("h5", 'Heading 5', 'heading'),
      wrappingItem("h6", 'Heading 6', 'heading'),
    ]}];


var plainToolbar = null;
var mdToolbar = null;

function setupPlain() {
    plainToolbar = new SimpleToolbar(items, "toolbar", "entry-body");
    TextArea.parentNode.insertBefore(plainToolbar.domNode, TextArea);
}


// Set up RTE on load if it's set as default format
if (document.querySelector('#editor').value.includes("html")) {
    setupPlain();
  }
  
  // Watch the format select for changes, and add or destroy the RTE as necessary
  document.querySelector('#editor').addEventListener('change', e => {
    let format = e.target.value;
    if (format.includes("html") && !plainToolbar) {
      setupPlain();
    }
    if (!format.includes("html") && plainToolbar) {
      plainToolbar.destroy();
      plainToolbar = null;
    }
  })
