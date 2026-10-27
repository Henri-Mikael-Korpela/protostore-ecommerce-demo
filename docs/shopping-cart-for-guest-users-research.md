# Shopping Cart for Guest Users Research

## Introduction

The purpose of this document is to evaluate different approaches to implementing a shopping cart for guest users.

## History of Shopping Cart Functionality

To start off, it's worth mentioning that shopping cart wasn't a particular piece of software. Instead, it is a user-facing metaphor (or interface metaphor). This refers to a design concept in software that users familiar real-world objects or actions to help users understand how to interact with digital systems. The shopping cart is a stateful order-building process whose underlying implementation has changed as the Web has evolved.

### 1994, Before Cookies

The Web was originally intended to automate information-sharing among scientists working at universities and research institutes worldwide. Early websites were static documents providing read-only information. This was terrible for commerce. The original Web didn't provide proper methods to store state across pages, ensuring that a server could keep track of the same user and his purchase decisions.

It's interesting how IETF's (Internet Engineering Task Force) later formal description of HTTP state management called [RFC 2109](https://www.rfc-editor.org/info/rfc2109) published in February 1997 explicitly uses a shopping cart as an example for an application that needs to maintain state across otherwise independent HTTP requests:

> Currently, HTTP servers respond to each client request without relating that request to previous or subsequent requests; the technique allows clients and servers that wish to exchange state information to place HTTP requests and  responses within a larger context, which we term a "session".  **This context might be used to create, for example, a "shopping cart", in  which user selections can be aggregated before purchase**, or a  magazine browsing system, in which a user's previous reading affects which offerings are presented.

*Source: [RFC 2109](https://www.rfc-editor.org/info/rfc2109), chapter 3, viewed on 8th of October 2026, emphasis mine*

Before Web supported cookies, URLs were used to pass on state. Raymond Chen of Microsoft in a dev log [My friend and his buddy invented the online shopping cart back in 1994](https://devblogs.microsoft.com/oldnewthing/20140819-00/?p=203/) wrote recounts an implementation for Sub Pop Records in 1994. The site containing this implementation needed to let people browse records and keep track of the selected records. Apparently cookies were not a thing the site could reliably assume every browser supported. Therefore the implementation put a session identifier into URLs.

### 1994, After Cookies

An important development came from Netscape by Lou Montulli. [Montulli's own retrospective](https://montulli.blogspot.com/2013/05/the-reasoning-behind-web-cookies.html?m=1&version=v1) describes a shopping-server problem and the motivation to give the browser a small piece of state that it could return to the original server. His work resulted in cookies.

According to Montulli, Netscape released their browser in the fall of 1994 and it was "the most popular browser in the world". Since Netscape released a spec to Web Cookies for other browsers to implement it and since the Netscape browser was so popular, this helped people adopt cookies.

This original spec worked in the following way:

1. **The server sets a cookie** by sending an HTTP response containing an HTTP header `Set-Cookie`. Each cookie had key and value, separated by a `=` character and every cookie was separated by a semicolon.
2. **The browser stores the received state** along with rules describing which URLs it applies to. Additionally, cookie can contain an expiration time.
3. **The browser returns the cookie in a request** in a `Cookie` header in subsequent requests.

The original spec can be found [here](https://curl.se/rfc/cookie_spec.html).

### 1995-1999, The Server Side Shopping Cart Becomes Commonplace

Since cookies became popular, this made e-commerce more viable.

In this era, browser mostly carried identity and the server carried business state.
This model was enabled by the emergence of server-side web programming in the form of PHP (which began in 1994) and Microsoft's IIS 3.0/Active Server Pages in 1996, both of which could do server-side scripting and database interaction.

Amazon also launched its Web bookstore in 1995 and by this point the shopping cart metaphor was becoming the dominant model for multi-item online purchases.

