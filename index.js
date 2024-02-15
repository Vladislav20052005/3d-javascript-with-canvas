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
    //if(det1 / det >= 1 || det1 / det <= 0){return true}
    let det2 = determinant(straight_basis.x, surface_shift.x - straight_shift.x, -surface_basis2.x, straight_basis.y, surface_shift.y - straight_shift.y, -surface_basis2.y, straight_basis.z, surface_shift.z - straight_shift.z, -surface_basis2.z)
    let det3 = determinant(straight_basis.x, -surface_basis1.x, surface_shift.x - straight_shift.x, straight_basis.y, -surface_basis1.y, surface_shift.y - straight_shift.y, straight_basis.z, -surface_basis1.z, surface_shift.z - straight_shift.z)
    return [det1 / det, det2 / det, det3 / det]
}

class Object {
    constructor(position, pointcords, facebends){
        this.position = position
        this.type = 'static'
        this.points = []
        this.faces = []
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
            let nf = new Face(nm)
            this.faces.push(nf)
            faces.push(nf)
        })
    }
}

class Face {
    constructor(points){
        this.points = points
        this.baricenter = {x: 0, y: 0, z: 0}
        this.order = this.points.length
        this.distance = 0
    }
    update(){
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
        /*this.points.forEach(element => {
            if(element.status == 'visible'){
            c.lineTo(element.image.x, element.image.y)
            c.strokeStyle = 'green'
            c.lineWidth = 2}
        });*/
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
    draw(){
        c.beginPath()
        c.moveTo(this.p1.image.x, this.p1.image.y)
        c.lineTo(this.p2.image.x, this.p2.image.y)
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
        this.velocity = 0
        this.radius = 2
        this.status = 'visible'
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
        this.rfov = 1
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

let points = []
let faces = []
const spectator = new Spectator(-3, 0, 0)



const object = new Object(position = {x: 0, y: 0, z: 0}, [
    {x: -10, y: 0, z: -10},
    {x: -10, y: -1, z: -10},
    {x: 10, y: 0, z: -10},
    {x: 10, y: -1, z: -10},
    {x: -10, y: 0, z: 10},
    {x: -10, y: -1, z: 10},
    {x: 10, y: 0, z: 10},
    {x: 10, y: -1, z: 10}
],
[
    [0, 1, 3, 2],
    [0, 1, 5, 4],
    [2, 3, 7, 6],
    [4, 5, 7, 6],
    [0, 2, 6, 4]
])

/*const object1 = new Object(position = {x: 0, y: 0, z: 20}, [
    {x: -1, y: 0, z: -1},
    {x: -1, y: -1, z: -1},
    {x: 1, y: 0, z: -1},

],
[
    [0, 1, 2]
])*/




function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    spectator.update()
    points.forEach(p => {
        p.update()
    })
    faces.sort(compare)
    faces.forEach(f => {
        f.update()
    })

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
