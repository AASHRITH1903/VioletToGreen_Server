var java = require("java");
var fs = require("fs");
const path = require("path");

/**
 * @CYC_PATH : path to the tool for cyclomatic complexity calculation
 * @HAL_PATH : path to the tool for halstead metrics calculation
 */
const CYC_PATH = path.join(
  __dirname,
  "..",
  "Software_Metrics",
  "Cyclomatic_Complexity"
);

const HAL_PATH = path.join(
  __dirname,
  "..",
  "Software_Metrics",
  "SoftwareMetricsAnalyse"
);

/**
 * @w1 : weightage for cyclomatic complexity
 * @w2 : weightage for halstead difficulty
 */
const w1 = 0.4;
const w2 = 0.6;

/**
 * The java classes are loaded using the "java" npm package so that we
 * can use these java tools in javascript to calculate the metrics
 */
java.classpath.push(path.join(CYC_PATH, "lib", "out.jar"));
java.classpath.push(path.join(HAL_PATH, "target", "out.jar"));

/**
 *
 * @param {String} sample_code [a piece of java code text for which rum metric is to be calculated]
 * @param {String} sample_type [type of the corresponding java code : "class", "method", "other"]
 * @returns {Int} [the rum metric]
 */
function calculateRum(sample_code, sample_type) {
  /**
   * To make the code syntactically corretct we wrap the code in dummy
   * classes and methods according to the type of the code (sample_type)
   */

  if (sample_type == "class") {
  } else if (sample_type == "method") {
    sample_code = `class Dummy{${sample_code}}`;
  } else if (sample_type == "other") {
    sample_code = `class Dummy{private void dummy(){${sample_code};}}`;
  }

  console.log("CODE : ", sample_code);

  /**
   * sample_code is first written to the Input.java file, then the java classes are
   * loaded as javascript classes
   * @Cyc : class for Cyclomatic Complexity
   * @DimensionCalculator : class for halstead metrics
   * The output is written to the Output.json files which are then read to calculate
   * the final "rum" metric
   */
  fs.writeFileSync(path.join(CYC_PATH, "input", "Input.java"), sample_code);

  var Cyc = java.import("antlr4.Main");
  var args = [
    path.join(CYC_PATH, "input", "Input.java"),
    path.join(CYC_PATH, "output", "Output.json"),
  ];
  Cyc.mainSync(args);

  var contents = fs.readFileSync(path.join(CYC_PATH, "output", "Output.json"));
  const cycOutput = JSON.parse(contents);

  var DimensionCalculator = java.import("com.tongji409.DimensionCalculator");
  var args = [path.join(CYC_PATH, "input", "Input.java")];
  DimensionCalculator.mainSync(args);

  contents = fs.readFileSync(path.join(HAL_PATH, "output", "Output.json"));
  const halOutput = JSON.parse(contents);

  // The last key is for the class block
  const key = Object.keys(cycOutput).at(-1);

  const rum = w1 * cycOutput[key] + w2 * halOutput["HALSTEAD_DIFFICULTY : "];

  return rum;
}

module.exports = { calculateRum };
