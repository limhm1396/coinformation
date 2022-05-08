exports.errorHandler = async (f) => {
    try {
        return await f(req, res, next);
    } catch (err) {
        next(err);
    }
};