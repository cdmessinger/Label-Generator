import fs from 'fs';
import Handlebars from 'handlebars';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';
import { formatData } from './formatData.js';
import { run } from '../SDS-Scraper/core/run.js';

const generatorInfo = {
	startDate: new Date().toLocaleDateString(),
	endDate: '',
	name: 'Caleb Messinger',
	dept: 'Chemistry',
	room: '6-144',
	phone: '860-774-3048 x43048',
};

const testList = [
	{ name: 'Sodium chloride', casNumber: '7647-14-5' },
	{ name: 'Nitric acid', casNumber: '7697-37-2' },
	{ name: 'Hydrochloric acid', casNumber: '7647-01-0' },
	{ name: 'Sulfuric acid', casNumber: '7664-93-9' },
	{ name: 'Acetic acid', casNumber: '64-19-7' },
	{ name: 'Ammonia', casNumber: '7664-41-7' },
	{ name: 'Sodium hydroxide', casNumber: '1310-73-2' },
	{ name: 'Potassium hydroxide', casNumber: '1310-58-3' },
	{ name: 'Ethanol', casNumber: '64-17-5' },
	{ name: 'Methanol', casNumber: '67-56-1' },
	{ name: 'Isopropanol', casNumber: '67-63-0' },
	{ name: 'Acetone', casNumber: '67-64-1' },
	{ name: 'Hydrogen peroxide', casNumber: '7722-84-1' },
	{ name: 'Copper(II) sulfate pentahydrate', casNumber: '7758-99-8' },
	{ name: 'Magnesium sulfate', casNumber: '7487-88-9' },
	{ name: 'Calcium chloride', casNumber: '10043-52-4' },
	{ name: 'Potassium nitrate', casNumber: '7757-79-1' },
	{ name: 'Glucose', casNumber: '50-99-7' },
];

const input = JSON.parse(fs.readFileSync('test.json', 'utf8'));

async function generateLabel() {
	// 1.) import our list of chemicals and generator information
	// this is from html form/webpage

	// 2.) call our sds parser on each chemical and return data for each

	//change function name for run
	const { allRecords, dataSummary } = await run(testList);
	console.log('SDS PARSER DATA SUMMARY: ', dataSummary);

	//add step to manually check mismatched SDS
	const extractedData = extractSDSData(allRecords);

	// 3.) compile the data and return it in a way handlebars can read

	const data = formatData(extractedData); //if you add spreadsheet/QR functionality, it would go somewhere in this step

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
	const totalCells = 18; //max 18	 chemicals that can fit per waste label
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

function extractSDSData(parsedSDSData) {
	const formatted = [];

	console.log(parsedSDSData, parsedSDSData.length);

	for (const record of parsedSDSData) {
		console.log('RECORD: ', record);
		const data = {};
		const name = record.name;

		data.name = name;
		data.casNumber = record.sdsData.data.sdsCASNumber;
		data.pictograms = record.sdsData.data.sdsPictograms;

		if (record.confidenceScore < 70) {
			data.flaggedForReview = true;
		} else {
			data.flaggedForReview = false;
		}

		formatted.push(data);
	}
	console.log('FORMATTED: ===> ', formatted);
	return formatted;
}

generateLabel();
