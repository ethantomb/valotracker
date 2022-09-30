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
async function httpGet(url) {
    let response = await fetch(url, {
        headers: {
            "Content-Type": "text"
        }
    });
    let data = await response.json();
    console.log(data);
    return data;
}

/**
 * Search button click response.
 */
async function search() {
    document.getElementById("search").innerHTML = "Searching...";
    
    
    let input = document.getElementById("playerName").value;
    let name = input.split("#")[0];
    let tag = input.split("#")[1];
    await sleep(1);
    let tStart = performance.now();
    await searchPlayer(name, tag);

}
/**
 * Search player
 * @param {*} name - The player's name
 * @param {*} tag  - The player's tag.
 * @returns - nada
 */
async function searchPlayer(name, tag) {


    //Normalize name.
    name = name.replace(" ", "%20");
    document.querySelectorAll('.infoCard').forEach((div)=>{
        div.style.animation="";
    });
    let region = document.querySelector('input[name="region"]:checked').value;
    if (!name || !tag) {
        
        console.log("err");
        document.getElementById("rankText").innerHTML = `Error: You gotta add a name#tag.`;
        
        document.getElementById("rankInfoCard").style.animation="slideIn 4s ease 0s 1 normal forwards";
                
        document.getElementById("search").innerHTML = "Search";
        return;
    }
    const O = '{"games":0,"wins":0,"K":0,"D":0,"A":0,"bestKD":-1,"bestK":0,"bestD":0,"bestA":0,"wonBestMatch":false}'
    //My simple object to store the data.
    var data = { "Metadata": { "Name": "", "Rank": "" }, "Unrated": JSON.parse(O), "Competitive": JSON.parse(O), "Deathmatch": JSON.parse(O), "Spike Rush": JSON.parse(O), "Replication": JSON.parse(O), "Escalation": JSON.parse(O) };
    var ign;
    categories = ["escalation", "spikerush", "deathmatch", "competitive", "unrated", "replication"]
    var url = mmrURL + region + "/" + name + "/" + tag;
    fetch(mmrURL + region + "/" + name + "/" + tag, {
        headers: {
            "Content-Type": "text"
        }
    }).then((promiseMMR) => {

        promiseMMR.json().then((mmrdata) => {
            if(mmrdata.status!=200){
                console.log("err");
                document.getElementById("rankText").innerHTML = `Error: Failed to find player named ${name}#${tag}`;

                document.getElementById("rankInfoCard").style.animation="slideIn 4s ease 0s 1 normal forwards";
                document.getElementById("search").innerHTML = "Search";
                return;
            }

            

            let rank = mmrdata["data"]["currenttierpatched"];
            ign = mmrdata["data"]["name"];
            document.getElementById("rankText").innerHTML = rank;
            if (rank != null) {
                document.getElementById("rankImage").src = mmrdata["data"]["images"]["small"];
            }
            document.getElementById("rankInfoCard").style.animation="slideIn 4s ease 0s 1 normal forwards";

        });

    });
    for (gamemode of categories) {
        fetch(matchHistURL + region + "/" + name + "/" + tag + "?filter=" + gamemode, {
            headers: {
                "Content-Type": "text"
            }
        }).then((gamesPromise) => {
            gamesPromise.json().then((games) => {

                games=games["data"]
                
                
                //let games = await httpGet(matchHistURL + region + "/" + name + "/" + tag + "?filter=" + gamemode)["data"];
                let thisK, thisD, thisA;
                
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
                            data[mode]["wonBestMatch"] = gamemode == "deathmatch" ? (thisK == 40) : (searchedPlayer["team"] == winTeam);

                        }

                    }
                }
                if(gamemode=="replication"){
                    fillDivs(data);
                }
                
            });
        });
    }
    
    

}
async function fillDivs(data){
    
    
    for (let [mode, gameDat] of Object.entries(data)) {
        if (mode != "Metadata") {
            
            mode=mode.replace(" ","");
            document.getElementById(mode).querySelector(`span[name="matchPlayed"]`).innerHTML = gameDat["games"];
            
            document.getElementById(mode).querySelector(`span[name="win"]`).innerHTML = gameDat["wins"];
            if (gameDat["games"] != 0) {
                document.getElementById(mode).querySelector(`span[name="avgKDA"]`).innerHTML = Math.round(gameDat["K"]/gameDat["games"]) + "/" + Math.round(gameDat["D"]/gameDat["games"]) + "/" + Math.round(gameDat["A"]/gameDat["games"]);
                document.getElementById(mode).querySelector(`span[name="bestKDA"]`).innerHTML = Math.round(gameDat["bestK"]) + "/" + Math.round(gameDat["bestD"]) + "/" + Math.round(gameDat["bestA"]) + "(" + (gameDat["wonBestMatch"] ? "Won" : "Lost") + ")";

            }else{
                document.getElementById(mode).querySelector(`span[name="avgKDA"]`).innerHTML = Math.round(gameDat["K"]) + "/" + Math.round(gameDat["D"]) + "/" + Math.round(gameDat["A"]);
                document.getElementById(mode).querySelector(`span[name="bestKDA"]`).innerHTML = Math.round(gameDat["bestK"]) + "/" + Math.round(gameDat["bestD"]) + "/" + Math.round(gameDat["bestA"]) + "(" + (gameDat["wonBestMatch"] ? "Won" : "Lost") + ")";

            }
            document.getElementById(mode).style.animation="slideIn 4s ease 0s 1 normal forwards";
        }
    }
    
    document.getElementById("search").innerHTML = "Search";
}

window.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        search();
    }
});

