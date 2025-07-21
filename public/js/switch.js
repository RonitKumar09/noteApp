

var darkMode = document.getElementById("darkmode");
var navbar = document.getElementById("navbar");
var body = document.getElementById("body");
var brand = document.getElementById("brand");
var tbody = document.getElementById("tbody");
var thead = document.getElementById("thead");
var navBtns = document.getElementById("nav");
var search = document.getElementById("search");
var editbtn = document.getElementById("edit");

if (darkMode) {
  darkMode.addEventListener("change", function(){
      location.reload();
      if(darkMode.checked){
          localStorage.setItem("darkmode", "on");
          confirm("Dark Mode is still in alpha");
      }
      else if(darkMode.checked == false){
          localStorage.removeItem("darkmode");
      }
      darkTheme();
  });

  if(localStorage.getItem("darkmode") == "on"){
      darkMode.checked = true;
      darkTheme();
  }
}

function darkTheme(){
    if(navbar) {
      navbar.classList.toggle("bg-light");
      navbar.classList.toggle("bg-dark");
    }
    if(body) body.classList.toggle("black-bg");
    if(brand) {
      brand.classList.toggle("text-dark");
      brand.classList.toggle("text-white-50");
    }
    if(tbody) {
      tbody.classList.toggle("text-dark");
      tbody.classList.toggle("text-white-50");
    }
    if(thead) {
      thead.classList.toggle("text-white");
      thead.classList.toggle("text-white-50");
      thead.classList.toggle("bg-info");
      thead.classList.toggle("bg-dark");
    }
    if(navBtns) navBtns.classList.toggle("nav-btn");
    if(search) search.classList.toggle("bg-dark");
}


function edit(){
        editbtn.click();
    }
