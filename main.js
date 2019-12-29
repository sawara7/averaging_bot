'use strict';

const logic = require("./bitbank-averaging");
const settings = require("./_settings");
const logger = require("./logger");

(async () => {
    setInterval(
        async () => {
            for (let l of settings.LOGIC){
                logger.console.info("Start",l.PAIR);
                logger.system.info("Start",l.PAIR);
                await logic.doExecute(
                    l.PAIR,
                    l.AMOUNT,
                    l.PROFIT_RATE,
                    l.INITIAL_RATE);
            }
        }, settings.INTERVAL
    )
})();
