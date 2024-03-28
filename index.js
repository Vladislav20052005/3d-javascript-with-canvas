const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

function compare(a, b){
    if(a.distance < b.distance){
        return 1
    }
    if(a.distance > b.distance){
        return -1
    }
    return 0
}

function determinant(a1, a2, a3, a4, a5, a6, a7, a8, a9){
    return a1 * a5 * a9 + a3 * a4 * a8 + a2 * a6 * a7 - a3 * a5 * a7 - a1 * a6 * a8 - a2 * a4 * a9
}

function computeIntersection(straight_shift, straight_basis, surface_shift, surface_basis1, surface_basis2){
    let det = determinant(straight_basis.x, -surface_basis1.x, -surface_basis2.x, 
        straight_basis.y, -surface_basis1.y, -surface_basis2.y,
         straight_basis.z, -surface_basis1.z, -surface_basis2.z)
    let det1 = determinant(surface_shift.x - straight_shift.x, -surface_basis1.x, -surface_basis2.x, surface_shift.y - straight_shift.y, -surface_basis1.y, -surface_basis2.y, surface_shift.z - straight_shift.z, -surface_basis1.z, -surface_basis2.z)
    let det2 = determinant(straight_basis.x, surface_shift.x - straight_shift.x, -surface_basis2.x, straight_basis.y, surface_shift.y - straight_shift.y, -surface_basis2.y, straight_basis.z, surface_shift.z - straight_shift.z, -surface_basis2.z)
    let det3 = determinant(straight_basis.x, -surface_basis1.x, surface_shift.x - straight_shift.x, straight_basis.y, -surface_basis1.y, surface_shift.y - straight_shift.y, straight_basis.z, -surface_basis1.z, surface_shift.z - straight_shift.z)
    return [det1 / det, det2 / det, det3 / det]
}

class Object {
    constructor(position, pointcords, facebends, metrics){
        this.position = position
        this.points = []
        this.faces = []
        this.metrics = metrics
        pointcords.forEach(pc => {
            let np = new Point(position = {x: pc.x + this.position.x, y: pc.y + this.position.y, z: pc.z + this.position.z})
            this.points.push(np)
            points.push(np)
        })
        facebends.forEach(fb => {
            var nm = []
            fb.forEach(fc => {
                nm.push(this.points[fc])
            })
            let nf = new Face(nm, this.metrics)
            this.faces.push(nf)
            faces.push(nf)
        })
    }
}


class HollowObject {
    constructor(position, pointcords, edgebends){
        this.position = position
        this.points = []
        this.edges = []
        pointcords.forEach(pc => {
            let np = new Point(position = {x: pc.x + this.position.x, y: pc.y + this.position.y, z: pc.z + this.position.z})
            this.points.push(np)
            points.push(np)
        })
        edgebends.forEach(eb => {
            let ne = new Edge(this.points[eb[0]], this.points[eb[1]])
            this.edges.push(ne)
            edges.push(ne)
        })
    }
}

class Particle extends Object {
    constructor(position, pointcords, edgebends, metrics, velocity, angles, angleVelocity) {
        super(position, pointcords, edgebends, metrics)
        //this.position = position
        this.velocity = velocity
        this.angles = angles
        this.angleVelocity = angleVelocity
    }
    update(){
        this.position.alpha += this.velocity.alpha
        this.position.y += this.velocity.y
        this.position.r += this.velocity.r

        this.angles.alpha += this.angleVelocity.alpha
        this.angles.beta += this.angleVelocity.beta

        this.points[0].position.y = Math.sin(this.angles.alpha) + this.position.y
        this.points[0].position.x = Math.cos(this.angles.beta) * Math.cos(this.angles.alpha) + Math.cos(this.position.alpha) * this.position.r
        this.points[0].position.z = Math.sin(this.angles.beta) * Math.cos(this.angles.alpha) + Math.sin(this.position.alpha) * this.position.r

        this.points[1].position.y = -0.5 * Math.sin(this.angles.alpha) + this.position.y
        this.points[1].position.x = -0.5 * Math.cos(this.angles.beta) * Math.cos(this.angles.alpha) - 0.866 * Math.sin(this.angles.beta) + Math.cos(this.position.alpha) * this.position.r
        this.points[1].position.z = -0.5 * Math.sin(this.angles.beta) * Math.cos(this.angles.alpha) + 0.866 * Math.cos(this.angles.beta) + Math.sin(this.position.alpha) * this.position.r

        this.points[2].position.y = -0.5 * Math.sin(this.angles.alpha) + this.position.y
        this.points[2].position.x = -0.5 * Math.cos(this.angles.beta) * Math.cos(this.angles.alpha) + 0.866 * Math.sin(this.angles.beta) + Math.cos(this.position.alpha) * this.position.r
        this.points[2].position.z = -0.5 * Math.sin(this.angles.beta) * Math.cos(this.angles.alpha) - 0.866 * Math.cos(this.angles.beta) + Math.sin(this.position.alpha) * this.position.r

        if(this.position.y < -10){
            this.position.y = 100
        }
    }

}

