import { render, html } from './utils.js'
import { App } from './gold-purse.js'
import './index.css'

const game = new App()
game.element = document.querySelector('web-rumble')
game.start()
window.game = game

