const { DataTypes, Model } = require('sequelize');

class Market extends Model {
    static init(sequelize) {
        return super.init({
            market: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            korean_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            english_name: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, {
            sequelize,
            modelName: 'market',
            tableName: 'markets',
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
}

module.exports = Market;