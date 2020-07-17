class ErrorHandler extends Error {
    constructor(errorCode, errorMessage) {
      super();
      this.errorCode = errorCode;
      this.errorMessage = errorMessage;      
    }
  }

  // custom handler
  const handleError = (err,req,res, next) => {
    const { errorCode, errorMessage } = err;console.log(err)
    return res.json({      
      errorCode,
      errorMessage
    });
  };

  module.exports = {
    ErrorHandler,handleError    
  }