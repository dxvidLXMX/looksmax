// ============================================================
//  Foods — searchable nutrition database (static, fully offline).
//
//  ⚠️ Accuracy: whole-food values follow USDA figures and are solid.
//  Restaurant values are approximations of each chain's published
//  numbers (US menu, US portions) — close enough for daily tracking,
//  but menus and recipes drift. If a number looks wrong, use
//  "✎ adjust" in the picker to save your own corrected copy.
//
//  Rows are compact tuples to keep this file readable:
//      [id, name, serving, kcal, protein, carbs, fat]
// ============================================================

// generic / grocery item (no brand)
const G = (cat, rows) => rows.map(([id, name, serving, kcal, p, c, f]) =>
  ({ id: `f_${id}`, name, serving, kcal, p, c, f, cat, brand: "" }));

// branded item (restaurant chain or packaged product)
const B = (brand, cat, rows) => rows.map(([id, name, serving, kcal, p, c, f]) =>
  ({ id: `f_${id}`, name, serving, kcal, p, c, f, cat, brand }));

export const FOODS = [

  // ──────────────── Eggs ────────────────
  ...G("Eggs", [
    ["egg_lg",        "Egg, large (whole)",        "1 large egg",   72,  6.3, 0.4, 4.8],
    ["egg_xl",        "Egg, extra large (whole)",  "1 egg",         80,  7,   0.4, 5.3],
    ["egg_white",     "Egg white",                 "1 large white", 17,  3.6, 0.2, 0.1],
    ["egg_yolk",      "Egg yolk",                  "1 large yolk",  55,  2.7, 0.6, 4.5],
    ["egg_boiled",    "Egg, hard boiled",          "1 large egg",   78,  6.3, 0.6, 5.3],
    ["egg_fried",     "Egg, fried",                "1 large egg",   90,  6.3, 0.4, 7],
    ["egg_scram",     "Eggs, scrambled",           "1 large egg",   91,  6.1, 1,   6.7],
    ["egg_liq_white", "Liquid egg whites",         "1 cup",        126, 26,   2,   0.4],
  ]),

  // ──────────────── Poultry ────────────────
  ...G("Poultry", [
    ["chk_breast",    "Chicken breast, cooked",       "100 g",        165, 31,   0,   3.6],
    ["chk_breast_oz", "Chicken breast, cooked",       "4 oz",         187, 35,   0,   4.1],
    ["chk_thigh",     "Chicken thigh, cooked",        "100 g",        209, 26,   0,  10.9],
    ["chk_wing",      "Chicken wing, cooked",         "1 wing",        99,  9.1, 0,   6.6],
    ["chk_drum",      "Chicken drumstick, cooked",    "1 drumstick",  106, 14,   0,   5.1],
    ["chk_ground",    "Ground chicken, cooked",       "100 g",        189, 24,   0,  10],
    ["chk_rotis",     "Rotisserie chicken, breast",   "100 g",        184, 28,   0,   7],
    ["chk_tender",    "Chicken tenders, breaded",     "3 tenders",    290, 20,  18,  15],
    ["turkey_breast", "Turkey breast, cooked",        "100 g",        135, 30,   0,   1],
    ["turkey_ground", "Ground turkey 93/7, cooked",   "100 g",        176, 22,   0,   9.4],
    ["turkey_deli",   "Turkey, deli sliced",          "2 oz",          60, 11,   2,   0.5],
  ]),

  // ──────────────── Beef & pork ────────────────
  ...G("Meat", [
    ["beef_8020",   "Ground beef 80/20, cooked",   "100 g",       254, 26,  0,  16],
    ["beef_9010",   "Ground beef 90/10, cooked",   "100 g",       217, 26,  0,  11.8],
    ["beef_9307",   "Ground beef 93/7, cooked",    "100 g",       182, 26,  0,   8],
    ["beef_sirloin","Sirloin steak, cooked",       "100 g",       206, 30,  0,   9],
    ["beef_ribeye", "Ribeye steak, cooked",        "100 g",       291, 24,  0,  21],
    ["beef_filet",  "Filet mignon, cooked",        "100 g",       227, 29,  0,  12],
    ["beef_flank",  "Flank steak, cooked",         "100 g",       192, 28,  0,   8],
    ["beef_brisket","Brisket, cooked",             "100 g",       246, 28,  0,  14],
    ["bacon",       "Bacon, cooked",               "1 slice",      43,  3,  0.1, 3.3],
    ["pork_chop",   "Pork chop, cooked",           "100 g",       231, 26,  0,  14],
    ["pork_tender", "Pork tenderloin, cooked",     "100 g",       143, 26,  0,   3.5],
    ["pork_sausage","Pork sausage link",           "1 link",       85,  5,  0.5, 7],
    ["ham_deli",    "Ham, deli sliced",            "2 oz",         70, 10,  2,   2.5],
    ["hot_dog",     "Hot dog, beef",               "1 frank",     186,  7,  2,  17],
    ["lamb_chop",   "Lamb chop, cooked",           "100 g",       282, 25,  0,  20],
    ["beef_jerky",  "Beef jerky",                  "1 oz",         82, 11,  6,   1.5],
  ]),

  // ──────────────── Fish & seafood ────────────────
  ...G("Seafood", [
    ["salmon",      "Salmon, cooked",              "100 g",       206, 22,  0,  12],
    ["salmon_smok", "Smoked salmon",               "2 oz",        66,  11,  0,   2.4],
    ["tuna_can",    "Tuna, canned in water",       "1 can (5 oz)",110, 25,  0,   1],
    ["tuna_ahi",    "Ahi tuna, raw",               "100 g",       109, 24,  0,   1],
    ["tilapia",     "Tilapia, cooked",             "100 g",       128, 26,  0,   2.7],
    ["cod",         "Cod, cooked",                 "100 g",       105, 23,  0,   0.9],
    ["shrimp",      "Shrimp, cooked",              "100 g",        99, 24,  0.2, 0.3],
    ["mahi",        "Mahi mahi, cooked",           "100 g",       109, 24,  0,   0.9],
    ["sardines",    "Sardines, canned in oil",     "1 can",       191, 23,  0,  11],
    ["crab",        "Crab meat, cooked",           "100 g",        97, 19,  0,   1.5],
    ["scallops",    "Scallops, cooked",            "100 g",       111, 20,  5,   0.8],
  ]),

  // ──────────────── Dairy ────────────────
  ...G("Dairy", [
    ["milk_whole",   "Milk, whole",                "1 cup",       149,  8,  12,   8],
    ["milk_2",       "Milk, 2%",                   "1 cup",       122,  8,  12,   4.8],
    ["milk_skim",    "Milk, skim",                 "1 cup",        83,  8,  12,   0.2],
    ["milk_choc",    "Chocolate milk",             "1 cup",       208,  8,  26,   8.5],
    ["almond_milk",  "Almond milk, unsweetened",   "1 cup",        39,  1,   3.4, 2.5],
    ["oat_milk",     "Oat milk",                   "1 cup",       120,  3,  16,   5],
    ["soy_milk",     "Soy milk, unsweetened",      "1 cup",        80,  7,   4,   4],
    ["yog_greek_nf", "Greek yogurt, plain nonfat", "1 cup (227g)",133, 23,   8,   0.7],
    ["yog_greek_wh", "Greek yogurt, plain whole",  "1 cup (227g)",190, 18,   8,   9],
    ["yog_greek_fl", "Greek yogurt, flavored",     "1 cup (170g)",140, 14,  18,   2],
    ["cottage_1",    "Cottage cheese, 1%",         "1 cup",       163, 28,   6,   2.3],
    ["cottage_4",    "Cottage cheese, 4%",         "1 cup",       206, 23,   8,   9],
    ["cheddar",      "Cheddar cheese",             "1 oz",        115,  7,   0.4, 9.4],
    ["mozzarella",   "Mozzarella cheese",          "1 oz",         85,  6,   0.6, 6],
    ["parmesan",     "Parmesan, grated",           "1 tbsp",       21,  1.9, 0.2, 1.4],
    ["string_cheese","String cheese",              "1 stick",      80,  6,   1,   6],
    ["feta",         "Feta cheese",                "1 oz",         75,  4,   1.2, 6],
    ["cream_cheese", "Cream cheese",               "1 tbsp",       51,  0.9, 0.8, 5],
    ["butter",       "Butter",                     "1 tbsp",      102,  0.1, 0,  11.5],
    ["heavy_cream",  "Heavy cream",                "1 tbsp",       51,  0.3, 0.4, 5.4],
    ["sour_cream",   "Sour cream",                 "2 tbsp",       59,  0.7, 1.4, 5.6],
    ["ice_cream",    "Ice cream, vanilla",         "1/2 cup",     137,  2.3,16,   7],
  ]),

  // ──────────────── Grains & bread ────────────────
  ...G("Grains", [
    ["rice_white",   "White rice, cooked",         "1 cup",       205,  4.3, 45,  0.4],
    ["rice_brown",   "Brown rice, cooked",         "1 cup",       216,  5,   45,  1.8],
    ["rice_jasmine", "Jasmine rice, cooked",       "1 cup",       205,  4.2, 45,  0.4],
    ["oats_dry",     "Oats, dry",                  "1/2 cup",     150,  5,   27,  3],
    ["oatmeal",      "Oatmeal, cooked",            "1 cup",       166,  6,   28,  3.6],
    ["quinoa",       "Quinoa, cooked",             "1 cup",       222,  8,   39,  3.6],
    ["pasta",        "Pasta, cooked",              "1 cup",       221,  8,   43,  1.3],
    ["pasta_wheat",  "Whole wheat pasta, cooked",  "1 cup",       174,  7.5, 37,  0.8],
    ["bread_white",  "White bread",                "1 slice",      79,  2.7, 15,  1],
    ["bread_wheat",  "Whole wheat bread",          "1 slice",      82,  4,   14,  1.1],
    ["bread_sour",   "Sourdough bread",            "1 slice",      93,  3.7, 18,  0.6],
    ["bagel",        "Bagel, plain",               "1 bagel",     289, 11,   56,  1.7],
    ["english_muf",  "English muffin",             "1 muffin",    134,  4.4, 26,  1],
    ["tortilla_fl",  "Flour tortilla (8 in)",      "1 tortilla",  146,  4,   24,  4],
    ["tortilla_cor", "Corn tortilla",              "1 tortilla",   52,  1.4, 11,  0.7],
    ["couscous",     "Couscous, cooked",           "1 cup",       176,  6,   36,  0.3],
    ["cereal_cheer", "Cheerios",                   "1 cup",       100,  3,   20,  2],
    ["granola",      "Granola",                    "1/2 cup",     213,  5,   36,  6],
    ["pancake",      "Pancake",                    "1 (4 in)",     86,  2.4, 11,  3.7],
    ["waffle",       "Waffle, frozen",             "1 waffle",     95,  2.3, 15,  2.9],
    ["ramen_pack",   "Ramen noodles, packet",      "1 package",   380,  8,   52, 14],
  ]),

  // ──────────────── Legumes, nuts & seeds ────────────────
  ...G("Nuts & beans", [
    ["black_beans",  "Black beans, canned",        "1/2 cup",     109,  7,   20,  0.4],
    ["pinto_beans",  "Pinto beans, cooked",        "1/2 cup",     123,  7.7, 22,  0.6],
    ["chickpeas",    "Chickpeas, canned",          "1/2 cup",     134,  7,   22,  2],
    ["lentils",      "Lentils, cooked",            "1 cup",       230, 18,   40,  0.8],
    ["edamame",      "Edamame, shelled",           "1 cup",       188, 18,   14,  8],
    ["peanut_butter","Peanut butter",              "2 tbsp",      190,  8,    7, 16],
    ["almond_butter","Almond butter",              "2 tbsp",      196,  7,    6, 18],
    ["almonds",      "Almonds",                    "1 oz (23)",   164,  6,    6, 14],
    ["peanuts",      "Peanuts",                    "1 oz",        161,  7,    4.6,14],
    ["walnuts",      "Walnuts",                    "1 oz",        185,  4.3,  3.9,18.5],
    ["cashews",      "Cashews",                    "1 oz",        157,  5,    9, 12],
    ["pistachios",   "Pistachios",                 "1 oz",        159,  6,    8, 13],
    ["chia",         "Chia seeds",                 "1 tbsp",       58,  2,    5,  3.7],
    ["flax",         "Ground flaxseed",            "1 tbsp",       37,  1.3,  2,  3],
    ["trail_mix",    "Trail mix",                  "1/4 cup",     173,  5,   17, 11],
  ]),

  // ──────────────── Fruit ────────────────
  ...G("Fruit", [
    ["banana",     "Banana",                "1 medium",   105,  1.3, 27,  0.4],
    ["apple",      "Apple",                 "1 medium",    95,  0.5, 25,  0.3],
    ["orange",     "Orange",                "1 medium",    62,  1.2, 15,  0.2],
    ["strawberry", "Strawberries",          "1 cup",       49,  1,   12,  0.5],
    ["blueberry",  "Blueberries",           "1 cup",       84,  1.1, 21,  0.5],
    ["raspberry",  "Raspberries",           "1 cup",       64,  1.5, 15,  0.8],
    ["grapes",     "Grapes",                "1 cup",      104,  1.1, 27,  0.2],
    ["watermelon", "Watermelon",            "1 cup",       46,  0.9, 12,  0.2],
    ["pineapple",  "Pineapple",             "1 cup",       82,  0.9, 22,  0.2],
    ["mango",      "Mango",                 "1 cup",       99,  1.4, 25,  0.6],
    ["avocado",    "Avocado",               "1 medium",   240,  3,   13, 22],
    ["peach",      "Peach",                 "1 medium",    59,  1.4, 14,  0.4],
    ["pear",       "Pear",                  "1 medium",   101,  0.6, 27,  0.2],
    ["grapefruit", "Grapefruit",            "1/2 fruit",   52,  1,   13,  0.2],
    ["raisins",    "Raisins",               "1/4 cup",    123,  1.3, 32,  0.2],
    ["dates",      "Medjool dates",         "1 date",      66,  0.4, 18,  0],
  ]),

  // ──────────────── Vegetables ────────────────
  ...G("Vegetables", [
    ["broccoli",    "Broccoli, cooked",     "1 cup",       55,  3.7, 11,  0.6],
    ["spinach_raw", "Spinach, raw",         "1 cup",        7,  0.9,  1.1,0.1],
    ["kale",        "Kale, raw",            "1 cup",       33,  2.9,  6,  0.6],
    ["potato",      "Potato, baked",        "1 medium",   161,  4.3, 37,  0.2],
    ["sweet_potato","Sweet potato, baked",  "1 medium",   103,  2.3, 24,  0.2],
    ["carrots",     "Carrots, raw",         "1 cup",       52,  1.2, 12,  0.3],
    ["tomato",      "Tomato",               "1 medium",    22,  1.1,  4.8,0.2],
    ["cucumber",    "Cucumber",             "1 cup",       16,  0.7,  3.8,0.1],
    ["bell_pepper", "Bell pepper",          "1 medium",    31,  1,    7,  0.4],
    ["onion",       "Onion, chopped",       "1 cup",       64,  1.8, 15,  0.2],
    ["mushrooms",   "Mushrooms, raw",       "1 cup",       15,  2.2,  2.3,0.2],
    ["asparagus",   "Asparagus, cooked",    "1 cup",       40,  4.3,  7.4,0.4],
    ["green_beans", "Green beans, cooked",  "1 cup",       44,  2.4, 10,  0.4],
    ["corn",        "Corn, cooked",         "1 cup",      132,  5,   29,  2],
    ["cauliflower", "Cauliflower, cooked",  "1 cup",       29,  2.3,  5.1,0.6],
    ["brussels",    "Brussels sprouts",     "1 cup",       56,  4,   11,  0.8],
    ["lettuce",     "Lettuce, romaine",     "1 cup",        8,  0.6,  1.5,0.1],
    ["salad_mixed", "Mixed green salad",    "2 cups",      15,  1.5,  3,  0.2],
  ]),

  // ──────────────── Fats, sauces & condiments ────────────────
  ...G("Condiments", [
    ["olive_oil",   "Olive oil",            "1 tbsp",     119,  0,    0, 13.5],
    ["coconut_oil", "Coconut oil",          "1 tbsp",     121,  0,    0, 13.5],
    ["mayo",        "Mayonnaise",           "1 tbsp",      94,  0.1,  0.1,10],
    ["mayo_light",  "Mayonnaise, light",    "1 tbsp",      35,  0,    1,  3.5],
    ["ketchup",     "Ketchup",              "1 tbsp",      19,  0.2,  5,  0],
    ["mustard",     "Mustard",              "1 tsp",        3,  0.2,  0.3,0.2],
    ["ranch",       "Ranch dressing",       "2 tbsp",     129,  0.4,  2, 13],
    ["caesar_dress","Caesar dressing",      "2 tbsp",     163,  1,    1, 17],
    ["bbq_sauce",   "BBQ sauce",            "2 tbsp",      60,  0,   15,  0],
    ["soy_sauce",   "Soy sauce",            "1 tbsp",       8,  1.3,  0.8,0],
    ["sriracha",    "Sriracha",             "1 tsp",        5,  0,    1,  0],
    ["hot_sauce",   "Hot sauce",            "1 tsp",        1,  0,    0.1,0],
    ["salsa",       "Salsa",                "2 tbsp",       9,  0.4,  2,  0],
    ["guacamole",   "Guacamole",            "2 tbsp",      50,  0.6,  3,  4.5],
    ["hummus",      "Hummus",               "2 tbsp",      70,  2,    4,  5],
    ["honey",       "Honey",                "1 tbsp",      64,  0.1, 17,  0],
    ["maple_syrup", "Maple syrup",          "1 tbsp",      52,  0,   13,  0],
    ["sugar",       "Sugar",                "1 tsp",       16,  0,    4,  0],
  ]),

  // ──────────────── Supplements ────────────────
  ...G("Supplements", [
    ["whey",        "Whey protein powder",  "1 scoop",    120, 24,   3,  1.5],
    ["casein",      "Casein protein powder","1 scoop",    120, 24,   3,  1],
    ["plant_prot",  "Plant protein powder", "1 scoop",    120, 21,   5,  2],
    ["mass_gainer", "Mass gainer",          "1 scoop",    650, 50,  95, 10],
    ["creatine",    "Creatine monohydrate", "5 g",          0,  0,   0,  0],
    ["greens_pow",  "Greens powder",        "1 scoop",     40,  2,   6,  0],
  ]),

  // ──────────────── Snacks & sweets ────────────────
  ...G("Snacks", [
    ["chips_potato","Potato chips",         "1 oz",       160,  2,   15, 10],
    ["tortilla_chp","Tortilla chips",       "1 oz",       140,  2,   19,  7],
    ["pretzels",    "Pretzels",             "1 oz",       108,  2.6, 23,  0.8],
    ["popcorn",     "Popcorn, air-popped",  "1 cup",       31,  1,    6,  0.4],
    ["crackers",    "Crackers, cheese",     "1 oz",       150,  3,   17,  8],
    ["rice_cake",   "Rice cake",            "1 cake",      35,  0.7,  7.3,0.3],
    ["cookie_cc",   "Chocolate chip cookie","1 cookie",    78,  0.9, 10,  4],
    ["brownie",     "Brownie",              "1 square",   132,  1.7, 20,  5.5],
    ["donut_glaze", "Donut, glazed",        "1 donut",    240,  4,   29, 12],
    ["muffin_blue", "Blueberry muffin",     "1 muffin",   380,  6,   53, 16],
    ["choc_dark",   "Dark chocolate 70%",   "1 oz",       170,  2,   13, 12],
    ["choc_milk_br","Milk chocolate bar",   "1 oz",       150,  2,   17,  8.5],
    ["gummy_bears", "Gummy bears",          "1 oz",        95,  2,   22,  0],
    ["protein_shk", "Protein shake, bottled","1 bottle",  160, 30,    5,  3],
  ]),

  // ──────────────── Drinks ────────────────
  ...G("Drinks", [
    ["water",       "Water",                "1 cup",        0,  0,   0,  0],
    ["coffee_black","Coffee, black",        "1 cup",        2,  0.3, 0,  0],
    ["tea",         "Tea, unsweetened",     "1 cup",        2,  0,   0.5,0],
    ["oj",          "Orange juice",         "1 cup",      112,  1.7,26,  0.5],
    ["apple_juice", "Apple juice",          "1 cup",      114,  0.2,28,  0.3],
    ["soda_cola",   "Cola",                 "1 can (12oz)",140,  0,  39,  0],
    ["soda_diet",   "Diet soda",            "1 can (12oz)",  0,  0,   0,  0],
    ["sprite",      "Lemon-lime soda",      "1 can (12oz)",140,  0,  38,  0],
    ["gatorade",    "Gatorade",             "20 oz",      140,  0,  36,  0],
    ["red_bull",    "Red Bull",             "8.4 oz can", 110,  1,  28,  0],
    ["monster",     "Monster Energy",       "16 oz can",  210,  0,  54,  0],
    ["celsius",     "Celsius",              "12 oz can",   10,  0,   2,  0],
    ["beer",        "Beer, regular",        "12 oz",      153,  1.6,13,  0],
    ["beer_light",  "Beer, light",          "12 oz",      103,  0.9, 6,  0],
    ["wine_red",    "Wine, red",            "5 oz",       125,  0.1, 4,  0],
    ["wine_white",  "Wine, white",          "5 oz",       121,  0.1, 4,  0],
    ["vodka",       "Vodka / gin / rum",    "1.5 oz",      97,  0,   0,  0],
    ["whiskey",     "Whiskey",              "1.5 oz",     105,  0,   0,  0],
    ["margarita",   "Margarita",            "1 cocktail", 280,  0,  36,  0],
  ]),

  // ──────────────── Packaged protein bars ────────────────
  ...B("Quest",       "Bars", [["quest_bar", "Protein Bar", "1 bar", 190, 21, 22, 8]]),
  ...B("RXBAR",       "Bars", [["rxbar",     "Protein Bar", "1 bar", 210, 12, 24, 9]]),
  ...B("Clif",        "Bars", [["clif_bar",  "Energy Bar",  "1 bar", 250,  9, 45, 5]]),
  ...B("Pure Protein","Bars", [["pure_bar",  "Protein Bar", "1 bar", 200, 20, 17, 6]]),
  ...B("ONE",         "Bars", [["one_bar",   "Protein Bar", "1 bar", 220, 20, 23, 8]]),
  ...B("Built",       "Bars", [["built_bar", "Protein Bar", "1 bar", 130, 17, 17, 4]]),
  ...B("KIND",        "Bars", [["kind_bar",  "Nut Bar",     "1 bar", 200,  6, 16,15]]),
  ...B("Nature Valley","Bars",[["nv_bar",    "Granola Bar (2)", "1 pouch", 190, 4, 29, 7]]),

  // ════════════════ Restaurant chains (US menus) ════════════════

  ...B("McDonald's", "Fast food", [
    ["mcd_bigmac",    "Big Mac",                      "1 burger",   590, 25, 46, 34],
    ["mcd_qp",        "Quarter Pounder with Cheese",  "1 burger",   520, 30, 42, 26],
    ["mcd_dblqp",     "Double Quarter Pounder",       "1 burger",   740, 48, 43, 42],
    ["mcd_mcdouble",  "McDouble",                     "1 burger",   400, 22, 33, 20],
    ["mcd_cheese",    "Cheeseburger",                 "1 burger",   300, 15, 32, 13],
    ["mcd_hamburger", "Hamburger",                    "1 burger",   250, 12, 31,  9],
    ["mcd_mcchicken", "McChicken",                    "1 sandwich", 400, 14, 39, 21],
    ["mcd_mccrispy",  "McCrispy Chicken Sandwich",    "1 sandwich", 470, 26, 46, 20],
    ["mcd_filet",     "Filet-O-Fish",                 "1 sandwich", 390, 15, 39, 19],
    ["mcd_nug6",      "Chicken McNuggets (6 pc)",     "6 pieces",   250, 14, 15, 15],
    ["mcd_nug10",     "Chicken McNuggets (10 pc)",    "10 pieces",  410, 23, 25, 24],
    ["mcd_fries_sm",  "French Fries, small",          "1 small",    230,  3, 31, 11],
    ["mcd_fries_md",  "French Fries, medium",         "1 medium",   320,  5, 43, 15],
    ["mcd_fries_lg",  "French Fries, large",          "1 large",    480,  7, 64, 23],
    ["mcd_eggmcmuf",  "Egg McMuffin",                 "1 sandwich", 310, 17, 30, 13],
    ["mcd_sausmcmuf", "Sausage McMuffin with Egg",    "1 sandwich", 480, 20, 30, 31],
    ["mcd_baconegg",  "Bacon, Egg & Cheese Biscuit",  "1 biscuit",  460, 19, 38, 26],
    ["mcd_mcgriddle", "Sausage McGriddles",           "1 sandwich", 430, 11, 42, 24],
    ["mcd_hashbrown", "Hash Browns",                  "1 piece",    140,  1, 17,  8],
    ["mcd_hotcakes",  "Hotcakes",                     "3 hotcakes", 580,  9,101, 15],
    ["mcd_burrito",   "Sausage Burrito",              "1 burrito",  310, 13, 26, 17],
    ["mcd_mcflurry",  "McFlurry with OREO",           "1 regular",  510, 12, 80, 16],
    ["mcd_cone",      "Vanilla Cone",                 "1 cone",     200,  5, 32,  5],
    ["mcd_applepie",  "Baked Apple Pie",              "1 pie",      230,  2, 33, 11],
    ["mcd_coke_md",   "Coca-Cola, medium",            "1 medium",   210,  0, 58,  0],
  ]),

  ...B("Taco Bell", "Fast food", [
    ["tb_crunchy",    "Crunchy Taco",                 "1 taco",     170,  8, 13, 10],
    ["tb_soft",       "Soft Taco, beef",              "1 taco",     180,  9, 18,  9],
    ["tb_dorito",     "Doritos Locos Taco",           "1 taco",     170,  8, 13, 10],
    ["tb_bean_bur",   "Bean Burrito",                 "1 burrito",  350, 13, 54,  9],
    ["tb_bur_sup",    "Burrito Supreme, beef",        "1 burrito",  390, 16, 51, 14],
    ["tb_5layer",     "Beefy 5-Layer Burrito",        "1 burrito",  490, 18, 62, 18],
    ["tb_quesarito",  "Quesarito",                    "1 burrito",  650, 22, 68, 32],
    ["tb_quesadilla", "Chicken Quesadilla",           "1 quesadilla",510,27, 38, 27],
    ["tb_crunchwrap", "Crunchwrap Supreme",           "1 wrap",     530, 16, 71, 21],
    ["tb_chalupa",    "Chalupa Supreme, beef",        "1 chalupa",  350, 13, 30, 20],
    ["tb_mex_pizza",  "Mexican Pizza",                "1 pizza",    540, 20, 47, 30],
    ["tb_gordita",    "Cheesy Gordita Crunch",        "1 gordita",  500, 20, 41, 28],
    ["tb_nachos_bg",  "Nachos BellGrande",            "1 order",    740, 16, 82, 38],
    ["tb_power_bowl", "Power Menu Bowl, chicken",     "1 bowl",     470, 26, 50, 19],
    ["tb_fiesta_pot", "Cheesy Fiesta Potatoes",       "1 order",    250,  4, 28, 13],
    ["tb_cin_twists", "Cinnamon Twists",              "1 order",    170,  1, 27,  6],
  ]),

  ...B("Chipotle", "Fast food", [
    ["cmg_chicken",   "Chicken",                      "4 oz",       180, 32,  0,  7],
    ["cmg_steak",     "Steak",                        "4 oz",       150, 21,  1,  6],
    ["cmg_barbacoa",  "Barbacoa",                     "4 oz",       170, 24,  2,  7],
    ["cmg_carnitas",  "Carnitas",                     "4 oz",       210, 23,  0, 12],
    ["cmg_sofritas",  "Sofritas",                     "4 oz",       150,  8,  9, 10],
    ["cmg_rice_wh",   "White Rice",                   "4 oz",       210,  4, 40,  4],
    ["cmg_rice_br",   "Brown Rice",                   "4 oz",       210,  4, 36,  6],
    ["cmg_black_bn",  "Black Beans",                  "4 oz",       130,  8, 22,  1.5],
    ["cmg_pinto",     "Pinto Beans",                  "4 oz",       130,  8, 21,  1.5],
    ["cmg_fajita",    "Fajita Veggies",               "2 oz",        20,  1,  4,  0],
    ["cmg_salsa_mld", "Fresh Tomato Salsa",           "2 oz",        25,  1,  4,  0],
    ["cmg_salsa_cor", "Corn Salsa",                   "2 oz",        80,  3, 16,  1.5],
    ["cmg_cheese",    "Cheese",                       "1 oz",       110,  6,  1,  9],
    ["cmg_sour",      "Sour Cream",                   "2 oz",       110,  2,  2,  9],
    ["cmg_guac",      "Guacamole",                    "4 oz",       230,  2,  8, 22],
    ["cmg_queso",     "Queso Blanco",                 "2 oz",       120,  5,  4,  9],
    ["cmg_tortilla",  "Flour Tortilla (burrito)",     "1 tortilla", 320,  8, 50,  9],
    ["cmg_chips",     "Chips",                        "1 bag",      540,  7, 73, 25],
  ]),

  ...B("Chick-fil-A", "Fast food", [
    ["cfa_sandwich",  "Chicken Sandwich",             "1 sandwich", 440, 29, 41, 17],
    ["cfa_deluxe",    "Deluxe Chicken Sandwich",      "1 sandwich", 490, 33, 43, 21],
    ["cfa_spicy",     "Spicy Chicken Sandwich",       "1 sandwich", 450, 29, 42, 19],
    ["cfa_grilled",   "Grilled Chicken Sandwich",     "1 sandwich", 390, 28, 44, 12],
    ["cfa_nug8",      "Nuggets (8 ct)",               "8 pieces",   250, 27, 11, 11],
    ["cfa_nug12",     "Nuggets (12 ct)",              "12 pieces",  380, 40, 16, 17],
    ["cfa_gr_nug8",   "Grilled Nuggets (8 ct)",       "8 pieces",   130, 25,  1,  3],
    ["cfa_strips",    "Chick-n-Strips (3 ct)",        "3 strips",   310, 29, 15, 14],
    ["cfa_fries_md",  "Waffle Fries, medium",         "1 medium",   420,  5, 45, 24],
    ["cfa_mac",       "Mac & Cheese, medium",         "1 medium",   450, 19, 30, 29],
    ["cfa_cobb",      "Cobb Salad with chicken",      "1 salad",    510, 40, 28, 27],
    ["cfa_biscuit",   "Chicken Biscuit",              "1 biscuit",  460, 19, 45, 23],
    ["cfa_lemonade",  "Lemonade, medium",             "1 medium",   220,  0, 59,  0],
    ["cfa_shake",     "Cookies & Cream Milkshake",    "1 medium",   610, 13, 79, 27],
  ]),

  ...B("Wendy's", "Fast food", [
    ["wen_single",    "Dave's Single",                "1 burger",   570, 29, 39, 34],
    ["wen_double",    "Dave's Double",                "1 burger",   810, 48, 40, 51],
    ["wen_baconator", "Baconator",                    "1 burger",   950, 57, 40, 62],
    ["wen_jr_bacon",  "Jr. Bacon Cheeseburger",       "1 burger",   380, 20, 26, 21],
    ["wen_jr_cheese", "Jr. Cheeseburger",             "1 burger",   290, 15, 26, 14],
    ["wen_spicy_chk", "Spicy Chicken Sandwich",       "1 sandwich", 500, 29, 49, 21],
    ["wen_home_chk",  "Homestyle Chicken Sandwich",   "1 sandwich", 490, 28, 48, 21],
    ["wen_nug10",     "Chicken Nuggets (10 pc)",      "10 pieces",  420, 21, 26, 26],
    ["wen_fries_md",  "French Fries, medium",         "1 medium",   350,  5, 45, 17],
    ["wen_chili_sm",  "Chili, small",                 "1 small",    240, 17, 23,  8],
    ["wen_potato",    "Baked Potato, plain",          "1 potato",   270,  7, 61,  0],
    ["wen_frosty_sm", "Chocolate Frosty, small",      "1 small",    340,  9, 56,  9],
  ]),

  ...B("Burger King", "Fast food", [
    ["bk_whopper",    "Whopper",                      "1 burger",   670, 31, 51, 40],
    ["bk_whop_ch",    "Whopper with Cheese",          "1 burger",   760, 35, 52, 47],
    ["bk_dbl_whop",   "Double Whopper",               "1 burger",   900, 48, 51, 58],
    ["bk_cheese",     "Cheeseburger",                 "1 burger",   300, 15, 27, 14],
    ["bk_bacon_king", "Bacon King",                   "1 burger",  1150, 61, 49, 79],
    ["bk_og_chicken", "Original Chicken Sandwich",    "1 sandwich", 660, 24, 51, 40],
    ["bk_royal_crsp", "Royal Crispy Chicken",         "1 sandwich", 630, 25, 51, 36],
    ["bk_nug8",       "Chicken Nuggets (8 pc)",       "8 pieces",   350, 17, 19, 22],
    ["bk_fries_md",   "French Fries, medium",         "1 medium",   380,  4, 53, 17],
    ["bk_onion_ring", "Onion Rings, medium",          "1 medium",   410,  5, 52, 20],
    ["bk_croissan",   "Croissan'wich, sausage/egg/cheese","1 sandwich",500,19,28,34],
  ]),

  ...B("KFC", "Fast food", [
    ["kfc_og_breast", "Original Recipe Breast",       "1 breast",   390, 39, 11, 21],
    ["kfc_og_thigh",  "Original Recipe Thigh",        "1 thigh",    280, 19,  8, 19],
    ["kfc_og_drum",   "Original Recipe Drumstick",    "1 drumstick",130, 12,  4,  8],
    ["kfc_og_wing",   "Original Recipe Wing",         "1 wing",     130, 10,  4,  8],
    ["kfc_xcrisp",    "Extra Crispy Breast",          "1 breast",   530, 35, 19, 35],
    ["kfc_tenders3",  "Crispy Tenders (3 pc)",        "3 tenders",  350, 33, 17, 17],
    ["kfc_famous",    "Famous Bowl",                  "1 bowl",     720, 26, 80, 34],
    ["kfc_potpie",    "Chicken Pot Pie",              "1 pie",      720, 27, 60, 41],
    ["kfc_mashed",    "Mashed Potatoes with Gravy",   "1 side",     130,  2, 20,  4],
    ["kfc_slaw",      "Coleslaw",                     "1 side",     170,  1, 22,  9],
    ["kfc_biscuit",   "Biscuit",                      "1 biscuit",  180,  4, 23,  8],
    ["kfc_mac",       "Mac & Cheese",                 "1 side",     170,  6, 19,  8],
  ]),

  ...B("Subway", "Fast food", [
    ["sub_turkey",    "Turkey Breast (6 in)",         "6 inch",     280, 18, 46,  3.5],
    ["sub_ham",       "Black Forest Ham (6 in)",      "6 inch",     280, 18, 47,  4],
    ["sub_bmt",       "Italian B.M.T. (6 in)",        "6 inch",     390, 20, 45, 15],
    ["sub_meatball",  "Meatball Marinara (6 in)",     "6 inch",     480, 21, 60, 18],
    ["sub_tuna",      "Tuna (6 in)",                  "6 inch",     470, 20, 44, 25],
    ["sub_rotis",     "Rotisserie Chicken (6 in)",    "6 inch",     320, 29, 45,  5],
    ["sub_steak",     "Steak & Cheese (6 in)",        "6 inch",     380, 26, 46, 10],
    ["sub_teriyaki",  "Chicken Teriyaki (6 in)",      "6 inch",     350, 26, 53,  4.5],
    ["sub_spicy_it",  "Spicy Italian (6 in)",         "6 inch",     470, 20, 44, 24],
    ["sub_veggie",    "Veggie Delite (6 in)",         "6 inch",     200,  8, 40,  2],
    ["sub_coldcut",   "Cold Cut Combo (6 in)",        "6 inch",     310, 16, 45,  9],
  ]),

  ...B("Starbucks", "Coffee", [
    ["sbx_pike",      "Pike Place Roast, grande",     "16 oz",        5,  1,  0,  0],
    ["sbx_coldbrew",  "Cold Brew, grande",            "16 oz",        5,  0,  0,  0],
    ["sbx_latte",     "Caffè Latte, grande (2%)",     "16 oz",      190, 13, 19,  7],
    ["sbx_capp",      "Cappuccino, grande (2%)",      "16 oz",      140,  9, 14,  5],
    ["sbx_caramel_m", "Caramel Macchiato, grande",    "16 oz",      250, 10, 35,  7],
    ["sbx_van_latte", "Vanilla Latte, grande",        "16 oz",      250, 12, 35,  6],
    ["sbx_mocha",     "Caffè Mocha, grande",          "16 oz",      370, 14, 44, 15],
    ["sbx_brown_sug", "Brown Sugar Oatmilk Espresso", "16 oz",      120,  1, 20,  3],
    ["sbx_matcha",    "Matcha Latte, grande",         "16 oz",      240, 12, 34,  7],
    ["sbx_frap_car",  "Caramel Frappuccino, grande",  "16 oz",      380,  4, 54, 16],
    ["sbx_bacon_gou", "Bacon & Gouda Sandwich",       "1 sandwich", 360, 18, 32, 18],
    ["sbx_spin_feta", "Spinach & Feta Wrap",          "1 wrap",     290, 20, 34,  8],
    ["sbx_croissant", "Butter Croissant",             "1 croissant",260,  5, 26, 14],
    ["sbx_cake_pop",  "Cake Pop",                     "1 pop",      140,  1, 19,  7],
    ["sbx_banana_br", "Banana Nut Bread",             "1 slice",    420,  6, 57, 19],
  ]),

  ...B("Dunkin'", "Coffee", [
    ["dnk_coffee",    "Coffee, black, medium",        "1 medium",     5,  0,  1,  0],
    ["dnk_iced_lat",  "Iced Latte, medium",           "1 medium",   120,  7, 12,  5],
    ["dnk_glazed",    "Glazed Donut",                 "1 donut",    240,  4, 29, 12],
    ["dnk_boston",    "Boston Kreme Donut",           "1 donut",    300,  4, 40, 14],
    ["dnk_munchkin",  "Glazed Munchkins (5)",         "5 pieces",   270,  4, 36, 13],
    ["dnk_bagel_cc",  "Everything Bagel w/ cream cheese","1 bagel", 480, 15, 71, 16],
    ["dnk_wakeup",    "Wake-Up Wrap, bacon",          "1 wrap",     180,  8, 14, 10],
    ["dnk_sausage",   "Sausage, Egg & Cheese Croissant","1 sandwich",700,22, 39, 50],
  ]),

  ...B("Domino's", "Pizza", [
    ["dom_cheese",    "Cheese Pizza (medium, hand tossed)","1 slice",200, 8, 25,  7],
    ["dom_pepperoni", "Pepperoni Pizza (medium)",     "1 slice",    220,  9, 25,  9],
    ["dom_sausage",   "Sausage Pizza (medium)",       "1 slice",    240, 10, 26, 11],
    ["dom_extrav",    "ExtravaganZZa (medium)",       "1 slice",    260, 11, 26, 13],
    ["dom_twists",    "Garlic Bread Twists",          "1 twist",    140,  3, 18,  6],
    ["dom_wings",     "Hot Buffalo Wings",            "2 wings",    170, 16,  1, 11],
  ]),

  ...B("Pizza Hut", "Pizza", [
    ["ph_cheese_pan", "Cheese Pizza (medium pan)",    "1 slice",    240, 10, 26, 11],
    ["ph_pep_pan",    "Pepperoni Pizza (medium pan)", "1 slice",    250, 10, 26, 12],
    ["ph_supreme",    "Supreme Pizza (medium pan)",   "1 slice",    280, 12, 27, 14],
    ["ph_thin_chz",   "Cheese Pizza (medium thin)",   "1 slice",    190,  9, 20,  8],
    ["ph_breadstick", "Breadstick",                   "1 stick",    140,  4, 19,  5],
  ]),

  ...B("Papa John's", "Pizza", [
    ["pj_cheese",     "Cheese Pizza (medium original)","1 slice",   210,  9, 26,  8],
    ["pj_pepperoni",  "Pepperoni Pizza (medium)",     "1 slice",    230, 10, 26, 10],
    ["pj_garlic_kn",  "Garlic Knots",                 "1 knot",     150,  4, 19,  7],
  ]),

  ...B("Panda Express", "Fast food", [
    ["pnd_orange",    "Orange Chicken",               "1 entrée",   490, 25, 51, 23],
    ["pnd_beijing",   "Beijing Beef",                 "1 entrée",   470, 14, 46, 26],
    ["pnd_kungpao",   "Kung Pao Chicken",             "1 entrée",   290, 16, 14, 19],
    ["pnd_broc_beef", "Broccoli Beef",                "1 entrée",   150,  9, 13,  7],
    ["pnd_honey_shr", "Honey Walnut Shrimp",          "1 entrée",   360, 13, 27, 23],
    ["pnd_teriyaki",  "Grilled Teriyaki Chicken",     "1 entrée",   300, 36,  8, 13],
    ["pnd_chow_mein", "Chow Mein",                    "1 side",     510, 13, 80, 20],
    ["pnd_fried_rice","Fried Rice",                   "1 side",     520, 11, 85, 16],
    ["pnd_white_rice","White Steamed Rice",           "1 side",     380,  7, 87,  0],
    ["pnd_greens",    "Super Greens",                 "1 side",      90,  6, 10,  3],
    ["pnd_rangoon",   "Cream Cheese Rangoon (3)",     "3 pieces",   190,  5, 24,  8],
  ]),

  ...B("Five Guys", "Fast food", [
    ["fg_hamburger",  "Hamburger",                    "1 burger",   700, 39, 39, 43],
    ["fg_cheese",     "Cheeseburger",                 "1 burger",   840, 47, 40, 55],
    ["fg_bacon_chz",  "Bacon Cheeseburger",           "1 burger",   920, 51, 40, 62],
    ["fg_little_ham", "Little Hamburger",             "1 burger",   480, 23, 39, 26],
    ["fg_fries_reg",  "Fries, regular",               "1 regular",  950, 15,123, 41],
    ["fg_fries_lit",  "Fries, little",                "1 little",   530,  8, 68, 23],
  ]),

  ...B("In-N-Out", "Fast food", [
    ["ino_hamburger", "Hamburger with onion",         "1 burger",   390, 16, 39, 19],
    ["ino_cheese",    "Cheeseburger with onion",      "1 burger",   480, 22, 39, 27],
    ["ino_double",    "Double-Double",                "1 burger",   670, 37, 39, 41],
    ["ino_protein",   "Cheeseburger, protein style",  "1 burger",   330, 18, 11, 25],
    ["ino_fries",     "French Fries",                 "1 order",    370,  7, 54, 15],
    ["ino_shake",     "Vanilla Shake",                "1 shake",    590, 13, 78, 27],
  ]),

  ...B("Shake Shack", "Fast food", [
    ["ss_shackburger","ShackBurger, single",          "1 burger",   530, 28, 25, 33],
    ["ss_smokeshack", "SmokeShack, single",           "1 burger",   620, 32, 26, 40],
    ["ss_chicken",    "Chicken Shack",                "1 sandwich", 550, 30, 45, 27],
    ["ss_fries",      "Crinkle Cut Fries",            "1 order",    420,  6, 54, 21],
    ["ss_cheese_fry", "Cheese Fries",                 "1 order",    590, 12, 58, 34],
    ["ss_shake_van",  "Vanilla Shake",                "1 shake",    690, 14, 84, 34],
  ]),

  ...B("Popeyes", "Fast food", [
    ["pop_sandwich",  "Chicken Sandwich, classic",    "1 sandwich", 700, 28, 50, 42],
    ["pop_spicy_sw",  "Spicy Chicken Sandwich",       "1 sandwich", 700, 28, 50, 42],
    ["pop_breast",    "Mild Chicken Breast",          "1 breast",   380, 31, 16, 20],
    ["pop_tender",    "Handcrafted Tender",           "1 tender",   130, 10,  7,  6],
    ["pop_fries",     "Cajun Fries, regular",         "1 regular",  260,  4, 33, 13],
    ["pop_red_beans", "Red Beans & Rice, regular",    "1 regular",  230,  6, 26, 11],
    ["pop_biscuit",   "Biscuit",                      "1 biscuit",  200,  3, 22, 11],
  ]),

  ...B("Raising Cane's", "Fast food", [
    ["rc_finger",     "Chicken Finger",               "1 finger",   130, 10,  6,  7],
    ["rc_box",        "Box Combo (3 tenders)",        "1 combo",   1190, 47,110, 61],
    ["rc_fries",      "Crinkle-Cut Fries",            "1 order",    320,  5, 43, 15],
    ["rc_sauce",      "Cane's Sauce",                 "1 serving",  190,  1,  4, 19],
    ["rc_toast",      "Texas Toast",                  "1 slice",    150,  3, 19,  7],
  ]),

  ...B("Arby's", "Fast food", [
    ["arb_classic",   "Classic Roast Beef",           "1 sandwich", 360, 23, 37, 14],
    ["arb_beef_ched", "Beef 'n Cheddar",              "1 sandwich", 450, 23, 45, 20],
    ["arb_half_lb",   "Half Pound Roast Beef",        "1 sandwich", 610, 43, 39, 32],
    ["arb_curly_md",  "Curly Fries, medium",          "1 medium",   410,  5, 51, 21],
    ["arb_turkey",    "Roast Turkey & Swiss",         "1 sandwich", 600, 41, 52, 24],
  ]),

  ...B("Jack in the Box", "Fast food", [
    ["jib_jumbo",     "Jumbo Jack",                   "1 burger",   570, 22, 51, 31],
    ["jib_tacos",     "Tacos (2)",                    "2 tacos",    340, 10, 30, 20],
    ["jib_curly_md",  "Curly Fries, medium",          "1 medium",   400,  6, 47, 21],
    ["jib_sourdough", "Sourdough Jack",               "1 burger",   710, 30, 37, 48],
  ]),

  ...B("Sonic", "Fast food", [
    ["son_cheeseburg","SONIC Cheeseburger",           "1 burger",   640, 27, 57, 34],
    ["son_tots_md",   "Tater Tots, medium",           "1 medium",   260,  3, 30, 15],
    ["son_corndog",   "Corn Dog",                     "1 corn dog", 210,  6, 23, 11],
    ["son_shake_van", "Vanilla Shake, medium",        "1 medium",   540, 11, 71, 24],
  ]),

  ...B("Whataburger", "Fast food", [
    ["wb_whataburger","Whataburger",                  "1 burger",   590, 27, 55, 27],
    ["wb_honey_bisc", "Honey Butter Chicken Biscuit", "1 biscuit",  610, 15, 55, 36],
    ["wb_fries_md",   "French Fries, medium",         "1 medium",   420,  5, 52, 21],
    ["wb_patty_melt", "Patty Melt",                   "1 burger",   770, 39, 45, 47],
  ]),

  ...B("Dairy Queen", "Fast food", [
    ["dq_blizz_oreo", "OREO Blizzard, small",         "1 small",    480, 10, 71, 17],
    ["dq_cheeseburg", "Cheeseburger",                 "1 burger",   400, 21, 33, 20],
    ["dq_strip4",     "Chicken Strip Basket (4 pc)",  "1 basket",  1000, 40, 89, 52],
    ["dq_cone_med",   "Vanilla Cone, medium",         "1 medium",   340,  8, 53, 10],
  ]),

  ...B("Wingstop", "Fast food", [
    ["ws_classic",    "Classic Wing (bone-in)",       "1 wing",      80,  6,  2,  5],
    ["ws_boneless",   "Boneless Wing",                "1 wing",      60,  4,  5,  3],
    ["ws_fries_reg",  "Seasoned Fries, regular",      "1 regular",  480,  6, 62, 23],
    ["ws_ranch",      "Ranch Dip",                    "1 serving",  310,  1,  2, 33],
  ]),

  ...B("Buffalo Wild Wings", "Restaurant", [
    ["bww_trad",      "Traditional Wing, plain",      "1 wing",     100,  9,  0,  7],
    ["bww_boneless",  "Boneless Wing, plain",         "1 wing",      70,  5,  5,  3],
    ["bww_fries",     "French Fries, regular",        "1 regular",  430,  6, 58, 20],
    ["bww_mozz",      "Mozzarella Sticks (5)",        "5 sticks",   660, 28, 52, 38],
  ]),

  ...B("Jersey Mike's", "Fast food", [
    ["jm_turkey_reg", "#7 Turkey & Provolone, regular","1 sub",     590, 34, 60, 22],
    ["jm_italian",    "#13 The Original Italian, regular","1 sub",  780, 39, 62, 42],
    ["jm_cheesesteak","Philly Cheese Steak, regular", "1 sub",      680, 45, 62, 27],
  ]),

  ...B("Jimmy John's", "Fast food", [
    ["jj_pepe",       "#1 Pepe (8 in)",               "1 sub",      640, 27, 55, 33],
    ["jj_turkey_tom", "#4 Turkey Tom (8 in)",         "1 sub",      510, 24, 54, 21],
    ["jj_italian",    "#9 Italian Night Club (8 in)", "1 sub",      900, 41, 57, 54],
  ]),

  ...B("Panera", "Restaurant", [
    ["pan_broc_ched", "Broccoli Cheddar Soup, cup",   "1 cup",      230,  9, 16, 15],
    ["pan_mac",       "Mac & Cheese, small",          "1 small",    480, 19, 38, 28],
    ["pan_caesar",    "Caesar Salad with chicken",    "1 salad",    470, 34, 19, 28],
    ["pan_turkey_br", "Bacon Turkey Bravo, whole",    "1 sandwich", 750, 47, 79, 27],
    ["pan_cin_bagel", "Cinnamon Crunch Bagel",        "1 bagel",    430, 11, 81,  7],
  ]),

  ...B("Olive Garden", "Restaurant", [
    ["og_breadstick", "Breadstick",                   "1 stick",    140,  5, 28,  3],
    ["og_alfredo",    "Fettuccine Alfredo",           "1 entrée",  1310, 33,111, 79],
    ["og_chk_alfredo","Chicken Alfredo",              "1 entrée",  1550, 76,113, 87],
    ["og_zuppa",      "Zuppa Toscana, bowl",          "1 bowl",     340, 13, 23, 22],
    ["og_salad",      "House Salad with dressing",    "1 serving",  150,  3, 12, 10],
  ]),

  ...B("Chili's", "Restaurant", [
    ["chi_eggrolls",  "Southwestern Eggrolls",        "1 order",    810, 33, 68, 45],
    ["chi_crispers",  "Chicken Crispers, original",   "1 entrée",  1310, 52,110, 73],
    ["chi_oldtimer",  "Oldtimer Burger with cheese",  "1 burger",   870, 45, 52, 51],
    ["chi_sirloin",   "6 oz Sirloin",                 "1 steak",    260, 40,  1, 11],
  ]),

  ...B("Applebee's", "Restaurant", [
    ["app_riblet",    "Riblet Basket",                "1 entrée",  1080, 44, 98, 56],
    ["app_oriental",  "Crispy Chicken Salad",         "1 salad",    950, 39, 71, 56],
    ["app_burger",    "Classic Bacon Cheeseburger",   "1 burger",  1150, 61, 66, 71],
  ]),

  ...B("Texas Roadhouse", "Restaurant", [
    ["tr_sirloin6",   "6 oz Sirloin",                 "1 steak",    240, 38,  0,  9],
    ["tr_ribeye12",   "12 oz Ribeye",                 "1 steak",    900, 66,  0, 70],
    ["tr_roll",       "Roll with cinnamon butter",    "1 roll",     227,  4, 32,  9],
    ["tr_loaded_pot", "Loaded Baked Potato",          "1 potato",   500, 14, 62, 22],
  ]),

  ...B("Cheesecake Factory", "Restaurant", [
    ["cf_cheesecake", "Original Cheesecake",          "1 slice",    830, 13, 66, 57],
    ["cf_chk_madeira","Chicken Madeira",              "1 entrée",  1350, 84, 87, 76],
    ["cf_brown_bread","Brown Bread",                  "1 slice",    120,  4, 23,  1.5],
  ]),

  ...B("IHOP", "Restaurant", [
    ["ihop_pancakes", "Buttermilk Pancakes (2)",      "2 pancakes", 340,  9, 55,  9],
    ["ihop_waffle",   "Belgian Waffle",               "1 waffle",   590, 12, 62, 33],
    ["ihop_omelet",   "Colorado Omelette",            "1 omelette", 950, 56, 21, 71],
  ]),

  ...B("Denny's", "Restaurant", [
    ["den_grand_slam","Original Grand Slam",          "1 plate",    790, 33, 66, 44],
    ["den_pancakes",  "Buttermilk Pancakes (3)",      "3 pancakes", 510, 12, 92, 10],
  ]),

  ...B("Waffle House", "Restaurant", [
    ["wh_waffle",     "Original Waffle",              "1 waffle",   410,  8, 40, 24],
    ["wh_hashbrown",  "Hashbrowns, regular",          "1 regular",  250,  3, 25, 15],
  ]),

  ...B("Qdoba", "Fast food", [
    ["qdb_chk_bowl",  "Chicken Burrito Bowl",         "1 bowl",     680, 45, 62, 26],
    ["qdb_queso",     "3-Cheese Queso",               "2 oz",       120,  5,  4,  9],
  ]),

  ...B("Del Taco", "Fast food", [
    ["dt_taco",       "Crunchy Taco",                 "1 taco",     170,  7, 12, 10],
    ["dt_bean_chz",   "Bean & Cheese Burrito",        "1 burrito",  460, 18, 61, 16],
  ]),
];

