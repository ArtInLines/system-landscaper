class EventManager {
	constructor() {
		this.events = {};
	}

	on(event, callback) {
		if (!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
		return this;
	}

	once(event, callback) {
		const self = this;
		const onceCallback = (...args) => {
			callback(...args);
			self.off(event, onceCallback);
		};
		return this.on(event, onceCallback);
	}

	off(event, callback) {
		if (!this.events[event]) {
			return;
		}
		this.events[event] = this.events[event].filter((cb) => cb !== callback);
		return this;
	}

	emit(event, ...args) {
		if (!this.events[event]) {
			return;
		}
		this.events[event].forEach((cb) => cb(...args));
		return this;
	}
}

module.exports = EventManager;
