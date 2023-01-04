export type ID = number;

let globalIDCounter: ID = 0;

export default function newID(): ID {
	return ++globalIDCounter;
}
