(() => {
  const form = document.getElementById("form");
  const urlHelp = document.getElementById("url-help");
  const tabVideo = document.getElementById("tab-video");
  const tabAudio = document.getElementById("tab-audio");
  const thumbnail = document.getElementById("thumbnail");
  const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);

    const url = data.get("url").toString().trim();

    if (regex.test(url)) {
      urlHelp.classList.add("is-hidden");

      const respose = request({ url }, { method: "POST" });
      respose.catch(console.log).then(render).catch(console.log);
    } else {
      urlHelp.classList.remove("is-hidden");
    }
  });

  const request = (data, { method = "GET", url = "/" } = {}) => {
    return new Promise((res, rej) => {
      const xrequest = new XMLHttpRequest();
      xrequest.addEventListener("load", (evt) => {
        res(xrequest.responseText);
      });
      xrequest.addEventListener("error", rej);

      xrequest.timeout = 10000;
      xrequest.open(method, url);
      xrequest.setRequestHeader(
        "content-type",
        "application/json; charset=utf-8"
      );
      xrequest.send(JSON.stringify(data));
    });
  };

  const render = (data) => {
    const odata = JSON.parse(data);
    let videoUrl = [],
      audioUrl = [];

    for (let format of odata.formats) {
      if (format.format.includes("audio only")) {
        audioUrl.push(format);
      } else if (!!format.height && !!format.width) {
        videoUrl.push(format);
      }
    }

    renderListVideo(videoUrl);
    renderListAudio(audioUrl);
    renderThumbnail(odata);
  };

  const renderListVideo = (data) => {
    // data.sort((a, b) => {
    //   if(a.asr && b.asr)
    //     if(a.)
    // })
    listItem = "";
    for (let file of data) {
      const list = `<li class="list-item">
                      <div class="display is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center">
                        <div class="is-flex-basis-7 is-little-scare-left"> ${
                          file.format_note
                        }.${file.ext} ${!file.asr ? "<b>(no audio)</b>" : ""}
                        </div>
                        <div class="is-flex-basis-3 is-center-text">
                          <a class="button is-success is-outlined" href="${
                            file.url
                          }"> 
                            <span class="icon"><i class="fas fa-download"></i></span> Dowload
                          </a>
                        </div>
                      </div>
                    </li>`;
      listItem += list;
    }
    tabVideo.innerHTML = listItem;
  };

  const renderListAudio = (data) => {
    listItem = "";
    for (let file of data) {
      const list = `<li class="list-item">
                      <div class="display is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center">
                        <div class="is-flex-basis-7 is-little-scare-left">${
                          file.ext
                        } ${
        file.filesize
          ? Math.round((file.filesize / 1048576) * 100) / 100 + "Mb"
          : ""
      }
                        </div>
                        <div class="is-flex-basis-3 is-center-text">
                          <a class="button is-success is-outlined" href="${
                            file.url
                          }"> 
                            <span class="icon"><i class="fas fa-download"></i></span> Dowload
                          </a>
                        </div>
                      </div>
                    </li>`;
      listItem += list;
    }
    tabAudio.innerHTML = listItem;
  };

  const renderThumbnail = (data) => {
    thumbnail.innerHTML = `<div><figure class="image"><img src="${data.thumbnails[3].url}"></figure></div><div><div class="is-little-scare-x"><h4 class="subtitle is-4">${data.fulltitle}</h4></div></div>`;
  };
})();
