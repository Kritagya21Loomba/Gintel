Improvement Roadmap
Numerical analysis & insight improvements — no LLM required
April 2026 · v0.2.
This document covers every suggested improvement across Developer Identity, Portfolio Scoring, Actionable Gaps, Temporal
Intelligence, Career Alignment, Repo-Level Scoring, Stack Signals, Consistency Metrics, Profile Completeness, Red Flag
Detection, and Benchmarking — all implementable with pure numerical and pattern-based analysis.

01

Developer Identity
— Archetype confidence score
Instead of a single label, output a percentage match across all 7 archetypes so users see their blend — e.g.
'Backend 68%, DevOps 21%, ML 11%'. A single label discards useful ambiguity.

— Per-repo archetype contribution
Show which specific repos drove the classification and what signals they contributed. Traceability makes the output
credible.

— Detect archetype drift
Compare the archetype computed from repos created 6+ months ago vs. recent repos using commit timestamps.
Flag if the archetype has shifted — this is a signal of active upskilling.

— Solo vs. collaborative signal
Count repos with more than one contributor and merged PRs from others. Factor this into identity as a
seniority/collaboration dimension that is currently invisible to the classifier.

02

Portfolio Score
— Break the score into visible sub-scores
Never show just the total. Surface each dimension separately: depth, consistency, documentation, community, and
completeness. A black-box number invites distrust.

— README quality heuristic
Count sections (headings), word count, presence of code blocks, links, and badges per repo. Score 0–10 per repo
and roll up to profile level.

— Test file ratio
Count files matching .test., _test., spec, /tests/, /test/ as a fraction of total source files. This is the single
clearest proxy for engineering discipline available without running code.

— Commit depth per repo
Total commits divided by repo age in weeks. Flags 'dumped once and abandoned' vs. actively maintained. A repo
with 200 commits over 2 years reads very differently from one with 200 commits in a single week.

— Dependency file presence
Check for package.json, requirements.txt, go.mod, Cargo.toml, pom.xml etc. as a binary proxy for project maturity.
A repo without a dependency file is almost certainly a script or experiment.

— Issue and PR activity
Closed issues and merged PRs are strong 'project is real' signals. Factor them into the completeness sub-score —
they indicate the project has users or collaborators.

— Release and tag presence
Repos with at least one tagged release score higher on completeness. Raw commit-only repos score lower.
Tagging releases is a basic professional-practice signal.

— Repo description completeness
Does the repo have a description set? A homepage URL? These are simple binary checks — missing descriptions
are the most common and easiest-to-fix portfolio gap.

03

Actionable Gaps
— Always name the specific repos
Every recommendation must cite which repo triggered it. Never emit a generic suggestion. 'Add a README' is
useless. 'api-server has 60 commits and no README' is actionable.

— Detect learning and tutorial repos
Flag repos whose names contain: learn, tutorial, course, bootcamp, practice, exercise, demo, clone, test, copy.
Warn if any of these are pinned — they actively hurt a portfolio impression.

— No deployed project detection
Check repo descriptions and homepage fields for URLs. If zero repos have a live deployment link, flag it explicitly
as a high-priority gap.

— Dead repo detection
Repos with 0 commits in the last 90 days AND fewer than 10 total commits are noise. Count and surface them —
they pad repo count without adding signal.

— Language spread penalty
If a user has more than 4 languages each comprising less than 15% of total bytes, flag 'breadth over depth'. This
pattern reads as exploration rather than expertise.

— Zero-collaboration flag
If every repo is solo with no PRs merged from others and no co-contributors, surface this explicitly. It is a visible
weakness in senior-role evaluations.

— Pinned repo audit
Score the 6 pinned repos specifically. If any pinned repo scores lower than the top unpinned repos, recommend a
specific swap by name.

— Commit message quality heuristic
Sample the last 50 commit messages. Flag if more than 50% are single words or fewer than 15 characters — e.g.
'fix', 'update', 'wip', 'asdf'. This is a clear professionalism signal.

04

Temporal Intelligence
— Contribution velocity
Commits per week averaged over rolling 4-week windows. Plot as a sparkline so the trend direction is immediately
visible — rising, flat, or declining.

