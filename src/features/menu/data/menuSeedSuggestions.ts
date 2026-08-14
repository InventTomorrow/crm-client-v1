/** Predefined autocomplete suggestions for restaurant menu categories.
 * Covers the full range of Pakistani fast-food & casual dining menus —
 * grills, desi items, Continental, beverages, deals, and modifiers.
 * Ordered by how commonly they appear across local restaurant menus. */
export const MENU_CATEGORY_SUGGESTIONS: string[] = [
  // ─── Core Fast Food ───────────────────────────────────────────────
  "Pizza",
  "Burgers",
  "Fried Chicken",
  "Wraps & Rolls",
  "Shawarma",
  "Fries",
  "Wings",

  // ─── Grills & Steaks ─────────────────────────────────────────────
  "Grilled Chicken Steaks",
  "Beef Steaks",
  "BBQ & Platters",
  "Seekh Kebabs",

  // ─── Desi / Pakistani ────────────────────────────────────────────
  "Biryani & Rice",
  "Karahi & Curries",
  "Desi Starters",
  "Naan & Bread",

  // ─── Sandwiches & Snacks ─────────────────────────────────────────
  "Sandwiches & Subs",
  "Nuggets & Bites",
  "Lil Sparks", // keep your existing brand category
  "Starters & Snacks",

  // ─── Pasta & Continental ─────────────────────────────────────────
  "Pasta",
  "Calzones",
  "Soups & Salads",

  // ─── Breakfast ───────────────────────────────────────────────────
  "Breakfast & Eggs",
  "Paratha Rolls",

  // ─── Desserts ────────────────────────────────────────────────────
  "Desserts & Sweets",
  "Ice Cream & Shakes",
  "Waffles & Crepes",

  // ─── Beverages ───────────────────────────────────────────────────
  "Drinks",
  "Hot Drinks",
  "Juices & Smoothies",
  "Shakes & Frappes",

  // ─── Deal / Modifier Types ────────────────────────────────────────
  "Deals",
  "Family Deals",
  "Student Deals",
  "Midnight Deals",
  "Add-ons",
  "Upgrades",
  "Toppings",
  "Dips & Sauces",
];

/** Dish name suggestions keyed by category. Covers your existing Flamez-style
 * menu PLUS common items from Pakistani chains (Cheezious, Broadway, etc.)
 * so the suggestions feel familiar to any local restaurant owner onboarding. */
