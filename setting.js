const Production = {
  logger: {
    path: '/var/log/acfun_spider',
  },
  mongo: {
    uri: 'mongodb://localhost:27017/acfun',
  },
  redis: {
    port: 6379,
    host: 'localhost',
  },
};

const Debug = {
  logger: {
    path: './logs/',
  },
  mongo: {
    uri: 'mongodb://localhost:27017/acfun',
  },
  redis: {
    port: 6379,
    host: 'localhost',
  },
};
if (process.env.NODE_ENV === 'production') {
  console.log('pro')
  module.exports = Production;
} else {
  module.exports = Debug;
}
