---
title: "Test blog markdown"
date: "2026-02-07"
description: "A comprehensive guide to testing markdown rendering and table of contents navigation."
---

![Abstract Pattern](https://www.raycast.com/_next/image?url=https%3A%2F%2Fmisc-assets.raycast.com%2Fwallpapers%2Floupe-mono-dark-preview.png&w=3840&q=70)

## Introduction

Welcome to this **comprehensive test** of our blog's rendering capabilities. This post is designed to push the limits of our *Table of Contents* component and ensure that all standard Markdown features are styled correctly.

We will cover typography, lists, code blocks, and deep nesting.

## Typography

Text should be legible and well-spaced.

### Emphasis

We support **bold text**, *italic text*, and ***bold italic text***. You might also want to use `inline code` for technical terms.

### Blockquotes

Sometimes you need to quote someone or highlight a specific concept:

> "The details are not the details. They make the design."
> — Charles Eames

Blockquotes should stand out from the rest of the text.

## Lists

Lists are essential for organizing information.

### Unordered Lists

-   First item
-   Second item
    -   Nested item
    -   Another nested item
-   Third item

### Ordered Lists

1.  Step one
2.  Step two
3.  Step three

## Code Blocks

As a developer portfolio, syntax highlighting is crucial.

```typescript
interface User {
  id: number;
  name: string;
  role: "admin" | "user";
}

function getUser(id: number): User {
  return {
    id,
    name: "Khémara",
    role: "admin",
  };
}
```

## Deep Nesting

This section tests the Table of Contents' ability to handle multiple headers.

### Level 3 Heading

This is a subsection.

#### Level 4 Heading

This is a sub-subsection. Ideally, our TOC might handle this or just show up to level 3.

### Another Level 3

Just to add more length to the page.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Conclusion

If you can read this and navigate to this section via the Table of Contents, the test is a success!
