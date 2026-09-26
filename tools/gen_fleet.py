import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fleet_data import TELESCOPIC, CRAWLER, LATTICE, ACCESS, YARD

def by_capacity(rows):
    # Heaviest first; "400 / 450 T" sorts on its first number.
    def tons(row):
        return float(row[1].split('/')[0].strip().split()[0])
    return sorted(rows, key=tons, reverse=True)

TELESCOPIC, CRAWLER, LATTICE = map(by_capacity, (TELESCOPIC, CRAWLER, LATTICE))

SP = os.path.dirname(os.path.abspath(__file__))


def units(n):
    return str(n)


def crane_table(cat, title, note, rows):
    body = []
    for model, cap, boom, jib, luff, n, year in rows:
        body.append(
            f'          <tr data-units="{n}">'
            f'<th scope="row">{model}</th>'
            f'<td class="is-key">{cap}</td>'
            f'<td>{boom}</td><td>{jib}</td><td>{luff}</td>'
            f'<td>{units(n)}</td><td>{year or "—"}</td></tr>'
        )
    total = sum(r[5] for r in rows)
    return f'''    <section class="fleet-group" data-group="{cat}" aria-labelledby="group-{cat}">
      <header class="fleet-group__head">
        <h2 class="h3" id="group-{cat}">{title}</h2>
        <p class="fleet-group__count">{total} machines</p>
      </header>
      <p class="fleet-group__note">{note}</p>
      <div class="fleet-table__scroll">
        <table class="fleet-table">
          <thead>
            <tr><th scope="col">Make &amp; model</th><th scope="col">Capacity</th><th scope="col">Main boom</th><th scope="col">Fixed jib</th><th scope="col">Luffing jib</th><th scope="col">In fleet</th><th scope="col">Year</th></tr>
          </thead>
          <tbody>
{chr(10).join(body)}
          </tbody>
        </table>
      </div>
    </section>'''


def simple_table(cat, title, note, rows, col):
    body = []
    for model, spec, n in rows:
        body.append(
            f'          <tr data-units="{n}">'
            f'<th scope="row">{model}</th>'
            f'<td class="is-key">{spec}</td><td>{units(n)}</td></tr>'
        )
    total = sum(r[2] for r in rows)
    return f'''    <section class="fleet-group" data-group="{cat}" aria-labelledby="group-{cat}">
      <header class="fleet-group__head">
        <h2 class="h3" id="group-{cat}">{title}</h2>
        <p class="fleet-group__count">{total} machines</p>
      </header>
      <p class="fleet-group__note">{note}</p>
      <div class="fleet-table__scroll">
        <table class="fleet-table fleet-table--slim">
          <thead>
            <tr><th scope="col">Make &amp; model</th><th scope="col">{col}</th><th scope="col">In fleet</th></tr>
          </thead>
          <tbody>
{chr(10).join(body)}
          </tbody>
        </table>
      </div>
    </section>'''


groups = [
    crane_table('telescopic', 'Telescopic cranes', 'Truck-mounted and all-terrain cranes from 20 to 800 tons, road-mobile and quick to rig.', TELESCOPIC),
    crane_table('crawler', 'Crawler cranes', 'Long-boom lattice crawlers for sustained heavy lifts and luffing jib work on site.', CRAWLER),
    crane_table('lattice', 'Lattice boom cranes', 'Truck-mounted lattice cranes; the two capacities are the boom and jib ratings.', LATTICE),
    simple_table('access', 'Boom &amp; scissor lifts, telehandlers', 'Access platforms rated by working height, for maintenance and erection at height.', ACCESS, 'Reach / capacity'),
    simple_table('yard', 'Hydra cranes &amp; forklifts', 'Pick-and-carry cranes and forklifts for yard handling and short moves.', YARD, 'Capacity'),
]

transport = '''    <section class="fleet-group" data-group="transport" aria-labelledby="group-transport">
      <header class="fleet-group__head">
        <h2 class="h3" id="group-transport">Trailers &amp; hydraulic multi-axles</h2>
      </header>
      <p class="fleet-group__note">Low bed, semi low bed and high bed trailers, plus Indian and imported multi-axle trailers for girders, cranes and over-dimensional cargo.</p>
    </section>'''

total = sum(r[5] for r in TELESCOPIC + CRAWLER + LATTICE) + sum(r[2] for r in ACCESS + YARD)

filters = [
    ('all', 'All equipment'),
    ('telescopic', 'Telescopic'),
    ('crawler', 'Crawler'),
    ('lattice', 'Lattice boom'),
    ('access', 'Access lifts'),
    ('yard', 'Hydra &amp; forklifts'),
    ('transport', 'Transport'),
]
filter_html = '\n'.join(
    f'      <button class="filter" type="button" data-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">{label}</button>'
    for k, label in filters
)

template = open(os.path.join(SP, 'fleet_template.html'), encoding='utf-8').read()
out = (template
       .replace('<!--GROUPS-->', '\n\n'.join(groups + [transport]))
       .replace('<!--FILTERS-->', filter_html)
       .replace('{{TOTAL}}', str(total)))
open('fleet.html', 'w', encoding='utf-8', newline='\n').write(out)
print('machines:', total)
