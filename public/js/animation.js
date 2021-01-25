(() => {
  const lis = document.querySelectorAll("div.tabs > ul > li");
  const viewPort = document.getElementById("view-port");
  for (let li of lis) {
    li.addEventListener("click", function (evt) {
      viewPort.style.marginLeft = li.dataset.pos + "%";

      for (let i of lis)
        i === this
          ? i.classList.add("is-active")
          : i.classList.remove("is-active");
    });
  }
})();
