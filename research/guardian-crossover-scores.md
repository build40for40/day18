# Guardian crossover scores, first pass

Run on 25 November 2026 over the 100 living people in `semrush-living-seed-100.csv`.

**Window:** 25 Nov 2025 to 25 Nov 2026 (12 months).

**Data:** Guardian Content API, articles carrying the person's Guardian keyword tag (articles about them, not passing mentions). Each article's section is counted.

**Score (`other_sections`):** the number of Guardian sections other than the person's home section that have at least 1 article about them. Home is the section with the most articles. The opinion section (`commentisfree`) is ignored, and `football` is merged into `sport`. `outside_pct` is the share of their articles that fall outside the home section.

**Limits, read before using the numbers**

- Volume drives the score. The median person has 12 articles, and many have under 20, so one article can add a "section". Always read `other_sections` next to `articles_12m`.
- `truncated_at_1000` = Y means the pull stopped at 1,000 articles (only Donald Trump), so his count is a floor.
- Politicians and royals appear across news, world and culture sections because they are news subjects, which is not the same as crossing between industries.
- Five people have no Guardian tag (Megan Fox, Jake Paul, MrBeast, Logan Paul, Charli D'Amelio) and five tagged people had no usable articles, so those rows have no score.
- Tags were matched by exact name, with three fixed by hand (Meghan Markle, George W Bush, Kate Middleton). `us-news/george-bush` may include other Bushes.
- Nothing here is validated as a predictor of fame. It describes Guardian coverage only, and the Guardian leans UK and US.
