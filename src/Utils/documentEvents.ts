export default createDocumentEvents();

export function createDocumentEvents() {
	if (typeof document === undefined) {
		return { on: () => {}, off: () => {} };
	}

	return {
		on: on,
		off: off,
	};
}

export function on(eventName: string, handler: any) {
	document.addEventListener(eventName, handler);
}

export function off(eventName: string, handler: any) {
	document.removeEventListener(eventName, handler);
}
