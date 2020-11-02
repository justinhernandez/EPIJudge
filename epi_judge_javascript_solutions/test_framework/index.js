// packaages
const fs = require('fs');
const helpers = require('./helpers');
const path = require('path');
const readline = require('readline');
const { Worker } = require('worker_threads');

// config
// set maximum individual test limit to 1 second
const testTimeout = 3000;
const testBatchThreshold = 1000;
const testDataDir = path.resolve('../test_data');
const mappingPrefix = 'problem_mapping = ';
const problemFolder = path.resolve('./');
const problemMappings = path.resolve('../problem_mapping.js');

// test juding class
class EPIJudgeTest {
  constructor(type, name) {
    // default holders
    this.inputLength = 0;
    this.validateType = false;
    this.testData = [];
    this.testsPassed = 0;
    this.testMethod = false;
    this.testCase = false;
    // init class variables
    this.type = type;
    this.name = name;

    this.init();
  }

  checkTestWorker(tests) {
    return new Promise(async (resolve) => {
      // extend default test case
      let testCase = `${this.testMethod}`;

      for (let j = 0; j < tests.length; j++) {
        testCase += `console.log(${this.name}(${tests[j].input.join(',')}));`;
      }

      // update testfile with new test case
      fs.writeFileSync(this.testFile, testCase);

      // call test file via worker
      // context: we call tests via a worker in order to handle timeouts gracefully
      const worker = new Worker(this.testFile, {
        // suppres stdout
        stdout: true,
      });
      // little helper method that returns false for non passing test results
      const returnFalse = (response = false) => {
        worker.terminate();
        return resolve(response);
      };

      // start timer. return false if we hit the threshold timeout
      let testTimer = setTimeout(() => {
        returnFalse('timeout');
      }, testTimeout);
      // test shouldn't exit or error, return false on these events
      worker.on('error', returnFalse);

      // collect console log results
      let results = [];
      worker.stdout.on('data', (result) => {
        results.push(result.toString().trim());
      });

      worker.on('exit', () => {
        clearTimeout(testTimer);
        // turn results into booleans
        results = results.map((result, index) => {
          let valid = true;
          // if validation type is a number then attempt to parse the type
          if (this.validateType === 'number') {
            result =
              isNaN(parseInt(result)) == false ? parseInt(result) : undefined;
          }
          // if result does not equal expected
          // or not the expected data type then return false
          if (
            result !== tests[index].expected ||
            typeof result !== this.validateType
          ) {
            valid = false;
          }

          return valid;
        });

        // return boolean results
        resolve(results);
      });
    });
  }

  async init() {
    // load test data
    this.loadTestData();
    // load method that we want to test
    this.loadTestMethod();
    // write test case to test file so we can call it via a worker
    this.testFile = await helpers.tempFile('null');

    // switch based on test method type
    switch (this.type) {
      case 'generic':
        this.testResults = await this.testGenericMethod();
        break;
    }

    this.updateTestResults();
  }

  loadTestMethod() {
    const testFile = path.join(problemFolder, `${this.name}.js`);
    const fileRows = fs.readFileSync(testFile).toString().split('\n');

    // filter out test rows and add test method as a string to a class variable
    this.testMethod = fileRows
      .filter((r) => {
        return r.indexOf('const test') !== 0 && r.indexOf('test(') !== 0;
      })
      .join('\n');
  }

  loadTestData() {
    const testDataPath = path.join(testDataDir, `${this.name}.tsv`);
    let testData = fs.readFileSync(testDataPath).toString().split('\n');
    const dataTypes = testData.shift().split('\t');

    // return formatted array
    testData = testData
      .map((r) => {
        // check for empty row
        if (r.trim() === '') {
          return false;
        }

        return r.split('\t').map((c, i) => {
          const checkType = dataTypes[i];

          // if integer type then parse to integer
          if (checkType === 'int') {
            c = parseInt(c);
          }

          return c;
        });
      })
      // filter empty rows
      .filter((r) => r !== false);

    // update class variables
    this.testData = testData;
    this.inputLength = dataTypes.length - 1;
    // fetch last input
    this.validateType = this.switchType(dataTypes[dataTypes.length - 1]);
  }

  outputCli(output) {
    readline.cursorTo(process.stdout, 0);
    // wrap with green and output
    process.stdout.write(output);
  }

  switchType(type) {
    switch (type) {
      case 'int':
        type = 'number';
        break;
    }

    return type;
  }

  async testGenericMethod() {
    let tests = [];
    const totalTests = this.testData.length;
    const iterate = this.testData.length;

    for (let j = 0; j < iterate; j++) {
      const t = this.testData[j];
      const input = t.slice(0, this.inputLength);
      const expected = t[this.inputLength];

      tests.push({
        input,
        expected,
      });

      // if we have reached the threshold or are done iterating then
      // collect results and reset tests
      if (tests.length > testBatchThreshold || j === this.testData.length - 1) {
        // fetch results
        const results = await this.checkTestWorker(tests);

        // check results
        if (Array.isArray(results)) {
          for (let j = 0; j < results.length; j++) {
            const isPassing = results[j];
            let feedback = `Test PASSED`;
            // if test passes increment counter
            if (isPassing === true) {
              this.testsPassed += 1;
              feedback += ` (${this.testsPassed} / ${totalTests})`;
              this.outputCli(feedback);
            } else if (isPassing === false) {
              // report error and break
              console.error('\n' + new Error('Test failed...'));
              // break looping on error
              break;
            }
          }
          // reset tests
          tests = [];
        } else if (results === 'timeout') {
          // stop running tests after error
          console.error('\n' + new Error('Test timed out!!!'));
          // break on error
          break;
        }
      }
    }
  }

  updateTestResults() {
    const findProblem = `Javascript: ${this.name}.js`;
    let testMap = fs.readFileSync(problemMappings).toString();
    // find test string
    let updateString = `("Javascript: ${this.name}.js".+\n)`;
    // find passed line, pull in space
    updateString += `(.+"passed":) [0-9]+,\n`;
    const updateRegex = new RegExp(updateString);

    // update test map
    testMap = testMap.replace(updateRegex, `$1$2 ${this.testsPassed},\n`);
    // update test map
    fs.writeFileSync(problemMappings, testMap);

    // check if all tests have passed
    if (this.testsPassed === this.testData.length) {
      console.log(`\n*** You've passed ALL tests. Congratulations! ***`);
    }
  }
}

const runTest = (type, name, method) => {
  return new EPIJudgeTest(type, name, method);
};

module.exports = runTest;
