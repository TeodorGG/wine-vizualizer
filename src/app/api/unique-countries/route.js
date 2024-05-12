import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; 
export async function GET(request) {
    const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

    const countries = new Set(); 

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    countries.add(data.country); 
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify( [...countries] ), {
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

