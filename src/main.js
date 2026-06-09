import { SceneManager } from './core/SceneManager.js';
import * as FurnitureFactory from './core/FurnitureFactory.js';
import { RoomStyles, applyStyle } from './core/RoomStyles.js';

class App {
  constructor() {
    this.sceneManager = null;
    this.currentStyle = 'pinkPrincess';
    this.init();
  }

  init() {
    const container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(container);

    this.setupUI();
    this.applyDefaultStyle();

    this.sceneManager.onSelectionChange = (obj) => {
      this.updateSelectedInfo(obj);
    };
  }

  setupUI() {
    this.setupRoomControls();
    this.setupColorControls();
    this.setupStyleButtons();
    this.setupFurnitureGrid();
    this.setupActionButtons();
    this.setupSelectedActions();
  }

  setupRoomControls() {
    const lengthSlider = document.getElementById('room-length');
    const widthSlider = document.getElementById('room-width');
    const heightSlider = document.getElementById('room-height');

    const lengthValue = document.getElementById('room-length-value');
    const widthValue = document.getElementById('room-width-value');
    const heightValue = document.getElementById('room-height-value');

    const updateRoom = () => {
      const l = parseFloat(lengthSlider.value);
      const w = parseFloat(widthSlider.value);
      const h = parseFloat(heightSlider.value);
      lengthValue.textContent = l.toFixed(1);
      widthValue.textContent = w.toFixed(1);
      heightValue.textContent = h.toFixed(1);
      this.sceneManager.updateRoomSize(l, w, h);
    };

    lengthSlider.addEventListener('input', updateRoom);
    widthSlider.addEventListener('input', updateRoom);
    heightSlider.addEventListener('input', updateRoom);
  }

  setupColorControls() {
    const wallInput = document.getElementById('wall-color');
    const floorInput = document.getElementById('floor-color');
    const ceilingInput = document.getElementById('ceiling-color');

    wallInput.addEventListener('input', (e) => {
      this.sceneManager.updateWallColor(e.target.value);
      this.clearStyleActive();
    });

    floorInput.addEventListener('input', (e) => {
      this.sceneManager.updateFloorColor(e.target.value);
      this.clearStyleActive();
    });

    ceilingInput.addEventListener('input', (e) => {
      this.sceneManager.updateCeilingColor(e.target.value);
      this.clearStyleActive();
    });
  }

  setupStyleButtons() {
    const styleBtns = document.querySelectorAll('.style-btn');
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.style;
        this.currentStyle = style;
        this.setStyleActive(style);
        this.updateColorInputs(style);
        applyStyle(this.sceneManager, style, FurnitureFactory);
      });
    });
  }

  setStyleActive(styleKey) {
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === styleKey);
    });
  }

  clearStyleActive() {
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  updateColorInputs(styleKey) {
    const style = RoomStyles[styleKey];
    if (!style) return;
    document.getElementById('wall-color').value = style.wallColor;
    document.getElementById('floor-color').value = style.floorColor;
    document.getElementById('ceiling-color').value = style.ceilingColor;
  }

  applyDefaultStyle() {
    this.updateColorInputs(this.currentStyle);
    applyStyle(this.sceneManager, this.currentStyle, FurnitureFactory);
  }

  setupFurnitureGrid() {
    const grid = document.getElementById('furniture-grid');
    FurnitureFactory.FurnitureCatalog.forEach(item => {
      const card = document.createElement('div');
      card.className = 'furniture-card';
      card.innerHTML = `
        <div class="furniture-icon">${item.icon}</div>
        <div class="furniture-name">${item.name}</div>
      `;
      card.addEventListener('click', () => {
        this.addFurniture(item.id);
      });
      grid.appendChild(card);
    });
  }

  addFurniture(id) {
    const mesh = FurnitureFactory.getFurnitureById(id);
    if (!mesh) return;

    const L = this.sceneManager.roomLength;
    const W = this.sceneManager.roomWidth;

    const x = (Math.random() - 0.5) * (L - 2);
    const z = (Math.random() - 0.5) * (W - 2);

    if (mesh.userData.isWallMounted) {
      mesh.position.set(0, mesh.userData.baseY || 1.2, -W / 2 + 0.05);
      mesh.userData.baseY = mesh.position.y;
    } else {
      mesh.position.set(x, mesh.userData.baseY || 0, z);
    }

    const added = this.sceneManager.addFurniture(mesh);
    this.sceneManager.selectObject(added);

    added.userData.furnitureId = id;
  }

  setupActionButtons() {
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('确定要重置场景吗？所有家具将被清除。')) {
        this.applyDefaultStyle();
        this.setStyleActive(this.currentStyle);
        this.sceneManager.resetCamera();
      }
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportImage();
    });
  }

  setupSelectedActions() {
    document.getElementById('rotate-left-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.sceneManager.rotateSelected(Math.PI / 6);
    });

    document.getElementById('rotate-right-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.sceneManager.rotateSelected(-Math.PI / 6);
    });

    document.getElementById('delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确定要删除选中的家具吗？')) {
        this.sceneManager.deleteSelected();
      }
    });
  }

  updateSelectedInfo(obj) {
    const infoBar = document.getElementById('selected-info');
    const nameEl = document.getElementById('selected-name');

    if (obj) {
      let name = obj.userData.furnitureName;
      if (obj.userData.furnitureId) {
        name = FurnitureFactory.getFurnitureName(obj.userData.furnitureId) || name;
      }
      nameEl.textContent = `已选中: ${name}`;
      infoBar.classList.remove('hidden');
    } else {
      infoBar.classList.add('hidden');
    }
  }

  exportImage() {
    const prevBg = this.sceneManager.scene.background;
    this.sceneManager.scene.background = null;

    setTimeout(() => {
      const dataUrl = this.sceneManager.exportImage();

      const link = document.createElement('a');
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
      link.download = `儿童房设计_${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      this.sceneManager.scene.background = prevBg;

      this.showToast('图片已保存！');
    }, 100);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #66BB6A, #43A047);
      color: white;
      padding: 12px 28px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
      pointer-events: none;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 2200);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
