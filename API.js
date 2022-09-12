/**
 * Valorant Stats Tracker by Ethan. 
 * This is a simple player lookup website built ontop of henrikdev's API.
 * All credit goes to henrikdev for the API.
 */

//Base api endpoints
var mmrURL = "https://api.henrikdev.xyz/valorant/v1/mmr/";
var matchHistURL = "https://api.henrikdev.xyz/valorant/v3/matches/";
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * A xmlhttprequest wrapper. Ill make it async later.
 * @param {string} url 
 * @returns 
 */
function httpGet(url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false); // false for synchronous request
    request.setRequestHeader("Content-Type", "text");
    request.send(null);
    return request.responseText;
}
/**
 * The function's name describes its function.
 */
function clearTable() {
    document.querySelectorAll('td').forEach(e => e.innerHTML = "");
}
/**
 * Search button click response.
 */
async function search() {
    document.getElementById("search").innerHTML = "Searching...";
    let name = document.getElementById("playerName").value;
    let tag = document.getElementById("playerTag").value;
    await sleep(1);
    let tStart = performance.now();
    searchPlayer(name, tag);
    let t = performance.now() - tStart;
    console.log(`Search completed in ${t} ms.`)
    document.getElementById("search").innerHTML = "Search";

}
/**
 * Search player
 * @param {*} name - The player's name
 * @param {*} tag  - The player's tag.
 * @returns - nada
 */
function searchPlayer(name, tag) {
    clearTable();

    //Normalize name.
    name = name.replace(" ", "%20");

    let region = document.querySelector('input[name="region"]:checked').value;
    if (name == "" || tag == "") {
        document.getElementById("search").innerHTML = "Search";
        return;
    }
    const O = '{"games":0,"wins":0,"K":0,"D":0,"A":0,"bestKD":-1,"bestK":0,"bestD":0,"bestA":0,"wonBestMatch":false}'
    //My simple object to store the data.
    var data = { "Metadata": { "Name": "", "Rank": "" }, "Unrated": JSON.parse(O), "Competitive": JSON.parse(O), "Deathmatch": JSON.parse(O), "Spike Rush": JSON.parse(O), "Replication": JSON.parse(O), "Escalation": JSON.parse(O) };

    categories = ["escalation", "spikerush", "deathmatch", "competitive", "unrated", "replication"]

    let mmrdata = JSON.parse(httpGet(mmrURL + region + "/" + name + "/" + tag));
    if (mmrdata["status"] != 200) {
        document.getElementById("rank").innerHTML = "An Error Has Occured: " + mmrdata["status"] + " " + mmrdata["errors"][0]["message"];
        document.getElementById("search").innerHTML = "Search";
        return;
    }
    let rank = mmrdata["data"]["currenttierpatched"];
    let ign = mmrdata["data"]["name"];
    document.getElementById("rank").innerHTML = rank;
    if (rank != null) {
        document.getElementById("rankImg").src = mmrdata["data"]["images"]["small"];
    }
    for (gamemode of categories) {
        let games = JSON.parse(httpGet(matchHistURL + region + "/" + name + "/" + tag + "?filter=" + gamemode))["data"];
        let thisK, thisD, thisA;
        if (games === undefined) {
            //Try again one time to catch 403.
            games = JSON.parse(httpGet(matchHistURL + region + "/" + name + "/" + tag + "?filter=" + gamemode))["data"];
            if (games == undefined) {
                continue;
            }

        }
        for (let i = 0; i < games.length; i++) {

            let mode = games[i]["metadata"]["mode"];
            if (mode != "Custom Game") {


                let winTeam = (games[i]["teams"]["red"]["has_won"] ? "Red" : "Blue");
                data[mode]["games"] += 1;

                let players = games[i]["players"]["all_players"];

                let searchedPlayer = players.filter(p => p["name"] == ign)[0];

                if (searchedPlayer["team"] == winTeam) {
                    data[mode]["wins"] += 1
                }
                thisK = parseInt(searchedPlayer["stats"]["kills"]);
                thisD = parseInt(searchedPlayer["stats"]["deaths"]);
                thisA = parseInt(searchedPlayer["stats"]["assists"]);

                data[mode]["K"] += thisK;
                data[mode]["D"] += thisD;
                data[mode]["A"] += thisA;
                if (thisK / thisD > data[mode]["bestKD"]) {
                    data[mode]["bestKD"] = thisK / thisD;
                    data[mode]["bestK"] = thisK;
                    data[mode]["bestD"] = thisD;
                    data[mode]["bestA"] = thisA;
                    data[mode]["wonBestMatch"] = searchedPlayer["team"] == winTeam;

                }

            }
        }
    }
    for (const [mode, gameDat] of Object.entries(data)) {
        if (mode != "Metadata") {
            document.getElementById(mode + "_G").innerHTML = gameDat["games"];
            document.getElementById(mode + "_W").innerHTML = gameDat["wins"];
            if (gameDat["games"] != 0) {
                gameDat["K"] /= gameDat["games"];
                gameDat["D"] /= gameDat["games"];
                gameDat["A"] /= gameDat["games"];
                document.getElementById(mode + "_KDA").innerHTML = Math.round(gameDat["K"]) + "/" + Math.round(gameDat["D"]) + "/" + Math.round(gameDat["A"]);
                document.getElementById(mode + "_KDAbest").innerHTML = Math.round(gameDat["bestK"]) + "/" + Math.round(gameDat["bestD"]) + "/" + Math.round(gameDat["bestA"]) + "(" + (gameDat["wonBestMatch"] ? "Won" : "Lost") + ")";

            }
        }

    }
    document.getElementById("search").innerHTML = "Search";

}


window.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        search();
    }
});