export const FOOD_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));

export function foodById(id) { return FOOD_BY_ID[id] || null; }

// display label: "McDonald's · Big Mac" vs plain "Banana"
export function foodLabel(f) { return f.brand ? `${f.brand} · ${f.name}` : f.name; }

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Everyday staples and each chain's best-known items. Without this, "egg"
// surfaces "Egg yolk" before "Egg, large" purely because the name is shorter.
const POPULAR = new Set([
  "f_egg_lg", "f_egg_white", "f_egg_boiled", "f_chk_breast", "f_beef_9010", "f_bacon",
  "f_salmon", "f_tuna_can", "f_shrimp", "f_turkey_ground", "f_pork_chop",
  "f_rice_white", "f_rice_brown", "f_oats_dry", "f_pasta", "f_bread_wheat",
  "f_tortilla_fl", "f_quinoa", "f_potato", "f_sweet_potato", "f_broccoli", "f_spinach_raw",
  "f_milk_2", "f_yog_greek_nf", "f_cottage_1", "f_cheddar", "f_string_cheese", "f_butter",
  "f_banana", "f_apple", "f_orange", "f_blueberry", "f_avocado",
  "f_peanut_butter", "f_almonds", "f_black_beans", "f_olive_oil",
  "f_whey", "f_protein_shk", "f_coffee_black", "f_water",
  "f_mcd_bigmac", "f_mcd_fries_md", "f_mcd_nug10", "f_mcd_eggmcmuf", "f_mcd_mcchicken",
  "f_tb_crunchy", "f_tb_crunchwrap", "f_tb_bean_bur", "f_cmg_chicken", "f_cmg_rice_wh",
  "f_cfa_sandwich", "f_cfa_nug8", "f_cfa_fries_md", "f_wen_single", "f_bk_whopper",
  "f_kfc_og_breast", "f_sub_turkey", "f_sbx_latte", "f_sbx_pike", "f_dnk_glazed",
  "f_dom_pepperoni", "f_ph_pep_pan", "f_pnd_orange", "f_fg_cheese", "f_ino_double",
  "f_pop_sandwich",
]);

