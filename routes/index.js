const { Reach } = require('reach-sdk');
var express = require('express');

var router = express.Router();
Reach.init();

router.post("/webhook", async (request, response) => {
    console.log(request.body);
    response.json("Receieved");
});

router.get("/notifications", async (request, response) => {
    response.json(Reach.listProviders());
});

router.get("/notifications/:provider", async (request, response) => {
    response.json(Reach.parameters(request.params.provider));
});

router.post("/notifications/:provider/send", async (request, response) => {
    try {
        var notification = request.body;
        notification.name = request.params.provider;
        var output = await Reach.send(notification);
        response.json(output);
    } catch (err) {
        response.json(err);
    }
});

module.exports = router;