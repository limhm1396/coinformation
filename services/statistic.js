const {
    sequelize,
    SearchHistory,
    Market,
} = require('../models');
const { Op } = require('sequelize');

class Service {
    static getPopularSearchCoin = async (days = '7') => {
        const end_dt = new Date();
        const start_dt = new Date();
        start_dt.setDate(start_dt.getDate() - Number(days));

        const ranking = await SearchHistory.findAll({
            attributes: ['market_code', [sequelize.fn('COUNT', sequelize.col('*')), 'count']],
            include: {
                model: Market,
                attributes: ['korean_name'],
            },
            where: {
                date: {
                    [Op.between]: [start_dt, end_dt],
                },
            },
            group: 'market_code',
            order: [[sequelize.fn('COUNT', sequelize.col('*')), 'DESC']],
            limit: 10,
        });

        return { ranking };
    }
}

module.exports = Service;