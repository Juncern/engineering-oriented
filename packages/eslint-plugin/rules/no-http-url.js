const RULE_NAME = "no-http-url";

module.exports = {
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    fixable: null,
    messages: {
      noHttpUrl: 'Recommend "{{url}}" switch to HTTPS',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (
          node.value &&
          typeof node.value === "string" &&
          node.value.startsWith("http:")
        ) {
          context.report({
            node,
            messageId: "noHttpUrl",
            data: {
              url: node.value,
            },
          });
        }
      },
    };
  },
};
