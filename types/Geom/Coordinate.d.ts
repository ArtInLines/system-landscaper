import Rectangle from './Rectangle';
type PositionStates = 'c' | 'tl' | 'tr' | 'bl' | 'br';
export default class Coordinate {
    point: number[];
    /**
     * Coordinates store x and y values.
     * @param {number} x x value. Defaults to 0.
     * @param {number} y y value. Defaults t 0.
     */
    constructor(x: number, y: number);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    /**
     * This is a pure convenience function.
     * @param {function} callback Callback function, that receives the current x/y value and an index (0 or 1) indicating whether it's x or y. It should return a new x/y value. It is called once for x and once for y.
     * @returns {Coordinate} Returns this to allow for chaining
     */
    map(callback: Function): Coordinate;
    /**
     * Update both values at once. This is a pure convenience function.
     * @param {number} x new x value
     * @param {nmber} y new y value. Defaults to the new x value.
     * @returns {Coordinate} Returns this to allow for chaining
     */
    update(x: number, y?: number): this;
    /**
     * Instance a Rectangle from this Coordinate.
     * @param {number} x Additional x-value. If `pos` isn't changed, this value is the width of the rectangle. Otherwise, if `tr` or `br` is chosen, this value determines the x-offset of the rectangle. Defaults to 0.
     * @param {number} y Additional y-value. If `pos` isn't changed, this value is the height of the rectangle. Otherwise, if `bl` or `br` is chosen, this value determines the y-offset of the rectangle. Defaults to 0.
     * @param {'c'|'tl'|'tr'|'bl'|'br'} pos Determines the position of this coordinate in the new rectangle. `c` stands for "center", `tl`, `tr`, `bl`, `br` stand for "top-left", "top-right", "bottom-left", "bottom-right", respectively. Defaults to `tl`.
     * @returns {Rectangle}
     */
    rect(x?: number, y?: number, pos?: PositionStates): Rectangle;
    /**
     * Copy the Coordinate to a new instance.
     * @returns {Coordinate}
     */
    copy(): Coordinate;
    static rand(maxX: number, maxY: number, exclude: Map<number, Coordinate> | null): Coordinate;
}
export {};
