## cangku

Create local repository

![](https://img.shields.io/npm/v/cangku.svg?style=flat)

when developing with others,you provide business code to be used by many subproject(each subproject developed by each people) within a big project. If you pack you code to npm ,maybe generate many version which need many people to install by many times,and reading the source code is difficult . When support business code,use local repository is better.

## Installation

```js

//global install

npm install cangku -g

//local install

npm install cangku -D

```

## Features

- support version
- list changed  files

## Usage

### handle respository

create a local repository,location in some dir,and create local repository

after create components,it will include sources and versions directory,in sources dir,write you business code.

```js
//if install by global
cangku create components

//if install by local
npx cangku create components

```

### upgrade respository

Write code in components sources directory,when the code is done, push a new version

```js
//location in components dir,follow command will prompt you to input version
cangku push
```

### use respository

```js
const cangku = require("cangku");
let respository = cangku(projectComponentLibUrl, subProjectComponentUrl);
await respository.pull();

/* 
will console like 
delete:request/index.js
changed:utils/index.js
*/

```

when pull respository,the default upgrade option is as follows

version 1.1.9&&1.1.8 is low upgrade,1.2.1&&1.1.9 is middle upgrade,2.0.0&&1.9.9 is high upgrade

```js
//default option
{
      low: {
        console: true,//console.log what change in new version
        ask: false//ask people whether upgrade or not
      },
      middle: {
        console: true,
        ask: true
      },
      high: {
        console: true,
        ask: true
      }
    }

//cover default options
/*
Interface Action{
    console:Boolean;
    ask:Boolean;
}

Interface Option{
low?:Action;
middle?:Action;
high?:Action;
}
*/

respository.setRank(option);

```

## lock respository

```js
respository.setLock(true); //lock version and will not
respository.setLock("middle"); //lock version if version compare is high and middle,if send high,lock version when compare is high
```


## api

```js
cangku create name
cangku push
cangku remove //via prompt to remove a version
```

