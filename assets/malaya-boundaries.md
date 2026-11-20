# Peninsular Malaysia administrative boundaries

The atlas uses Natural Earth’s public-domain 1:10m Admin 1 – States, Provinces from repository tag `v5.1.2`. [Pinned source GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson) · [Natural Earth terms of use](https://www.naturalearthdata.com/about/terms-of-use/)

The bundled JSON selects features with `adm0_a3` equal to `MYS` and excludes Sabah (MY-12), Sarawak (MY-13), and Labuan (MY-15). Each record keeps the source ISO code and name. Each polygon ring becomes a closed SVG path subpath with the repeated endpoint removed. Coordinates are rounded to thousandths of a degree east of 99°E and south of 7°N. Consecutive duplicate points are omitted. Even-odd filling preserves islands and enclaves. Boundaries are generalized for the campaign atlas.
