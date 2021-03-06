// load connection string from .env
require('dotenv').config();
// "require" pg (after `npm i pg`)
const pg = require('pg');
// Use the pg Client
const Client = pg.Client;
// **note:** you will need to create the database!

// async/await needs to run in a function
run();

async function run() {
    // make a new pg client to the supplied url
    // const client = new Client(process.env.DATABASE_URL);
    const client = new Client(process.env.DATABASE_URL);

    try {
        // initiate connecting to db
        await client.connect();
    
        // run a query to create tables
        await client.query(`
        CREATE TABLE make (
            id SERIAL PRIMARY KEY NOT NULL,
            make VARCHAR(256) NOT NULL
        );

        CREATE TABLE guitars (
            id SERIAL PRIMARY KEY NOT NULL,
            make_id INTEGER NOT NULL REFERENCES make(id),
            model VARCHAR(256) NOT NULL,
            url VARCHAR(256) NOT NULL,
            year INTEGER NOT NULL,
            is_left_handed BOOLEAN NOT NULL
        );
    `);

        console.log('create tables complete');
    }
    catch (err) {
        // problem? let's see the error...
        console.log(err);
    }
    finally {
        // success or failure, need to close the db connection
        client.end();
    }
    
}