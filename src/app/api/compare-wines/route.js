import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { NextResponse } from 'next/server';

const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

export async function GET(request) {
    const url = new URL(request.url);
    const country1 = url.searchParams.get('country1') || '';
    const country2 = url.searchParams.get('country2') || '';
    const criteria = url.searchParams.get('criteria');

    const results = { country1: [], country2: [] };
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.country.toLowerCase() === country1.toLowerCase()) {
                        if (meetsCriteria(data, JSON.parse(criteria))) {
                            results.country1.push(data);
                        }
                    } else if (data.country.toLowerCase() === country2.toLowerCase()) {
                        if (meetsCriteria(data, JSON.parse(criteria))) {
                            results.country2.push(data);
                        }
                    }
                })
                .on('end', () => resolve())
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify(results), {
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

function meetsCriteria(data, criteria) {
    return Object.entries(criteria).every(([key, value]) => {
        return data[key] && data[key].toString() === value.toString();
    });
}
