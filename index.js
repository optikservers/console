"use strict"
const Dockerode = require("dockerode");
const chalk = require("chalk");
const { Webhook } = require("discord-webhook-node");
const banned = require(__dirname + "/json/banned.json");
var logOpts = {stdout: 1,stderr: 1,tail:100,follow:0};
// Initialise docker connection
var docker = new Dockerode({socketPath: '/var/run/docker.sock'});

var webhook = new Webhook("https://discordapp.com/api/webhooks/942468839319437383/H7SHzodcO0vqQOnlaSldzX1r6m_gifI7FGzg2OgTo9rKSkoLz8AIhEaoNyqeBKcUvt6m");
// List docker containers and iterate
docker.listContainers(function (err, containers) {
    if (err) {
        console.log(chalk.red.bold("[ERROR] Error communicating with docker, is the daemon online?\n" + err))
        process.exit(1);
    }
    containers.forEach(async function(container) {
        var e = await docker.getContainer(container.Id).stats({stream:false});
        // console.log(e);
        var containerName = container.Names[0].replace("/", "");
        var logs = await docker.getContainer(container.Id).logs(logOpts);
        // console.log(container);
        logs = logs.toString("utf8");
        banned.forEach(async function(word) {
            if (logs.includes(word)) {
                // await docker.getContainer(container.Id).kill();
                console.log(chalk.yellow(`[DETECTION] Detected word ${word} used by server ${containerName} and killed it.`));
                
                webhook.send(`:warning: [DETECTION] Detected word ${word} used by server ${containerName} and killed it.`);
                return;
            }
        })
        
    });
  });

