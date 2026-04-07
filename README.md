# Website Editing Guide

This document explains how to update the website manually by editing files in the repository.

It is intended for team members who want to make content updates without using the CMS.

In most cases, you do not need to run the site locally. You can edit the content files directly in the GitHub website interface, commit the changes, and the website will update after deployment.

## Overview

Most pages on the website are generated from files inside the `/_data/` folder.

The general workflow is:

1. Open the file that controls the page content.
2. Edit the text, links, or image path.
3. Commit the change.
4. Wait for the website to redeploy.

Local preview is optional. It can be useful if you want to check changes before pushing them, but it is not required for normal content edits.

## Recommended Workflow For Most Editors

For most content updates, the easiest method is to use the GitHub website directly:

1. Open the repository on GitHub.
2. Navigate to the file you want to edit.
3. Click the pencil icon to edit the file.
4. Update the content.
5. Commit the change.
6. Wait for GitHub Pages to redeploy the site.

After deployment completes, the live site will reflect the new content.

## Website Structure

The most important files are:

```text
/index.html                Home page content
/_data/leader.yml          Leader page content
/_data/team.yml            Team member data
/_data/news.yml            News items
/_data/publications.yml    Publications
/_data/join.yml            Join page content
/_data/contact.yml         Contact page content
/images/uploads/           Uploaded images
```

## Important Notes Before Editing

- YAML files (`.yml`) are sensitive to spacing and indentation.
- Use spaces, not tabs.
- Keep the existing structure whenever possible.
- If a value already uses quotes, keep the quotes.
- Save the file before refreshing the browser.

If a page breaks after editing, the most common causes are:

- incorrect indentation
- a missing `-` in a list
- a missing closing quote
- an incorrect image path

## Which File Controls Each Page

### Home page

Page URL:

```text
/
```

Main file:

```text
/index.html
```

This file contains:

- the homepage welcome text
- research area cards
- homepage links
- hero carousel image references

### Leader page

Page URL:

```text
/leader/
```

Main content file:

```text
/_data/leader.yml
```

Display file:

```text
/leader.html
```

In normal use, only `/_data/leader.yml` needs to be edited.

### Team page

Page URL:

```text
/team/
```

Main content file:

```text
/_data/team.yml
```

Display file:

```text
/team.html
```

In normal use, only `/_data/team.yml` needs to be edited.

### News page

Page URL:

```text
/news/
```

Main content file:

```text
/_data/news.yml
```

### Publications page

Page URL:

```text
/publications/
```

Main content file:

```text
/_data/publications.yml
```

### Join page

Page URL:

```text
/join/
```

Main content file:

```text
/_data/join.yml
```

### Contact page

Page URL:

```text
/contact/
```

Main content file:

```text
/_data/contact.yml
```

## How To Edit Each Page

## Home Page

File:

```text
/index.html
```

Use this file to update:

- the introductory text
- research area titles and descriptions
- homepage links
- homepage hero images

### Example: update the welcome text

Find:

```html
<h2>Welcome to RiTUAL</h2>
<p>
  We are a multidisciplinary research group...
</p>
```

Replace the paragraph text with the new content.

### Example: update a research area

Find:

```html
<h3>Code-Switching and Multilingual NLP</h3>
<p>Building inclusive NLP through code-switching...</p>
```

Edit the title and description as needed.

### Example: update homepage images

In `/index.html`, find lines such as:

```html
background-image: url('{{ '/images/ritual_team.webp' | relative_url }}');
```

To change an image:

1. Add the new image file to `/images/`
2. Replace the filename in `/index.html`

Example:

```text
/images/new-group-photo.jpg
```

Then update:

```html
'/images/ritual_team.webp'
```

to:

```html
'/images/new-group-photo.jpg'
```

## Leader Page

File:

```text
/_data/leader.yml
```

This file controls:

- name
- title
- tagline
- photo
- email
- social links
- biography paragraphs
- research interests
- education
- awards

### Structure

```text
Leader page
  -> /leader.html
  -> reads /_data/leader.yml
```

### Example

```yml
name: Thamar Solorio
title: Professor of Natural Language Processing
tagline: Leading innovative research...
photo: uploads/leader/Thamar Solorio.jpg
email: thamar.solorio@mbzuai.ac.ae
twitter: https://twitter.com/thamar_solorio
scholar: https://scholar.google.com/...
```

### Update the leader photo

1. Add the new image to:

```text
/images/uploads/leader/
```

2. Update this line in `/_data/leader.yml`:

```yml
photo: uploads/leader/Thamar Solorio.jpg
```

Example:

```yml
photo: uploads/leader/new-photo.jpg
```

### Update the biography

The biography is written as a list:

```yml
bio:
  - First paragraph here.
  - Second paragraph here.
```

Each `-` creates one paragraph on the page.

### Add a research interest

Example:

```yml
interests:
  - Multilingual Natural Language Processing
  - Low-resource machine learning
  - Human-centered AI
```

## Team Page

File:

```text
/_data/team.yml
```

This file contains all team members.

Each person is stored as one block.

### Example person block

```yml
- name: "John Doe"
  role: "PhD Student"
  bio: "John works on multilingual NLP."
  photo: "uploads/team/john.jpg"
  email: "mailto:john@example.com"
  linkedin: "https://linkedin.com/in/johndoe"
  website: "#"
  scholar: "#"
  github: "https://github.com/johndoe"
  keywords: "NLP, Multilingual"
```

### Add a new person

