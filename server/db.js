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
}

module.exports = {
    client, createTables, createUser, createProduct
}