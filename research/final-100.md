# Final 100: the Crossover 100 list

`final-100.csv` is the list, ranked by `other_sections` (Guardian sections other than the person's home section with at least 1 article about them, 25 Nov 2025 to 25 Nov 2026), then `outside_pct`, then article count. **Every person has at least 1 other section.** Method and limits are in `guardian-crossover-scores.md`.

**Make-up:** 66 from Semrush (the living seed, ranks 1 to 305) and 34 best-guess names that are not from Semrush. 28 of the 100 are thin (under 10 articles), so one article can move their score.

**How it was built.** Everyone scored from the Semrush living seed, the 13-person extension and the best-guess batches was pooled (129 people with at least 1 other section), and the top 100 by score was taken. That ranks by Guardian coverage across sections only, so it favours people the Guardian covers widely, and the tie at 1 other section is decided by thin differences.

**Latest re-rank (18 new names checked, 8 in, 8 out).**
- **In:** Andy Burnham, Pete Hegseth, Marco Rubio, Benjamin Netanyahu, Mike Johnson, Hakeem Jeffries, Dario Amodei, Abdul El-Sayed.
- **Out:** John Travolta, Naomi Campbell, Doja Cat, Michael Jordan, Millie Bobby Brown, Tyler The Creator, Angela Merkel, Roger Federer. Each had 1 other section on thin or low-outside-share coverage, so they were first to fall under the tie-break.
- Scored but missed the cut: Chuck Schumer. Already in: Xi Jinping.
- No Guardian tag found: Mary Peltola, Gina Hinojosa, Scott Bessent, James Talarico. A name search (needs 5 articles per section to count) could still score some of them.
- The earlier batch of 35 names is in `guess-extension-35.csv`; the 13 from this round are in `guess-extension-13-late.csv`.

**Scored 0, so never on the list (17):** Lebron James, Jenna Ortega, Selena Gomez, Eminem, Angelina Jolie, Keanu Reeves, Cristiano Ronaldo, Al Pacino, Jackie Chan, Simone Biles, Oprah Winfrey, Shania Twain, Virat Kohli, Neymar, Priyanka Chopra, The Weeknd, Travis Scott. These are people we expected to see; the Guardian did not cover them across sections in this window.

**From the 35-name batch:** tagged but 0 other sections: Caitlin Clark, Victor Wembanyama, Max Verstappen, Lando Norris, Jannik Sinner, Shohei Ohtani, Doechii, Austin Butler. No tag found: Sundar Pichai, Satya Nadella, Demis Hassabis, Lisa Su, Emma Chamberlain, Alex Cooper, Hasan Piker, Lamine Yamal, Jungkook. Those lookups found nothing under the spellings tried, so some may exist under another form.

**Limits**
- This is a Guardian-crossover list, not a popularity list, and it leans UK and US. The newest additions are mostly politicians, who score across news sections because they are news subjects, not because they cross industries.
- Keir Starmer's and Andy Burnham's counts are floors: the pull stops at 1,000 articles.
- The best-guess names were picked by hand and some were picked partly because a Guardian tag existed, so they are not a fair sample.
- Search interest (Semrush) is from March 2026, so it misses people whose year since then has been big.