class Face {
    constructor(points, metrics){
        this.points = points
        this.baricenter = {x: 0, y: 0, z: 0}
        this.order = this.points.length
        this.metrics = metrics
        this.distance = 0
    }
    update(){
        switch(this.metrics){
            case 'baricentric':
                this.baricenter = {x: 0, y: 0, z: 0}
                this.points.forEach(p => {
                    this.baricenter.x += p.position.x
                    this.baricenter.y += p.position.y
                    this.baricenter.z += p.position.z
                })

                this.baricenter.x /= this.order
                this.baricenter.y /= this.order
                this.baricenter.z /= this.order
                this.distance = (this.baricenter.x - spectator.position.x)**2 + (this.baricenter.y - spectator.position.y)**2 + (this.baricenter.z - spectator.position.z)**2
                break
            case 'minpoint':
                this.distance = 0
                this.points.forEach(p => {
                    if(this.distance > p.distance){
                        this.distance = p.distance
                    }
                })
                break
            case 'maxpoint':
                this.distance = 0
                this.points.forEach(p => {
                    if(this.distance < p.distance){
                        this.distance = p.distance
                    }
                })
                break
        }
        this.draw()
    }

    draw(){
        c.beginPath()
        let firstvis
        for(let j = 0; j < this.order; j++){
            if(this.points[j].status == 'visible'){
                firstvis = j
                break
            }
        }
        c.strokeStyle = 'green'
        c.lineWidth = 1
        let i = firstvis
        while(i < this.order + firstvis){
            if(this.points[i % this.order].status == 'visible' && this.points[(i + 1) % this.order].status == 'visible'){
                c.lineTo(this.points[(i + 1) % this.order].image.x, this.points[(i + 1) % this.order].image.y)
            }
            if(this.points[i % this.order].status == 'visible' && this.points[(i + 1) % this.order].status == 'invisible'){
                let a = computeIntersection(this.points[i % this.order].position, {x: this.points[(i + 1) % this.order].position.x - this.points[i % this.order].position.x, y: this.points[(i + 1) % this.order].position.y - this.points[i % this.order].position.y, z: this.points[(i + 1) % this.order].position.z - this.points[i % this.order].position.z},
                spectator.corvp, spectator.vecup, spectator.vecri)
                c.lineTo(this.points[i % this.order].image.x, this.points[i % this.order].image.y)
                c.lineTo(Point.norm * a[2] + canvas.width / 2, -Point.norm * a[1] + canvas.height / 2)
            }
            if(this.points[i % this.order].status == 'invisible' && this.points[(i + 1) % this.order].status == 'visible'){
                let a = computeIntersection(this.points[i % this.order].position, {x: this.points[(i + 1) % this.order].position.x - this.points[i % this.order].position.x, y: this.points[(i + 1) % this.order].position.y - this.points[i % this.order].position.y, z: this.points[(i + 1) % this.order].position.z - this.points[i % this.order].position.z},
                spectator.corvp, spectator.vecup, spectator.vecri)
                c.lineTo(Point.norm * a[2] + canvas.width / 2, -Point.norm * a[1] + canvas.height / 2)
                c.lineTo(this.points[(i + 1) % this.order].image.x, this.points[(i + 1) % this.order].image.y)
            }
            i++;
        }
        c.closePath()
        c.fillStyle = 'black'
        c.fill()
        c.stroke()
        c.closePath()
        c.stroke()
    }
}

