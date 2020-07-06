# Developer collaboration guidelines

# Git commit messages (2020-07-06)
Short _descriptive_ summary of what you have done: "Can now save a game through the escape menu"
Or very short _non-descriptive_ when the change is _insignificant_ or a _simple refactoring_: "..." or "Refactor"

# Trunk based develop (2020-07-06)
Have short lived branches, less than a day. Basically, work _directly_ into master.
How? We use feature-branches or branch-by-abstraction.

Feature branching:
    You hide some functionality behind a boolean stores in for example local storage
    "if(myToggle) { showMyCode() }"

Branch by abstraction:
    app.get('/new-feature', NewFeatureHandler());
    ...but then there is no frontend code that uses it yet.

When we start working on a new feature:
1. Hide your new code behind a feature toggle.
1. Develop your code.
1. PUSH TO MASTER
1. Develop your code.
1. PUSH TO MASTER
1. Remove the feature toggle.

When should I _reeeaaally_ add a feature toggle..?
- You know you will implement front end code.
- You really think it will take more than a couple of hours.

So this is called Trunk Based Development.
Every commit goes to master, passes all the tests, breaks no previous code, and is _not_ visible to the user until it's ready.

It's great for:
- No merge conflicts
- You don't implement things twice
- You get early feedback on your solution
- And things _always_ work

# Formatters (2020-07-06)
Use ESLint. We don't want to talk about formatting. When we have a discussion around formatting... we automate by adding a rule to ESLint.

# Collaborating (2020-07-06)
- There should some constant collaboration. We want to learn from each others mistakes, share successes.
- We work on stuff that is somewhat related, so that we _have_ that collaboration built into the process.
- Some great tools for collaborating: Pair programming or Mob programming.

# Test-names (2020-07-06)
- /shared (domain code) - we use the name of the class (i.e. PlayerNextPhase.spec.js), and they end with .spec.js
- /server (Match.js) - Name the file with a common theme for all the tests in a file (i.e. AttackPhase.spec.js). We end the test name with .spec.js.
- /client (integration tests against Match.vue) Name the file with a common theme for all the tests in a file (i.e. EndGamePopup.test.js). We end test names with .test.js.

# TODO (2020-07-06)
- Add ESLint --fix to pre-commit hook
- Add common rules to ESLint in the root directory

# TODO Friday
- Check up on ESLint progress
- Answer questions on some recent pains
- Create a new card from scratch, together