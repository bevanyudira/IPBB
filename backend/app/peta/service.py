"""
Service layer untuk Peta GIS
Konversi WKT ke GeoJSON dan query database
"""
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession
from shapely import wkt
from shapely.geometry import mapping
import json
from typing import Optional, Dict, Any


class PetaService:
    """Service untuk operasi GIS dan konversi geometry"""
    
    @staticmethod
    async def get_polygon_by_nop(session: AsyncSession, nop: str) -> Optional[Dict[str, Any]]:
        """
        Ambil polygon berdasarkan NOP dan convert ke GeoJSON
        
        Args:
            session: Database session
            nop: Nomor Objek Pajak (18 digit)
            
        Returns:
            Dict dengan format GeoJSON Feature atau None jika tidak ditemukan
        """
        # Query database untuk ambil geometry WKT
        query = text("""
            SELECT 
                nop, luas, kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan,
                kd_blok, no_urut, kd_jns_op, shm, nib, guna_tanah, status, znt,
                harga_transaksi, no_pelayanan, geometry
            FROM dat_peta_objek_pajak
            WHERE nop = :nop
            LIMIT 1
        """)
        
        result = await session.execute(query, {"nop": nop})
        row = result.fetchone()
        
        if not row:
            return None
        
        # Parse WKT geometry ke Shapely object
        try:
            geom_wkt = row[16]  # geometry column
            geom = wkt.loads(geom_wkt)
            
            # Convert Shapely geometry ke GeoJSON format
            geom_geojson = mapping(geom)
            
            # Build properties dari kolom lain
            properties = {
                "nop": row[0],
                "luas": float(row[1]) if row[1] else None,
                "kd_propinsi": row[2],
                "kd_dati2": row[3],
                "kd_kecamatan": row[4],
                "kd_kelurahan": row[5],
                "kd_blok": row[6],
                "no_urut": row[7],
                "kd_jns_op": row[8],
                "shm": row[9],
                "nib": row[10],
                "guna_tanah": row[11],
                "status": row[12],
                "znt": row[13],
                "harga_transaksi": row[14],
                "no_pelayanan": row[15],
            }
            
            # Return GeoJSON Feature
            return {
                "type": "Feature",
                "geometry": geom_geojson,
                "properties": properties
            }
            
        except Exception as e:
            print(f"Error parsing geometry for NOP {nop}: {e}")
            return None
    
    @staticmethod
    async def get_info_by_nop(session: AsyncSession, nop: str) -> Optional[Dict[str, Any]]:
        """
        Ambil info objek pajak tanpa geometry
        
        Args:
            session: Database session
            nop: Nomor Objek Pajak
            
        Returns:
            Dict dengan info objek pajak atau None
        """
        query = text("""
            SELECT 
                nop, luas, kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan,
                kd_blok, no_urut, kd_jns_op, shm, nib, guna_tanah, status, znt,
                harga_transaksi, no_pelayanan
            FROM dat_peta_objek_pajak
            WHERE nop = :nop
            LIMIT 1
        """)
        
        result = await session.execute(query, {"nop": nop})
        row = result.fetchone()
        
        if not row:
            return None
        
        return {
            "nop": row[0],
            "luas": float(row[1]) if row[1] else None,
            "kd_propinsi": row[2],
            "kd_dati2": row[3],
            "kd_kecamatan": row[4],
            "kd_kelurahan": row[5],
            "kd_blok": row[6],
            "no_urut": row[7],
            "kd_jns_op": row[8],
            "shm": row[9],
            "nib": row[10],
            "guna_tanah": row[11],
            "status": row[12],
            "znt": row[13],
            "harga_transaksi": row[14],
            "no_pelayanan": row[15],
        }
    
    @staticmethod
    async def list_available_nops(session: AsyncSession, limit: int = 100) -> list:
        """
        List NOP yang tersedia (untuk dropdown)
        
        Args:
            session: Database session
            limit: Maximum number of NOPs to return
            
        Returns:
            List of dicts with nop keys
        """
        query = text("""
            SELECT DISTINCT nop
            FROM dat_peta_objek_pajak
            ORDER BY nop
            LIMIT :limit
        """)
        
        result = await session.execute(query, {"limit": limit})
        rows = result.fetchall()
        
        return [{"nop": row[0]} for row in rows]
