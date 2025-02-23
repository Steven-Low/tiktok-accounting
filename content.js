let totalRevenue = 0;
let totalFees = 0;
let totalDiscount = 0;
let totalSales = 0;

console.log("content.js loaded :D");

async function processTableData() {
  const rows = document.querySelectorAll('.theme-arco-table-tr');

  for (const row of rows) {
    // Extract the full content of the fifth cell
    const cell = row.querySelector('.theme-arco-table-td:nth-child(5)');
    const viewDetailsButton = row.querySelectorAll('.theme-arco-table-td:nth-child(6) button[data-tid="m4b_button"]');

    if (viewDetailsButton.length > 0) {
      viewDetailsButton[0].click();  // Click the button
    }

    await extractSellerDiscounts(); // Await the extraction of discounts
    extractSales();
    exitViewDetails();

    if (cell) {
      // Get the entire cell text content
      const cellText = cell.textContent.trim();
      console.log(cellText);

      // Match Revenue and Fees using regex
      const revenueMatch = cellText.match(/Revenue\s*RM(-?\d+(\.\d+)?)/);
      const feesMatch = cellText.match(/Fees\s*RM(-?\d+(\.\d+)?)/);
      
      // If Revenue is found, accumulate its value
      if (revenueMatch) {
        const revenueValue = parseFloat(revenueMatch[1]);
        totalRevenue += revenueValue;
      }
      
      // If Fees is found, accumulate its value
      if (feesMatch) {
        const feesValue = parseFloat(feesMatch[1]);
        totalFees += feesValue;
      }
    }
  }
 
}

const timer = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractSellerDiscounts() {
  await timer(1000);

  // Use a CSS selector to locate the discount value
  const discountElement = document.querySelector(
    'body > div.theme-arco-drawer-wrapper > div.theme-arco-drawer.theme-m4b-drawer.slideRight-enter-done > div > span > div > div.theme-arco-drawer-content.theme-arco-drawer-content-nofooter > div > div:nth-child(4) > div:nth-child(2) > div:nth-child(3) > div > div > div.mr-16'
  );

  if (discountElement) {
    const discountText = discountElement.textContent.trim().replace(",","");  // Get the full text (e.g., "RM-28.3")
    
    // Extract the numeric value using a regular expression
    const discountMatch = discountText.match(/RM(-?\d+(\.\d+)?)/);

    if (discountMatch) {
      const discountValue = parseFloat(discountMatch[1]);  // Parse the discount value
      totalDiscount += discountValue;  // Add the discount value to the total
      console.log("Extracted Seller Discount: RM" + discountValue);
    } else {
      console.log("Error: discount not match");
    }
  } else {
    console.error("Discount element not found using CSS selector.");
  }
}

function extractSales() {
  const saleElement = document.querySelector(
    'body > div.theme-arco-drawer-wrapper > div.theme-arco-drawer.theme-m4b-drawer.slideRight-enter-done > div > span > div > div.theme-arco-drawer-content.theme-arco-drawer-content-nofooter > div > div:nth-child(4) > div:nth-child(2) > div:nth-child(2) > div > div > div.mr-16'
  );

  if (saleElement) {
    const saleText = saleElement.textContent.trim().replace(",","");  // Get the full text (e.g., "RM100.0")
    
    // Extract the numeric value using a regular expression
    const saleMatch = saleText.match(/RM(-?\d+(\.\d+)?)/);

    if (saleMatch) {
      const saleValue = parseFloat(saleMatch[1]);  // Parse the sales value
      totalSales += saleValue;  // Add the sales value to the total
      console.log("Extracted Sales: RM" + saleValue);
    } else {
      console.log("Error: sales not match");
    }
  } else {
    console.error("Sales element not found using CSS selector.");
  }
}

function exitViewDetails() {
  // Use class names to select the exit button
  const exitButton = document.querySelector('.theme-arco-icon-hover.theme-arco-drawer-close-icon');
  if (exitButton) {
    exitButton.click();  // Click the "exit" button to close the details view
  } else {
    console.error("Exit button not found.");
  }
}

async function processAllPages() {
  const paginationList = document.querySelector('.theme-arco-pagination-list');
  if (!paginationList) {
    console.error('Pagination controls not found!');
    return;
  }


  let currentPage = 1;

  // Reset totals before processing pages
  totalRevenue = 0;
  totalFees = 0;
  totalDiscount = 0;
  totalSales = 0;

  async function processNextPage() {
    const paginationItems = paginationList.querySelectorAll(`.theme-arco-pagination-item[aria-label^="Page ${currentPage}"]`);

    console.log("page:", currentPage);
    
    if (paginationItems.length === 0) {
      const totalSettlement = totalRevenue + totalFees;
      console.log('Total Revenue:', totalRevenue);
      console.log('Total Fees:', totalFees);
      console.log('Total Discount:', totalDiscount);
      console.log('Total Sales:', totalSales);
      console.log('Total Settlement:', totalSettlement )

      // Send results back to the popup
      chrome.runtime.sendMessage({
        type: 'SUM_RESULT',
        revenue: totalRevenue,
        fees: totalFees,
        discount: totalDiscount,
        sales: totalSales,
        settlement: totalSettlement
      });

      return;
    }

    const pageItem = paginationItems[0];
    if (pageItem) {
      pageItem.click();

      // Wait for the page to load completely before processing
      await timer(700); // Wait for 1 second

      await processTableData(); // Await the processing of data for the current page
      currentPage++;             // Increment page number

      // Call processNextPage recursively
      await processNextPage();   
    }
  }

  // Call the async function to start processing pages
  await processNextPage();
}

// Run the processAllPages function
// processAllPages();