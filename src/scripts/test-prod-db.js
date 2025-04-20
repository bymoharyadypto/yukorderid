require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Gagal konek ke DB production:', err.message);
        process.exit(1);
    }
    console.log('✅ Berhasil konek ke DB production!');
    connection.end();
});
