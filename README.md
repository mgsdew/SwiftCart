# SwiftCart

🔗 **Live Demo:** [https://spontaneous-sherbet-d66e8a.netlify.app/](https://spontaneous-sherbet-d66e8a.netlify.app/)

---

## Overview
SwiftCart is an E-Commerce Landing Page built with HTML, Tailwind CSS, Font Awesome icons, and JavaScript.

## Pages
- **[index.html](index.html)** — Home/landing page with the main storefront layout, navigation, and featured sections.
- **[products.html](products.html)** — Products page displaying the product listings with filtering and cart functionality.

## Tech Stack
- HTML5
- Tailwind CSS (Play CDN)
- Font Awesome 7
- Vanilla JavaScript

## Files
| File | Description |
|------|-------------|
| `index.html` | Main landing page |
| `products.html` | Products listing page |
| `style.css` | Custom styles |
| `script.js` | JavaScript logic |

---

## Knowledge Check

> See [Followup_Questions.md](Followup_Questions.md) for the full JavaScript knowledge check.

### Q1 — What is the difference between `null` and `undefined`?
`null` is an explicitly assigned empty value, while `undefined` means a variable has been declared but not yet assigned a value.

### Q2 — What is the use of `map()` in JavaScript? How is it different from `forEach()`?
`map()` creates and returns a new array based on a transformation. `forEach()` loops over elements but does not return anything.

### Q3 — What is the difference between `==` and `===`?
`==` compares values after type conversion; `===` compares both value and type strictly.

### Q4 — What is the significance of `async/await` in fetching API data?
`async/await` makes asynchronous API calls read like synchronous code, avoids callback nesting, and improves readability.

### Q5 — Explain the concept of Scope in JavaScript (Global, Function, Block).
- **Global scope** — accessible everywhere in the code.
- **Function scope** — accessible only inside the function where it is declared (`var`).
- **Block scope** — accessible only inside the `{}` block where it is declared (`let`, `const`).