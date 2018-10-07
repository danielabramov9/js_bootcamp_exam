const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const typeIS = process.argv[2];
const wordIS = process.argv[3];

const startDirname = __dirname;

var foundResult = [];

const searchWordInFile = async (path) => {
	let text = await readFile(path, 'utf8')

	if (!text) return;
	if (!new RegExp(`\\b${wordIS}\\b`).test(text)) return;

	foundResult.push(path)
}

const statTreatment = async (fullPath, fileName) => {

	let stats = await stat(fullPath)

	if (stats.isDirectory()) {

		return traverseDirectory(fullPath);

	} else if (stats.isFile()) {

		if (!fileName.endsWith(`.${typeIS}`)) return;
		return searchWordInFile(fullPath)

	} else {
		console.info('Unknown file type:', fullPath);
	}
}

const traverseDirectory = async (currentDirname) => {

	let listDir = await readdir(currentDirname);

	let promises = [];

	listDir.forEach(entry => {

		let fullPath = join(currentDirname, entry);

		promises.push(statTreatment(fullPath, entry));
	})

	await Promise.all(promises);
}

traverseDirectory(startDirname)
.then(() => {

	if (!foundResult.length) {
		return console.log('not found');
	}

	console.log(`found in path:\n${foundResult.join('\n')}`);
	process.exit();

})
.catch(err => {
	console.error(err)
})
