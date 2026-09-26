# Fleet page generator

`fleet.html` is generated, not hand-edited. To change the equipment list:

1. Edit `fleet_data.py` (one tuple per model: name, capacity, main boom,
   fixed jib, luffing jib, units in fleet, year).
2. Run `python tools/gen_fleet.py` from the repo root.

`fleet_template.html` holds the page around the tables; `gen_fleet.py` fills in
`<!--GROUPS-->`, `<!--FILTERS-->` and `{{TOTAL}}`, sorts each table by capacity
and totals the machine count.

Source: the client's "website Changes Detail - 2016.xls" equipment sheet, merged
with the machines previously listed on the site.
