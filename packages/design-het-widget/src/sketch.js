import FileSaver from 'file-saver'
import svgToMiniDataURI from 'mini-svg-data-uri'
import {getRandom} from './helpers.js'
import {RED} from './constants.js'

export default class Sketch {
  constructor (width, height, shadowRoot) {
    this.width = width
    this.height = height
    this.shadowRoot = shadowRoot

    this.svgNodes = []
    this.fullscreen = false
    this.background ='rgba(0, 0, 0, 1)'
    this.color = RED

    this.installation = false
    this.x = 0
    this.y = 0

    this.dx = null

    this.xgap = 100 // todo
    this.zgap = 100 // todo
    this.theta = 0.00
    this.nodesize = 10
    this.spacing = 3
    this.tempo = 0.1
    this.ampl = 20
    this.period = 500
    this.xNodes = Math.ceil(this.width / this.xgap) + 2
    this.yNodes = Math.ceil(this.height / this.zgap) + 2

    this.setupP5 = this.setupP5.bind(this)
    this.loader = this.shadowRoot.querySelector('.loader')
  }

  setupP5 (p) {
    const randomRotate = getRandom(0, 0.15, 0.01)
    this.p = p
    p.setup = () => { this.setup() }
    p.draw = () => { this.draw(randomRotate) }
  }

  setInstallation() {
    this.installation = true
    this.color = "#fff"
  }

  setinstallationRotation(values) {
    if (values.x) {
      let degX = (360 * values.x) / 100
      this.x = degX * (Math.PI/180)
    }
    if (values.y) {
      let degY = (360 * values.y) / 100
      this.y = degY * (Math.PI/180)
    }
  }

  setup () {
    this.p.noCanvas()
    this.p.createCanvas(this.width, this.height, this.p.WEBGL)
    this.p.pixelDensity(4) // todo
    this.p.noStroke()
    this.p.fill(this.color)

    this.p.frameRate(30)

    this.setOrtho()
    // this.p.setAttributes('antialias', true)
    // this.p.smooth()
    // this.p.debugMode()

    // move p5 default canvas inside widget
    this.canvas = document.querySelector('canvas')
    this.canvas.parentNode.removeChild(this.canvas)
    const widget = this.shadowRoot.querySelector('.widget-container')
    widget.appendChild(this.canvas)
  }

  draw (randomRotate) {
    this.p.clear()
    this.p.background(this.background)

    if (this.fullscreen && !this.installation) {
      this.p.orbitControl()
    }

    this.dx = (this.p.TWO_PI / this.period) * this.spacing
    this.theta += this.tempo

    // todo
    const tx = -this.width/2 - (2 * this.xgap)
    const ty = this.height/2 + (2 * this.zgap)
    this.p.translate(tx, ty, 0)
    this.p.rotateX(this.p.HALF_PI)
    this.p.rotateX(randomRotate)
    this.p.rotateZ(randomRotate)

    if (this.installation) {
      this.p.rotateX(this.x)
      this.p.rotateZ(this.y)
    }

    this.drawGrid()
    this.moveSvg()
  }

  updateSvgNodes(nodes, groups) {
    this.svgNodes = nodes
    this.svgGroups = groups
  }

  moveSvg() {
    const y = [
      Math.sin(this.theta) * this.ampl,
      Math.sin(this.theta + this.dx * 5) * this.ampl,
      Math.sin(this.theta + this.dx * 10) * this.ampl
    ]
    this.svgNodes.forEach((node) => {
      const pos = parseInt(node.getAttribute('pos'))
      const i = parseInt(node.getAttribute('index'))
      if (typeof pos === 'number' && typeof i === 'number' ) {
        node.setAttribute('cy', pos + y[i])
      }
    })
  }

  drawGrid () {
    let objpos = 0
    let a = this.theta
    let z = 0

    for(let x = 0; x<= this.xNodes; x++) {
      const yp = Math.sin(a) * this.ampl
      this.p.translate(this.xgap, yp, z * -this.zgap)

      for(z = 0; z<= this.yNodes; z++) {
        this.p.translate(0, 0, this.zgap)
        this.p.sphere(this.nodesize)

        a += this.dx
      }
    }
  }

  stop() {
    this.p.noLoop()
    this.save()
  }

  play() {
    this.p.loop()
  }

  setFullscreen (val) {
    this.fullscreen = val
  }

  save() {
    const svg = this.shadowRoot.querySelector('svg#circle')

    svg.style.display = 'none'
    this.canvas.style.display = 'none'
    this.loader.style.display = 'block'
    this.background = 'rgba(0, 0, 0, 0)'

    const aspect = this.width / this.height
    const landscape = aspect > 1
    const retina = window.devicePixelRatio > 1

    let width, height
    if (landscape) {
      width = retina ? 4000 : 4000 // todo
      height = Math.round(width / aspect)
    } else {
      height = retina ? 4000 : 4000 // todo
      width = Math.round(height * aspect)
    }

    const zoom = width / this.width

    this.p.resizeCanvas(width, height, true)
    this.setOrtho()
    this.p.redraw()

    const newCanvas = document.createElement('canvas')
    newCanvas.setAttribute('width', width)
    newCanvas.setAttribute('height', height)
    const ctx = newCanvas.getContext('2d')

    const image = new Image()
    const s = new XMLSerializer()
    const svgStr = s.serializeToString(svg)
    const url = svgToMiniDataURI(svgStr)
    image.src = url
    image.addEventListener('load', () => {
      URL.revokeObjectURL(url)

      const dataURL = this.canvas.toDataURL('image/png', 1.0)
      const canvasImg = new Image()
      canvasImg.addEventListener('load', () => {
        URL.revokeObjectURL(dataURL)

        ctx.drawImage(canvasImg, 0, 0, width, height)
        // ctx.drawImage(image, 0, 0, width, height) // todo

        newCanvas.toBlob((blob) => {
          FileSaver.saveAs(blob, 'design-het.png')
          this.p.resizeCanvas(this.width, this.height, true)
          this.setOrtho()
          this.canvas.style.display = 'block'
          this.loader.style.display = 'none'
          svg.style.display= 'inline-block'
          this.play()
        })
      })
      canvasImg.src = dataURL
    })
  }

  setOrtho () {
    this.p.ortho(-this.width/2, this.width/2, -this.height/2, this.height/2, this.width * -3, this.width * 3)
  }

  update (name, val) {
    if (this[name] !== val) {
      this[name] = parseFloat(val)
      if (name === 'xgap' || name === 'zgap') {
        this.calcNodeNum()
      }
    }
  }

  calcNodeNum () {
    this.xNodes = Math.ceil(this.width / this.xgap) + 2
    this.yNodes = Math.ceil(this.height / this.zgap) + 2
  }

  windowResized(width, height) {
    this.width = width
    this.height = height
    this.p.resizeCanvas(this.width, this.height)
    this.setOrtho()
    this.calcNodeNum()
  }
}
