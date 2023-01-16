async function btnCountriesHtml() {

    modal(true)
  
    var objSht = await openShts(
      [
        { title: "Trips", type: "all" }
      ])
  
    console.log('objSht', objSht)
  
    resTitle = "Trips"
    
    resHdrs = objSht[resTitle].colHdrs
    resVals = objSht[resTitle].vals
    
    var monthCol = resHdrs.indexOf('Month')
    var tripCol  = resHdrs.indexOf('Trip')
    var cntryCol = resHdrs.indexOf('Countries')
    var strDtCol = resHdrs.indexOf('Start Date')
    var endDtCol = resHdrs.indexOf('End Date')
    var destCol  = resHdrs.indexOf('Destinations')
    var typeCol  = resHdrs.indexOf('Type')
    
    var vals = resVals

    var arr = []
    var cntryCnt = {}
  
    for (var i=0;i<vals.length;i++) {
  
        var month = vals[i][monthCol]
        var cntries = vals[i][cntryCol]
        var trip = vals[i][tripCol]
        var dateRng = vals[i][strDtCol].slice(0,-5) + ' - ' + vals[i][endDtCol].slice(0,-5)
        var dest = JSON.parse(vals[i][destCol])
        var countries = JSON.parse(cntries)
        var domestic = JSON.parse(vals[i][typeCol]).indexOf('Domestic') > -1
        
            countries.forEach(ele => {

                var sortkey = parseMonth(month)
                arr.push([ele, trip, month, sortkey, dateRng, dest, countries])

            })

            countries.forEach((el) => {
                if (domestic) cntryCnt['United States of America'] = 1  + (cntryCnt["United States of America"] || 0)
                else          cntryCnt[el] = 1  + (cntryCnt[el] || 0)
            })
            
    }

    console.log('cntryCnt', cntryCnt)
  
    arr.sort(countrySorter(0, 3));

    var treeData = []
    var brkcntry

    for (var i=0;i<arr.length;i++) {

        var ele = arr[i]

        var cntry = ele[0]
        var trip = ele[1]
        var month = ele[2]
        var dates = ele[4]
        var dests = ele[5].join(' - ')
        var cntys = ele[6].join(' - ')

        if (brkcntry != cntry) {

            if (brkcntry) treeData.push(cntryObj)

            brkcntry = cntry

            var cntryObj = {

                text:   cntry,
                class:  (convertStateToAbbr(cntry) ? "cntTreeitem text-success h4" : "cntTreeitem text-primary h4"),
                nodes:  []

            }

        }

        cntryObj.nodes.push({

            text:   month + ' - ' + trip,
            class:  "h6",
            nodes: [

                {
                    text: dates,
                    class:  "h6"
                },
                {
                    text: dests,
                    class:  "h6"
                },
                {
                    text: cntys,
                    class:  "h6"
                }

            ]

        })

    }

    if (cntryObj) treeData.push(cntryObj)
    
    nbrDom = 0
    nbrIntl = 0

    for (var i = 0; i < treeData.length;i++) {

        var ele = treeData[i]

        var cntry = ele.text

        if (convertStateToAbbr(ele.text))       nbrDom++
        else                                    nbrIntl++

        ele.text = ele.text + '<span class="text-warning float-end">' + ele.nodes.length + '</span>'

    }

    $("#cntNbrTrips").html(nbrDom + ' domestic - ' + nbrIntl + ' international')
    // $("#cntNbrIntl").html(nbrIntl)
    

    $('#cntContainer').bstreeview({ data: treeData });

    var srchVal = $("#cntSearch").val().toLowerCase()
    var exc = false
  
    if (srchVal) {

        $(".cntTreeitem").filter(function() {

            var txt = $(this).text().toLowerCase()

            if (exc)    var toggle = txt.indexOf(srchVal.substring(1)) == -1
            else        var toggle = txt.indexOf(srchVal) > -1

            $(this).toggle(toggle)

        });

        // $("#resNbr").html(countDisplayed("resContainer"))

    };

    await loadMap(cntryCnt)

      modal(false)
      gotoTab("Countries")
}