class Edge {
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }
    update(){
        c.beginPath()
        if(this.p1.status == 'visible' && this.p2.status == 'visible'){
            c.moveTo(this.p1.image.x, this.p1.image.y)
            c.lineTo(this.p2.image.x, this.p2.image.y)
        }
        if(this.p1.status == 'visible' && this.p2.status == 'invisible'){
            c.moveTo(this.p1.image.x, this.p1.image.y)
            let a = computeIntersection(this.p1.position, {x: this.p2.position.x - this.p1.position.x, y: this.p2.position.y - this.p1.position.y, z: this.p2.position.z - this.p1.position.z}, spectator.corvp, spectator.vecup, spectator.vecri)
            c.lineTo(Point.norm * a[2] + canvas.width / 2, -Point.norm * a[1] + canvas.height / 2)
        }
        if(this.p1.status == 'invisible' && this.p2.status == 'visible'){
            let a = computeIntersection(this.p1.position, {x: this.p2.position.x - this.p1.position.x, y: this.p2.position.y - this.p1.position.y, z: this.p2.position.z - this.p1.position.z}, spectator.corvp, spectator.vecup, spectator.vecri)
            c.moveTo(Point.norm * a[2] + canvas.width / 2, -Point.norm * a[1] + canvas.height / 2)
            c.lineTo(this.p2.image.x, this.p2.image.y)
        }
        c.strokeStyle = '#00ff00'
        c.lineWidth = 0.7
        c.stroke()
    }
}


class Point {
    static norm = 100
    constructor(position) {
        this.position = position
        this.sx = 0
        this.sy = 0
        this.image = {x: 50, y: 50}
        this.velocity = {x: 0, y: 0, z: 0}
        this.radius = 2
        this.status = 'visible'
        this.distance = 0
    }


    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.position.z += this.velocity.z

        this.distance = (spectator.position.x - this.position.x) ** 2 + (spectator.position.y - this.position.y) ** 2 + (spectator.position.z - this.position.z) ** 2
        let a = computeIntersection(this.position, {x: spectator.position.x - this.position.x, y: spectator.position.y - this.position.y, z: spectator.position.z - this.position.z},
            spectator.corvp, spectator.vecup, spectator.vecri)
        if(a[0] < 0 || a[0] > 1){this.status = 'invisible'}
        else{this.status = 'visible'}
        this.sy = a[1]
        this.sx = a[2]

        this.image.x = Point.norm * this.sx + canvas.width / 2
        this.image.y = -Point.norm * this.sy + canvas.height / 2
        /*c.beginPath()
        c.arc(this.image.x, this.image.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()*/
    }
}

class Spectator {
    constructor(position) {
        this.position = position
        this.velocity = {x: 0, y: 0, z: 0}
        this.angleVelocity = {alpha: 0, beta: 0}
        this.alpha = 0
        this.beta = 0
        this.height = 6
        this.gravity = -0.005
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

        this.corvp.x = this.position.x + this.vecvp.x
        this.corvp.y = this.position.y + this.vecvp.y
        this.corvp.z = this.position.z + this.vecvp.z
    }
    update() {
        this.position.x += (this.velocity.x * Math.cos(this.beta) - this.velocity.z * Math.sin(this.beta))
        this.position.z += (this.velocity.x * Math.sin(this.beta) + this.velocity.z * Math.cos(this.beta))
        //this.position.y += this.velocity.y
        if(this.alpha <= Math.PI / 2 && this.alpha >= - Math.PI / 2){
            this.alpha += this.angleVelocity.alpha * 2
        }
        else{
            if(this.alpha > 0){this.alpha = Math.PI / 2}
            else{this.alpha = -Math.PI / 2}
        }

        this.beta += this.angleVelocity.beta * 2
        this.calculatevp()
        if(isOnFloor()){
            this.velocity.y = 0
        }
        else{
            this.velocity.y += this.gravity
            this.position.y += this.velocity.y
        }
        if(this.position.y < -190){
            this.position.x = -3
            this.position.y = 6
            this.position.z = 0
            this.velocity.y = 0
        }
    }
}

