const config = {
    DATABASE: {
        database: 'yhbk',
        user: 'root',
        password: '909090',
        // password: '51cf60b1d00f6e0d',
        options: {
            host: 'localhost',
            dialect: 'mysql',
            dialectOptions: {
                charset: 'utf8mb4',
                // collate:'utf8mb4_unicode_ci',
                supportBigNumbers: true,
                bigNumberStrings: true
            },
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            timezone: '+08:00'
        }
    },
    token: {
        key: 'youhebuke',
        expire: '8h'
    }
}
module.exports = config