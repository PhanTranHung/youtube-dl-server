"use strict";

const Hapi = require("@hapi/hapi");
const Path = require("path");
const cp = require("child_process");

const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

const init = async () => {
  const server = Hapi.server({
    port: 8888,
    host: "localhost",
    routes: {
      files: {
        relativeTo: Path.join(__dirname, "public"),
      },
    },
  });

  await server.register(require("@hapi/vision"));

  server.views({
    engines: {
      pug: require("pug"),
    },
    relativeTo: __dirname,
    path: "./views",
    isCached: false,
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (req, h) => {
      return h.view("index", { title: "Hello World" });
    },
  });

  server.route({
    method: "POST",
    path: "/",
    handler: (req, h) => {
      const url = req.payload.url.toString().trim();

      if (url.match(regex))
        return new Promise((res, rej) => {
          const ls = cp.spawn(`youtube-dl`, ["-j", "--skip-download", url]);
          ls.stdout.on("data", (data) => {
            const response = h.response(data);
            response.type("application/json");  
            response.charset("utf-8");

            res(response);
          });

          ls.stderr.on("data", (data) => {
            res(`stderr: ${data}`);
          });

          ls.on("error", (error) => {
            res(`error: ${error.message}`);
          });

          ls.on("close", (code) => {
            res(`child process exited with code ${code}`);
          });
        });
      return h.redirect("/");
    },
    options: {
      payload: {
        defaultContentType: "application/json",
      },
    },
  });

  await server.register(require("@hapi/inert"));

  server.route({
    method: "GET",
    path: "/{file*}",
    handler: {
      directory: {
        path: ".",
      },
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
