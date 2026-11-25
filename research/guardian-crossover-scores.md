# Guardian crossover scores, first pass

Run on 25 November 2026 over the 100 living people in `semrush-living-seed-100.csv`, plus 13 more living people from Semrush ranks 181 to 305 in `semrush-seed-extension-13.csv` (113 rows in total). Semrush ranks 401 to 456 are all historical figures, so the Semrush list has no more living people to add.

**Window:** 25 Nov 2025 to 25 Nov 2026 (12 months).

**Data:** Guardian Content API, articles carrying the person's Guardian keyword tag (articles about them, not passing mentions). Each article's section is counted.

**Score (`other_sections`):** the number of Guardian sections other than the person's home section that have at least 1 article about them. Home is the section with the most articles. The opinion section (`commentisfree`) is ignored, and `football` is merged into `sport`. `outside_pct` is the share of their articles that fall outside the home section.

**Limits, read before using the numbers**

- Volume drives the score. The median person has 12 articles, and many have under 20, so one article can add a "section". Always read `other_sections` next to `articles_12m`.
- `truncated_at_1000` = Y means the pull stopped at 1,000 articles (only Donald Trump), so his count is a floor.
- Politicians and royals appear across news, world and culture sections because they are news subjects, which is not the same as crossing between industries.
- Seven people have no Guardian tag (Megan Fox, Jake Paul, MrBeast, Logan Paul, Charli D'Amelio, Shah Rukh Khan, Amitabh Bachchan) and nine tagged people had no usable articles in the window, so those rows have no score. The tag lookup for the last two was a name search that found nothing, and they may exist under a spelling we did not try.
- Tags were matched by exact name, with three fixed by hand (Meghan Markle, George W Bush, Kate Middleton). `us-news/george-bush` may include other Bushes.
- Nothing here is validated as a predictor of fame. It describes Guardian coverage only, and the Guardian leans UK and US.

## Expected to cross over, but low or missing

These are people we expected to see score higher. The likely cause is thin Guardian coverage, not a lack of crossover, so they are the first candidates for a second press source.

| Person | Articles in 12 months | Other sections |
|---|---|---|
| Selena Gomez | 2 | 0 |
| Jenna Ortega | 7 | 0 |
| Angelina Jolie | 1 | 0 |
| Keanu Reeves | 3 | 0 |
| Eminem | 2 | 0 |
| Jackie Chan | 2 | 0 |
| Al Pacino | 4 | 0 |

No Guardian tag found: MrBeast, Charli D'Amelio, Jake Paul, Logan Paul, Megan Fox, Shah Rukh Khan, Amitabh Bachchan.

Tag found but no articles in the window: Michael Phelps, Malala Yousafzai, Twiggy, Sachin Tendulkar.

The extra 13 mostly show how little the Guardian covers South Asian figures (Virat Kohli has 1 article, Shah Rukh Khan and Amitabh Bachchan have no tag), which suggests the Guardian is a weak yardstick for global popularity. Only Volodymyr Zelenskyy (337 articles, 7 other sections) has enough volume to read, and as a news subject his spread is not the same as crossing between industries.
