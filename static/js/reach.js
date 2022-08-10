$(document).ready(function () {

    // On load
    loadProviders();

    // Configure "Copy code" button
    setupCopyCode();

    // Click and change functions
    $("#providerList").change(function () {
        var providerName = $(this).find(':selected').text();
        loadParameters(providerName);
    });

    $('#send').on("click", function () {
        var providerName = $("#providerList").find(':selected').text();

        var notification = {
            required: {},
            optional: {}
        };
        $('#inputsRequired *').filter(':input').each(function () {
            if (!$(this).val()) {
                showResult("Complete required fields");
                exit();
            } else {
                notification.required[$(this).attr('id')] = $(this).val();
            }
        });

        $('#inputsOptional *').filter(':input').each(function () {
            notification.optional[$(this).attr('id')] = $(this).val();
        });

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

        var example_notification = notification;
        example_notification.name = providerName;

        var code = "<br />const { Reach } = require('reach-sdk');";
        code += "<br />Reach.init();"
        code += "<br /><br />var notification = {};"
        code += "<br />notification = " + JSON.stringify(example_notification) + ";";

        code += "<br /><br />console.log(Reach.send(notification));";

        $('#code').html(code);
    });

    function loadProviders() {
        // Download the list of notification providers
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