function generateId(size = 10) {
  const options = '0123456789abcdefghijklmnopqrstuvwxyz';

  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += options[parseInt(Math.random() * options.length, 10)];
  }

  return id;
}

module.exports = {
  generateId,
};
