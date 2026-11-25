# Final 100: the Crossover 100 list

`final-100.csv` is the list, ranked by `other_sections` (Guardian sections other than the person's home section with at least 1 article about them, 25 Nov 2025 to 25 Nov 2026), then `outside_pct`, then article count. **Every person has at least 1 other section.** Method and limits are in `guardian-crossover-scores.md`.

**Make-up:** 70 from Semrush (the living seed, ranks 1 to 305) and 30 best-guess names that are not from Semrush. 35 of the 100 are thin (under 10 articles), so one article can move their score.

**How it was built.** Everyone scored from the Semrush living seed, the 13-person extension and the best-guess batches was pooled (120 people with at least 1 other section), and the top 100 by score was taken. That ranks by Guardian coverage across sections only, so it favours people the Guardian covers widely, and the tie at 1 other section is decided by thin differences.

**Added in the latest re-rank** (17): Keir Starmer, Jd Vance, Pope Leo Xiv, Zohran Mamdani, Victoria Beckham, Javier Milei, Sam Altman, Jacob Elordi, Jensen Huang, Kate Moss, Giorgia Meloni, Erling Haaland, Tim Cook, Jude Bellingham, Anya Taylor Joy, Tyler The Creator, Millie Bobby Brown. Most are the 35 names in `guess-extension-35.csv`, chosen as people a current list should plausibly include, plus Kate Moss and Victoria Beckham, who were scored earlier and held back.

**Left in the latest re-rank** (17; each scored 1 other section with thin or low outside share, so they are the first to fall under a tie-break): Bono, Bruno Mars, Drake, Johnny Depp, Dwayne Johnson, Kate Winslet, Kate Middleton, Stevie Wonder, Scarlett Johansson, Robert Downey Jr, Kendrick Lamar, Chappell Roan, Sabrina Carpenter, Leonardo Dicaprio, Serena Williams, Novak Djokovic, Lewis Hamilton.

**Scored 0, so never on the list (17):** Lebron James, Jenna Ortega, Selena Gomez, Eminem, Angelina Jolie, Keanu Reeves, Cristiano Ronaldo, Al Pacino, Jackie Chan, Simone Biles, Oprah Winfrey, Shania Twain, Virat Kohli, Neymar, Priyanka Chopra, The Weeknd, Travis Scott. These are people we expected to see; the Guardian did not cover them across sections in this window.

**New names with a Guardian tag but 0 other sections:** Caitlin Clark, Victor Wembanyama, Max Verstappen, Lando Norris, Jannik Sinner, Shohei Ohtani, Doechii, Austin Butler.

**New names with no Guardian tag found:** Sundar Pichai, Satya Nadella, Demis Hassabis, Lisa Su, Emma Chamberlain, Alex Cooper, Hasan Piker, Lamine Yamal, Jungkook. These tag lookups found nothing under the spellings tried, so some may exist under another form.

**Limits**
- This is a Guardian-crossover list, not a popularity list, and it leans UK and US. The newest additions are mostly news figures, who score across news sections because they are news subjects, not because they cross industries.
- Keir Starmer's count is a floor: the pull stopped at 1,000 articles of 1,406.
- The best-guess names were picked by hand, by guessed popularity, and some of them (the newest batch) were picked partly because a Guardian tag existed, so they are not a fair sample.
- Search interest (Semrush) is from March 2026, so it misses people whose year since then has been big.
