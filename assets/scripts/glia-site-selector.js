window.gliaDemo = {};
window.gliaContextSessionItemKey = window.gliaContextSessionItemKey ?? "gliaContextSession";

window.gliaDemo.sites = [
    { id: '', name: '' },
    { id: 'e501268f-9055-4133-a379-64f2a85c08d6', name: 'Glia Demo Universal - Digital', code: "demo_digital" },
    { id: '209c6db0-4f0c-4002-bf09-0e9b57e701c3', name: 'Glia Demo Universal - Phone', code: "demo_phone" },
    { id: '19243c86-8fb5-4841-9b16-5567adaec1b9', name: 'Glia SE 1 - Demo', code: "se1_demo" },
    { id: '8737a7ef-0aff-4b24-a4b4-dac24e35a21c', name: 'Glia SE 2 - Demo', code: "se2_demo" },
    { id: 'b23158b9-4c19-4858-99f1-85155540f80c', name: 'Glia SE 3 - Demo', code: "se3_demo" },
    { id: '18ad232b-bf58-4cb7-99c6-c0b2b1d47d51', name: 'Glia SE 4 - Demo', code: "se4_demo" },
    { id: 'e31cf5bc-7d87-4495-ad9b-3c104b45b3ee', name: 'Glia SE 5 - Demo', code: "se5_demo" },
    { id: '4f629cae-abd6-486d-9140-3bc6506c2d6c', name: 'Glia SE 6 - Demo', code: "se6_demo" },
    { id: 'af76e495-7859-43de-9d3b-a46f83dedb98', name: 'Glia SE 7 - Demo', code: "se7_demo" },
    { id: '07c4fad6-6a45-4673-b164-7bd767633fb9', name: 'Glia SE 8 - Demo', code: "se8_demo" },
    { id: '0062f71e-899d-4c16-b1eb-dd370fbc6e83', name: 'Glia SE 9 - Demo', code: "se9_demo" },
    { id: '70436271-1338-4b36-b07f-8d1c9f3d6d33', name: 'Glia SE 10 - Demo', code: "se10_demo" }
];

function loadSiteSelector() {
    fetch('/assets/site-selector-modal.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);

            $('#siteSelectorModal').on('shown.bs.modal', function () {
                prepSettingsForm();
            });

            $('#siteSelectorDDL').on('change', function () {
                $('#siteIdTXT').val($('#siteSelectorDDL').val());
                validateSiteId();
            });

            $('#siteIdTXT').on('input', function () {
                const textValue = $(this).val().trim();
                if (textValue !== '') {
                    const selectedOption = $('#siteSelectorDDL').find(`option[value="${textValue}"]`);
                    $('#siteSelectorDDL').val(selectedOption.val());
                } else {
                    $('#siteSelectorDDL').val($('#siteSelectorDDL option:first').val());
                }
            });

            $('#siteIdTXT').on('blur', function() {
                validateSiteId();
            });

            $('#saveSettings').on('click', function () {
                const siteIdFieldError = $("#siteid-error");
                siteIdFieldError.hide();
                const siteId = $('#siteIdTXT').val();

                if (validateSiteId()) {
                    const selectedOption = $('#siteSelectorDDL').find(`option[value="${siteId}"]`);

                    const selectedSite = {
                        id: siteId,
                        name: selectedOption.text() !== '' ? selectedOption.text().trim() : siteId
                    }

                    localStorage.setItem('glia_site', JSON.stringify(selectedSite));
                    bootstrap.Modal.getInstance(document.getElementById('siteSelectorModal')).hide();
                    localStorage.removeItem(window.gliaContextSessionItemKey);
                    location.reload();
                }
            });

            function validateSiteId(){
                const siteIdFieldError = $("#siteid-error");
                siteIdFieldError.hide();
                const siteId = $('#siteIdTXT').val();
                
                if (!siteId || !isUUID(siteId)) {
                    siteIdFieldError.text(siteId ? "Site Id Must Be a Valid UUID" : "Site Id is required");
                    siteIdFieldError.show();
                    return false;
                }

                return true;
            }
        });
}

async function prepSettingsForm() {
    await buildSelectOptionsAsync('siteSelectorDDL');
    const gliaSiteRaw = localStorage.getItem('glia_site');
    const gliaSite = JSON.parse(gliaSiteRaw);
    
    if (gliaSite) {
        const siteSelectorDDL = $('#siteSelectorDDL');
        const siteIdTXT = $('#siteIdTXT');
        if (siteSelectorDDL.find(`option[value="${gliaSite.id}"]`).length > 0) {
            siteSelectorDDL.val(gliaSite.id);
            siteIdTXT.val(gliaSite.id);
        } else {
            siteSelectorDDL.val(siteSelectorDDL.find('option:first').val());
            siteIdTXT.val(gliaSite.id);
        }
    }
}

async function buildSelectOptionsAsync(selectId) {
    return new Promise((resolve) => {
        const $select = $('#' + selectId);
        $select.empty();
        window.gliaDemo.sites.forEach(opt => {
            $select.append($('<option>', {
                value: opt.id,
                text: opt.name
            }));
        });
        resolve();
    });
}

function getQueryParam(paramName) {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);

    for (const [key, value] of params.entries()) {
        if (key === paramName) {
            return value;
        }
    }

    return null;
}

function isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

function init() {
    const siteParam = getQueryParam("glia_site");

    if (siteParam) {
        let selectedSite = window.gliaDemo.sites.find(
            site => site.id === siteParam || site.code === siteParam
        );

        if (!selectedSite && isUUID(siteParam)) {
            selectedSite = { id: siteParam, name: "Manual Demo" };
        }

        if (selectedSite) {
            localStorage.setItem('glia_site', JSON.stringify(selectedSite));
        }
    }

    loadSiteSelector();
    
    document.addEventListener('DOMContentLoaded', function() {
        const settingsLink = document.getElementById('settings-link');
        if (settingsLink) {
            settingsLink.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('siteSelectorModal'));
                modal.show();
            });
        }
        
        const gliaSiteRaw = localStorage.getItem('glia_site');
        const gliaSiteElement = document.getElementById('glia-site');
        if (gliaSiteElement) {
            const gliaSite = JSON.parse(gliaSiteRaw);
            if (gliaSite) {
                gliaSiteElement.textContent = gliaSite.name;
            }
        }
    });
}

init();
