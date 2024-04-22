const express = require('express');
const app = express();
app.use(require('morgan')('dev'));
app.use(express.json());
const port = 3000;
const{client, createTables, createUser, createProduct, createCart, fetchUsers, fetchProducts, fetchCart, destroyCart, authenticate, findUserWithToken, fetchProduct} = require('./db');

app.get('/api/users', async(req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch(ex) {
        next(ex)
    }
});

app.get('/api/products', async (req, res, next)=>{
    try {
        res.send(await fetchProducts());
    } catch (ex) {
        next(ex)
    };
});

app.get('/api/products/:id', async (req, res, next)=>{
    try {
        res.send(await fetchProduct());
    } catch (ex) {
        next(ex)
    }
})

app.get('/api/users/:id/cart', async(req, res, next)=>{
    try {
        if(req.params.id !== req.user.id){
            const error = Error('not authorized')
            error.status = 401;
            throw error;
        }
        res.status(201).send(await createCart({user_id: req.params.id, product_id: req.body.product_id}));
    } catch (ex) {
        next(ex)
    };
});

app.post('/api/users/:id/cart', async(req, res, next)=>{
    try {
        if(req.params.id !== req.user.id){
            const error = Error('not authorized');
            error.status = 401
            throw error;
        } 
        res.status(201).send(await createCart({user_id: req.params.id, product_id: req.body.product_id}));
    } catch (ex) {
        next(ex);
    }
});

const isLoggedIn = async(req, res, next) => {
    try {
        req.user = await findUserWithToken(req.headers.authorization);
    } catch (ex) {
        next(ex);
    }
}

app.get('/api/auth/me', isLoggedIn, async (req, res, next) =>{
    try {
        res.send(req.user);
    } catch (ex) {
        next(ex)
    }
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        res.send(await authenticate(req.body));
    } catch (ex) {
        next(ex);
    }
});

app.delete('/api/users/:user_id/favorites/:id', async (req, res, next)=>{
    try {
        if(req.params.userId !== req.user.id){
            const error = Error('not authorized');
            error.status = 401;
            throw error;
        }
        await destroyCart({user_id: req.params.user_id, id: req.params.id})
        res.sendStatus(204);
    } catch (ex) {
        next(ex)
    }
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).send({error: err.message ? err.message : err});
});


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
        createProduct({name: 'Electronics', price: 699.00}),
        createProduct({name: 'Groceries', price: 120.00}),
        createProduct({name: 'Apparel', price: 80.00}),
        createProduct({name: 'Books', price: 45.00}),
        createProduct({name: 'Beauty', price: 200.00}),
        createProduct({name: 'Health', price: 1000.00}),
        createProduct({name: 'Industrial', price: 800.00}),
        createProduct({name: 'Kitchen', price: 1200.00}),
    ]);
    console.log(await fetchUsers());
    console.log(await fetchProducts());

    const cart = await Promise.all([
        createCart({user_id: Abby.id, product_id: Electronics.id, quantity: 2}),
        createCart({user_id: Brian.id, product_id: Industrial.id, quantity: 8}),
        createCart({user_id: Carla.id, product_id: Beauty.id, quantity: 4}),
        createCart({user_id: Ethan.id, product_id: Apparel.id, quantity: 6})
    ]);
    console.log(await fetchCart(Brian.id))
    app.listen(port, ()=>{
        console.log('You are connected to the database at port ' + port)
    })
};

init();