function isOnFloor(){
    return spectator.position.x > floor.position.x && spectator.position.x < floor.position.x + floor.height && spectator.position.z > floor.position.z && spectator.position.z < floor.position.z + floor.width && spectator.position.y > floor.position.y && spectator.position.y < floor.position.y + spectator.height && spectator.velocity.y <= 0
}

class Floor {
    constructor(position, width, height){
        this.position = position
        this.width = width
        this.height = height
    }
}

class Interaction {
    constructor(position, width, height, type){
        this.position = position
        this.width = width
        this.height = height
        this.type = type
    }

    action(){
        switch (this.type){
            case 'packman':
                console.log('packman is pressed')
                break
            case 'battleship':
                console.log('battleship is pressed')
                break
            case 'life':
                console.log('life is pressed')
                break   
        }
    }
}



let points = []
let edges = []
let faces = []
const spectator = new Spectator(position = {x: -3, y: 6, z: 0})

const platformwidth = 10
const platformheight = 12
const brickwidth = 6
const brickheight = 4

let platp = []
for(let i = 0; i < platformheight; i++){
    for(let j = 0; j < platformwidth; j++){
        platp.push(position = {x: i * brickheight, y: 0, z: j * brickwidth})
    }
}
let platf = []
for(let i = 0; i < platformheight - 1; i+=2){
    for(let j = 0; j < platformwidth - 2; j+=2){
        platf.push([i * platformwidth + j, (i + 1) * platformwidth + j, (i + 1) * platformwidth + j + 2, i * platformwidth + j + 2])
    }
}

for(let i = 1; i < platformheight - 1; i+=2){
    platf.push([i * platformwidth, (i + 1) * platformwidth, (i + 1) * platformwidth + 1, i * platformwidth + 1])
}
for(let i = 0; i < platformheight - 1; i+=2){
    platf.push([i * platformwidth + platformwidth - 2, (i + 1) * platformwidth + platformwidth - 2, (i + 1) * platformwidth + platformwidth - 1, i * platformwidth + platformwidth - 1])
}

for(let i = 1; i < platformheight - 1; i+=2){
    for(let j = 1; j < platformwidth - 2; j+=2){
        platf.push([i * platformwidth + j, (i + 1) * platformwidth + j, (i + 1) * platformwidth + j + 2, i * platformwidth + j + 2])
    }
}
const platform = new Object(position = {x: -(platformheight - 1) * brickheight / 2, y: 0, z: -(platformwidth - 1) * brickwidth / 2}, platp, platf, 'maxpoint')
let floor = new Floor(position = {x: -(platformheight - 1) * brickheight / 2, y: 0, z: -(platformwidth - 1) * brickwidth / 2}, platformwidth * brickwidth, platformheight * brickheight)


const gridsize = 50
const widt = 40

let gridp = []
for(let i = 0; i < gridsize; i++){
    for(let j = 0; j < gridsize; j++){
        gridp.push({x: i * widt, y: 0, z: j * widt})
    }
}
let gride = []
for(let i = 0; i < gridsize - 1; i++){
    for(let j = 0; j < gridsize; j++){
        gride.push([i * gridsize + j, (i + 1) * gridsize + j])
    }
}
for(let i = 0; i < gridsize; i++){
    for(let j = 0; j < gridsize - 1; j++){
        gride.push([i * gridsize + j, i * gridsize + j + 1])
    }
}
const wavecenter = {x: 0, y: -40, z: 0}
const grid = new HollowObject(position = {x: -gridsize * widt / 2, y: -40, z: -gridsize * widt / 2}, gridp, gride)

stars = []
const starscnt = 1000
const sradius = 1000
for(let i = 0; i < starscnt; i++){
    let alpha = Math.random() * Math.PI
    let beta = Math.random() * Math.PI * 2
    stars.push(new HollowObject(position = {x: Math.cos(alpha) * Math.cos(beta) * sradius, y: Math.sin(alpha) * sradius, z: Math.cos(alpha) * Math.sin(beta) * sradius}, [{x: 0, y: 0, z: 0}, {x: 0, y: 5, z: 0}], [[0, 1]], 'maxpoint'))
}



