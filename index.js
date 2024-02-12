const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Point {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        this.sx = 50
        this.sy = 50
        this.velocity = 0
        this.radius = 2
    }

    determinant(a1, a2, a3, a4, a5, a6, a7, a8, a9){
        return a1 * a5 * a9 + a3 * a4 * a8 + a2 * a6 * a7 - a3 * a5 * a7 - a1 * a6 * a8 - a2 * a4 * a9
    }

    display() {                 //(spectator.vpx - this.x)    (spectator.vpy - this.y)      (spectator.vpz - this.z)
        /*let det = (spectator.x - this.x) * (spectator.vecupy * spectator.vecriz - spectator.vecriy * spectator.vecupz)
         + spectator.vecupx * (-1 * (spectator.y - this.y) * spectator.vecriz + spectator.vecriy * (spectator.z - this.z))
          - spectator.vecrix * (-1 * (spectator.y - this.y) * spectator.vecupz + spectator.vecupy * (spectator.z - this.z))
        let det2 = (spectator.x - this.x) * (-1 * (spectator.vpy - this.y) * spectator.vecriz + spectator.vecriy * (spectator.vpz - this.z))
        - (spectator.vpx - this.x) * (-1 * (spectator.y - this.y) * spectator.vecriz + spectator.vecriy * (spectator.z - this.z))
         - spectator.vecrix * ((spectator.y - this.y) * (spectator.vpz - this.z) - (spectator.vpy - this.y) * (spectator.z - this.z))
         let det3 = (spectator.x - this.x) * (-1 * spectator.vecupy * (spectator.vpz - this.z) + (spectator.vpy - this.y) * spectator.vecupz)
         + spectator.vecupx * ((spectator.y - this.y) * (spectator.vpz - this.z) - (spectator.vpy - this.y) * (spectator.z - this.z))
          + (spectator.vpx - this.x) * (-1 * (spectator.y - this.y) * spectator.vecupz + spectator.vecupy * (spectator.z - this.z))*/
        let det = this.determinant(spectator.x - this.x, -spectator.vecupx, -spectator.vecrix, spectator.y - this.y, -spectator.vecupy, -spectator.vecriy, spectator.z - this.z, -spectator.vecupz, -spectator.vecriz)
        let det1 = this.determinant(spectator.vpx - this.x, -spectator.vecupx, -spectator.vecrix, spectator.vpy - this.y, -spectator.vecupy, -spectator.vecriy, spectator.vpz - this.z, -spectator.vecupz, -spectator.vecriz)
        let det2 = this.determinant(spectator.x - this.x, spectator.vpx - this.x, -spectator.vecrix, spectator.y - this.y, spectator.vpy - this.y, -spectator.vecriy, spectator.z - this.z, spectator.vpz - this.z, -spectator.vecriz)
        let det3 = this.determinant(spectator.x - this.x, -spectator.vecupx, spectator.vpx - this.x, spectator.y - this.y, -spectator.vecupy, spectator.vpy - this.y, spectator.z - this.z, -spectator.vecupz, spectator.vpz - this.z)
        this.sx = det3 / det
        this.sy = det2 / det
        return det1 / det
    }


    draw() {
        if(this.display() >= 1){return}
        const norm = 100;
        //console.log(this.sx, this.sy)
        c.beginPath()
        c.arc(norm * this.sx + canvas.width / 2, -1 * norm * this.sy + canvas.height / 2, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }
}

class Spectator {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        this.velocity = {x: 0, y: 0, z: 0}
        this.angleVelocity = {alpha: 0, beta: 0}
        this.alpha = 0
        this.beta = 0
        this.rfov = 2
        this.vecvp = {x: this.rfov, y: 0, z: 0}
        this.vpx = this.rfov + this.x
        this.vpy = 0
        this.vpz = 0
        this.vecupx = 0
        this.vecupy = 1
        this.vecupz = 0
        this.vecrix = 0
        this.vecriy = 0
        this.vecriz = 1
    }
    calculatevp() {
        this.vecvp.y = Math.sin(this.alpha) * this.rfov
        this.vecvp.x = Math.cos(this.beta) * Math.cos(this.alpha) * this.rfov
        this.vecvp.z = Math.sin(this.beta) * Math.cos(this.alpha) * this.rfov
        this.vecupy = ((this.vecvp.x ** 2 + this.vecvp.z ** 2) ** 0.5) / this.rfov
        this.vecupx =  -1 * this.vecvp.x * this.vecvp.y / (((this.vecvp.x ** 2 + this.vecvp.z ** 2) * (this.vecvp.x ** 2 + this.vecvp.y ** 2 + this.vecvp.z ** 2)) ** 0.5)
        this.vecupz = this.vecvp.z * this.vecvp.y / (((this.vecvp.x ** 2 + this.vecvp.z ** 2) * (this.vecvp.x ** 2 + this.vecvp.y ** 2 + this.vecvp.z ** 2)) ** 0.5)
        this.vpx = this.x + this.vecvp.x
        this.vpy = this.y + this.vecvp.y
        this.vpz = this.z + this.vecvp.z
    }
    update() {
        this.x += this.velocity.x
        this.z += this.velocity.z
        this.y += this.velocity.y
        if(this.alpha <= Math.PI / 2 && this.alpha >= - Math.PI / 2){
            this.alpha += this.angleVelocity.alpha
        }
        else{
            if(this.alpha > 0){this.alpha = Math.PI / 2}
            else{this.alpha = -Math.PI / 2}
        }
        this.beta += this.angleVelocity.beta
        this.calculatevp()
    }
}

let point = new Point(0, -1, -1)
let point2 = new Point(0, 1, -1)
let point3 = new Point(0, -1, 1)
let point4 = new Point(0, 1, 1)
let point5 = new Point(1, -1, -1)
let point6 = new Point(1, 1, -1)
let point7 = new Point(1, -1, 1)
let point8 = new Point(1, 1, 1)
const spectator = new Spectator(-3, 0, 0)

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    spectator.update()
    point.draw()
    point2.draw()
    point3.draw()
    point4.draw()
    point5.draw()
    point6.draw()
    point7.draw()
    point8.draw()
    console.log(spectator.alpha)
}
animate()




addEventListener('keydown', ({key}) => {
    switch (key){
        case 'w':
            spectator.velocity.x = 0.1
            break
        case 'a':
            spectator.velocity.z = -0.1
            break
        case 's':
            spectator.velocity.x = -0.1
            break
        case 'd':
            spectator.velocity.z = 0.1
            break
        case 'x':
            spectator.velocity.y = -0.1
            break
        case ' ':
            spectator.velocity.y = 0.1
            break
        case 'l':
            spectator.angleVelocity.beta = 0.1
            break
        case 'i':
            if(spectator.alpha < Math.PI / 2){
                spectator.angleVelocity.alpha = 0.02
            }
            break
        case 'k':
            if(spectator.alpha > -Math.PI / 2){
                spectator.angleVelocity.alpha = -0.02
            }
            break
        case 'j':
            spectator.angleVelocity.beta = -0.1
            break
    }
})

addEventListener('keyup', ({key}) => {
    switch (key){
        case 'w': case 's':
            spectator.velocity.x = 0
            break
        case 'a': case 'd':
            spectator.velocity.z = 0
            break
        case 'x': case ' ':
            spectator.velocity.y = 0
            break
        case 'l': case 'j':
            spectator.angleVelocity.beta = 0
            break
        case 'i': case 'k':
            spectator.angleVelocity.alpha = 0
            break
    }
})
