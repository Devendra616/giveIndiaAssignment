class ErrorHandler extends Error {
    constructor(errorCode, errorMessage) {
      super();
      this.errorCode = errorCode;
      this.errorMessage = errorMessage;
      console.log(errorMessage)
    }
  }

  module.exports = {
    ErrorHandler    
  }