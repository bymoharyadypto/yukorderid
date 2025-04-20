require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_DEV_USERNAME,
        password: process.env.DB_DEV_PASSWORD,
        database: process.env.DB_DEV_NAME,
        host: process.env.DB_DEV_HOST,
        dialect: "postgres",
        port: process.env.DB_DEV_PORT
    },
    test: {
        username: process.env.DB_DEV_USERNAME,
        password: process.env.DB_DEV_PASSWORD,
        database: process.env.DB_DEV_NAME + "_test",
        host: process.env.DB_DEV_HOST,
        dialect: "postgres",
        port: process.env.DB_DEV_PORT
    },
    production: {
        username: process.env.DB_PROD_USERNAME,
        password: process.env.DB_PROD_PASSWORD,
        database: process.env.DB_PROD_NAME,
        host: process.env.DB_PROD_HOST,
        dialect: "mysql",
        port: process.env.DB_PROD_PORT
    }
};
