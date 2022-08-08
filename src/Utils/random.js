/**
 * Get a pseudo-random integer in the interval [start, end] (end is inclusive).
 * @param {number} end
 * @param {number} start Defaults to 0.
 * @returns {number}
 */
function randint(end, start = 0) {
	return Math.floor(Math.random() * (end + 1)) + start;
}

module.exports = { randint };
