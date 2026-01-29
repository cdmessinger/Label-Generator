import fs from 'fs';
import Handlebars from 'handlebars';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';

async function run() {
	generateHtml();

	await exportToPDF(
		'file://C:/Users/cd02m/OneDrive/Desktop/Label-Generator/output.html',
	);

	exec(process.platform === 'win32' ? 'start output.pdf' : 'open output.pdf');
}

//use handlebars template to generate document
function generateHtml() {
	//read template
	const templateSource = fs.readFileSync('template.hbs', 'utf8');

	//compile template
	const template = Handlebars.compile(templateSource);

	//our generated data

	const data = {
		chemicalName: 'Copper(II) Sulfate',
		hazards: ['Harmful if swallowed', 'Very toxic to aquatic life'],
		date: new Date().toLocaleDateString(),
	};

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
