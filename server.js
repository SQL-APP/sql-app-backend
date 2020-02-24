// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pg = require('pg');

console.log(process.env);
// Database Client
const Client = pg.Client;
const client = new Client(process.env.DATABASE_URL);
client.connect();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request

app.use(express.static('assets'));

app.use(express.json()); // enable reading incoming json data

// API Routes

app.get('/api/guitars', async(req, res) => {
    try {
        // const result = await client.query(`
        //     SELECT
        //         id,
        //         model,
        //         make,
        //         url,
        //         year,
        //         is_left_handed
        //     FROM GUITARS;
        // `);
        const result = await client.query(`
        SELECT
            g.*,
            m.make as make
        FROM guitars g
        JOIN make m
        ON  g.make_id = m.id
        ORDER BY g.year;
    `);

        console.log(result.rows);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/guitars', async(req, res) => {
    const guitar = req.body;

    try {
        const result = await client.query(`
            INSERT INTO guitars (make, make_id, model, url, year, is_left_handed)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        [guitar.make, guitar.makeId, guitar.model, guitar.url, guitar.year, guitar.is_left_handed]
        );
        
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// *** TYPES ***
app.get('/api/make', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM make
            ORDER BY make;
        `);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// app.get('/api/guitars/:guitarID', async(req, res) => {
//     try {
//         const result = await client.query(`
//             SELECT *
//             FROM guitars
//             WHERE guitars.id = 
//         `);

//         res.json(result.rows);
//     }
//     catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: err.message || err
//         });
//     }
// });


app.get('/api/guitars/:guitarId', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM guitars
            WHERE guitars.id=$1`, 
            // the second parameter is an array of values to be SANITIZED then inserted into the query
            // i only know this because of the `pg` docs
        [req.params.guitarID]);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});
