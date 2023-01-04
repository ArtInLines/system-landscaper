export type EventCallback = (...args: any[]) => void;
export type EventsMap = {
	[index: string]: EventCallback[];
};

export default class EventManager {
	events: EventsMap;

	constructor() {
		this.events = {};
	}

	on(event: string, callback: null | EventCallback = null) {
		if (!this.events[event]) this.events[event] = [];
		if (typeof callback === 'function') this.events[event].push(callback);
		return this;
	}

	once(event: string, callback: null | EventCallback) {
		if (typeof callback !== 'function') return;
		const self = this;
		const onceCallback = (...args: any[]) => {
			callback(...args);
			self.off(event, onceCallback);
		};
		return this.on(event, onceCallback);
	}

	off(event: string | null = null, callback: null | EventCallback = null) {
		if (event === null) this.events = {};
		else if (this.events[event]) {
			if (callback === null) delete this.events[event];
			else this.events[event] = this.events[event].filter((cb: EventCallback) => cb !== callback);
		}
		return this;
	}

	protected emit(event: string, ...args: any[]) {
		if (!this.events[event]) return;

		this.events[event].forEach((cb: EventCallback) => cb(...args));
		return this;
	}
}
