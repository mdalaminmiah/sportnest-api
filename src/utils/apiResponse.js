export const sendResponse = (
    res,
    statusCode,
    success,
    message,
    data = null,
) => {
    return res.status(statusCode).json({
        success,
        message,
        timestamp: new Date().toISOString(),
        ...(data && { data }),
    });
};
