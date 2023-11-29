const { Random } = require("mockjs");

module.exports = function() { 
    var data = {
        users: [],
        wallet: {},
        balance: {},
    }
    var obj = {
        err: 0,
        msg: "",
        data: [],
    }
    data.wallet = { 
        ...obj, 
        data: [{
            trc20: Random.integer(10000,100000),
            bep20: Random.integer(10000,100000),
            erc20: Random.integer(10000,100000),
            ex_rate: Random.float(6, 6, 2, 2),
        }],
    }
    data.balance = { 
        ...obj, 
        data: [{
            trc20: Random.integer(10000,100000),
            bep20: Random.integer(10000,100000),
            erc20: Random.integer(10000,100000),
            total: Random.integer(10000,100000),
        }],
    }
    data.transfer_add = {
        ...obj,
        msg: "ok",
    }
    data.cheque_add = {
        ...obj,
        msg: "ok",
    }
    data.get_cheques = {
        ...obj,
        data: [{
            page: 1,
            total: 200,
            data: new Array(10).fill('').map( (item, index) => { 
                return {
                    id: index + 1,
                    amount: Random.integer(10000,100000),
                    coin: 'erc20'
                } 
            })
        }]
    }
    return data 
}