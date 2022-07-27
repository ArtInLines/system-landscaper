const eventify = require('ngraph.events');
const System = require('./System');

const defaultOpts = {};

class SystemLandscape {
	constructor(options) {
		this.options = Object.assign({}, defaultOpts, options);
		this.edges = [];
	}
}

module.exports = SystemLandscape;
