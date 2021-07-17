const Sequelize = require("sequelize")
const sequelize = new Sequelize("yhbk", "root", "909090", {
    host: "localhost",
    // host: "192.168.1.133",
    // host: "api.youhebuke.com",
    dialect: "mysql",
    logging: false, // 关闭控制台日志
    // operatorsAliases:false,
    dialectOptions: {
        //字符集
        charset: "utf8mb4",
        // collate:'utf8mb4_unicode_ci',
        supportBigNumbers: true,
        bigNumberStrings: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: "+08:00" //东八时区
})

module.exports = {
    sequelize
};
