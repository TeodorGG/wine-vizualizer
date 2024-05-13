import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { getUrl } from '@/app/api_function';

import { NextResponse } from 'next/server';

export async function GET(request) {
    const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

    const url = new URL(getUrl(request));
    const query = (url.searchParams.get('name') || '').toLowerCase();
    const matches = [];

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.name && data.name.toLowerCase().includes(query)) {
                        if (!matches.includes(data.name)) {
                            matches.push(data.name);
                        }
                    }
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify(matches.slice(0, 5)), {
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

export const dynamic = "force-dynamic"
