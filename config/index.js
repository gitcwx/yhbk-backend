const config = {
    DATABASE: {
        database: 'yhbk',
        user: 'root',
        password: '909090',
        // password: 'root pwd',
        options: {
            host: 'localhost',
            // host: "192.168.1.133",
            // host: "api.youhebuke.com",
            dialect: 'mysql',
            dialectOptions: {
                // 字符集
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