function togglelocale() {
    var s = document.getElementById('spanishLocale');
    if (s.style.display == 'block') {
        s.style.display = 'none';
        sm.getApi({ version: 'v1' }).then(function (api) { api.setLocale('es-MX') });
        sm.logger.log("Spanish app loaded");
    } else
        s.style.display = 'block';

    var e = document.getElementById('englishLocale');
    if (e.style.display == 'block') {
        e.style.display = 'none';
        sm.getApi({ version: 'v1' }).then(function (api) { api.setLocale('en-US') });
        sm.logger.log("English app loaded");
    } else
        e.style.display = 'block';
}