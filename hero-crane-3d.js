/* <hero-crane-3d> — isometric tower-crane diorama on an engineering blueprint plane.
   Requires global THREE (UMD build loaded before this file). */
(function () {
  if (customElements.get('hero-crane-3d')) return;

  const STEEL = 0x6E747B, STEEL_D = 0x3A3F45, BLUE = 0xE8E2D4;

  class HeroCrane3D extends HTMLElement {
    connectedCallback() {
      if (this._up) return;
      this._up = true;
      this.style.display = 'block';
      this.style.position = 'absolute';
      this.style.inset = '0';
      this._accent = this.getAttribute('accent') || '#C41010';
      this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._wait(0);
    }

    _wait(n) {
      if (window.THREE) { this._init(); return; }
      if (n > 120) return;
      setTimeout(() => this._wait(n + 1), 50);
    }

    disconnectedCallback() {
      this._dead = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      window.removeEventListener('pointermove', this._onMove);
      if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss && this.renderer.forceContextLoss(); }
    }

    /* ---------- blueprint texture ---------- */
    _blueprint() {
      const S = 1024, c = document.createElement('canvas');
      c.width = c.height = S;
      const x = c.getContext('2d');
      x.fillStyle = '#E6E0D2'; x.fillRect(0, 0, S, S);

      // fine grid
      x.strokeStyle = 'rgba(40,46,54,0.10)'; x.lineWidth = 1;
      for (let i = 0; i <= S; i += S / 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke(); }
      // heavy grid
      x.strokeStyle = 'rgba(40,46,54,0.20)';
      for (let i = 0; i <= S; i += S / 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke(); }
      // border frame
      x.strokeStyle = 'rgba(40,46,54,0.55)'; x.lineWidth = 3;
      x.strokeRect(40, 40, S - 80, S - 80);
      x.lineWidth = 1; x.strokeRect(54, 54, S - 108, S - 108);

      // foundation plan: radius circles + bolt pattern
      const cx = S / 2, cy = S / 2;
      x.strokeStyle = 'rgba(40,46,54,0.42)'; x.lineWidth = 1.5;
      [96, 150, 232].forEach(r => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke(); });
      x.setLineDash([8, 10]); x.strokeStyle = 'rgba(40,46,54,0.3)';
      x.beginPath(); x.arc(cx, cy, 320, 0, Math.PI * 2); x.stroke();
      x.setLineDash([]);
      x.fillStyle = 'rgba(40,46,54,0.5)';
      for (let a = 0; a < 24; a++) {
        const t = (a / 24) * Math.PI * 2;
        x.beginPath(); x.arc(cx + Math.cos(t) * 190, cy + Math.sin(t) * 190, 4, 0, Math.PI * 2); x.fill();
      }
      // centre cross
      x.strokeStyle = 'rgba(40,46,54,0.6)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(cx - 52, cy); x.lineTo(cx + 52, cy); x.stroke();
      x.beginPath(); x.moveTo(cx, cy - 52); x.lineTo(cx, cy + 52); x.stroke();

      // radius sweep annotation
      x.strokeStyle = this._accent; x.lineWidth = 2; x.globalAlpha = 0.75;
      x.beginPath(); x.arc(cx, cy, 320, -Math.PI * 0.52, -Math.PI * 0.12); x.stroke();
      x.globalAlpha = 1;

      // dimension lines
      const dim = (x1, y1, x2, y2, label) => {
        x.strokeStyle = 'rgba(40,46,54,0.55)'; x.lineWidth = 1;
        x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
        [[x1, y1], [x2, y2]].forEach(([px, py]) => {
          x.beginPath();
          if (y1 === y2) { x.moveTo(px, py - 7); x.lineTo(px, py + 7); } else { x.moveTo(px - 7, py); x.lineTo(px + 7, py); }
          x.stroke();
        });
        x.save();
        x.fillStyle = 'rgba(40,46,54,0.72)';
        x.font = "500 17px 'Courier New', monospace";
        x.textAlign = 'center';
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        if (y1 === y2) { x.fillText(label, mx, my - 13); }
        else { x.translate(mx, my); x.rotate(-Math.PI / 2); x.fillText(label, 0, -13); }
        x.restore();
      };
      dim(120, 900, 904, 900, '30 000');
      dim(120, 120, 120, 904, '30 000');
      dim(cx, 760, cx + 320, 760, 'R 12 500');

      // callouts
      x.fillStyle = 'rgba(40,46,54,0.66)';
      x.font = "500 19px 'Courier New', monospace";
      x.textAlign = 'left';
      x.fillText('FOUNDATION PLAN / 01', 72, 104);
      x.font = "500 15px 'Courier New', monospace";
      x.fillText('GBP 2.4 kg/cm²', 72, 132);
      x.textAlign = 'right';
      x.fillText('SUNDER CRANES — LIFT STUDY', S - 72, 104);
      x.fillText('SHEET 01 / 04', S - 72, 132);
      x.textAlign = 'left';
      x.fillStyle = this._accent;
      x.fillRect(72, 152, 44, 3);

      const t = new THREE.CanvasTexture(c);
      t.anisotropy = 8;
      if (THREE.SRGBColorSpace && 'colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
      else t.encoding = THREE.sRGBEncoding;
      return t;
    }

    /* ---------- lattice helpers ---------- */
    _latticeSection(w, h, mat) {
      const g = new THREE.Group();
      const t = w * 0.075;
      const legs = [[-w / 2, -w / 2], [w / 2, -w / 2], [w / 2, w / 2], [-w / 2, w / 2]];
      legs.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(t, h, t), mat);
        leg.position.set(lx, h / 2, lz);
        leg.castShadow = true;
        g.add(leg);
      });
      // horizontal ties
      [0, h].forEach(y => {
        for (let s = 0; s < 4; s++) {
          const horiz = new THREE.Mesh(new THREE.BoxGeometry(w, t * 0.7, t * 0.7), mat);
          horiz.position.y = y;
          horiz.rotation.y = (s * Math.PI) / 2;
          horiz.position.x = Math.sin((s * Math.PI) / 2) * (w / 2);
          horiz.position.z = Math.cos((s * Math.PI) / 2) * (w / 2);
          g.add(horiz);
        }
      });
      // diagonals
      const diagLen = Math.sqrt(w * w + h * h);
      for (let s = 0; s < 4; s++) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(t * 0.55, diagLen, t * 0.55), mat);
        const ang = Math.atan2(w, h);
        d.position.y = h / 2;
        d.rotation.z = s % 2 === 0 ? ang : -ang;
        d.rotation.y = (s * Math.PI) / 2;
        d.position.x = Math.sin((s * Math.PI) / 2) * (w / 2);
        d.position.z = Math.cos((s * Math.PI) / 2) * (w / 2);
        g.add(d);
      }
      return g;
    }

    _truss(len, depth, mat, taper) {
      const g = new THREE.Group();
      const t = depth * 0.11;
      const bays = Math.max(4, Math.round(len / (depth * 1.15)));
      const bay = len / bays;
      // chords
      [[-depth / 2, 0], [depth / 2, 0]].forEach(([zz]) => {
        const top = new THREE.Mesh(new THREE.BoxGeometry(len, t, t), mat);
        top.position.set(len / 2, depth / 2, zz);
        top.castShadow = true;
        g.add(top);
      });
      const botGeo = new THREE.BoxGeometry(len, t, t);
      [-depth / 2, depth / 2].forEach(zz => {
        const b = new THREE.Mesh(botGeo, mat);
        b.position.set(len / 2, -depth / 2 + (taper ? depth * 0.16 : 0), zz);
        b.castShadow = true;
        g.add(b);
      });
      for (let i = 0; i <= bays; i++) {
        const px = i * bay;
        [-depth / 2, depth / 2].forEach(zz => {
          const v = new THREE.Mesh(new THREE.BoxGeometry(t * 0.7, depth, t * 0.7), mat);
          v.position.set(px, 0, zz);
          g.add(v);
          if (i < bays) {
            const dl = Math.sqrt(bay * bay + depth * depth);
            const d = new THREE.Mesh(new THREE.BoxGeometry(t * 0.5, dl, t * 0.5), mat);
            d.position.set(px + bay / 2, 0, zz);
            d.rotation.z = (i % 2 ? 1 : -1) * Math.atan2(bay, depth);
            g.add(d);
          }
        });
        const cross = new THREE.Mesh(new THREE.BoxGeometry(t * 0.6, t * 0.6, depth), mat);
        cross.position.set(px, depth / 2, 0);
        g.add(cross);
      }
      return g;
    }

    /* ---------- build ---------- */
    _init() {
      const W = this.clientWidth || 800, H = this.clientHeight || 600;
      const scene = new THREE.Scene();
      this.scene = scene;
      scene.fog = new THREE.Fog(0x08090A, 66, 168);

      const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 400);
      this.camera = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer = renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      this.appendChild(renderer.domElement);

      const matSteel = new THREE.MeshStandardMaterial({ color: STEEL, metalness: 0.72, roughness: 0.46 });
      const matDark = new THREE.MeshStandardMaterial({ color: STEEL_D, metalness: 0.6, roughness: 0.62 });
      const matAccent = new THREE.MeshStandardMaterial({ color: new THREE.Color(this._accent), metalness: 0.3, roughness: 0.5 });
      const matPaper = new THREE.MeshStandardMaterial({ map: this._blueprint(), metalness: 0.02, roughness: 0.93, color: 0xffffff });

      // blueprint sheet
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), matPaper);
      sheet.rotation.x = -Math.PI / 2;
      sheet.receiveShadow = true;
      scene.add(sheet);
      // sheet edge
      const edge = new THREE.Mesh(new THREE.BoxGeometry(46.4, 0.14, 46.4), new THREE.MeshStandardMaterial({ color: 0xC9C2B2, roughness: 0.9, metalness: 0.02 }));
      edge.position.y = -0.08;
      scene.add(edge);

      // ---- crane ----
      const crane = new THREE.Group();
      this.crane = crane;
      scene.add(crane);

      // base pad
      const pad = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.34, 4.4), matDark);
      pad.position.y = 0.17;
      pad.castShadow = pad.receiveShadow = true;
      crane.add(pad);
      // anchor blocks
      [[-1.7, -1.7], [1.7, -1.7], [1.7, 1.7], [-1.7, 1.7]].forEach(([bx, bz]) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.1), matDark);
        b.position.set(bx, 0.3, bz);
        b.castShadow = true;
        crane.add(b);
      });

      // mast
      const MAST_W = 2.1, SECT = 3.0, SECTIONS = 7;
      const mast = new THREE.Group();
      for (let i = 0; i < SECTIONS; i++) {
        const s = this._latticeSection(MAST_W, SECT, matSteel);
        s.position.y = 0.34 + i * SECT;
        mast.add(s);
      }
      crane.add(mast);
      const MAST_TOP = 0.34 + SECTIONS * SECT;

      // slewing assembly (rotates)
      const slew = new THREE.Group();
      this.slew = slew;
      slew.position.y = MAST_TOP;
      crane.add(slew);

      const ring = new THREE.Mesh(new THREE.CylinderGeometry(MAST_W * 0.82, MAST_W * 0.82, 0.4, 24), matDark);
      ring.castShadow = true;
      slew.add(ring);

      // operator cab
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.35, 1.6), matDark);
      cab.position.set(1.55, 0.95, 0);
      cab.castShadow = true;
      slew.add(cab);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 1.3), new THREE.MeshStandardMaterial({ color: 0x0E1418, metalness: 0.9, roughness: 0.18 }));
      glass.position.set(2.32, 1.0, 0);
      slew.add(glass);

      // A-frame apex
      const apexH = 3.6;
      const apex = new THREE.Group();
      [-0.7, 0.7].forEach(zz => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, apexH, 0.16), matSteel);
        leg.position.set(0, apexH / 2 + 0.2, zz);
        leg.rotation.z = 0.12;
        leg.castShadow = true;
        apex.add(leg);
      });
      slew.add(apex);

      // jib (long, tapering) + counter-jib
      const JIB = 19, CJIB = 7.2;
      const jib = this._truss(JIB, 1.5, matSteel, true);
      jib.position.set(1.2, 0.75, 0);
      slew.add(jib);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 1.7), matAccent);
      tip.position.set(1.2 + JIB, 0.75, 0);
      slew.add(tip);

      const cjib = this._truss(CJIB, 1.4, matSteel, false);
      cjib.rotation.y = Math.PI;
      cjib.position.set(-1.2, 0.75, 0);
      slew.add(cjib);

      // counterweights
      for (let i = 0; i < 3; i++) {
        const cw = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 2.7), matDark);
        cw.position.set(-CJIB - 0.7 + i * 0.76, 0.5, 0);
        cw.castShadow = true;
        slew.add(cw);
      }
      // hoist machinery
      const winch = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.0, 2.0), matDark);
      winch.position.set(-3.4, 1.35, 0);
      winch.castShadow = true;
      slew.add(winch);

      // pendant stays (apex → jib / counter-jib)
      const stay = (from, to) => {
        const dir = new THREE.Vector3().subVectors(to, from);
        const len = dir.length();
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, len, 5), matSteel);
        m.position.copy(from).add(dir.clone().multiplyScalar(0.5));
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        slew.add(m);
      };
      const apexTop = new THREE.Vector3(-0.42, apexH + 0.2, 0);
      stay(apexTop, new THREE.Vector3(1.2 + JIB * 0.42, 1.4, 0));
      stay(apexTop, new THREE.Vector3(1.2 + JIB * 0.86, 1.3, 0));
      stay(apexTop, new THREE.Vector3(-CJIB * 0.86, 1.3, 0));

      // trolley + hook block + cable
      const trolley = new THREE.Group();
      this.trolley = trolley;
      trolley.position.set(1.2 + JIB * 0.62, 0.2, 0);
      slew.add(trolley);
      const tBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.34, 1.3), matDark);
      tBody.castShadow = true;
      trolley.add(tBody);

      const cableH = 8.6;
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, cableH, 5), matSteel);
      this.cable = cable;
      cable.position.y = -cableH / 2 - 0.2;
      trolley.add(cable);

      const hook = new THREE.Group();
      this.hook = hook;
      hook.position.y = -cableH - 0.2;
      trolley.add(hook);
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), matAccent);
      block.castShadow = true;
      hook.add(block);
      const sheave = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 6, 14), matDark);
      sheave.position.y = -0.62;
      sheave.rotation.y = Math.PI / 2;
      hook.add(sheave);

      // suspended load — steel beam bundle
      const load = new THREE.Group();
      this.load = load;
      load.position.y = -1.5;
      hook.add(load);
      for (let i = 0; i < 3; i++) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 7.4), matDark);
        beam.position.set((i - 1) * 0.5, 0, 0);
        beam.castShadow = true;
        load.add(beam);
      }
      [-2.6, 2.6].forEach(zz => {
        const sling = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.7, 4), matSteel);
        sling.position.set(0, 0.85, zz);
        sling.rotation.x = zz > 0 ? -0.28 : 0.28;
        load.add(sling);
      });

      // ground scatter — material laydown on the sheet
      const scatter = new THREE.Group();
      scene.add(scatter);
      const stack = (px, pz, ry, n) => {
        for (let i = 0; i < n; i++) {
          const b = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.1), matDark);
          b.position.set(px, 0.15 + i * 0.32, pz);
          b.rotation.y = ry;
          b.castShadow = b.receiveShadow = true;
          scatter.add(b);
        }
      };
      stack(-12.5, 9.2, 0.22, 4);
      stack(10.4, 11.6, -0.5, 3);
      stack(-13.8, -8.4, 1.15, 2);
      for (let i = 0; i < 5; i++) {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 5.2, 12), matSteel);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(13.2, 0.38 + Math.floor(i / 3) * 0.72, -9.4 + (i % 3) * 0.78);
        pipe.castShadow = true;
        scatter.add(pipe);
      }

      // ---- lighting: single warm desk key, like a drafting lamp ----
      scene.add(new THREE.AmbientLight(0x2A3038, 0.9));
      const key = new THREE.DirectionalLight(0xFFE3B8, 3.1);
      key.position.set(14, 26, 9);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 90;
      const d = 24;
      key.shadow.camera.left = -d; key.shadow.camera.right = d;
      key.shadow.camera.top = d; key.shadow.camera.bottom = -d;
      key.shadow.bias = -0.0012;
      scene.add(key);
      const spot = new THREE.SpotLight(0xFFD9A0, 900, 120, 0.5, 0.8, 1.6);
      spot.position.set(14, 34, 11);
      spot.target.position.set(0, 6, 0);
      scene.add(spot, spot.target);
      const fill = new THREE.DirectionalLight(0x8FA6C4, 0.42);
      fill.position.set(-16, 9, -12);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xBFD2E6, 0.5);
      rim.position.set(-6, 14, 18);
      scene.add(rim);

      // camera framing
      this._baseCam = new THREE.Vector3(53, 40, 57);
      camera.position.copy(this._baseCam);
      this._look = new THREE.Vector3(0, 10, 0);
      camera.lookAt(this._look);

      // interaction state
      this._mx = 0; this._my = 0; this._tmx = 0; this._tmy = 0;
      this._scroll = 0;
      this._t0 = performance.now();
      this._visible = true;

      this._onMove = (e) => {
        const r = this.getBoundingClientRect();
        this._tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        this._tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      if (!this._reduced) window.addEventListener('pointermove', this._onMove, { passive: true });

      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => this._resize());
        this._ro.observe(this);
      }
      const io = new IntersectionObserver((en) => { en.forEach(x2 => { this._visible = x2.isIntersecting; }); }, { threshold: 0 });
      io.observe(this);

      this.setAttribute('data-ready', '1');
      this.dispatchEvent(new CustomEvent('ready'));
      this._resize();
      this._loop();
    }

    setScroll(p) { this._scroll = p; }

    _resize() {
      if (!this.renderer) return;
      const w = this.clientWidth || 1, h = this.clientHeight || 1;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      // pull the camera back on narrow viewports so the machine still reads whole
      const k = w / h < 1.05 ? 1.26 : (w / h < 1.5 ? 1.1 : 1);
      this._camScale = k;
      this.camera.position.copy(this._baseCam).multiplyScalar(k);
      const shift = w / h < 1.05 ? 0 : -w * 0.2;
      this.camera.setViewOffset(w, h, shift, 0, w, h);
      this.camera.updateProjectionMatrix();
    }

    _loop() {
      if (this._dead) return;
      this._raf = requestAnimationFrame(() => this._loop());
      if (!this._visible) return;
      const t = (performance.now() - this._t0) / 1000;

      // eased mouse follow
      this._mx += (this._tmx - this._mx) * 0.045;
      this._my += (this._tmy - this._my) * 0.045;

      const sp = this._scroll;
      // slow continuous slew + scroll-driven slew
      if (this.slew) this.slew.rotation.y = -0.52 + Math.sin(t * 0.055) * 0.14 + sp * 0.34;
      // trolley creeps out, hook settles
      if (this.trolley) this.trolley.position.x = 13 - sp * 1.8 + Math.sin(t * 0.09) * 0.35;
      if (this.load) {
        this.load.rotation.y = Math.sin(t * 0.16) * 0.05;
        this.load.position.y = -1.5 + Math.sin(t * 0.22) * 0.09;
      }

      // camera: parallax orbit + gentle scroll lift, always from the fixed base radius
      const orbit = this._mx * 0.1 + sp * 0.12;
      const lift = -this._my * 2.4 + sp * 2.4;
      const base = this._baseCam.clone().multiplyScalar(this._camScale || 1);
      const cs = Math.cos(orbit), sn = Math.sin(orbit);
      this.camera.position.set(base.x * cs + base.z * sn, base.y + lift, -base.x * sn + base.z * cs);
      this.camera.lookAt(this._look.x, this._look.y + sp * 0.8, this._look.z);

      this.renderer.render(this.scene, this.camera);
    }
  }

  customElements.define('hero-crane-3d', HeroCrane3D);
})();
