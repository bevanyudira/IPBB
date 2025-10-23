# 🗺️ GIS MAPPING ANALYSIS - IPBB Database

## 📊 Database Analysis Summary

**Analysis Date:** October 18, 2025  
**Database:** ipbb (MySQL 8.0)  
**Total Tables:** 12  
**Purpose:** Evaluate readiness for GIS mapping feature

---

## ❌ **CURRENT STATE: NO GEOGRAPHIC COORDINATES**

### ⚠️ Findings:

1. **No Latitude/Longitude Columns**
   - Checked all tables for: `lat`, `long`, `latitude`, `longitude`, `coord`, `geo`
   - **Result:** NONE FOUND

2. **No Spatial Data Types**
   - Checked for MySQL spatial types: `POINT`, `POLYGON`, `GEOMETRY`, `LINESTRING`
   - **Result:** NONE FOUND

3. **No Decimal Coordinates**
   - Checked `DECIMAL`, `DOUBLE`, `FLOAT` columns
   - **Result:** Only financial data (NJOP, PBB amounts)

4. **Address Data Incomplete**
   - `spop.JALAN_OP` exists but mostly empty or generic ("JLN.")
   - Missing complete street addresses
   - No house numbers
   - No postal codes

---

## 📋 **AVAILABLE DATA FOR MAPPING**

### ✅ What We Have:

| Data | Table | Column | Completeness | Notes |
|------|-------|--------|--------------|-------|
| **Province Code** | `spop`, `sppt` | `KD_PROPINSI` | 100% | Administrative code |
| **District/Kabupaten Code** | `spop`, `sppt` | `KD_DATI2` | 100% | Administrative code |
| **Sub-district/Kecamatan Code** | `spop`, `sppt` | `KD_KECAMATAN` | 100% | Administrative code |
| **Village/Kelurahan Code** | `spop`, `sppt` | `KD_KELURAHAN` | 100% | Administrative code |
| **Block Code** | `spop`, `sppt` | `KD_BLOK` | 100% | Land parcel block |
| **Street Name** | `spop` | `JALAN_OP` | ~10% | Mostly empty or "JLN." |
| **Village Name** | `spop` | `KELURAHAN_OP` | ~5% | Mostly NULL |
| **RW/RT** | `spop` | `RW_OP`, `RT_OP` | 100% | Neighborhood codes |

### 📊 Data Sample:

```sql
-- Example from spop table (469,573 records)
+----------+---------------+------+-----+
| JALAN_OP | KELURAHAN_OP  | RW   | RT  |
+----------+---------------+------+-----+
| JLN.     | NULL          | 00   | 000 |
| JLN.     | NULL          | 00   | 000 |
+----------+---------------+------+-----+
```

**Conclusion:** Address data is insufficient for geocoding.

---

## 🎯 **SOLUTIONS FOR GIS MAPPING**

### **Option 1: Add Coordinate Columns** (✅ RECOMMENDED)

#### **1.1. Database Migration**

Add latitude and longitude columns to `spop` table:

```sql
-- Migration: Add GIS columns
ALTER TABLE spop
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER LUAS_BUMI,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude,
ADD COLUMN geometry_point POINT NULL AFTER longitude,
ADD COLUMN last_geocoded DATETIME NULL AFTER geometry_point,
ADD SPATIAL INDEX idx_geometry_point (geometry_point);

-- Add index for faster queries
CREATE INDEX idx_coordinates ON spop(latitude, longitude);
```

**Decimal Precision:**
- `DECIMAL(10, 8)` for latitude → Range: -90.00000000 to 90.00000000
- `DECIMAL(11, 8)` for longitude → Range: -180.00000000 to 180.00000000
- Precision: ~1.1 cm accuracy

#### **1.2. Data Population Methods**

**Method A: Manual Data Entry (Admin Panel)**
```python
# backend/app/routes/admin.py
@router.patch("/spop/{nop}/coordinates")
async def update_coordinates(
    nop: str,
    latitude: float,
    longitude: float,
    admin: AdminUser
):
    """Update object coordinates - Admin only"""
    # Parse NOP to get keys
    key = parse_nop(nop)
    
    # Update spop
    spop = await session.get(Spop, key)
    spop.latitude = latitude
    spop.longitude = longitude
    spop.last_geocoded = datetime.now()
    
    # Update geometry point for spatial queries
    spop.geometry_point = f"POINT({longitude} {latitude})"
    
    await session.commit()
    return {"message": "Coordinates updated"}
```

