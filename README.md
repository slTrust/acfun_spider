更目录自行创建

```
module.exports = {
  mongo:{
    uri: 'mongodb://IP:端口/数据库',
  },
  logger:{
    path:'日志目录'
  }
}
```

### 爬虫服务运行

```
node scripts/spider.js start_getting_articles
```

> pm2 则运行

```
NODE_ARGV_2=start_getting_articles pm2 start scripts/spider.js
```