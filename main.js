'use strict';

const logic = require("./bitbank-averaging2");
const settings = require("./_settings");
const logger = require("./logger");
const cron = require('node-cron');

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
cron.schedule(
    '0 * * * * *',
    () => {
        for (let l of settings.LOGIC){
            logger.console.info("Start",l.PAIR);
            logger.system.info("Start",l.PAIR);
            await logic.doExecute(
                l.PAIR,
                l.AMOUNT,
                l.PERIOD,
                l.INITIAL_RATE);
        }}
    );