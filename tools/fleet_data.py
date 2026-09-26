# Merged fleet: the 2016 client sheet (Equipments) + the machines already on the
# site. Columns: model, capacity, main boom, fixed jib, luffing jib, units, year.
# "-" means the sheet left it blank; year is only known for the newer machines.

TELESCOPIC = [
    ("Liebherr LTM 1750-9.1", "800 T", "56 m", "—", "91 m", 1, ""),
    ("Terex Demag AC 700", "700 T", "60 m", "96 m", "—", 1, ""),
    ("XCMG XCA750", "750 T", "90.5 m", "56 m", "91 m", 1, "2025"),
    ("Terex Demag AC 500-2", "500 T", "56 m", "62 m", "90 m", 1, ""),
    ("Terex Demag AC 500-1", "500 T", "—", "—", "—", 1, ""),
    ("Liebherr LTM 1500", "500 T", "50 m", "63 m", "63 m", 1, ""),
    ("Liebherr LTM 1400", "400 T", "50 m", "—", "56 m", 2, ""),
    ("Gottwald AMK 401-83", "400 T", "49 m", "—", "70 m", 1, ""),
    ("Demag AC 400", "400 T", "58 m", "44 m", "78 m", 1, ""),
    ("Demag AC 350-1", "350 T", "56 m", "49.5 m", "71 m", 1, ""),
    ("Zoomlion ZAT3500V853", "350 T", "90 m", "37.5 m", "—", 1, "2024"),
    ("Demag HC 810 SL", "330 T", "52 m", "22 m", "37 m", 2, ""),
    ("Grove GMK 6300 L", "300 T", "80 m", "37 m", "—", 1, ""),
    ("Krupp KMK 7300", "300 T", "63 m", "38 m", "56 m", 1, ""),
    ("Demag AC 615 SL", "250 T", "50 m", "33 m", "51 m", 2, ""),
    ("Demag AC 200-1", "200 T", "68 m", "33 m", "—", 1, ""),
    ("Zoomlion ZAT2000V853N", "200 T", "88 m", "17.5 m", "—", 1, "2025"),
    ("Zoomlion ZAT2000E763.1", "200 T", "75 m", "18 m", "—", 1, "2024"),
    ("Zoomlion ZAT2000E753.1", "200 T", "75 m", "18 m", "—", 1, "2022"),
    ("Demag AC 435", "165 T", "50 m", "17 m", "14 m", 3, ""),
    ("Krupp GMT 140", "160 T", "47 m", "18 m", "—", 1, "1987"),
    ("Krupp KMK 5110", "110 T", "42 m", "16 m", "—", 1, ""),
    ("Demag AC 265", "110 T", "45 m", "17 m", "—", 2, ""),
    ("Liebherr LTM 1090-4.1", "100 T", "52 m", "19 m", "—", 1, ""),
    ("Krupp KMK 4070", "80 T", "38 m", "16 m", "—", 1, ""),
    ("Sany STC 800", "80 T", "45 m", "16 m", "—", 2, ""),
    ("Demag AC 155", "50 T", "40 m", "16.1 m", "—", 1, ""),
    ("Grove TMS 475", "50 T", "33.5 m", "9.7 m", "—", 2, ""),
    ("Kato NK 250", "25 T", "31 m", "8 m", "—", 1, ""),
    ("Tadano TL 201", "20 T", "30.4 m", "6.2 m", "—", 2, ""),
    ("P&H T 200", "20 T", "31 m", "7.5 m", "—", 1, ""),
]

CRAWLER = [
    ("Liebherr LR 1750", "750 T", "—", "—", "—", 1, ""),
    ("Terex Demag CC 2800", "600 T", "—", "—", "—", 1, ""),
    ("Zoomlion ZCC7200A", "600 T", "84 m", "84 m", "—", 1, "2024"),
    ("XCMG XGC600W", "600 T", "93 m", "—", "84 m", 1, "2025"),
    ("Liebherr LR 1400-2", "400 T", "84 m", "38.5 m", "—", 1, ""),
    ("Liebherr LR 1350", "350 T", "96 m", "36 m", "—", 1, ""),
    ("Zoomlion ZCC2600-2", "260 T", "83 m", "30 m", "60 m", 1, "2023"),
    ("Sany SCS1500A", "150 T", "76 m", "31 m", "52 m", 1, "2024"),
    ("Sany SCI1500A", "150 T", "76 m", "31 m", "—", 1, "2022"),
]

LATTICE = [
    ("Demag TC 2000", "400 / 450 T", "90 m", "—", "72 m", 1, ""),
    ("Pinguely GC 15", "135 / 150 T", "56.5 m", "18 m", "—", 1, ""),
    ("P&H TC 790", "90 / 100 T", "58 m", "18 m", "—", 1, ""),
    ("Lorain MC 545", "45 / 50 T", "30 m", "10 m", "—", 1, ""),
]

# Access platforms are rated by working height, not tonnage.
ACCESS = [
    ("JLG 1350 SJP", "41 m working height", 2),
    ("JLG 120 SXJ / HX", "38 m working height", 4),
    ("JLG 80 AJ / HX", "26 m working height", 4),
    ("JLG 600 S", "18 m working height", 4),
    ("JLG 500 RTS", "18 m working height", 2),
    ("Manitou MT 1740 telehandler", "4 T at 17 m", 1),
]

YARD = [
    ("Escort Firana", "15 T", 4),
    ("ACE Hydra", "12 T", 4),
    ("ACE Hydra", "11 T", 4),
    ("Forklift", "3 T", 1),
]
