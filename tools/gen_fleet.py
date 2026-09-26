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


def card(model, kind, specs, cat, n=1):
    """One machine card: photo slot, type badge, model, spec pairs, enquiry link."""
    pairs = ''.join(
        f'<div class="spec"><span class="label">{k}</span><span class="spec__value">{v}</span></div>'
        for k, v in specs if v and v not in ('—', '&mdash;'))
    return f"""      <article class="machine" data-machine data-cat="{cat}" data-units="{n}" data-hover-group data-reveal="card">
        <div class="machine__media media media--16x10">
          <div class="media__inner" data-hover-img><div class="media__placeholder"><span>{model}</span></div></div>
          <span class="machine__badge">{kind}</span>
        </div>
        <div class="machine__body">
          <h3 class="h3">{model}</h3>
          <div class="machine__specs">{pairs}</div>
          <a class="btn btn--solid machine__cta" href="mailto:info@sunder.in?subject={model.replace(' ', '%20')}" data-hover-group>Enquire now <span class="btn__icon" aria-hidden="true"><span data-arrow>&rarr;</span></span></a>
        </div>
      </article>"""


def crane_group(cat, title, kind, note, rows):
    cards = [
        card(model, kind, [
            ('Capacity', cap), ('Main boom', boom), ('Fixed jib', jib),
            ('Luffing jib', luff), ('In fleet', units(n)), ('Year', year),
        ], cat, n)
        for model, cap, boom, jib, luff, n, year in rows
    ]
    total = sum(r[5] for r in rows)
    return group_shell(cat, title, note, total, cards)


def simple_group(cat, title, kind, note, rows, col):
    cards = [
        card(model, kind, [(col, spec), ('In fleet', units(n))], cat, n)
        for model, spec, n in rows
    ]
    total = sum(r[2] for r in rows)
    return group_shell(cat, title, note, total, cards)


def group_shell(cat, title, note, total, cards):
    return f"""    <section class="fleet-group" data-group="{cat}" aria-labelledby="group-{cat}">
      <header class="fleet-group__head">
        <h2 class="h3" id="group-{cat}">{title}</h2>
        <p class="fleet-group__count">{total} machines</p>
      </header>
      <p class="fleet-group__note">{note}</p>
      <div class="machine-grid">
{chr(10).join(cards)}
      </div>
    </section>"""


groups = [
    crane_group('telescopic', 'Telescopic cranes', 'All terrain crane', 'Truck-mounted and all-terrain cranes from 20 to 800 tons, road-mobile and quick to rig.', TELESCOPIC),
    crane_group('crawler', 'Crawler cranes', 'Crawler crane', 'Long-boom lattice crawlers for sustained heavy lifts and luffing jib work on site.', CRAWLER),
    crane_group('lattice', 'Lattice boom cranes', 'Lattice boom crane', 'Truck-mounted lattice cranes; the two capacities are the boom and jib ratings.', LATTICE),
    simple_group('access', 'Boom &amp; scissor lifts, telehandlers', 'Access platform', 'Access platforms rated by working height, for maintenance and erection at height.', ACCESS, 'Reach / capacity'),
    simple_group('yard', 'Hydra cranes &amp; forklifts', 'Yard handling', 'Pick-and-carry cranes and forklifts for yard handling and short moves.', YARD, 'Capacity'),
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
