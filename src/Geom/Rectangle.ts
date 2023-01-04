import Coordinate from './Coordinate';
import intersect from 'gintersect';

export default class Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	get left() {
		return this.x;
	}

	set left(x) {
		this.x = x;
	}

	get right() {
		return this.x + this.width;
	}

	set right(x) {
		this.width = x - this.x;
	}

	get top() {
		return this.y;
	}

	set top(y) {
		this.y = y;
	}

	get bottom() {
		return this.y + this.height;
	}

	set bottom(y) {
		this.height = y - this.y;
	}

	get center() {
		return new Coordinate(this.centerX, this.centerY);
	}

	/**	@param {Coordinate} coord */
	set center(coord) {
		this.centerX = coord.x;
		this.centerY = coord.y;
	}

	get centerX() {
		return this.x + this.width / 2;
	}

	set centerX(newX) {
		let currentX = this.centerX;
		let diff = newX - currentX;
		this.x += diff;
	}

	get centerY() {
		return this.y + this.height / 2;
	}

	set centerY(newY) {
		let currentY = this.centerY;
		let diff = newY - currentY;
		this.y += diff;
	}

	get topLeft() {
		return new Coordinate(this.x, this.y);
	}

	/**	@param {Coordinate} coord */
	set topLeft(coord) {
		this.top = coord.y;
		this.left = coord.x;
	}

	get topRight() {
		return new Coordinate(this.x + this.width, this.y);
	}

	/**	@param {Coordinate} coord */
	set topRight(coord) {
		this.top = coord.y;
		this.right = coord.x;
	}

	get bottomLeft() {
		return new Coordinate(this.x, this.y + this.height);
	}

	/**	@param {Coordinate} coord */
	set bottomLeft(coord) {
		this.bottom = coord.y;
		this.left = coord.x;
	}

	get bottomRight() {
		return new Coordinate(this.x + this.width, this.y + this.height);
	}

	/**	@param {Coordinate} coord */
	set bottomRight(coord) {
		this.bottom = coord.y;
		this.right = coord.x;
	}

	get topCenter() {
		return new Coordinate(this.x + this.width / 2, this.y);
	}

	/**	@param {Coordinate} coord */
	set topCenter(coord) {
		this.y = coord.y;
		this.centerX = coord.x;
	}

	get bottomCenter() {
		return new Coordinate(this.x + this.width / 2, this.y + this.height);
	}

	/**	@param {Coordinate} coord */
	set bottomCenter(coord) {
		this.y = coord.y - this.height;
		this.centerX = coord.x;
	}

	get leftCenter() {
		return new Coordinate(this.x, this.y + this.height / 2);
	}

	/**	@param {Coordinate} coord */
	set leftCenter(coord) {
		this.x = coord.x;
		this.centerY = coord.y;
	}

	get rightCenter() {
		return new Coordinate(this.x + this.width, this.y + this.height / 2);
	}

	/**	@param {Coordinate} coord */
	set rightCenter(coord) {
		this.x = coord.x - this.width;
		this.centerY = coord.y;
	}

	intersect(p1: Coordinate, p2: Coordinate) {
		return (
			intersect(this.left, this.top, this.left, this.bottom, p1.x, p1.y, p2.x, p2.y) ||
			intersect(this.left, this.bottom, this.right, this.bottom, p1.x, p1.y, p2.x, p2.y) ||
			intersect(this.right, this.bottom, this.right, this.top, p1.x, p1.y, p2.x, p2.y) ||
			intersect(this.right, this.top, this.left, this.top, p1.x, p1.y, p2.x, p2.y)
		);
	}

	isPointInside(p: Coordinate, radius = 1) {
		return this.left <= p.x + radius && this.right >= p.x - radius && this.top <= p.y + radius && this.bottom >= p.y - radius;
	}

	resize(factor: number) {
		this.width *= factor;
		this.height *= factor;
	}
}
