import geopandas as gpd

gdf = gpd.read_file('/app/gis_data/5102051011.shp')
print(f'CRS: {gdf.crs}')
if gdf.crs:
    print(f'CRS String: {gdf.crs.to_string()}')
else:
    print('No CRS defined!')

# Ambil first point
first_point = list(gdf.geometry.iloc[0].exterior.coords)[0]
print(f'First point coords: {first_point}')
print(f'X (Longitude/Easting): {first_point[0]}')
print(f'Y (Latitude/Northing): {first_point[1]}')
