"""Build fleet.html from fleet_data.py and fleet_template.html.

Run from the repo root:  python tools/gen_fleet.py
"""
import os
import sys

SP = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SP)

from fleet_data import TELESCOPIC, CRAWLER, LATTICE, ACCESS, YARD


def by_capacity(rows):
    """Heaviest first; "400 / 450 T" sorts on its first number."""
    def tons(row):
        return float(row[1].split('/')[0].strip().split()[0])
    return sorted(rows, key=tons, reverse=True)


TELESCOPIC, CRAWLER, LATTICE = map(by_capacity, (TELESCOPIC, CRAWLER, LATTICE))


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
          <a class="btn btn--solid machine__cta" href="mailto:info@sunder.in?subject={model.replace(' ', '%20')}">Enquire now</a>
        </div>
      </article>"""


def group_shell(cat, title, note, count_line, body):
    return f"""    <section class="fleet-group" data-group="{cat}" aria-labelledby="group-{cat}">
      <header class="fleet-group__head">
        <h2 class="h3" id="group-{cat}">{title}</h2>
        {count_line}
      </header>
      <p class="fleet-group__note">{note}</p>
{body}
    </section>"""


def machine_grid(cards):
    return '      <div class="machine-grid">\n' + '\n'.join(cards) + '\n      </div>'


def crane_group(cat, title, kind, note, rows):
    cards = [
        card(model, kind, [
            ('Capacity', cap), ('Main boom', boom), ('Fixed jib', jib),
            ('Luffing jib', luff), ('In fleet', str(n)), ('Year', year),
        ], cat, n)
        for model, cap, boom, jib, luff, n, year in rows
    ]
    total = sum(r[5] for r in rows)
    return group_shell(cat, title, note, f'<p class="fleet-group__count">{total} machines</p>', machine_grid(cards))


def simple_group(cat, title, kind, note, rows, col):
    cards = [card(model, kind, [(col, spec), ('In fleet', str(n))], cat, n) for model, spec, n in rows]
    total = sum(r[2] for r in rows)
    return group_shell(cat, title, note, f'<p class="fleet-group__count">{total} machines</p>', machine_grid(cards))


# The client sheet lists trailer types only — no models, counts or capacities.
TRAILERS = [
    ('Low bed trailers', 'Low deck for tall or heavy loads.'),
    ('Semi low bed trailers', 'Mid-height deck for general heavy haulage.'),
    ('High bed trailers', 'Standard deck for plant and equipment.'),
    ('Hydraulic multi-axles', 'Indian and imported, for the heaviest moves.'),
]


def transport_group():
    tiles = '\n'.join(
        f"""        <article class="transport-card">
          <h3 class="h3">{name}</h3>
          <p class="body-sm">{note}</p>
          <p class="transport-card__meta">Capacity quoted per move</p>
        </article>"""
        for name, note in TRAILERS)
    body = '      <div class="transport-grid">\n' + tiles + '\n      </div>'
    note = ('Special trailers for girders, cranes and over-dimensional cargo. '
            'Deck types below; the exact configuration and capacity are quoted per move.')
    return group_shell('transport', 'Trailers &amp; hydraulic multi-axles', note, '', body)


groups = [
    crane_group('telescopic', 'Telescopic cranes', 'All terrain crane',
                'Truck-mounted and all-terrain cranes from 20 to 800 tons, road-mobile and quick to rig.', TELESCOPIC),
    crane_group('crawler', 'Crawler cranes', 'Crawler crane',
                'Long-boom lattice crawlers for sustained heavy lifts and luffing jib work on site.', CRAWLER),
    crane_group('lattice', 'Lattice boom cranes', 'Lattice boom crane',
                'Truck-mounted lattice cranes; the two capacities are the boom and jib ratings.', LATTICE),
    simple_group('access', 'Boom &amp; scissor lifts, telehandlers', 'Access platform',
                 'Access platforms rated by working height, for maintenance and erection at height.', ACCESS, 'Reach / capacity'),
    simple_group('yard', 'Hydra cranes &amp; forklifts', 'Yard handling',
                 'Pick-and-carry cranes and forklifts for yard handling and short moves.', YARD, 'Capacity'),
    transport_group(),
]

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
       .replace('<!--GROUPS-->', '\n\n'.join(groups))
       .replace('<!--FILTERS-->', filter_html)
       .replace('{{TOTAL}}', str(total)))
open('fleet.html', 'w', encoding='utf-8', newline='\n').write(out)
print('machines:', total)
