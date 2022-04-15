let overlayUpdate = function(overlay, getPos, view, node) {
    // console.log(node);
    console.log(this.width);
     let width = this.node.attrs.width;
     console.log(width);
    // let newWidth = this.outer.style.width;
    // console.log(newWidth)
    // console.log(this.outer)
    // const transaction = view.state.tr.setNodeMarkup(getPos(), null, {src: this.node.attrs.src, width: this.outer.style.width} );
              
    // view.dispatch(transaction)
    return true;
  }
  
  let imageOverlay = function(node, getPos, view) {
    //console.log(view.state.selection.from);
    this.node = node;    
    this.getPos = getPos();
    const outer = document.createElement("span")
    outer.style.position = "relative"
    this.width = node.attrs.width;
    // outer.style.width = node.attrs.width
    //outer.style.border = "1px solid blue"
    outer.style.display = "inline-block"
    //outer.style.paddingRight = "0.25em"
    outer.style.lineHeight = "0"; // necessary so the bottom right arrow is aligned nicely
    
    // const img = document.createElement("img")
    // img.setAttribute("src", node.attrs.src)
    // img.style.width = "100%"
    //img.style.border = "1px solid red"
    
    const handle = document.createElement("span")
    handle.style.position = "absolute"
    handle.style.bottom = "0px"
    handle.style.right = "0px"
    handle.style.width = "10px"
    handle.style.height = "10px"
    handle.style.border = "3px solid black"
    handle.style.borderTop = "none"
    handle.style.borderLeft = "none"
    handle.style.cursor = "nwse-resize"
    handle.className = "resize-handle"
    
    handle.onmousedown = e => {
      e.preventDefault()
      
      const startX = e.pageX;
      const startY = e.pageY;
      
      const fontSize = getFontSize(outer)
      
      const startWidth = parseFloat(node.attrs.width.match(/(.+)em/)[1])
            
      const onMouseMove = (e) => {
        const currentX = e.pageX;
        const currentY = e.pageY;
        
        const diffInPx = currentX - startX
        const diffInEm = diffInPx / fontSize
                
        let width = `${startWidth + diffInEm}em`;
        outer.style.width = width;
        this.width = width;
        
      }
      
      const onMouseUp = (e) => {    
        //console.log(this.width);    
        e.preventDefault()
        
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
  
        let resolvedPos = view.state.doc.resolve(this.getPos())
                
       const transaction = view.state.tr.setNodeMarkup(resolvedPos, null, {src: node.attrs.src, width: this.width} ) //.setSelection(view.state.selection);
              
         view.dispatch(transaction)
      }
      
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }
    
    outer.appendChild(handle)
    //outer.appendChild(img)
        
    //this.dom = outer
    // this.img = img
    this.handle = handle
    this.outer = outer;
    return outer;
  }
  
  let imgAttrs = {width: '10em'};
  

let newImageSettings = {createOverlay: imageOverlay, extraAttributes: imgAttrs, updateOverlay: overlayUpdate}; //{ uploadFile: uploadImage }
const imageSettings = {...defaultSettings, ...newImageSettings};