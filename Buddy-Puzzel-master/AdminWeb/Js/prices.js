// Shorthand for $( document ).ready()
$(function () {
    console.debug("(prices ready) In");

    tdcBindings();
    $('#btnCalculatePrice').trigger('click');
    $('#numberOfAgents').trigger('focus');

    console.debug("(prices ready) Out");
});

$(window).on("load", function () {
    console.debug("(load) In");
});

function tdcBindings() {
    /* Model 1 */
    $('#btnCalculatePrice').on('click', function () {
        calculateModel1();
        $("#numberOfAgents").trigger("focus");
    });

    $('#numberOfAgents').on('change', function () {
        calculateModel1();
    });


    /* Model 2 */
    $('#btnCalculatePrice2').on('click', function () {
        calculateModel2();
        $("#numberOfAgents2").trigger("focus");
    });

    $('#numberOfAgents2').on('change', function () {
        calculateModel2();
    });


    /* NAV Bar changed */
    $('a.nav-link').on('shown.bs.tab', function (event) {
        let tabActive = $(event.target).attr("href");
        console.info("tabActive", tabActive);

        if (tabActive === "#tabPriceModel1") {
            $('#btnCalculatePrice').trigger('click');
            $('#numberOfAgents').trigger('focus');
        }
        else {
            $('#btnCalculatePrice2').trigger('click');
            $('#numberOfAgents2').trigger('focus');
        }
    });
}


function calculateModel1() {
    let number = $('#numberOfAgents').val();
    console.debug("(btnCalculatePrice) number", number)

    if (number === "") { return; }

    let price = 0;
    if (number < 5)
        price = number * 375
    else if (number < 10)
        price = number * 356
    else if (number < 25)
        price = number * 336
    else if (number < 50)
        price = number * 297
    else if (number < 100)
        price = number * 277
    else
        price = number * 238

    let numberLabel = (number === "1") ? "agent" : "agenter";
    $("#sumResult").html(`
            <span class="fas fa-coins text-primary"></span>&nbsp;
            Samlet pris for ${number} ${numberLabel}: <span class="fw-bold text-success">${price.toLocaleString('da-DK')}</span> kr. (per måned)
        `);

    console.debug("(btnCalculatePrice) price", price)
    console.debug("(btnCalculatePrice) onClick Out")
}


function calculateModel2() {
    let number = $('#numberOfAgents2').val();

    if (number === "") { return; }

    let priceFirstYear = 0;
    let price = 0;

    if (number < 5) {
        price = (number * 350) + 2000;
        priceFirstYear = price + (10000 / 12);
    }
    else if (number < 10) {
        price = (number * 300) + 2200
        priceFirstYear = price + (12000 / 12);

    }
    else if (number < 25) {
        price = (number * 250) + 2500
        priceFirstYear = price + (15000 / 12);
    }
    else if (number < 50) {
        price = (number * 200) + 3000;
        priceFirstYear = price + (20000 / 12);
    }
    else if (number < 100) {
        price = (number * 150) + 4000;
        priceFirstYear = price + (25000 / 12);
    }
    else {
        price = (number * 100) + 5000;
        priceFirstYear = price + (30000 / 12);
    }

    priceFirstYear = parseInt(priceFirstYear);
    let numberLabel = (number === "1") ? "agent" : "agenter";
    $("#sumResult2").html(`
            <span class="fas fa-coins text-primary"></span>&nbsp;
            Samlet pris for ${number} ${numberLabel}: <span class="fw-bold text-success">${price.toLocaleString('da-DK')}</span> kr. (per måned)
            <br>
            <span class="fas fa-coins text-primary"></span>&nbsp;
            Første år: ${priceFirstYear.toLocaleString('da-DK')} kr. (per måned)
        `);
}