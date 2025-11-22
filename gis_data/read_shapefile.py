"""
Script untuk membaca dan menganalisis file Shapefile
Tanpa dependency library GIS yang berat
"""
import struct
import os

def read_dbf_header(dbf_path):
    """Membaca header file DBF untuk mengetahui struktur kolom"""
    with open(dbf_path, 'rb') as f:
        # Baca header DBF
        version = struct.unpack('B', f.read(1))[0]
        year = struct.unpack('B', f.read(1))[0] + 1900
        month = struct.unpack('B', f.read(1))[0]
        day = struct.unpack('B', f.read(1))[0]
        num_records = struct.unpack('<I', f.read(4))[0]
        header_length = struct.unpack('<H', f.read(2))[0]
        record_length = struct.unpack('<H', f.read(2))[0]
        
        # Skip reserved bytes
        f.read(20)
        
        # Baca field descriptors
        fields = []
        while True:
            field_info = f.read(32)
            if field_info[0] == 0x0D:  # End of field descriptors
                break
            
            field_name = field_info[:11].decode('utf-8', errors='ignore').strip('\x00')
            field_type = chr(field_info[11])
            field_length = struct.unpack('B', field_info[16:17])[0]
            field_decimal = struct.unpack('B', field_info[17:18])[0]
            
            fields.append({
                'name': field_name,
                'type': field_type,
                'length': field_length,
                'decimal': field_decimal
            })
        
        return {
            'version': version,
            'last_update': f"{year}-{month:02d}-{day:02d}",
            'num_records': num_records,
            'header_length': header_length,
            'record_length': record_length,
            'fields': fields
        }

def read_dbf_records(dbf_path, max_records=5):
    """Membaca beberapa record pertama dari DBF"""
    info = read_dbf_header(dbf_path)
    
    with open(dbf_path, 'rb') as f:
        # Skip ke awal data (setelah header)
        f.seek(info['header_length'])
        
        records = []
        for i in range(min(max_records, info['num_records'])):
            # Baca deletion flag
            deletion_flag = f.read(1)
            if deletion_flag == b'*':
                # Record dihapus, skip
                f.read(info['record_length'] - 1)
                continue
            
            record = {}
            for field in info['fields']:
                value = f.read(field['length']).decode('utf-8', errors='ignore').strip()
                record[field['name']] = value
            
            records.append(record)
        
        return records

def analyze_shapefile(base_path):
    """Analisis lengkap file shapefile"""
    print("="*80)
    print("ANALISIS SHAPEFILE")
    print("="*80)
    
    # Cek file yang ada
    extensions = ['.shp', '.dbf', '.shx', '.cpg', '.sbn', '.sbx']
    files_exist = {}
    for ext in extensions:
        file_path = base_path + ext
        exists = os.path.exists(file_path)
        files_exist[ext] = exists
        status = "✓" if exists else "✗"
        print(f"{status} {ext:5s} - {'Ada' if exists else 'Tidak ada'}")
    
    print("\n" + "="*80)
    print("INFORMASI DBF (Data Atribut)")
    print("="*80)
    
    dbf_path = base_path + '.dbf'
    if files_exist['.dbf']:
        info = read_dbf_header(dbf_path)
        print(f"\nVersi DBF      : {info['version']}")
        print(f"Update terakhir: {info['last_update']}")
        print(f"Jumlah record  : {info['num_records']:,}")
        print(f"Panjang header : {info['header_length']} bytes")
        print(f"Panjang record : {info['record_length']} bytes")
        
        print(f"\n{'='*80}")
        print(f"STRUKTUR KOLOM ({len(info['fields'])} kolom)")
        print(f"{'='*80}")
        print(f"{'No':<4} {'Nama Kolom':<20} {'Tipe':<6} {'Panjang':<8} {'Desimal':<8}")
        print("-"*80)
        
        for i, field in enumerate(info['fields'], 1):
            type_desc = {
                'C': 'Text',
                'N': 'Number',
                'F': 'Float',
                'L': 'Logical',
                'D': 'Date',
                'M': 'Memo'
            }.get(field['type'], field['type'])
            
            print(f"{i:<4} {field['name']:<20} {type_desc:<6} {field['length']:<8} {field['decimal']:<8}")
        
        print(f"\n{'='*80}")
        print("SAMPLE DATA (5 record pertama)")
        print(f"{'='*80}\n")
        
        records = read_dbf_records(dbf_path, max_records=5)
        for i, record in enumerate(records, 1):
            print(f"Record {i}:")
            for key, value in record.items():
                print(f"  {key:<20}: {value}")
            print()
    
    # Info file SHP (geometri)
    print("="*80)
    print("INFORMASI SHP (Geometri)")
    print("="*80)
    
    shp_path = base_path + '.shp'
    if files_exist['.shp']:
        with open(shp_path, 'rb') as f:
            # Baca header SHP
            file_code = struct.unpack('>I', f.read(4))[0]
            f.read(20)  # Skip unused
            file_length = struct.unpack('>I', f.read(4))[0] * 2  # dalam bytes
            version = struct.unpack('<I', f.read(4))[0]
            shape_type = struct.unpack('<I', f.read(4))[0]
            
            # Baca bounding box
            xmin = struct.unpack('<d', f.read(8))[0]
            ymin = struct.unpack('<d', f.read(8))[0]
            xmax = struct.unpack('<d', f.read(8))[0]
            ymax = struct.unpack('<d', f.read(8))[0]
            
            shape_types = {
                0: "Null Shape",
                1: "Point",
                3: "PolyLine",
                5: "Polygon",
                8: "MultiPoint",
                11: "PointZ",
                13: "PolyLineZ",
                15: "PolygonZ",
                18: "MultiPointZ",
                21: "PointM",
                23: "PolyLineM",
                25: "PolygonM",
                28: "MultiPointM",
                31: "MultiPatch"
            }
            
            print(f"\nFile Code      : {file_code}")
            print(f"File Size      : {file_length:,} bytes ({file_length/1024:.2f} KB)")
            print(f"Version        : {version}")
            print(f"Shape Type     : {shape_types.get(shape_type, f'Unknown ({shape_type})')}")
            print(f"\nBounding Box:")
            print(f"  X Min: {xmin:,.6f}")
            print(f"  Y Min: {ymin:,.6f}")
            print(f"  X Max: {xmax:,.6f}")
            print(f"  Y Max: {ymax:,.6f}")
            print(f"  Width : {xmax - xmin:,.6f}")
            print(f"  Height: {ymax - ymin:,.6f}")

if __name__ == "__main__":
    # Path ke shapefile (tanpa extension)
    shapefile_base = r"d:\Project\ipbb\gis_data\5102051011"
    
    analyze_shapefile(shapefile_base)
