# Sondors Metacycle — Research Brief
_Compiled Nov 12, 2026. Every fact below has a source link. Items marked **UNVERIFIED** or **GAP** still need confirmation._

## 1. The bike at a glance
| Spec | Value | Source |
|---|---|---|
| Motor | QS Motor QS273 8000W 3T rear hub motor (direct-drive PMAC), several revisions exist | [Metacyclopedia – Motor](https://metacyclopedia.github.io/motor/) |
| Power | 8 kW (11 hp) nominal / 14.5 kW (20 hp) peak | [RideApart](https://www.rideapart.com/news/622348/sondors-metacycle-us-deliveries-begin/) |
| Torque | 108 Nm (80 ft-lb) nominal / 176 Nm (130 ft-lb) peak | [Metacyclopedia – Motor](https://metacyclopedia.github.io/motor/) |
| Controller | Votol EM200-2SP (not the plain EM200), 60–72 V; factory-limited to under 200 A (220 A sport) | [Metacyclopedia – Controller](https://metacyclopedia.github.io/controller/) |
| Battery | 72 V, 54.4 Ah NCM (4 kWh), CAN-bus BMS; internal 300 A fuse + 5 A blade fuse | [Metacyclopedia – Battery](https://metacyclopedia.github.io/battery/) |
| Battery maker | Believed Greenway (Farasis brochure circulating — not confirmed) — **UNVERIFIED** | same |
| Charger | 120/240 VAC 1800 W, 84 VDC 18 A (SiAECOSYS) | [Metacycle-pedia (old Google Site)](https://sites.google.com/view/metacycle-pedia/parts) |
| Top speed | 60 mph drive / 80 mph sport (claimed) | [Metacyclopedia home](https://metacyclopedia.github.io/) |
| Real range | ~60 mi claimed realistic; RevZilla reviewer needed a charge after ~30 mi commuting | [RideApart](https://www.rideapart.com/news/622348/sondors-metacycle-us-deliveries-begin/), [RevZilla](https://www.revzilla.com/common-tread/2022-sondors-metacycle-electric-motorcycle-review) |
| Weight | ~335 lb production (vs. 200 lb originally promised) | [Metacyclopedia home](https://metacyclopedia.github.io/) |
| Display | "061 DKD" display unit | [Metacycle-pedia](https://sites.google.com/view/metacycle-pedia/parts) |
| Rear shock | 310 mm eye-to-eye, 10 mm holes, 25 mm end widths (some run 320/330 mm for height) | same |
| Rear brake pads | EBC FA266 (organic = quietest) | same |
| Tires / rims / front brake / fork / torque specs | **GAP — not found in any source yet** | — |

Note: the "removable" battery is really a bolted-in pack (T40/T50 fasteners). [Electrify News](https://electrifynews.com/news/sondors-metabeast-electric-motorcycles-announced), [Metacyclopedia – Battery](https://metacyclopedia.github.io/battery/)

## 2. Who actually built it (the parts supply chain)
- Built under contract by **SiAECOSYS** (Taizhou Sia Science and Technology Co.), a subsidiary of **QS Motor**. [Electrek, Jun 2025](https://electrek.co/2025/06/04/back-from-the-dead-bankrupted-e-bike-company-sondors-now-pre-selling-bikes-again/), [Alibaba listing](https://www.alibaba.com/category/Motorcycle-Electrical-System_100001663_58.html)
- After Sondors stopped paying, roughly 1,000 finished bikes plus parts for ~1,500 more were left at the factory; SiAECOSYS began selling the bike and its parts (hub motor, wheels, controller, etc.) on AliExpress. [Endless Sphere](https://endless-sphere.com/sphere/threads/sonders-metacycle-for-sale-again-now-sold-by-saiecosys-company.125850/)
- Main parts channels: **SiAECOSYS AliExpress store**, **cnqsmotor.com**, **E Smart Way** (e-smartway.com — SiAECOSYS reseller with a US warehouse for some items). [Metacyclopedia – Parts](https://metacyclopedia.github.io/parts/), [E Smart Way](https://e-smartway.com/products/us-warehouse-siaecosys-siayq72180-programmable-electric-motorcycle-controller-72v-180a-for-high-power-motor-1)
- Battery rebuilds: E-Bike Market Place advertises Metacycle pack rebuilds. [Metacycle-pedia](https://sites.google.com/view/metacycle-pedia/parts)
- Salvage: Sun Coast Cycle Sports (Odessa, FL) lists used Sondors/Metacycle parts — page reads SEO-generated; **UNVERIFIED** whether they have real stock. [suncoastcyclesports.com](https://suncoastcyclesports.com/Sondors)
- Expert support: **Bill Ruehl**, former Sondors Director of Project Management & Engineering (ex-Zero Motorcycles), consults by appointment and was working with the factory to supply OEM parts (as of May 2024). [Electrek](https://electrek.co/2024/05/12/failed-sondors-metacycle-motorcycle-was-never-street-legal-reveals-employee/)

## 3. The existing resource (likely the one you remember)
**Metacyclopedia** — https://metacyclopedia.github.io (moved from the Google Site "Metacycle-pedia").
- 24 pages: Parts, Problems, Battery, Charger, Battery Activator, CAN Bus, Serial Protocol, Controller, Programming (+ USB / Bluetooth / 20-pin cable), Display, Motor, MetaHack, Files (manuals, Votol software), Registration & VIN, Tools, Accessories, Tutorials, Community. [Home](https://metacyclopedia.github.io/)
- Parts page: 37 categories; links mostly SiAECOSYS/AliExpress. Built from older "OEM Parts List" and "nonOEM Parts List" pages on linkslist.app. [Parts](https://metacyclopedia.github.io/parts/)
- **Weaknesses:** no maintainer named, no dates, no "last verified" on links, several entries "unsure"/"possibly OEM," no part numbers for many items, tires/fender lack links, a single long list with no diagrams, and specs conflict between pages (e.g., 70+ vs 60/80 mph).

## 4. Known problems & fixes (from Metacyclopedia)
Source: [Problems page](https://metacyclopedia.github.io/problems/)
1. **Speedometer reads wrong** — factory tire circumference 1915 mm; set to 1675 mm in the display.
2. **Drives but no horn/lights/signals** — controller didn't fully boot (often started while charging); documented 9-step charger/alarm reset.
3. **Won't power on / remotes dead** — check kill switch, let controller/motor cool, reactivate battery (dongle or charger), replace fob batteries, check 5 A fuse; if alarm silent, bridge orange+red wires under seat to test.
4. **Cables rub rear tire** — zip-tie orange power and brake-light wires to the swingarm.
5. **Lost key fobs** — replace alarm module (comes with 2 fobs), clone fob, or remove alarm.
6. **Can't save sport-mode current / busbar settings** — read-only; requires a firmware flash procedure (video linked on site).
7. **Uncomfortable seat** — Corbin-Pacific, Tapia's Seats.
- Long-term storage: disconnect the battery or the alarm slowly drains it. Never charge near/below freezing. [Battery](https://metacyclopedia.github.io/battery/)
- Former engineer cites a **high controller failure rate** (poor MOSFET choice) and calls the security system the worst component. [Electrek](https://electrek.co/2024/05/12/failed-sondors-metacycle-motorcycle-was-never-street-legal-reveals-employee/)
- Road legality is disputed (registration difficulties reported). same

## 5. Community
- Reddit: r/metacycle
- Discord: MetaHack; Verified Metacycle Owners
- Facebook: Sondors Metacycle Mods Club; Fan club of America; two private Owners Groups
- Endless Sphere forums (Votol EM200 threads useful for controller work)
Source: [Metacyclopedia – Community](https://metacyclopedia.github.io/community/)

## 6. Company status
- Production stopped Oct 2022 over unpaid invoices; receivership Dec 2023. [Electrek](https://electrek.co/2023/10/25/sondors-metacycle-bikes-abandoned-in-china-bills-go-unpaid/), [Electrek](https://electrek.co/2023/12/25/exclusive-e-bike-maker-sondors-up-for-sale-as-company-enters-receivership/)
- Only ~1,400–1,500 bikes reportedly delivered. [Metacyclopedia](https://metacyclopedia.github.io/)
- Storm Sondors bought the brand back; pre-sold an off-road "Meta AT" (2025) and teased a "001" e-bike (Aug–Sep 2026). No Metacycle support offered. [Electric Bike Report](https://electricbikereport.com/the-weekly-recharge-episode-34/), [Electrek](https://electrek.co/2026/08/27/storm-sondors-is-back-teasing-mysterious-new-electric-bike-photo/)

## 7. Open gaps to fill for the new site
- Tire sizes/brand, rim sizes, front brake caliper + pads, fork model/oil spec
- Torque specs (axle nuts, caliper bolts, motor mount)
- Maintenance schedule (none exists anywhere)
- Exploded/parts diagrams with numbered callouts
- Controller replacement alternatives (Fardriver etc.) beyond the stock Votol
- Live verification of every purchase link + current prices
