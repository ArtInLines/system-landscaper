const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function count_loc_of_file(filepath) {
	const rs = fs.createReadStream(filepath);
	const rl = readline.createInterface({
		input: rs,
		crlfDelay: Infinity,
		// Note: we use the crlfDelay option to recognize all instances of CR LF ('\r\n') in input.txt as a single line break.
	});

	let count = 0;
	for await (const line of rl) {
		if (line.trim() !== '') count++;
	}

	return count;
}

async function count_loc_of_dir(dirpath, recursive = true) {
	let dir = fs.readdirSync(dirpath, { withFileTypes: true });
	let files = dir.filter((dirent) => dirent.isFile());
	let count = 0;
	for (let f of files) {
		count += await count_loc_of_file(path.join(dirpath, f.name));
	}
	if (recursive) {
		let subdirs = dir.filter((dirent) => dirent.isDirectory());
		for (let d of subdirs) {
			count += await count_loc_of_dir(path.join(dirpath, d.name));
		}
	}
	return count;
}

async function main() {
	const a = await count_loc_of_dir(`${__dirname}/src`);
	const b = await count_loc_of_dir(`${__dirname}/test`);

	console.log('The test directory has:', b, 'lines of code');
	console.log('The src directory has:', a, 'lines of code');
	console.log('In total, this project has:', a + b, 'lines of code');
}

main();
