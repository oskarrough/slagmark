import {render} from './utils.js'
import {GameLoop} from './nodes.js'
import {UI} from './ui.js'
import './index.css'

const game = new GameLoop()
game.element = document.querySelector('web-rumble')
window.game = game

// Trigger a one-time render for the menu.
render(game.element, UI(game))

