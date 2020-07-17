const mongoose = require('mongoose');
const moment = require('moment');
const Account = require('../models/account');
const User = require('../models/user');


async function transferAmount(fromAccountId, toAccountId, amount) {
    const session = await mongoose.startSession();
    const options= {session, new:true}
    let sourceAccount, destinationAccount;
    const BASICSAVNGS_MAX_BALANCE = 1500;
    let totalDestBalance=0;
    
    if(fromAccountId === toAccountId) {
        const errorMessage='Can not send to same account';        
        throw new ErrorHandler(404,errorMessage);
    }

    // Check if the account belongs to same user
    try{
         sourceAccount = await Account.findOne({accountNo:fromAccountId});
         destinationAccount =await Account.findOne({accountNo:toAccountId});
        
        if(sourceAccount.user.id.equals(destinationAccount.user.id)) {
            const errorMessage='Can not transfer between accounts belonging to same user'          
            throw new ErrorHandler(404,errorMessage);
        }
    }catch(err) {
        const errorMessage='Some error occured in fetching account details!';
        console.log(err);
        throw new ErrorHandler(404,errorMessage);
    }

    // If users are different try transfer 
    session.startTransaction();
    try {
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
        
        await User.findById(destination.user.id, async function(err,user){
            if(err) {
                const errorMessage=`Recepient not found!`;
                console.log(err);
                throw new ErrorHandler(404,errorMessage);  
            } else {                
                if(user.accounts) {
                    await Account.find({
                        '_id' :{$in:user.accounts}
                    }, function(err,userAccounts) {                       
                        totalDestBalance = userAccounts.reduce( (accumulator,obj) => accumulator+obj.balance,0);  
                        const result = {
                            newSrcBalance: source.balance,
                            totalDestBalance,
                            transferedAt:moment.now()
                        }    
                        console.log('submitting', result)                
                        return result;                                
                    });                    
                }                
            }
        });      
    }
     catch (error) {
        // Abort transaction and undo any changes
        await session.abortTransaction();
        session.endSession();
        throw new ErrorHandler(404,error);
    } 
}

module.exports = transferAmount;