import { Plugin } from 'prosemirror-state';
import {Decoration, DecorationSet} from "prosemirror-view";

export const placeholderPlugin = new Plugin({
    state: {
      init() { return DecorationSet.empty; },
      apply(tr, set) {
        // Adjust decoration positions to changes made by the transaction
        set = set.map(tr.mapping, tr.doc);
        // See if the transaction adds or removes any placeholders
        let action = tr.getMeta(this);
        if (action && action.add) {
          let widget = document.createElement("placeholder");
          let deco = Decoration.widget(action.add.pos, widget, {id: action.add.id});
          set = set.add(tr.doc, [deco]);
        } else if (action && action.remove) {
          set = set.remove(set.find(null, null,
                                    spec => spec.id == action.remove.id));
        }
        return set;
      }
    },
    props: {
      decorations(state) { return this.getState(state); }
    }
  });
  
  function findPlaceholder(state, id) {
    let decos = placeholderPlugin.getState(state);
    let found = decos.find(null, null, spec => spec.id == id);
    return found.length ? found[0].from : null;
  }

  export const startImageUpload = function(view, file, schema) {
    // A fresh object to act as the ID for this upload
    let id = {};
  
    // Replace the selection with a placeholder
    let tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();
    tr.setMeta(placeholderPlugin, {add: {id, pos: tr.selection.from}});
    view.dispatch(tr);
  
    uploadImage(file).then(data => {
      let pos = findPlaceholder(view.state, id);
      // If the content around the placeholder has been deleted, drop
      // the image
      if (pos == null) return;
      // Otherwise, insert it at the placeholder's position, and remove
      // the placeholder
      view.dispatch(view.state.tr
                    .replaceWith(pos, pos, schema.nodes.image.create({src: data.url, id: data.id}))
                    .setMeta(placeholderPlugin, {remove: {id}}));
    }, () => {
      // On failure, just clean up the placeholder
      view.dispatch(tr.setMeta(placeholderPlugin, {remove: {id}}));
    });
  };

  function uploadFile(file) {
    let reader = new FileReader();
    return new Promise((accept, fail) => {
      reader.onload = () => accept(reader.result);
      reader.onerror = () => fail(reader.error);
      // Some extra delay to make the asynchronicity visible
      setTimeout(() => reader.readAsDataURL(file), 1500);
    });
  }


  let uploadImage = function(file) {
	// Create the XHR request
	var request = new XMLHttpRequest();
  const fd = new FormData();
  const uri = "/api/v1/file/new";

	// Return it as a Promise
	return new Promise(function (resolve, reject) {

		// Setup our listener to process compeleted requests
		request.onreadystatechange = function () {

			// Only run if the request is complete
			if (request.readyState !== 4) return;

			// Process the response
			if (request.status >= 200 && request.status < 300) {
				// If successful
        let data =  JSON.parse(request.responseText);
				resolve(data.result);
			} else {
				// If failed
				reject({
					status: request.status,
					statusText: request.statusText
				});
			}

		};

		// Setup our HTTP request
		request.open("POST", uri, true);
    fd.append('files', file);

		// Send the request
		request.send(fd);

	});
};