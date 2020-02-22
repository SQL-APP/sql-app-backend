require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import seed data:
const make = require('./make');
const guitars = require('./guitars.js');

run();



async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();

                // First save types and get each returned row which has
        // the id of the type. Notice use of RETURNING:
        const savedTypes = await Promise.all(
            make.map(async make => {
                const result = await client.query(`
                    INSERT INTO make (make)
                    VALUES ($1)
                    RETURNING *;
                `,
                [make]);

                return result.rows[0];
            })
        );

        // [
        //     { name: 'orange tabby', id: 1 },
        //     { name: 'tuxedo', id: 2 },
        //     { name: 'angora', id: 3 },
        // ];

        // [
        //     {
        //         name: 'Felix',
        //         type: 'Tuxedo',
        //         url: 'assets/cats/felix.png',
        //         year: 1892,
        //         lives: 3,
        //         isSidekick: false
        //     },
        //     {
        //         name: 'Garfield',
        //         type: 'Orange Tabby',
        //         url: 'assets/cats/garfield.jpeg',
        //         year: 1978,
        //         lives: 7,
        //         isSidekick: false
        //     },
        // ];
    


        // "Promise all" does a parallel execution of async tasks
        await Promise.all(
            // for every cat data, we want a promise to insert into the db
            guitars.map(guitar => {


                const make = savedTypes.find(make => {
                    return make.make === guitar.make;
                });

                // This is the query to insert a cat into the db.
                // First argument is the function is the "parameterized query"
                return client.query(`
                    INSERT INTO guitars (make_id, model, url, year, is_left_handed)
                    VALUES ($1, $2, $3, $4, $5);
                `,
                    // Second argument is an array of values for each parameter in the query:
                [make.id, guitar.model, guitar.url, guitar.year, guitar.is_left_handed]);

            })
        );

        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}
