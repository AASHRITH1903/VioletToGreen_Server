const fs = require("fs");

/**
 * 
 * @param {The entire java code file that has been sent from the client} codeFile 
 * @param {The sample code snippets the are output from the codeSampler module using java parser} codeSamples 
 * @param {The linked pairs of comments and code, also sent from the client} configs 
 * @returns 
 */

function commentRatio(codeFile, codeSamples, configs) {
  const singleLinedComments = /[/]{2}.*(?:(?:\r\n|\r|\n) *[/].*)*/gm;
  const multilinedComment = /\/\*[\s\S]*?\*\//gm;
  var lines = codeFile.split("\n");
  var numberOfLines = lines.length;
  var commentCodeRatios = [];

  //1. for each code sample,
  // extract the inline comments
  // search configs for an exact match
  // find over lap and extract those with more than 70% match
  // for each code sample, return the comment to code ratio

  for (var codeSample of codeSamples) {
    //console.log(codeSample);
    //comments that are included in code body
    var codeSegment = codeFile.substring(
      codeSample.startOffset,
      codeSample.endOffset + 1
    );
    var codeLength = codeSegment.length;
    var commentLength = 0;

    const multiLineMatches = codeSegment.matchAll(multilinedComment);
    for (const match of multiLineMatches) {
      //console.log(match[0]);
      commentLength += match[0].length;
    }
    const singleLineMatches = codeSegment.matchAll(singleLinedComments);
    for (const match of singleLineMatches) {
      //console.log(match[0]);
      commentLength += match[0].length;
    }

    //console.log("old comment length", commentLength);
    //console.log(codeSegment);
    codeLength = codeLength - commentLength;

    //------------------------------------------------------
    //external comments from links
    console.log(configs);
    for (var config of configs) {
      //console.log(config[1]);
      let overlapLength = 0;
      let overlapDenominator = config[1].string.length;
      //find overlap between config[1] and codeSample

      let sampleStartLine = codeSample.startLine;
      let sampleEndLine = codeSample.endLine;
      let configStartLine = config[1].startLine;
      let configEndLine = config[1].endLine;
      let sampleStartColumn = codeSample.startColumn;
      let sampleEndColumn = codeSample.endColumn;
      let configStartColumn = config[1].startCharacter;
      let configEndColumn = config[1].endCharacter;

      // console.log(configStartLine, sampleStartLine);
      // console.log(configStartColumn, sampleStartColumn);
      // console.log(configEndLine, sampleEndLine);
      // console.log(configEndColumn, sampleEndColumn);
      // console.log(sampleStartLine, sampleEndLine, configStartLine, configEndLine);
      // console.log(sampleStartColumn, sampleEndColumn, configStartColumn, configEndColumn);

      //console.log(lines);

      // For each code sample, try to identify the maximum overlap with code smaples given in configs
      // The overlop is used to determine if the comment is linked to that particular code sample

      for (let i = 1; i <= numberOfLines; i++) {
        if (
          i >= configStartLine &&
          i <= configEndLine &&
          i >= sampleStartLine &&
          i <= sampleEndLine
        ) {
          if (
            i == configStartLine &&
            i == sampleStartLine &&
            (i == configEndLine || i == sampleEndLine)
          ) {
            let overlap =
              Math.min(configEndColumn, sampleEndColumn) -
              Math.max(configStartColumn, sampleStartColumn);
            if (overlap > 0) overlapLength += overlap;
          } else if (i == configStartLine && i == sampleStartLine) {
            let start = Math.max(configStartColumn, sampleStartColumn);
            overlapLength += lines[i - 1].substring(start, -1).length;
          } else if (i == configEndLine && i == sampleEndLine) {
            let end = Math.min(configEndColumn, sampleEndColumn);
            overlapLength += lines[i - 1].substring(0, end).length;
          } else if (i == configStartLine && i > sampleStartLine) {
            overlapLength += lines[i - 1].substring(
              configStartColumn,
              -1
            ).length;
          } else if (i == sampleStartLine && i > configStartLine) {
            overlapLength += lines[i - 1].substring(
              sampleStartColumn,
              -1
            ).length;
          } else if (i == configEndLine && i < sampleEndLine) {
            overlapLength += lines[i - 1].substring(0, configEndColumn).length;
          } else if (i == sampleEndLine && i < configEndLine) {
            overlapLength += lines[i - 1].substring(0, sampleEndColumn).length;
          } else {
            overlapLength += lines[i - 1].length;
          }
        }
      }

      //console.log("overlap length found", overlapLength);
      // The overlap threshold is now set at 0.7
      let overlapScore = overlapLength / overlapDenominator;
      if (overlapScore >= 0.7) {
        //console.log("overlap found", overlapScore);
        commentLength += config[0].string.length;
      }
      //console.log("--------------------------------");
    }

    // We return the comment to code ratios for each of the samples in an array
    let commentCodeRatio = commentLength / codeLength;
    commentCodeRatios.push(commentCodeRatio);
    //console.log("--------------------");
  }
  return commentCodeRatios;
}

// The following code is for unit testing
// codeFile = ``;
// codeSamples = "";
// configs = "";
//
// (async () => {
//   lines = fs.readFileSync("./testing/codeFile.txt", "utf8");
//   codeFile = lines.toString();
// })();
//
// (async () => {
//   lines = fs.readFileSync("./testing/codeSamples.json");
//   codeSamples = JSON.parse(lines);
//   //codeSamples = lines.toString();
// })();
//
// (async () => {
//   lines = fs.readFileSync("./testing/configs.json");
//   configs = JSON.parse(lines);
//   //configs = lines.toString();
// })();
//
// var commentRatios = commentRatio(codeFile, codeSamples, configs);
// console.log(commentRatios);
module.exports = { commentRatio };
