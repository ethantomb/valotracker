//Handles page events
/**
 * Search button click response.
 */
var selectedRegion = "NA";
 async function handleSearchButton() {
    document.getElementById("search").innerHTML = "Searching...";
    let input = document.getElementById("playerName").value;
    let name = input.split("#")[0];
    let tag = input.split("#")[1];
    document.querySelectorAll('.infoCard').forEach((div) => {
        div.style.animation = "";
    });
    await sleep(1);
    let tStart = performance.now();
    await searchPlayer(name, tag,selectedRegion);
}
function setRegion(region){
    //Set selected region to region, make hover color stick to indicate selection
    let regions = ["NA","EU","AP","KR"];
    if(selectedRegion!=region){
        selectedRegion=region;
        for (r of regions){
            document.getElementById(r).style.backgroundColor=`#364966`;

        }
        document.getElementById(region).style.backgroundColor=`#7baaf0`;

    }
}
async function fillDivs(data) {


    for (let [mode, gameDat] of Object.entries(data)) {
        if (mode != "Metadata") {

            mode = mode.replace(" ", "");
            document.getElementById(mode).querySelector(`span[name="matchPlayed"]`).innerHTML = gameDat["games"];

            document.getElementById(mode).querySelector(`span[name="win"]`).innerHTML = gameDat["wins"];
            if (gameDat["games"] != 0) {
                document.getElementById(mode).querySelector(`span[name="avgKDA"]`).innerHTML = Math.round(gameDat["K"] / gameDat["games"]) + "/" + Math.round(gameDat["D"] / gameDat["games"]) + "/" + Math.round(gameDat["A"] / gameDat["games"]);
                document.getElementById(mode).querySelector(`span[name="bestKDA"]`).innerHTML = Math.round(gameDat["bestK"]) + "/" + Math.round(gameDat["bestD"]) + "/" + Math.round(gameDat["bestA"]) + "(" + (gameDat["wonBestMatch"] ? "Won" : "Lost") + ")";

            } else {
                document.getElementById(mode).querySelector(`span[name="avgKDA"]`).innerHTML = Math.round(gameDat["K"]) + "/" + Math.round(gameDat["D"]) + "/" + Math.round(gameDat["A"]);
                document.getElementById(mode).querySelector(`span[name="bestKDA"]`).innerHTML = Math.round(gameDat["bestK"]) + "/" + Math.round(gameDat["bestD"]) + "/" + Math.round(gameDat["bestA"]) + "(" + (gameDat["wonBestMatch"] ? "Won" : "Lost") + ")";

            }
            document.getElementById(mode).style.animation = "slideIn 1s linear 0s 1 normal forwards";
        }
    }

    document.getElementById("search").innerHTML = "Search";
}

async function addRankCard(rank,rankImsrc){
    document.getElementById("rankText").innerHTML = rank;
    document.getElementById("rankImage").src = rankImsrc;
    document.getElementById("rankInfoCard").style.animation = "slideIn 1s linear 0s 1 normal forwards";
}
window.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        handleSearchButton();
    }
});