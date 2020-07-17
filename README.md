# GiveIndia Code Assignment

### Problem Statement: Write a REST-based API that enables transfer of money from one bank account to another.

## Details: 

Account types are ‘Savings’, ‘Current’ and ‘BasicSavings’. A single user can have multiple such accounts. The following rules apply:

* Transfer between accounts belonging to the same user is not allowed.
* The balance in ‘BasicSavings’ account type should never exceed Rs. 50,000.
* Source account should have the required amount for the transaction to succeed.
 

The API spec follows: (**All amounts in the API are in paisa**) 

**Input (JSON)**
* fromAccountId
* toAccountId
* amount
 

**Output (JSON)**

*success case:*
* newSrcBalance: The balance in source account after transfer
* totalDestBalance: The total balance in all accounts of destination user combined
* transferedAt: timestamp  

*failure case:*
* errorCode
* errorMessage  

Any language, framework and database would do. Our preference would be Node.js since it is most commonly used across our stacks, but that is not mandatory. Please provide instructions on how to run it. Include some sample users/accounts data to test for various scenarios. Around 10 or so sample accounts should suffice to cover the scenarios.
  
## Usage

Clone the repo:

    https://github.com/Devendra616/giveIndiaAssignment.git
Install it:

    npm install
Create a file on root path with name .env
Enter your credentials

    DBUSER=<mongo atlas db user>
    DBPASSWORD=<db user password>
    DATABASEURL=<db url with dbname>


Test using postman:

    localhost:3000/transferAmount

  ## Snapshots
  ![Transfer from Current to Saving](https://res.cloudinary.com/nmdc/image/upload/v1594995145/giveIndia/1.current-saving.jpg)

![Error on max balance on Basic Savings > 50,000](https://res.cloudinary.com/nmdc/image/upload/v1594995145/giveIndia/2.current-basicsaving.jpg)
