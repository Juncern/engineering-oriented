const RULE_NAME = "no-secret-info";

const DEFAULT_DANFEROUS_KEYS = [
  "password",
  "secret",
  "token",
  "accessKey",
  "accessKeySecret",
  "accessKeyToken",
];

module.exports = {
  name: RULE_NAME,
  meta: {
    type: "problem",
    fixable: null,
    messages: {
      noSecretInfo:
        'Detect that the "{{secret}}" might be a secret token, please check it carefully!',
    },
  },
  create(context) {
    const ruleOptions = context.options[0] || {};
    let { dangerousKeys = [], autoMerge = true } = ruleOptions;
    if (!dangerousKeys.length) {
      dangerousKeys = DEFAULT_DANFEROUS_KEYS;
    } else if (autoMerge) {
      dangerousKeys = [
        ...new Set([...DEFAULT_DANFEROUS_KEYS, ...dangerousKeys]),
      ];
    }
    const reg = new RegExp(`^(${dangerousKeys.join("|")})$`, "i");

    function checkLiteral(node, parent) {
      if (typeof node.value === "string" && node.value.trim() !== "") {
        if (
          // 变量声明的情况：var secret = 'xxx'
          (parent.type === "VariableDeclarator" &&
            reg.test(parent.id.name.toLowerCase())) ||
          // 对象属性-标识符形式：{ secret: 'xxx' }
          (parent.type === "Property" &&
            parent.key.name &&
            reg.test(parent.key.name.toLowerCase())) ||
          // 对象属性-字面量形式：{ 'secret': 'xxx' }
          (parent.type === "Property" &&
            parent.key.value &&
            reg.test(parent.key.value.toLowerCase()))
        ) {
          context.report({
            node,
            messageId: "noSecretInfo",
            data: {
              secret: node.value,
            },
          });
        }
      }
    }

    return {
      Literal(node) {
        if (node.parent) {
          checkLiteral(node, node.parent);
        }
      },
    };
  },
};
