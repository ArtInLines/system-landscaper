globalIDCounter = 0;

module.exports = function newID() {
	return ++globalIDCounter;
};
