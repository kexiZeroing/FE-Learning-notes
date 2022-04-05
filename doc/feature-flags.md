## Building with feature flags

Feature flags are a tool used to add features to an app that should only be available to a subset of users. Feature flags are a great way to gradually see how new features will behave in a production environment, especially if an application is already being used by users in production.

### How feature flags work
Feature flags are usually managed in some sort of admin interface where you can choose which features should exist behind a feature flag and which people should have access to those features. Once feature flags are set in the admin interface, the feature flags settings can be recovered and then used within an application's API or web application to decide what block of code should be run.

> Ideally, code behind feature flags is lazy loaded since it doesn't make sense to load code that a user will not be able to execute.

There are feature flag services available that provide the admin interface used to manage feature flags and also an API that can be called to get feature flags available for a particular user. Here's a list of some feature flag services:
- [LaunchDarkly](https://launchdarkly.com)
- [FlagSmith](https://flagsmith.com)
- [Unleash](https://www.getunleash.io)
- [Split](https://www.split.io/)

If you'd rather not use a 3rd party service to manage feature flags, you could also build out your own feature flag service without too much trouble. A custom feature flag service might work as follows:
- In a feature flag admin page (that you could build out with a front-end framework), create a feature flag and specify which email accounts (or user IDs) should have access to that feature.
- The feature flag settings are saved in a database.
- When a user comes to visit the application, it will trigger an API call on initial app load that will request the feature flags enabled for that user.
- The API will read the feature flag settings from the database and see if the currently authenticated user, which can be figured out via a JWT cookie or something similar, has access to the feature flag.
- Once the API determines which feature flags a user has access to, it will pass a list of feature flags to the front-end that correspond with the features the current user has access to.
- The UI will conditionally display new features depending of whether a user has the feature flag corresponding with the particular feature.

> Feature flags can also be used on the server side if you'd like to prevent certain API functionality. For example, if you introduce a new API route related to a new feature, then you could check if the user that is calling the new API route has access to the new feature before trying to return data.

### Gradually test features in production
Feature flags open up the possibility of shipping features to a production environment even if the feature is not completely finished or polished. This has the following benefits:
- Allow internal teams the chance to test out features with production data
- Allow iterating and testing features without negatively impacting normal app users
- Gradually rollout new features to users

A gradual rollout could be done by enabling feature flags to a set of beta users that sign up for your application's beta program. A percentage rollout is also another way to gradually rollout new features to users by gradually moving from 0 to 100% of users that can view a feature.

Feature flags help make trunk-based development more feasible since developers can create many small PRs that build upon a new feature and only have the feature accessible to all users when the feature is fully complete.
- Prototypes
- Demos for stakeholders
- QA on prod
- gradual rollouts

### Notes
- You want to be sure that your application is resilient to the feature flag service failing; i.e. make sure the default choice is the safe choice.

- You may get concerned that your codebase will end up as a tangle of if-conditions, littered with feature flags. This is a good problem to have; a better problem than not being able to ship features. I would recommend doing a regular cleanup; you could possibly run a script on your codebase every month or so, and detect flags that are set at 100% in production.

- A concern is that you'll end up shipping more code to a user than is generally used/required for the application. This is valid, and as such, feature flags for front end development are probably best for applications where bundles size isn't the most critical metric. Suggestions to improve this could be using dynamic imports for features.

- How do you write tests for stuff behind feature flags? You would mock the feature flag service itself, and set the required flags to the values you need for the tests you're running.

### References
https://robertcooper.me/post/feature-flags
https://gist.github.com/threepointone/2c2fae0622681284410ec9edcc6acf9e
https://martinfowler.com/articles/feature-toggles.html
