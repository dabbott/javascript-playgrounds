import { Events } from 'webplayer'

Events.on('app:before', () => {
  const context = window.Framer.CurrentContext

  context.reset()
  context.index = -1
})
