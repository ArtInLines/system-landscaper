export = Rectangle;
declare class Rectangle {
    constructor(x: any, y: any, width: any, height: any);
    x: any;
    y: any;
    width: any;
    height: any;
    set left(arg: any);
    get left(): any;
    set right(arg: any);
    get right(): any;
    set top(arg: any);
    get top(): any;
    set bottom(arg: any);
    get bottom(): any;
    /**	@param {Coordinate} coord */
    set center(arg: Coordinate);
    get center(): Coordinate;
    set centerX(arg: any);
    get centerX(): any;
    set centerY(arg: any);
    get centerY(): any;
    /**	@param {Coordinate} coord */
    set topLeft(arg: Coordinate);
    get topLeft(): Coordinate;
    /**	@param {Coordinate} coord */
    set topRight(arg: Coordinate);
    get topRight(): Coordinate;
    /**	@param {Coordinate} coord */
    set bottomLeft(arg: Coordinate);
    get bottomLeft(): Coordinate;
    /**	@param {Coordinate} coord */
    set bottomRight(arg: Coordinate);
    get bottomRight(): Coordinate;
    /**	@param {Coordinate} coord */
    set topCenter(arg: Coordinate);
    get topCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set bottomCenter(arg: Coordinate);
    get bottomCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set leftCenter(arg: Coordinate);
    get leftCenter(): Coordinate;
    /**	@param {Coordinate} coord */
    set rightCenter(arg: Coordinate);
    get rightCenter(): Coordinate;
    intersect(p1: any, p2: any): any;
    isPointInside(p: any, radius?: number): boolean;
    resize(factor: any): void;
}
