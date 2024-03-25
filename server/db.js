const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/amazon_store');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

const createTables = async()=>{
    const SQL = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS cart;
    CREATE TABLE users(
        id UUID PRIMARY KEY, 
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    CREATE TABLE products(
        id UUID PRIMARY KEY, 
        name VARCHAR(255)
    );
    CREATE TABLE cart(
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        CONSTRAINT unique_user_id_and_product_id UNIQUE (user_id, product_id)
    );
    `;
    await client.query(SQL);
};

const createUser = async({username, password})=>{
    const SQL = `
    INSERT INTO users(id, username, password) VALUES ($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
};

const createProduct = async({name})=>{
    const SQL = `
    INSERT INTO products(id, name) VALUES ($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createCart = async({user_id, product_id})=>{
    const SQL = `
    INSERT INTO cart (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
    return response.rows[0];
};

const destroyCart = async({user_id, id})=>{
    const SQL = `
    DELETE FROM cart WHERE user_id=$1 AND id=$2
    `;
    await client.query(SQL, [user_id, id])
};

const fetchUsers = async()=>{
    const SQL = `
    SELECT id, username FROM users;
    `
    const response = await client.query(SQL);
    return response.rows;
};

const fetchProducts = async()=>{
    const SQL = `
    SELECT * FROM products;
    `
    const response = await client.query(SQL);
    return response.rows;
}

const fetchProduct = async({id})=>{
    const SQL = `
    SELECT id, name FROM products WHERE id=$1
    `
    const response = await client.query(SQL);
    return response.rows;
}

const fetchCart = async(user_id)=>{
    const SQL = `
    SELECT * FROM cart WHERE user_id = $1
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
};

const authenticate = async({username, password})=>{
    const SQL = `
    SELECT id, username, password FROM users WHERE username=$1;
    `
    const response = await client.query(SQL, [username]);
    if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password))=== false){
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    const token = await jwt.sign({id: response.rows[0].id, JWT});
    console.log(token);
    return {token: response.rows[0].id};
};

    const findUserWithToken = async(id)=>{
        try {
            const payload = await jwt.verify(token, JWT);
            id = payload.id;
        } catch (ex) {
            const error = Error('not authorized');
            error.status = 401;
            throw error;
        }
        const SQL = `
        SELECT id, username FROM users WHERE id=$1;
        `;
        const response = await client.query(SQL, [id]);
        if(!response.rows.length){
            const error = Error('not authorized');
            error.status = 401;
            throw error
        }
        return response.rows[0]
};

module.exports = {
    client, createTables, createUser, createProduct, createCart, fetchUsers, fetchProducts, fetchCart, destroyCart, authenticate, findUserWithToken, fetchProduct
}