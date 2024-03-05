const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
const norm = 100

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
            let np = new Point(pc.x + this.position.x, pc.y + this.position.y, pc.z + this.position.z)
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
            let np = new Point(pc.x + this.position.x, pc.y + this.position.y, pc.z + this.position.z)
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

        this.points[0].y = Math.sin(this.angles.alpha) + this.position.y
        this.points[0].x = Math.cos(this.angles.beta) * Math.cos(this.angles.alpha) + Math.cos(this.position.alpha) * this.position.r
        this.points[0].z = Math.sin(this.angles.beta) * Math.cos(this.angles.alpha) + Math.sin(this.position.alpha) * this.position.r

        this.points[1].y = -0.5 * Math.sin(this.angles.alpha) + this.position.y
        this.points[1].x = -0.5 * Math.cos(this.angles.beta) * Math.cos(this.angles.alpha) - 0.866 * Math.sin(this.angles.beta) + Math.cos(this.position.alpha) * this.position.r
        this.points[1].z = -0.5 * Math.sin(this.angles.beta) * Math.cos(this.angles.alpha) + 0.866 * Math.cos(this.angles.beta) + Math.sin(this.position.alpha) * this.position.r

        this.points[2].y = -0.5 * Math.sin(this.angles.alpha) + this.position.y
        this.points[2].x = -0.5 * Math.cos(this.angles.beta) * Math.cos(this.angles.alpha) + 0.866 * Math.sin(this.angles.beta) + Math.cos(this.position.alpha) * this.position.r
        this.points[2].z = -0.5 * Math.sin(this.angles.beta) * Math.cos(this.angles.alpha) - 0.866 * Math.cos(this.angles.beta) + Math.sin(this.position.alpha) * this.position.r

        if(this.position.y < -10){
            this.position.y = 60
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
                    this.baricenter.x += p.x
                    this.baricenter.y += p.y
                    this.baricenter.z += p.z
                })

                this.baricenter.x /= this.order
                this.baricenter.y /= this.order
                this.baricenter.z /= this.order
                this.distance = (this.baricenter.x - spectator.x)**2 + (this.baricenter.y - spectator.y)**2 + (this.baricenter.z - spectator.z)**2
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
        c.lineWidth = 2
        let i = firstvis
        while(i < this.order + firstvis){
            if(this.points[i % this.order].status == 'visible' && this.points[(i + 1) % this.order].status == 'visible'){
                c.lineTo(this.points[(i + 1) % this.order].image.x, this.points[(i + 1) % this.order].image.y)
            }
            if(this.points[i % this.order].status == 'visible' && this.points[(i + 1) % this.order].status == 'invisible'){
                let a = computeIntersection({x: this.points[i % this.order].x, y: this.points[i % this.order].y, z: this.points[i % this.order].z}, {x: this.points[(i + 1) % this.order].x - this.points[i % this.order].x, y: this.points[(i + 1) % this.order].y - this.points[i % this.order].y, z: this.points[(i + 1) % this.order].z - this.points[i % this.order].z},
                spectator.corvp, spectator.vecup, spectator.vecri)
                c.lineTo(this.points[i % this.order].image.x, this.points[i % this.order].image.y)
                c.lineTo(norm * a[2] + canvas.width / 2, -norm * a[1] + canvas.height / 2)
            }
            if(this.points[i % this.order].status == 'invisible' && this.points[(i + 1) % this.order].status == 'visible'){
                let a = computeIntersection({x: this.points[i % this.order].x, y: this.points[i % this.order].y, z: this.points[i % this.order].z}, {x: this.points[(i + 1) % this.order].x - this.points[i % this.order].x, y: this.points[(i + 1) % this.order].y - this.points[i % this.order].y, z: this.points[(i + 1) % this.order].z - this.points[i % this.order].z},
                spectator.corvp, spectator.vecup, spectator.vecri)
                c.lineTo(norm * a[2] + canvas.width / 2, -norm * a[1] + canvas.height / 2)
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
            let a = computeIntersection({x: this.p1.x, y: this.p1.y, z: this.p1.z}, {x: this.p2.x - this.p1.x, y: this.p2.y - this.p1.y, z: this.p2.z - this.p1.z}, spectator.corvp, spectator.vecup, spectator.vecri)
            c.lineTo(norm * a[2] + canvas.width / 2, -norm * a[1] + canvas.height / 2)
        }
        if(this.p1.status == 'invisible' && this.p2.status == 'visible'){
            let a = computeIntersection({x: this.p1.x, y: this.p1.y, z: this.p1.z}, {x: this.p2.x - this.p1.x, y: this.p2.y - this.p1.y, z: this.p2.z - this.p1.z}, spectator.corvp, spectator.vecup, spectator.vecri)
            c.moveTo(norm * a[2] + canvas.width / 2, -norm * a[1] + canvas.height / 2)
            c.lineTo(this.p2.image.x, this.p2.image.y)
        }
        c.strokeStyle = '#00ff00'
        c.lineWidth = 1.5
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
        this.velocity = {x: 0, y: 0, z: 0}
        this.radius = 2
        this.status = 'visible'
        this.distance = 0
    }


    display() {
        let det = determinant(spectator.x - this.x, -spectator.vecup.x, -spectator.vecri.x, spectator.y - this.y, -spectator.vecup.y, -spectator.vecri.y, spectator.z - this.z, -spectator.vecup.z, -spectator.vecri.z)
        let det1 = determinant(spectator.corvp.x - this.x, -spectator.vecup.x, -spectator.vecri.x, spectator.corvp.y - this.y, -spectator.vecup.y, -spectator.vecri.y, spectator.corvp.z - this.z, -spectator.vecup.z, -spectator.vecri.z)
        if(det1 / det >= 1 || det1 / det <= 0){return true}
        let det2 = determinant(spectator.x - this.x, spectator.corvp.x - this.x, -spectator.vecri.x, spectator.y - this.y, spectator.corvp.y - this.y, -spectator.vecri.y, spectator.z - this.z, spectator.corvp.z - this.z, -spectator.vecri.z)
        let det3 = determinant(spectator.x - this.x, -spectator.vecup.x, spectator.corvp.x - this.x, spectator.y - this.y, -spectator.vecup.y, spectator.corvp.y - this.y, spectator.z - this.z, -spectator.vecup.z, spectator.corvp.z - this.z)
        this.sx = det3 / det
        this.sy = det2 / det
        return false
    }


    update() {
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.z += this.velocity.z

        this.distance = (spectator.x - this.x) ** 2 + (spectator.y - this.y) ** 2 + (spectator.z - this.z) ** 2
        let a = computeIntersection({x: this.x, y: this.y, z: this.z}, {x: spectator.x - this.x, y: spectator.y - this.y, z: spectator.z - this.z},
            spectator.corvp, spectator.vecup, spectator.vecri)
        if(a[0] < 0 || a[0] > 1){this.status = 'invisible'}
        else{this.status = 'visible'}
        this.sy = a[1]
        this.sx = a[2]

        //this.display()
        //if(this.display()){this.status = 'invisible'}
        //else{this.status = 'visible'}
        //const norm = 100
        this.image.x = norm * this.sx + canvas.width / 2
        this.image.y = -norm * this.sy + canvas.height / 2
        /*c.beginPath()
        c.arc(this.image.x, this.image.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()*/
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
        this.x += (this.velocity.x * Math.cos(this.beta) - this.velocity.z * Math.sin(this.beta))
        this.z += (this.velocity.x * Math.sin(this.beta) + this.velocity.z * Math.cos(this.beta))
        this.y += this.velocity.y
        if(this.alpha <= Math.PI / 2 && this.alpha >= - Math.PI / 2){
            this.alpha += this.angleVelocity.alpha * 2
        }
        else{
            if(this.alpha > 0){this.alpha = Math.PI / 2}
            else{this.alpha = -Math.PI / 2}
        }
        this.beta += this.angleVelocity.beta * 2
        this.calculatevp()
    }
}



