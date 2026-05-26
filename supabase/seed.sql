-- Seed products — inspired by Straight Outta Cotton
-- Images used with permission for this academic prototype (straight-outta-cotton.com)
-- 3 categories: Tops · Hoodies · Bottoms
-- Clothing sizes XS–4XL; denim by inseam length (30"–34")

insert into products (name, description, price, image_url, category, sizes, stock) values

-- ── TOPS ──────────────────────────────────────────────────────────────────────
(
  'Heavy Oversize Tee – Black',
  '230 GSM heavyweight cotton jersey in a 90s boxy silhouette. Dropped shoulders, a broad body, and a slightly cropped length that sits perfectly over jeans or joggers. Tight ribbed collar that holds its shape wash after wash.',
  24.90,
  'https://straight-outta-cotton.com/cdn/shop/files/heavy-oversize-tee-black-schwarz-straight-outta-cotton-9773804.jpg',
  'Shirts',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  150
),
(
  'Heavy Oversize Tee – White',
  '230 GSM heavyweight cotton jersey in a 90s boxy silhouette. Same dropped shoulders and broad body — in a clean white that is thick enough to wear without layering.',
  24.90,
  'https://straight-outta-cotton.com/cdn/shop/files/heavy-oversize-tee-white-weiss-straight-outta-cotton-7693918.jpg',
  'Shirts',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  150
),
(
  'Heavy Oversize Tee – Slate Grey',
  '230 GSM heavyweight cotton jersey, boxy silhouette, dropped shoulders. Slate grey — a neutral that pairs with everything and does not show wear.',
  24.90,
  'https://straight-outta-cotton.com/cdn/shop/files/heavy-oversize-tee-slate-grey-grau-straight-outta-cotton-2730163.jpg',
  'Shirts',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  130
),
(
  'Heavy Regular Fit Tee – White',
  '230 GSM heavyweight cotton jersey in a classic regular fit. The same weight and quality as our Oversize Tee, with a set-in shoulder and full-length body for a cleaner, more tailored look.',
  24.90,
  'https://straight-outta-cotton.com/cdn/shop/files/heavy-regular-fit-tee-white-weiss-straight-outta-cotton-4447005.jpg',
  'Shirts',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  120
),

-- ── HOODIES ──────────────────────────────────────────────────────────────────
(
  'Oversize Hoodie – Black',
  '340 GSM brushed fleece (80% cotton, 20% polyester). Double-layer hood for structure and warmth. Kangaroo pocket, no drawstrings — clean and unfussy. Boxy 90s silhouette with a deep black that resists fading.',
  44.90,
  'https://straight-outta-cotton.com/cdn/shop/files/oversize-hoodie-black-straight-outta-cotton-1378031.jpg',
  'Hoodies',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  90
),
(
  'Oversize Hoodie – Melange Grey',
  '340 GSM brushed fleece (80% cotton, 20% polyester). The same boxy silhouette and double-layer hood as our Black Hoodie — in a classic melange grey that works with every colourway.',
  44.90,
  'https://straight-outta-cotton.com/cdn/shop/files/oversize-hoodie-melange-grey-straight-outta-cotton-9099801.jpg',
  'Hoodies',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  90
),
(
  'Oversize Hoodie – Off White',
  '340 GSM brushed fleece (80% cotton, 20% polyester). Boxy 90s silhouette, double-layer hood, kangaroo pocket. Off white — warm-toned and easy to layer.',
  44.90,
  'https://straight-outta-cotton.com/cdn/shop/files/oversize-hoodie-off-white-straight-outta-cotton-8036891.png',
  'Hoodies',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  80
),
(
  'Full Zip Oversize Hoodie – Black',
  '340 GSM brushed fleece (80% cotton, 20% polyester). The same boxy silhouette and double-layer hood as our pullover — with a smooth full-length zip and split kangaroo pockets. Wear it open as a jacket or zipped for extra warmth.',
  59.90,
  'https://straight-outta-cotton.com/cdn/shop/files/full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-5485514.jpg',
  'Hoodies',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  60
),

