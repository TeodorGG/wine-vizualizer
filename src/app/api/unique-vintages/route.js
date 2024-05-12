import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

import { NextResponse } from 'next/server';

export async function GET(request) {
    const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

    const vintages = new Set();

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.vintage) {
                        vintages.add(data.vintage);
                    }
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify( [...vintages] ), {
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

