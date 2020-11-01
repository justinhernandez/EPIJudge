const fs = require('fs');
const path = require('path');
const readline = require('readline');

const testDataDir = path.resolve('../test_data');
const mappingPrefix = 'problem_mapping = ';
const problemMappings = path.resolve('../problem_mapping.js');

class EPIJudgeTest {
  constructor(type, name, method) {
    // default holders
    this.inputLength = 0;
    this.validateType = false;
    this.testData = [];
    this.testsPassed = 0;
    // init class variables
    this.type = type;
    this.name = name;
    this.method = method;

    this.init();
  }

  checkTest(input, expected) {
    let passed = false;

    // update result if no error is thrown
    try {
      const result = this.method.apply(null, input);
      if (result === expected && typeof result === this.validateType) {
        passed = true;
      }
    } catch (e) {
      throw new Error(e);
      passed = false;
    }

    return passed;
  }

  init() {
    // load test data
    this.loadTestData();

    // switch based on test method type
    switch (this.type) {
      case 'generic':
        this.testResults = this.testGenericMethod();
        break;
    }

    this.updateTestResults();
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

  testGenericMethod() {
    const totalTests = this.testData.length;
    this.testData.map((t, i) => {
      const testInput = t.slice(0, this.inputLength);
      const testResult = t[this.inputLength];
      let feedback = `Test PASSED`;

      // if test passes increment counter
      if (this.checkTest(testInput, testResult) === true) {
        this.testsPassed += 1;
        feedback += ` (${this.testsPassed} / ${totalTests})`;
        this.outputCli(feedback);
      }
    });
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
