$(document).ready(function () {

    // On load
    loadProviders();

    // Configure "Copy code" button
    setupCopyCode();

    // Click and change functions
    $("#providerList").change(function () {
        var providerName = getProviderName();
        loadParameters(providerName);
    });

    $('#genCode').on("click", function () {
        generateCodeExample();
    });

    $('#parseNotificationCode').on("click", function () {
        try {
            var code = prompt('This function will prepopulate the notification fields if you have a previously created notification string. E.g.: {"required":{"slackwebhookURL":"https://www.myslackinstance.com/webhook","text":"Test"},"optional":{},"name":"slack"}; Please enter the string to parse.');
            var codeJSON = JSON.parse(code);

            $('#inputsRequired *').filter(':input').each(function () {
                console.log($(this).attr('id'));
                $(this).val(codeJSON.required[$(this).attr('id')]);
            });

            $('#inputsOptional *').filter(':input').each(function () {
                console.log($(this).attr('id'));
                $(this).val(codeJSON.optional[$(this).attr('id')]);
            });
            scrollToTop();

        } catch (err) {
            console.log(err);
        }
    });

    $('#send').on("click", function () {
        try {
            $('#inputsRequired *').filter(':input').each(function () {
                if (!$(this).val()) {
                    showResult("Complete required fields");
                    scrollToTop();
                    throw "Complete required fields"
                }
            });

            var notification = getNotificationObject();
            var providerName = getProviderName();
            generateCodeExample();

            $.ajax({
                type: "POST",
                url: "http://localhost:8001/api/v1/notifications/" + providerName + "/send",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(notification),
                success: function (result, status, xhr) {
                    showResult(JSON.stringify(result));
                },
                error: function (xhr, status, error) {
                    showResult("Error: " + status + " " + error + " " + xhr.status + " " + xhr.statusText);
                }
            });

            scrollToTop();
        } catch (err) {
            console.log(err);
        }
    });

    function scrollToTop() {
        window.scrollTo(0, 0);
    }

    function getProviderName() {
        return $("#providerList").find(':selected').text();
    }

    function getNotificationObject() {
        var notification = {
            required: {},
            optional: {}
        };
        $('#inputsRequired *').filter(':input').each(function () {
            notification.required[$(this).attr('id')] = $(this).val();
        });

        $('#inputsOptional *').filter(':input').each(function () {
            notification.optional[$(this).attr('id')] = $(this).val();
        });

        return notification;
    }

    function generateCodeExample() {
        var example_notification = getNotificationObject();
        example_notification.name = getProviderName();

        var code = "<br />const { Reach } = require('reach-sdk');";
        code += "<br />Reach.init();"
        code += "<br /><br />var notification = {};"
        code += "<br />notification = " + JSON.stringify(example_notification) + ";";

        code += "<br /><br />console.log(Reach.send(notification));";

        $('#code').html(code);
    }

    function loadProviders() {
        // Download the list of notification providers, optional notification included to prepopulate fields
        $.ajax({
            type: "GET",
            url: "http://localhost:8001/api/v1/notifications",
            dataType: "json",
            success: function (result, status, xhr) {
                $('#providerList')
                    .empty()
                    .append('<option value=""></option>');

                result.forEach(element => {
                    $('#providerList')
                        .append('<option value="' + element + '">' + element + '</option>');
                });
            },
            error: function (xhr, status, error) {
                alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
            }
        });
    }

    function loadParameters(providerName) {
        $('#result')
            .empty();
        $.ajax({
            type: "GET",
            url: "http://localhost:8001/api/v1/notifications/" + providerName,
            dataType: "json",
            success: function (result, status, xhr) {
                renderInput(result.required, "#inputsRequired", "required");
                renderInput(result.optional, "#inputsOptional", "");
                $('#parameters').val(JSON.stringify(result));
            },
            error: function (xhr, status, error) {
                alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
            }
        });
    }

    function renderInput(object, span, required) {
        $(span)
            .empty();
        for (var key in object) {
            var html = "<div class='mb-3'>";
            html += "<label for='parameters' class='form-label'>" + key + ":</label>";
            html += "<input class='form-control form-control-sm' id='" + key + "' type='text' " + required + "></input>"
            html += "</div>";
            $(span)
                .append(html);
        }
    }

    function showResult(message) {
        var html = "<div class='alert alert-primary mt-3' role='alert'>";
        html += message
        html += "</div>";
        $('#result').html(html);
        scrollToTop();
    }

    function setupCopyCode() {
        const copyButtonLabel = "Copy Code";
        let blocks = document.querySelectorAll("#precode");

        blocks.forEach((block) => {
            // only add button if browser supports Clipboard API
            if (navigator.clipboard) {
                let button = document.createElement("button");
                button.innerText = copyButtonLabel;
                button.addEventListener("click", copyCode);
                block.appendChild(button);
            }
        });

        async function copyCode(event) {
            const button = event.srcElement;
            const pre = button.parentElement;
            let code = pre.querySelector("code");
            let text = code.innerText;
            await navigator.clipboard.writeText(text);

            button.innerText = "Code Copied";

            setTimeout(() => {
                button.innerText = copyButtonLabel;
            }, 1000)
        }
    }

});