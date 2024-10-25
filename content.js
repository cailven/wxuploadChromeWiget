let materials = [];

function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'material-panel';
  panel.innerHTML = `
    <h2>素材列表</h2>
    <button id="fetch-btn">抓取素材</button>
    <button id="download-btn">下载JSON</button>
    <button id="clear-btn">清空数据</button>
    <div id="material-list">
      <table id="material-table">
        <thead>
          <tr>
            <th>选择</th>
            <th>名称</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('fetch-btn').addEventListener('click', fetchMaterials);
  document.getElementById('download-btn').addEventListener('click', downloadJSON);
  document.getElementById('clear-btn').addEventListener('click', clearMaterials);
}

function extractMaterialInfo() {
  const newMaterials = [];
  document.querySelectorAll('.weui-desktop-img-picker__list .weui-desktop-img-picker__item').forEach(item => {
    const nameElement = item.querySelector('.weui-desktop-img-picker__img-title');
    const imgElement = item.querySelector('.weui-desktop-img-picker__img-thumb');
    
    if (nameElement && imgElement) {
      const name = nameElement.textContent.trim();
      const style = imgElement.getAttribute('style');
      const urlMatch = style.match(/url\("(.+?)"\)/);
      const url = urlMatch ? urlMatch[1] : '';
      
      newMaterials.push({
        name: name,
        url: url,
        selected: true // 默认选中
      });
    }
  });
  return newMaterials;
}

function updateMaterialList() {
  const tbody = document.querySelector('#material-table tbody');
  tbody.innerHTML = '';
  materials.forEach((material, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="select-checkbox" data-index="${index}" ${material.selected ? 'checked' : ''}></td>
      <td>${material.name}</td>
      <td>${material.url}</td>
    `;
    tbody.appendChild(tr);
  });

  // 添加勾选框事件监听
  document.querySelectorAll('.select-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const index = event.target.getAttribute('data-index');
      materials[index].selected = event.target.checked;
    });
  });
}

function fetchMaterials() {
  const newMaterials = extractMaterialInfo();
  
  // 合并新旧数据并去重
  const combinedMaterials = [...materials, ...newMaterials];
  materials = Array.from(new Set(combinedMaterials.map(JSON.stringify))).map(JSON.parse);
  
  // 根据名称排序
  materials.sort((a, b) => a.name.localeCompare(b.name));
  
  updateMaterialList();
}

function downloadJSON() {
  // 过滤掉未选中的项
  const selectedMaterials = materials.filter(material => material.selected);
  const jsonContent = JSON.stringify(selectedMaterials, null, 2);
  const blob = new Blob([jsonContent], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '微信公众号素材信息.json';
  a.click();
  URL.revokeObjectURL(url);
}

function clearMaterials() {
  materials = [];
  updateMaterialList();
}

// 创建面板并初始化
createPanel();
