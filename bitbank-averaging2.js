const bitbank  = require("./bitbank");
const firebase = require("./firebase");
const logger   = require("./logger");
const utils    = require("./utils/utils");
const sta      = require("simple-statistics");
const FIREBASAE_BOT_BITBANK = "/bot/bitbank_averaging_std/";

exports.doExecute = async(pr, amt, prd, inir) => {
    // Get previous data
    let data = await firebase.getData(FIREBASAE_BOT_BITBANK + pr);

    // ボットの名前
    let name = ("name" in data) ? data.name :"AVERAGING-STD-BOT/BITBANK";

    // 初期パラメータ
    let initial_rate        = ("initial_rate" in data) ? data.initial_rate :inir;
    let period              = ("period" in data) ? data.period :prd;
    let amount              = ("amount" in data) ? data.amount :amt;
    let pair                = ("pair" in data) ? data.pair :pr;

    // 途中計算で必要なパラメータ
    let order_id_sell       = ("order_id_sell" in data) ? data.order_id_sell :0;
    let order_id_buy        = ("order_id_buy" in data) ? data.order_id_buy :0;
    let total_amount        = ("total_amount" in data) ? data.total_amount :0;
    let position_price      = ("position_price" in data) ? data.position_price :0;
    let position_sell_price = ("position_sell_price" in data) ? data.position_sell_price :0;

    // 統計データ
    let total_profit        = ("total_profit" in data) ? data.total_profit :0;
    let sell_price_array    = ("sell_price_array" in data) ? data.sell_price_array :[];
    let results             = ("results" in data) ? data.results :{};

    let current_date = utils.getNowYMD();
    if (!(current_date in results)){
        results[current_date] = {
            "profit"     : 0,
            "sell_count" : 0
        }
    }

    // Check order result (buy)
    let buy_order;
    let buy_amount = 0;
    let buy_price = 0;
    let remaining_amount_buy = 0;
    if (order_id_buy !== 0){
        buy_order = await bitbank.getOrder(pair, order_id_buy);
        buy_amount = buy_order.executed_amount;
        buy_price = buy_order.average_price;
        remaining_amount_buy = buy_order.remaining_amount;
        if (remaining_amount_buy > 0){
            try {
                await bitbank.cancelOrder(pair, order_id_buy);
            }catch(e){
                order_id_buy = 0;
            }
            
        }
        order_id_buy = 0;
    }

    // Check order result (sell)
    let sell_order;
    let sell_amount = 0;
    let sell_price = 0;
    let remaining_amount_sell = 0;
    if (order_id_sell !== 0){
        sell_order = await bitbank.getOrder(pair, order_id_sell);
        sell_amount = sell_order.executed_amount;
        sell_price = sell_order.average_price;
        remaining_amount_sell = sell_order.remaining_amount;
        if (remaining_amount_sell > 0){
            try {
                await bitbank.cancelOrder(pair, order_id_sell);
            }catch(e){
                order_id_sell = 0;
            }
        }
        order_id_sell = 0;
    }

    // UPDATE
    position_price = (position_price * (total_amount - sell_amount) + buy_price * buy_amount) / (total_amount + buy_amount - sell_amount);
    total_amount = total_amount + buy_amount - sell_amount;

    if (sell_order){
        total_profit += (sell_price - position_sell_price) * sell_amount;
        results[current_date].profit += (sell_price - position_sell_price) * sell_amount;
        if (sell_amount > 0){
            results[current_date].sell_count += 1;
        }
    }

    if (total_amount < 0.0001){
        position_price = 0;
    }
    
    // Get Ticker
    let tk = await bitbank.getTicker(pair);
    let tk_buy = tk.buy;
    let tk_sell = tk.sell;

    let std = 0;
    sell_price_array.push(tk_sell);
    if (sell_price_array.length > period){
        sell_price_array.shift();
        std = sta.standardDeviation(sell_price_array);
    }

    // Buy
    if ((position_price > tk_buy) || order_id_buy === 0){
        let rate = (tk_buy - position_price) / tk_buy * -1;
        if (total_amount < (amount * initial_rate)/1000 && remaining_amount_buy === 0){
            rate = initial_rate;
        }else if(position_price ===0 && remaining_amount_buy > 0){
            rate = 0;
        }
        let tmp_amount = Math.round((amount * rate + remaining_amount_buy)*10000)/10000
        if (tmp_amount > 0) {
            let buy_res = await bitbank.BuyLimit(pair,tk_buy,tmp_amount);
            order_id_buy = buy_res.order_id;
            logger.console.info(buy_res);
            logger.system.info(buy_res);
        }     
    }

    // Sell
    let position_sell_limit_price = 0;
    if (total_amount > 0 && position_price > 0 && std > 0){
        let tmp_price = Math.round((position_price + std) * 1000) / 1000;
        position_sell_limit_price = tmp_price;
        let sell_res = await bitbank.SellLimit(pair, tmp_price, total_amount);
        position_sell_price = position_price;
        order_id_sell = sell_res.order_id;
        logger.console.info("Sell Order:" + sell_res);
        logger.system.info("Sell Order:" + sell_res);
    }

    // Set Data
    let update_data = {
        'name'                : name,
        'total_amount'        : total_amount,
        'position_price'      : position_price,
        'position_sell_price' : position_sell_price,
        'position_sell_limit_price' : position_sell_limit_price,
        'order_id_sell'       : order_id_sell,
        'order_id_buy'        : order_id_buy,
        'total_profit'        : total_profit,
        'last_update'         : current_date,
        'initial_rate'        : initial_rate,
        'sell_price_array'    : sell_price_array,
        'results'             : results,
        'ticker_buy'          : tk_buy,
        'ticker_sell'         : tk_sell
    }
    await firebase.setData(FIREBASAE_BOT_BITBANK + pair, update_data);
    logger.console.info(update_data);
    logger.system.info(update_data);
    return 'ok'
}
