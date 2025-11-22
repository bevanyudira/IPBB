"""
Pydantic schemas untuk Peta GIS API
"""
from pydantic import BaseModel
from typing import List, Optional, Any


class PetaGeometryResponse(BaseModel):
    """Response untuk single polygon geometry"""
    type: str = "Feature"
    geometry: dict
    properties: dict

    class Config:
        from_attributes = True


class PetaGeoJSONResponse(BaseModel):
    """Response GeoJSON FeatureCollection"""
    type: str = "FeatureCollection"
    features: List[PetaGeometryResponse]

    class Config:
        from_attributes = True


class PetaInfoResponse(BaseModel):
    """Response untuk info objek pajak tanpa geometry"""
    nop: str
    luas: Optional[float] = None
    kd_propinsi: Optional[str] = None
    kd_dati2: Optional[str] = None
    kd_kecamatan: Optional[str] = None
    kd_kelurahan: Optional[str] = None
    kd_blok: Optional[str] = None
    no_urut: Optional[str] = None
    kd_jns_op: Optional[str] = None
    shm: Optional[str] = None
    nib: Optional[str] = None
    guna_tanah: Optional[str] = None
    status: Optional[str] = None
    znt: Optional[str] = None
    harga_transaksi: Optional[str] = None
    no_pelayanan: Optional[str] = None

    class Config:
        from_attributes = True