-- ── BOTTOMS ───────────────────────────────────────────────────────────────────
(
  '5 Pocket Denim – Washed Black',
  'Medium-weight denim in a clean 5-pocket straight fit. Washed black that develops depth with wear. A hint of stretch for comfort. The jeans you reach for every single day.',
  49.90,
  'https://straight-outta-cotton.com/cdn/shop/files/5-pocket-black-denim-washed-black-30-inch-straight-outta-cotton-1687156.jpg',
  'Bottoms',
  ARRAY['30"', '32"', '34"'],
  100
),
(
  '5 Pocket Denim – Stone Washed Blue',
  'Same 5-pocket straight cut in a stone washed blue. A faded, broken-in feel straight out of the bag. Pairs cleanly with everything from a white tee to a boxy hoodie.',
  49.90,
  'https://straight-outta-cotton.com/cdn/shop/files/5-pocket-blue-denim-stone-washed-30-inch-straight-outta-cotton-4301738.jpg',
  'Bottoms',
  ARRAY['30"', '32"', '34"'],
  100
),
(
  'Baggy Denim – Black Washed',
  'Wide-leg baggy denim in washed black. Low rise, roomy thigh, straight from the knee down. Built to wear loose — throw it on with an oversize tee and let it do the talking.',
  54.90,
  'https://straight-outta-cotton.com/cdn/shop/files/baggy-denim-black-washed-30-inch-straight-outta-cotton-9166596.png',
  'Bottoms',
  ARRAY['30"', '32"', '34"'],
  70
),
(
  'Basic Jogger – Black',
  '320 GSM heavyweight jogger (80% cotton, 20% polyester). Side pockets, back pocket, tonal side stripe for shape. Elastic cuffs and waistband with an interior drawcord. Casual fit that stays clean.',
  37.90,
  'https://straight-outta-cotton.com/cdn/shop/files/basic-jogger-black-straight-outta-cotton-3665742.jpg',
  'Bottoms',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  120
),
(
  'Basic Jogger – Grey Melange',
  '320 GSM heavyweight jogger (80% cotton, 20% polyester). Same construction as the Black Jogger — side pockets, back pocket, tonal stripe — in grey melange. The go-to.',
  37.90,
  'https://straight-outta-cotton.com/cdn/shop/files/basic-jogger-grey-melange-straight-outta-cotton-4873891.jpg',
  'Bottoms',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  120
),
(
  'Straight Leg Jogger – Black',
  '320 GSM heavyweight jogger (80% cotton, 20% polyester) in a non-tapered straight cut. Sits clean over sneakers or slides without bunching. Side and back pockets, interior drawcord waistband.',
  49.90,
  'https://straight-outta-cotton.com/cdn/shop/files/straight-leg-jogger-black-schwarz-straight-outta-cotton-8852824.jpg',
  'Bottoms',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  80
),

-- ── JACKETS ───────────────────────────────────────────────────────────────────
(
  'Puffer Jacket – Black',
  'Wind and water-resistant puffer jacket with extra thick vegan fill and a heavily laminated polyester outer. High collar, boxy silhouette, clean lines. Genuinely warm without bulk.',
  89.90,
  'https://straight-outta-cotton.com/cdn/shop/files/puffer-jacket-black-straight-outta-cotton-2768746.jpg',
  'Jackets',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  50
),
(
  'Puffer Jacket – Off White',
  'The same wind and water-resistant puffer construction in off white. Extra thick vegan fill, laminated outer, high collar. Stands out as a statement piece while still pairing with everything in your rotation.',
  89.90,
  'https://straight-outta-cotton.com/cdn/shop/files/puffer-jacket-off-white-straight-outta-cotton-1836776.jpg',
  'Jackets',
  ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  50
);

