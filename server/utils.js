function generateId(size=10) {
  const options = '0123456789abcdefghijklmnopqrstuvwxyz'

  let id = ''
  for (let i = 0; i < size; i++) {
    id += options[parseInt(Math.random() * options.length)]
  }

  return id
}

module.exports = {
  generateId,
}