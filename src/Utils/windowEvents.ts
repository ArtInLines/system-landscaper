export default function createDocumentEvents() {
	if (typeof window === 'undefined') {
		return {
			on: () => {},
			off: () => {},
		};
	}

	return {
		on: on,
		off: off,
	};
}

function on(type: any, listener: (this: Window, ev: any) => any) {
	window.addEventListener(type, listener);
}

function off(type: any, listener: (this: Window, ev: any) => any) {
	window.removeEventListener(type, listener);
}