const gaem1 = new Object(position = {x: 10, y: 0, z: -6}, [
    {x: 0, y: 0, z: 0},//0
    {x: 3, y: 0, z: 0},//1
    {x: 3, y: 0, z: 3},//2
    {x: 0, y: 0, z: 3},//3

    {x: 0, y: 3, z: 0},//4
    {x: 3, y: 3, z: 0},//5
    {x: 3, y: 3, z: 3},//6
    {x: 0, y: 3, z: 3},//7

    {x: 1, y: 4, z: 0},//8
    {x: 3, y: 4, z: 0},//9
    {x: 3, y: 4, z: 3},//10
    {x: 1, y: 4, z: 3},//11

    {x: 1, y: 6, z: 0},//12
    {x: 3, y: 6, z: 0},//13
    {x: 3, y: 6, z: 3},//14
    {x: 1, y: 6, z: 3},//15

    {x: 1.2, y: 4.2, z: 0.2},//16
    {x: 1.2, y: 4.2, z: 2.8},//17
    {x: 1.2, y: 5.8, z: 0.2},//18
    {x: 1.2, y: 5.8, z: 2.8},//19

    {x: 0.6, y: 3.63, z: 1.37},//20
    {x: 0.6, y: 3.63, z: 1.63},//21
    {x: 0.75, y: 3.8, z: 1.5},//22

    {x: 0.4, y: 3.37, z: 1.37},//23
    {x: 0.4, y: 3.37, z: 1.63},//24
    {x: 0.25, y: 3.2, z: 1.5},//25

    {x: 0.4, y: 3.4, z: 1.35},//26
    {x: 0.6, y: 3.6, z: 1.35},//27
    {x: 0.5, y: 3.5, z: 1.1},//28

    {x: 0.4, y: 3.4, z: 1.65},//29
    {x: 0.6, y: 3.6, z: 1.65},//30
    {x: 0.5, y: 3.5, z: 1.9},//31

], [

    [12, 13, 14, 15],
    [0, 1, 13, 12, 8, 4],
    [3, 2, 14, 15, 11, 7],
    [1, 2, 14, 13],
    [0, 3, 7, 4],
    [4, 7, 11, 8],
    [17, 16, 18, 19],//<--screen
    [8, 11, 17, 16],
    [8, 12, 18, 16],
    [15, 11, 17, 19],
    [15, 12, 18, 19],

    [20, 21, 22],
    [23, 24, 25],
    [26, 27, 28],
    [29, 30, 31],

], 'maxpoint')

const screen1 = new Object(position = {x: 0, y: 0, z: 0}, [
    {x: 11.2, y: 4.2, z: -5.8},
    {x: 11.2, y: 5.8, z: -5.8},
    {x: 11.2, y: 4.2, z: -3.2},
    {x: 11.2, y: 5.8, z: -3.2}
], [
    [0, 1, 3, 2]
], 'maxpoint')

const gaem2 = new Object(position = {x: 10, y: 0, z: 0}, [
    {x: 0, y: 0, z: 0},//0
    {x: 3, y: 0, z: 0},//1
    {x: 3, y: 0, z: 3},//2
    {x: 0, y: 0, z: 3},//3

    {x: 0, y: 3, z: 0},//4
    {x: 3, y: 3, z: 0},//5
    {x: 3, y: 3, z: 3},//6
    {x: 0, y: 3, z: 3},//7

    {x: 1, y: 4, z: 0},//8
    {x: 3, y: 4, z: 0},//9
    {x: 3, y: 4, z: 3},//10
    {x: 1, y: 4, z: 3},//11

    {x: 1, y: 6, z: 0},//12
    {x: 3, y: 6, z: 0},//13
    {x: 3, y: 6, z: 3},//14
    {x: 1, y: 6, z: 3},//15

    {x: 1.2, y: 4.2, z: 0.2},//16
    {x: 1.2, y: 4.2, z: 2.8},//17
    {x: 1.2, y: 5.8, z: 0.2},//18
    {x: 1.2, y: 5.8, z: 2.8},//19

    {x: 0.35, y: 3.35, z: 1.25},//20
    {x: 0.65, y: 3.65, z: 1.25},//21
    {x: 0.5, y: 3.5, z: 1.02},//22

    {x: 0.35, y: 3.35, z: 1.75},//23
    {x: 0.65, y: 3.65, z: 1.75},//24
    {x: 0.5, y: 3.5, z: 1.98},//25

    {x: 0.35, y: 3.35, z: 1.4},//26
    {x: 0.65, y: 3.65, z: 1.4},//27
    {x: 0.35, y: 3.35, z: 1.6},//28
    {x: 0.65, y: 3.65, z: 1.6},//29
], [

    [12, 13, 14, 15],
    [0, 1, 13, 12, 8, 4],
    [3, 2, 14, 15, 11, 7],
    [1, 2, 14, 13],
    [0, 3, 7, 4],
    [4, 7, 11, 8],
    [17, 16, 18, 19],
    [8, 11, 17, 16],
    [8, 12, 18, 16],
    [15, 11, 17, 19],
    [15, 12, 18, 19],
    [20, 21, 22],
    [23, 24, 25],
    [26, 27, 29, 28]

], 'maxpoint')

