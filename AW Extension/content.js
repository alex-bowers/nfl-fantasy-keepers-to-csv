let positionSizes = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 }
let rosters = {}
let csv = ""

function addPositionToCSV(position) {
    csv += `${position},${",".repeat(Object.keys(rosters).length - 1)}\n`

    for (let i = 0; i < positionSizes[position]; i++) {
        csv += `${i + 1},`
        for (const name in rosters) {
            if (rosters.hasOwnProperty(name)) {
                const team = rosters[name];
                csv += `${team[position][i]},`
            }
        }
        csv += '\n'
    }
}

function fillRostersToLimits() {
    for (const name in rosters) {
        if (rosters.hasOwnProperty(name)) {
            const team = rosters[name]
            for (const position in team) {
                for (let i = 0; i < positionSizes[position]; i++) {
                    if (!rosters[name][position][i]) {
                        rosters[name][position].push("")
                    }
                }
            }
        }
    }
}

function formatRosters(team) {
    const playersByPositions = { QB: [], RB: [], WR: [], TE: [], K: [], DEF: [] }

    for (let i = 0; i < team.length; i++) {
        const player = team[i].split(', ')
        if (player.length === 2) {
            const playerName = player[0].replace(/\d+.\s/g, '')
            const playerPosition = player[1].split('-')[0]

            playersByPositions[playerPosition].push(playerName)
        }
    }

    return playersByPositions
}

function getMaxPositionLimits(rosters) {
    for (const name in rosters) {
        if (rosters.hasOwnProperty(name)) {
            const team = rosters[name]
            // Round the limit to the next 5.
            if(team.QB && team.QB.length > positionSizes.QB) positionSizes.QB = Math.ceil(team.QB.length / 5) * 5
            if(team.RB && team.RB.length > positionSizes.RB) positionSizes.RB = Math.ceil(team.RB.length / 5) * 5
            if(team.WR && team.WR.length > positionSizes.WR) positionSizes.WR = Math.ceil(team.WR.length / 5) * 5
            if(team.TE && team.TE.length > positionSizes.TE) positionSizes.TE = Math.ceil(team.TE.length / 5) * 5
            if(team.K && team.K.length > positionSizes.K) positionSizes.K = Math.ceil(team.K.length / 5) * 5
            if(team.DEF && team.DEF.length > positionSizes.DEF) positionSizes.DEF = Math.ceil(team.DEF.length / 5) * 5
        }
    }
}

function createKeepersCSV() {
    const webPageTable = document.getElementsByClassName('tableWrap')[0].getElementsByTagName('tbody')[0]
    const webPageTableRows = webPageTable.children

    for (let i = 0; i < webPageTableRows.length; i++) {
        const row = webPageTableRows[i].children
        const teamNameRow = row[0].getElementsByClassName('teamImageAndName')[0]
        let teamName = ""

        if (typeof teamNameRow !== 'undefined') {
            teamName = teamNameRow.getElementsByClassName('teamName')[0].text
            const teamKeepers = row[1].innerText
            if (teamName && teamKeepers) {
                rosters[teamName] = formatRosters(teamKeepers.split('\n'))
            }
        }
    }

    // Fill the rosters up until we hit the position limits.
    getMaxPositionLimits(rosters)
    fillRostersToLimits()

    // Create the csv headers.
    csv += `,${Object.keys(rosters).join(',')}\n`

    // Add the roster data to the csv.
    for (const position in positionSizes) {
        addPositionToCSV(position)
    }

    // Download the csv.
    const hiddenElement = document.createElement('a')
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
    hiddenElement.target = '_blank'
    hiddenElement.download = 'rosters.csv'
    hiddenElement.click()
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.data === 'create-keepers-csv') {
        createKeepersCSV()
        sendResponse({ success: true })
    }
})
