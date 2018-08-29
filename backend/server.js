const express = require("express");
const bodyParser = require("body-parser");
const sha256 = require('sha256');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');
var db = require('./db');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(cors());
app.use(bodyParser.raw({ type: "*/*" }));

//BUSINESS CONSTANTS-------------------------------------------------
const url = "mongodb://admin:admin123@ds121332.mlab.com:21332/auctionsdb";
const database = "auctionsdb";
const collCategories = "categories";
const collCountries = "countries";
const collItemState = "itemState";
const collOrganizations = "organizations";
const collItems = "items";
const collSessions = "sessions";
const collBuyers = "buyers";
const collBidTran = "bidTransactions";
const collChatMess = "chatMessages";

const USER_TYPE_BUYER = "buyer";
const USER_TYPE_ORG = "org";
const COOKIE_NAME = "sessionID";

const ITEM_STATE_TO_AUCTION = "TO_AUCTION";
const ITEM_STATE_AUCTIONED = "AUCTIONED";
const ITEM_STATE_CANCELED = "CANCELED";

let serverState = {
    categoriesList: [],
    countriesList: [],
    itemStateList: [],
    chatMessages: [], //temporary
    bidsItems: [] //temporary 
}

let dataInstance = null;
//CONNECTION WITH MONGO DB WHEN APP INIT---------------------------------
db.connect(url, function (err) {
    if (err) {
        console.log('Unable to connect to MongoDb.')
        process.exit(1);
    } else {
        app.listen(4000, () => {
            dataInstance = db.get().db(database);
            console.log("AUCTION backend project listening on port 4000");
        });
    }
})



/*function getDatabase() {
    return db.get().db(database);    
}*/

/**
 * Endpoint that return the initial info used as parameters of the website, like
 * categories, countries, itemStates.
 * This data usually is static and doesn't change, for this reason, it is saved in the 
 * server state variable. This info is reloaded from database if the server is
 * restarted.
 */
app.get("/getParams", (req, res) => {

    try {
        if (!(serverState.categoriesList.length > 0
            && serverState.countriesList.length > 0
            && serverState.itemStateList.length > 0)) {

            let cb = () => {
                //set response
                if (serverState.categoriesList.length > 0
                    && serverState.countriesList.length > 0
                    && serverState.itemStateList.length > 0) {

                    res.send(JSON.stringify({
                        status: true, message: "",
                        categories: serverState.categoriesList,
                        countries: serverState.countriesList,
                        itemState: serverState.itemStateList
                    }));
                }
            };

            let datab = dataInstance;

            //get categories 
            var collCat = datab.collection(collCategories);
            collCat.find({}).toArray(function (err, result) {
                if (err) throw err;
                serverState.categoriesList = result;
                cb();
            });

            //get countries
            var collCo = datab.collection(collCountries);
            collCo.find({}).toArray(function (err, result) {
                if (err) throw err;
                serverState.countriesList = result;
                cb();
            });

            //get itemStates
            var collItemStates = datab.collection(collItemState);
            collItemStates.find({}).toArray(function (err, result) {
                if (err) throw err;
                serverState.itemStateList = result;
                cb();
            });

        } else {
            res.send(JSON.stringify({
                status: true, message: "",
                categories: serverState.categoriesList,
                countries: serverState.countriesList,
                itemState: serverState.itemStateList
            }));
        }
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }

});

/**
 * Endpoint that return the oraganizations registered
 */
