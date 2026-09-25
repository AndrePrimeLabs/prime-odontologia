# Data Export Folder

Put your Base44 CSV exports here (Dashboard → Data → select collection →
⋯ More Actions → Export).

Expected files for the current seed scripts:
- `customers.csv` — columns: name, email, phone

As you build out more services (REV-X, COST-X, etc.), export their
corresponding Base44 collections here too, and add a matching `db/seed.js`
in that service following the same pattern as `services/crm-x/db/seed.js`.
