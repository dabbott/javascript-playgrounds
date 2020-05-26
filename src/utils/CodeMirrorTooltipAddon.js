export function tooltipAddon() {
  const CodeMirror = require('codemirror')

  const tooltipClassName = 'CodeMirror-tooltip'

  CodeMirror.defineOption('tooltip', null, function (cm, value) {
    // Remove existing state
    if (cm.state.tooltip) {
      const state = cm.state.tooltip
      CodeMirror.off(cm.getWrapperElement(), 'mousemove', state.mousemove)
      CodeMirror.off(cm.getWrapperElement(), 'mouseout', state.mouseout)
      CodeMirror.off(window, 'scroll', state.windowScroll)
      cm.off('cursorActivity', reset)
      cm.off('scroll', reset)
      cm.state.tooltip = null
    }

    // Set up new state
    if (value && value.getInfo) {
      const state = {
        mousemove: mousemove.bind(null, cm),
        mouseout: mouseout.bind(null, cm),
        windowScroll: reset.bind(null, cm),
        getInfo: value.getInfo,
      }
      CodeMirror.on(cm.getWrapperElement(), 'mousemove', state.mousemove)
      CodeMirror.on(cm.getWrapperElement(), 'mouseout', state.mouseout)
      CodeMirror.on(window, 'scroll', state.windowScroll)
      cm.on('cursorActivity', reset)
      cm.on('scroll', reset)
      cm.state.tooltip = state
    }
  })

  function mousemove(cm, event) {
    var data = cm.state.tooltip
    if (event.buttons == null ? event.which : event.buttons) {
      delete data.coords
    } else {
      data.coords = { left: event.clientX, top: event.clientY }
    }
    scheduleUpdate(cm)
  }

  function mouseout(cm, event) {
    if (!cm.getWrapperElement().contains(event.relatedTarget)) {
      var data = cm.state.tooltip
      delete data.coords
      scheduleUpdate(cm)
    }
  }

  /**
   * @param {CodeMirror} cm
   */
  function reset(cm) {
    clear(cm)
  }

  /**
   * @param {CodeMirror} cm
   */
  function clear(cm) {
    // Clear any existing timer
    clearTimeout(cm.state.tooltip.updateTimer)

    // Clear the hovered token
    delete cm.state.tooltip.token

    // Remove any existing tooltips
    if (cm.state.tooltip.removeTooltip) {
      cm.state.tooltip.removeTooltip()
      delete cm.state.tooltip.removeTooltip
    }
  }

  /**
   * @param {CodeMirror} cm
   */
  function scheduleUpdate(cm) {
    const { coords } = cm.state.tooltip

    if (!coords) {
      clear(cm)
      return
    }

    const token = getToken(cm, coords)

    if (!token) {
      clear(cm)
      return
    }

    // Already scheduled
    if (cm.state.tooltip.token && token.id === cm.state.tooltip.token.id) {
      return
    }

    clear(cm)

    cm.state.tooltip.token = token
    cm.state.tooltip.updateTimer = setTimeout(() => {
      update(cm)
    }, 300)
  }

  /**
   * CodeMirror gives us the character that will be selected on click,
   * which is sometimes the next character after the one the mouse is
   * currently over. We want to disable that behavior, and always select.
   * the character under the mouse.
   */
  function snapToChar(pos) {
    if (pos.sticky === 'before') {
      return new CodeMirror.Pos(pos.line, pos.ch - 1)
    }

    return pos
  }

  /**
   * @param {CodeMirror} cm
   * @returns {CodeMirror.Token | undefined}
   */
  function getToken(cm, coords) {
    const pos = snapToChar(cm.coordsChar(coords))

    if (pos.ch <= 0 && pos.xRel <= 0) return

    const token = cm.getTokenAt(new CodeMirror.Pos(pos.line, pos.ch + 1))

    if (pos.ch > token.end || token.string.trim() === '') return

    return {
      ...token,
      pos,
      id: `${token.start}:${token.end}:${pos.line}`,
    }
  }

  /**
   * @param {CodeMirror} cm
   */
  function update(cm) {
    const { coords, getInfo } = cm.state.tooltip

    if (!coords) return

    const token = getToken(cm, coords)

    if (!token) return

    if (typeof getInfo !== 'function') return

    const pos = token.pos

    const startPos = new CodeMirror.Pos(pos.line, token.start)

    getInfo(
      cm,
      {
        index: cm.indexFromPos(pos) + 1,
      },
      (text) => {
        cm.state.tooltip.removeTooltip = makeTooltip(
          cm,
          cm.charCoords(startPos),
          text
        )
      }
    )
  }

  // Tooltips

  function makeTooltip(cm, coords, content) {
    const tooltip = makeTooltipNode(coords, content)
    const container = getTooltipContainer(cm)
    container.appendChild(tooltip)

    return () => {
      removeFromParent(tooltip)
    }
  }

  /**
   * @returns {HTMLElement}
   */
  function getTooltipContainer(cm) {
    return ((cm.options || {}).hintOptions || {}).container || document.body
  }

  /**
   * @returns {HTMLElement}
   */
  function elt(tagname, cls /*, ... elts*/) {
    var e = document.createElement(tagname)
    if (cls) e.className = cls
    for (var i = 2; i < arguments.length; ++i) {
      var elt = arguments[i]
      if (typeof elt == 'string') elt = document.createTextNode(elt)
      e.appendChild(elt)
    }
    return e
  }

  /**
   * @returns {HTMLElement}
   */
  function makeTooltipNode(coords, content) {
    var node = elt('div', tooltipClassName, content)
    node.style.left = `${coords.left}px`
    node.style.top = `${Math.max(1, coords.top - 30)}px`
    return node
  }

  /**
   * @param {HTMLElement} node
   */
  function removeFromParent(node) {
    const parent = node && node.parentNode

    if (parent) {
      parent.removeChild(node)
    }
  }
}
