const newlineRegex = /\r\n|\n|\r/g

export default function changedRanges(originalText, newText) {
  if (typeof navigator === 'undefined') return { added: [] }

  const diff = require('diff')

  function diffLines(originalText, newText) {
    const lineDiff = diff.diffLines(originalText, newText, {
      newlineIsToken: true,
    })

    const result = lineDiff.reduce(
      (result, change, index) => {
        if (change.removed) {
          return result
        }

        let { ranges, value } = result

        const beforeLines = value.split(newlineRegex)

        value += change.value

        const afterLines = value.split(newlineRegex)

        let beforeLineCount = beforeLines.length - 1
        let afterLineCount = afterLines.length - 1

        // If we start with a non-empty line that doesn't change, don't count it
        if (
          beforeLines.length > 0 &&
          beforeLines[beforeLineCount].trim() != '' &&
          beforeLines[beforeLineCount] === afterLines[beforeLineCount]
        ) {
          beforeLineCount += 1
        }

        // If we end with an empty line, don't count it
        if (afterLines.length > 0 && afterLines[afterLineCount].trim() == '') {
          afterLineCount -= 1
        }

        if (change.added) {
          ranges.push([beforeLineCount, afterLineCount])
        }

        return { value, ranges }
      },
      { value: '', ranges: [] }
    )

    return { added: result.ranges }
  }

  return diffLines(originalText, newText)
}
