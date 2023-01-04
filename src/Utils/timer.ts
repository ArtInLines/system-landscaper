/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author ArtInLines / Updated to TypeScript + Minor changes (https://github.com/artinlines)
 */

export default function createTimer() {
	let lastTime = 0,
		vendors = ['ms', 'moz', 'webkit', 'o'],
		i: number,
		scope: any;

	if (typeof window !== 'undefined') {
		scope = window;
	} else if (typeof global !== 'undefined') {
		scope = global;
	} else {
		scope = {
			setTimeout: noop,
			clearTimeout: noop,
		};
	}

	for (i = 0; i < vendors.length && !scope.requestAnimationFrame; ++i) {
		let vendorPrefix = vendors[i];
		scope.requestAnimationFrame = scope[vendorPrefix + 'RequestAnimationFrame'];
		scope.cancelAnimationFrame = scope[vendorPrefix + 'CancelAnimationFrame'] || scope[vendorPrefix + 'CancelRequestAnimationFrame'];
	}

	if (!scope.requestAnimationFrame) {
		scope.requestAnimationFrame = rafPolyfill;
	}

	if (!scope.cancelAnimationFrame) {
		scope.cancelAnimationFrame = cancelRafPolyfill;
	}

	return timer;

	/**
	 * Timer that fires callback with given interval (in ms) until
	 * callback returns true;
	 */
	function timer(callback: () => any) {
		let intervalId: any;
		startTimer(); // start it right away.

		return {
			/**
			 * Stops execution of the callback
			 */
			stop: stopTimer,

			restart: restart,
		};

		function startTimer() {
			intervalId = scope.requestAnimationFrame(startTimer);
			if (!callback()) {
				stopTimer();
			}
		}

		function stopTimer() {
			scope.cancelAnimationFrame(intervalId);
			intervalId = 0;
		}

		function restart() {
			if (!intervalId) {
				startTimer();
			}
		}
	}

	function rafPolyfill(callback: (_: number) => any) {
		let currTime = new Date().getTime();
		let timeToCall = Math.max(0, 16 - (currTime - lastTime));
		let id = scope.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	}

	function cancelRafPolyfill(id: any) {
		scope.clearTimeout(id);
	}
}

function noop() {}
