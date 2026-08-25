---
name: kramdown-eats-indented-html
description: parse_block_html is on site-wide, so an indented inline tag inside a markdown="1" block renders as a code sample instead
when: adding HTML to a page on the docs site
paths: ["website/**"]
---

Inside a block carrying `markdown="1"`, a tab-indented `<a>` or `<button>` becomes an indented code block.
`parse_block_html: true` is set for the whole site in `_config.yml`, and kramdown reads the indentation
before it reads the tag.

**Why:** it is not a rendering bug that shows up as broken markup - the page builds green and the control
appears as grey monospace, which reads as a mistake in the content rather than in the markdown settings.

**How to apply:** a block that holds hand-written HTML and no markdown carries `markdown="0"`. Both button
rows on the site do. If markdown *and* raw HTML are both needed in one block, keep the HTML flush to the left
margin.
