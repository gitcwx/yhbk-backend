(function () {
    const canvas = document.getElementById('starCanvas')
    const ctx = canvas.getContext('2d')
    let centerX
    let centerY
    let stars = []
    let moons = []
    const starCount = 1500
    const moonCount = 1
    let stop = false

    function initializePos() {
        centerX = canvas.width / 2
        centerY = canvas.height / 2
        stars = []; moons = []
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * canvas.width,
                o: '0.' + Math.floor(Math.random() * 9) + 1
            })
        }
        for (let i = 0; i < moonCount; i++) {
            moons.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * canvas.width,
                o: '0.' + Math.floor(Math.random() * 9) + 1
            })
        }
    }

    function drawMoon(ctx, moon) {
        ctx.save()
        ctx.translate(moon.offsetX, moon.offsetY)
        ctx.rotate(moon.angle * Math.PI / 180)
        ctx.scale(moon.radius, moon.radius)
        pathMoon(ctx, 2)
        ctx.fillStyle = 'rgba(255, 187, 85)'
        ctx.fill()
        ctx.restore()
    }
    function pathMoon(ctx, d) {
        // d 月亮饱满度
        ctx.beginPath()
        ctx.arc(0, 0, 1, 0.5 * Math.PI, 1.5 * Math.PI, true)
        ctx.moveTo(0, -1)
        ctx.arcTo(d, 0, 0, 1, dis(0, -1, d, 0) / d)
        ctx.closePath()
    }
    function dis(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
    }

    function drawStar(ctx, star) {
        ctx.save()
        ctx.translate(star.offsetX, star.offsetY)
        if (!stop) {
            ctx.rotate(star.angle / 180 * Math.PI)
        }
        ctx.scale(star.radius, star.radius)
        pathStar(ctx)
        ctx.fillStyle = 'rgb(255, 255, 0)'
        ctx.fill()
        ctx.restore()
    }
    function pathStar(ctx) {
        ctx.beginPath()
        let x = 0; let y = 0
        for (let i = 0; i < 5; i++) {
            x = Math.cos((18 + 72 * i) / 180 * Math.PI)
            y = Math.sin((18 + 72 * i) / 180 * Math.PI)
            ctx.lineTo(x, 0 - y)
            x = Math.cos((54 + 72 * i) / 180 * Math.PI) / 2
            y = Math.sin((54 + 72 * i) / 180 * Math.PI) / 2
            ctx.lineTo(x, 0 - y)
        }
        ctx.closePath()
    }

    // z轴运动
    function move() {
        for (let i = 0; i < starCount; i++) {
            stars[i].z--
            if (stars[i].z <= 0) {
                stars[i].z = canvas.width
            }
        }
        for (let i = 0; i < moonCount; i++) {
            moons[i].z--
            if (moons[i].z <= 0) {
                moons[i].z = canvas.width
            }
        }
    }

    function draw() {
        // 绘制画布背景
        if (canvas.width !== window.innerWidth) {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initializePos()
        }
        ctx.fillStyle = 'rgba(0,10,20,1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // 绘制星星
        for (let i = 0; i < starCount; i++) {
            drawStar(ctx, {
                offsetX: centerX + (stars[i].x - centerX) * (canvas.width / 2 / stars[i].z),
                offsetY: centerY + (stars[i].y - centerY) * (canvas.width / 2 / stars[i].z),
                radius: canvas.width / 2 / stars[i].z,
                angle: Math.random() * 90
            })
        }
        // 绘制月亮
        for (let i = 0; i < moonCount; i++) {
            drawMoon(ctx, {
                offsetX: centerX + (moons[i].x - centerX) * (canvas.width / 2 / moons[i].z),
                offsetY: centerY + (moons[i].y - centerY) * (canvas.width / 2 / moons[i].z),
                radius: canvas.width * 4 / moons[i].z,
                angle: 135
            })
        }
    }

    // 最后一个月亮点击事件
    canvas.addEventListener('click', e => {
        const isMoon = ctx.isPointInPath(e.clientX, e.clientY)
        if (isMoon) {
            stop = !stop
        }
    })

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame
    })()

    function executeFrame() {
        window.requestAnimFrame(executeFrame)
        if (!stop) {
            move()
        }
        draw()
    }

    initializePos()
    executeFrame()
})()