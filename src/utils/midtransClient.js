// const midtransClient = require("midtrans-client");
// require("dotenv").config();

// const snap = new midtransClient.Snap({
//     isProduction: false,
//     serverKey: process.env.MIDTRANS_SERVER_KEY_DEV,
//     clientKey: process.env.MIDTRANS_CLIENT_KEY_DEV,
// });

// module.exports = snap;

// const midtransClient = require("midtrans-client");
// const path = require("path");

// // Load environment variables from .env.{NODE_ENV}
// const nodeEnv = process.env.NODE_ENV || "development";
// require("dotenv").config({
//     path: path.resolve(__dirname, `../.env.${nodeEnv}`),
// });

// // Helper to get required environment variables safely
// function requiredEnv(key) {
//     if (!process.env[key]) {
//         throw new Error(`Missing required environment variable: ${key}`);
//     }
//     return process.env[key];
// }

// // Use correct keys based on environment
// const isProduction = nodeEnv === 'production';

// const serverKey = isProduction
//     ? requiredEnv('MIDTRANS_SERVER_KEY_PROD')
//     : requiredEnv('MIDTRANS_SERVER_KEY_DEV');

// const clientKey = isProduction
//     ? requiredEnv('MIDTRANS_CLIENT_KEY_PROD')
//     : requiredEnv('MIDTRANS_CLIENT_KEY_DEV');

// // Create Midtrans Snap instance
// const snap = new midtransClient.Snap({
//     isProduction,
//     serverKey,
//     clientKey,
// });

// module.exports = snap;

const midtransClient = require("midtrans-client");
const path = require("path");

// Tetap load env sesuai NODE_ENV
const nodeEnv = process.env.NODE_ENV || "development";
require("dotenv").config({
    path: path.resolve(__dirname, `../.env.${nodeEnv}`),
});

// Helper untuk memastikan env ada
function requiredEnv(key) {
    if (!process.env[key]) {
        throw new Error(`Missing required env: ${key}`);
    }
    return process.env[key];
}

// Pakai key DEV untuk semua environment
const snap = new midtransClient.Snap({
    isProduction: false, // always sandbox
    serverKey: requiredEnv('MIDTRANS_SERVER_KEY_DEV'),
    clientKey: requiredEnv('MIDTRANS_CLIENT_KEY_DEV'),
});

module.exports = snap;

