/**
 * Create a new SVG-Element. Optionally set attributes of the element immediately too.
 * @param {String} tagName Desired type of svg-element
 * @param {?Object<String, String>} attrs Object mapping attribute names to values. If `null`, no attributes are set. Defaults to `null`.
 * @returns {SVGElement}
 */
export function createEl(tagName: string, attrs?: any | null): SVGElement;
/**
 * Append a child element to another element.
 * @param {SVGElement} el Parent Element
 * @param {SVGElement | String} child Child Element. If a String is given, a new Element with the specified tagName is created.
 * @returns {SVGElement} The appended child
 */
export function append(el: SVGElement, child: SVGElement | string): SVGElement;
/**
 * Set an SVG-Element's link attribute.
 * @param {SVGElement} el Element that gets linked from
 * @param {String} target Target URL
 * @returns {SVGElement}
 */
export function setLink(el: SVGElement, target: string): SVGElement;
/**
 * Get the link-address currently targeted by `el`. Returns `null`, if `el` has no link attribute.
 * @param {SVGElement} el
 * @returns {?String}
 */
export function getLink(el: SVGElement): string | null;
/**
 * Set an attribute with a not further specified namespace.
 * @param {SVGElement} el
 * @param {String} name Attribute Name
 * @param {String} val Attribute Value
 * @returns {SVGElement}
 */
export function setAttr(el: SVGElement, name: string, val?: string): SVGElement;
/**
 * Set several attributes at once. This calls setAttr() for each attribute.
 * @param {SVGElement} el
 * @param {Object<String, String>} attrs Object mapping attribute names to values
 * @returns {SVGElement} The modified element
 */
export function setAttrs(el: SVGElement, attrs: any): SVGElement;
/**
 * Get the value associated with the specified attribute. Returns `null` if `el` has no attribute with the name `name`.
 * @param {SVGElement} el
 * @param {String} name Attribute Name
 * @returns {?String}
 */
export function getAttr(el: SVGElement, name: string): string | null;
/**
 * Create an Arrow Marker for a specified node-size. A marker should only be defined once in a <defs> child element of the root <svg> element.
 * @param {number} width
 * @param {number} height
 * @param {string} id ID of the marker. This is used to refer to the marker again later. Defaults to `Arrow`.
 * @returns {SVGMarkerElement}
 */
export function createArrowMarker(size: any, id?: string): SVGMarkerElement;
