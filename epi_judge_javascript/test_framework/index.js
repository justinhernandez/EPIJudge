const fs = require('fs');
const path = require('path');
const testDataDir = path.resolve('../test_data');

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

    this.run();
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

  testGenericMethod() {
    this.testData.map((t, i) => {
      const testInput = t.slice(0, this.inputLength);
      const testResult = t[this.inputLength];

      // if test passes increment counter
      if (this.checkTest(testInput, testResult) === true) {
        this.testsPassed += 1;
      }
    });
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

  switchType(type) {
    switch (type) {
      case 'int':
        type = 'number';
        break;
    }

    return type;
  }

  updateTestResults() {}

  run() {
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
}

const runTest = (type, name, method) => {
  return new EPIJudgeTest(type, name, method);
};

module.exports = runTest;
