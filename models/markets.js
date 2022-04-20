const { DataTypes, Model } = require('sequelize');

class Market extends Model {
    static init(sequelize) {
        return super.init({
            market: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            ticker: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            korean_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            english_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            }
        }, {
            sequelize,
            modelName: 'market',
            tableName: 'markets',
            timestamps: true,
            createdAt: false,
            updatedAt: false,
            paranoid: true,
            deletedAt: 'delete_at',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
}

module.exports = Market;