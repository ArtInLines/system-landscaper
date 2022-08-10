const Coordinate = require('./Coordinate');
const intersect = require('gintersect');

class Rectangle {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	get left() {
		return this.x;
	}

	get right() {
		return this.x + this.width;
	}

	get top() {
		return this.y;
	}

	get bottom() {
		return this.y + this.height;
	}

	get center() {
		return new Coordinate(this.x + this.width / 2, this.y + this.height / 2);
	}

	get centerX() {
		return this.x + this.width / 2;
	}

	get centerY() {
		return this.y + this.height / 2;
	}

	get topLeft() {
		return new Coordinate(this.x, this.y);
	}

	get topRight() {
		return new Coordinate(this.x + this.width, this.y);
	}

	get bottomLeft() {
		return new Coordinate(this.x, this.y + this.height);
	}

	get bottomRight() {
		return new Coordinate(this.x + this.width, this.y + this.height);
	}

	get topCenter() {
		return new Coordinate(this.x + this.width / 2, this.y);
	}

	get bottomCenter() {
		return new Coordinate(this.x + this.width / 2, this.y + this.height);
	}

	get leftCenter() {
		return new Coordinate(this.x, this.y + this.height / 2);
	}

	get rightCenter() {
		return new Coordinate(this.x + this.width, this.y + this.height / 2);
	}

	intersect(p1, p2) {
		return (
			intersect(this.left, this.top, this.left, this.bottom, p1.x, p1.y, p2.x, p2.y) ||
			intersect(this.left, this.bottom, this.right, this.bottom, p1.x, p1.y, p2.x, p2.y) ||
			intersect(this.right, this.bottom, this.right, this.top, p1.x, p1.y, p2.x, p2.y) ||
			intersect(this.right, this.top, this.left, this.top, p1.x, p1.y, p2.x, p2.y)
		);
	}
}

module.exports = Rectangle;
