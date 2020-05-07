document.getElementById('keepersButton').onclick = downloadKeepersCSV

function downloadKeepersCSV () {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {data: "create-keepers-csv"}, function(response) {
            if (response.success) {
                alert("CSV has been created.")
            }
        })
    })
}
