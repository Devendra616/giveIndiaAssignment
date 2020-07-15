const User = require('./models/user');
const Type = require('./models/type');
const Account = require('./models/account');

const accountTypeData = [
    {
        name:'Savings',
        description:'Savings account to have no upper limit'
    },
    {
        name:'Current',
        description:'Current account'
    },
    {
        name:'BasicSavings',
        description:'Basic Savings Account with Maximum balance Rs 50000'
    },
    
];

const data = [
    {
       name:'Devendra' ,
       pan:'CGBPS9770A'
    },
    {
        name:'Vishal',
        pan:'XABSG0774B'
    }
];

function seedDB() {

    // Remove all AccountTypes and add
    Type.remove({}, function(err) {
        if(err) {
            console.log(err);
        }
        console.log('removed all account types');
        accountTypeData.forEach(function(seed){
            Type.create(seed, function(err,accountType) {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log('Added Account Type');
                }
            })
        })
    });

    // Remove all Accounts
    Account.remove({}, function(err){
        
        if(err) {
            console.log(err);
        } else {
            console.log('removed all accounts');
        }
    })

    //remove all users
    User.remove({}, function(err) {
        
        if(err) {
            console.log(err);
        }
        console.log('Removed Users!');

        // add few users
        data.forEach(  function(seed) {
            User.create(seed,async function(err,user) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("added user");
                    const randomAcNo = Math.floor(Math.random()*10000*Math.random()*2000+1000);
                    const randomType = Math.floor(Math.random()*3);
                    /* 
                        0 : Savings
                        1 : Current
                        2 : BasicSavings
                    */        
                    const randomAccName = accountTypeData[randomType].name;
                    
                    const randomAccType= await Type.find({name:randomAccName});
                    console.log("random type",randomAccType);
                    Account.create({
                        accountNo:randomAcNo, 
                        user:user,
                        accountType:randomAccType._id,
                        balance:1000
                    }, function(err,account) {
                        if(err) {
                            console.log(err);
                        } else{
                            user.accounts.push(account);
                            user.save();
                            console.log('account added to user');
                        }
                    }
                    )
                }
            })
    })
    });
}

module.exports = seedDB; 