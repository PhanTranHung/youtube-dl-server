(() => {
  const findById = (id) => document.getElementById(id);

  const form = findById("form");
  const urlHelp = findById("url-help");
  const tabVideo = findById("tab-video");
  const tabAudio = findById("tab-audio");
  const thumbnail = findById("thumbnail");
  const media = document.querySelectorAll("#media > *");
  const convertBtn = findById("convert-btn");

  convertBtn.isLoading = (type) =>
    !!type
      ? convertBtn.classList.add("is-loading")
      : convertBtn.classList.remove("is-loading");

  const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

  const stageLoading = (type) => {
    switch (type.toString().trim()) {
      case "error":
        showListMediaItem("convert-error");
        convertBtn.isLoading(false);
        break;

      case "true":
        showListMediaItem("convert-loading");
        convertBtn.isLoading(true);

        break;
      case "false":
        showListMediaItem("convert-success");
        convertBtn.isLoading(false);

      default:
        break;
    }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);

    const url = data.get("url").toString().trim();

    if (regex.test(url)) {
      urlHelp.classList.add("is-hidden");
      stageLoading(true);
      const response = request({ url }, { method: "POST" });
      response.then(render).catch(() => stageLoading("error"));
    } else {
      urlHelp.classList.remove("is-hidden");
    }
  });

  const request = (data, { method = "GET", url = "/" } = {}) => {
    return new Promise((res, rej) => {
      const xrequest = new XMLHttpRequest();
      xrequest.addEventListener("load", (evt) => {
        if (xrequest.status === 200) return res(xrequest.responseText);
        return rej(xrequest.responseText);
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

    stageLoading(false);
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
                        <div class="is-flex-grow-1 is-little-scare-left">
                          <div class="columns is-mobile">
                            <div class="column is-half-mobile is-three-fifths-tablet is-half-desktop is-no-wrap-text">
                            ${file.format.split("-")[1].trim()} 
                            ${!file.asr ? "<wbr>(<i>no audio</i>)<wbr>" : ""}
                            </div>
                            <div class="column">
                            ${calSize(file.filesize)}
                            </div>
                            <div class="column">
                            ${file.ext}
                            </div>
                          </div>
                        </div>
                        <div class="is-little-scare-right">
                          <a class="button is-success is-outlined" href="${
                            file.url
                          }">
                            <span class="icon"> <i class="fas fa-download"> </i> </span>
                            Dowload
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
                        <div class="is-flex-grow-1 is-little-scare-left">
                          <div class="columns is-mobile">
                            <div class="column is-one-third">
                            ${file.ext}
                            </div>
                            <div class="column is-one-third">
                            ${calSize(file.filesize)}
                            </div>
                          </div>
                        </div>
                        <div class="is-little-scare-right">
                          <a class="button is-success is-outlined" href="${
                            file.url
                          }">
                            <span class="icon"><i class="fas fa-download"></i></span>
                            Dowload
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

  const showListMediaItem = (id) => {
    media.forEach((node) =>
      id === node.id.trim()
        ? node.classList.remove("is-hidden")
        : node.classList.add("is-hidden")
    );
  };

  const calSize = (bytes) => {
    if (bytes) {
      const dataSize = Math.round((bytes / 1048576) * 100) / 100;
      if (dataSize > 900)
        return Math.round((dataSize / 1024) * 100) / 100 + "GB";
      return dataSize + "MB";
    }
    return "Unknow";
  };
})();