app.get("/getOrgs", (req, res) => {
    try {
        let datab = dataInstance;

        //get organizations 
        var collOrg = datab.collection(collOrganizations);
        collOrg.find({}).toArray(function (err, result) {
            if (err) throw err;
            res.send(JSON.stringify({ status: true, message: "", orgs: result }));
        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

/**
 * Endpoint that return the listing (items) 
 */
app.get("/getItems", (req, res) => {
    try {
        let datab = dataInstance;

        //get items
        var collListing = datab.collection(collItems);
        collListing.find({}).toArray(function (err, result) {
            if (err) throw err;
            res.send(JSON.stringify({ status: true, message: "", items: result }));
        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

/**
 * Endpoint that return the listing (items) 
 */
app.get("/getItem", (req, res) => {
    try {
        let itemIdParam = req.query.itemId;

        let datab = dataInstance;
        let collItm = datab.collection(collItems);

        //get item
        collItm.find({ itemId: itemIdParam }).toArray(function (err, result) {
            if (err) { throw err }
            else if (result.length > 0) {
                res.send(JSON.stringify({ status: true, message: "", item: result }));
            } else {
                res.send(JSON.stringify({ status: false, message: "item not found", item: result }));
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


/**
 * Endpoint to do sign Up for orgs and buyers
 */
app.post("/signUp", (req, res) => {
    try {
        let datab = dataInstance;
        var collOrg = datab.collection(collOrganizations);
        var collBuy = datab.collection(collBuyers);

        bodyParam = JSON.parse(req.body.toString());

        if (bodyParam.userType !== undefined && bodyParam.userType === USER_TYPE_ORG) {

            //check if there is a account with the same username
            collOrg.find({ website: bodyParam.website }).toArray(function (err, result) {
                if (err) { throw err; }

                if (result.length > 0) {
                    res.send(JSON.stringify({ status: false, message: "error in account creation, website alrready registered" }))
                } else {
                    collOrg.find({ username: bodyParam.username }).toArray(function (err, result) {
                        if (err) { throw err; }

                        if (result.length > 0) {
                            res.send(JSON.stringify({ status: false, message: "error in account creation, username alrready used" }))
                        } else {
                            //delete userType attribute
                            delete bodyParam['userType'];
                            //send to db to insert
                            //bodyParam.orgId = Math.floor(Math.random() * 1000) + "";
                            bodyParam.orgId = '';
                            bodyParam.password = sha256(bodyParam.password);

                            collOrg.insertOne(bodyParam, function (err, result) {
                                if (err) {
                                    res.send(JSON.stringify({ status: false, message: "error in account creation" }))
                                    throw err;
                                }
                                let id = result.ops[0]._id.toString();
                                var myquery = result.ops[0];
                                var newvalues = { $set: { orgId: id } };
                                //if insertion was ok, read and update to set user id.
                                collOrg.updateOne(myquery, newvalues, function (err, result) {
                                    if (err) { throw err };
                                    res.send(JSON.stringify({ status: true, message: "successfully created account" }))
                                });

                            });
                        }
                    });
                }
            });

        } else if (bodyParam.userType !== undefined && bodyParam.userType === USER_TYPE_BUYER) {

            collBuy.find({ username: bodyParam.username }).toArray(function (err, result) {
                if (err) { throw err; }

                if (result.length > 0) {
                    res.send(JSON.stringify({ status: false, message: "error in account creation, username alrready used" }))
                } else {
                    //delete userType attribute
                    delete bodyParam['userType'];
                    //send to db to insert
                    //bodyParam.orgId = Math.floor(Math.random() * 1000) + "";
                    bodyParam.userId = '';
                    bodyParam.password = sha256(bodyParam.password);

                    collBuy.insertOne(bodyParam, function (err, result) {
                        if (err) {
                            res.send(JSON.stringify({ status: false, message: "error in account creation" }));
                            throw err;
                        }

                        let id = result.ops[0]._id.toString();
                        var myquery = result.ops[0];
                        var newvalues = { $set: { userId: id } };
                        //if insertion was ok, read and update to set user id.
                        collBuy.updateOne(myquery, newvalues, function (err, result) {
                            if (err) { throw err };
                            res.send(JSON.stringify({ status: true, message: "successfully created account" }));
                        });

                    });
                }
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


app.post('/updateInfo', (req, res) =>{
    const sanitize = ({orgId, userId, password, ...params}) => params
    const params = JSON.parse(req.body.toString())
    let datab = dataInstance;
    if (!params.userId && ! params.orgId) return res.send(JSON.stringify({ status: 'No ID provided!' }))
    const collection = params.orgId ? datab.collection(collOrganizations) : datab.collection(collBuyers)
    const id = params.orgId ? {orgId: params.orgId} : {userId: params.userId}
    const password = sha256(params.password)
    collection.update({
        ...id
    }, {$set: {
        ...sanitize(params),
        password
    }}, function (err, result) {
        res.send(JSON.stringify({ status: !!(!err && result.result.nModified) }));
    })    


})

/*const stripe = require("stripe")("sk_test_NwiJRkMy2Neo8BjF9yV3oBLb");

app.post("/stripeCharge", async (req, res) => {
    try {
      let {status} = await stripe.charges.create({
        amount: 2000,
        currency: "usd",
        description: "An example charge",
        source: req.body
      });
  
      res.json({status});
    } catch (err) {
      res.status(500).end();
    }
  });*/

/**
 * Endpoint to do log In 
 */
app.post('/login', (req, res) => {
    try {
        let bodyParam = JSON.parse(req.body.toString());

        //search if user exist in orgs
        let datab = dataInstance;
        var collOrg = datab.collection(collOrganizations);
        var collSess = datab.collection(collSessions);
        var collBuy = datab.collection(collBuyers);

        let token = Math.floor(Math.random() * 100000000000) + "";

        collOrg.find({ username: bodyParam.username, password: sha256(bodyParam.password) }).toArray(function (err, result) {
            if (err) { throw err; }
            if (result.length > 0) {

                //save session in bd
                let objSess = { username: bodyParam.username, userType: "org", usrId: result[0].orgId, token: token, active: true, date: new Date().toISOString() };
                collSess.insertOne(objSess, function (err, result) {
                    if (err) { throw err; }
                });

                //set cookie and send response
                res.cookie(COOKIE_NAME, token);
                res.send(JSON.stringify({ status: true, message: "", userType: "org", orgId: result[0].orgId }))

            } else {

                collBuy.find({ username: bodyParam.username, password: sha256(bodyParam.password) }).toArray(function (err, result) {
                    if (err) { throw err; }
                    if (result.length > 0) {

                        //save session in bd
                        let objSess = { username: bodyParam.username, userType: "buyer", usrId: result[0].userId, token: token, active: true, date: new Date().toISOString() };
                        collSess.insertOne(objSess, function (err, result) {
                            if (err) { throw err; }
                        });

                        //set cookie and send response
                        res.cookie(COOKIE_NAME, token);
                        //res.send(JSON.stringify({ status: true, message: "", userType: "buyer", userId: result[0].userId }))
                        let objUser = result[0];
                        delete objUser['password'];
                        res.send(JSON.stringify({ status: true, message: "", userType: "buyer", user: objUser }))
                    } else {
                        res.send(JSON.stringify({ status: false, message: "invalid username or password" }))
                    }
                });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


app.post('/logout', (req, res) => {
    try {
        let bodyParam = JSON.parse(req.body.toString());
        let currentSession = getSessionIdFromCookie(req);

        let datab = dataInstance;
        var collSess = datab.collection(collSessions);
        let query = { username: bodyParam.username, token: currentSession, active: true };
        let newValues = { $set: { username: bodyParam.username, token: currentSession, active: false } };

        collSess.find(query).toArray(function (err, result) {
            if (err) { throw err; }
            if (result.length > 0) {
                collSess.updateOne(query, newValues, function (err, result) {
                    if (err) throw err;
                    res.clearCookie(COOKIE_NAME);
                    res.send(JSON.stringify({ status: true, message: "" }))
                });
            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }

        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get('/home', (req, res) => {
    try {
        let currentSession = getSessionIdFromCookie(req);

        let datab = dataInstance;
        var collSess = datab.collection(collSessions);
        var collBuy = datab.collection(collBuyers);

        let query = { token: currentSession, active: true };

        collSess.find(query).toArray(function (err, result) {
            if (err) { throw err; }
            if (result.length > 0) {

                let userTypeSaved = result[0].userType;
                if (userTypeSaved === USER_TYPE_BUYER) {
                    //res.send(JSON.stringify({ status: true, message: "user has an active session", username: result[0].username, userType: userTypeSaved, userId: result[0].usrId }))
                    collBuy.find({ userId: result[0].usrId }).toArray(function (err, result) {
                        if (err) { throw err; }
                        if (result.length > 0) {
                            let objUser = result[0];
                            delete objUser['password'];
                            res.send(JSON.stringify({ status: true, message: "user has an active session", user: objUser }))
                        }
                    });

                } else { //if it is a org
                    res.send(JSON.stringify({ status: true, message: "user has an active session", username: result[0].username, userType: userTypeSaved, orgId: result[0].usrId }))
                }

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }

        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


/**
 * Endpoint to create item 
 */
app.post("/addItem", (req, res) => {
    try {
        //let datab = dataInstance;
        let datab = dataInstance;

        var collItem = datab.collection(collItems);
        let bodyParam = JSON.parse(req.body.toString());

        var collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);

        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                //if session exist and is active create item
                bodyParam.itemId = "";
                bodyParam.lastPrice = bodyParam.initialPrice;
                bodyParam.creationDate = new Date().toISOString();
                bodyParam.bidCancelDate = "";
                bodyParam.bidClosedDate = "";
                bodyParam.state = ITEM_STATE_TO_AUCTION;
                bodyParam.winnerUserId = "";

                collItem.insertOne(bodyParam, function (err, result) {
                    if (err) throw err;

                    let id = result.ops[0]._id.toString();
                    var myquery = result.ops[0];
                    var newvalues = { $set: { itemId: id } };
                    //if insertion was ok, read and update item.
                    collItem.updateOne(myquery, newvalues, function (err, result) {
                        if (err) throw err;

                        //settimeout to close auction item
                        /*let period = new Date(bodyParam.bidFinDate).getTime() - new Date(bodyParam.bidStartDate).getTime();
                        let startd = new Date(bodyParam.bidStartDate).getTime() - new Date().getTime();
                        setTimeout(function () {
                            setTimeout(function () {
                                closeItemProcess(id);
                            }, period);
                        }, startd);*/

                        //send response
                        res.send(JSON.stringify({ status: true, message: "", itemId: id }));
                    });

                });

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }

        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


/**
 * Endpoint to create item 
 */
app.put("/updateItem", (req, res) => {
    try {
        let datab = dataInstance;
        var collItem = datab.collection(collItems);
        let bodyParam = JSON.parse(req.body.toString());

        //check if user 
        var collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);

        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                //if session exist and is active create item
                var myquery = { itemId: bodyParam.itemId };
                bodyParam.updateDate = new Date().toISOString();
                var newvalues = { $set: bodyParam };
                //update Item
                collItem.updateOne(myquery, newvalues, function (err, result) {
                    if (err) throw err;
                    res.send(JSON.stringify({ status: true, message: "" }));
                });

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }

        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

/**
 * Endpoint to cancel item 
 */
app.post("/cancelItem", (req, res) => {
    try {
        let datab = dataInstance;
        var collItem = datab.collection(collItems);
        let bodyParam = JSON.parse(req.body.toString());

        //check if user session exist
        var collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);

        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                //if session exist and is active create item
                var myquery = { itemId: bodyParam.itemId };
                var newvalues = { $set: { bidCancelDate: new Date().toISOString(), state: ITEM_STATE_CANCELED } };
                //update Item
                collItem.updateOne(myquery, newvalues, function (err, result) {
                    if (err) {
                        throw err;
                    } else if (result.result.nModified > 0) {
                        res.send(JSON.stringify({ status: true, message: "" }));
                    } else {
                        res.send(JSON.stringify({ status: false, message: "error trying to cancel the item" }));
                    }
                });

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }

        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.post("/bidItem", (req, res) => {
    try {
        let datab = dataInstance;
        let collBid = datab.collection(collBidTran);
        let collItm = datab.collection(collItems);

        bodyParam = JSON.parse(req.body.toString());

        //check if user session exist
        let collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);

        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                //verify if item exist and available to auction
                collItm.find({ itemId: bodyParam.itemId, state: "TO_AUCTION" }).toArray(function (err, result) {
                    if (err) { throw err }

                    else if (result.length > 0) {
                        bodyParam.date = new Date().toISOString();
                        bodyParam.bid = parseInt(bodyParam.bid);
                        collBid.insertOne(bodyParam, function (err, result) {
                            if (err) {
                                res.send(JSON.stringify({ status: false, message: "error processing bid to item" }))
                                throw err;
                            }
                            let id = result.ops[0]._id.toString();
                            var myquery = result.ops[0];
                            var newvalues = { $set: { transactionId: id } };
                            //if insertion was ok, read and update to set transaction id.
                            collBid.updateOne(myquery, newvalues, function (err, result) {
                                if (err) { throw err }

                                else if (result.result.nModified > 0) {
                                    //update last price of the item
                                    collItm.updateOne({ itemId: bodyParam.itemId }, { $set: { lastPrice: bodyParam.bid } }, function (err, result) {
                                        if (err) { throw err; }
                                        else if (result.result.nModified > 0) {
                                            res.send(JSON.stringify({ status: true, message: "transaction success", transactionId: id, username: bodyParam.username }));
                                        }
                                    });
                                }
                            });
                        });

                    } else {
                        res.send(JSON.stringify({ status: false, message: "item not found, offer can not be processed" }));
                    }
                });

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }));
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

/**
 * Endpoint to close item 
 */
app.post("/closeItem", (req, res) => {
    try {
        let datab = dataInstance;
        let collItem = datab.collection(collItems);
        let collBid = datab.collection(collBidTran);
        let collBuy = datab.collection(collBuyers);
        let bodyParam = JSON.parse(req.body.toString());

        //check if user session exist
        let collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);

        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                let myquery = { itemId: bodyParam.itemId };

                //verify item is not closed/auctioned
                collItem.find({ itemId: bodyParam.itemId, state: "TO_AUCTION" }).toArray(function (err, result) {
                    if (err) { throw err }
                    if (result.length > 0) {

                        //search if there is a winner
                        collBid.find({ itemId: bodyParam.itemId }).sort({ bid: -1 }).toArray(function (err, result) {
                            if (err) { throw err; }
                            if (result.length > 0) {

                                //update Item  
                                let userWinner = result[0].userId;
                                let bidPrice = result[0].bid;
                                let newvalues = { $set: { bidClosedDate: new Date().toISOString(), state: ITEM_STATE_AUCTIONED, lastPrice: result[0].bid, winnerUserId: userWinner } };
                                collItem.updateOne(myquery, newvalues, function (err, result) {
                                    if (err) {
                                        throw err;
                                    } else if (result.result.nModified > 0) {

                                        //find info user winner
                                        collBuy.find({ userId: userWinner }).toArray(function (err, result) {
                                            if (err) { throw err; }
                                            if (result.length > 0) {

                                                let winnerObj = { userId: userWinner, username: result[0].username, firstName: result[0].firstName, lastName: result[0].lastName, biddedPrice: bidPrice, email: result[0].email };
                                                notifyCloseWinner(bodyParam.itemId, winnerObj);
                                                res.send(JSON.stringify({ status: true, message: "", winner: winnerObj }));
                                            }
                                        });

                                    } else {
                                        res.send(JSON.stringify({ status: false, message: "error trying to close the item" }));
                                    }
                                });
                            } else {
                                //if no winner,update Item                                     
                                let newvalues = { $set: { bidClosedDate: new Date().toISOString(), state: ITEM_STATE_AUCTIONED } };
                                collItem.updateOne(myquery, newvalues, function (err, result) {
                                    if (err) {
                                        throw err;
                                    } else if (result.result.nModified > 0) {
                                        notifyCloseNoWinner(bodyParam.itemId);
                                        res.send(JSON.stringify({ status: true, message: "", winner: {} }));
                                    } else {
                                        res.send(JSON.stringify({ status: false, message: "error trying to close the item" }));
                                    }
                                });
                            }
                        });

                    } else {
                        res.send(JSON.stringify({ status: true, message: "" }));
                    }
                });

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }

        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

/*
* Endpoint used to send email. This endpoint should be used to send whatever email but
* for this case of notify end bid, is used to send several emails at the same time.
*/
app.post("/sendEmail", (req, res) => {
    try {
        let bodyParam = JSON.parse(req.body.toString());
        let adminEmail = "charitybidadm@gmail.com";
        let adminEmailPass = "decode123!";

        //check if user session exist
        let datab = dataInstance;
        let collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);
        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                var mailOptionsUser = {
                    from: adminEmail,
                    to: bodyParam.userEmail,
                    subject: bodyParam.userEmailSubject,
                    text: bodyParam.userEmailText
                };

                var mailOptionsOrg = {
                    from: adminEmail,
                    to: bodyParam.orgEmail,
                    subject: bodyParam.orgEmailSubject,
                    text: bodyParam.orgEmailText
                };

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: adminEmail,
                        pass: adminEmailPass
                    }
                });

                //send email to org
                //TODO: catch all errors and send in the reponse
                transporter.sendMail(mailOptionsOrg, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        //send email to user
                        transporter.sendMail(mailOptionsUser, function (error, info) {
                            if (error) {
                                res.send(JSON.stringify({ status: false, message: "error sending emails" }));
                                console.log(error);
                            } else {
                                res.send(JSON.stringify({ status: true, message: "" }));
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                });

            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

/*
* Endpoint used to get information about all bid transactions an user did, how many items an user has won and 
* how many has lost.
*/
app.post("/getUserProfile", (req, res) => {
    try {
        let datab = dataInstance;
        var collItem = datab.collection(collItems);
        let collBid = datab.collection(collBidTran);
        let bodyParam = JSON.parse(req.body.toString());

        //session data
        var collSess = datab.collection(collSessions);
        let currentSession = getSessionIdFromCookie(req);
        let querySess = { username: bodyParam.username, token: currentSession, active: true };

        //data
        let wonItemsObj = [];
        let lostitemsObj = [];
        let transactionsObj = [];
        let processSearchWonItems = false;
        let processSearchItemsBidded = false;

        let cb = () => {
            //set response
            if (processSearchWonItems && processSearchItemsBidded) {

                //find lost items
                let arrayWinners = [];
                wonItemsObj.forEach(e => {
                    lostitemsObj.push(e.itemId);
                });

                collBid.find({ "itemId": { $nin: arrayWinners }, userId: bodyParam.userId }).toArray(function (err, result) {
                    if (err) { throw err }
                    else if (result.length > 0) {
                        lostitemsObj = result;
                    }
                    res.send(JSON.stringify({
                        status: true, message: "",
                        wonItems: wonItemsObj,
                        lostItems: lostitemsObj,
                        transactions: transactionsObj
                    }));
                });
            }
        };

        //check if user session exist
        collSess.find(querySess).toArray(function (err, result) {
            if (err) { throw err; }
            else if (result.length > 0) {

                //won items 
                collItem.find({ winnerUserId: bodyParam.userId }).toArray(function (err, result) {
                    if (err) { throw err }
                    else if (result.length > 0) {
                        wonItemsObj = result;
                    }
                    processSearchWonItems = true;
                    cb();
                });

                //bids maded 
                //collBid.find({ userId: bodyParam.userId }).toArray(function (err, result) {
                let aggregateJoin = [{
                    $lookup:
                    {
                        from: 'items',
                        localField: 'itemId',
                        foreignField: 'itemId',
                        as: 'itemDetail'
                    }
                }];
                collBid.aggregate(aggregateJoin).toArray(function (err, result) {
                    if (err) { throw err }
                    else if (result.length > 0) {
                        transactionsObj = result;
                    }
                    processSearchItemsBidded = true;
                    cb();
                });
            } else {
                res.send(JSON.stringify({ status: false, message: "user does not have any active session" }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.post('/updateInfo', (req, res) => {
    const sanitize = ({ orgId, userId, password, ...params }) => params
    const params = JSON.parse(req.body.toString())
    let datab = dataInstance
    if (!params.userId && !params.orgId) return res.send(JSON.stringify({ status: 'No ID provided!' }))
    const collection = params.orgId ? datab.collection(collOrganizations) : datab.collection(collBuyers)
    const id = params.orgId ? { orgId: params.orgId } : { userId: params.userId }
    const password = sha256(params.password)
    collection.update({
        ...id
    }, {
        $set: {
            ...sanitize(params),
            password
        }
        }, function (err, result) {
            res.send(JSON.stringify({ status: !!(!err && result.result.nModified) }));
        })
});

function getSessionIdFromCookie(req) {
    try {
        let sessionID = req.headers.cookie != undefined ? req.headers.cookie.split("=")[1] : "";
        return sessionID;
    } catch (error) {
        console.log("error reading cookie");
    }
}


function closeItemProcess(itemIdParam) {
    try {
        let datab = dataInstance;

        let collItem = datab.collection(collItems);
        let collBid = datab.collection(collBidTran);
        let collBuy = datab.collection(collBuyers);

        let myquery = { itemId: itemIdParam };

        //verify item is not closed/auctioned
        collItem.find({ itemId: itemIdParam, state: "TO_AUCTION" }).toArray(function (err, result) {
            if (err) { throw err }
            if (result.length > 0) {

                //search if there is a winner
                collBid.find({ itemId: itemIdParam }).sort({ bid: -1 }).toArray(function (err, result) {
                    if (err) { throw err; }
                    if (result.length > 0) {

                        //update Item  
                        let userWinner = result[0].userId;
                        let bidPrice = result[0].bid;
                        let newvalues = { $set: { bidClosedDate: new Date().toISOString(), state: ITEM_STATE_AUCTIONED, lastPrice: result[0].bid, winnerUserId: userWinner } };
                        collItem.updateOne(myquery, newvalues, function (err, result) {
                            if (err) {
                                throw err;
                            } else if (result.result.nModified > 0) {

                                //find info user winner
                                collBuy.find({ userId: userWinner }).toArray(function (err, result) {
                                    if (err) { throw err; }
                                    if (result.length > 0) {

                                        let winnerObj = { userId: userWinner, username: result[0].username, firstName: result[0].firstName, lastName: result[0].lastName, biddedPrice: bidPrice, email: result[0].email };
                                        notifyCloseWinner(itemIdParam, winnerObj);
                                    }
                                });
                            }
                        });
                    } else {
                        //if no winner,update Item                                     
                        let newvalues = { $set: { bidClosedDate: new Date().toISOString(), state: ITEM_STATE_AUCTIONED } };
                        collItem.updateOne(myquery, newvalues, function (err, result) {
                            if (err) {
                                throw err;
                            } else if (result.result.nModified > 0) {
                                notifyCloseNoWinner(itemIdParam);
                            }
                        });
                    }
                });

            } else {
                console.log("so weird....item already closed");
            }
        });
    } catch (error) {
        console.log("error closeItemProcess: " + error);
    }
}

function notifyCloseWinner(itemIdParam, winner) {
    try {
        let datab = dataInstance;
        let mailData = {};

        //get item info and its org
        let collItm = datab.collection(collItems);

        let aggregateJoin = [{
            $lookup:
            {
                from: 'organizations',
                localField: 'orgId',
                foreignField: 'orgId',
                as: 'orgDetail'
            }
        }];
        //.find({ itemId: itemIdParam }) $match: { itemId: itemIdParam}
        collItm.aggregate(aggregateJoin).toArray(function (err, result) {
            if (err) { throw err }
            else if (result.length > 0) {

                result.forEach(e => {
                    if (e.itemId === itemIdParam) {
                        mailData.to = winner.email;
                        mailData.cc = e.orgDetail[0].email;
                        mailData.subject = "Winner item " + e.title + "!!!";
                        //mailData.html = "<p>Estimated <b>{{winner.firstname}} {{winner.lastname}} </b> you are the happy winner of the item {{result[0].title}} with a bid of  {{winner.biddedPrice}}. Please contact with the non-profit org responsible: <b>{{orgDetail.orgName}}</b>. Contact email: {{orgDetail.email}}</p>";
                        mailData.html = "<p>Estimated <b>" + winner.firstName + " " + winner.lastName + "</b> the auction has finished and you are the happy winner of the item" + e.title + " with a bid of  " + winner.biddedPrice + ". Please contact with the non-profit org responsible: <b>" + e.orgDetail[0].orgName + "</b>. Contact email:" + e.orgDetail[0].email + "</p>";
                        sendEmailProcess(mailData);
                    }
                });
            }
        });
    } catch (error) {
        console.log("error notifyCloseWinner: " + error);
    }
}

function notifyCloseNoWinner(itemIdParam) {
    try {
        let datab = dataInstance;
        let mailData = {};

        //get item info and its org
        let collItm = datab.collection(collItems);

        let aggregateJoin = [{
            $lookup:
            {
                from: 'organizations',
                localField: 'orgId',
                foreignField: 'orgId',
                as: 'orgDetail'
            }
        }];
        //find({ itemId: itemIdParam }). $match: { itemId: itemIdParam}
        collItm.aggregate(aggregateJoin).toArray(function (err, result) {
            if (err) { throw err }
            else if (result.length > 0) {

                result.forEach(e => {
                    if (e.itemId === itemIdParam) {
                        mailData.to = e.orgDetail[0].email;
                        mailData.subject = "No Winner for item " + e.title;
                        //mailData.html = "<p>Estimated <b>{{e.orgDetail[0].orgName}}</b> the auction for the item {{e.title}} has been finished and there was no winner.</p>";
                        mailData.html = "<p>Estimated <b>" + e.orgDetail[0].orgName + "</b> the auction for the item " + e.title + " has been finished and there was no winner.</p>";
                        sendEmailProcess(mailData);
                    }
                });
            }
        });

    } catch (error) {
        console.log("error notifyCloseNoWinner: " + error)
    }
}

function sendEmailProcess(mailData) {
    try {
        let adminEmail = "charitybidadm@gmail.com";
        let adminEmailPass = "decode123!";

        //check if user session exist
        var mailOptions = {
            from: adminEmail,
            to: mailData.to,
            cc: mailData.cc,
            subject: mailData.subject,
            html: mailData.html
        };

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: adminEmail,
                pass: adminEmailPass
            }
        });

        //send email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log("error sendEmailProcess: " + error)
    }
}

//-----------------------------------------------------------------
//SOCKET IO--------------------------------------------------------
//io.origins([allowedOrigins]);
/*io.on('connection', socket => {
    console.log("connected !");
})*/
io.on('connection', function (socket) {
    let datab = dataInstance;

    //namespace used to receive and send messages for chat
    socket.on('sendMessage', function (content) {
        socket.join(content.room);

        let collChat = datab.collection(collChatMess);
        let chatObj = { room: content.room, username: content.username, message: content.message, date: new Date().toISOString() };

        if (content.message !== "") {
            collChat.insertOne(chatObj, function (err, result) {
                if (err) throw err;
                collChat.find({ room: content.room }).sort({ date: 1 }).toArray(function (err, result) {
                    if (err) { throw err }
                    io.sockets.in(content.room).emit('receiveMessage', result);
                });
            });
        } else {
            collChat.find({ room: content.room }).sort({ date: 1 }).toArray(function (err, result) {
                if (err) { throw err }
                io.sockets.in(content.room).emit('receiveMessage', result);
            });
        }
    });

    //namespace used to receive and send messages for bid process
    socket.on('sendLastPrice', function (content) {
        socket.join(content.room);

        let bidItemsArray = [];
        let collBid = datab.collection(collBidTran);
        collBid.find({ itemId: content.itemId }).sort({ bid: -1 }).toArray(function (err, result) {
            if (err) { throw err }
            else if (result.length > 0) {
                result.forEach(e => {
                    let objitem = { itemId: e.itemId, bid: e.bid, username: e.username, date: e.date };
                    bidItemsArray.push(objitem);
                })
            }
            io.sockets.in(content.room).emit('receiveLastPrice', bidItemsArray);
        });
    });

    //namespace used to receive and send messages status of the item
    socket.on('sendStatusItem', function (content) {
        socket.join(content.room);

        let collItm = datab.collection(collItems);
        collItm.find({ itemId: content.itemId }).toArray(function (err, result) {
            if (err) { throw err }
            else if (result.length > 0) {
                io.sockets.in(content.room).emit('receiveStatusItem', result);
            }
        });
    });

});


http.listen(5000, function () {
    console.log('SOCKET IO backend project listening on *:' + 5000);
});