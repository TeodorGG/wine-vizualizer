import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; 
export async function GET(request) {
    const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

    const url = new URL(request.url);
    const keywords = url.searchParams.get('keywords').toLowerCase().split(" ");

    const results = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (results.length < 5) { 
                        const datasetKeywords = JSON.parse(data.Keywords.toLowerCase());
                        const matches = keywords.filter(keyword => datasetKeywords.includes(keyword));
                        if (matches.length > 0) results.push(data);
                    }
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify({ results }), {
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