export const MENU_DISH_NAME_SUGGESTIONS: Record<string, string[]> = {
  // ─── Pizza ──────────────────────────────────────────────────────────
  Pizza: [
    "Flamez Special Pizza",
    "Don Calzone Pizza",
    "Cheese Lover Pizza",
    "Crown Crust Pizza",
    "All the Meat Pizza",
    "Chicken Delight Pizza",
    "Supreme Pizza",
    "Fajita Pizza",
    "Tikka Pizza",
    "Malel Bot Pizza",
    "BBQ Chicken Pizza",
    "Seekh Kabab Pizza",
    "Peri Peri Pizza",
    "Hot n Spicy Pizza",
    "Veggie Delight Pizza",
    "Smokey Chicken Pizza",
    "Gyro Pizza",
    "Wicked Blend Pizza",
  ],

  // ─── Burgers ────────────────────────────────────────────────────────
  Burgers: [
    // Char-Grilled Chicken
    "Saloon Grilled Burger",
    "Chicken Jalapeno Grilled Burger",
    "Appachi Grilled Burger",
    "Bandit Grilled Burger",
    // Char-Grilled Beef
    "Monster Beef Burger",
    "Flamez Special Beef Burger",
    "Triple Beef Burger",
    // Fried
    "The Zing Fried Burger",
    "Rooster Fried Burger",
    "Mighty Zing Fried Burger",
    "Double Rooster Fried Burger",
    // Generic popular names
    "Classic Cheeseburger",
    "Smokey BBQ Burger",
    "Spicy Crispy Burger",
    "Double Patty Burger",
    "Tower Burger",
  ],

  // ─── Fried Chicken ──────────────────────────────────────────────────
  "Fried Chicken": [
    "Fried Cluck",
    "1 Piece Broast",
    "2 Piece Broast",
    "4 Piece Broast",
    "8 Piece Broast",
    "Crispy Strips",
    "Chicken Hot Shot",
    "Zinger Fillet",
    "Spicy Crunch",
    "Peri Peri Chicken",
  ],

  // ─── Wraps & Rolls ──────────────────────────────────────────────────
  "Wraps & Rolls": [
    "Arabic Wrap",
    "Kentucky Wrap",
    "Mexican Roll Wrap",
    "Bihari Roll",
    "Seekh Kabab Roll",
    "Chicken Tikka Roll",
    "Crispy Chicken Wrap",
    "BBQ Wrap",
    "Peri Peri Wrap",
    "Fajita Wrap",
    "Chipotle Chicken Wrap",
  ],

  // ─── Shawarma ───────────────────────────────────────────────────────
  Shawarma: [
    "Classic Chicken Shawarma",
    "Beef Shawarma",
    "Arabic Shawarma",
    "Turkish Shawarma",
    "Garlic Shawarma",
    "Peri Peri Shawarma",
    "Double Shawarma",
    "Family Shawarma Platter",
  ],

  // ─── Wings ──────────────────────────────────────────────────────────
  Wings: [
    "Crispy Wings",
    "BBQ Wings",
    "Oven Baked Wings",
    "Hot n Spicy Wings",
    "Honey Glazed Wings",
    "Peri Peri Wings",
    "Buffalo Wings",
    "Garlic Parmesan Wings",
    "6 Piece Wings",
    "12 Piece Wings",
  ],

  // ─── Fries ──────────────────────────────────────────────────────────
  Fries: [
    "Plain Fries",
    "Masala Fries",
    "Loaded Fries",
    "Holi Fries",
    "Cheesy Fries",
    "Peri Peri Fries",
    "Garlic Fries",
    "BBQ Loaded Fries",
    "Waffle Fries",
    "Sweet Potato Fries",
  ],

  // ─── Grilled Chicken Steaks ─────────────────────────────────────────
  "Grilled Chicken Steaks": [
    "Mushroom Creamy Chicken Steak",
    "Black Pepper Chicken Steak",
    "Tarragon Chicken Steak",
    "Mexican Chicken Steak",
    "Peri Peri Chicken Steak",
    "Lemon Herb Chicken Steak",
    "Smokey Grilled Steak",
    "BBQ Chicken Steak",
  ],

  // ─── Beef Steaks ────────────────────────────────────────────────────
  "Beef Steaks": [
    "Black Pepper Beef Steak",
    "Mushroom Sauce Beef Steak",
    "Peri Peri Beef Steak",
    "Classic Flame Grilled Steak",
    "BBQ Beef Steak",
  ],

  // ─── BBQ & Platters ─────────────────────────────────────────────────
  "BBQ & Platters": [
    "Roasted Chicken Platter",
    "Seekh Kabab Platter",
    "Mixed BBQ Platter",
    "Chicken Tikka Platter",
    "Family BBQ Feast",
    "Malai Boti Platter",
    "BBQ Sharing Platter",
  ],

  // ─── Seekh Kebabs ───────────────────────────────────────────────────
  "Seekh Kebabs": [
    "Chicken Seekh Kabab",
    "Beef Seekh Kabab",
    "Mutton Seekh Kabab",
    "Malai Boti",
    "Shami Kabab",
    "Chapli Kabab",
  ],

  // ─── Biryani & Rice ─────────────────────────────────────────────────
  "Biryani & Rice": [
    "Chicken Biryani",
    "Beef Biryani",
    "Mutton Biryani",
    "Sindhi Biryani",
    "Peshawari Pulao",
    "Chicken Pulao",
    "Dum Biryani",
    "Tikka Biryani",
    "Zeera Rice",
  ],

  // ─── Karahi & Curries ───────────────────────────────────────────────
  "Karahi & Curries": [
    "Chicken Karahi",
    "Beef Karahi",
    "Mutton Karahi",
    "Handi Karahi",
    "White Karahi",
    "Chicken Handi",
    "Daal Makhani",
    "Butter Chicken",
  ],

  // ─── Desi Starters ──────────────────────────────────────────────────
  "Desi Starters": [
    "Samosa",
    "Pakora",
    "Spring Rolls",
    "Chicken Chaat",
    "Dahi Puri",
    "Gol Gappa",
    "Aloo Tikki",
  ],

  // ─── Naan & Bread ───────────────────────────────────────────────────
  "Naan & Bread": [
    "Plain Naan",
    "Butter Naan",
    "Garlic Naan",
    "Stuffed Naan",
    "Roghni Naan",
    "Garlic Bread",
    "Cheese Stuffed Garlic Bread",
    "Paratha",
  ],

  // ─── Sandwiches & Subs ──────────────────────────────────────────────
  "Sandwiches & Subs": [
    "Club Sandwich",
    "Crispy Chicken Sub",
    "Beef Sub",
    "Grilled Veggie Sub",
    "BLT Sandwich",
    "Chicken Mayo Sandwich",
  ],

  // ─── Nuggets & Bites ────────────────────────────────────────────────
  "Nuggets & Bites": [
    "Chicken Nuggets (6 pcs)",
    "Chicken Nuggets (12 pcs)",
    "Popcorn Chicken",
    "Chicken Hot Shots",
    "Mini Corn Dogs",
    "Mozzarella Sticks",
    "Jalapeño Poppers",
  ],

  // ─── Lil Sparks ─────────────────────────────────────────────────────
  "Lil Sparks": [
    "Fish n Chips",
    "Nuggets",
    "Mini Sliders",
    "Corn on the Cob",
    "Potato Wedges",
  ],

  // ─── Starters & Snacks ──────────────────────────────────────────────
  "Starters & Snacks": [
    "Calzone Chunks",
    "Onion Rings",
    "Loaded Potato Skins",
    "Coleslaw",
    "Chicken Cheese Balls",
    "Crinkle Cut Fries",
    "Peri Peri Wedges",
  ],

  // ─── Pasta ──────────────────────────────────────────────────────────
  Pasta: [
    "Crunchy Pasta",
    "Fettuccine Alfredo Pasta",
    "Penne Arrabbiata",
    "Creamy Chicken Pasta",
    "Bolognese Pasta",
    "Pesto Chicken Pasta",
    "Mac n Cheese",
  ],

  // ─── Calzones ───────────────────────────────────────────────────────
  Calzones: [
    "Classic Calzone",
    "Chicken Calzone",
    "Beef Calzone",
    "Veggie Calzone",
    "Cheese Burst Calzone",
  ],

  // ─── Soups & Salads ─────────────────────────────────────────────────
  "Soups & Salads": [
    "Chicken Corn Soup",
    "Hot & Sour Soup",
    "Mushroom Soup",
    "Caesar Salad",
    "Greek Salad",
    "Garden Fresh Salad",
    "Coleslaw",
  ],

  // ─── Breakfast & Eggs ───────────────────────────────────────────────
  "Breakfast & Eggs": [
    "Classic Omelette",
    "Egg Paratha",
    "French Toast",
    "Pancakes",
    "Scrambled Eggs",
    "Breakfast Platter",
    "Halwa Puri",
  ],

  // ─── Paratha Rolls ──────────────────────────────────────────────────
  "Paratha Rolls": [
    "Chicken Paratha Roll",
    "Seekh Kabab Paratha Roll",
    "Egg Paratha Roll",
    "Beef Paratha Roll",
    "Aloo Paratha",
  ],

  // ─── Desserts & Sweets ──────────────────────────────────────────────
  "Desserts & Sweets": [
    "Chocolate Lava Cake",
    "Gulab Jamun",
    "Kheer",
    "Brownie",
    "Tiramisu",
    "Cheesecake Slice",
    "Zarda",
    "Gajar Halwa",
  ],

  // ─── Ice Cream & Shakes ─────────────────────────────────────────────
  "Ice Cream & Shakes": [
    "Vanilla Soft Serve",
    "Chocolate Sundae",
    "Strawberry Milkshake",
    "Chocolate Milkshake",
    "Oreo Shake",
    "Mango Shake",
    "Kit Kat Frappe",
    "Nutella Shake",
  ],

  // ─── Waffles & Crepes ───────────────────────────────────────────────
  "Waffles & Crepes": [
    "Classic Waffle",
    "Nutella Banana Waffle",
    "Strawberry Waffle",
    "Chicken Crepe",
    "Chocolate Crepe",
  ],

  // ─── Drinks ─────────────────────────────────────────────────────────
  Drinks: [
    "Regular Drink",
    "1 Litre Drink",
    "1.5 Litre Drink",
    "Water",
    "Mint Margarita",
    "Lemon Soda",
    "Fanta",
    "Pepsi",
    "7UP",
  ],

  // ─── Hot Drinks ─────────────────────────────────────────────────────
  "Hot Drinks": [
    "Doodh Patti Chai",
    "Karak Chai",
    "Green Tea",
    "Cappuccino",
    "Americano",
    "Latte",
    "Hot Chocolate",
  ],

  // ─── Juices & Smoothies ─────────────────────────────────────────────
  "Juices & Smoothies": [
    "Fresh Orange Juice",
    "Mango Juice",
    "Guava Juice",
    "Mixed Fruit Juice",
    "Watermelon Juice",
    "Lemon Mint Juice",
    "Strawberry Smoothie",
  ],

  // ─── Shakes & Frappes ───────────────────────────────────────────────
  "Shakes & Frappes": [
    "Classic Chocolate Frappe",
    "Caramel Frappe",
    "Strawberry Frappe",
    "Oreo Blizzard",
    "Banana Shake",
    "Mocha Frappe",
  ],

  // ─── Deals ──────────────────────────────────────────────────────────
  Deals: [
    "Box 1 - Duo Box",
    "Flamez Fix",
    "Loaded Deal",
    "Family Festival",
    "Double Flame",
    "2 Hot 2 Handle",
    "Biig Deal",
    "Steak Love",
    "Super Deal",
    "Value Meal",
    "Combo Deal",
  ],

  // ─── Family Deals ────────────────────────────────────────────────────
  "Family Deals": [
    "Family Feast",
    "Family Bundle",
    "Party Pack",
    "Weekend Special",
    "Group Deal",
  ],

  // ─── Student Deals ───────────────────────────────────────────────────
  "Student Deals": [
    "Student Saver",
    "Campus Combo",
    "Budget Buster",
    "Pocket Deal",
  ],

  // ─── Midnight Deals ──────────────────────────────────────────────────
  "Midnight Deals": [
    "Midnight Special",
    "Late Night Combo",
    "Night Owl Deal",
    "2 AM Fix",
  ],

  // ─── Add-ons ─────────────────────────────────────────────────────────
  "Add-ons": [
    "Garlic Mayo Dip",
    "Bang Bang Dip",
    "Tangy Dip",
    "Cheese Slice",
    "Extra Patty",
    "Extra Egg",
    "Avocado Add-on",
    "Jalapenos",
  ],

  // ─── Upgrades ────────────────────────────────────────────────────────
  Upgrades: [
    "Stuffed Crust Upgrade",
    "Cheesy Bite Upgrade",
    "Upsize Meal",
    "Add Drink",
    "Add Fries",
  ],

  // ─── Toppings ────────────────────────────────────────────────────────
  Toppings: [
    "Extra Cheese Topping",
    "Extra Chicken Topping",
    "Extra Vegetable Topping",
    "Jalapeños",
    "Olives",
    "Mushrooms",
    "Bell Peppers",
    "Onions",
    "Pineapple",
    "Pepperoni",
  ],

  // ─── Dips & Sauces ───────────────────────────────────────────────────
  "Dips & Sauces": [
    "Garlic Mayo",
    "Bang Bang Sauce",
    "Peri Peri Sauce",
    "BBQ Sauce",
    "Ketchup",
    "Chilli Sauce",
    "Ranch Dip",
    "Sweet n Sour",
    "Buffalo Sauce",
  ],
};
