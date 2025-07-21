
const realImgBtn = document.getElementById('upload-img');
const customImgBtn = document.getElementById('img-button');
const customImgtxt = document.getElementById('img-text');
let selectedFiles = [];

// Modal elements
let modal = document.getElementById('fileErrorModal');
let modalMsg = document.getElementById('fileErrorMsg');
let modalBtn = document.getElementById('fileErrorBtn');

if (realImgBtn && customImgBtn && customImgtxt) {
  customImgBtn.addEventListener("click", function(){
      realImgBtn.click();
  });

  realImgBtn.addEventListener("change", function(){
      if(realImgBtn.files.length > 0){
          let invalidFiles = [];
          selectedFiles = [];
          let listHtml = '';
          for (let i = 0; i < realImgBtn.files.length; ++i) {
              let file = realImgBtn.files.item(i);
              let file_extension = file.name.split('.').pop().toLowerCase();
              if(["jpg","jpeg","png","gif","bmp","webp"].includes(file_extension)) {
                  selectedFiles.push(file);
                  listHtml += `<li>${file.name} <button type="button" class="remove-img" data-index="${i}">✕</button></li>`;
              } else {
                  invalidFiles.push({name: file.name, type: file_extension});
              }
          }
          customImgtxt.innerHTML = listHtml || 'No images selected';

          // Show modal if invalid files
          if(invalidFiles.length > 0 && modal && modalMsg && modalBtn) {
              let msg = 'Invalid file(s):<br>' + invalidFiles.map(f => `<b>${f.name}</b> (<i>${f.type}</i>)`).join('<br>');
              modalMsg.innerHTML = msg;
              modal.style.display = 'flex';
            modalBtn.onclick = function(e) {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                modal.style.display = 'none';
                realImgBtn.value = '';
                customImgtxt.innerHTML = 'No images selected';
                selectedFiles = [];
            };
          } else if (modal) {
              // Always hide modal if no invalid files
              modal.style.display = 'none';
          }
      }
  });

// Remove image from selection
customImgtxt.addEventListener('click', function(e) {
    if(e.target.classList.contains('remove-img')) {
        let idx = parseInt(e.target.getAttribute('data-index'));
        let filesArr = Array.from(realImgBtn.files);
        filesArr.splice(idx, 1); // Remove the file at the clicked index
        // Update the file input
        let dt = new DataTransfer();
        filesArr.forEach(f => dt.items.add(f));
        realImgBtn.files = dt.files;
        // Update the UI list
        if (filesArr.length === 0) {
            customImgtxt.innerHTML = 'No images selected';
        } else {
            let listHtml = '';
            filesArr.forEach((file, i) => {
                listHtml += `<li>${file.name} <button type="button" class="remove-img" data-index="${i}" style="background:none;border:none;color:var(--danger,#dc3545);font-size:1.2em;vertical-align:middle;cursor:pointer;">✕</button></li>`;
            });
            customImgtxt.innerHTML = listHtml;
        }
    }
});
}