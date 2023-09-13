const os = require('os')

const getIP = () => {
  return os.networkInterfaces()['WLAN'][1]['address']
}

exports.getIP = getIP