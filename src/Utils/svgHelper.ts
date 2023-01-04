export type AttrsObj = {
	[index: string]: string;
};
const svgns = 'http://www.w3.org/2000/svg';
const xlinkns = 'http://www.w3.org/1999/xlink';

/**
 * Create a new SVG-Element. Optionally set attributes of the element immediately too.
 * @param {String} tagName Desired type of svg-element
 * @param {?Object<String, String>} attrs Object mapping attribute names to values. If `null`, no attributes are set. Defaults to `null`.
 * @returns {SVGElement}
 */
export function createEl(tagName: string, attrs?: null | AttrsObj): SVGElement;
export function createEl(tagName: 'svg', attrs?: null | AttrsObj): SVGSVGElement;
export function createEl(tagName: 'g', attrs?: null | AttrsObj): SVGGraphicsElement;
export function createEl(tagName: string, attrs: null | AttrsObj = null): SVGElement {
	let el = document.createElementNS(svgns, tagName);
	if (attrs) setAttrs(el, attrs);
	return el;
}

/**
 * Append a child element to another element.
 * @param {SVGElement} el Parent Element
 * @param {SVGElement | String} child Child Element. If a String is given, a new Element with the specified tagName is created.
 * @returns {SVGElement} The appended child
 */
export function append(el: SVGElement, child: SVGElement | string): SVGElement {
	if (typeof child === 'string') child = createEl(child);
	el.appendChild(child);
	return child;
}

/**
 * Set an SVG-Element's link attribute.
 * @param {SVGElement} el Element that gets linked from
 * @param {String} target Target URL
 * @returns {SVGElement}
 */
export function setLink(el: SVGElement, target: string): SVGElement {
	el.setAttributeNS(xlinkns, 'xlink:href', target);
	return el;
}

/**
 * Get the link-address currently targeted by `el`. Returns `null`, if `el` has no link attribute.
 * @param {SVGElement} el
 * @returns {?String}
 */
export function getLink(el: SVGElement): null | string {
	return el.getAttributeNS(xlinkns, 'xlink:href');
}

/**
 * Set an attribute with a not further specified namespace.
 * @param {SVGElement} el
 * @param {String} name Attribute Name
 * @param {?String} val Attribute Value
 * @returns {SVGElement}
 */
export function setAttr(el: SVGElement, name: string, val: string | null = null): SVGElement {
	if (val !== null) el.setAttributeNS(null, name, val);
	else el.removeAttributeNS(null, name);
	return el;
}

/**
 * Set several attributes at once. This calls setAttr() for each attribute.
 * @param {SVGElement} el
 * @param {Object<String, String>} attrs Object mapping attribute names to values
 * @returns {SVGElement} The modified element
 */
export function setAttrs(el: SVGElement, attrs: AttrsObj): SVGElement {
	for (let name in attrs) {
		setAttr(el, name, attrs[name]);
	}
	return el;
}

/**
 * Get the value associated with the specified attribute. Returns `null` if `el` has no attribute with the name `name`.
 * @param {SVGElement} el
 * @param {String} name Attribute Name
 * @returns {?String}
 */
export function getAttr(el: SVGElement, name: string): string | null {
	return el.getAttributeNS(null, name);
}

/**
 * Create an Arrow Marker for a specified node-size. A marker should only be defined once in a <defs> child element of the root <svg> element.
 * @param {number} width
 * @param {number} height
 * @param {string} id ID of the marker. This is used to refer to the marker again later. Defaults to `Arrow`.
 * @returns {SVGMarkerElement}
 */
export function createArrowMarker(size: number, id: string): SVGElement;
export function createArrowMarker(width: number, height: number, id: string): SVGElement;
export function createArrowMarker(x: number, y: number | string, z: string = 'Arrow'): SVGElement {
	let width: number, height: number, id: string;
	if (typeof y === 'string') {
		width = height = x;
		id = y;
	} else {
		width = x;
		height = y;
		id = z;
	}

	let marker = createEl('marker');
	setAttr(marker, 'id', id);
	setAttr(marker, 'viewBox', `0 0 ${width} ${height}`);
	setAttr(marker, 'refX', `${width}`);
	setAttr(marker, 'refY', `${height / 2}`);
	setAttr(marker, 'markerUnits', 'strokeWidth');
	setAttr(marker, 'markerWidth', `${width}`);
	setAttr(marker, 'markerHeight', `${height / 2}`);
	setAttr(marker, 'fill', '#333');
	setAttr(marker, 'orient', 'auto');
	let path = append(marker, 'path');
	setAttr(path, 'd', `M 0 0 L ${width} ${height / 2} L 0 ${width} z`);
	return marker;
}

export default {
	createEl,
	createArrowMarker,
	getAttr,
	setAttr,
	setAttrs,
	setLink,
	getLink,
	append,
};
