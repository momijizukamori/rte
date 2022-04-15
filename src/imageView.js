import {NodeSelection} from 'prosemirror-state';

function getFontSize(element) {
    return parseFloat(getComputedStyle(element).fontSize);
  }

export class ResizeView {
    constructor(node, view, getPos, element) {    
      console.log("constructing resize");
      this.node = node;
      this.element = element;

      const outer = document.createElement("div");
      outer.className = "resize-overlay";
      outer.style.width = node.attrs.width ? node.attrs.width: null;
      
      const el = document.createElement(this.element);
      el.setAttribute("src", node.attrs.src);
      el.style.width = "100%";
      
      const handle = document.createElement("span");
      handle.className = "resize-handle";
      handle.style.display = "none";
      
      handle.onmousedown = (e) => {
        e.preventDefault();
        
        const startX = e.pageX;
        const startY = e.pageY;
        
        const fontSize = getFontSize(outer);
        
        const startWidth = el.clientWidth / fontSize;
        const startHeight = el.clientHeight / fontSize;
              
        const onMouseMove = (e) => {
          const currentX = e.pageX;
          const currentY = e.pageY;
          
          const xDiffInPx = currentX - startX;
          const xDiffInEm = xDiffInPx / fontSize;
                  
          outer.style.width = `${startWidth + xDiffInEm}em`;
        };
        
        const onMouseUp = (e) => {        
          e.preventDefault();
          
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);

          let savedPos = getPos();
                  
          let transaction = view.state.tr.setNodeMarkup(getPos(), null, {src: node.attrs.src, width: outer.style.width, height: outer.style.height} );
          let resolved = transaction.doc.resolve(savedPos);
          let nodeSelection = new NodeSelection(resolved);
          transaction = transaction.setSelection(nodeSelection);
                
          view.dispatch(transaction);
        };
        
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };
      
      outer.appendChild(handle);
      outer.appendChild(el);
          
      this.dom = outer;
      this.el = el;
      this.handle = handle;
    }
    
    selectNode() {
      this.el.classList.add("ProseMirror-selectednode");
      
      this.handle.style.display = "";
    }
  
    deselectNode() {
      this.el.classList.remove("ProseMirror-selectednode");
      
      this.handle.style.display = "none";
    }

    // destroy() {
    //   let id = this.node.attrs.id;
      
    //   if(id) {
    //     var request = new XMLHttpRequest();
    //     const fd = new FormData();
    //     const uri = "/file/edit";
    //     return new Promise(function (resolve, reject) {
    //     request.onreadystatechange = function () {

    //       // Only run if the request is complete
    //       if (request.readyState !== 4) return;
    
    //       // Process the response
    //       if (request.status >= 200 && request.status < 300) {
    //         // If successful
    //         let data =  JSON.parse(request.responseText);
    //         resolve(data.result);
    //       } else {
    //         // If failed
    //         reject({
    //           status: request.status,
    //           statusText: request.statusText
    //         });
    //       }
          
    
    //     };

    //     // Setup our HTTP request
    //     request.open("POST", uri, true);
    //     fd.append('action:delete', "Delete Selected");
    //     fd.append("delete", id);

    //     // Send the request
    //     request.send(fd);
    //   });
    // }
    // }
  }
  