const os = require('os')

const getIP = () => {
  return os.networkInterfaces()['WLAN'][1]['address']
}

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const arrayRandom = (array) => {
  return array[random(0, array.length - 1)];
};

exports.getIP = getIP
exports.random = random
exports.arrayRandom = arrayRandom