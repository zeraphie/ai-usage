# Security and privacy

What every repo of Izzy's holds to. These rules are to be revisited once
they have been used in practice.

## General

- No secret is written into the code or the repo. Secrets come from the
  environment.
- Nothing sensitive is logged: no passwords, tokens or personal data.
- Anything a person or another system sends is untrusted. Check it at
  the boundary, and use parameterised queries only.
- No `eval()`, no `Function()`, and no `innerHTML` or
  `dangerouslySetInnerHTML` with content a person supplied.
- Every dependency needs a case, and a maintained, small one beats a
  large one.

## Sign-in and tokens

- OAuth carries a `state` parameter, and PKCE for public clients.
- Tokens never go in `localStorage`: an `httpOnly` cookie, or memory.
- Refresh tokens rotate.
- A sign-in error never says whether an account exists.

## The web

- Every response sets a Content Security Policy.
- A request that changes state is protected against cross-site request
  forgery.
- No cookie that is not essential, without consent.

## Privacy

- Collect only the data a feature needs, and ask for the smallest OAuth
  scopes.
- No personal data is stored without a plan for how long it is kept and
  how it is deleted.
- A person's stored data has a way to be erased.
- No analytics or tracking without consent.

## Fintech, when a project turns it on

A project that handles money says so in its `.ai`, and then these hold
as well.

- Every change to a record can be traced: who, what, when, and to which
  record.
- Audit logs are append-only, with no personal data in plain text.
- Every endpoint checks who is asking and what they may do.
- Financial data is encrypted at rest and in transit.
- Sign-in and other sensitive endpoints are rate-limited.
