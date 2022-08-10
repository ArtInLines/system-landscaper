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
	 * @param {number} width Width of the area to be covered by the rectangle.
	 * @param {number} height Height of the area to be covered by the rectangle.
	 * @param {boolean} center Whether to center the rectangle on the current coordinate; otherwise this coordinate is the rectangle's top-left corner. Defaults to false.
	 * @returns {Rectangle}
	 */
	rect(width, height, center = false) {
		const Rectangle = require('./Rectangle');
		if (center) {
			return new Rectangle(this.x - width / 2, this.y - height / 2, width, height);
		} else {
			return new Rectangle(this.x, this.y, width, height);
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