function countrySorter(firstKey, secondKey) {
    return function(a, b) {  
        if (a[firstKey] < b[firstKey]) {  
            return -1;  
        } else if (a[firstKey] > b[firstKey]) {  
            return 1;  
        }  
        else {
            if (a[secondKey] > b[secondKey]) {  
                return -1;  
            } else if (a[secondKey] < b[secondKey]) {  
                return 1;  
            } else {
                return 0;
            }
        } 
    }  
}

async function loadMap(cntryCnt) {

    const cNames = ['Faroe Islands', 'United States Minor Outlying Islands', 'United States of America', 'Japan', 'Seychelles', 'India', 'France', 'Federated States of Micronesia', 'China', 'Serranilla Bank', 'Scarborough Reef', 'Brazil', 'Ecuador', 'Australia', 'Kiribati', 'Philippines', 'Mexico', 'Spain', 'Bajo Nuevo Bank (Petrel Is.)', 'Maldives', 'Spratly Islands', 'UK', 'Greece', 'American Samoa', 'Denmark', 'Greenland', 'Guam', 'Northern Mariana Islands', 'Puerto Rico', 'Virgin Islands', 'Canada', 'Sao Tome and Principe', 'Cape Verde', 'Dominica', 'Netherlands', 'Yemen', 'Jamaica', 'Samoa', 'Oman', 'Saint Vincent and the Grenadines', 'Turkey', 'Bangladesh', 'Solomon Islands', 'Saint Lucia', 'Nauru', 'Norway', 'Saint Kitts and Nevis', 'Bahrain', 'Tonga', 'Finland', 'Indonesia', 'Mauritius', 'Sweden', 'Trinidad and Tobago', 'Malaysia', 'The Bahamas', 'Palau', 'Tuvalu', 'Marshall Islands', 'Chile', 'Thailand', 'Grenada', 'Estonia', 'Antigua and Barbuda', 'Taiwan', 'Barbados', 'Italy', 'Malta', 'Papua New Guinea', 'Vanuatu', 'Singapore', 'Cyprus', 'Comoros', 'Fiji', 'Russia', 'Vatican', 'San Marino', 'Kazakhstan', 'Azerbaijan', 'Armenia', 'Tajikistan', 'Lesotho', 'Uzbekistan', 'Portugal', 'Morocco', 'Colombia', 'East Timor', 'United Republic of Tanzania', 'Cambodia', 'Argentina', 'Saudi Arabia', 'Pakistan', 'United Arab Emirates', 'Kenya', 'Peru', 'Dominican Republic', 'Haiti', 'Angola', 'Mozambique', 'Panama', 'Costa Rica', 'Iran', 'El Salvador', 'Guinea Bissau', 'Croatia', 'Belize', 'South Africa', 'Namibia', 'Central African Republic', 'Sudan', 'Libya', 'Democratic Republic of the Congo', 'Kuwait', 'Germany', 'Ireland', 'North Korea', 'South Korea', 'Guyana', 'Honduras', 'Myanmar', 'Gabon', 'Equatorial Guinea', 'Nicaragua', 'Uganda', 'Malawi', 'Turkmenistan', 'Somaliland', 'Zambia', 'Northern Cyprus', 'Mauritania', 'Algeria', 'Lithuania', 'Ethiopia', 'Eritrea', 'Ghana', 'Slovenia', 'Guatemala', 'Bosnia and Herzegovina', 'Jordan', 'Syria', 'Monaco', 'Albania', 'Uruguay', 'Cyprus No Mans Area', 'Mongolia', 'Rwanda', 'Somalia', 'Bolivia', 'Cameroon', 'Republic of Congo', 'Western Sahara', 'Serbia', 'Montenegro', 'Benin', 'Nigeria', 'Togo', 'Laos', 'Afghanistan', 'Ukraine', 'Slovakia', 'Siachen Glacier', 'Bulgaria', 'Qatar', 'Liechtenstein', 'Austria', 'Swaziland', 'Hungary', 'Romania', 'Luxembourg', 'Andorra', 'Ivory Coast', 'Liberia', 'Brunei', 'Belgium', 'Iraq', 'Georgia', 'Gambia', 'Switzerland', 'Chad', 'Kosovo', 'Lebanon', 'Djibouti', 'Burundi', 'Suriname', 'Israel', 'Mali', 'Senegal', 'Guinea', 'Zimbabwe', 'Poland', 'Macedonia', 'Paraguay', 'Belarus', 'Latvia', 'Burkina Faso', 'Niger', 'Tunisia', 'Bhutan', 'Moldova', 'South Sudan', 'Botswana', 'New Zealand', 'Cuba', 'Venezuela', 'Vietnam', 'Sierra Leone', 'Madagascar', 'Iceland', 'Egypt', 'Sri Lanka', 'Czeck Republic', 'Kyrgyzstan', 'Nepal']
    const cCodes = ['fo', 'um', 'us', 'jp', 'sc', 'in', 'fr', 'fm', 'cn', 'sw', 'sh', 'br', 'ec', 'au', 'ki', 'ph', 'mx', 'es', 'bu', 'mv', 'sp', 'gb', 'gr', 'as', 'dk', 'gl', 'gu', 'mp', 'pr', 'vi', 'ca', 'st', 'cv', 'dm', 'nl', 'ye', 'jm', 'ws', 'om', 'vc', 'tr', 'bd', 'sb', 'lc', 'nr', 'no', 'kn', 'bh', 'to', 'fi', 'id', 'mu', 'se', 'tt', 'my', 'bs', 'pw', 'tv', 'mh', 'cl', 'th', 'gd', 'ee', 'ag', 'tw', 'bb', 'it', 'mt', 'pg', 'vu', 'sg', 'cy', 'km', 'fj', 'ru', 'va', 'sm', 'kz', 'az', 'am', 'tj', 'ls', 'uz', 'pt', 'ma', 'co', 'tl', 'tz', 'kh', 'ar', 'sa', 'pk', 'ae', 'ke', 'pe', 'do', 'ht', 'ao', 'mz', 'pa', 'cr', 'ir', 'sv', 'gw', 'hr', 'bz', 'za', 'na', 'cf', 'sd', 'ly', 'cd', 'kw', 'de', 'ie', 'kp', 'kr', 'gy', 'hn', 'mm', 'ga', 'gq', 'ni', 'ug', 'mw', 'tm', 'sx', 'zm', 'nc', 'mr', 'dz', 'lt', 'et', 'er', 'gh', 'si', 'gt', 'ba', 'jo', 'sy', 'mc', 'al', 'uy', 'cnm', 'mn', 'rw', 'so', 'bo', 'cm', 'cg', 'eh', 'rs', 'me', 'bj', 'ng', 'tg', 'la', 'af', 'ua', 'sk', 'jk', 'bg', 'qa', 'li', 'at', 'sz', 'hu', 'ro', 'lu', 'ad', 'ci', 'lr', 'bn', 'be', 'iq', 'ge', 'gm', 'ch', 'td', 'kv', 'lb', 'dj', 'bi', 'sr', 'il', 'ml', 'sn', 'gn', 'zw', 'pl', 'mk', 'py', 'by', 'lv', 'bf', 'ne', 'tn', 'bt', 'md', 'ss', 'bw', 'nz', 'cu', 've', 'vn', 'sl', 'mg', 'is', 'eg', 'lk', 'cz', 'kg', 'np']

    var cntryData = []
    for (var key in cntryCnt) {

        var idx = cNames.indexOf(key)

        if (idx > -1) cntryData.push([cCodes[idx], cntryCnt[key]])
        else console.log('bad cntry', key, cntryCnt[key])
            
      }

    // const topology = await fetch(
    //     'https://code.highcharts.com/mapdata/custom/world-highres2.topo.json'
    // ).then(response => response.json());


        console.log('data', cntryData)

        // Initialize the chart
        Highcharts.mapChart('mapContainer', {
            chart: {
                map: 'custom/world-robinson-highres'
            },
    
            title: {
                text: 'Double-click to zoom in'
            },
    
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            colorAxis: {
                min: 1,
                max: 10,
                type: 'logarithmic',
                gridLineWidth: 2,
                gridLineColor: 'white',
                minorTickInterval: 0.1,
                minorGridLineColor: 'white',
                tickLength: 0,
                minColor: '#F1EEF6',
                maxColor: '#900037'
            },


            tooltip: {
                valueSuffix: ' trips'
            },
    
            series: [{
                data: cntryData,
                name: '',
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                }
            }]
        });
    
  

}