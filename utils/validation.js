const validate = (fields, body) => {
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    if (!(field in body)) {
      return {
        valid: false,
        message: `Missing \`${field}\` in request body`
      };
    } else {
      return {
        valid: true,
        message: ''
      };
    }
  }
};

module.exports = { validate };
