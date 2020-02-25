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
app.use(express.urlencoded({ extended: true }));
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

        // console.log(result.rows);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/guitars', async(req, res) => {
    const guitar = req.body;
    console.log(guitar);
    try {
        const result = await client.query(`
            INSERT INTO guitars (make_id, model, url, year, is_left_handed)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `,
        [guitar.make_id, guitar.model, guitar.url, guitar.year, guitar.is_left_handed]
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
app.get('/api/makes', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM make
            ORDER BY make;
        `);
        console.log(req);

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


app.get('/api/guitars/:guitarID', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM guitars
            WHERE guitars.model=$1`, 
            // the second parameter is an array of values to be SANITIZED then inserted into the query
            // i only know this because of the `pg` docs
        [Number(req.params.guitarID)]);
        console.log('thing', req.params.guitarID);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// app.put('/api/guitars', async (req, res) => {
//     // using req.body instead of req.params or req.query (which belong to /GET requests)
//     try {
//         console.log(req.body);
//         // make a new cat out of the cat that comes in req.body;
//         const result = await client.query(`
//             UPDATE cats
//             SET name = '${req.body.name}', 
//                 is_sidekick = '${req.body.is_sidekick}', 
//                 lives = '${req.body.lives}', 
//                 year = '${req.body.year}', 
//                 url = '${req.body.url}',
//                 type_id = '${req.body.type_id}'
//             WHERE id = ${req.body.id};
//         `,
//     );

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});
