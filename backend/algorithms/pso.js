const fs = require('fs');
const path = require('path');

function haversineDistance(a, b) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(aVal));
}

function totalDistance(route) {
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    dist += haversineDistance(route[i], route[i + 1]);
  }
  return dist;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function swap(route, i, j) {
  const newRoute = [...route];
  [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
  return newRoute;
}

function applyVelocity(route, velocity) {
  let newRoute = [...route];
  for (const [i, j] of velocity) {
    newRoute = swap(newRoute, i, j);
  }
  return newRoute;
}

function getSwapSequence(routeA, routeB) {
  const swaps = [];
  const arr = [...routeA];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id !== routeB[i].id) {
      const j = arr.findIndex((el, idx) => idx > i && el.id === routeB[i].id);
      swaps.push([i, j]);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return swaps;
}

function combineVelocity(v1, v2, w) {
  const newVel = [];
  for (const swap of v1) {
    if (Math.random() < w) newVel.push(swap);
  }
  for (const swap of v2) {
    if (Math.random() < (1 - w)) newVel.push(swap);
  }
  return newVel;
}

function runPSO(orders, depot) {
  if (orders.length <= 1) return [depot, ...orders, depot];

  const numParticles = 30;
  const maxIter = 100;
  const w = 0.8;

  let particles = [];
  let velocities = [];
  let pBest = [];
  let pBestFitness = [];
  let gBest = null;
  let gBestFitness = Infinity;
  let convergence = [];
  let particlePositionsOverTime = [];


  for (let i = 0; i < numParticles; i++) {
    const shuffledOrders = shuffle(orders);
    particles.push(shuffledOrders);
    velocities.push([]);
    const fitness = totalDistance([depot, ...shuffledOrders, depot]);
    pBest.push([...shuffledOrders]);
    pBestFitness.push(fitness);
    if (fitness < gBestFitness) {
      gBest = [...shuffledOrders];
      gBestFitness = fitness;
    }
  }


  for (let iter = 0; iter < maxIter; iter++) {

    const iterPositions = particles.map(route =>
      route.map(order => ({ id: order.id, lat: order.lat, lng: order.lng }))
    );
    particlePositionsOverTime.push(iterPositions);

    for (let i = 0; i < numParticles; i++) {
      const current = particles[i];

      const cognitive = getSwapSequence(current, pBest[i]).slice(0, Math.floor(Math.random() * pBest[i].length));
      const social = getSwapSequence(current, gBest).slice(0, Math.floor(Math.random() * gBest.length));

      let newVelocity = combineVelocity(velocities[i], cognitive, w);
      newVelocity = combineVelocity(newVelocity, social, w);

      velocities[i] = newVelocity;

      const newParticle = applyVelocity(current, newVelocity);
      const newFitness = totalDistance([depot, ...newParticle, depot]);

      if (newFitness < pBestFitness[i]) {
        pBest[i] = [...newParticle];
        pBestFitness[i] = newFitness;
      }
      if (newFitness < gBestFitness) {
        gBest = [...newParticle];
        gBestFitness = newFitness;
      }

      particles[i] = newParticle;
    }

    convergence.push(gBestFitness);
    console.log(`🌀 Iteration ${iter + 1} - En iyi mesafe: ${gBestFitness.toFixed(2)} km`);
  }


  try {
    const convergencePath = path.join(__dirname, 'convergence.csv');
    fs.writeFileSync(convergencePath, convergence.join('\n'));
    console.log(`📈 Yakınsama verileri "${convergencePath}" olarak kaydedildi.`);
  } catch (err) {
    console.error('❌ convergence.csv yazılamadı:', err);
  }


  try {
    const particlePath = path.join(__dirname, 'particles.json');
    fs.writeFileSync(particlePath, JSON.stringify(particlePositionsOverTime, null, 2));
    console.log(`📊 Parçacık konumları "${particlePath}" dosyasına kaydedildi.`);
  } catch (err) {
    console.error('❌ particles.json yazılamadı:', err);
  }

  return [depot, ...gBest, depot];
}

module.exports = { runPSO };
