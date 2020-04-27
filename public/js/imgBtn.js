const realImgBtn = document.getElementById('upload-img');
const customImgBtn = document.getElementById('img-button');
const customImgtxt = document.getElementById('img-text');
var children = "";

customImgBtn.addEventListener("click", function(){
    realImgBtn.click();
});

realImgBtn.addEventListener("change", function(){
    if(realImgBtn.value){
        for (var i = 0; i < realImgBtn.files.length; ++i) {
            var file_extension = realImgBtn.files.item(i).name.split('.').pop().toLowerCase();
            if(file_extension === "jpg"  || file_extension === "png" || file_extension === "jpeg"  )
            {
                children += '<li>' + realImgBtn.files.item(i).name + '</li>';
            }
            else
            {
                children += '<li>not an image</li>';
            }
        }

        customImgtxt.innerHTML = children;
    }
});