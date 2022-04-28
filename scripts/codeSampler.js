const { parse } = require("java-parser");

/**
 *
 */

class CodeSampler {
  // Different types of blocks in the java code
  methods;
  classes;
  interfaces;
  forLoops;
  ifElseStatements;
  whileLoops;
  switchStatements;
  doStatements;
  initAndDeclStatements;
  assignmentStatements;
  blocks;
  caseBlocks;

  constructor() {
    this.methods = [];
    this.classes = [];
    this.interfaces = [];
    this.forLoops = [];
    this.ifElseStatements = [];
    this.whileLoops = [];
    this.switchStatements = [];
    this.doStatements = [];
    this.initAndDeclStatements = [];
    this.assignmentStatements = [];
    this.blocks = [];
    this.caseBlocks = [];
  }

  /**
   *
   * @param {String} javaText [The java text for which code sampling need to be done]
   * @returns [Array(2): all blocks and corresponding types]
   *
   * This method constructs a CST (Concrete Syntax tree) and traverses (BFS) the tree to get
   * various blocks in the code. Each node is a syntactic element in the code, so
   * relevant blocks are extracted using the "name" attribute of the node which indicates
   * the type of the node.
   */
  getBlocks = (javaText) => {
    const cst = parse(javaText);

    let q = [cst];
    let curl = 1;
    let nextl = 0;

    while (q.length > 0) {
      let s = q.shift();
      curl--;

      switch (s.name) {
        case "constructorDeclaration":
        case "methodDeclaration": {
          this.methods.push(s.location);
          break;
        }
        case "classDeclaration": {
          this.classes.push(s.location);
          break;
        }
        case "forStatement": {
          this.forLoops.push(s.location);
          break;
        }
        case "ifStatement": {
          this.ifElseStatements.push(s.location);
          break;
        }
        case "whileStatement": {
          this.whileLoops.push(s.location);
          break;
        }
        case "switchStatement": {
          this.switchStatements.push(s.location);
          break;
        }
        case "doStatement": {
          this.doStatements.push(s.location);
          break;
        }
        case "interfaceDeclaration": {
          this.interfaces.push(s.location);
          break;
        }
        case "variableDeclarator": {
          this.initAndDeclStatements.push(s.location);
          break;
        }
        case "statementExpression": {
          this.assignmentStatements.push(s.location);
          break;
        }
        case "block": {
          this.blocks.push(s.location);
          break;
        }
        case "switchBlockStatementGroup": {
          this.caseBlocks.push(s.location);
          break;
        }
      }

      if (s.children) {
        for (let [_, val] of Object.entries(s.children)) {
          if (Array.isArray(val)) {
            q = q.concat(val);
            nextl += val.length;
          } else {
            q.push(val);
            nextl++;
          }
        }
      }

      if (curl === 0) {
        curl = nextl;
        nextl = 0;
      }
    }

    // distinguishing between if, else if and else blocks
    var temp = [];
    var flag = false;

    for (let i = 0; i < this.blocks.length; i++) {
      flag = false;
      for (let j = 0; j < this.ifElseStatements.length; j++) {
        if (
          this.blocks[i].startLine >= this.ifElseStatements[j].startLine &&
          this.blocks[i].endLine <= this.ifElseStatements[j].endLine
        ) {
          flag = true;
          break;
        }
      }
      if (flag) {
        temp.push(this.blocks[i]);
      }
    }
    this.ifElseStatements = [];
    for (let i = 0; i < temp.length; i++) {
      this.ifElseStatements.push(temp[i]);
    }

    // distinguishing case blocks
    temp = [];

    for (let i = 0; i < this.caseBlocks.length; i++) {
      flag = false;
      for (let j = 0; j < this.switchStatements.length; j++) {
        if (
          this.caseBlocks[i].startLine >= this.ifElseStatements[j].startLine &&
          this.caseBlocks[i].endLine <= this.ifElseStatements[j].endLine
        ) {
          flag = true;
          break;
        }
      }
      if (flag) {
        temp.push(this.caseBlocks[i]);
      }
    }

    // this.forLoops = this.removeNested(this.forLoops, this.forLoops);

    // console.log(this.ifElseStatements);

    // console.log(this.switchStatements);
    // console.log(this.methods);

    // Merge all the blocks and return all_blocks ---------------------------------

    var all_blocks = [];
    var all_blocks_types = [];

    all_blocks.push(...this.methods);
    all_blocks.push(...this.classes);
    // all_blocks.push(...this.interfaces);
    all_blocks.push(...this.forLoops);
    all_blocks.push(...this.ifElseStatements);
    all_blocks.push(...this.whileLoops);
    all_blocks.push(...this.switchStatements);
    all_blocks.push(...this.doStatements);
    all_blocks.push(...this.initAndDeclStatements);
    all_blocks.push(...this.assignmentStatements);
    all_blocks.push(...this.blocks);
    // all_blocks.push(...this.caseBlocks)

    all_blocks_types.push(
      ...Array(this.methods.length)
        .fill(1)
        .map((e) => "method")
    );
    all_blocks_types.push(
      ...Array(this.classes.length)
        .fill(1)
        .map((e) => "class")
    );
    all_blocks_types.push(
      ...Array(this.forLoops.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.ifElseStatements.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.whileLoops.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.switchStatements.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.doStatements.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.initAndDeclStatements.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.assignmentStatements.length)
        .fill(1)
        .map((e) => "other")
    );
    all_blocks_types.push(
      ...Array(this.blocks.length)
        .fill(1)
        .map((e) => "other")
    );

    return [all_blocks, all_blocks_types];
  };

  /**
   *
   * @param {Array} innerArray [Array of blocks that need to be removed if found
   *                            inside one of the blocks in outerArray]
   * @param {Array} outerArray [Array of blocks to check if the block overlaps a
   *                             block in innerArray  ]
   * @returns [innerArray after removing blocks which are nested.]
   */
  removeNested = (innerArray, outerArray) => {
    var temp = [];
    var flag = false;

    for (let i = 0; i < innerArray.length; i++) {
      flag = false;
      for (let j = 0; j < outerArray.length; j++) {
        if (
          (innerArray[i].startLine > outerArray[j].startLine &&
            innerArray[i].endLine < outerArray[j].endLine) ||
          (innerArray[i].startCharacter > outerArray[j].startCharacter &&
            innerArray[i].startLine === outerArray[j].startLine) ||
          (innerArray[i].endCharacter < outerArray[j].endCharacter &&
            innerArray[i].endLine === outerArray[j].endLine)
        ) {
          if (i !== j) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        temp.push(innerArray[i]);
      }
    }
    innerArray = [];
    for (let i = 0; i < temp.length; i++) {
      innerArray.push(temp[i]);
    }
    return innerArray;
  };
}

module.exports.CodeSampler = CodeSampler;
