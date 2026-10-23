const errorHandler = (err, req, res, next)=>{
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Error",
        errors: err.errors || [],
    })
}

export {errorHandler}



// Error middleware isliye chahiye:
// taake errors HTML me na jayen
// taake JSON consistent mile
// taake frontend easily handle kare
// taake system professional ban jaye