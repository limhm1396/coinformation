const { DataTypes, Model } = require('sequelize');

class MarketHistory extends Model {
    static init(sequelize) {
        return super.init({
            market: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                primaryKey: true,
            },
            trade_price: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            highest_price: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            mdd: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: 'markets_history',
            tableName: 'markets_histories',
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
}

module.exports = MarketHistory;