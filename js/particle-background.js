document.addEventListener('DOMContentLoaded', function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'particle-network';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  var context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  var points = [];
  var fireballs = [];
  var explosions = [];
  var frameId = 0;
  var isHidden = false;
  var width = 0;
  var height = 0;
  var dpr = 1;
  var lastFrameTime = 0;
  var nextFireballTime = 0;
  var nextFireballId = 1;
  var nextExplosionId = 1;
  var activeDrag = null;

  var mouse = {
    x: -1000,
    y: -1000,
    active: false
  };

  function pointCount() {
    if (window.innerWidth < 760) return 64;
    if (window.innerWidth < 1100) return 108;
    return 150;
  }

  function createPoints() {
    points = [];
    var count = pointCount();

    for (var i = 0; i < count; i++) {
      var strong = i % 5 === 0;
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (strong ? 0.12 : 0.08),
        vy: (Math.random() - 0.5) * (strong ? 0.12 : 0.08),
        driftAngle: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        radius: strong ? 2.8 : 1.25 + Math.random() * 0.8,
        strong: strong
      });
    }
  }

  function createFireball() {
    if (fireballs.length >= 2 || width < 1 || height < 1) return;

    var side = Math.floor(Math.random() * 4);
    var angle;
    var x;
    var y;

    if (side === 0 || side === 1) {
      x = side === 0 ? -30 : width + 30;
      y = Math.random() * height;
      angle = side === 0
        ? (Math.random() - 0.5) * 0.8
        : Math.PI + (Math.random() - 0.5) * 0.8;
    } else {
      x = Math.random() * width;
      y = side === 2 ? -30 : height + 30;
      angle = side === 2
        ? Math.PI / 2 + (Math.random() - 0.5) * 0.8
        : -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    }

    var speed = 1.9 + Math.random() * 0.9;
    fireballs.push({
      id: nextFireballId++,
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 8 + Math.random() * 2,
      age: 0,
      holdElapsed: 0,
      grabbed: false,
      pointerId: null,
      lastPointerX: x,
      lastPointerY: y,
      lastPointerTime: 0,
      trail: []
    });
  }

  function detonateFireball(fireball) {
    explosions.push({
      id: nextExplosionId++,
      x: fireball.x,
      y: fireball.y,
      radius: 0,
      previousRadius: 0,
      maxRadius: Math.max(300, Math.min(460, Math.max(width, height) * 0.42)),
      age: 0,
      duration: 900,
      hitPoints: Object.create(null)
    });
  }

  function findFireballAt(x, y) {
    for (var i = fireballs.length - 1; i >= 0; i--) {
      var fireball = fireballs[i];
      var dx = x - fireball.x;
      var dy = y - fireball.y;
      var hitRadius = fireball.radius + 12;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) return fireball;
    }
    return null;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    createPoints();
  }

  function darkModeActive() {
    return document.documentElement.classList.contains('dark-mode');
  }

  function draw(timestamp) {
    if (isHidden) return;

    var delta = lastFrameTime ? Math.min(timestamp - lastFrameTime, 32) : 16;
    lastFrameTime = timestamp;
    context.clearRect(0, 0, width, height);
    var dark = darkModeActive();
    var dotColor = dark ? 'rgba(127, 204, 208, 0.72)' : 'rgba(69, 122, 126, 0.52)';
    var strongDotColor = dark ? 'rgba(127, 204, 208, 1)' : 'rgba(69, 122, 126, 0.92)';
    var mouseLineColor = dark ? 'rgba(127, 204, 208, 0.62)' : 'rgba(69, 122, 126, 0.52)';
    var themeColor = dark ? '#7fccd0' : '#457a7e';
    var themeGlow = dark ? 'rgba(127, 204, 208, 0.38)' : 'rgba(69, 122, 126, 0.3)';

    for (var i = 0; i < points.length; i++) {
      var point = points[i];

      if (mouse.active) {
        var dx = mouse.x - point.x;
        var dy = mouse.y - point.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 210 && distance > 1) {
          var force = (210 - distance) / 210;
          point.vx += (dx / distance) * force * 0.022;
          point.vy += (dy / distance) * force * 0.022;
        }
      }

      point.driftPhase += 0.0035;
      point.driftAngle += Math.sin(point.driftPhase) * 0.0008;
      var driftSpeed = point.strong ? 0.018 : 0.012;
      point.vx += Math.cos(point.driftAngle) * driftSpeed * 0.018;
      point.vy += Math.sin(point.driftAngle) * driftSpeed * 0.018;

      point.vx *= 0.996;
      point.vy *= 0.996;
      point.vx = Math.max(-0.9, Math.min(0.9, point.vx));
      point.vy = Math.max(-0.9, Math.min(0.9, point.vy));
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -12) point.x = width + 12;
      if (point.x > width + 12) point.x = -12;
      if (point.y < -12) point.y = height + 12;
      if (point.y > height + 12) point.y = -12;

      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = point.strong ? strongDotColor : dotColor;
      context.fill();

      if (mouse.active) {
        var mouseDx = mouse.x - point.x;
        var mouseDy = mouse.y - point.y;
        var mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        if (mouseDistance < 190) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(mouse.x, mouse.y);
          context.strokeStyle = mouseLineColor;
          context.globalAlpha = 1 - mouseDistance / 190;
          context.lineWidth = point.strong ? 1.55 : 1;
          context.stroke();
          context.globalAlpha = 1;
        }
      }

    }

    if (timestamp >= nextFireballTime) {
      createFireball();
      nextFireballTime = timestamp + 3500 + Math.random() * 2500;
    }

    for (var fireballIndex = fireballs.length - 1; fireballIndex >= 0; fireballIndex--) {
      var movingFireball = fireballs[fireballIndex];
      movingFireball.age += delta;

      if (movingFireball.grabbed) {
        movingFireball.holdElapsed += delta;
        if (movingFireball.holdElapsed >= 3000) {
          detonateFireball(movingFireball);
          fireballs.splice(fireballIndex, 1);
          activeDrag = null;
          document.body.classList.remove('grabbing-fireball');
          continue;
        }
      } else {
        movingFireball.x += movingFireball.vx * delta / 16;
        movingFireball.y += movingFireball.vy * delta / 16;
      }

      var previousTrailPoint = movingFireball.trail[0];
      var trailDx = previousTrailPoint ? movingFireball.x - previousTrailPoint.x : 0;
      var trailDy = previousTrailPoint ? movingFireball.y - previousTrailPoint.y : 0;
      if (!previousTrailPoint || trailDx * trailDx + trailDy * trailDy > 1.5) {
        movingFireball.trail.unshift({
          x: movingFireball.x,
          y: movingFireball.y,
          opacity: 1
        });
      }

      movingFireball.trail.forEach(function (trailPoint) {
        trailPoint.opacity -= delta / 520;
      });
      while (movingFireball.trail.length && movingFireball.trail[movingFireball.trail.length - 1].opacity <= 0) {
        movingFireball.trail.pop();
      }
      if (movingFireball.trail.length > 30) movingFireball.trail.pop();

      if (movingFireball.trail.length > 1) {
        var trailHead = movingFireball.trail[0];
        var trailEndPoint = movingFireball.trail[movingFireball.trail.length - 1];
        var streak = context.createLinearGradient(
          trailEndPoint.x, trailEndPoint.y, trailHead.x, trailHead.y
        );
        streak.addColorStop(0, 'rgba(255, 156, 83, 0)');
        streak.addColorStop(0.58, 'rgba(255, 174, 108, 0.48)');
        streak.addColorStop(1, 'rgba(255, 247, 224, 0.88)');

        context.lineCap = 'round';
        for (var trailIndex = 0; trailIndex < movingFireball.trail.length - 1; trailIndex++) {
          var trailStart = movingFireball.trail[trailIndex];
          var trailEnd = movingFireball.trail[trailIndex + 1];
          var trailFade = Math.pow(1 - trailIndex / movingFireball.trail.length, 1.7) *
            trailStart.opacity;

          context.beginPath();
          context.moveTo(trailStart.x, trailStart.y);
          context.lineTo(trailEnd.x, trailEnd.y);
          context.strokeStyle = themeColor;
          context.globalAlpha = trailFade * 0.2;
          context.lineWidth = movingFireball.radius * trailFade * 2.2;
          context.stroke();

          context.beginPath();
          context.moveTo(trailStart.x, trailStart.y);
          context.lineTo(trailEnd.x, trailEnd.y);
          context.strokeStyle = streak;
          context.globalAlpha = trailFade * 0.72;
          context.lineWidth = movingFireball.radius * trailFade * 0.8;
          context.stroke();

          context.beginPath();
          context.moveTo(trailStart.x, trailStart.y);
          context.lineTo(trailEnd.x, trailEnd.y);
          context.strokeStyle = '#fff9e9';
          context.globalAlpha = trailFade * 0.24;
          context.lineWidth = movingFireball.radius * trailFade * 0.24;
          context.stroke();
        }
      }
      context.globalAlpha = 1;

      var fireAngle = Math.atan2(movingFireball.vy, movingFireball.vx);
      var flicker = 0.97 + Math.sin(movingFireball.age * 0.018) * 0.03;
      context.save();
      context.translate(movingFireball.x, movingFireball.y);
      context.rotate(fireAngle);
      context.beginPath();
      context.moveTo(-movingFireball.radius * 1.45, 0);
      context.quadraticCurveTo(-movingFireball.radius * 0.5, -movingFireball.radius * 0.82,
        movingFireball.radius * 0.78 * flicker, -movingFireball.radius * 0.3);
      context.quadraticCurveTo(movingFireball.radius * 1.18 * flicker, 0,
        movingFireball.radius * 0.78 * flicker, movingFireball.radius * 0.3);
      context.quadraticCurveTo(-movingFireball.radius * 0.5, movingFireball.radius * 0.82,
        -movingFireball.radius * 1.45, 0);
      context.closePath();

      var fireShell = context.createLinearGradient(
        -movingFireball.radius * 1.45, 0, movingFireball.radius, 0
      );
      fireShell.addColorStop(0, '#ff9d59');
      fireShell.addColorStop(0.56, themeColor);
      fireShell.addColorStop(0.84, '#ffe6bd');
      fireShell.addColorStop(1, '#fffdf5');
      context.shadowColor = themeGlow;
      context.shadowBlur = 5;
      context.fillStyle = fireShell;
      context.fill();
      context.shadowBlur = 0;

      context.beginPath();
      context.ellipse(movingFireball.radius * 0.34, 0,
        movingFireball.radius * 0.42 * flicker, movingFireball.radius * 0.27 * flicker,
        0, 0, Math.PI * 2);
      context.fillStyle = '#fffdf5';
      context.fill();
      context.restore();

      if (!movingFireball.grabbed &&
          (movingFireball.x < -80 || movingFireball.x > width + 80 ||
            movingFireball.y < -80 || movingFireball.y > height + 80 ||
            movingFireball.age > 26000)) {
        fireballs.splice(fireballIndex, 1);
      }
    }

    for (var explosionIndex = explosions.length - 1; explosionIndex >= 0; explosionIndex--) {
      var explosion = explosions[explosionIndex];
      explosion.age += delta;
      explosion.previousRadius = explosion.radius;
      explosion.radius = explosion.maxRadius * Math.min(explosion.age / explosion.duration, 1);

      for (var pointIndex = 0; pointIndex < points.length; pointIndex++) {
        if (explosion.hitPoints[pointIndex]) continue;
        var affectedPoint = points[pointIndex];
        var explosionDx = affectedPoint.x - explosion.x;
        var explosionDy = affectedPoint.y - explosion.y;
        var distanceFromExplosion = Math.sqrt(explosionDx * explosionDx + explosionDy * explosionDy);

        if (distanceFromExplosion <= explosion.radius && distanceFromExplosion > 0) {
          var impactStrength = 2.8 * (1 - distanceFromExplosion / explosion.maxRadius);
          affectedPoint.vx += (explosionDx / distanceFromExplosion) * impactStrength;
          affectedPoint.vy += (explosionDy / distanceFromExplosion) * impactStrength;
          explosion.hitPoints[pointIndex] = true;
        }
      }

      if (explosion.age < explosion.duration) {
        var ringOpacity = 1 - explosion.age / explosion.duration;
        context.beginPath();
        context.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        context.strokeStyle = themeColor;
        context.globalAlpha = ringOpacity * 0.75;
        context.lineWidth = 3 + ringOpacity * 3;
        context.stroke();
        context.globalAlpha = 1;
      } else {
        explosions.splice(explosionIndex, 1);
      }
    }

    frameId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (!isHidden && !frameId) {
      lastFrameTime = 0;
      draw(performance.now());
    }
  }

  function stop() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('pointermove', function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;

    if (activeDrag && activeDrag.pointerId === event.pointerId) {
      var draggedFireball = activeDrag.fireball;
      var now = performance.now();
      var elapsed = Math.max(now - draggedFireball.lastPointerTime, 1);
      draggedFireball.vx = Math.max(-3, Math.min(3, (event.clientX - draggedFireball.lastPointerX) / elapsed * 16));
      draggedFireball.vy = Math.max(-3, Math.min(3, (event.clientY - draggedFireball.lastPointerY) / elapsed * 16));
      draggedFireball.x = event.clientX;
      draggedFireball.y = event.clientY;
      draggedFireball.lastPointerX = event.clientX;
      draggedFireball.lastPointerY = event.clientY;
      draggedFireball.lastPointerTime = now;
      event.preventDefault();
    } else if (event.target instanceof Element) {
      var interactiveTarget = event.target.closest('a, button, input, select, textarea, [role="button"]');
      document.body.classList.toggle(
        'can-grab-fireball',
        !interactiveTarget && Boolean(findFireballAt(event.clientX, event.clientY))
      );
    }
  }, { passive: false });

  document.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || activeDrag || !(event.target instanceof Element)) return;
    var interactiveTarget = event.target.closest('a, button, input, select, textarea, [role="button"]');
    if (interactiveTarget) return;

    var fireball = findFireballAt(event.clientX, event.clientY);
    if (!fireball) return;

    fireball.grabbed = true;
    fireball.holdElapsed = 0;
    fireball.pointerId = event.pointerId;
    fireball.lastPointerX = event.clientX;
    fireball.lastPointerY = event.clientY;
    fireball.lastPointerTime = performance.now();
    activeDrag = { fireball: fireball, pointerId: event.pointerId };
    document.body.classList.remove('can-grab-fireball');
    document.body.classList.add('grabbing-fireball');
    event.preventDefault();
  });

  function releaseFireball(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    activeDrag.fireball.grabbed = false;
    activeDrag.fireball.pointerId = null;
    activeDrag = null;
    document.body.classList.remove('grabbing-fireball');
  }

  document.addEventListener('pointerup', releaseFireball);
  document.addEventListener('pointercancel', releaseFireball);

  document.documentElement.addEventListener('pointerleave', function () {
    mouse.active = false;
  });

  document.addEventListener('visibilitychange', function () {
    isHidden = document.hidden;
    if (isHidden) stop();
    else start();
  });

  resize();
  start();
});
