class ErrorHandler extends Error {
    constructor(errorCode, errorMessage) {
      super();
      this.errorCode = errorCode;
      this.errorMessage = errorMessage; 
      console.log(this.errorCode,this.errorMessage)     
    }
  }

  // custom handler
  const handleError = (err,req,res, next) => {console.log('in handle',err)
    const { errorCode, errorMessage } = err;
    
    return res.json({      
      errorCode,
      errorMessage
    });
  };

  module.exports = {
    ErrorHandler,handleError    
  }