const screen2 = new Object(position = {x: 0, y: 0, z: 0}, [
    {x: 11.2, y: 4.2, z: 0.2},
    {x: 11.2, y: 5.8, z: 0.2},
    {x: 11.2, y: 4.2, z: 2.8},
    {x: 11.2, y: 5.8, z: 2.8}
], [
    [0, 1, 3, 2]
], 'maxpoint')

const gaem3 = new Object(position = {x: 10, y: 0, z: 6}, [
    {x: 0, y: 0, z: 0},//0
    {x: 3, y: 0, z: 0},//1
    {x: 3, y: 0, z: 3},//2
    {x: 0, y: 0, z: 3},//3

    {x: 0, y: 3, z: 0},//4
    {x: 3, y: 3, z: 0},//5
    {x: 3, y: 3, z: 3},//6
    {x: 0, y: 3, z: 3},//7

    {x: 1, y: 4, z: 0},//8
    {x: 3, y: 4, z: 0},//9
    {x: 3, y: 4, z: 3},//10
    {x: 1, y: 4, z: 3},//11

    {x: 1, y: 6, z: 0},//12
    {x: 3, y: 6, z: 0},//13
    {x: 3, y: 6, z: 3},//14
    {x: 1, y: 6, z: 3},//15

    {x: 1.2, y: 4.2, z: 0.2},//16
    {x: 1.2, y: 4.2, z: 2.8},//17
    {x: 1.2, y: 5.8, z: 0.2},//18
    {x: 1.2, y: 5.8, z: 2.8},//19

    {x: 0.4, y: 3.35, z: 1.15},//20
    {x: 0.6, y: 3.65, z: 1.15},//21
    {x: 0.4, y: 3.35, z: 1.45},//22
    {x: 0.6, y: 3.65, z: 1.45},//23

    {x: 0.4, y: 3.35, z: 1.55},//24
    {x: 0.6, y: 3.65, z: 1.55},//25
    {x: 0.4, y: 3.35, z: 1.85},//26
    {x: 0.6, y: 3.65, z: 1.85},//27

    {x: 0.4, y: 3.35, z: 1.95},//28
    {x: 0.6, y: 3.65, z: 1.95},//29
    {x: 0.4, y: 3.35, z: 2.25},//30
    {x: 0.6, y: 3.65, z: 2.25},//31

    {x: 0.4, y: 3.35, z: 0.75},//32
    {x: 0.6, y: 3.65, z: 0.75},//33
    {x: 0.4, y: 3.35, z: 1.05},//34
    {x: 0.6, y: 3.65, z: 1.05},//35

], [

    [12, 13, 14, 15],
    [0, 1, 13, 12, 8, 4],
    [3, 2, 14, 15, 11, 7],
    [1, 2, 14, 13],
    [0, 3, 7, 4],
    [4, 7, 11, 8],
    [17, 16, 18, 19],
    [8, 11, 17, 16],
    [8, 12, 18, 16],
    [15, 11, 17, 19],
    [15, 12, 18, 19],

    [20, 21, 23, 22],
    [24, 25, 27, 26],
    [28, 29, 31, 30],
    [32, 33, 35, 34]


], 'maxpoint')

