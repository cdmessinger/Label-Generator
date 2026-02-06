//TO DO

//1.) read JSON file
//2.) input JSON file into html/handlebars and make it display
//3.) make a handlebars/css template and have it save after running
//4.) import scraper script and use it to generate JSON file
//5.) generate a unique QR code and place it on the label
//6.) make a basic ui to run

import fs from 'fs';

const checkedPictograms = {
	flammable: false, //flammable
	corrosive: false, //corrosive
	irritant: false, //irritant
	acuteToxicity: false, //toxic
	oxidizer: false, //oxidizer
	reactive: false, //explosive
	healthHazard: false, //acute toxicity
	environmental: false, //environmental
	gas: false, //gas
};

export function formatData(input) {
	const returnData = {};

	//initialize variables
	const chemicalList = [];
	const allPictograms = new Set();

	//extract names/pictograms
	console.log('INPUT:', input.chemicals);
	for (const chemical of input.chemicals) {
		chemicalList.push(chemical.name);
		for (const pictogram of chemical.pictograms) {
			allPictograms.add(pictogram);
		}
	}

	console.log('ALL PICTOGRAMS FOUND:', allPictograms);

	//check off any present pictograms
	for (const pictogram of allPictograms) {
		if (checkedPictograms[pictogram] === false) {
			checkedPictograms[pictogram] = true;
		}
	}

	returnData.chemicalList = chemicalList;
	returnData.pictograms = checkedPictograms;

	console.log('RETURNED DATA:', returnData);
	return returnData;
}
