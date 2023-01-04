/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author ArtInLines / Updated to TypeScript + Minor Changes (https://github.com/artinlines)
 */

import documentEvents from '../Utils/documentEvents';
import findElementPosition from './findElementPosition';

// TODO: Move to input namespace
// TODO: Methods should be extracted into the prototype. This class
// does not need to consume so much memory for every tracked element
export default function dragndrop(element: HTMLElement) {
	let start: any,
		drag: any,
		end: any,
		scroll: any,
		prevSelectStart: any,
		prevDragStart: any,
		startX = 0,
		startY = 0,
		dragObject: any,
		touchInProgress = false,
		pinchZoomLength = 0,
		getMousePos = function (e: MouseEvent) {
			let posx = 0,
				posy = 0;

			e = e || window.event;

			if (e.pageX || e.pageY) {
				posx = e.pageX;
				posy = e.pageY;
			} else if (e.clientX || e.clientY) {
				posx = e.clientX + window.document.body.scrollLeft + window.document.documentElement.scrollLeft;
				posy = e.clientY + window.document.body.scrollTop + window.document.documentElement.scrollTop;
			}

			return [posx, posy];
		},
		move = function (e: Event, clientX: number, clientY: number) {
			if (drag) {
				drag(e, { x: clientX - startX, y: clientY - startY });
			}

			startX = clientX;
			startY = clientY;
		},
		stopPropagation = function (e: Event) {
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},
		preventDefault = function (e: Event) {
			if (e.preventDefault) e.preventDefault();
		},
		handleDisabledEvent = function (e: Event) {
			stopPropagation(e);
			return false;
		},
		handleMouseMove = function (e: MouseEvent) {
			e = e || window.event;

			move(e, e.clientX, e.clientY);
		},
		handleMouseDown = function (e: MouseEvent) {
			e = e || window.event;
			if (touchInProgress) {
				// modern browsers will fire mousedown for touch events too
				// we do not want this, since touch is handled separately.
				stopPropagation(e);
				return false;
			}
			// for IE, left click == 1
			// for Firefox, left click == 0
			let isLeftButton = (e.button === 1 && window.event !== null) || e.button === 0;

			if (isLeftButton) {
				startX = e.clientX;
				startY = e.clientY;

				// TODO: bump zIndex?
				dragObject = e.target || e.srcElement;

				if (start) {
					start(e, { x: startX, y: startY });
				}

				documentEvents.on('mousemove', handleMouseMove);
				documentEvents.on('mouseup', handleMouseUp);

				stopPropagation(e);
				// TODO: What if event already there? Not bullet proof:
				prevSelectStart = window.document.onselectstart;
				prevDragStart = window.document.ondragstart;

				window.document.onselectstart = handleDisabledEvent;
				dragObject.ondragstart = handleDisabledEvent;

				// prevent text selection (except IE)
				return false;
			}
		},
		handleMouseUp = function (e: MouseEvent) {
			e = e || window.event;

			documentEvents.off('mousemove', handleMouseMove);
			documentEvents.off('mouseup', handleMouseUp);

			window.document.onselectstart = prevSelectStart;
			dragObject.ondragstart = prevDragStart;
			dragObject = null;
			if (end) {
				end(e);
			}
		},
		handleMouseWheel = function (e: WheelEvent) {
			if (typeof scroll !== 'function') {
				return;
			}

			e = e || window.event;
			if (e.preventDefault) e.preventDefault();

			e.returnValue = false;
			let delta = -e.deltaY,
				mousePos = getMousePos(e),
				elementOffset = findElementPosition(element),
				relMousePos = {
					x: mousePos[0] - elementOffset[0],
					y: mousePos[1] - elementOffset[1],
				};

			scroll(e, delta, relMousePos);
		},
		updateScrollEvents = function (scrollCallback: any) {
			if (!scroll && scrollCallback) {
				// client is interested in scrolling. Start listening to events:
				element.addEventListener('wheel', handleMouseWheel, false);
			} else if (scroll && !scrollCallback) {
				element.removeEventListener('wheel', handleMouseWheel, false);
			}

			scroll = scrollCallback;
		},
		getPinchZoomLength = function (finger1: Touch, finger2: Touch) {
			return (finger1.clientX - finger2.clientX) * (finger1.clientX - finger2.clientX) + (finger1.clientY - finger2.clientY) * (finger1.clientY - finger2.clientY);
		},
		handleTouchMove = function (e: TouchEvent) {
			if (e.touches.length === 1) {
				stopPropagation(e);

				let touch = e.touches[0];
				move(e, touch.clientX, touch.clientY);
			} else if (e.touches.length === 2) {
				// it's a zoom:
				let currentPinchLength = getPinchZoomLength(e.touches[0], e.touches[1]);
				let delta = 0;
				if (currentPinchLength < pinchZoomLength) {
					delta = -1;
				} else if (currentPinchLength > pinchZoomLength) {
					delta = 1;
				}
				scroll(e, delta, { x: e.touches[0].clientX, y: e.touches[0].clientY });
				pinchZoomLength = currentPinchLength;
				stopPropagation(e);
				preventDefault(e);
			}
		},
		handleTouchEnd = function (e: MouseEvent) {
			touchInProgress = false;
			documentEvents.off('touchmove', handleTouchMove);
			documentEvents.off('touchend', handleTouchEnd);
			documentEvents.off('touchcancel', handleTouchEnd);
			dragObject = null;
			if (end) {
				end(e);
			}
		},
		handleSignleFingerTouch = function (e: TouchEvent, touch: Touch) {
			stopPropagation(e);
			preventDefault(e);

			startX = touch.clientX;
			startY = touch.clientY;

			dragObject = e.target || e.srcElement;

			if (start) {
				start(e, { x: startX, y: startY });
			}
			// TODO: can I enter into the state when touch is in progress
			// but it's still a single finger touch?
			if (!touchInProgress) {
				touchInProgress = true;
				documentEvents.on('touchmove', handleTouchMove);
				documentEvents.on('touchend', handleTouchEnd);
				documentEvents.on('touchcancel', handleTouchEnd);
			}
		},
		handleTouchStart = function (e: TouchEvent) {
			if (e.touches.length === 1) {
				return handleSignleFingerTouch(e, e.touches[0]);
			} else if (e.touches.length === 2) {
				// handleTouchMove() will care about pinch zoom.
				stopPropagation(e);
				preventDefault(e);

				pinchZoomLength = getPinchZoomLength(e.touches[0], e.touches[1]);
			}
			// don't care about the rest.
		};

	element.addEventListener('mousedown', handleMouseDown);
	element.addEventListener('touchstart', handleTouchStart);

	return {
		onStart: function (callback: any) {
			start = callback;
			return this;
		},

		onDrag: function (callback: any) {
			drag = callback;
			return this;
		},

		onStop: function (callback: any) {
			end = callback;
			return this;
		},

		/**
		 * Occurs when mouse wheel event happens. callback = function(e, scrollDelta, scrollPoint);
		 */
		onScroll: function (callback: any) {
			updateScrollEvents(callback);
			return this;
		},

		release: function () {
			// TODO: could be unsafe. We might wanna release dragObject, etc.
			element.removeEventListener('mousedown', handleMouseDown);
			element.removeEventListener('touchstart', handleTouchStart);

			documentEvents.off('mousemove', handleMouseMove);
			documentEvents.off('mouseup', handleMouseUp);
			documentEvents.off('touchmove', handleTouchMove);
			documentEvents.off('touchend', handleTouchEnd);
			documentEvents.off('touchcancel', handleTouchEnd);

			updateScrollEvents(null);
		},
	};
}
