module.exports = createDocumentEvents();

function createDocumentEvents() {
	if (typeof document === undefined) {
		return { on: () => {}, off: () => {} };
	}

	return {
		on: on,
		off: off,
	};
}

function on(eventName, handler) {
	document.addEventListener(eventName, handler);
}

function off(eventName, handler) {
	document.removeEventListener(eventName, handler);
}
