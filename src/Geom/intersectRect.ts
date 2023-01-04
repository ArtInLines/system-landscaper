import intersect from 'gintersect';

export default function intersectRect(left: number, top: number, right: number, bottom: number, x1: number, y1: number, x2: number, y2: number) {
	return (
		intersect(left, top, left, bottom, x1, y1, x2, y2) ||
		intersect(left, bottom, right, bottom, x1, y1, x2, y2) ||
		intersect(right, bottom, right, top, x1, y1, x2, y2) ||
		intersect(right, top, left, top, x1, y1, x2, y2)
	);
}
