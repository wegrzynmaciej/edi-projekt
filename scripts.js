function get_nbp_data_month(m, currencies) {
    // Deklaracja słownika dla API NBP - zamiana miesiąca na odpowiednią strukturę
    let month_day_string = {
        1: '01-31',
        2: '02-28',
        3: '03-31',
        4: '04-30',
        5: '05-31',
        6: '06-30',
        7: '07-31',
        8: '08-31',
        9: '09-30',
        10: '10-31',
        11: '11-30',
        12: '12-31'
    };

    // Ewentualna zamiana podanego numeru miesiąca do formatu 2-miejscowego, np. 1 => 01
    if (m < 10) {
        var m_formatted = '0' + m;
    } else {
        var m_formatted = m;
    };
    // Stworzenie URL do zapytania do api NBP dla konkretnego miesiąca
    var url_api = 'http://api.nbp.pl/api/exchangerates/tables/C/2019-' + m_formatted + '-01/2019-' + month_day_string[m];

    // Zapytanie AJAX do api NBP (powyższy URL)
    // Async bo inaczej problem z przerzucaniem danych
    $.ajax({
        url: url_api,
        dataType: 'json',
        async: false,
        success: function (data) {
            // NBP nie zawsze publikowało każdy dzień, dlatego przypisanie ilości dni opublikowanych do stałej blokowej
            const NBP_length_of_month = data.length;
            // Pętla przechodząca przez każdy opublikowany dzień miesiąca
            data.forEach(day_of_month => {
                const day = day_of_month['rates'];
                // Pętla po konkretnych walutach
                day.forEach(currency => {
                    const symbol = currency['code'];
                    const ask = currency['ask'];
                    const bid = currency['bid'];
                    // Dodanie wartości kupna (bid) i sprzedaży (ask) do słownika currencies dla danej waluty i danego miesiąca
                    currencies[symbol]['months'][m]['bid'] += bid;
                    currencies[symbol]['months'][m]['ask'] += ask;
                });
            });
            // Wyliczenie średniej z miesiąca dla każdej waluty z zaokrągleniem do 4 miejsc
            for (let symbol in currencies) {
                let currency = currencies[symbol]['months'][m]
                currency['ask'] = (currency['ask'] / NBP_length_of_month).toFixed(4);
                currency['bid'] = (currency['bid'] / NBP_length_of_month).toFixed(4);
            };

        }
    });
};

function generate_chart_NBP(currency_data) {
    var months = currency_data['months']
    var cols_bid = new Array();
    cols_bid.push('Kupno');
    var cols_ask = new Array();
    cols_ask.push('Sprzedaż')
    for (let x = 1; x <= 12; x++) {
        var bid = months[x]['bid'];
        var ask = months[x]['ask'];
        cols_bid.push(bid);
        cols_ask.push(ask);
    }
    bb.generate({
        bindto: "#chart",
        data: {
            x: "x",
            type: "spline",
            columns: [
                ["x", "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
                cols_bid,
                cols_ask
            ]
        },
        axis: {
            x: {
                type: "category",
                label: {
                    text: "Miesiące (2019 rok)",
                    position: "inner-center"
                }
            }
        }
    });
}