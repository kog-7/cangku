class Explore {
  constructor() {
    this.parseFunction = null;
    this.root = null;
    this.callback = this.error = () => {};
  }
  parse(f) {
    //f是一个promise函数
    this.parseFunction = f;
    return this;
  }
  setCallback(f) {
    this.callback = f;
    return this;
  }
  setError(f) {
    this.error = f;
    return this;
  }
  trace(inputObj, lastInputObj) {
    let ts = this;
    return function() {
      let complete = true;
      for (let val of inputObj.children) {
        if (val.status !== 'done') {
          complete = false;
          break;
        }
      }
      if (complete === false) {
        return false;
      }
      inputObj.status = 'done';
      if (lastInputObj === null) {
        //如果没有则微顶部内容
        ts.callback();
      } else {
        lastInputObj.trace();
      }
    };
  }
  run(opt) {
    //开始输入一串内容
    let { lastInputObj = null, input } = opt;
    let { parseFunction, root } = this;
    let ts = this;
    let inputObj = {
      status: 'pending',
      value: input,
      children: []
    };
    inputObj.trace = ts.trace(inputObj, lastInputObj);
    if (root === null) {
      this.root = inputObj;
    } else {
      lastInputObj.children.push(inputObj); //如果不是根元素
    }
    let lastVal = lastInputObj === null ? null : lastInputObj.value;
    //解析
    parseFunction(input, lastVal)
      .then((outputs) => {
        //解析返回多个内容
        if (Array.isArray(outputs)) {
          //只要有output,并且output是数组就继续
          let lg = outputs.length;
          if (lg === 0) {
            //如果没有子元素了
            inputObj.trace();
          } else {
            outputs.forEach((output, ind) => {
              ts.run({
                input: output,
                lastInputObj: inputObj
              });
            });
          }
        } else {
          inputObj.trace(); //也会直接回溯
        }
      })
      .catch((err) => {
        ts.error(err);
      });
    return this;
  }
}

module.exports = Explore;
// export default Explore;
