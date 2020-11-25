module.exports = {
  "extends": ["airbnb", "prettier", "plugin:prettier/recommended"],
  "plugins": ["prettier"],
  "env": {
    "browser": true,
  },
  "rules": {
    "no-console": "off",
    "prettier/prettier": ["error", {
      "endOfLine":"auto"
     }],
  },
}