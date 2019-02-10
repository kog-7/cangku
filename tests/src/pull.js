let { assert, expect } = require("chai");
let main = require("../../src/index");
const nodepath = require("path");
const cwd = process.cwd();

describe("utils", function () {
    let config = {
        Utils: "./src/utils"
    };
    let tank = main(nodepath.join(__dirname, '../testSource'), nodepath.join(__dirname, '../testAim'));

    // arr.forEach(item => {
        it(`create testAim`, async function () {
            await tank.pull();
            // assert.equal(main(item[0], "url"), item[1]);
        });

        it(`update testAim`, async function () {
            await tank.pull();
            // assert.equal(main(item[0], "url"), item[1]);
        });
    // });
});
