import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { NextResponse } from 'next/server';
import { getUrl } from '@/app/api_function';

const csvFilePath = path.join(process.cwd(), './dataset/dataset.csv');
const columnMap = {
    countries: 'country',
    vintages: 'vintage',
    grapeVarieties: 'grape_variety',
    producers: 'producer'
};

export async function GET(request) {
    const url = new URL(getUrl(request));
    const clientColumn = url.searchParams.get('column');
    const values = url.searchParams.get('values') ? url.searchParams.get('values').split(',') : [];

    if (values.length !== 2) {
        return new NextResponse('Please provide exactly two values.', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    const csvColumn = columnMap[clientColumn] || clientColumn;
    const dataForFirstValue = [];
    const dataForSecondValue = [];

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data[csvColumn] === values[0]) {
                        dataForFirstValue.push(data);
                    } else if (data[csvColumn] === values[1]) {
                        dataForSecondValue.push(data);
                    }
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Failed to read the CSV file:', err);
                    reject(err);
                });
        });

        return new NextResponse(JSON.stringify({
            firstValue: dataForFirstValue,
            secondValue: dataForSecondValue
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

export const dynamic = "force-dynamic"
