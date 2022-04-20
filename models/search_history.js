const { DataTypes, Model } = require('sequelize');

class SearchHistory extends Model {
    static init(sequelize) {
        return super.init({
            who: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            market_code: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                primaryKey: true,
                defaultValue: DataTypes.NOW(),
            }
        }, {
            sequelize,
            modelName: 'search_history',
            tableName: 'search_histories',
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
}

module.exports = SearchHistory;