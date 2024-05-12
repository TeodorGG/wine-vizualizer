const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3003;

const csvFilePath = path.join(__dirname, './dataset/dataset.csv');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/data', (req, res) => {
    const results = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/unique-countries', (req, res) => {
    const countries = new Set(); 
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            countries.add(data.country); 
        })
        .on('end', () => {
            res.json([...countries]); 
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.get('/unique-vintages', (req, res) => {
    const vintages = new Set();

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data.vintage) {
                vintages.add(data.vintage);
            }
        })
        .on('end', () => {
            const sortedVintages = Array.from(vintages).sort((a, b) => a - b);
            res.json(sortedVintages); 
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.get('/search-wines', (req, res) => {
    const query = req.query.name.toLowerCase();
    const matches = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data.name && data.name.toLowerCase().includes(query)) {
                if (!matches.includes(data.name)) {
                    matches.push(data.name);
                }
            }
        })
        .on('end', () => {
            res.json(matches.slice(0, 5)); 
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.get('/search-wines-l', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const filters = req.query;
    let results = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            let isValid = true;
            if (filters.name && filters.name.trim() !== "" && !data.name.toLowerCase().includes(filters.name.toLowerCase())) {
                isValid = false;
            }
            if (filters.country && filters.country.trim() !== "" && !data.country.toLowerCase().includes(filters.country.toLowerCase())) {
                isValid = false;
            }
            if (filters.vintage && !data.vintage.includes(parseInt(filters.vintage))) {
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
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedResults = results.slice(startIndex, endIndex);

            res.json({
                data: paginatedResults,
                page,
                limit,
                totalPages: Math.ceil(results.length / limit)
            });
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.get('/wine/:id', (req, res) => {
    const wineId = req.params.id;
    let found = false;

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data.id === wineId) {
                res.json(data); 
                found = true;
            }
        })
        .on('end', () => {
            if (!found) {
                res.status(404).send('Wine not found');
            }
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.get('/compare-wines', (req, res) => {
    const { country1, country2, criteria } = req.query;
    const criteriaObj = JSON.parse(criteria);
    const results = { country1: [], country2: [] };

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data.country.toLowerCase() === country1.toLowerCase()) {
                if (meetsCriteria(data, criteriaObj)) {
                    results.country1.push(data);
                }
            } else if (data.country.toLowerCase() === country2.toLowerCase()) {
                if (meetsCriteria(data, criteriaObj)) {
                    results.country2.push(data);
                }
            }
        })
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

function meetsCriteria(data, criteria) {
    return Object.entries(criteria).every(([key, value]) => !value || data[key]);
}


app.get('/unique-values', (req, res) => {
    const producers = new Set();
    const countries = new Set();
    const vintages = new Set();
    const grapeVarieties = new Set();

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
                if (data[key] && data[key].trim() !== '') {
                    const grapeInfo = parseGrapeVariety(data[key]);
                    if (grapeInfo !== 'Parsing error') {
                        grapeVarieties.add(grapeInfo);
                    }
                }
            });
        })
        .on('end', () => {
            res.json({
                producers: Array.from(producers),
                countries: Array.from(countries),
                vintages: Array.from(vintages).sort((a, b) => a - b),
                grapeVarieties: Array.from(grapeVarieties)
            });
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

const columnMap = {
    countries: 'country',
    vintages: 'vintage',
    grapeVarieties: 'grape_variety',
    producers: 'producer'
};

function parseGrapeVariety(grapeVarietyString) {
    try {
      const formattedString = grapeVarietyString.replace(/'/g, '"');
      const grapeVarietyObject = JSON.parse(formattedString);
      return grapeVarietyObject.grapeVariety;
    } catch (error) {
      console.error('Failed to parse grape variety:', error);
      return 'Parsing error';
    }
  }

app.get('/compare-data', (req, res) => {
    const clientColumn = req.query.column;
    const values = req.query.values.split(',');
    if (values.length !== 2) {
        res.status(400).send('Please provide exactly two values.');
        return;
    }

    const csvColumn = columnMap[clientColumn] || clientColumn;

    const dataForFirstValue = [];
    const dataForSecondValue = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data[csvColumn] === values[0]) {
                dataForFirstValue.push(data);
            } else if (data[csvColumn] === values[1]) {
                dataForSecondValue.push(data);
            }
        })
        .on('end', () => {
            res.json({
                firstValue: dataForFirstValue,
                secondValue: dataForSecondValue
            });
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});

app.get('/search', (req, res) => {
    const keywords = req.query.keywords.toLowerCase().split(" ");
    const results = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            if (results.length < 5) {  // Limit the results to only 5 matches
                const datasetKeywords = JSON.parse(data.Keywords.toLowerCase());
                const matches = keywords.filter(keyword => datasetKeywords.includes(keyword));
                if (matches.length > 0) results.push(data);
            }
        })
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            res.status(500).send('Failed to read the CSV file');
        });
});


  





