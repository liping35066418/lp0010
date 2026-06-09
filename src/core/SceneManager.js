import * as THREE from 'three';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    
    this.roomLength = 5;
    this.roomWidth = 4;
    this.roomHeight = 2.8;
    
    this.wallColor = 0xFFE4E1;
    this.floorColor = 0xDEB887;
    this.ceilingColor = 0xFFFAF0;
    
    this.walls = [];
    this.floor = null;
    this.ceiling = null;
    this.gridHelper = null;
    
    this.furniture = [];
    this.selectedObject = null;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.isDragging = false;
    this.dragPlane = null;
    this.dragOffset = new THREE.Vector3();
    this.intersectPoint = new THREE.Vector3();
    
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    
    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createRoom();
    this.createGrid();
    this.setupEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF0F8FF);
    this.scene.fog = new THREE.Fog(0xF0F8FF, 15, 40);
  }

  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(6, 5, 7);
    this.camera.lookAt(0, 1, 0);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xB0E0E6, 0xFFFAF0, 0.5);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(8, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.bias = -0.0001;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xFFE4E1, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  createRoom() {
    this.clearRoom();
    
    const L = this.roomLength;
    const W = this.roomWidth;
    const H = this.roomHeight;

    const floorGeo = new THREE.PlaneGeometry(L, W);
    const floorMat = new THREE.MeshStandardMaterial({
      color: this.floorColor,
      roughness: 0.75,
      metalness: 0.05
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.floor.userData.isFloor = true;
    this.scene.add(this.floor);

    const ceilingGeo = new THREE.PlaneGeometry(L, W);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: this.ceilingColor,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide
    });
    this.ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    this.ceiling.rotation.x = Math.PI / 2;
    this.ceiling.position.y = H;
    this.scene.add(this.ceiling);

    const wallMat = new THREE.MeshStandardMaterial({
      color: this.wallColor,
      roughness: 0.85,
      metalness: 0,
      side: THREE.DoubleSide
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(L, H), wallMat);
    backWall.position.set(0, H / 2, -W / 2);
    backWall.receiveShadow = true;
    backWall.userData.isWall = true;
    this.scene.add(backWall);
    this.walls.push(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(L, H), wallMat.clone());
    frontWall.position.set(0, H / 2, W / 2);
    frontWall.rotation.y = Math.PI;
    frontWall.receiveShadow = true;
    frontWall.userData.isWall = true;
    frontWall.visible = false;
    this.scene.add(frontWall);
    this.walls.push(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat.clone());
    leftWall.position.set(-L / 2, H / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    leftWall.userData.isWall = true;
    this.scene.add(leftWall);
    this.walls.push(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat.clone());
    rightWall.position.set(L / 2, H / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    rightWall.userData.isWall = true;
    this.scene.add(rightWall);
    this.walls.push(rightWall);

    this.addRoomDecorations();
  }

  clearRoom() {
    if (this.floor) {
      this.scene.remove(this.floor);
      this.floor.geometry.dispose();
      this.floor.material.dispose();
    }
    if (this.ceiling) {
      this.scene.remove(this.ceiling);
      this.ceiling.geometry.dispose();
      this.ceiling.material.dispose();
    }
    this.walls.forEach(wall => {
      this.scene.remove(wall);
      wall.geometry.dispose();
      wall.material.dispose();
    });
    this.walls = [];
  }

  addRoomDecorations() {
    const L = this.roomLength;
    const W = this.roomWidth;
    const H = this.roomHeight;

    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.5,
      metalness: 0.1
    });
    const baseboardH = 0.08;
    const baseboardT = 0.015;

    const bbBack = new THREE.Mesh(
      new THREE.BoxGeometry(L, baseboardH, baseboardT),
      baseboardMat
    );
    bbBack.position.set(0, baseboardH / 2, -W / 2 + baseboardT / 2);
    this.scene.add(bbBack);

    const bbLeft = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardT, baseboardH, W),
      baseboardMat
    );
    bbLeft.position.set(-L / 2 + baseboardT / 2, baseboardH / 2, 0);
    this.scene.add(bbLeft);

    const bbRight = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardT, baseboardH, W),
      baseboardMat
    );
    bbRight.position.set(L / 2 - baseboardT / 2, baseboardH / 2, 0);
    this.scene.add(bbRight);
  }

  createGrid() {
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
    }
    this.gridHelper = new THREE.GridHelper(Math.max(this.roomLength, this.roomWidth), 20, 0xFFB6C1, 0xFFE4E1);
    this.gridHelper.position.y = 0.001;
    this.scene.add(this.gridHelper);
  }

  updateRoomSize(length, width, height) {
    this.roomLength = length;
    this.roomWidth = width;
    this.roomHeight = height;
    this.createRoom();
    this.createGrid();

    this.furniture.forEach(f => {
      this.computeFurnitureSize(f);
    });

    this.constrainFurniture();
  }

  updateWallColor(color) {
    this.wallColor = new THREE.Color(color).getHex();
    this.walls.forEach(wall => {
      wall.material.color.setHex(this.wallColor);
    });
  }

  updateFloorColor(color) {
    this.floorColor = new THREE.Color(color).getHex();
    if (this.floor) {
      this.floor.material.color.setHex(this.floorColor);
    }
  }

  updateCeilingColor(color) {
    this.ceilingColor = new THREE.Color(color).getHex();
    if (this.ceiling) {
      this.ceiling.material.color.setHex(this.ceilingColor);
    }
  }

  computeFurnitureSize(mesh) {
    const prevRotation = mesh.rotation.y;
    mesh.rotation.y = 0;
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    mesh.userData.baseHalfSizeX = size.x / 2;
    mesh.userData.baseHalfSizeZ = size.z / 2;
    mesh.rotation.y = prevRotation;
    mesh.updateMatrixWorld(true);
  }

  getRotatedHalfExtents(mesh) {
    const hx = mesh.userData.baseHalfSizeX || 0.3;
    const hz = mesh.userData.baseHalfSizeZ || 0.3;
    const angle = mesh.rotation.y;
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    return {
      halfX: hx * cos + hz * sin,
      halfZ: hx * sin + hz * cos
    };
  }

  addFurniture(mesh, position) {
    mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.computeFurnitureSize(mesh);

    if (position) {
      mesh.position.copy(position);
    }

    this.scene.add(mesh);
    this.furniture.push(mesh);
    this.constrainPosition(mesh);
    return mesh;
  }

  removeFurniture(mesh) {
    const idx = this.furniture.indexOf(mesh);
    if (idx > -1) {
      this.furniture.splice(idx, 1);
    }
    this.scene.remove(mesh);
    mesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  constrainPosition(mesh) {
    const margin = 0.02;
    const roomHalfL = this.roomLength / 2 - margin;
    const roomHalfW = this.roomWidth / 2 - margin;

    if (!mesh.userData.baseHalfSizeX) {
      this.computeFurnitureSize(mesh);
    }

    const { halfX, halfZ } = this.getRotatedHalfExtents(mesh);

    const maxX = roomHalfL - halfX;
    const minX = -maxX;
    const maxZ = roomHalfW - halfZ;
    const minZ = -maxZ;

    if (halfX >= this.roomLength / 2) {
      mesh.position.x = 0;
    } else {
      if (mesh.position.x > maxX) mesh.position.x = maxX;
      if (mesh.position.x < minX) mesh.position.x = minX;
    }

    if (halfZ >= this.roomWidth / 2) {
      mesh.position.z = 0;
    } else {
      if (mesh.position.z > maxZ) mesh.position.z = maxZ;
      if (mesh.position.z < minZ) mesh.position.z = minZ;
    }
  }

  constrainFurniture() {
    this.furniture.forEach(f => {
      if (!f.userData.baseHalfSizeX) {
        this.computeFurnitureSize(f);
      }
      this.constrainPosition(f);
    });
  }

  selectObject(obj) {
    this.deselectObject();
    this.selectedObject = obj;
    if (obj) {
      obj.userData.isSelected = true;
      this.highlightObject(obj, true);
      if (this.onSelectionChange) {
        this.onSelectionChange(obj);
      }
    }
  }

  deselectObject() {
    if (this.selectedObject) {
      this.selectedObject.userData.isSelected = false;
      this.highlightObject(this.selectedObject, false);
      this.selectedObject = null;
      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
    }
  }

  highlightObject(obj, highlight) {
    obj.traverse(child => {
      if (child.isMesh) {
        if (highlight) {
          child.userData._originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
          if (child.material.emissive) {
            child.material.emissive.setHex(0xFFB6C1);
            child.material.emissiveIntensity = 0.3;
          }
        } else {
          if (child.material.emissive && child.userData._originalEmissive !== undefined) {
            child.material.emissive.setHex(child.userData._originalEmissive);
            child.material.emissiveIntensity = 1;
            delete child.userData._originalEmissive;
          }
        }
      }
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('keydown', this.onKeyDown);

    this.setupOrbitControls();
  }

  setupOrbitControls() {
    const scope = this;
    const camera = this.camera;
    const dom = this.renderer.domElement;

    const state = {
      NONE: -1,
      ROTATE: 0,
      PAN: 1,
      DOLLY: 2
    };

    let controlState = state.NONE;
    let prevX = 0;
    let prevY = 0;

    const spherical = new THREE.Spherical();
    const target = new THREE.Vector3(0, 1, 0);

    function updateSpherical() {
      const offset = new THREE.Vector3().copy(camera.position).sub(target);
      spherical.setFromVector3(offset);
    }

    function updateCamera() {
      const offset = new THREE.Vector3().setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
    }

    updateSpherical();

    dom.addEventListener('contextmenu', e => e.preventDefault());

    dom.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && !scope.isDragging) {
        controlState = state.ROTATE;
      } else if (e.button === 2) {
        controlState = state.PAN;
      }
      prevX = e.clientX;
      prevY = e.clientY;
    });

    dom.addEventListener('pointermove', (e) => {
      if (scope.isDragging) return;
      
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;

      if (controlState === state.ROTATE) {
        spherical.theta -= dx * 0.005;
        spherical.phi -= dy * 0.005;
        spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi));
        updateCamera();
      } else if (controlState === state.PAN) {
        const panSpeed = 0.005 * spherical.radius;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        camera.getWorldDirection(right);
        right.cross(up).normalize();
        target.addScaledVector(right, -dx * panSpeed);
        target.y += dy * panSpeed;
        target.y = Math.max(0.5, Math.min(this.roomHeight - 0.5, target.y));
        updateCamera();
      }

      prevX = e.clientX;
      prevY = e.clientY;
    });

    dom.addEventListener('pointerup', () => {
      controlState = state.NONE;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.005;
      spherical.radius = Math.max(2, Math.min(20, spherical.radius));
      updateCamera();
    }, { passive: false });

    this.cameraTarget = target;
    this.spherical = spherical;
    this._orbitState = state;
  }

  updateMouse(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  getIntersects(event, objects) {
    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  onMouseDown(event) {
    if (event.button !== 0) return;

    const furnitureMeshes = [];
    this.furniture.forEach(f => {
      f.traverse(child => {
        if (child.isMesh) furnitureMeshes.push(child);
      });
    });

    const intersects = this.getIntersects(event, furnitureMeshes);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && !this.furniture.includes(obj)) {
        obj = obj.parent;
      }
      if (this.furniture.includes(obj)) {
        this.selectObject(obj);
        this.isDragging = true;

        if (!this.dragPlane) {
          this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        }

        this.updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectPoint);
        this.dragOffset.copy(this.intersectPoint).sub(obj.position);
        this.renderer.domElement.style.cursor = 'grabbing';
      }
    } else {
      this.deselectObject();
    }
  }

  onMouseMove(event) {
    if (!this.isDragging || !this.selectedObject) return;

    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.dragPlane.constant = -this.selectedObject.position.y;

    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectPoint)) {
      this.selectedObject.position.copy(this.intersectPoint.sub(this.dragOffset));
      this.selectedObject.position.y = this.selectedObject.userData.baseY || 0;
      this.constrainPosition(this.selectedObject);
    }
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.renderer.domElement.style.cursor = '';
    }
  }

  onKeyDown(event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selectedObject) {
        this.removeFurniture(this.selectedObject);
        this.deselectObject();
      }
    }
  }

  rotateSelected(angle) {
    if (this.selectedObject) {
      this.selectedObject.rotation.y += angle;
      this.constrainPosition(this.selectedObject);
    }
  }

  deleteSelected() {
    if (this.selectedObject) {
      this.removeFurniture(this.selectedObject);
      this.deselectObject();
    }
  }

  resetCamera() {
    if (this.spherical) {
      this.spherical.theta = 0.8;
      this.spherical.phi = 0.7;
      this.spherical.radius = 9;
      this.cameraTarget.set(0, 1, 0);
      const offset = new THREE.Vector3().setFromSpherical(this.spherical);
      this.camera.position.copy(this.cameraTarget).add(offset);
      this.camera.lookAt(this.cameraTarget);
    }
  }

  clearAllFurniture() {
    this.deselectObject();
    [...this.furniture].forEach(f => this.removeFurniture(f));
  }

  exportImage() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  onWindowResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
  }
}
