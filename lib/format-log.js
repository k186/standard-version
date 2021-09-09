const marked = require('marked')

const walkTokens = function (token) {

}

marked.use({ walkTokens })

// 这里只做了一层转换，硬编码
const transform = function (astArray, string) {
  if (!astArray) {
    return string
  }
  const scopeNameMapArray = {}
  for (let i = 0; i < astArray.length; i++) {
    const obj = astArray[i]
    if (obj.type === 'list') {
      const items = obj.items
      items.forEach((el) => {
        if (el.type === 'list_item') {
          const item = el.tokens[0] ? el.tokens[0].tokens : []
          let count = 0
          let scope = ''
          let value = ''
          let commitHash = ''
          while (count < item.length) {
            if (count === 0) {
              scope = item[count].raw
            } else if (item[count].type === 'link') {
              commitHash += item[count].raw + ','
            } else {
              value += item[count].raw
            }
            if (value.lastIndexOf(')') === value.length - 1) {
              value = value.slice(0, value.length - 2)
            }
            count += 1
          }
          if (!scopeNameMapArray[scope]) {
            scopeNameMapArray[scope] = {}
          }
          if (!scopeNameMapArray[scope][value]) {
            scopeNameMapArray[scope][value] = []
          }
          scopeNameMapArray[scope][value].push(commitHash)
        }
      })
      // parse string
      Object.keys(scopeNameMapArray).forEach((scope) => {
        let item = `* ${scope}\n`
        Object.keys(scopeNameMapArray[scope]).forEach((value) => {
          const commits = scopeNameMapArray[scope][value]
          item += ` \t*\t${value}(${commits.join('\t')})\n`
        })
        string += item
      })
    } else {
      string += obj.raw
    }
  }
  return string
}
const formatLog = function (content) {
  const ast = marked.lexer(content)

  return transform(ast, '')
}

module.exports = formatLog
