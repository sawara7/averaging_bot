'use strict';

const logic = require("./bitbank-averaging2");
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
                    l.PERIOD,
                    l.INITIAL_RATE);
            }
        }, settings.INTERVAL
    )
})();
