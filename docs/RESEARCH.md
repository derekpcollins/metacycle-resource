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
| Tires | Front 110/70 R17 @ 32 psi, rear 150/60 R17 @ 30 psi; factory brands vary (Michelin Pilot Road 5, CST CM-NK01, allegedly Kenda) — _added Phase 3_ | [Metacyclopedia – Parts](https://metacyclopedia.github.io/parts/) |
| Rims / front brake / fork / torque specs | **GAP — not found in any source yet** | — |

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
- ~~Tire sizes/brand~~ (found in Phase 3, see §1 and §8), rim sizes, front brake caliper + pads, fork model/oil spec
- Torque specs (axle nuts, caliper bolts, motor mount)
- Maintenance schedule (none exists anywhere)
- Exploded/parts diagrams with numbered callouts
- Controller replacement alternatives (Fardriver etc.) beyond the stock Votol
- Live verification of every purchase link + current prices

## 8. Sources added in Phase 3 (Nov 12, 2026)
Pages fetched and cited in the site's content. Metacyclopedia's source is public on GitHub ([metacyclopedia/metacyclopedia.github.io](https://github.com/metacyclopedia/metacyclopedia.github.io), MIT-licensed code; last commit May 3, 2026), which made every sub-page readable in full.

**Metacyclopedia sub-pages** (facts used: parts, specs, pinouts, procedures)
- [Parts](https://metacyclopedia.github.io/parts/) — all 37 categories, buy links, tire sizes/pressures, horn rating, seat bolts (M6 × 1.00 × 25), charging-connector part numbers (Chogori 24305131-01 / 24305635-01 / 24305636-01), FEFB-10009A-02, KTM RC 390 shock and KTM Duke 390 fender notes
- [Problems](https://metacyclopedia.github.io/problems/) — all 6 troubleshooting entries, incl. the 9-step controller reset
- [Battery](https://metacyclopedia.github.io/battery/) — 7-step removal procedure, 100 A cont./250 A peak, ASTM A2209-300 main fuse, 5 A blade fuse, storage and cold-charging rules
- [Charger](https://metacyclopedia.github.io/charger/) — ~5 h full charge, plugs, charging procedure, red-red-green comm error, public J1772 charging, wake pins
- [Battery Activator](https://metacyclopedia.github.io/battery-activator/) — what it does, two A23 batteries, wake pins (**conflict:** ground is pin 5 here, pin 6 on the Charger page)
- [Controller](https://metacyclopedia.github.io/controller/) — ratings, IP67 vs IP65, factory limits; parts page calls the listing "EM200-2SM" (**conflict**, likely a typo)
- [Programming](https://metacyclopedia.github.io/programming/), [Programming Cable](https://metacyclopedia.github.io/programming-cable/), [Connect through USB Port](https://metacyclopedia.github.io/connect-through-usb-port/), [Connect with 20-pin Cable](https://metacyclopedia.github.io/connect-with-20-pin-cable/), [Connect via Bluetooth](https://metacyclopedia.github.io/connect-via-bluetooth/), [Windows Software](https://metacyclopedia.github.io/windows-software/), [CAN Bus](https://metacyclopedia.github.io/can-bus/), [MetaHack](https://metacyclopedia.github.io/metahack/) — Votol reprogramming guide, 20-pin and USB pinouts, 115200 baud, CAN 250 kbit/s
- [Display Unit](https://metacyclopedia.github.io/display-unit/) — 061 DKD, button codes (153 circumference, 974 units, 372 odometer reset), 80-vs-70 mph over-read
- [Removing the Alarm System](https://metacyclopedia.github.io/removing-alarm-system/) — alarm test, wire colour map, replacement, switchable and total bypass, 20 mm key switch
- [Motor](https://metacyclopedia.github.io/motor/), [Registration & VIN](https://metacyclopedia.github.io/registration/) — VIN/VECI/engine-number locations and VIN decoding
- [Tools](https://metacyclopedia.github.io/tools/) — 5 mm Allen (seat), T40/T50 Torx (battery), roadside extras
- [Tutorials](https://metacyclopedia.github.io/tutorials/), [Accessories](https://metacyclopedia.github.io/accessories/), [Files](https://metacyclopedia.github.io/files/) — tutorial links, display bracket/handlebar tube, downloads list for Phase 6
- [Community](https://metacyclopedia.github.io/community/) — already cited in §5; all links re-checked Nov 12 (HTTP 200; Discord invites valid; Facebook behind login)

**Vendor pages**
- [cnqsmotor.com contact page](https://www.cnqsmotor.com/contact-us/) — Taizhou Quanshun Electric Drive Technology Co. (QS Motor), Taizhou, Zhejiang. All 19 cnqsmotor product links on the site returned HTTP 200 with matching titles on Nov 12 (not human-verified).
- [E Smart Way shipping policy](https://e-smartway.com/policies/shipping-policy), [about](https://e-smartway.com/pages/about-us), [complete-bike listing](https://e-smartway.com/products/siaecosys-electric-motorcycle-72v-120kph-high-power-cast-aluminum-integrally-formed-frame-mt-with-4kwh-lithium-ion-battery) — sea freight 40–50 days to North America, some local-warehouse stock, duties/tax not included, bike listing "still under development"
- [E-Bike Market Place rebuild service](https://ebikemarketplace.com/products/sondors-bullet-battery-rebuild-36v-14ah) — lists the Metacycle as supported; Las Vegas, NV; 90-day warranty; 2–3 week turnaround; continental US only
- [CST CM-NK01](https://csttires.eu/cm-nk01/), [ASTM A2209 fuse](https://astml.com/product/a2209-seriesev-fuse150a350a150v200vdc), [Votol EM200-2](https://votol.cn/product/votol-em200-2/) — manufacturer pages linked from Metacyclopedia
- Owner videos cited in guides: [battery removal](https://www.youtube.com/watch?v=rWQAdfNzzi8), [charging](https://www.youtube.com/watch?v=PDbgJK4OnP0), [wheel circumference](https://www.youtube.com/watch?v=vdKBwa3N2Kw), [read-only busbar/sport current fix](https://www.youtube.com/watch?v=Y6rSq_TIzTU), [alarm switch mod](https://www.youtube.com/watch?v=ps6psLgywKc), [Corbin seat install](https://www.youtube.com/watch?v=UJrRIZGzl2A)

**Still not found:** the SiAECOSYS AliExpress store's own URL (individual listings only), rims, front brake, fork, torque specs, maintenance schedule, Metacycle battery-rebuild price.
