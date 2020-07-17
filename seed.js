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
    },
    {
        name:'Robert',
        pan:'TESTS123Z'
    },
    {
       name:'Rakesh' ,
       pan:'TESTA123B'
    },
    {
       name:'Ethan' ,
       pan:'TESTB123C'
    },
    {
       name:'Merry' ,
       pan:'TESTC123D'
    },
    {
       name:'Norman' ,
       pan:'TESTD123E'
    },
    {
       name:'Ciara' ,
       pan:'TESTE123F'
    },
    {
       name:'Shawn' ,
       pan:'TESTF123G'
    },
    {
       name:'Samuel' ,
       pan:'TESTG123H'
    },
];

function seedDB() {

    // Remove all AccountTypes and add
    Type.deleteMany({}, function(err) {
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
    Account.deleteMany({}, function(err){
        
        if(err) {
            console.log(err);
        } else {
            console.log('removed all accounts');
        }
    })

    //remove all users and add new
    User.deleteMany({}, function(err) {
        
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
                    console.log("added user", user);
                    const randomAcNo = Math.floor(Math.random()*10000*Math.random()*2000+1000);
                    const randomType = Math.floor(Math.random()*3);
                    /* 
                        0 : Savings
                        1 : Current
                        2 : BasicSavings
                    */        
                    const randomAccName = accountTypeData[randomType].name;
                    
                    const randomAccType= await Type.find({name:randomAccName});
                    
                    Account.create({
                        accountNo:randomAcNo, 
                        user:{
                            id:user._id,
                            name:user.name
                        },
                        accountType:{
                            id:randomAccType[0]._id,
                            name:randomAccType[0].name
                        },
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