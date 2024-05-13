import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { NextResponse } from 'next/server';
import { getUrl } from '@/app/api_function';

export async function GET(request) {
    const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');
    const url = new URL(getUrl(request));
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 5;
    let results = [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    let isValid = true;
                    if (url.searchParams.has('name') && !data.name.toLowerCase().includes(url.searchParams.get('name').toLowerCase())) {
                        isValid = false;
                    }
                    if (url.searchParams.has('country') && !data.country.toLowerCase().includes(url.searchParams.get('country').toLowerCase())) {
                        isValid = false;
                    }
                    if (url.searchParams.has('vintage') && data.vintage !== url.searchParams.get('vintage')) {
                        isValid = false;
                    }
                    if (isValid) {
                        results.push({
                            id: data.id,
                            name: data.name,
                            country: data.country,
                            vintage: data.vintage
                        });
                    }
                })
                .on('end', () => {
                
                    resolve(results);
                })
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify({
            data: results.slice(startIndex, endIndex),
            page,
            limit,
            totalPages: Math.ceil(results.length / limit)
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
