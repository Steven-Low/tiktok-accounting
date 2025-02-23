
// Get the button element by its ID (sumButton)
const sumButton = document.getElementById('sumButton');

// Check if the button exists in the DOM
if (sumButton) {
  sumButton.addEventListener('click', function () {
    
    // Get the current active tab in the window
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Execute the content script (processAllPages) in the active tab
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: function() {
          // The processAllPages function should be executed here in the context of the page.
          processAllPages();
        }
      });
    });
  });
}


// Listen for the result message sent from content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'SUM_RESULT') {
    const revenue = message.revenue.toFixed(2);
    const fees = message.fees.toFixed(2);
    const discount = message.discount.toFixed(2);
    const sales = message.sales.toFixed(2);
    const settlement = message.settlement.toFixed(2);

    // Update the popup UI with the results of the sum
    const resultContainer = document.getElementById('result');
    if (resultContainer) {
      resultContainer.innerHTML = `
        <p><strong>Total Sales:</strong> RM${sales}</p>
        <p><strong>Total Discount:</strong> RM${discount}</p>
        <p><strong>Total Revenue:</strong> RM${revenue}</p>
        <p><strong>Total Fees:</strong> RM${fees}</p>
        <p><strong>Total Settlement:</strong> RM${settlement}</p>
      `;
    }
  }
});

