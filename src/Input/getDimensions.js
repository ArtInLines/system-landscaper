module.exports = getDimension;

function getDimension(container) {
	if (!container) {
		throw {
			message: 'Cannot get dimensions of undefined container',
		};
	}

	// TODO: Potential cross browser bug.
	let width = container.clientWidth;
	let height = container.clientHeight;

	return {
		left: 0,
		top: 0,
		width: width,
		height: height,
	};
}