**Method B: Geocoding API (Google Maps / OpenStreetMap)**
```python
import httpx

async def geocode_address(kelurahan: str, kecamatan: str, kabupaten: str):
    """Geocode using administrative boundaries"""
    # Use Nominatim (OpenStreetMap - Free)
    base_url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{kelurahan}, {kecamatan}, {kabupaten}, Indonesia",
        "format": "json",
        "limit": 1
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(base_url, params=params)
        data = response.json()
        
        if data:
            return {
                "latitude": float(data[0]["lat"]),
                "longitude": float(data[0]["lon"])
            }
    return None

# Batch geocode all kelurahan
@router.post("/admin/geocode-kelurahan")
async def batch_geocode_kelurahan(admin: AdminUser, session: SessionDep):
    """Geocode all kelurahan using administrative boundaries"""
    # Get unique kelurahan
    stmt = select(
        RefKelurahan.KD_PROPINSI,
        RefKelurahan.KD_DATI2,
        RefKelurahan.KD_KECAMATAN,
        RefKelurahan.KD_KELURAHAN,
        RefKelurahan.NM_KELURAHAN
    )
    kelurahan_list = await session.exec(stmt).all()
    
    results = []
    for kel in kelurahan_list:
        coords = await geocode_address(
            kelurahan=kel.NM_KELURAHAN,
            kecamatan="...",  # Get from ref_kecamatan
            kabupaten="..."   # Get from ref_dati2
        )
        if coords:
            # Update all spop in this kelurahan
            update_stmt = (
                update(Spop)
                .where(
                    Spop.KD_PROPINSI == kel.KD_PROPINSI,
                    Spop.KD_DATI2 == kel.KD_DATI2,
                    Spop.KD_KECAMATAN == kel.KD_KECAMATAN,
                    Spop.KD_KELURAHAN == kel.KD_KELURAHAN
                )
                .values(
                    latitude=coords["latitude"],
                    longitude=coords["longitude"],
                    last_geocoded=datetime.now()
                )
            )
            await session.exec(update_stmt)
        
        results.append({
            "kelurahan": kel.NM_KELURAHAN,
            "success": coords is not None
        })
    
    await session.commit()
    return {"geocoded": len([r for r in results if r["success"]])}
```

**Method C: Import from External GIS Data**
```python
# Import from Shapefile/GeoJSON
import geopandas as gpd

async def import_coordinates_from_shapefile(filepath: str):
    """Import coordinates from Shapefile containing NOP data"""
    gdf = gpd.read_file(filepath)
    
    for _, row in gdf.iterrows():
        nop = row['NOP']  # Assuming shapefile has NOP column
        point = row['geometry']  # Point geometry
        
        # Update database
        key = parse_nop(nop)
        spop = await session.get(Spop, key)
        if spop:
            spop.latitude = point.y
            spop.longitude = point.x
            spop.last_geocoded = datetime.now()
    
    await session.commit()
```

---

### **Option 2: Use Administrative Boundary Polygons** (🌟 BEST FOR PBB)

Instead of point coordinates for each parcel, use polygon boundaries for administrative divisions:

#### **2.1. Add Polygon Table**

```sql
CREATE TABLE ref_kelurahan_geometry (
    kd_propinsi VARCHAR(2) NOT NULL,
    kd_dati2 VARCHAR(2) NOT NULL,
    kd_kecamatan VARCHAR(3) NOT NULL,
    kd_kelurahan VARCHAR(3) NOT NULL,
    geometry POLYGON NOT NULL,
    geojson TEXT,  -- Store GeoJSON for web mapping
    centroid_lat DECIMAL(10, 8),
    centroid_lon DECIMAL(11, 8),
    area_sqm BIGINT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan),
    SPATIAL INDEX idx_geometry (geometry)
);
```

#### **2.2. Data Sources**

