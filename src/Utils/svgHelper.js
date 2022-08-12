const svgns = 'http://www.w3.org/2000/svg';
const xlinkns = 'http://www.w3.org/1999/xlink';

/**
 * Create a new SVG-Element. Optionally set attributes of the element immediately too.
 * @param {String} tagName Desired type of svg-element
 * @param {?Object<String, String>} attrs Object mapping attribute names to values. If `null`, no attributes are set. Defaults to `null`.
 * @returns {SVGElement}
 */
function createEl(tagName, attrs = null) {
	let el = document.createElementNS(svgns, tagName);
	if (attrs) setAttrs(el, attrs);
	return el;
}
module.exports.createEl = createEl;

/**
 * Append a child element to another element.
 * @param {SVGElement} el Parent Element
 * @param {SVGElement | String} child Child Element. If a String is given, a new Element with the specified tagName is created.
 * @returns {SVGElement} The appended child
 */
function append(el, child) {
	if (typeof child === 'string') child = createEl(child);
	el.appendChild(child);
	return child;
}
module.exports.append = append;

/**
 * Set an SVG-Element's link attribute.
 * @param {SVGElement} el Element that gets linked from
 * @param {String} target Target URL
 * @returns {SVGElement}
 */
function setLink(el, target) {
	el.setAttributeNS(xlinkns, 'xlink:href', target);
	return el;
}
module.exports.setLink = setLink;

/**
 * Get the link-address currently targeted by `el`. Returns `null`, if `el` has no link attribute.
 * @param {SVGElement} el
 * @returns {?String}
 */
function getLink(el) {
	return el.getAttributeNS(xlinkns, 'xlink:href');
}
module.exports.getLink = getLink;

/**
 * Set an attribute with a not further specified namespace.
 * @param {SVGElement} el
 * @param {String} name Attribute Name
 * @param {String} val Attribute Value
 * @returns {SVGElement}
 */
function setAttr(el, name, val = null) {
	if (val !== null) el.setAttributeNS(null, name, val);
	else el.removeAttributeNS(null, name);
	return el;
}
module.exports.setAttr = setAttr;

/**
 * Set several attributes at once. This calls setAttr() for each attribute.
 * @param {SVGElement} el
 * @param {Object<String, String>} attrs Object mapping attribute names to values
 * @returns {SVGElement} The modified element
 */
function setAttrs(el, attrs) {
	for (let name in attrs) {
		setAttr(el, name, attrs[name]);
	}
	return el;
}
module.exports.setAttrs = setAttrs;

/**
 * Get the value associated with the specified attribute. Returns `null` if `el` has no attribute with the name `name`.
 * @param {SVGElement} el
 * @param {String} name Attribute Name
 * @returns {?String}
 */
function getAttr(el, name) {
	return el.getAttributeNS(null, name);
}
module.exports.getAttr = getAttr;

/**
 * Create an Arrow Marker for a specified node-size. A marker should only be defined once in a <defs> child element of the root <svg> element.
 * @param {number} width
 * @param {number} height
 * @param {string} id ID of the marker. This is used to refer to the marker again later. Defaults to `Arrow`.
 * @returns {SVGMarkerElement}
 */
function createArrowMarker(size, id = 'Arrow') {
	let marker = createEl('marker');
	setAttr(marker, 'id', id);
	setAttr(marker, 'viewBox', `0 0 ${size} ${size}`);
	setAttr(marker, 'refX', `${size}`);
	setAttr(marker, 'refY', `${size / 2}`);
	setAttr(marker, 'markerUnits', 'strokeWidth');
	setAttr(marker, 'markerWidth', `${size}`);
	setAttr(marker, 'markerHeight', `${size / 2}`);
	setAttr(marker, 'fill', '#333');
	setAttr(marker, 'orient', 'auto');
	let path = append(marker, 'path');
	setAttr(path, 'd', `M 0 0 L ${size} ${size / 2} L 0 ${size} z`);
	return marker;
}
module.exports.createArrowMarker = createArrowMarker;
