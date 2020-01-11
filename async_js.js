function populate(url) {

    return $.getJSON(url).then(function (data) {

        console.log(data)
        return data;
    });
}
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
    var url = 'http://api.nbp.pl/api/exchangerates/tables/C/2019-' + m_formatted + '-01/2019-' + month_day_string[m];
    populate(url).then(function (returned_data) {
        // NBP nie zawsze publikowało każdy dzień, dlatego przypisanie ilości dni opublikowanych do stałej blokowej
        const NBP_length_of_month = returned_data['length'];
        // Pętla przechodząca przez każdy opublikowany dzień miesiąca
        returned_data.forEach(day_of_month => {
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
        currencies = returned_data['dict'];

        for (let symbol in currencies) {
            let currency = currencies[symbol]['months'][m]
            currencies[symbol]['months'][m]['ask'] = (currency['ask'] / NBP_length_of_month).toFixed(4);
            currencies[symbol]['months'][m]['bid'] = (currency['bid'] / NBP_length_of_month).toFixed(4);
        };
        return currencies;

    });

    return currencies

};
function get_currencies(url_symbols) {

    return $.getJSON(url_symbols).then(function (result) {
        // Deklaracja słownika walut
        var currencies = {};
        let rates = result[0]['rates'];
        // Populacja słownika
        rates.forEach(element => {
            let name = element['currency'];
            let symbol = element['code'];
            currencies[symbol] = {
                'name': name,
                'months': {}
            };
            for (let x = 1; x <= 12; x++) {
                currencies[symbol]['months'][x] = { 'bid': 0, 'ask': 0 }
            };

        });
        return currencies
    });
}