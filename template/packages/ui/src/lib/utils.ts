import { createCn } from "cn/config";

// Composite typography tokens are mutually exclusive; color classes stay independent.
export const cn = createCn({
  extend: {
    classGroups: {
      "ui-text-style": [
        {
          "type-ui": [
            "caption",
            "label",
            "body",
            "body-medium",
            "body-strong",
            "reading",
            "title-sm",
            "title-md",
            "title-lg",
            "display",
          ],
        },
      ],
    },
  },
});
