根目录自行创建 setting.js 形如

```
const Production = {
  logger: {
    path: '',
  },
  mongo: {
    uri: '',
  },
  redis: {
    port: 1111,
    host: '',
  },
};

const Debug = {
  logger: {
    path: '',
  },
  mongo: {
    uri: '',
  },
  redis: {
    port: 1111,
    host: '',
  },
};
if (process.MODE_ENV === 'production') {
  module.exports = Production;
} else {
  module.exports = Debug;
}
```

### 爬虫服务运行

**项目根目录运行**
**项目根目录运行**
**项目根目录运行**

> 生成id

```
node scripts/spider.js generate_ids 0 41
# 生成 0 ～ 410000的 id
```

> 开始爬取

```
node scripts/spider.js start_getting_articles
```

> pm2 则运行

```
NODE_ARGV_2=start_getting_articles pm2 start scripts/spider.js
```