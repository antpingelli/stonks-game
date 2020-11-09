function generateId(size = 10) {
  const options = '0123456789abcdefghijklmnopqrstuvwxyz';

  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += options[parseInt(Math.random() * options.length, 10)];
  }

  return id;
}

function roundDown(num) {
  return Math.floor(num * 100) / 100;
}

function roundUp(num) {
  return Math.ceil(num * 100) / 100;
}

module.exports = {
  generateId,
  roundDown,
  roundUp,
};
