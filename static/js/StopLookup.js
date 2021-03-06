const transitOptions = document.getElementById('transit-options');
const search = document.getElementById('search');
const matchList = document.getElementById('match-list');
const routeOptions = document.getElementById('route-options-container');
const directionOptions = document.getElementById('direction-options-container');
const stopID = document.getElementById('stopid');
const routeID = document.getElementById('routeid');
const directionName = document.getElementById('direction-name');


const searchStops = async searchText => {
    document.getElementById('route-options-container').style.display = "none";
    document.getElementById('direction-options-container').style.display = "none";
    document.getElementById('direction-options-container').style.display = "none";
    document.getElementById('submit-button').style.display = "none";
    if (matchList.style.display == 'none') {
        matchList.style.display = 'block'
    };

    let transitMode = document.getElementById('transit-options').value;
    var transitModeDict = {'subway': '0,1', 'commuter-rail': '2', 'bus': '3', 'ferry': '4'};
    let stops_url = ''
    if (transitMode !== 'bus' && transitMode !== '') {
        let routes_url = `https://api-v3.mbta.com/routes?filter[type]=${transitModeDict[transitMode]}`;
        const routes_res = await fetch(routes_url).then(res => res.json());
        let routes_data = routes_res.data;
        let route_ids = routes_data.map(route => route.id);
        console.log(route_ids);
        stops_url = `https://api-v3.mbta.com/stops?filter[route]=${route_ids}`;
    }
    else {
        stops_url = `https://api-v3.mbta.com/stops?filter[route_type]=${transitModeDict[transitMode]}`;
    }

    console.log(stops_url);
    const stops_res = await fetch(stops_url);
    const stops = await stops_res.json();
    console.log(stops);


    let matches = stops.data.filter(stop => {
        const regex = new RegExp(`${searchText}`, 'gi');
        return stop.attributes.name.match(regex) // || stop.attributes.description.match(regex);
    });

    if (searchText.length === 0) {
        matches = [];
        matchList.innerHTML = '';
    }

    if (matches.length === 0) {
        matchList.innerHTML = '';
    }

    outputHtml(matches);
};

//Show results in html
const outputHtml = matches => {
    if(matches.length > 0) {
        const html = matches.map(match => `
            <div class="card card-body" onclick="populateSearch()" data-stopid="${match.id}">
                <div data-stopid="${match.id}">
                    <span class="text-primary" data-stopid="${match.id}"><b>Name:</b> ${match.attributes.name}<br><b>Address:</b> ${match.attributes.address}<br></span>
                </div>
            </div>
        `).join('');            
        matchList.innerHTML = html; // Note for later to try and understand why not to do this.
    }
}

function populateSearch(route_array) {
    let transitMode = document.getElementById('transit-options').value;
    var transitModeDict = {'subway': '0,1', 'commuter-rail': '2', 'bus': '3', 'ferry': '4'};
    var x = event.clientX, y = event.clientY,
    elementMouseIsOver = document.elementFromPoint(x, y);
    stopID.value = elementMouseIsOver.dataset.stopid;
    let re = /Name:\s(.*)Address/;
    let stopContent = elementMouseIsOver.textContent.match(re)[1];
    document.getElementById('search').value = stopContent;
    matches = [];
    matchList.innerHTML = '';
    routeOptions.style.display = 'block';
    if (matchList.style.display != 'none') {
        matchList.style.display = 'none';
    }
    let routes = fetch(`https://api-v3.mbta.com/routes?filter[stop]=${elementMouseIsOver.dataset.stopid}&filter[type]=${transitModeDict[transitMode]}`);
    routes.then(
        (route) => route.json()
        ).then(
            (route) => {
                let route_names = [['Select a Route', -1]];
                for (var i = 0; i < route.data.length; i++){
                    route_names.push([route.data[i].attributes.long_name, i, route.data[i].attributes.direction_names, route.data[i].id]);
                }
                return route_names;
            }).then(
                (route_names) => route_names.map(route_name => `
                    <option value="${route_name[1]}" data-direction-names="${route_name[2]}" data-routeid="${route_name[3]}">${route_name[0]}</option>
                `).join('')        
            ).then(
                (route_option_tags) => document.getElementById('route-options').innerHTML = route_option_tags
            );
}

function populateDirections(routes) {
    const routeName = document.getElementById('route-name');

    let options = routeOptions.children[1].children;
    let route_index = Number(routeOptions.children[1].value) + 1;
    let route_name = routeOptions.children[1].children[route_index].innerText;
    routeName.value = route_name;

    let directions_html = '<option value="-1">Select a Direction</option>';
    if (route_index > -1) {
            let directions = options[route_index].dataset.directionNames.split(',');
            for (i = 0; i < directions.length; i++){
                directions_html += `<option value="${i}">${directions[i]}</option>`
            }
        }
        document.getElementById('direction-options').innerHTML = directions_html;
        directionOptions.style.display = 'block';
        routeID.value = options[route_index].dataset.routeid;
    }
    

function showButton() {
    const directionName = document.getElementById('direction-name');
    let directionNameId = Number(directionOptions.children[1].value) + 1;
    const submitButton = document.getElementById('submit-button');
    directionName.value = directionOptions.children[1].children[directionNameId].textContent;
    submitButton.style.display = "block";
    submitButton.disabled = false;
}

transitOptions.addEventListener('change', () => searchStops(search.value));
search.addEventListener('input', () => searchStops(search.value));

