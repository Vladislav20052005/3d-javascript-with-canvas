const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Edge {
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }
    draw(){
        c.beginPath()
        c.moveTo(this.p1.image.x, this.p1.image.y)
        c.lineTo(this.p2.image.x, this.p2.image.y)
        c.strokeStyle = '#00ff00'
        c.lineWidth = 5
        c.stroke()
    }
}


class Point {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        this.sx = 0
        this.sy = 0
        this.image = {x: 50, y: 50}
        this.velocity = 0
        this.radius = 2
    }

    determinant(a1, a2, a3, a4, a5, a6, a7, a8, a9){
        return a1 * a5 * a9 + a3 * a4 * a8 + a2 * a6 * a7 - a3 * a5 * a7 - a1 * a6 * a8 - a2 * a4 * a9
    }

    display() {
        let det = this.determinant(spectator.x - this.x, -spectator.vecup.x, -spectator.vecri.x, spectator.y - this.y, -spectator.vecup.y, -spectator.vecri.y, spectator.z - this.z, -spectator.vecup.z, -spectator.vecri.z)
        let det1 = this.determinant(spectator.corvp.x - this.x, -spectator.vecup.x, -spectator.vecri.x, spectator.corvp.y - this.y, -spectator.vecup.y, -spectator.vecri.y, spectator.corvp.z - this.z, -spectator.vecup.z, -spectator.vecri.z)
        let det2 = this.determinant(spectator.x - this.x, spectator.corvp.x - this.x, -spectator.vecri.x, spectator.y - this.y, spectator.corvp.y - this.y, -spectator.vecri.y, spectator.z - this.z, spectator.corvp.z - this.z, -spectator.vecri.z)
        let det3 = this.determinant(spectator.x - this.x, -spectator.vecup.x, spectator.corvp.x - this.x, spectator.y - this.y, -spectator.vecup.y, spectator.corvp.y - this.y, spectator.z - this.z, -spectator.vecup.z, spectator.corvp.z - this.z)
        this.sx = det3 / det
        this.sy = det2 / det
        return det1 / det
    }


    draw() {
        if(this.display() >= 1){return}
        const norm = 100
        this.image.x = norm * this.sx + canvas.width / 2
        this.image.y = -norm * this.sy + canvas.height / 2
        c.beginPath()
        c.arc(this.image.x, this.image.y, this.radius, 0, Math.PI * 2)
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
        this.corvp = {x: this.x + this.rfov, y: 0, z: 0}
        this.vecup = {x: 0, y: 1, z: 0}
        this.vecri = {x: 0, y: 0, z: 1}
    }
    calculatevp() {
        this.vecvp.y = Math.sin(this.alpha) * this.rfov
        this.vecvp.x = Math.cos(this.beta) * Math.cos(this.alpha) * this.rfov
        this.vecvp.z = Math.sin(this.beta) * Math.cos(this.alpha) * this.rfov
        this.vecup.y = Math.cos(this.alpha)
        this.vecup.x = -Math.cos(this.beta) * Math.sin(this.alpha)
        this.vecup.z = -Math.sin(this.beta) * Math.sin(this.alpha)
        this.vecri.x = -Math.sin(this.beta)
        this.vecri.z = Math.cos(this.beta)
        this.corvp.x = this.x + this.vecvp.x
        this.corvp.y = this.y + this.vecvp.y
        this.corvp.z = this.z + this.vecvp.z
    }
    update() {
        this.x += this.velocity.x * Math.cos(this.beta) - this.velocity.z * Math.sin(this.beta)
        this.z += this.velocity.x * Math.sin(this.beta) + this.velocity.z * Math.cos(this.beta)
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

let point = new Point(-1, -1, -1)
let point2 = new Point(-1, 1, -1)
let point3 = new Point(-1, -1, 1)
let point4 = new Point(-1, 1, 1)
let point5 = new Point(1, -1, -1)
let point6 = new Point(1, 1, -1)
let point7 = new Point(1, -1, 1)
let point8 = new Point(1, 1, 1)
const spectator = new Spectator(-3, 0, 0)
const edge = new Edge(point, point2)
const edge2 = new Edge(point, point3)
const edge3 = new Edge(point, point4)
const edge4 = new Edge(point, point5)
const edge5 = new Edge(point, point6)
const edge6 = new Edge(point, point7)
const edge7 = new Edge(point, point8)
const edge8 = new Edge(point2, point3)
const edge9 = new Edge(point2, point4)



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
    edge.draw()
    edge2.draw()
    edge3.draw()
    edge4.draw()
    edge5.draw()
    edge6.draw()
    edge7.draw()
    edge8.draw()
    edge9.draw()
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
            spectator.angleVelocity.beta = 0.02
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
            spectator.angleVelocity.beta = -0.02
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
