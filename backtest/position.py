import python_bitbankcc as bb
import json
import math
import datetime
from indicator import Indicator

class Position:
    def __init__(self,params):
        self.__interval = params["interval"] if "interval" in params else 100
        self.__buy_amount = params["buy_amount"] if "buy_amount" in params else 1 
        self.__historical_interval = params["historical_interval"] if "historical_interval" in params else 100
        self.__profit_rate = params["profit_rate"] if "profit_rate" in params else 0.01
        self.__range = params["range"] if "range" in params else 1000000
        self.__initial_rate = params["initial_rate"] if "initial_rate" in params else 1

        self.__interval_max_amount      = 0
        self.__interval_average_amount  = 0
        self.__interval_profit          = 0
        self.__interval_buy_count       = 0
        self.__interval_sell_count      = 0

        self.__result_max_amount = 0

        self.__max_prices = []
        self.__min_prices = []
        self.__count = 0

        self.__position_price = 0
        self.__current_price = 0
        self.__amount = 0
        self.__total_profit = 0

        self.__indicator = Indicator({})

    def GetProfit(self):
        return self.__total_profit

    def Result(self):
        return {
            'profit'     : round(self.__total_profit * 100)/100,
            'max_amount' : round(self.__result_max_amount * self.__current_price * 100)/100,
            'pl'         : round(self.__total_profit/(self.__result_max_amount * self.__current_price) * 100),
            'interval profit'      : round(self.__total_profit/self.__count)
        }

    def Execute(self, ohlcv):
        max = ohlcv[1]
        min = ohlcv[2]
        end = ohlcv[3]
        time = ohlcv[5]
        self.__current_price = end
        self.__indicator.Execute(ohlcv)
        # self.__max_prices.append(max)
        # if len(self.__max_prices) > self.__historical_interval:
        #     self.__max_prices.pop(0)
        # self.__min_prices.append(min)
        # if len(self.__min_prices) > self.__historical_interval:
        #     self.__min_prices.pop(0)

        self.Sell(max)
        self.Buy(end, self.__buy_amount, self.__range, self.__initial_rate)
        self.__count += 1
        if self.__count % self.__interval == 0:
            d = datetime.datetime.fromtimestamp(time/1000)
            print(
                d, 
                round(self.__interval_profit),
                round(self.__amount,2),
                round(self.__interval_max_amount,2),
                round(self.__interval_average_amount,2),
                round(self.__interval_buy_count),
                round(self.__interval_sell_count)
                )
            if self.__interval_max_amount > self.__result_max_amount:
                self.__result_max_amount = self.__interval_max_amount
            self.__interval_max_amount = 0
            self.__interval_average_amount = 0
            self.__interval_profit = 0
            self.__interval_buy_count = 0
            self.__interval_sell_count = 0
            return
        if self.__amount > self.__interval_max_amount:
            self.__interval_max_amount = self.__amount
        self.__interval_average_amount = (self.__interval_average_amount + self.__amount) / 2

    def Buy(self, price, amount, rng, initial_rate):
        # rng = max(self.__max_prices) - min(self.__min_prices)
        # x = 0 if rng == 0 else (max(self.__max_prices) - price) / rng
        # x = 1- x
        # x = (x-0.5) / 0.5
        # rate = 1 / (1 + math.e**-x)
        rate = 1

        # (price * averaging_amount + self.__position_price * self.__amount) /(averaging_amount + self.__amount) = price * 1.001
        # averaging_amount + self.__position_price * self.__amount/ price - alpha * (averaging_amount + self.__amount) = 0
        # (1- alpha) * averaging_amount  + self.__position_price * self.__amount/ price - alpha * self.__amount = 0
        # averaging_amount = ((1.001 - self.__position_price/price) * self.__amount)/(1-1.001)
        

        x2 = (price - self.__position_price) / price
        # x2 = (price - self.__position_price) / price
        rate2 = 0
        if -1 <= x2 < 0:
            x2 = 1 if x2 < -1 else x2 * -1
            # x2 = ((x2-0.5) / 0.5)
            # rate2 = 1 / (1 + math.e**(- 1 * x2))
            rate2 = x2
        elif -1 > x2:
            rate2 = 1

        if self.__amount == 0:
            rate2 = initial_rate

        rate = rate * rate2
        # rate = (rate-0.5) / 0.5
        # rate = 1 / (1 + math.e**-rate)

        if rate * amount > 0.0001:
            position_value = (self.__position_price * self.__amount + price * amount * rate)
            self.__amount += amount * rate
            self.__position_price = position_value / self.__amount
            self.__interval_buy_count += 1
        # elif averaging_amount > 0:
            # position_value = (self.__position_price * self.__amount + price * averaging_amount)
            # self.__amount += averaging_amount
            # self.__position_price = position_value / self.__amount
            # self.__interval_buy_count += 1

    def Sell(self, price):
        # if (price > 0) and (price >= self.__position_price * (1+self.__profit_rate)):
        if (price > 0) and (price >= self.__position_price + self.__indicator.indicator):
            self.__total_profit += self.__indicator.indicator * self.__amount
            self.__interval_profit += self.__indicator.indicator * self.__amount
            self.__amount = 0
            self.__position_price = 0
            self.__interval_sell_count += 1