var $$;
var app;

var search_searchbar = null;
var search_calendar = null;
var search_dialog_nbwait = null;
var search_dialog_alert = null;

var tplRates = null;

var appObject = {

    appInit: function () {

        $$ = Dom7;

        app = new Framework7({
            root: '#app',
            name: 'Курсы валют НБУ',
            id: 'com.aloz.nbuexrate',
            routes: [
                {
                    path: '/search',
                    url: 'pages/search.html'
                },
                {
                    path: '/about',
                    url: 'pages/about.html'
                }
            ]
        });

        tplRates = Template7.compile($$('#tplRates').html());

        $$(document).on('page:init', '.page[data-name="search"]', function (e) {

            search_searchbar = app.searchbar.create({
                el: '.searchbar',
                searchContainer: '.app-rates-container',
                searchIn: '.item-title'
            });

            search_calendar = app.calendar.create({
                inputEl: '#search-calendar',
                openIn: 'sheet',
                header: true,
                footer: true,
                dateFormat: 'MM dd yyyy',

                monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],

                monthNamesShort: ['Янв', 'Февр', 'Март', 'Апр', 'Май', 'Июнь',
                    'Июль', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек'],

                dayNames: ['Воскреснье', 'Понедельник', 'Вторник', 'Среда',
                    'Четверг', 'Пятница', 'Суббота'],

                dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср',
                    'Чт', 'Пт', 'Сб']
            });

            search_calendar.on('change', function (s, e) {

                if (e && e.length > 0) {

                    var d = e[0];
                    var dparam = d.getFullYear()
                        + ("0" + (d.getMonth() + 1)).slice(-2)
                        + ("0" + d.getDate()).slice(-2);

                    appObject.queryNB(dparam);
                }
            });

            search_calendar.setValue([new Date()]);

        });

        $$(document).on('page:beforeremove', '.page[data-name="search"]', function (e) {

            if (search_searchbar) {
                app.searchbar.destroy(search_searchbar);
                search_searchbar = null;
            }

            if (search_calendar) {
                app.calendar.destroy(search_calendar);
                search_calendar = null;
            }

            appObject.disposeSearchDialogs();
        });

    },

    queryNB: function (dparam) {

        app.request({

            url: 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=' + dparam + '&json',
            async: true,
            method: 'GET',
            cache: false,
            contentType: 'text/plain',
            dataType: 'json',

            beforeSend: function (xhr) {
                appObject.disposeSearchDialogs();
                search_dialog_nbwait = app.dialog.preloader('Получение данных ...');
                $$('#rates-search-found').html('');
                return true;
            },

            success: function (data, status, xhr) {
                appObject.disposeSearchDialogs();
                $$('#rates-search-found').html(tplRates({ rates: data }));
            },

            error: function (xhr, status) {
                appObject.disposeSearchDialogs();
                search_dialog_alert = app.dialog.alert('Нет связи с сервером. Восстановите связь, и повторите попытку',
                    'Ошибка ' + status,
                    function () {
                        appObject.queryNB(dparam);
                    });
                search_dialog_alert.open();
            },

            complete: function (xhr, status) {
                appObject.disposeSearchDialogs();
            }

        });

    },

    disposeSearchDialogs: function () {
        if (search_dialog_nbwait) {
            search_dialog_nbwait.close();
            search_dialog_nbwait.destroy();
            search_dialog_nbwait = null;
        }

        if (search_dialog_alert) {
            search_dialog_alert.close();
            search_dialog_alert.destroy();
            search_dialog_alert = null;
        }
    }

};