1. Open `/_data/team.yml`
2. Find a person with a similar role
3. Copy the full block
4. Paste it below
5. Replace the values

### Important fields

- `name`: full name
- `role`: determines where the person appears on the page
- `bio`: short description
- `photo`: image path under `/images/`
- `email`: usually starts with `mailto:`

### Roles currently used by the site

- `Professor of Natural Language Processing`
- `Postdoctoral Researcher`
- `Research Scientist`
- `Research Engineer`
- `PhD Student`
- `MSc Student`
- `Visiting PhD Student`

If a new role format is introduced, the person may appear in an unexpected section.

### Mark a person as alumni

Add:

```yml
alumni: true
```

### Add a team photo

1. Add the image to:

```text
/images/uploads/team/
```

2. Update the `photo` field:

```yml
photo: "uploads/team/john.jpg"
```

## News Page

File:

```text
/_data/news.yml
```

This file contains a list of news items.

### Example

```yml
news:
  - title: "Our paper was accepted at ACL"
    date: "2026-04-08"
    content: "Short description here."
```

### Add a news item

1. Open `/_data/news.yml`
2. Copy an existing item
3. Paste it near the top of the list
4. Update the `title`, `date`, and `content`

### Date format

Always use:

```text
YYYY-MM-DD
```

Correct:

```text
2026-04-08
```

Incorrect:

```text
08/04/2026
April 8, 2026
```

### Add a link inside news content

Example:

```yml
content: "We received an award. <a href='https://example.com' target='_blank'>Read more</a>."
```

## Publications Page

File:

```text
/_data/publications.yml
```

Each publication is stored as one block.

### Example

```yml
- title: "My Paper Title"
  authors: "Alice, Bob, Carol"
  venue: "ACL"
  year: 2026
  type: "conference"
  badge: "ACL"
  selected: true
  links:
    paper: "https://example.com/paper.pdf"
    code: "https://github.com/example/repo"
    dataset: "https://huggingface.co/datasets/example"
```

### Field meanings

- `title`: paper title
- `authors`: all authors in one line
- `venue`: publication venue
- `year`: numeric year
- `type`: one of `conference`, `journal`, `workshop`, `preprint`
- `badge`: short visible label
- `selected`: `true` or `false`
- `links`: optional URLs for paper, code, dataset, video, or demo

### Add a publication

1. Open `/_data/publications.yml`
2. Copy an existing publication block
3. Paste it near the top
4. Update the values

If some links are not available, remove those lines or keep only the available ones.

Example:

```yml
links:
  paper: "https://example.com/paper.pdf"
```

## Join Page

File:

```text
/_data/join.yml
```

This file controls:

- top title
- intro paragraph
- open positions
- contact text

### Example

```yml
hero:
  title: Join Our Research Lab
  intro: Our lab is expanding...
```

### Add a position

Example:

```yml
positions:
  - title: Postdoctoral Researchers
    description: Research-focused roles with independence and mentorship.
  - title: Research Interns
    description: Short-term opportunities for motivated students.
```

## Contact Page

File:

```text
/_data/contact.yml
```

This file controls:

- office hours
- location
- email
- map embed link

### Example

```yml
cards:
  - icon: clock
    title: Office hours
    body: |-
      9:00 a.m - 6:00 p.m
      UTC+4
```

### Note about `body: |-`

This allows the text below it to span multiple lines.

Example:

```yml
body: |-
  Building 1B
  MBZUAI
  Abu Dhabi, UAE
```

### Update the email card

Find:

```yml
  - icon: envelope
    title: Email
    body: thamar.solorio@mbzuai.ac.ae
    link: mailto:thamar.solorio@mbzuai.ac.ae
```

Replace both email values with the new address.

## Adding Images

### Team images

Add files to:

```text
/images/uploads/team/
```

### Leader images

Add files to:

```text
/images/uploads/leader/
```

### Home page images

Add files to:

```text
/images/
```

### Image path rule

If the file is:

```text
/images/uploads/team/jane-smith.jpg
```

then in YAML use:

```yml
photo: "uploads/team/jane-smith.jpg"
```

Do not include `/images/` at the beginning of the YAML photo path.

## Recommended Editing Method

To reduce mistakes:

1. Copy an existing block
2. Paste it
3. Change only the text after each `:`
4. Keep the spacing and structure the same

This is the safest approach for YAML files.

## Optional: Preview The Site Locally

Running the site locally is optional.

Use this only if you want to preview changes before pushing them.

From the project folder, run:

```bash
bundle exec jekyll serve
```

Then open:

```text
http://127.0.0.1:4000/web/
```

If you want to use the local-only Decap admin:

```bash
npx decap-server
```

Then open:

```text
http://127.0.0.1:4000/web/admin/
```

## Quick Reference

```text
Change homepage text        -> /index.html
Change leader information   -> /_data/leader.yml
Change team information     -> /_data/team.yml
Add or edit news            -> /_data/news.yml
Add or edit publications    -> /_data/publications.yml
Change join page            -> /_data/join.yml
Change contact page         -> /_data/contact.yml
Update images               -> /images/...
```

## Troubleshooting

If a page stops rendering correctly after an edit, check the following:

1. Is the indentation still correct?
2. Is a `-` missing from a list?
3. Is a quote missing?
4. Is the file path correct?
5. Was the file saved before refreshing?

If needed, revert the last change and try again.

## Final Note

For most content updates, the only files you need are the files in `/_data/`, and you can edit them directly in the GitHub web interface.

When making routine edits, it is usually best to start there first.
