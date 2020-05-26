import React, { PureComponent } from 'react'
import { prefixObject } from '../../utils/PrefixInlineStyles'

// TypeScript's SymbolDisplayPartKind
//
// aliasName = 0,
// className = 1,
// enumName = 2,
// fieldName = 3,
// interfaceName = 4,
// keyword = 5,
// lineBreak = 6,
// numericLiteral = 7,
// stringLiteral = 8,
// localName = 9,
// methodName = 10,
// moduleName = 11,
// operator = 12,
// parameterName = 13,
// propertyName = 14,
// punctuation = 15,
// space = 16,
// text = 17,
// typeParameterName = 18,
// enumMemberName = 19,
// functionName = 20,
// regularExpressionLiteral = 21
//
function classNameForKind(kind) {
  switch (kind) {
    case 'keyword':
      return 'cm-keyword'
    case 'numericLiteral':
      return 'cm-number'
    case 'stringLiteral':
      return 'cm-string'
    case 'regularExpressionLiteral':
      return 'cm-string2'
    default:
      return ''
  }
}

const styles = prefixObject({
  type: {
    display: 'inline-block',
    padding: '4px 8px',
    fontFamily: "'source-code-pro', Menlo, 'Courier New', Consolas, monospace",
  },
  documentation: {
    display: 'inline-block',
    padding: '4px 8px',
    color: '#7d8b99',
  },
  documentationPart: {
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
})

export default class extends PureComponent {
  static defaultProps = {
    type: [],
    documentation: [],
  }

  render() {
    const { type, documentation } = this.props

    return (
      <React.Fragment>
        <span style={styles.type}>
          {type.map(({ text, kind }, index) => (
            <span className={classNameForKind(kind)} key={index}>
              {text}
            </span>
          ))}
        </span>
        {documentation.length > 0 && <div style={styles.divider} />}
        <span style={styles.documentation}>
          {documentation.map(({ text }, index) => (
            <span style={styles.documentationPart} key={index}>
              {text}
            </span>
          ))}
        </span>
      </React.Fragment>
    )
  }
}
