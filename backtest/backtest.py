import csv
from position import Position

params = {
    "interval"              : 1440*28,
    "buy_amount"            : 50,
    "historical_interval"   : 1440,
    # "profit_rate"           : 0.015,
    # "range"                 : 1000,
    "initial_rate"          : 0.08
    }

file_name = './backtest/mona_jpy_1min_2019-01-01.csv'

if __name__ == "__main__":
    pos = Position(params)
    with open(file_name) as f:
        reader = csv.reader(f)
        for row in reader:
            pos.Execute([float(v) for v in row])
        print(pos.Result())
            