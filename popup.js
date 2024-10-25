document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getMaterials'}, (response) => {
      const materialList = document.getElementById('materialList');
      response.forEach(material => {
        const div = document.createElement('div');
        div.textContent = `${material.name}: ${material.url}`;
        materialList.appendChild(div);
      });
    });
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getMaterials'}, (response) => {
        const jsonContent = JSON.stringify(response, null, 2);
        const blob = new Blob([jsonContent], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '微信公众号素材信息.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  });
});