const screen3 = new Object(position = {x: 0, y: 0, z: 0}, [
    {x: 11.2, y: 4.2, z: 6.2},
    {x: 11.2, y: 5.8, z: 6.2},
    {x: 11.2, y: 4.2, z: 8.8},
    {x: 11.2, y: 5.8, z: 8.8}
], [
    [0, 1, 3, 2]
], 'maxpoint')

/*
let moonv = []
let moone = []
const n = 30
const moonr = 300
for(let i = 0; i < n; i++){
    moonv.push({x: 0, y: moonr * Math.sin(Math.PI * 2 * i / n), z: moonr * Math.cos(Math.PI * 2 * i / n)})
}
for(let i = 0; i < n; i++){
    moone.push([i, (i + 1) % n])
}
const moon = new HollowObject(position = {x: 1000, y: 500, z: 100}, moonv, moone)*/



//var ae = new Audio('bassnbs.mp3')


const intwidth = 3
const gi1 = new Interaction(position = {x: gaem1.position.x - intwidth, z: gaem1.position.z}, intwidth, intwidth, 'packman')
const gi2 = new Interaction(position = {x: gaem2.position.x - intwidth, z: gaem2.position.z}, intwidth, intwidth, 'battleship')
const gi3 = new Interaction(position = {x: gaem3.position.x - intwidth, z: gaem3.position.z}, intwidth, intwidth, 'life')

let particles = []


function animate() {
    start = Date.now()
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(pr => {
        pr.update()
    })
    grid.points.forEach(p => {
        p.velocity.y = Math.sin((Date.now() / 1000) + (Math.abs(p.position.x) + Math.abs(p.position.z)) * Math.PI / 300) / 10
    })
    points.forEach(p => {
        p.update()
    })
    edges.forEach(e => {
        e.update()
    })
    faces.sort(compare)

    faces.forEach(f => {
        f.update()
    })
    spectator.update()
}
animate()



function createParticle() {
    let newParticle = new Particle(position = {alpha: Math.random() * 2 * Math.PI, y: 50, r: 35}, [
        {x: 1, y: 0, z: 0},
        {x: 0, y: 1, z: 0},
        {x: 0, y: 0, z: 1}
    ], [[0, 1, 2]], 'maxpoint', velocity = {alpha: (Math.random() - 0.5) * 0.01, y: -0.07, r: (Math.random() - 0.5) * 0}, angles = {alpha: 0, beta: 0}, angleVelocity = {alpha: 0.01, beta: 0.01})
    particles.push(newParticle)
    if(particles.length == 100){
        clearInterval(timerID)
    }
}

let timerID = setInterval(createParticle, 100)
/*
addEventListener('keydown', ({key}) => {
    switch (key){
        case 'w':
            spectator.velocity.x = 0.2
            break
        case 'a':
            spectator.velocity.z = -0.2
            break
        case 's':
            spectator.velocity.x = -0.2
            break
        case 'd':
            spectator.velocity.z = 0.2
            break
        case 'x':
            spectator.velocity.y = -0.2
            break
        case ' ':
            spectator.velocity.y = 0.2
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
        case 'e':
            if(spectator.position.x > gi1.position.x && spectator.position.x < gi1.position.x + gi1.height && spectator.position.z > gi1.position.z && spectator.position.z < gi1.position.z + gi1.width){
                gi1.action()
            }
            else if(spectator.position.x > gi2.position.x && spectator.position.x < gi2.position.x + gi2.height && spectator.position.z > gi2.position.z && spectator.position.z < gi2.position.z + gi2.width){
                gi2.action()
            }
            else if(spectator.position.x > gi3.position.x && spectator.position.x < gi3.position.x + gi3.height && spectator.position.z > gi3.position.z && spectator.position.z < gi3.position.z + gi3.width){
                gi3.action()
            }
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
*/