— Active hours distribution
Bin commits by hour of day and day of week. Surface patterns: pure night committer, consistent 9-5, weekend-only.
Make the heatmap show patterns, not just counts.

— Longest active streak vs. current streak
The gap between personal best and current streak is more motivating than either number alone. e.g. 'Your best
streak was 34 days. Current: 3 days.'

— Language trajectory timeline
Track which languages appear in repos ordered by creation date. Show the user their skill evolution as a timeline —
this is the most differentiated temporal feature you can offer.

— Stagnation alert
If no meaningful commit (more than 5 lines changed) in the last 30 days, surface a specific flag with the exact day
count. Precision makes it feel real, not generic.

— Peak productivity window
Identify the 3-month window in their full history with highest commit velocity. Useful framing for interviews: 'when
were you most active and what were you building?'

— Commit size distribution
Average lines changed per commit across all repos. Very large commits (500+ lines) suggest infrequent big-batch
work. Small consistent commits suggest disciplined practice.

— Contribution gap histogram
Map all gaps between consecutive commits. If the median gap is 14+ days, flag it as an inconsistency pattern.
Show the distribution, not just the average.

05

Career Alignment
— Seniority estimation
Derive a Junior / Mid / Senior / Staff signal from: account age, total repos, avg commits per repo, presence of tests,
presence of CI config files, issue and PR counts. Show confidence level.

— CI/CD signal detection
Check for .github/workflows/, Dockerfile, docker-compose.yml, .travis.yml, Jenkinsfile. These are strong
professional-practice signals absent from most student profiles.

— Documentation-to-code ratio
Bytes of markdown vs. bytes of source code per repo. Very low ratios are a gap for senior-level roles where
documentation is expected as part of the work.

— Production-readiness signals
Detect presence of Dockerfile, environment config files, Makefile, and logging/error-handling libraries in
dependencies. These map to 'can this person ship to prod?' evaluations.

— Role gap distance score
For each target role (Backend, ML, DevOps, etc.), compute a numerical distance showing exactly how many signal
points away they are from a strong match. Make it feel like a gap to close, not a verdict.

06

Score Transparency
— Show raw inputs alongside every score
e.g. 'README score: 6/10 — has description and setup instructions, but no screenshot or badges.' Never show a
number without showing what produced it.

— Percentile framing
Bucket users into approximate percentile ranges per dimension based on reasonable distribution assumptions.
'Bottom 25% for test coverage among developers with your stack' is more motivating than a raw number.

— Score delta on re-analysis
When a user runs Gintel a second time, show what changed and by how much per sub-score. This turns the tool
from a one-time snapshot into something worth returning to.

— 'What would move my score most' calculation
Rank the top 3 changes by estimated score impact. e.g. 'Adding READMEs to your 4 undocumented repos would
increase your portfolio score by ~12 points — the single highest-leverage action.'

— Score breakdown diff view
When comparing two analysis runs, highlight which sub-scores improved, declined, or stayed flat with exact deltas
shown per dimension.

07

Repo-Level Scoring
— Per-repo quality card
Score every repo 0–100 with the same sub-dimensions: readme, tests, commits, activity, deployment signal,
description. Profile-level scores without repo-level breakdowns lack depth.

— Top 3 / Bottom 3 repos
Surface the strongest and weakest repos by score explicitly. The bottom 3 is the most immediately actionable
output you can show a user.

— Hidden gem detection
Repos that score highly on quality metrics but have 0 stars and are not pinned. Recommend surfacing them —
these are underexposed assets.

— Repo size vs. commit count ratio
A repo with 50,000 lines and 3 commits is a dump, not a project. Flag repos where codebase size significantly
outpaces commit history.

— Single-language-only flag
Repos with only one file type (e.g. all .py, no config, no docs, no tests) score lower on maturity. A real project has
heterogeneous file types.

— Repo age vs. last commit gap
A repo created 2 years ago with its last commit also 2 years ago is abandoned. Weight this gap heavily in the
activity sub-score.

08

Stack Signals
— Framework detection
Infer frameworks from dependency files, not just language. express/fastapi/django/rails/spring tell a very different
story than raw JS/Python/Ruby/Java. Language alone is too coarse.

