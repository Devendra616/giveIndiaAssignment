const mongoose = require('mongoose');
const moment = require('moment');
const Account = require('../models/account');
const User = require('../models/user');
const { ErrorHandler, handleError} = require('../helpers/error');

// provide amount in paise
async function transferAmount(fromAccountId, toAccountId, amount) {
    const session = await mongoose.startSession();
    const options= {session, new:true}
    let sourceAccount, destinationAccount;
    const BASICSAVNGS_MAX_BALANCE = 5000000; //Rs 50,000
    
    let result = {
        newSrcBalance: 0,
        totalDestBalance:0,
        transferedAt:moment.now()
    }
    
    if(fromAccountId === toAccountId) {
        const errorMessage='Can not send to same account';        
        throw new ErrorHandler(404,errorMessage);
    }

    // Check if the account belongs to same user
    try{
         sourceAccount = await Account.findOne({accountNo:fromAccountId});
         destinationAccount =await Account.findOne({accountNo:toAccountId});
         
         if(!sourceAccount || !destinationAccount) {
             const errorMessage = 'Sender/Destination account number not found';
             throw new ErrorHandler(404,errorMessage);
         }

        if(sourceAccount.user.id.equals(destinationAccount.user.id)) {
            const errorMessage='Can not transfer between accounts belonging to same user'          
            throw new ErrorHandler(404,errorMessage);
        }
    }catch(err) {        
        console.log(err);
        throw new ErrorHandler(err.errorCode,err.errorMessage);
    }

    // If users are different try transfer 
    
    try {
        session.startTransaction();
        const source= await Account.findByIdAndUpdate(
            {_id:sourceAccount._id},
            {$inc:{balance:-amount}},
            options
        );
    
        if(source.balance <0) {
            // Source account should have the required amount for the transaction to succeed
            const errorMessage='Insufficient Balance with Sender:';          
            throw new ErrorHandler(404,errorMessage);            
        }
        
        const destination = await Account.findByIdAndUpdate(
            {_id:destinationAccount._id},
            {$inc:{balance:amount}},
            options
        ); 

        // The balance in ‘BasicSavings’ account type should never exceed Rs. 50,000
        if((destination.accountType.name === 'BasicSavings') && (destination.balance > BASICSAVNGS_MAX_BALANCE)) {         
            const errorMessage=`Recepient's maximum account limit reached`;
            throw new ErrorHandler(404,errorMessage); 
        }
        await session.commitTransaction();        
        session.endSession();
        totalDestBalance = await updateTotalDestinationBalance(destination.user.id);
        

        result = {            
            newSrcBalance: source.balance,
            totalDestBalance,
            transferedAt : moment.now(),
        }                
                
    }
     catch (error) {
        // Abort transaction and undo any changes
        await session.abortTransaction();
        session.endSession();     
        throw new ErrorHandler(error.errorCode,error.errorMessage);
    } finally {
        if(session) {
            session.endSession();
        }
    }
    return result;
}

updateTotalDestinationBalance = async (userId) => {
    // finding total balance in destination account
    let balance =0;
    try{
        const user = await User.findById(userId);
        if (user.accounts) {
            const userAccounts = await Account.find({ _id: { $in: user.accounts } });
            balance = userAccounts.reduce((accumulator, obj) => accumulator + obj.balance, 0);        
            return balance;
        }
    } catch(err) {
        const errorMessage=`Recepient not found!`;
        console.log(err);
        throw new ErrorHandler(404,errorMessage);  
    }
}

module.exports = transferAmount;