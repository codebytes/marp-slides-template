# marp-slides-template

[Use this template!](https://github.com/codebytes/marp-slides-template/generate)

This is a *minimal* template to create a [marp] site that:

- can be built and published on [GitHub Pages];

More specifically, the created site:

- uses marp
- uses the [GitHub Pages / Actions workflow] to build and publish the site on GitHub Pages.
- has a DevContainer/CodeSpace configured with Marp and Markdown preview extensions ready
  - chrome is also added as it's needed in linux to make powerpoint slides

To get started with creating a site, just click "[use this template]"!

After completing the creation of your new site on GitHub, update it as needed:

## Replace the content of the template pages

Update the following files to your own content:

- `slides/Slides.md` (your new presentation)
- `README.md` (information for those who access your site repo on GitHub)


## Publishing your site on GitHub Pages

1.  In your newly created repo on GitHub:
    - go to the `Settings` tab -> `Pages` -> `Build and deployment`, then select `Source`: `GitHub Actions`.
    - if there were any failed Actions, go to the `Actions` tab and click on `Re-run jobs`.

## Building and previewing your site locally

1. Install [Visual Studio Code](https://code.visualstudio.com/) if you haven't already.
2. Install the [Marp for VS Code extension](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) from the Visual Studio Code marketplace.
3. Open the slides/Slide.md file in VS Code.

## Customization

You're free to customize sites that you create with this template, however you like!

## Licensing and Attribution

This repository is licensed under the [MIT License]. You are generally free to reuse or extend upon this code as you see fit; just include the original copy of the license (which is preserved when you "make a template"). While it's not necessary, we'd love to hear from you if you do use this template, and how we can improve it for future use!

The deployment GitHub Actions workflow is heavily based on GitHub's mixed-party [starter workflows]. A copy of their MIT License is available in [actions/starter-workflows].

## Resources

- [GitHub Pages](https://docs.github.com/en/pages)
- [GitHub Pages / Actions workflow](https://github.blog/changelog/2022-07-27-github-pages-custom-github-actions-workflows-beta/)
- [Use this template](https://github.com/codebytes/marp-slides-template/generate)
- [MIT License](https://en.wikipedia.org/wiki/MIT_License)
- [Starter workflows](https://github.com/actions/starter-workflows/blob/main/pages/jekyll.yml)
- [Actions/starter-workflows](https://github.com/actions/starter-workflows/blob/main/LICENSE)
