/**
 * Finds the absolute position of an element on a page
 */
export default function findElementPosition(obj: HTMLElement): [number, number] {
	let curleft = 0,
		curtop = 0;
	if (obj.offsetParent) {
		let o: HTMLElement | null = obj;
		do {
			curleft += o.offsetLeft;
			curtop += o.offsetTop;
		} while ((o = o.offsetParent as HTMLElement | null) !== null);
	}

	return [curleft, curtop];
}
