module.exports = process.env.helios_COV
  ? require('./lib-cov/helios')
  : require('./lib/helios');
