const path = require("path");

const node_env = process.env.NODE_ENV || "development";

require("dotenv").config({
    path: path.resolve(__dirname, `../.env.${node_env}`),
});

function requiredEnv(key) {
    // console.log(process.env, 'process.env');

    if (!process.env[key]) {
        throw new Error(`Missing required env: ${key}`);
    }
    return process.env[key];
}

module.exports = {
    development: {
        username: requiredEnv('DB_DEV_USERNAME'),
        password: requiredEnv('DB_DEV_PASSWORD'),
        database: requiredEnv('DB_DEV_NAME'),
        host: requiredEnv('DB_DEV_HOST'),
        dialect: "postgres",
        port: Number(requiredEnv('DB_DEV_PORT'))
    },
    production: {
        username: requiredEnv('DB_PROD_USERNAME'),
        password: requiredEnv('DB_PROD_PASSWORD'),
        database: requiredEnv('DB_PROD_NAME'),
        host: requiredEnv('DB_PROD_HOST'),
        dialect: "mysql",
        port: Number(requiredEnv('DB_PROD_PORT'))
    }
};
