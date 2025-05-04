const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/postgres');

const targetDb = 'yukorderid_db';

(async () => {
    try {
        await sequelize.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${targetDb}'
        AND pid <> pg_backend_pid();
    `);
        console.log(`All connections to "${targetDb}" have been terminated.`);
        await sequelize.close();
    } catch (err) {
        console.error('Error terminating connections:', err);
    }
})();
