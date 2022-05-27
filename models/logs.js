const { DataTypes, Model } = require('sequelize');

class Log extends Model {
    static init(sequelize) {
        return super.init({
            uuid: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            type: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.JSON,
                allowNull: false,
            }
        }, {
            sequelize,
            modelName: 'log',
            tableName: 'logs',
            timestamps: true,
            updatedAt: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
}

module.exports = Log;