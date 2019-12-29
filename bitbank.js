const bitbank = require('node-bitbankcc');
const env     = require('./_settings');
// 0.00000001
const conf_public = {
    'endPoint': env.URL_BB_PUBLIC,  // required
    'keepAlive': false,             // optional, default false
    'timeout': 60000,               // optional, default 3000
};

const conf_private = {
    'endPoint': env.URL_BB_PRIVATE, // required
    'apiKey': env.ACCOUNT_BB,		// required
    'apiSecret': env.APIKEY_BB,		// required
    'keepAlive': false,				// optional, default->false
    'timeout': 60000			    // optional, default->3000
};

let publicApi =new bitbank.PublicApi(conf_public);
let privateApi = new bitbank.PrivateApi(conf_private);

let getOrder = async (pair, order_id) => { 
    let params = {
        'pair': pair,
        'order_id': order_id
    };
    let res = await privateApi.getOrder(params);
    let data = res.data;
    for (let key of ['start_amount','remaining_amount','executed_amount','price','average_price']){
        data[key] = Number(data[key])
    }
    return data;
};

let cancelOrder = async(pair, order_id) => {
    let params = {
        'pair': pair,
        'order_id': order_id
    }
    let res = await privateApi.cancelOrder(params);
    return res;
}

let getTicker = async (pair) => { 
    let params = {'pair': pair};
    let res = await publicApi.getTicker(params)
    let data = res.data;
    for (let key in data){
        data[key] = Number(data[key])
    } 
    return data;
};

let BuyMarket = async (pair, amount) => {
    let params = {
        'pair': pair,
        'amount': amount,
        'side': 'buy',
        'type': 'market'
    };
    let result = await privateApi.postOrder(params);
    return result.data;
};

let BuyLimit = async (pair, price, amount) => {
    let params = {
        'pair'  : pair,
        'price' : price,
        'amount': amount,
        'side'  : 'buy',
        'type'  : 'limit'
    };
    let result = await privateApi.postOrder(params);
    return result.data;
};

let SellMarket = async (pair, amount) => {
    let params = {
        'pair': pair,
        'amount': amount,
        'side': 'sell',
        'type': 'market'
    };
    let result = await privateApi.postOrder(params);
    return result.data;
};

let SellLimit = async (pair, price, amount) => {
    let params = {
        'pair'  : pair,
        'price' : price,
        'amount': amount,
        'side'  : 'sell',
        'type'  : 'limit'
    };
    let result = await privateApi.postOrder(params);
    return result.data;
};

let getAssets = async() => {
    return await privateApi.getAssets();
}

let getCandlestic = async(pair,type,yyyymmdd) => {
    return await publicApi.getCandlestick({
        "pair"        : pair,
        "candleType"  : type,
        "yyyymmdd"    : yyyymmdd
    });
}

exports.getOrder      = getOrder;
exports.cancelOrder   = cancelOrder;
exports.BuyMarket     = BuyMarket;
exports.BuyLimit      = BuyLimit;
exports.SellMarket    = SellMarket;
exports.SellLimit     = SellLimit;
exports.getTicker     = getTicker;
exports.getAssets     = getAssets;
exports.getCandlestic = getCandlestic;