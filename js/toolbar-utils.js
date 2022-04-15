/**
 * Takes a human-readable label and returns it lowercased, with spaces replaced
 * by "-", for use in HTML attributes.
 *
 * @export
 * @param {String} label
 * @return {String} 
 */
export function stripLabel(label) {
    return label.toLowerCase().replaceAll(/ /g, "-");
}