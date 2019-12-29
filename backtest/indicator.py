import python_bitbankcc as bb
import json
import math
import datetime
import numpy as np

class Indicator:
    def __init__(self,params):
        self.__value_array = []
        self.__length = params["length"] if "length" in params else 60 * 24
        self.indicator = 0

    def Execute(self, ohlcv):
        self.__value_array.append(ohlcv[1])
        self.__value_array.append(ohlcv[2])
        end = ohlcv[3]
        time = ohlcv[5]
        while len(self.__value_array) > self.__length:
            self.__value_array.pop(0)
        tmp = np.array(self.__value_array)
        self.indicator = np.std(tmp)
        

