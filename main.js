//TO DO

//1.) read JSON file
//2.) input JSON file into html/handlebars and make it display
//3.) make a handlebars/css template and have it save after running
//4.) import scraper script and use it to generate JSON file
//5.) generate a unique QR code and place it on the label
//6.) make a basic ui to run

import fs from 'fs';

const input = JSON.parse(fs.readFileSync('test.json', 'utf8'));

const checkedPictograms = {
	flame: false, //flammable
	flameCircle: false, //oxidizer
	corrosion: false, //corrosive
	skull: false, //toxic
	health: false, //acute toxicity
	irritant: false, //irritant
	gas: false, //gas
	environment: false, //environmental
	explosive: false, //explosive
};

function run(input) {
	const chemicalNames = [];
	const allPictograms = new Set();

	console.log(input.chemicals);
	for (const chemical of input.chemicals) {
		chemicalNames.push(chemical.name);
		for (const pictogram of chemical.pictograms) {
			allPictograms.add(pictogram);
		}
	}

	console.log(allPictograms);

	//check off any present pictograms
	for (const pictogram of allPictograms) {
		if (checkedPictograms[pictogram] === false) {
			checkedPictograms[pictogram] = true;
			console.log('changed it to true');
		}
	}
	console.log(chemicalNames);
	console.log(checkedPictograms);
}

run(input);