**Free Sources:**
1. **Batas Administrasi Indonesia** (GADM)
   - URL: https://gadm.org/download_country.html
   - Format: Shapefile, GeoPackage, GeoJSON
   - Contains: Province, Kabupaten, Kecamatan, Kelurahan

2. **Indonesia Geospatial Portal**
   - URL: https://tanahair.indonesia.go.id
   - Official government data
   - Requires registration

3. **OpenStreetMap**
   - URL: https://www.openstreetmap.org
   - Extract using Overpass API
   - Free and open

**Implementation:**
```python
import geopandas as gpd
import json

async def import_kelurahan_boundaries():
    """Import kelurahan boundaries from shapefile"""
    # Read shapefile
    gdf = gpd.read_file("kelurahan_boundaries.shp")
    
    # Convert to WGS84 if needed
    gdf = gdf.to_crs(epsg=4326)
    
    for _, row in gdf.iterrows():
        # Extract codes (adjust column names as needed)
        geometry = row['geometry']
        geojson = json.dumps(geometry.__geo_interface__)
        centroid = geometry.centroid
        
        # Insert to database
        await session.exec(
            insert(RefKelurahanGeometry).values(
                kd_propinsi=row['KD_PROP'],
                kd_dati2=row['KD_KAB'],
                kd_kecamatan=row['KD_KEC'],
                kd_kelurahan=row['KD_KEL'],
                geometry=geometry.wkt,
                geojson=geojson,
                centroid_lat=centroid.y,
                centroid_lon=centroid.x,
                area_sqm=geometry.area
            )
        )
    
    await session.commit()
```

---

### **Option 3: Cluster/Heatmap Approach** (🚀 QUICK START)

Show data aggregated by administrative division instead of individual parcels:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "kelurahan": "SANUR",
        "total_sppt": 1250,
        "total_njop": 50000000000,
        "paid_count": 980,
        "unpaid_count": 270
      },
      "geometry": {
        "type": "Point",
        "coordinates": [115.2631, -8.6848]
      }
    }
  ]
}
```

**Advantages:**
- No need for individual parcel coordinates
- Fast to implement
- Good for statistical visualization
- Lower data storage

**Implementation:**
```python
@router.get("/gis/kelurahan-stats")
async def get_kelurahan_stats_for_map(
    session: SessionDep,
    current_user: User = Depends(get_current_user)
):
    """Get aggregated SPPT data per kelurahan for map visualization"""
    
    # Aggregate by kelurahan
    stmt = (
        select(
            Sppt.KD_PROPINSI,
            Sppt.KD_DATI2,
            Sppt.KD_KECAMATAN,
            Sppt.KD_KELURAHAN,
            RefKelurahan.NM_KELURAHAN,
            func.count(Sppt.NO_URUT).label("total_sppt"),
            func.sum(Sppt.NJOP_SPPT).label("total_njop"),
            func.sum(case((Sppt.STATUS_PEMBAYARAN_SPPT == 1, 1), else_=0)).label("paid"),
            func.sum(case((Sppt.STATUS_PEMBAYARAN_SPPT == 0, 1), else_=0)).label("unpaid")
        )
        .join(RefKelurahan, ...)
        .group_by(
            Sppt.KD_PROPINSI,
            Sppt.KD_DATI2,
            Sppt.KD_KECAMATAN,
            Sppt.KD_KELURAHAN
        )
    )
    
    results = await session.exec(stmt).all()
    
    # Format as GeoJSON (using centroids from ref_kelurahan_geometry)
    features = []
    for row in results:
        # Get centroid from geometry table
        geom = await get_kelurahan_centroid(row.KD_KELURAHAN)
        
        features.append({
            "type": "Feature",
            "properties": {
                "nama": row.NM_KELURAHAN,
                "total": row.total_sppt,
                "paid": row.paid,
                "unpaid": row.unpaid,
                "collection_rate": (row.paid / row.total_sppt * 100) if row.total_sppt > 0 else 0
            },
            "geometry": {
                "type": "Point",
                "coordinates": [geom.longitude, geom.latitude]
            }
        })
    
    return {
        "type": "FeatureCollection",
        "features": features
    }
