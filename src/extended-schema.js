const sDOM = ["s", 0], uDOM = ["u", 0];
// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const extMarks = {
  // :: MarkSpec A strikethrough mark. Rendered as an `<s>` element.
  // Has parse rules that also`text-decoration: line-through`.
  strikethrough: {
    parseDOM: [{tag: "s"}, {style: "text-decoration=line-through"}],
    toDOM() { return sDOM; }
  },

  // :: MarkSpec An underline mark. Rendered as a `<u>` element.
  // Has parse rules that also`text-decoration: line-through`.
  underline: {
    parseDOM: [{tag: "u"}, {style: "text-decoration=underline"}],
    toDOM() { return uDOM; }
  },

  // :: MarkSpec An underline mark. Rendered as a `<u>` element.
  // Has parse rules that also`text-decoration: line-through`.
  fontSize: {
    attrs: {
      size: {default: 'larger'}
    },
    parseDOM: [{tag: "font[size]", getAttrs(node) {
      return {size: node.getAttribute("size")}
    }}, {style: "font-size", getAttrs(value) { return {size: value}}}],
     toDOM(node) { let {size} = node.attrs; return [ "span", {style: "font-size: " + size}, 0] }
  },
}

const blockquoteDOM = ["blockquote", 0], hrDOM = ["hr"],
      preDOM = ["pre", ["code", 0]], brDOM = ["br"]

const blockAttrs = (node) => {
  return {align: node.style.textAlign};
};

const attrsToDom = (tag, node) => {
  let {align} = node.attrs; 
  let style = align ? {style: `text-align:${align}`} : {};
  return [ tag, style, 0];
}; 

export const extNodes = {
  text_wrapper: {
    content: "inline*",
    group: "block",
    parseDOM: [ {priority:100} ],
    toDOM(node) {return ["text", 0]; }
  },

  paragraph: {
    attrs: {align: {default: null}},
    content: "inline*",
    group: "block",
    parseDOM: [{tag: "p", getAttrs(node){return blockAttrs(node)}}
  ],
    toDOM(node) {return attrsToDom("p", node); }
  },

  div: {
    attrs: {align: {default: null}},
    content: "block*",
    group: "block",
    allowGapCursor: true,
    parseDOM: [{tag: "center", attrs: {align: "center"}},
    {tag: "div", priority:100, getAttrs(node){return blockAttrs(node)}}
  ],
    toDOM(node) {return attrsToDom("div", node); }
  },

  username: {
    attrs: {name: {},
  site: {default: "dreamwidth.org"}},
    inline: true,
    group: "inline",
    content: "inline*",
    atom: true,
    draggable: true,
    parseDOM: [{tag: "user", getAttrs(node) { return {name: node.getAttribute("name"), site: node.getAttribute("site")}}}],
    toDOM(node) {
      let {name, site} = node.attrs;
      let userStr = `<span lj:user='${name}' style='white-space: nowrap;' class='ljuser'><img src='https://www.dreamwidth.org/img/silk/identity/user.png' alt='[personal profile] ' width='17' height='17' style='vertical-align: text-bottom; border: 0; padding-right: 1px;' /><b>${name}</b></span>`;
      let userNode = document.createRange().createContextualFragment(userStr).querySelector('span'); 
      //let userNode = ["span", {style: "color:red;font-weight:bold;"}, 0];
      return userNode; }
  },

  cut: {
    attrs: {text: {default: "Read More..."}, expanded: {default: true}},
    group: "block",
    content: "block+",
    parseDOM: [{tag: "cut", getAttrs(node) { return {text: node.getAttribute("text")}}},
    {tag: "lj-cut", getAttrs(node) { return {text: node.getAttribute("text")}}}
  ],
    toDOM(node) {
      let {text} = node.attrs;
      return ["cut", {text}, 0]; }
  },

    // :: NodeSpec The top level document node.
    doc: {
      content: "block+"
    },
  
    // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
    blockquote: {
      attrs: {align: {default: null}},
      content: "block+",
      group: "block",
      defining: true,
      allowGapCursor: true,
      parseDOM: [{tag: "blockquote", getAttrs(node){return blockAttrs(node)}}],
      toDOM(node) { return attrsToDom("blockquote", node)}
    },

 
    // :: NodeSpec A horizontal rule (`<hr>`).
    horizontal_rule: {
      group: "block",
      parseDOM: [{tag: "hr"}],
      toDOM() { return hrDOM }
    },
  
    // :: NodeSpec A heading textblock, with a `level` attribute that
    // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
    // `<h6>` elements.
    heading: {
      attrs: {level: {default: 1},
      align: {default: null}
    },
      content: "inline*",
      group: "block",
      defining: true,
      parseDOM: [{tag: "h1", attrs: {level: 1}},
                 {tag: "h2", attrs: {level: 2}},
                 {tag: "h3", attrs: {level: 3}},
                 {tag: "h4", attrs: {level: 4}},
                 {tag: "h5", attrs: {level: 5}},
                 {tag: "h6", attrs: {level: 6}}],
      toDOM(node) { return attrsToDom("h" + node.attrs.level, node) }
    },
  
    // :: NodeSpec A code listing. Disallows marks or non-text inline
    // nodes by default. Represented as a `<pre>` element with a
    // `<code>` element inside of it.
    code_block: {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [{tag: "pre", preserveWhitespace: "full"}],
      toDOM() { return preDOM }
    },
  
    // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
    // `alt`, and `href` attributes. The latter two default to the empty
    // string.
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: {default: null},
        title: {default: null},
        width: {default: null},
        id: {default: null},
      },
      group: "inline",
      draggable: true,
      parseDOM: [{priority: 51, 
        tag: "img[src]", getAttrs(dom) {
        return {
          src: dom.getAttribute("src"),
          title: dom.getAttribute("title"),
          alt: dom.getAttribute("alt"),
          width: dom.getAttribute("width"),
        };
      }}],
      toDOM(node) { let {src, alt, title, width} = node.attrs; return ["img", {src, alt, title, width}]; }
    },
  
    // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{tag: "br", priority: 30}],
      toDOM() { return brDOM }
    },

    embed: {
      inline: true,
      attrs: {
        src: {},
        alt: {default: null},
        title: {default: null},
        width: {default: null},
        height: {default: null},
      },
      group: "inline",
      draggable: true,
      parseDOM: [{tag: "iframe[src]", getAttrs(dom) {
        return {
          src: dom.getAttribute("src"),
          title: dom.getAttribute("title"),
          alt: dom.getAttribute("alt"),
          width: dom.getAttribute("width"),
          height: dom.getAttribute("height"),
        };
      }}],
      toDOM(node) { 
        let overlay = document.createElement("div");
        overlay.className = "embed-overlay";
        let embedNode = document.createElement("iframe");
        for (const [key, value] of Object.entries(node.attrs)) {
          embedNode.setAttribute(key, value);
        }

        overlay.appendChild(embedNode);

      
      return overlay; }
    },
    // :: NodeSpec The text node.
    text: {
      group: "inline"
    },
};