// The one obvious answer to a bare one-word search ("egg", "rice", "milk").
// Without this, "Egg white" edges out "Egg, large" on name length alone.
const CANONICAL = new Set([
  "f_egg_lg", "f_chk_breast", "f_rice_white", "f_milk_2", "f_banana", "f_apple",
  "f_coffee_black", "f_water", "f_bread_wheat", "f_potato", "f_oats_dry",
  "f_salmon", "f_pasta", "f_cheddar", "f_beef_9010", "f_avocado", "f_bacon",
]);

// Ranked search over name + brand. Every whitespace-separated term must match
// somewhere, so "mcd fries" and "chicken breast" both work.
export function searchFoods(query, limit = 40) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = [];

  for (const f of FOODS) {
    const name = f.name.toLowerCase();
    const brand = f.brand.toLowerCase();
    const hay = brand ? `${brand} ${name}` : name;
    if (!terms.every(t => hay.includes(t))) continue;

    let score = 0;
    if (name === q) score += 150;
    else if (name.startsWith(q)) score += 120;
    else if (new RegExp(`\\b${escapeRe(q)}`).test(name)) score += 70;
    else if (name.includes(q)) score += 35;
    if (brand && brand.startsWith(terms[0])) score += 50;
    if (!brand) score += 25;                  // bare "chicken" usually means the ingredient
    if (POPULAR.has(f.id)) score += 60;
    if (CANONICAL.has(f.id)) score += 50;
    score -= Math.min(12, name.length / 6);   // mild nudge toward shorter names
    scored.push({ f, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(x => x.f);
}
