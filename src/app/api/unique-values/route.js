import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { NextResponse } from 'next/server';

const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

export async function GET(request) {
    const producers = new Set();
    const countries = new Set();
    const vintages = new Set();
    const grapeVarieties = new Set();

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.producer && data.producer.trim() !== '') {
                        producers.add(data.producer);
                    }
                    if (data.country && data.country.trim() !== '') {
                        countries.add(data.country);
                    }
                    if (data.vintage && data.vintage.trim() !== '') {
                        vintages.add(data.vintage);
                    }
                    ['principalGrapeVariety', 'secondaryGrapeVariety', 'tertiaryGrapeVariety'].forEach(key => {
                        const grapeInfo = parseGrapeVariety(data[key]);
                        if (grapeInfo !== 'Parsing error') {
                            grapeVarieties.add(grapeInfo);
                        }
                    });
                })
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify({
            producers: Array.from(producers),
            countries: Array.from(countries),
            vintages: Array.from(vintages).sort((a, b) => a - b),
            grapeVarieties: Array.from(grapeVarieties)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Failed to process the CSV file' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function parseGrapeVariety(grapeVarietyString) {
    try {
        const formattedString = grapeVarietyString.replace(/'/g, '"');
        const grapeVarietyObject = JSON.parse(formattedString);
        return grapeVarietyObject.grapeVariety;
    } catch (error) {
        return 'Parsing error';
    }
}
