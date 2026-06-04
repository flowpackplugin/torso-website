/* TORSO for MEN — hero GLTF viewer (loads assets/models/torso.glb) */
(function () {
  var mount = document.getElementById('torso3d');
  if (!mount) return;
  var MODEL = 'assets/models/torso.glb';

  var THREE_CDNS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://unpkg.com/three@0.128.0/build/three.min.js'
  ];
  var GLTF_CDNS = [
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
    'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js'
  ];

  function loadSeq(list, done) {
    (function next(i) {
      if (i >= list.length) { done(false); return; }
      var s = document.createElement('script');
      s.src = list[i];
      s.onload = function () { done(true); };
      s.onerror = function () { next(i + 1); };
      document.head.appendChild(s);
    })(0);
  }
  function ensureThree(cb) {
    if (window.THREE) return cb();
    loadSeq(THREE_CDNS, function (ok) { ok && window.THREE ? cb() : null; });
  }
  function ensureGLTF(cb) {
    if (window.THREE && THREE.GLTFLoader) return cb();
    loadSeq(GLTF_CDNS, function (ok) { ok && THREE.GLTFLoader ? cb() : null; });
  }
  function waitForSize(cb) {
    var t = 0;
    (function check() {
      if (mount.clientWidth > 4 && mount.clientHeight > 4) return cb();
      if (t++ > 60) return cb();
      requestAnimationFrame(check);
    })();
  }

  ensureThree(function () { ensureGLTF(function () { waitForSize(start); }); });

  function start() {
    if (!window.THREE || !THREE.GLTFLoader) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = mount.clientWidth || 1, H = mount.clientHeight || 1;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(33, W / H, 0.01, 100);
    camera.position.set(0, 1.4, 6);

    // studio environment for marble reflections
    function envTex() {
      var c = document.createElement('canvas'); c.width = 512; c.height = 256;
      var x = c.getContext('2d');
      var g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#fdfcf9'); g.addColorStop(0.45, '#e7e3da');
      g.addColorStop(0.7, '#b9b4a9'); g.addColorStop(1, '#5c594f');
      x.fillStyle = g; x.fillRect(0, 0, 512, 256);
      var rg = x.createRadialGradient(150, 70, 10, 150, 70, 180);
      rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = rg; x.fillRect(0, 0, 512, 256);
      var t = new THREE.CanvasTexture(c);
      t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding; return t;
    }
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(envTex()).texture;

    scene.add(new THREE.AmbientLight(0xf2efe9, 0.5));
    var key = new THREE.DirectionalLight(0xfff7ea, 2.0);
    key.position.set(-4, 7, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.radius = 6;
    scene.add(key);
    var sage = new THREE.DirectionalLight(0x8c9c83, 1.0); sage.position.set(6, 2, -4); scene.add(sage);
    var fill = new THREE.DirectionalLight(0xe6ece2, 0.4); fill.position.set(3, 1, 7); scene.add(fill);

    var root = new THREE.Group(); scene.add(root);

    function frame() {
      var box = new THREE.Box3().setFromObject(root);
      if (box.isEmpty()) return;
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      var maxd = Math.max(size.x, size.y, size.z) || 1;
      var dist = (maxd / 2) / Math.tan((camera.fov * Math.PI / 180) / 2);
      dist *= 1.25;
      camera.position.set(center.x + maxd * 0.06, center.y + maxd * 0.05, center.z + dist);
      camera.near = dist / 100; camera.far = dist * 100;
      camera.lookAt(center.x, center.y, center.z);
      camera.updateProjectionMatrix();
      root.userData.cx = center.x; root.userData.cy = center.y; root.userData.cz = center.z;
    }

    new THREE.GLTFLoader().load(MODEL, function (gltf) {
      var m = gltf.scene;
      m.traverse(function (o) {
        if (o.isMesh) {
          o.castShadow = true; o.receiveShadow = true;
          if (o.material) { o.material.envMapIntensity = 1.0; o.material.needsUpdate = true; }
        }
      });
      // recenter to origin
      var b = new THREE.Box3().setFromObject(m);
      var c = b.getCenter(new THREE.Vector3());
      m.position.sub(c);
      root.add(m);
      var ph = document.getElementById('modelPh'); if (ph) ph.style.display = 'none';
      frame();
    }, undefined, function () {
      /* model missing -> leave placeholder visible */
    });

    var tRY = 0, tRX = 0, cRY = 0, cRX = 0;
    mount.addEventListener('pointermove', function (e) {
      var r = mount.getBoundingClientRect();
      tRY = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      tRX = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
    });
    mount.addEventListener('pointerleave', function () { tRY = 0; tRX = 0; });

    var t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.0035;
      cRY += (tRY - cRY) * 0.05; cRX += (tRX - cRX) * 0.05;
      root.rotation.y = (reduce ? 0 : Math.sin(t) * 0.5) + cRY;
      root.rotation.x = cRX * 0.4;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      W = mount.clientWidth; H = mount.clientHeight; if (!W || !H) return;
      camera.aspect = W / H; renderer.setSize(W, H); frame();
    });
  }
})();
