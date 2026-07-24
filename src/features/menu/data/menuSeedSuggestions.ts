/** Default autocomplete suggestions for a restaurant menu, seeded from a sample
 * pizza-and-fast-food menu. Purely UI suggestions — creating one just means the
 * category/dish name gets adopted, same as typing it manually. */

export const MENU_CATEGORY_SUGGESTIONS: string[] = [
  'Pizza',
  'Wings',
  'Fried Chicken',
  'Wraps',
  'Lil Sparks',
  'Fries',
  'Pasta',
  'Grilled Chicken Steaks',
  'Char-Grilled Cluck Burger',
  'Char-Grilled Beef Burger',
  'Fried Burgers',
  'Drinks',
  'Add-ons',
  'Deals',
  'Upgrades',
  'Toppings',
];

/** Dish name suggestions, keyed by category name — dish suggestions depend on
 * whichever category is currently selected in the form. */
export const MENU_DISH_NAME_SUGGESTIONS: Record<string, string[]> = {
  Pizza: [
    'Flamez Special Pizza',
    'Don Calzone Pizza',
    'Cheese Lover Pizza',
    'Crown Crust Pizza',
    'All the Meat Pizza',
    'Chicken Delight Pizza',
    'Supreme Pizza',
    'Malel Bot Pizza',
    'Fajita Pizza',
    'Tikka Pizza',
  ],
  Wings: ['Crispy Wings', 'BBQ Wings', 'Oven Baked Wings'],
  'Fried Chicken': ['Fried Cluck'],
  Wraps: ['Arabic Wrap', 'Kentucky Wrap', 'Mexican Roll Wrap'],
  'Lil Sparks': ['Fish n Chips', 'Nuggets'],
  Fries: ['Plain Fries', 'Masala Fries', 'Loaded Fries', 'Holi Fries'],
  Pasta: ['Crunchy Pasta', 'Fettuccine Alfredo Pasta'],
  'Grilled Chicken Steaks': [
    'Mushroom Creamy Chicken Steak',
    'Black Pepper Chicken Steak',
    'Terragon Chicken Steak',
    'Mexican Chicken Steak',
  ],
  'Char-Grilled Cluck Burger': [
    'Saloon Grilled Burger',
    'Chicken Jalapeno Grilled Burger',
    'Appachi Grilled Burger',
    'Bandit Grilled Burger',
  ],
  'Char-Grilled Beef Burger': ['Monster Beef Burger', 'Flamez Special Beef Burger', 'Triple Beef Burger'],
  'Fried Burgers': [
    'The Zing Fried Burger',
    'Rooster Fried Burger',
    'Mighty Zing Fried Burger',
    'Double Rooster Fried Burger',
  ],
  Drinks: ['Regular Drink', '1 Litre Drink', '1.5 Litre Drink', 'Water', 'Mint Margarita'],
  'Add-ons': ['Garlic Mayo Dip', 'Bang Bang Dip', 'Tangy Dip', 'Cheese Slice'],
  Deals: [
    'Box 1 - Dou Box',
    'Flamez Fix',
    'Loaded Deal',
    'Family Festival',
    'Double Flame',
    '2 Hot 2 Handle',
    'Biig Deal',
    'Steak Love',
  ],
  Upgrades: ['Stuff Crust Upgrade', 'Cheesy Bite Upgrade'],
  Toppings: ['Extra Cheese Topping', 'Extra Chicken Topping', 'Extra Vegetable Topping'],
};
