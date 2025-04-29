const path = require("path");

const RULE_NAME = "no-broad-semantic-versioning";

module.exports = {
  name: RULE_NAME,
  meta: {
    type: "problem",
    fixable: null,
    messages: {
      noBroadSemanticVersioning:
        'The "{{dependencyName}}" is not recommended to use "{{versioning}}"',
    },
  },
  create(context) {
    if (path.basename(context.getFilename()) !== "package.json") {
      return {};
    }

    return {
      Property(node) {
        if (
          node.key &&
          node.key.value &&
          ["dependencies", "devDenpendencies"].includes(node.key.value) &&
          node.value &&
          node.value.properties
        ) {
          node.value.properties.forEach((property) => {
            if (property.key && property.value) {
              const dependencyName = property.key.value;
              const versioning = property.value.value;
              if (
                // *
                versioning.startsWith("*") ||
                // x.x
                versioning.startsWith("x.") ||
                // > x
                versioning.startsWith(">")
              ) {
                context.report({
                  loc: property.value.loc,
                  messageId: "noBroadSemanticVersioning",
                  data: {
                    dependencyName,
                    versioning,
                  },
                })
              }
            }
          })
        }
      },
    };
  },
};