-- ── REVIEWS (3 per product) ───────────────────────────────────────────────────

insert into reviews (product_id, author, rating, comment, created_at) values

  -- Heavy Oversize Tee – Black (id=1)
  (1, 'Leon Becker', 5, 'Exactly what I wanted. The weight of this tee is insane for the price — it is genuinely thick and falls perfectly. Already ordered the white.', '2026-03-10 09:15:00+00'),
  (1, 'Mia Hoffmann', 5, 'The boxy fit is spot on. Not too long, not too short — it sits just right over jeans. Washed it five times and zero shrinkage.', '2026-03-22 14:30:00+00'),
  (1, 'Kai Zimmermann', 4, 'Really great quality tee. The drop shoulder gives it that 90s look I was after. Only thing is the collar is quite tight at first — softens up after a wash though.', '2026-04-05 11:00:00+00'),

  -- Heavy Oversize Tee – White (id=2)
  (2, 'Finn Schulze', 5, 'Best white tee I have owned. The fabric is thick enough that it does not go see-through. Boxy fit is perfect for layering over a long sleeve too.', '2026-03-15 10:00:00+00'),
  (2, 'Lena Krause', 4, 'Love the weight and the silhouette. White is true white, not yellowish. I sized down one as the product description suggested and it fits great.', '2026-03-28 16:45:00+00'),
  (2, 'Jonas Weber', 5, 'Bought this on a whim and immediately ordered two more. The quality is unreal for under 25 euros. Holds its shape perfectly.', '2026-04-12 08:30:00+00'),

  -- Heavy Oversize Tee – Slate Grey (id=3)
  (3, 'Emma Richter', 5, 'The slate grey is such a good colour — not too dark, not too light. Looks great with black joggers or denim. The fabric is noticeably heavy and premium.', '2026-02-20 12:00:00+00'),
  (3, 'Noah Braun', 4, 'Solid tee, the weight makes it feel much more expensive than it is. Fit is exactly as described — boxy and slightly cropped. Good stuff.', '2026-03-05 09:45:00+00'),
  (3, 'Sophie Lange', 5, 'Third tee I have bought from here and same quality as always. The grey is versatile and the fit is consistent across colours.', '2026-03-18 15:20:00+00'),

  -- Heavy Regular Fit Tee – White (id=4)
  (4, 'Max Fischer', 4, 'If you want the same quality cotton in a more classic cut, this is the one. Still noticeably heavy but sits closer to the body. Good for a cleaner look.', '2026-02-28 11:30:00+00'),
  (4, 'Julia Wagner', 5, 'Love that they do a regular fit version. The 230 GSM is still there but it looks a bit more put-together. Sizing is accurate.', '2026-03-20 14:00:00+00'),
  (4, 'Tom Neumann', 4, 'Great everyday tee. The white is clean and the fit is exactly right — not boxy, not slim. Would be 5 stars if the neck was slightly wider.', '2026-04-02 10:15:00+00'),

  -- Oversize Hoodie – Black (id=5)
  (5, 'Elias Koch', 5, 'This hoodie is incredible. The fabric is so thick and the double-layer hood actually stays in shape. No drawstrings is the right call — looks so much cleaner.', '2026-01-15 08:00:00+00'),
  (5, 'Hannah Bauer', 5, 'Ordered L and it fits perfectly — boxy without being ridiculous. The 340 GSM really shows when you hold it. This will outlast three fast-fashion hoodies easily.', '2026-02-10 13:30:00+00'),
  (5, 'Nico Schäfer', 4, 'Easily the best hoodie I have bought in this price range. The only minus is that it takes a long time to dry given the weight — air dry for sure. Otherwise perfect.', '2026-03-01 17:00:00+00'),

  -- Oversize Hoodie – Melange Grey (id=6)
  (6, 'Clara Müller', 5, 'The melange grey is stunning. It has a nice texture to it from the yarn blend. Same great construction as the black — I now have both.', '2026-01-20 10:30:00+00'),
  (6, 'Ben Hartmann', 5, 'My new favourite piece of clothing. The boxy fit, the weight of the fabric, the clean look without drawstrings — everything is right about this hoodie.', '2026-02-14 12:00:00+00'),
  (6, 'Sara Albrecht', 4, 'Really happy with it. The grey melange pairs with literally everything. Fit is consistent with the other colours — sized up one for an even bigger drop shoulder effect.', '2026-03-08 09:00:00+00'),

  -- Oversize Hoodie – Off White (id=7)
  (7, 'Paul Seidel', 5, 'The off white is a really nice warm tone — not cream, not white, just right. Looks great over black denim. The fabric quality is exactly what I expected.', '2026-02-05 14:30:00+00'),
  (7, 'Laura Vogt', 4, 'Beautiful hoodie. I was worried about the off white getting dirty quickly but it washes perfectly. The colour stays true after multiple washes.', '2026-03-12 11:15:00+00'),
  (7, 'David Pfeiffer', 5, 'Ordered this as a gift and my partner wears it constantly. The oversized fit works great on smaller frames too — just size down if you want less drop.', '2026-04-01 16:00:00+00'),

  -- Full Zip Oversize Hoodie – Black (id=8)
  (8, 'Felix Keller', 5, 'The full zip version is great — I wear it open like a jacket over a tee almost every day. The split pockets are a nice upgrade from the pullover version.', '2026-01-28 10:00:00+00'),
  (8, 'Maria Werner', 4, 'Really well made. The zip feels solid and smooth, no cheap hardware. Same 340 GSM fabric as the pullover. I would love to see this in more colours.', '2026-02-18 13:45:00+00'),
  (8, 'Simon Roth', 5, 'Bought this after having the pullover hoodie for six months. Same quality, same fit — the zip just makes it that much more versatile. Worth the extra few euros.', '2026-03-25 09:30:00+00'),

  -- 5 Pocket Denim – Washed Black (id=9)
  (9, 'Tim Gruber', 5, 'Clean straight fit and the washed black looks great. The stretch in the denim makes them really comfortable for all-day wear. Good weight, not too stiff.', '2026-02-10 10:00:00+00'),
  (9, 'Anna Schmitt', 4, 'Really happy with the quality and fit. The washed black is darker than I expected which is a good thing. Sizing chart was accurate for me.', '2026-03-05 14:00:00+00'),
  (9, 'Luis Meyer', 5, 'These have replaced my old daily jeans. The straight cut works with pretty much everything and the washed black is a great neutral. Solid buy.', '2026-04-08 09:30:00+00'),

  -- 5 Pocket Denim – Stone Washed Blue (id=10)
  (10, 'Jana König', 5, 'The stone wash is done really well — it looks worn-in without looking cheap. Straight fit is clean and the stretch means they are comfortable from day one.', '2026-02-20 11:00:00+00'),
  (10, 'Markus Braun', 4, 'Good quality denim and the fit is exactly what I wanted. The stone wash fades nicely over time too. Would definitely buy again.', '2026-03-15 16:30:00+00'),
  (10, 'Luisa Bach', 5, 'Beautiful jeans. The blue is a classic faded tone that pairs with almost any top. Very happy with the fit and the quality of the denim itself.', '2026-04-20 13:00:00+00'),

  -- Baggy Denim – Black Washed (id=11)
  (11, 'Rene Wolf', 5, 'The fit on these is exactly right for the baggy look — wide but not clown pants. The black wash is deep and looks great. Pairing them with the oversize tee is the move.', '2026-01-25 10:00:00+00'),
  (11, 'Hanna Schreiber', 4, 'Really like the silhouette. The low rise took some getting used to but now I love it. Denim is a good weight and feels sturdy. Sized down one and fits well.', '2026-02-28 15:00:00+00'),
  (11, 'Kevin Busch', 5, 'Best baggy jeans I have found. The cut is clean — not trying too hard. Just a solid wide-leg denim in a great washed black. Fits true to the size guide.', '2026-03-30 12:00:00+00'),

  -- Basic Jogger – Black (id=12)
  (12, 'Stefan Hammer', 5, 'These are so much better than any other jogger I have tried. The fabric is genuinely heavy and they do not feel cheap at all. The tonal stripe is a subtle nice touch.', '2026-01-30 09:00:00+00'),
  (12, 'Nora Klein', 5, 'I wear these every day at home and they still look clean. The elastic cuffs keep everything in place and the pockets are a good size. Really happy.', '2026-02-22 13:00:00+00'),
  (12, 'Eric Fuchs', 4, 'Great joggers. The 320 GSM is noticeably heavier than standard joggers — they feel premium. Only note: they lint a little for the first couple of washes as mentioned.', '2026-03-10 11:30:00+00'),

  -- Basic Jogger – Grey Melange (id=13)
  (13, 'Tanja Richter', 5, 'The grey melange is such a classic. Same quality as the black — heavy, well-made, clean look. This is my second pair and I will keep buying them.', '2026-02-08 10:00:00+00'),
  (13, 'Florian Brandt', 5, 'Perfect jogger. The weight is impressive for the price. The grey melange pairs with the black or off white hoodie perfectly — bought the set.', '2026-03-02 14:30:00+00'),
  (13, 'Kira Hoffmann', 4, 'Really solid. The fabric is thick and the fit is comfortable without being sloppy. True to size. Just note they need a long dry time which is expected for 320 GSM.', '2026-04-05 09:00:00+00'),

  -- Straight Leg Jogger – Black (id=14)
  (14, 'Moritz Sander', 5, 'The straight leg cut is a game-changer for me — no bunching at the ankle. Looks cleaner than a tapered jogger and still has the same heavyweight fabric. Love them.', '2026-02-15 11:00:00+00'),
  (14, 'Carina Voigt', 4, 'Really like the non-tapered cut. It sits properly over my sneakers. Same great 320 GSM construction. Would be 5 stars if they had more colour options.', '2026-03-18 15:00:00+00'),
  (14, 'Alex Baum', 5, 'Exactly what I was looking for — a jogger that does not taper. The straight leg looks much more put-together. Quality is identical to the basic jogger which is great.', '2026-04-12 10:30:00+00'),

  -- Puffer Jacket – Black (id=15)
  (15, 'Jan Hoffmeister', 5, 'This jacket is surprisingly warm for its profile. The laminated outer actually repels rain properly — not just water-resistant in name. The high collar makes a real difference in the wind.', '2026-01-10 10:00:00+00'),
  (15, 'Lara Steinmann', 5, 'Bought this for winter commuting and it is perfect. Boxy fit works great over a hoodie. The black is very clean and deep. Sizing is true to the guide.', '2026-01-28 14:00:00+00'),
  (15, 'Rico Danz', 4, 'Great jacket for the price. The fill is noticeably thick and the outer feels quality. Only reason for 4 stars is I wish it had an inner pocket. Otherwise excellent.', '2026-02-20 11:30:00+00'),

  -- Puffer Jacket – Off White (id=16)
  (16, 'Isabel Vogt', 5, 'The off white is such a good look. Gets compliments every time I wear it. Same construction as the black — genuinely warm and the water resistance is real.', '2026-01-15 09:00:00+00'),
  (16, 'Patrick Scholl', 4, 'Really happy with this. The off white stays cleaner than I expected and washes well. The boxy silhouette over a grey hoodie is the perfect combination.', '2026-02-05 16:00:00+00'),
  (16, 'Nadine Kurz', 5, 'Best jacket I have bought in years. The weight of the fill, the quality of the outer, the clean look — everything is right. Sized M and it fits perfectly over a hoodie.', '2026-03-01 12:00:00+00');
