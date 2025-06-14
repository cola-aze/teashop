const responseHandler = (req, res, next) => {
    res.success = (data, message = '操作成功') => {
        res.status(200).json({
            code: 200,
            message: message,
            data: data,
        });
    };

    res.error = (code = 500, message = '服务器错误', error = null) => {
        res.status(code).json({
            code: code,
            message: message,
            error: error,
        });
    };

    next();
};

module.exports = responseHandler;