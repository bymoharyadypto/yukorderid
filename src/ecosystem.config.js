module.exports = {
    apps: [{
        name: "yukorderid_app",
        script: "./bin/www.js",
        exec_mode: "cluster",
        env_production: {
            NODE_ENV: "production"
        },
        env_development: {
            NODE_ENV: "development"
        }
    }]
}