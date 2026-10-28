# Follow-up work

- Protect the public demo: isolate or reset visitor data, restrict destructive changes to the shared dataset, and replace freely selectable staff identities before production use.
- Unify enquiries, quotes and payments: persist enquiries, prepare and accept versioned quotes, attach processor payments to accepted quotes, and retire the old direct-purchase/refund model. Update the README and administration screens to match.

## Deferred audit findings

- Reload example quote payment state when the selected account changes.
- Isolate private offline media caches across accounts.
- Bound offline image downloads, remove stale cached assets on updates, and clarify tour-bundle downloads.
- Review the dependency advisories reported by npm during installation (three moderate, one high) and choose targeted upgrades.
