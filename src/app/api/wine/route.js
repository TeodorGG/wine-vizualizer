"use server"
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { NextResponse } from 'next/server';
import { getUrl } from '@/app/api_function';

const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');

export async function GET(request) {
    const url = new URL(getUrl(request));

    const id = (url.searchParams.get('id') || '');

    let found = false;

    var results = {};
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.id === id) {
                        results = data;
                        found = true;
                        resolve();
                    }
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify( results ), {
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
