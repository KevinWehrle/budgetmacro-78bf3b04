import { TrendingUp, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface ValueFood {
  name: string;
  proteinPerDollar: number;
  protein: number;
  cost: number;
  emoji: string;
  image?: string;
  keywords: string[];
}

const valueFoods: ValueFood[] = [
  // Top value proteins
  { name: "Lentils (dry, 1 cup)", proteinPerDollar: 36, protein: 18, cost: 0.5, emoji: "🥣", image: "https://images.unsplash.com/photo-1585996746858-c6cf0ada6d77?w=100&h=100&fit=crop", keywords: ["lentils", "legume", "vegan", "vegetarian", "soup", "dal", "curry"] },
  { name: "Protein Powder (serving)", proteinPerDollar: 31, protein: 25, cost: 0.8, emoji: "💪", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&h=100&fit=crop", keywords: ["protein", "powder", "whey", "shake", "supplement", "gym", "workout"] },
  { name: "Eggs (dozen)", proteinPerDollar: 24, protein: 72, cost: 3.0, emoji: "🥚", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop", keywords: ["egg", "eggs", "dozen", "breakfast", "omelette", "scrambled", "boiled", "fried"] },
  { name: "Milk (gallon)", proteinPerDollar: 24, protein: 96, cost: 4.0, emoji: "🥛", keywords: ["milk", "dairy", "drink", "beverage", "whole", "skim", "2%"] },
  { name: "Chicken Breast (lb)", proteinPerDollar: 22, protein: 110, cost: 5.0, emoji: "🍗", keywords: ["chicken", "breast", "poultry", "meat", "grilled", "baked"] },
  { name: "Canned Tuna", proteinPerDollar: 22, protein: 22, cost: 1.0, emoji: "🐟", keywords: ["tuna", "fish", "canned", "seafood", "sandwich"] },
  { name: "Split Peas (dry, 1 cup)", proteinPerDollar: 32, protein: 16, cost: 0.5, emoji: "🫛", keywords: ["peas", "split", "legume", "soup", "vegan"] },
  { name: "Tofu (block)", proteinPerDollar: 20, protein: 40, cost: 2.0, emoji: "🍲", keywords: ["tofu", "soy", "vegan", "vegetarian", "plant", "stir fry"] },
  { name: "Chickpeas (can)", proteinPerDollar: 19, protein: 19, cost: 1.0, emoji: "🫘", keywords: ["chickpeas", "garbanzo", "hummus", "legume", "vegan", "falafel"] },
  { name: "Peanut Butter (2 tbsp)", proteinPerDollar: 17.5, protein: 7, cost: 0.4, emoji: "🥜", keywords: ["peanut", "butter", "nut", "spread", "snack", "sandwich", "pb"] },
  { name: "Greek Yogurt", proteinPerDollar: 17, protein: 17, cost: 1.0, emoji: "🥛", keywords: ["yogurt", "greek", "dairy", "breakfast", "snack", "parfait"] },
  { name: "Edamame (cup)", proteinPerDollar: 17, protein: 17, cost: 1.0, emoji: "🫛", keywords: ["edamame", "soy", "beans", "snack", "japanese", "vegan"] },
  { name: "Black Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, emoji: "🫘", keywords: ["beans", "black", "legume", "vegan", "vegetarian", "burrito", "mexican"] },
  { name: "Sardines (can)", proteinPerDollar: 15, protein: 23, cost: 1.5, emoji: "🐠", keywords: ["sardines", "fish", "canned", "seafood", "omega", "mediterranean"] },
  { name: "Cottage Cheese", proteinPerDollar: 14, protein: 28, cost: 2.0, emoji: "🧀", keywords: ["cottage", "cheese", "dairy", "snack"] },
  { name: "Kidney Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, emoji: "🫘", keywords: ["kidney", "beans", "legume", "chili", "vegan"] },
  { name: "Turkey (ground, lb)", proteinPerDollar: 20, protein: 100, cost: 5.0, emoji: "🦃", keywords: ["turkey", "ground", "meat", "lean", "poultry"] },
  { name: "Pinto Beans (can)", proteinPerDollar: 14, protein: 14, cost: 1.0, emoji: "🫘", keywords: ["pinto", "beans", "legume", "refried", "mexican", "burrito"] },
  { name: "Tilapia (lb)", proteinPerDollar: 16, protein: 80, cost: 5.0, emoji: "🐟", keywords: ["tilapia", "fish", "seafood", "white fish", "baked"] },
  { name: "Canned Salmon", proteinPerDollar: 13, protein: 39, cost: 3.0, emoji: "🐟", keywords: ["salmon", "fish", "canned", "seafood", "omega", "pink"] },
  { name: "Beef (ground, lb)", proteinPerDollar: 15, protein: 75, cost: 5.0, emoji: "🥩", keywords: ["beef", "ground", "meat", "burger", "red meat", "hamburger"] },
  { name: "Ham (lb)", proteinPerDollar: 16, protein: 80, cost: 5.0, emoji: "🍖", keywords: ["ham", "pork", "deli", "sandwich", "meat"] },
  { name: "Tempeh (block)", proteinPerDollar: 12, protein: 30, cost: 2.5, emoji: "🍲", keywords: ["tempeh", "soy", "vegan", "vegetarian", "fermented", "indonesian"] },
  { name: "Quinoa (dry, 1 cup)", proteinPerDollar: 8, protein: 24, cost: 3.0, emoji: "🌾", keywords: ["quinoa", "grain", "complete protein", "vegan", "gluten free"] },
  { name: "Almonds (1 oz)", proteinPerDollar: 10, protein: 6, cost: 0.6, emoji: "🌰", keywords: ["almonds", "nuts", "snack", "healthy fats"] },
  { name: "Cheddar Cheese (oz)", proteinPerDollar: 10, protein: 7, cost: 0.7, emoji: "🧀", keywords: ["cheddar", "cheese", "dairy", "snack"] },
  { name: "Mozzarella (oz)", proteinPerDollar: 9, protein: 6, cost: 0.65, emoji: "🧀", keywords: ["mozzarella", "cheese", "dairy", "pizza", "italian"] },
  { name: "Pork Chops (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, emoji: "🥩", keywords: ["pork", "chops", "meat", "grilled"] },
  { name: "Shrimp (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, emoji: "🦐", keywords: ["shrimp", "seafood", "shellfish", "prawns"] },
  { name: "Ricotta Cheese (cup)", proteinPerDollar: 9, protein: 28, cost: 3.0, emoji: "🧀", keywords: ["ricotta", "cheese", "dairy", "italian", "lasagna"] },
  { name: "Seitan (4 oz)", proteinPerDollar: 12, protein: 24, cost: 2.0, emoji: "🌾", keywords: ["seitan", "wheat", "gluten", "vegan", "meat substitute"] },
  { name: "Oats (1 cup dry)", proteinPerDollar: 13, protein: 13, cost: 1.0, emoji: "🥣", keywords: ["oats", "oatmeal", "breakfast", "fiber", "whole grain"] },
  { name: "Chia Seeds (2 tbsp)", proteinPerDollar: 5, protein: 5, cost: 1.0, emoji: "🌱", keywords: ["chia", "seeds", "superfood", "omega", "vegan"] },
  { name: "Hemp Seeds (3 tbsp)", proteinPerDollar: 7, protein: 10, cost: 1.5, emoji: "🌱", keywords: ["hemp", "seeds", "complete protein", "vegan", "omega"] },
  { name: "Skyr (container)", proteinPerDollar: 11, protein: 17, cost: 1.5, emoji: "🥛", keywords: ["skyr", "icelandic", "yogurt", "dairy", "high protein"] },
  { name: "Lamb (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, emoji: "🥩", keywords: ["lamb", "meat", "red meat", "roast"] },
  { name: "Venison (lb)", proteinPerDollar: 7, protein: 80, cost: 12.0, emoji: "🦌", keywords: ["venison", "deer", "game", "meat", "lean"] },
  { name: "Bison (lb)", proteinPerDollar: 6, protein: 80, cost: 14.0, emoji: "🦬", keywords: ["bison", "buffalo", "meat", "lean", "red meat"] },
  { name: "Duck (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, emoji: "🦆", keywords: ["duck", "poultry", "meat", "game"] },
  { name: "Cod (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, emoji: "🐟", keywords: ["cod", "fish", "white fish", "seafood", "baked"] },
  { name: "Mackerel (can)", proteinPerDollar: 12, protein: 18, cost: 1.5, emoji: "🐟", keywords: ["mackerel", "fish", "canned", "omega", "seafood"] },
  { name: "Anchovies (can)", proteinPerDollar: 14, protein: 21, cost: 1.5, emoji: "🐟", keywords: ["anchovies", "fish", "canned", "pizza", "caesar"] },
  { name: "Clams (can)", proteinPerDollar: 11, protein: 22, cost: 2.0, emoji: "🦪", keywords: ["clams", "shellfish", "seafood", "chowder"] },
  { name: "Mussels (lb)", proteinPerDollar: 8, protein: 40, cost: 5.0, emoji: "🦪", keywords: ["mussels", "shellfish", "seafood", "steamed"] },
  { name: "Crab (can)", proteinPerDollar: 8, protein: 24, cost: 3.0, emoji: "🦀", keywords: ["crab", "shellfish", "seafood", "crab cake"] },
  { name: "Lobster (lb)", proteinPerDollar: 4, protein: 80, cost: 20.0, emoji: "🦞", keywords: ["lobster", "shellfish", "seafood", "luxury"] },
  { name: "Scallops (lb)", proteinPerDollar: 6, protein: 60, cost: 10.0, emoji: "🦪", keywords: ["scallops", "shellfish", "seafood", "seared"] },
  { name: "Swordfish (lb)", proteinPerDollar: 6, protein: 80, cost: 14.0, emoji: "🐟", keywords: ["swordfish", "fish", "steak", "grilled"] },
  { name: "Halibut (lb)", proteinPerDollar: 5, protein: 80, cost: 16.0, emoji: "🐟", keywords: ["halibut", "fish", "white fish", "seafood"] },
  { name: "Trout (lb)", proteinPerDollar: 9, protein: 72, cost: 8.0, emoji: "🐟", keywords: ["trout", "fish", "freshwater", "pan fried"] },
  { name: "Catfish (lb)", proteinPerDollar: 11, protein: 66, cost: 6.0, emoji: "🐟", keywords: ["catfish", "fish", "fried", "southern"] },
  { name: "Pollock (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, emoji: "🐟", keywords: ["pollock", "fish", "white fish", "fish sticks"] },
  { name: "Haddock (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, emoji: "🐟", keywords: ["haddock", "fish", "white fish", "fish and chips"] },
  { name: "Flounder (lb)", proteinPerDollar: 10, protein: 60, cost: 6.0, emoji: "🐟", keywords: ["flounder", "fish", "flatfish", "baked"] },
  { name: "Perch (lb)", proteinPerDollar: 10, protein: 70, cost: 7.0, emoji: "🐟", keywords: ["perch", "fish", "freshwater", "pan fried"] },
  { name: "Sole (lb)", proteinPerDollar: 8, protein: 60, cost: 8.0, emoji: "🐟", keywords: ["sole", "fish", "flatfish", "delicate"] },
  { name: "Whiting (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, emoji: "🐟", keywords: ["whiting", "fish", "white fish", "fried"] },
  { name: "Beef Jerky (oz)", proteinPerDollar: 5, protein: 10, cost: 2.0, emoji: "🥩", keywords: ["jerky", "beef", "snack", "dried", "portable"] },
  { name: "Turkey Jerky (oz)", proteinPerDollar: 5, protein: 10, cost: 2.0, emoji: "🦃", keywords: ["jerky", "turkey", "snack", "dried", "lean"] },
  { name: "Egg Whites (carton)", proteinPerDollar: 13, protein: 50, cost: 4.0, emoji: "🥚", keywords: ["egg", "whites", "liquid", "low fat", "protein"] },
  { name: "Protein Bar", proteinPerDollar: 7, protein: 20, cost: 3.0, emoji: "🍫", keywords: ["protein", "bar", "snack", "portable", "gym"] },
  { name: "Protein Milk", proteinPerDollar: 9, protein: 30, cost: 3.5, emoji: "🥛", keywords: ["protein", "milk", "fairlife", "muscle milk", "shake"] },
  { name: "Casein Powder", proteinPerDollar: 28, protein: 25, cost: 0.9, emoji: "💪", keywords: ["casein", "protein", "slow release", "night", "supplement"] },
  { name: "Soy Protein Powder", proteinPerDollar: 30, protein: 25, cost: 0.85, emoji: "💪", keywords: ["soy", "protein", "vegan", "plant", "powder"] },
  { name: "Pea Protein Powder", proteinPerDollar: 28, protein: 24, cost: 0.85, emoji: "💪", keywords: ["pea", "protein", "vegan", "plant", "powder"] },
  { name: "Collagen Powder", proteinPerDollar: 18, protein: 18, cost: 1.0, emoji: "💪", keywords: ["collagen", "protein", "skin", "joints", "supplement"] },
  { name: "Chicken Thighs (lb)", proteinPerDollar: 20, protein: 80, cost: 4.0, emoji: "🍗", keywords: ["chicken", "thighs", "dark meat", "poultry"] },
  { name: "Chicken Drumsticks (lb)", proteinPerDollar: 25, protein: 75, cost: 3.0, emoji: "🍗", keywords: ["chicken", "drumsticks", "legs", "poultry"] },
  { name: "Chicken Wings (lb)", proteinPerDollar: 14, protein: 70, cost: 5.0, emoji: "🍗", keywords: ["chicken", "wings", "buffalo", "game day"] },
  { name: "Whole Chicken (lb)", proteinPerDollar: 28, protein: 84, cost: 3.0, emoji: "🍗", keywords: ["chicken", "whole", "roast", "rotisserie"] },
  { name: "Rotisserie Chicken", proteinPerDollar: 14, protein: 100, cost: 7.0, emoji: "🍗", keywords: ["rotisserie", "chicken", "whole", "prepared", "costco"] },
  { name: "Pork Tenderloin (lb)", proteinPerDollar: 14, protein: 84, cost: 6.0, emoji: "🥩", keywords: ["pork", "tenderloin", "lean", "roast"] },
  { name: "Pork Shoulder (lb)", proteinPerDollar: 20, protein: 60, cost: 3.0, emoji: "🥩", keywords: ["pork", "shoulder", "pulled pork", "bbq", "slow cook"] },
  { name: "Bacon (lb)", proteinPerDollar: 8, protein: 40, cost: 5.0, emoji: "🥓", keywords: ["bacon", "pork", "breakfast", "crispy"] },
  { name: "Sausage Links (lb)", proteinPerDollar: 10, protein: 50, cost: 5.0, emoji: "🌭", keywords: ["sausage", "pork", "breakfast", "links"] },
  { name: "Italian Sausage (lb)", proteinPerDollar: 10, protein: 60, cost: 6.0, emoji: "🌭", keywords: ["italian", "sausage", "pork", "pasta"] },
  { name: "Bratwurst (lb)", proteinPerDollar: 9, protein: 54, cost: 6.0, emoji: "🌭", keywords: ["bratwurst", "sausage", "german", "grilled"] },
  { name: "Hot Dogs (pack)", proteinPerDollar: 10, protein: 40, cost: 4.0, emoji: "🌭", keywords: ["hot dog", "frankfurter", "bbq", "ballpark"] },
  { name: "Deli Turkey (lb)", proteinPerDollar: 11, protein: 88, cost: 8.0, emoji: "🦃", keywords: ["turkey", "deli", "sandwich", "sliced", "lunch meat"] },
  { name: "Deli Chicken (lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, emoji: "🍗", keywords: ["chicken", "deli", "sandwich", "sliced", "lunch meat"] },
  { name: "Deli Roast Beef (lb)", proteinPerDollar: 9, protein: 90, cost: 10.0, emoji: "🥩", keywords: ["roast beef", "deli", "sandwich", "sliced"] },
  { name: "Pepperoni (oz)", proteinPerDollar: 7, protein: 5, cost: 0.7, emoji: "🍕", keywords: ["pepperoni", "pizza", "italian", "snack"] },
  { name: "Salami (oz)", proteinPerDollar: 6, protein: 5, cost: 0.8, emoji: "🥪", keywords: ["salami", "deli", "italian", "charcuterie"] },
  { name: "Prosciutto (oz)", proteinPerDollar: 4, protein: 6, cost: 1.5, emoji: "🥪", keywords: ["prosciutto", "italian", "ham", "charcuterie"] },
  { name: "Steak (ribeye, lb)", proteinPerDollar: 6, protein: 80, cost: 14.0, emoji: "🥩", keywords: ["ribeye", "steak", "beef", "grilled", "premium"] },
  { name: "Steak (sirloin, lb)", proteinPerDollar: 10, protein: 80, cost: 8.0, emoji: "🥩", keywords: ["sirloin", "steak", "beef", "grilled"] },
  { name: "Steak (flank, lb)", proteinPerDollar: 9, protein: 80, cost: 9.0, emoji: "🥩", keywords: ["flank", "steak", "beef", "fajitas"] },
  { name: "Steak (skirt, lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, emoji: "🥩", keywords: ["skirt", "steak", "beef", "carne asada"] },
  { name: "Beef Roast (lb)", proteinPerDollar: 11, protein: 80, cost: 7.0, emoji: "🥩", keywords: ["roast", "beef", "pot roast", "slow cook"] },
  { name: "Corned Beef (lb)", proteinPerDollar: 9, protein: 70, cost: 8.0, emoji: "🥩", keywords: ["corned beef", "deli", "reuben", "irish"] },
  { name: "Pastrami (lb)", proteinPerDollar: 8, protein: 80, cost: 10.0, emoji: "🥩", keywords: ["pastrami", "deli", "sandwich", "smoked"] },
  { name: "Liver (beef, lb)", proteinPerDollar: 20, protein: 80, cost: 4.0, emoji: "🥩", keywords: ["liver", "beef", "organ", "iron"] },
  { name: "Liver (chicken, lb)", proteinPerDollar: 24, protein: 72, cost: 3.0, emoji: "🍗", keywords: ["liver", "chicken", "organ", "pate"] },
  { name: "Goat (lb)", proteinPerDollar: 7, protein: 70, cost: 10.0, emoji: "🐐", keywords: ["goat", "meat", "curry", "caribbean"] },
  { name: "Rabbit (lb)", proteinPerDollar: 6, protein: 66, cost: 11.0, emoji: "🐰", keywords: ["rabbit", "game", "meat", "lean"] },
  { name: "Quail (each)", proteinPerDollar: 5, protein: 20, cost: 4.0, emoji: "🐦", keywords: ["quail", "game bird", "poultry"] },
  { name: "Cornish Hen (each)", proteinPerDollar: 8, protein: 40, cost: 5.0, emoji: "🐔", keywords: ["cornish", "hen", "poultry", "roast"] },
  { name: "String Cheese", proteinPerDollar: 8, protein: 7, cost: 0.9, emoji: "🧀", keywords: ["string", "cheese", "snack", "mozzarella"] },
  { name: "Parmesan (oz)", proteinPerDollar: 7, protein: 10, cost: 1.5, emoji: "🧀", keywords: ["parmesan", "cheese", "italian", "aged"] },
  { name: "Swiss Cheese (oz)", proteinPerDollar: 9, protein: 8, cost: 0.9, emoji: "🧀", keywords: ["swiss", "cheese", "dairy", "sandwich"] },
  { name: "Provolone (oz)", proteinPerDollar: 9, protein: 7, cost: 0.8, emoji: "🧀", keywords: ["provolone", "cheese", "italian", "sandwich"] },
  { name: "Feta Cheese (oz)", proteinPerDollar: 6, protein: 4, cost: 0.7, emoji: "🧀", keywords: ["feta", "cheese", "greek", "salad"] },
  { name: "Goat Cheese (oz)", proteinPerDollar: 5, protein: 5, cost: 1.0, emoji: "🧀", keywords: ["goat", "cheese", "chevre", "salad"] },
  { name: "Cream Cheese (oz)", proteinPerDollar: 3, protein: 2, cost: 0.6, emoji: "🧀", keywords: ["cream", "cheese", "bagel", "spread"] },
  { name: "Blue Cheese (oz)", proteinPerDollar: 5, protein: 6, cost: 1.2, emoji: "🧀", keywords: ["blue", "cheese", "gorgonzola", "salad"] },
  { name: "Brie (oz)", proteinPerDollar: 4, protein: 6, cost: 1.5, emoji: "🧀", keywords: ["brie", "cheese", "french", "soft"] },
  { name: "Almond Butter (2 tbsp)", proteinPerDollar: 7, protein: 7, cost: 1.0, emoji: "🌰", keywords: ["almond", "butter", "nut", "spread"] },
  { name: "Cashew Butter (2 tbsp)", proteinPerDollar: 5, protein: 5, cost: 1.0, emoji: "🌰", keywords: ["cashew", "butter", "nut", "spread"] },
  { name: "Sunflower Butter (2 tbsp)", proteinPerDollar: 7, protein: 7, cost: 1.0, emoji: "🌻", keywords: ["sunflower", "butter", "seed", "nut free"] },
  { name: "Tahini (2 tbsp)", proteinPerDollar: 5, protein: 5, cost: 1.0, emoji: "🥜", keywords: ["tahini", "sesame", "hummus", "mediterranean"] },
  { name: "Pumpkin Seeds (oz)", proteinPerDollar: 6, protein: 9, cost: 1.5, emoji: "🎃", keywords: ["pumpkin", "seeds", "pepitas", "snack"] },
  { name: "Sunflower Seeds (oz)", proteinPerDollar: 8, protein: 6, cost: 0.75, emoji: "🌻", keywords: ["sunflower", "seeds", "snack", "baseball"] },
  { name: "Pistachios (oz)", proteinPerDollar: 4, protein: 6, cost: 1.5, emoji: "🥜", keywords: ["pistachios", "nuts", "snack", "green"] },
  { name: "Cashews (oz)", proteinPerDollar: 4, protein: 5, cost: 1.25, emoji: "🥜", keywords: ["cashews", "nuts", "snack", "creamy"] },
  { name: "Walnuts (oz)", proteinPerDollar: 4, protein: 4, cost: 1.0, emoji: "🥜", keywords: ["walnuts", "nuts", "omega", "brain"] },
  { name: "Pecans (oz)", proteinPerDollar: 2, protein: 3, cost: 1.5, emoji: "🥜", keywords: ["pecans", "nuts", "pie", "southern"] },
  { name: "Macadamia Nuts (oz)", proteinPerDollar: 1, protein: 2, cost: 2.0, emoji: "🥜", keywords: ["macadamia", "nuts", "hawaiian", "cookies"] },
  { name: "Brazil Nuts (oz)", proteinPerDollar: 3, protein: 4, cost: 1.5, emoji: "🥜", keywords: ["brazil", "nuts", "selenium", "large"] },
  { name: "Hazelnuts (oz)", proteinPerDollar: 3, protein: 4, cost: 1.25, emoji: "🌰", keywords: ["hazelnuts", "filberts", "nutella", "nuts"] },
  { name: "Mixed Nuts (oz)", proteinPerDollar: 4, protein: 5, cost: 1.25, emoji: "🥜", keywords: ["mixed", "nuts", "snack", "trail mix"] },
  { name: "Trail Mix (oz)", proteinPerDollar: 4, protein: 4, cost: 1.0, emoji: "🥜", keywords: ["trail", "mix", "hiking", "snack", "nuts"] },
  { name: "Navy Beans (can)", proteinPerDollar: 15, protein: 15, cost: 1.0, emoji: "🫘", keywords: ["navy", "beans", "white", "soup"] },
  { name: "Great Northern Beans (can)", proteinPerDollar: 14, protein: 14, cost: 1.0, emoji: "🫘", keywords: ["great northern", "beans", "white", "soup"] },
  { name: "Cannellini Beans (can)", proteinPerDollar: 14, protein: 14, cost: 1.0, emoji: "🫘", keywords: ["cannellini", "beans", "white", "italian"] },
  { name: "Lima Beans (can)", proteinPerDollar: 12, protein: 12, cost: 1.0, emoji: "🫘", keywords: ["lima", "beans", "butter beans", "succotash"] },
  { name: "Fava Beans (can)", proteinPerDollar: 13, protein: 13, cost: 1.0, emoji: "🫘", keywords: ["fava", "beans", "broad beans", "mediterranean"] },
  { name: "Refried Beans (can)", proteinPerDollar: 12, protein: 12, cost: 1.0, emoji: "🫘", keywords: ["refried", "beans", "mexican", "burrito"] },
  { name: "Baked Beans (can)", proteinPerDollar: 10, protein: 10, cost: 1.0, emoji: "🫘", keywords: ["baked", "beans", "bbq", "side dish"] },
  { name: "Hummus (container)", proteinPerDollar: 4, protein: 10, cost: 2.5, emoji: "🫘", keywords: ["hummus", "chickpeas", "dip", "snack", "mediterranean"] },
  { name: "Mung Beans (dry, cup)", proteinPerDollar: 24, protein: 12, cost: 0.5, emoji: "🫘", keywords: ["mung", "beans", "sprouts", "asian"] },
  { name: "Adzuki Beans (dry, cup)", proteinPerDollar: 20, protein: 10, cost: 0.5, emoji: "🫘", keywords: ["adzuki", "beans", "red", "asian", "sweet"] },
  { name: "Soy Milk (quart)", proteinPerDollar: 9, protein: 28, cost: 3.0, emoji: "🥛", keywords: ["soy", "milk", "plant", "vegan", "dairy free"] },
  { name: "Almond Milk (quart)", proteinPerDollar: 1, protein: 4, cost: 3.0, emoji: "🥛", keywords: ["almond", "milk", "plant", "vegan", "dairy free"] },
  { name: "Oat Milk (quart)", proteinPerDollar: 1, protein: 4, cost: 3.5, emoji: "🥛", keywords: ["oat", "milk", "plant", "vegan", "barista"] },
  { name: "Kefir (bottle)", proteinPerDollar: 4, protein: 12, cost: 3.0, emoji: "🥛", keywords: ["kefir", "probiotic", "dairy", "fermented"] },
  { name: "Chocolate Milk (pint)", proteinPerDollar: 8, protein: 16, cost: 2.0, emoji: "🥛", keywords: ["chocolate", "milk", "recovery", "post workout"] },
  { name: "Buttermilk (quart)", proteinPerDollar: 6, protein: 24, cost: 4.0, emoji: "🥛", keywords: ["buttermilk", "dairy", "baking", "pancakes"] },
  { name: "Goat Milk (quart)", proteinPerDollar: 4, protein: 20, cost: 5.0, emoji: "🥛", keywords: ["goat", "milk", "dairy", "alternative"] },
  { name: "Evaporated Milk (can)", proteinPerDollar: 8, protein: 16, cost: 2.0, emoji: "🥛", keywords: ["evaporated", "milk", "canned", "baking"] },
  { name: "Powdered Milk (cup)", proteinPerDollar: 16, protein: 8, cost: 0.5, emoji: "🥛", keywords: ["powdered", "milk", "dry", "shelf stable"] },
  { name: "Regular Yogurt", proteinPerDollar: 7, protein: 7, cost: 1.0, emoji: "🥛", keywords: ["yogurt", "dairy", "breakfast", "fruit"] },
  { name: "Sour Cream (cup)", proteinPerDollar: 3, protein: 6, cost: 2.0, emoji: "🥛", keywords: ["sour cream", "dairy", "topping", "mexican"] },
  { name: "Heavy Cream (cup)", proteinPerDollar: 2, protein: 5, cost: 3.0, emoji: "🥛", keywords: ["heavy", "cream", "whipping", "coffee"] },
  { name: "Half and Half (cup)", proteinPerDollar: 3, protein: 6, cost: 2.0, emoji: "🥛", keywords: ["half and half", "cream", "coffee", "dairy"] },
  { name: "Beyond Burger (patty)", proteinPerDollar: 5, protein: 20, cost: 4.0, emoji: "🍔", keywords: ["beyond", "burger", "plant", "vegan", "meat substitute"] },
  { name: "Impossible Burger (patty)", proteinPerDollar: 5, protein: 19, cost: 4.0, emoji: "🍔", keywords: ["impossible", "burger", "plant", "vegan", "meat substitute"] },
  { name: "Veggie Burger (patty)", proteinPerDollar: 5, protein: 10, cost: 2.0, emoji: "🍔", keywords: ["veggie", "burger", "vegetarian", "bean", "patty"] },
  { name: "Tofurky Slices", proteinPerDollar: 6, protein: 15, cost: 2.5, emoji: "🦃", keywords: ["tofurky", "deli", "vegan", "slices", "sandwich"] },
  { name: "Vegan Sausage", proteinPerDollar: 5, protein: 14, cost: 3.0, emoji: "🌭", keywords: ["vegan", "sausage", "plant", "breakfast"] },
  { name: "TVP (cup dry)", proteinPerDollar: 26, protein: 52, cost: 2.0, emoji: "🌾", keywords: ["tvp", "textured vegetable protein", "soy", "vegan", "ground"] },
  { name: "Nutritional Yeast (2 tbsp)", proteinPerDollar: 6, protein: 6, cost: 1.0, emoji: "🧀", keywords: ["nutritional", "yeast", "nooch", "vegan", "cheesy"] },
  { name: "Spirulina (tbsp)", proteinPerDollar: 8, protein: 4, cost: 0.5, emoji: "🌿", keywords: ["spirulina", "algae", "superfood", "green", "supplement"] },
  { name: "Wheat Germ (cup)", proteinPerDollar: 9, protein: 27, cost: 3.0, emoji: "🌾", keywords: ["wheat", "germ", "breakfast", "cereal", "fiber"] },
  { name: "Buckwheat (cup dry)", proteinPerDollar: 8, protein: 23, cost: 3.0, emoji: "🌾", keywords: ["buckwheat", "grain", "gluten free", "kasha"] },
  { name: "Amaranth (cup dry)", proteinPerDollar: 7, protein: 28, cost: 4.0, emoji: "🌾", keywords: ["amaranth", "grain", "ancient", "gluten free"] },
  { name: "Teff (cup dry)", proteinPerDollar: 5, protein: 25, cost: 5.0, emoji: "🌾", keywords: ["teff", "grain", "ethiopian", "gluten free"] },
  { name: "Farro (cup dry)", proteinPerDollar: 6, protein: 24, cost: 4.0, emoji: "🌾", keywords: ["farro", "grain", "italian", "ancient"] },
  { name: "Spelt (cup dry)", proteinPerDollar: 6, protein: 25, cost: 4.0, emoji: "🌾", keywords: ["spelt", "grain", "ancient", "wheat"] },
  { name: "Kamut (cup dry)", proteinPerDollar: 5, protein: 23, cost: 5.0, emoji: "🌾", keywords: ["kamut", "grain", "ancient", "wheat"] },
  { name: "Barley (cup dry)", proteinPerDollar: 8, protein: 23, cost: 3.0, emoji: "🌾", keywords: ["barley", "grain", "soup", "beer"] },
  { name: "Wild Rice (cup dry)", proteinPerDollar: 4, protein: 24, cost: 6.0, emoji: "🍚", keywords: ["wild", "rice", "grain", "native"] },
  { name: "Brown Rice (cup dry)", proteinPerDollar: 5, protein: 15, cost: 3.0, emoji: "🍚", keywords: ["brown", "rice", "whole grain", "fiber"] },
  { name: "White Rice (cup dry)", proteinPerDollar: 4, protein: 12, cost: 3.0, emoji: "🍚", keywords: ["white", "rice", "grain", "plain"] },
  { name: "Pasta (box)", proteinPerDollar: 10, protein: 14, cost: 1.4, emoji: "🍝", keywords: ["pasta", "spaghetti", "noodles", "italian", "carbs"] },
  { name: "Whole Wheat Pasta (box)", proteinPerDollar: 9, protein: 15, cost: 1.7, emoji: "🍝", keywords: ["whole wheat", "pasta", "fiber", "healthy"] },
  { name: "Chickpea Pasta (box)", proteinPerDollar: 7, protein: 25, cost: 3.5, emoji: "🍝", keywords: ["chickpea", "pasta", "banza", "high protein", "gluten free"] },
  { name: "Lentil Pasta (box)", proteinPerDollar: 7, protein: 25, cost: 3.5, emoji: "🍝", keywords: ["lentil", "pasta", "high protein", "gluten free"] },
  { name: "Bread (loaf)", proteinPerDollar: 4, protein: 12, cost: 3.0, emoji: "🍞", keywords: ["bread", "loaf", "sandwich", "toast"] },
  { name: "Whole Wheat Bread", proteinPerDollar: 4, protein: 16, cost: 4.0, emoji: "🍞", keywords: ["whole wheat", "bread", "fiber", "healthy"] },
  { name: "Ezekiel Bread", proteinPerDollar: 3, protein: 16, cost: 5.0, emoji: "🍞", keywords: ["ezekiel", "bread", "sprouted", "healthy"] },
  { name: "Bagel", proteinPerDollar: 6, protein: 10, cost: 1.5, emoji: "🥯", keywords: ["bagel", "breakfast", "bread", "cream cheese"] },
  { name: "English Muffin", proteinPerDollar: 6, protein: 5, cost: 0.8, emoji: "🍞", keywords: ["english", "muffin", "breakfast", "eggs benedict"] },
  { name: "Pita Bread", proteinPerDollar: 5, protein: 6, cost: 1.2, emoji: "🫓", keywords: ["pita", "bread", "mediterranean", "pocket"] },
  { name: "Tortilla (flour)", proteinPerDollar: 5, protein: 4, cost: 0.8, emoji: "🫓", keywords: ["tortilla", "flour", "wrap", "burrito", "taco"] },
  { name: "Tortilla (corn)", proteinPerDollar: 4, protein: 2, cost: 0.5, emoji: "🫓", keywords: ["tortilla", "corn", "taco", "mexican"] },
  { name: "Naan Bread", proteinPerDollar: 4, protein: 8, cost: 2.0, emoji: "🫓", keywords: ["naan", "bread", "indian", "curry"] },
  { name: "Ramen Noodles (pack)", proteinPerDollar: 16, protein: 8, cost: 0.5, emoji: "🍜", keywords: ["ramen", "noodles", "instant", "cheap", "college"] },
  { name: "Soba Noodles", proteinPerDollar: 5, protein: 14, cost: 3.0, emoji: "🍜", keywords: ["soba", "noodles", "buckwheat", "japanese"] },
  { name: "Udon Noodles", proteinPerDollar: 4, protein: 10, cost: 2.5, emoji: "🍜", keywords: ["udon", "noodles", "japanese", "thick"] },
  { name: "Rice Noodles", proteinPerDollar: 3, protein: 6, cost: 2.0, emoji: "🍜", keywords: ["rice", "noodles", "pho", "pad thai", "asian"] },
  { name: "Paneer (8 oz)", proteinPerDollar: 7, protein: 28, cost: 4.0, emoji: "🧀", keywords: ["paneer", "cheese", "indian", "vegetarian"] },
  { name: "Halloumi (8 oz)", proteinPerDollar: 5, protein: 28, cost: 6.0, emoji: "🧀", keywords: ["halloumi", "cheese", "grilling", "mediterranean"] },
  { name: "Queso Fresco (8 oz)", proteinPerDollar: 6, protein: 24, cost: 4.0, emoji: "🧀", keywords: ["queso", "fresco", "cheese", "mexican"] },
  { name: "Burrata (4 oz)", proteinPerDollar: 3, protein: 12, cost: 4.0, emoji: "🧀", keywords: ["burrata", "cheese", "italian", "creamy"] },
  { name: "Smoked Salmon (4 oz)", proteinPerDollar: 4, protein: 24, cost: 6.0, emoji: "🐟", keywords: ["smoked", "salmon", "lox", "bagel", "brunch"] },
  { name: "Caviar (oz)", proteinPerDollar: 1, protein: 4, cost: 10.0, emoji: "🐟", keywords: ["caviar", "roe", "luxury", "fish eggs"] },
  { name: "Oysters (dozen)", proteinPerDollar: 4, protein: 24, cost: 6.0, emoji: "🦪", keywords: ["oysters", "shellfish", "raw", "seafood"] },
  { name: "Octopus (lb)", proteinPerDollar: 6, protein: 60, cost: 10.0, emoji: "🐙", keywords: ["octopus", "seafood", "grilled", "mediterranean"] },
  { name: "Squid/Calamari (lb)", proteinPerDollar: 8, protein: 64, cost: 8.0, emoji: "🦑", keywords: ["squid", "calamari", "fried", "seafood"] },
  { name: "Elk (lb)", proteinPerDollar: 5, protein: 80, cost: 16.0, emoji: "🦌", keywords: ["elk", "game", "meat", "lean", "wild"] },
  { name: "Wild Boar (lb)", proteinPerDollar: 6, protein: 80, cost: 14.0, emoji: "🐗", keywords: ["boar", "wild", "game", "pork"] },
  { name: "Ostrich (lb)", proteinPerDollar: 4, protein: 80, cost: 20.0, emoji: "🦤", keywords: ["ostrich", "bird", "lean", "exotic"] },
  { name: "Alligator (lb)", proteinPerDollar: 5, protein: 70, cost: 14.0, emoji: "🐊", keywords: ["alligator", "exotic", "cajun", "meat"] },
  { name: "Frog Legs (lb)", proteinPerDollar: 5, protein: 60, cost: 12.0, emoji: "🐸", keywords: ["frog", "legs", "french", "cajun"] },
  { name: "Cricket Flour (cup)", proteinPerDollar: 8, protein: 40, cost: 5.0, emoji: "🦗", keywords: ["cricket", "insect", "flour", "protein", "sustainable"] },
  { name: "Bone Broth (cup)", proteinPerDollar: 5, protein: 10, cost: 2.0, emoji: "🍲", keywords: ["bone", "broth", "collagen", "healing", "soup"] },
];

// Sort by protein per dollar
const sortedFoods = [...valueFoods].sort(
  (a, b) => b.proteinPerDollar - a.proteinPerDollar
);

export function ValueFoods() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return sortedFoods;
    
    const query = searchQuery.toLowerCase().trim();
    return sortedFoods.filter((food) => {
      const nameMatch = food.name.toLowerCase().includes(query);
      const keywordMatch = food.keywords.some((keyword) => 
        keyword.includes(query) || query.includes(keyword)
      );
      return nameMatch || keywordMatch;
    });
  }, [searchQuery]);

  return (
    <div className="px-4 py-6 slide-up">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-primary animate-pulse-glow" />
        <h1 className="text-2xl font-bold text-foreground">
          Value <span className="text-primary neon-glow-text">Foods</span>
        </h1>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Ranked by protein per dollar. Get the most gains for your budget.
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/30 border-border/50 focus:border-primary"
        />
      </div>

      <div className="space-y-3">
        {filteredFoods.length === 0 ? (
          <div className="cyber-card p-6 text-center">
            <p className="text-muted-foreground">No foods found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const originalIndex = sortedFoods.indexOf(food);
            const isTopThree = originalIndex < 3;
            const rankLabels = ["1st", "2nd", "3rd"];
            
            return (
              <div
                key={food.name}
                className={`cyber-card p-4 flex items-center gap-4 ${isTopThree ? "border-primary/30" : ""}`}
              >
                {isTopThree && food.image ? (
                  <div className="relative">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {rankLabels[originalIndex]}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50 text-xl">
                    {food.emoji}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {food.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {food.protein}g protein • ${food.cost.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary neon-glow-text">
                    {food.proteinPerDollar}g
                  </p>
                  <p className="text-xs text-muted-foreground">per $1</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
