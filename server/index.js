const express = require('express');
const app = express();
app.use(require('morgan')('dev'));
app.use(express.json());
const port = 3000;
const{client, createTables, createUser, createProduct} = require('./db');

app.get('/api/users', async(req, res, next) => {
    try {
        
    } catch (error) {
        
    }
})

const init = async()=>{
    await client.connect();
    await createTables();

    const [Abby, Brian, Carla, David, Ethan, Frank, Gale, Helen, Electronics, Groceries, Apparel, Books, Beauty, Health, Industrial, Kitchen] = await Promise.all([
        createUser({username: 'Abby', password: 'starships'}),
        createUser({username: 'Brian', password: 'funny'}),
        createUser({username: 'Carla', password: 'mercedes'}),
        createUser({username: 'David', password: 'password'}),
        createUser({username: 'Ethan', password: 'bigbang'}),
        createUser({username: 'Frank', password: 'enstein'}),
        createUser({username: 'Gale', password: 'wind'}),
        createUser({username: 'Helen', password: 'hunt'}),
        createProduct({name: 'Electronics'}),
        createProduct({name: 'Groceries'}),
        createProduct({name: 'Apparel'}),
        createProduct({name: 'Books'}),
        createProduct({name: 'Beauty'}),
        createProduct({name: 'Health'}),
        createProduct({name: 'Industrial'}),
        createProduct({name: 'Kitchen'})
    ])
    
    app.listen(port, ()=>{
        console.log('You are connected to the database at port ' + port)
    })
};

init();