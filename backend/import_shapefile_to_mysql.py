"""
Script untuk import Shapefile ke MySQL
Membaca shapefile dan insert ke tabel dat_peta_objek_pajak
"""
import geopandas as gpd
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def import_shapefile_to_mysql(shapefile_path: str):
    """Import shapefile ke MySQL database"""
    
    print("="*80)
    print("IMPORT SHAPEFILE KE MYSQL")
    print("="*80)
    
    # 1. Baca shapefile dengan geopandas
    print(f"\n[1/5] Membaca shapefile: {shapefile_path}")
    gdf = gpd.read_file(shapefile_path)
    
    print(f"      ✓ Berhasil membaca {len(gdf)} polygon")
    print(f"      ✓ Coordinate Reference System: {gdf.crs}")
    print(f"      ✓ Kolom: {list(gdf.columns)}")
    
    # 2. Konversi ke WGS84 (EPSG:4326) untuk Leaflet
    print(f"\n[2/5] Konversi koordinat ke WGS84 (Lat/Long)...")
    if gdf.crs:
        print(f"      ℹ CRS awal: {gdf.crs}")
        if gdf.crs.to_string() != "EPSG:4326":
            gdf = gdf.to_crs(epsg=4326)
            print(f"      ✓ Koordinat dikonversi ke EPSG:4326 (WGS84)")
        else:
            print(f"      ℹ Sudah dalam format WGS84")
    else:
        # Shapefile tidak punya CRS - berdasarkan koordinat, set manual UTM 50S
        print(f"      ⚠ Shapefile tidak punya CRS definition!")
        print(f"      ℹ Berdasarkan koordinat, diasumsikan UTM Zone 50S (EPSG:32750)")
        sample_coords = list(gdf.geometry.iloc[0].exterior.coords)[0]
        print(f"      ℹ Sample koordinat awal (UTM): {sample_coords}")
        
        # Set CRS ke UTM 50S lalu konversi ke WGS84
        gdf = gdf.set_crs(epsg=32750)  # UTM Zone 50S untuk Indonesia (Kalimantan Selatan)
        gdf = gdf.to_crs(epsg=4326)  # Konversi ke WGS84
        sample_coords_wgs84 = list(gdf.geometry.iloc[0].exterior.coords)[0]
        print(f"      ✓ CRS diset ke EPSG:32750 dan dikonversi ke WGS84")
        print(f"      ℹ Sample koordinat WGS84: {sample_coords_wgs84}")
    
    # 3. Konversi geometry ke WKT (Well-Known Text)
    print(f"\n[3/5] Konversi geometry ke WKT format...")
    gdf['geometry_wkt'] = gdf['geometry'].apply(lambda geom: geom.wkt)
    print(f"      ✓ Geometry dikonversi ke WKT")
    
    # Drop original geometry column (akan pakai geometry_wkt)
    gdf = gdf.drop(columns=['geometry'])
    
    # Rename kolom agar sesuai standar
    print(f"\n[4/5] Rename kolom...")
    column_mapping = {
        'D_NOP': 'nop',
        'D_LUAS': 'luas',
        'PR': 'kd_propinsi',
        'D2': 'kd_dati2',
        'KC': 'kd_kecamatan',
        'KL': 'kd_kelurahan',
        'BL': 'kd_blok',
        'UR': 'no_urut',
        'KH': 'kd_jns_op',
        'SHM': 'shm',
        'NIB_': 'nib',
        'GS': 'guna_tanah',
        'SU': 'status',
        'ZNT': 'znt',
        'HARGA_TRAN': 'harga_transaksi',
        'NO_PEL': 'no_pelayanan',
        'geometry_wkt': 'geometry'  # Rename dari geometry_wkt ke geometry
    }
    
    gdf_renamed = gdf.rename(columns=column_mapping)
    
    # Pilih kolom yang akan diimport
    columns_to_import = list(column_mapping.values())
    gdf_final = gdf_renamed[columns_to_import].copy()
    
    # Trim whitespace dari kolom NOP
    gdf_final['nop'] = gdf_final['nop'].astype(str).str.strip()
    
    print(f"      ✓ Kolom direname dan dipilih")
    
    # 5. Koneksi ke MySQL dan import
    print(f"\n[5/5] Import ke MySQL...")
    
    # Buat connection string - gunakan mysql container name untuk Docker
    db_host = os.getenv("DATABASE_HOST", "mysql")
    db_port = os.getenv("DATABASE_PORT", "3306")
    db_user = os.getenv("DATABASE_USER", "ipbb_user")  # Changed from root
    db_password = os.getenv("DATABASE_PASSWORD", "ipbb_password")  # Changed from root
    db_name = os.getenv("DATABASE_NAME", "ipbb")
    
    print(f"      ℹ Connecting to: {db_user}@{db_host}:{db_port}/{db_name}")
    
    connection_string = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    try:
        engine = create_engine(connection_string)
        
        # Drop table jika sudah ada
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS dat_peta_objek_pajak"))
            conn.commit()
            print(f"      ℹ Tabel lama dihapus (jika ada)")
        
        # Import data ke MySQL
        gdf_final.to_sql(
            'dat_peta_objek_pajak',
            con=engine,
            if_exists='replace',
            index=False,
            chunksize=100,
            method='multi'
        )
        
        print(f"      ✓ Berhasil import {len(gdf_final)} record ke tabel 'dat_peta_objek_pajak'")
        
        # Tambahkan index untuk NOP (skip primary key, cukup index biasa)
        with engine.connect() as conn:
            # Coba tambahkan index biasa saja (bukan primary key)
            try:
                conn.execute(text("ALTER TABLE dat_peta_objek_pajak ADD INDEX idx_nop (nop(50))"))
                conn.commit()
                print(f"      ✓ Index untuk kolom 'nop' ditambahkan")
            except Exception as idx_error:
                print(f"      ⚠ Warning: Tidak bisa menambahkan index: {idx_error}")
                # Tidak masalah jika index gagal, data sudah terimport
        
        # Tampilkan info tabel
        with engine.connect() as conn:
            result = conn.execute(text("DESCRIBE dat_peta_objek_pajak"))
            print(f"\n" + "="*80)
            print("STRUKTUR TABEL dat_peta_objek_pajak")
            print("="*80)
            for row in result:
                print(f"  {row[0]:<20} {row[1]:<30} {row[2]:<10}")
        
        # Sample data
        with engine.connect() as conn:
            result = conn.execute(text("SELECT nop, kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan, LEFT(geometry, 50) as geom_preview FROM dat_peta_objek_pajak LIMIT 3"))
            print(f"\n" + "="*80)
            print("SAMPLE DATA (3 record)")
            print("="*80)
            for i, row in enumerate(result, 1):
                print(f"\nRecord {i}:")
                print(f"  NOP          : {row[0]}")
                print(f"  Provinsi     : {row[1]}")
                print(f"  Kab/Kota     : {row[2]}")
                print(f"  Kecamatan    : {row[3]}")
                print(f"  Kelurahan    : {row[4]}")
                print(f"  Geometry     : {row[5]}...")
        
        print(f"\n" + "="*80)
        print("✓ IMPORT SELESAI!")
        print("="*80)
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        raise

if __name__ == "__main__":
    # Path ke shapefile (di dalam container)
    shapefile_path = "/app/gis_data/5102051011.shp"
    
    # Cek apakah file ada
    if not os.path.exists(shapefile_path):
        print(f"ERROR: File tidak ditemukan: {shapefile_path}")
        print(f"Cek file di /app/gis_data/")
        exit(1)
    
    # Import
    import_shapefile_to_mysql(shapefile_path)
