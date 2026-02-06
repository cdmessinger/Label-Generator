import fs from 'fs';
import Handlebars from 'handlebars';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';
import { formatData } from './formatData.js';

const data = {
	chemicals: [
		//chemical list here
	],
	pictograms: {
		flammable: true,
		corrosive: true,
		irritant: true,
		acuteToxicity: true,
		oxidizer: false,
		reactive: true,
		healthHazard: false,
		environmental: true,
		gas: true,
	},
};

const generatorInfo = {
	startDate: new Date().toLocaleDateString(),
	endDate: '',
	name: 'Caleb Messinger',
	dept: 'Chemistry',
	room: '6-144',
	phone: '860-774-3048 x43048',
};

const input = JSON.parse(fs.readFileSync('test.json', 'utf8'));

async function run() {
	// 1.) import our list of chemicals and generator information

	// 2.) call our sds parser on each chemical and return data for each

	// 3.) compile the data and return it in a way handlebars can read

	const data = formatData(input); //if you add spreadsheet/QR functionality, it would go somewhere in this step

	//add our generator information to data
	data.generatorInfo = generatorInfo;

	// 4.) generate handlebars via template
	generateHtml(data);

	// 5.) export file to a pdf
	await exportToPDF(
		'file://C:/Users/cd02m/OneDrive/Desktop/Label-Generator/output.html',
	);

	// 6.) open the file
	exec(process.platform === 'win32' ? 'start output.pdf' : 'open output.pdf');
	process.exit(0);
}

//use handlebars template to generate document
function generateHtml(data) {
	console.log('RUNNNING HTML');
	//read template
	const templateSource = fs.readFileSync('template.hbs', 'utf8');

	//compile template
	const template = Handlebars.compile(templateSource);

	//format our chemical list to split columns and add in whitespace so you can manually write things in if needed
	const totalCells = 16; //max 16 chemicals that can fit per waste label
	const totalColumn = totalCells / 2; // 2 columns,

	//check if we have more chemicals than avaliable cells
	if (data.chemicalList.length > totalCells) {
		console.log(
			`Chemical List is greater than ${totalCells}, consider making a second label`,
		);
	}

	const leftColumn = []; //left column of chemicals in label
	const rightColumn = []; //right column of chemicals in label

	for (let i = 0; i < totalCells; i++) {
		let currChemical = data.chemicalList[i];

		//if we dont have a chemical in this index, replace it with an empty string to not break formating
		if (!currChemical) {
			currChemical = '';
		}

		// sort the chemicals
		if (i < totalColumn) {
			leftColumn.push(currChemical);
		} else {
			rightColumn.push(currChemical);
		}
	}

	data.leftColumn = leftColumn;
	data.rightColumn = rightColumn;

	console.log('DATA', data);

	//generate final HTML
	const html = template(data);

	//write output
	fs.writeFileSync('output.html', html);

	console.log('FILE GENERATED');
}

//use puppeteer to save as a pdf
async function exportToPDF(file) {
	const browser = await puppeteer.launch();
	console.log('BROWSER OPENED');
	const page = await browser.newPage();

	await page.goto(file, { waitUntil: 'networkidle0' });

	await page.pdf({
		path: 'output.pdf',
		printBackground: true,
		width: '8.5in',
		height: '11in',
	});
	console.log('FILE SAVED AS PDF');

	await browser.close;
	console.log('BROWSER CLOSED');
}

run();
