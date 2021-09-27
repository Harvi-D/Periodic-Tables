function checkProperties(...properties) {
    return function (req, res, next) {
        const { data = {} } = req.body;

        try {
            properties.forEach(property => {
                if (!data[property]) {
                    const error = new Error(`Must add ${property} property.`);
                    error.status = 400;
                    throw error;
                }
            });
            next();

        } catch (error) {
            next(error);
        }
    }
}

module.exports = checkProperties;