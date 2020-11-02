// this little helper will extend the problem_mapping.js variable
// and add javascript while keeping original formatting
const mappings = require('./data/problem_mapping.old');
function covertProblemMappings() {
  let m = Object.assign({}, mappings);

  // iterate through chapters
  Object.keys(m).forEach((chapter) => {
    // iterate through problems
    Object.keys(m[chapter]).forEach((problem) => {
      let pythonLang = '';
      // find python key
      Object.keys(m[chapter][problem]).forEach((language) => {
        if (language.indexOf('Python') === 0) {
          pythonLang = language;
        }
      });

      // let's update the python key and turn it into a javascript key
      const jsLang = pythonLang
        .replace('Python', 'Javascript')
        .replace('.py', '.js');

      // add javascript option to list of problems
      m[chapter][problem][jsLang] = m[chapter][problem][pythonLang];
    });
  });

  // pretty print m; 4 spaces to match original
  console.log(JSON.stringify(m, null, 4));
}
// use a pipe command to output to a file
covertProblemMappings();
