import Coordinate from './Coordinate';
export default class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    get left(): number;
    set left(x: number);
    get right(): number;
    set right(x: number);
    get top(): number;
    set top(y: number);
    get bottom(): number;
    set bottom(y: number);
    get center(): Coordinate;
    /**	@param {Coordinate} coord */
    set center(coord: Coordinate);
    get centerX(): number;
    set centerX(newX: number);
    get centerY(): number;
    set centerY(newY: number);
    get topLeft(): Coordinate;
    /**	@param {Coordinate} coord */
    set topLeft(coord: Coordinate);
    get topRight(): Coordinate;
    /**	@param {Coordinate} coord */
    set topRight(coord: Coordinate);
    get bottomLeft(): Coordinate;
    /**	@param {Coordinate} coord */
    set bottomLeft(coord: Coordinate);
    get bottomRight(): Coordinate;
    /**	@param {Coordinate} coord */
    set bottomRight(coord: Coordinate);
    get topCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set topCenter(coord: Coordinate);
    get bottomCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set bottomCenter(coord: Coordinate);
    get leftCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set leftCenter(coord: Coordinate);
    get rightCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set rightCenter(coord: Coordinate);
    intersect(p1: Coordinate, p2: Coordinate): any;
    isPointInside(p: Coordinate, radius?: number): boolean;
    resize(factor: number): void;
}