— Database signal
Detect pg, mongoose, prisma, sqlalchemy, sequelize etc. in dependencies. 'Knows how to persist data' is a distinct
career signal that language detection completely misses.

— Cloud and infrastructure signal
Detect aws-sdk, boto3, google-cloud, azure, Terraform files, Kubernetes YAML. These map directly to DevOps and
Platform Engineering role alignment.

— Testing framework detection
jest, pytest, mocha, rspec, junit in dependencies confirm testing discipline beyond just looking for test file names.
Dependency presence is harder to fake than file structure.

— Security awareness signal
Presence of .env.example (not .env), use of secrets management libraries, presence of SECURITY.md. Rare but a
very strong positive signal for senior role alignment.

09

Consistency Metrics
— Weekend vs. weekday commit ratio
A pure weekend committer vs. a consistent 5-day committer are meaningfully different profiles. Surface this
neutrally as a pattern, not a judgment.

— Multi-repo active days
Days where commits landed in more than one repo simultaneously. Signals someone juggling multiple projects vs.
serial single-focus work style.

— Streak recovery rate
After a contribution gap of 7+ days, how quickly does the user return to their previous velocity? Consistent recovery
is a positive resilience signal.

— Commit frequency standard deviation
High variance in weekly commit counts (e.g. 0 one week, 40 the next) is a different signal from low variance.
Compute and surface the consistency score alongside the average.

10

Profile Completeness
These are binary checks that take minutes to implement and users immediately act on. Score 0–8 and surface as a 'Profile
Visibility Score' separate from portfolio quality.

Check Signal
Profile photo set yes / no
Bio filled in yes / no
Location set yes / no
Website or URL set yes / no
Twitter/X handle linked yes / no
Pinned repos configured (vs. default) yes / no + count
Repos with descriptions vs. total repos ratio
Any repos with GitHub Pages deployment yes / no
11

Red Flag Detection
A dedicated section showing signals that actively hurt a profile — not just missing positives, but present negatives that
experienced recruiters will notice.

— Forked repo dominance
If more than 50% of public repos are forks with no subsequent commits, flag it. Forks with zero original commits add
no portfolio signal and dilute the repo count.

— Repo name quality
Flag repos named: test, asdf, repo1, untitled, copy, new-folder, temp. These should not be public — they signal
carelessness about profile presentation.

— Stale pinned repos
Any pinned repo with no commits in the last 12 months is likely hurting more than helping. Surface this with the
exact last-commit date.

— Public credentials risk
Scan repo descriptions and README content for strings that pattern-match API keys or tokens using basic regex.
This is both a red flag and a genuine security service to the user.

— Empty repo count
Repos with 0 commits beyond the initial GitHub-generated commit. Count them and flag — they pad the repo count
while contributing nothing to portfolio signal.

— All repos same creation window
If all or most repos were created within a 2-week window, it signals a portfolio dump rather than genuine ongoing
development. This pattern is immediately visible to experienced recruiters.

12

Comparative Benchmarking
No real user base required. These benchmarks can be modelled from reasonable assumptions about the GitHub developer
population and hardcoded as reference distributions.

— Stack popularity signal
Rank the user's primary language and framework by current job market demand using a hardcoded ranked list
(updated quarterly). Tell them if their stack is high, medium, or low demand.

— Commits-per-repo benchmark
Flag if a user's average commits per repo is below a reasonable threshold for their account age. Modelled as a
simple percentile lookup table.

— Archetype rarity signal
Tell users how common or rare their archetype is among GitHub developers. 'DevOps/Platform engineers make up
~8% of profiles' adds context and makes the classification feel meaningful.

— Account age vs. output benchmark
Compare total repos, total commits, and portfolio score against expected ranges for accounts of similar age.
Surface as 'ahead of pace', 'on pace', or 'behind pace'.

Priority order by impact-to-effort ratio: per-repo quality cards, red flag section, framework/dependency detection, profile
completeness score, and the 'what would move my score most' calculation. These five would make the product feel dramatically
more intelligent without any LLM dependency.

Gintel — github.com/Kritagya21Loomba/Gintel