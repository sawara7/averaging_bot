exports.sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

exports.getNowYMD = () => {
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth()+1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + '/' + m + '/' + d;
    return result;
  }