```

---

## 📦 **RECOMMENDED IMPLEMENTATION PLAN**

### Phase 1: Quick Start (1-2 weeks) ✅
1. **Add centroid coordinates to `ref_kelurahan`**
   - Manual entry for major kelurahan (~10-20 locations)
   - Or geocode using OpenStreetMap API
2. **Implement cluster map**
   - Show SPPT statistics per kelurahan
   - Use Leaflet.js or Mapbox GL JS
3. **Basic map features**
   - Choropleth map (color by collection rate)
   - Marker clustering
   - Click to see details

### Phase 2: Detailed Mapping (4-6 weeks) 🌟
1. **Import administrative boundaries**
   - Download from GADM or Indonesia Geospatial Portal
   - Create `ref_kelurahan_geometry` table
   - Import polygon data
2. **Polygon-based visualization**
   - Show kelurahan boundaries
   - Color by statistics
   - Interactive tooltips
3. **Advanced filtering**
   - Filter by province, kabupaten, kecamatan
   - Filter by payment status
   - Date range filters

### Phase 3: Parcel-Level Mapping (8-12 weeks) 🎯
1. **Add coordinates to `spop` table**
   - Geocoding service integration
   - Bulk import from cadastral data
   - Manual correction interface for admins
2. **Individual parcel visualization**
   - Point markers for each NOP
   - Polygon boundaries if available
   - Detailed popup information
3. **Advanced features**
   - Search by address
   - Directions to property
   - Street view integration

---

## 🛠️ **TECHNOLOGY STACK RECOMMENDATIONS**

### Frontend Libraries

| Library | Purpose | License | Notes |
|---------|---------|---------|-------|
| **Leaflet.js** | Map rendering | BSD | Lightweight, easy to use |
| **Mapbox GL JS** | Advanced maps | BSD | Better performance, 3D |
| **React-Leaflet** | React integration | ISC | Wrapper for Leaflet |
| **Turf.js** | Spatial analysis | MIT | Geometry calculations |

### Backend Libraries

| Library | Purpose | Package |
|---------|---------|---------|
| **GeoAlchemy2** | Spatial database | `geoalchemy2` |
| **Shapely** | Geometry operations | `shapely` |
| **GeoPandas** | GIS data processing | `geopandas` |
| **httpx** | Geocoding API client | `httpx` |

### Map Providers (Free Tier)

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **OpenStreetMap** | Unlimited | Basic maps |
| **Mapbox** | 50k loads/month | Beautiful maps, 3D |
| **Google Maps** | $200 credit/month | Geocoding, Places |

---

## 📊 **COST ESTIMATE**

### Development Time
- Phase 1 (Cluster Map): **1-2 weeks** (40-80 hours)
- Phase 2 (Polygon Map): **4-6 weeks** (160-240 hours)
- Phase 3 (Parcel Map): **8-12 weeks** (320-480 hours)

### Infrastructure Costs (Monthly)
- Map API (Mapbox free tier): **$0**
- Geocoding (1000 requests): **$0-5**
- Additional storage (geometry data): **~500MB** (+$0.05)

---

## 🎯 **NEXT STEPS**

### Immediate Actions:
1. ✅ **Decide on implementation phase** (1, 2, or 3)
2. ✅ **Choose map library** (Leaflet vs Mapbox)
3. ✅ **Add coordinates to database schema**
4. ✅ **Source administrative boundary data**

### Questions to Answer:
- Do you have access to cadastral/parcel coordinate data?
- What is the primary use case? (Statistics vs Individual parcels)
- Is there a budget for premium map services?
- What is the timeline for delivery?

---

## 📚 **RESOURCES**

### Data Sources
- GADM: https://gadm.org/download_country.html
- Indonesia Geospatial: https://tanahair.indonesia.go.id
- OpenStreetMap: https://www.openstreetmap.org

### Documentation
- Leaflet.js: https://leafletjs.com
- Mapbox GL JS: https://docs.mapbox.com
- GeoAlchemy2: https://geoalchemy-2.readthedocs.io
- Turf.js: https://turfjs.org

### Tutorials
- Building web maps with Leaflet: https://leafletjs.com/examples.html
- MySQL Spatial Data Types: https://dev.mysql.com/doc/refman/8.0/en/spatial-types.html

---

**Analysis Completed By:** GitHub Copilot  
**Last Updated:** October 18, 2025
