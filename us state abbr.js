const _MapAbbrFullName = {"AZ":"Arizona","AL":"Alabama","AK":"Alaska","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DC":"District of Columbia","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","AB":"Alberta","BC":"British Columbia","MB":"Manitoba","NB":"New Brunswick","NF":"Newfoundland","NT":"Northwest Territory","NS":"Nova Scotia","NU":"Nunavut","ON":"Ontario","PE":"Prince Edward Island","QC":"Quebec","SK":"Saskatchewan","YT":"Yukon"};

const _MapFullNameAbbr = {"arizona":"AZ","alabama":"AL","alaska":"AK","arkansas":"AR","california":"CA","colorado":"CO","connecticut":"CT","districtofcolumbia":"DC","delaware":"DE","florida":"FL","georgia":"GA","hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA","kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD","massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS","missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV","newhampshire":"NH","newjersey":"NJ","newmexico":"NM","newyork":"NY","northcarolina":"NC","northdakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR","pennsylvania":"PA","rhodeisland":"RI","southcarolina":"SC","southdakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT","virginia":"VA","washington":"WA","westvirginia":"WV","wisconsin":"WI","wyoming":"WY","alberta":"AB","britishcolumbia":"BC","manitoba":"MB","newbrunswick":"NB","newfoundland":"NF","northwestterritory":"NT","novascotia":"NS","nunavut":"NU","ontario":"ON","princeedwardisland":"PE","quebec":"QC","saskatchewan":"SK","yukon":"YT"}

function convertStateToAbbr(input) {
  if(input === undefined) return input;
  var strInput = input.trim();
  if(strInput.length === 2) {
    // already abbr, check if it's valid
    var upStrInput = strInput.toUpperCase();
    return input;
  }
  var strStateToFind = strInput.toLowerCase().replace(/\ /g, '');
  var foundAbbr = _MapFullNameAbbr[strStateToFind];
  return foundAbbr;
}

function convertStateToFullName(input) {
  if(input === undefined) return input;
  var strInput = input.trim();
  if(strInput.length !== 2) {
    // already full name, return formatted fullname
    return input;
  }
  var strStateToFind = strInput.toLowerCase().replace(/\ /g, '');
  var foundFullName = _MapAbbrFullName[strStateToFind];
  return foundFullName ;
}
