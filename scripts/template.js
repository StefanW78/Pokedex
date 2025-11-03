
function getMainDishesTemplate(index) {
  return `<div class="menuItem" tabindex="0">
                <div class="menuItemDescription">
                  <div class="menuItemHeadline">${myDishes[index].name}</div>
                  <div class="ingedientsDescription">
                    ${myDishes[index].description}
                  </div>
                  <div class="menuPrice primary">${myDishes[index].price}€</div>
                </div>
                <div class="orderButtonDishes" role="button" onclick="addItemToBasketGeneric(this, 'main')" data-info="${index}">
                  <svg
                    viewBox="0 0 24 24"
                    fill="transparent"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="feather feather-plus-circle plusIcon"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
              </div>`;
}
