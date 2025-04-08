const assert = require("assert");
const stylelint = require("stylelint");
const path = require("path");

/**
 * Validate CSS files with Stylelint
 * @param {string} testName - Name of the test
 * @param {string} fixtureFile - Filename of the fixture to test
 * @param {boolean} expectErrors - Whether errors are expected (true) or not (false)
 */
async function validateStylelint(testName, fixtureFile, expectErrors = true) {
  const filePaths = [path.join(__dirname, "./fixtures/", fixtureFile)];

  const result = await stylelint.lint({
    configFile: path.join(__dirname, "../index.js"),
    files: filePaths,
    fix: false,
  });

  if (result && result.errored) {
    const filesResult = JSON.parse(result.output || "[]") || [];

    // if (process.env.DEBUG) {
    filesResult.forEach((fileResult) => {
      console.log(`========= ${testName} ==========`);
      console.log(`File: ${filePaths}`);
      console.log(fileResult.warnings);
    });

    if (expectErrors) {
      assert.ok(
        filesResult.length !== 0,
        `Expected errors but found none in ${testName}`
      );
    } else {
      assert.ok(
        filesResult.length === 0,
        `Expected no errors but found some in ${testName}`
      );
    }
  } else if (expectErrors) {
    assert.fail(`Expected errors but Stylelint reported none for ${testName}`);
  }
}

describe("test/rules-validate.test.js", () => {
  it("Validate default", async () => {
    await validateStylelint("Default CSS", "index.css");
  });

  it("Validate sass", async () => {
    await validateStylelint("SASS", "sass-test.scss");
  });

  it("Validate less", async () => {
    await validateStylelint("LESS", "less-test.less");
  });

  it("Validate css-module", async () => {
    await validateStylelint("CSS Module", "css-module.scss", false);
  });
});
