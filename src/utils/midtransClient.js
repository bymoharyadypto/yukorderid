const midtransClient = require("midtrans-client");
require('../config/loadEnv');

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY_DEV,
    clientKey: process.env.MIDTRANS_CLIENT_KEY_DEV,
});

module.exports = snap;
