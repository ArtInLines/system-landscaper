/**
 * Get a pseudo-random integer in the interval [start, end] (end is inclusive).
 * @param {number} end
 * @param {number} start Defaults to 0.
 * @returns {number}
 */
export default function randint(end: number, start: number = 0): number {
	return Math.floor(Math.random() * (end + 1)) + start;
}