let points = []
let edges = []
let faces = []
const spectator = new Spectator(-3, 0, 0)

/*
const platformWidth = 20
const object = new Object(position = {x: 0, y: 0, z: 0}, angles = {alpha: 0, beta: 0}, [
    {x: -platformWidth, y: 0, z: -platformWidth},
    {x: -platformWidth, y: -1, z: -platformWidth},
    {x: platformWidth, y: 0, z: -platformWidth},
    {x: platformWidth, y: -1, z: -platformWidth},
    {x: -platformWidth, y: 0, z: platformWidth},
    {x: -platformWidth, y: -1, z: platformWidth},
    {x: platformWidth, y: 0, z: platformWidth},
    {x: platformWidth, y: -1, z: platformWidth}
], [
    [0, 1, 3, 2],
    [0, 1, 5, 4],
    [2, 3, 7, 6],
    [4, 5, 7, 6],
    [0, 2, 6, 4]
], 'maxpoint')
*/

const platformwidth = 10
const platformheight = 12
const brickwidth = 6
const brickheight = 4

let platp = []
for(let i = 0; i < platformheight; i++){
    for(let j = 0; j < platformwidth; j++){
        platp.push({x: i * brickheight, y: 0, z: j * brickwidth})
    }
}
let platf = []
for(let i = 0; i < platformheight - 1; i+=2){
    for(let j = 0; j < platformwidth - 2; j+=2){
        platf.push([i * platformwidth + j, (i + 1) * platformwidth + j, (i + 1) * platformwidth + j + 2, i * platformwidth + j + 2])
    }
}
for(let i = 1; i < platformheight - 1; i+=2){
    for(let j = 0; j < platformwidth - 2; j++){
        platf.push([i * platformwidth, (i + 1) * platformwidth, (i + 1) * platformwidth + 1, i * platformwidth + 1])
        platf.push([i * platformwidth + platformwidth - 3, (i + 1) * platformwidth + platformwidth - 3, (i + 1) * platformwidth + platformwidth - 2, i * platformwidth + platformwidth - 2])

    }
}
for(let i = 1; i < platformheight - 1; i+=2){
    for(let j = 1; j < platformwidth - 3; j+=2){
        platf.push([i * platformwidth + j, (i + 1) * platformwidth + j, (i + 1) * platformwidth + j + 2, i * platformwidth + j + 2])
    }
}
const platform = new Object(position = {x: -platformheight * brickheight / 2, y: 0, z: -platformwidth * brickwidth / 2}, platp, platf, 'maxpoint')




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

const gaem = new Object(position = {x: 10, y: 0, z: 3}, [
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

    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0}

], [

    [12, 13, 14, 15],
    [0, 1, 13, 12, 8, 4],
    [3, 2, 14, 15, 11, 7],
    [1, 2, 14, 13],
    [0, 3, 7, 4],
    [4, 7, 11, 8],
    [8, 11, 15, 12]
], 'baricentric')




let start = Date.now()
let end
let particles = []


function animate() {
    start = Date.now()
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(pr => {
        pr.update()
    })
    grid.points.forEach(p => {
        p.velocity.y = Math.sin((Date.now() / 1000) + (Math.abs(p.x) + Math.abs(p.z)) * Math.PI / 300) / 10
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
    end = Date.now() - start
    //console.log(Date.now() - start)
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