addEventListener('keydown', ({key}) => {
    switch (key){
        case 'w':
            spectator.velocity.x = 0.2
            break
        case 'a':
            spectator.velocity.z = -0.2
            break
        case 's':
            spectator.velocity.x = -0.2
            break
        case 'd':
            spectator.velocity.z = 0.2
            break
        case ' ':
            if(isOnFloor()){
                spectator.velocity.y = 0.3
            }
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
        case 'e':
            if(spectator.position.x > gi1.position.x && spectator.position.x < gi1.position.x + gi1.height && spectator.position.z > gi1.position.z && spectator.position.z < gi1.position.z + gi1.width){
                gi1.action()
            }
            else if(spectator.position.x > gi2.position.x && spectator.position.x < gi2.position.x + gi2.height && spectator.position.z > gi2.position.z && spectator.position.z < gi2.position.z + gi2.width){
                gi2.action()
            }
            else if(spectator.position.x > gi3.position.x && spectator.position.x < gi3.position.x + gi3.height && spectator.position.z > gi3.position.z && spectator.position.z < gi3.position.z + gi3.width){
                gi3.action()
            }
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
        case 'l': case 'j':
            spectator.angleVelocity.beta = 0
            break
        case 'i': case 'k':
            spectator.angleVelocity.alpha = 0
            break
    }
})

function isOnQuad(pointX, pointY, px1, py1, px2, py2, px3, py3, px4, py4){
    let ans = false

    let vx = pointX - px1
    let vy = pointY - py1
    let vx2 = px2 - px1
    let vy2 = py2 - py1
    let vx3 = px3 - px1
    let vy3 = py3 - py1
    let alpha1, beta1, alpha2, beta2


    alpha1 = (vx * vy3 - vx3 * vy) / (vx2 * vy3 - vx3 * vy2)
    beta1 = (vx2 * vy - vx * vy2) / (vx2 * vy3 - vx3 * vy2)

    vx = pointX - px2
    vy = pointY - py2
    vx2 *= -1
    vy2 *= -1
    vx3 = px3 - px2
    vy3 = py3 - py2


    alpha2 = (vx * vy3 - vx3 * vy) / (vx2 * vy3 - vx3 * vy2)
    beta2 = (vx2 * vy - vx * vy2) / (vx2 * vy3 - vx3 * vy2)
    
    ans = ans || (alpha1 > 0 && alpha1 < 1 && beta1 > 0 && beta1 < 1 && alpha2 > 0 && alpha2 < 1 && beta2 > 0 && beta2 < 1)

    vx = pointX - px4
    vy = pointY - py4
    vx2 = px2 - px4
    vy2 = py2 - py4
    vx3 = px3 - px4
    vy3 = py3 - py4

    alpha1 = (vx * vy3 - vx3 * vy) / (vx2 * vy3 - vx3 * vy2)
    beta1 = (vx2 * vy - vx * vy2) / (vx2 * vy3 - vx3 * vy2)


    vx = pointX - px3
    vy = pointY - py3
    vx2 = px2 - px3
    vy2 = py2 - py3
    vx3 = px4 - px3
    vy3 = py4 - py3

    alpha2 = (vx * vy3 - vx3 * vy) / (vx2 * vy3 - vx3 * vy2)
    beta2 = (vx2 * vy - vx * vy2) / (vx2 * vy3 - vx3 * vy2)

    ans = ans || (alpha1 > 0 && alpha1 < 1 && beta1 > 0 && beta1 < 1 && alpha2 > 0 && alpha2 < 1 && beta2 > 0 && beta2 < 1)

    return ans
}

addEventListener('click', mouse =>{
    if(isOnQuad(mouse.clientX, mouse.clientY, screen1.points[0].image.x, screen1.points[0].image.y, screen1.points[1].image.x, screen1.points[1].image.y, screen1.points[2].image.x, screen1.points[2].image.y, screen1.points[3].image.x, screen1.points[3].image.y)){
        gi1.action()
    }
    else if(isOnQuad(mouse.clientX, mouse.clientY, screen2.points[0].image.x, screen2.points[0].image.y, screen2.points[1].image.x, screen2.points[1].image.y, screen2.points[2].image.x, screen2.points[2].image.y, screen2.points[3].image.x, screen2.points[3].image.y)){
        gi2.action()
    }
    else if(isOnQuad(mouse.clientX, mouse.clientY, screen3.points[0].image.x, screen3.points[0].image.y, screen3.points[1].image.x, screen3.points[1].image.y, screen3.points[2].image.x, screen3.points[2].image.y, screen3.points[3].image.x, screen3.points[3].image.y)){
        gi3.action()
    }
})