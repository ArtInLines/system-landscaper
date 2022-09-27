const randint = require('../Utils/random').randint;

class Coordinate {
	/**
	 * Coordinates store x and y values.
	 * @param {number} x x value. Defaults to 0.
	 * @param {number} y y value. Defaults t 0.
	 */
	constructor(x, y) {
		this.point = [x, y];
	}

	get x() {
		return this.point[0];
	}
	set x(value) {
		this.point[0] = value;
	}
	get y() {
		return this.point[1];
	}
	set y(value) {
		this.point[1] = value;
	}

	/**
	 * This is a pure convenience function.
	 * @param {function} callback Callback function, that receives the current x/y value and an index (0 or 1) indicating whether it's x or y. It should return a new x/y value. It is called once for x and once for y.
	 * @returns {Coordinate} Returns this to allow for chaining
	 */
	map(callback) {
		this.point = this.point.map((v, i) => callback(v, i));
		return this;
	}

	/**
	 * Update both values at once. This is a pure convenience function.
	 * @param {number} x new x value
	 * @param {nmber} y new y value. Defaults to the new x value.
	 * @returns {Coordinate} Returns this to allow for chaining
	 */
	update(x, y = x) {
		this.x = x;
		this.y = y;
		return this;
	}

	/**
	 * Instance a Rectangle from this Coordinate.
	 * @param {number} x Additional x-value. If `pos` isn't changed, this value is the width of the rectangle. Otherwise, if `tr` or `br` is chosen, this value determines the x-offset of the rectangle. Defaults to 0.
	 * @param {number} y Additional y-value. If `pos` isn't changed, this value is the height of the rectangle. Otherwise, if `bl` or `br` is chosen, this value determines the y-offset of the rectangle. Defaults to 0.
	 * @param {'c'|'tl'|'tr'|'bl'|'br'} pos Determines the position of this coordinate in the new rectangle. `c` stands for "center", `tl`, `tr`, `bl`, `br` stand for "top-left", "top-right", "bottom-left", "bottom-right", respectively. Defaults to `tl`.
	 * @returns {Rectangle}
	 */
	rect(x = 0, y = 0, pos = 'tl') {
		const Rectangle = require('./Rectangle');
		switch (pos) {
			case 'tl':
				return new Rectangle(this.x, this.y, x, y);
			case 'tr':
				return new Rectangle(x, this.y, this.x, y);
			case 'bl':
				return new Rectangle(this.x, y, x, this.y);
			case 'br':
				return new Rectangle(x, y, this.x, this.y);
			case 'c':
				return new Rectangle(this.x - x / 2, this.y - y / 2, x, y);
		}
	}

	/**
	 * Copy the Coordinate to a new instance.
	 * @returns {Coordinate}
	 */
	copy() {
		return new Coordinate(this.point[0], this.point[1]);
	}

	static rand(maxX, maxY, exclude) {
		const xVal = randint(maxX);
		const yVal = randint(maxY);
		if (exclude) {
			while (exclude.has(xVal) && exclude.has(yVal)) {
				xVal = randint(0, maxX);
				yVal = randint(0, maxY);
			}
		}
		return new Coordinate(xVal, yVal);
	}
}

module.exports = Coordinate;
