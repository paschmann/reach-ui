const { Reach } = require('reach-sdk');
var express = require('express');

var router = express.Router();
Reach.init();

router.get("/notifications", async (request, response) => {
    response.json(Reach.listProviders());
});

router.get("/notifications/:provider", async (request, response) => {
    response.json(Reach.parameters(request.params.provider));
});

router.post("/notifications/:provider/send", async (request, response) => {
    var notification = request.body;
    notification.name = request.params.provider;
    response.json(Reach.send(notification));
});

module.exports = router;