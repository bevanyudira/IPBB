from typing import Optional
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status

from app.models.spop import Spop
from app.models.ref_propinsi import RefPropinsi
from app.models.ref_dati2 import RefDati2
from app.models.ref_kecamatan import RefKecamatan
from app.models.ref_kelurahan import RefKelurahan
from app.spop.schemas import SpopCreate, SpopUpdate


class SpopService:
    """Service untuk mengelola SPOP (Create, Read, Update - tanpa Delete)"""
    
    @staticmethod
    async def get_spop_by_nop(
        session: AsyncSession,
        kd_propinsi: str,
        kd_dati2: str,
        kd_kecamatan: str,
        kd_kelurahan: str,
        kd_blok: str,
        no_urut: str,
        kd_jns_op: str
    ) -> Optional[Spop]:
        """Ambil SPOP berdasarkan NOP (Nomor Objek Pajak)"""
        statement = select(Spop).where(
            Spop.KD_PROPINSI == kd_propinsi,
            Spop.KD_DATI2 == kd_dati2,
            Spop.KD_KECAMATAN == kd_kecamatan,
            Spop.KD_KELURAHAN == kd_kelurahan,
            Spop.KD_BLOK == kd_blok,
            Spop.NO_URUT == no_urut,
            Spop.KD_JNS_OP == kd_jns_op
        )
        result = await session.execute(statement)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_spop_list(
        session: AsyncSession,
        current_user_email: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        kd_propinsi: Optional[str] = None,
        kd_dati2: Optional[str] = None,
        kd_kecamatan: Optional[str] = None,
        kd_kelurahan: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[list[Spop], int]:
        """Ambil list SPOP dengan filter dan pagination"""
        # Base query
        statement = select(Spop)
        count_statement = select(func.count()).select_from(Spop)
        
        # Apply filters
        conditions = []
        
        # Filter by current user's subjek pajak ID
        if current_user_email:
            from app.models.dat_subjek_pajak import DatSubjekPajak
            # Get subjek_pajak_id from email
            subjek_query = select(DatSubjekPajak.SUBJEK_PAJAK_ID).where(
                DatSubjekPajak.EMAIL_WP == current_user_email
            )
            subjek_result = await session.execute(subjek_query)
            subjek_pajak_id = subjek_result.scalar_one_or_none()
            
            if subjek_pajak_id:
                conditions.append(Spop.SUBJEK_PAJAK_ID == subjek_pajak_id)
            else:
                # Jika user tidak punya subjek pajak, return empty list
                return [], 0
        
        if kd_propinsi:
            conditions.append(Spop.KD_PROPINSI == kd_propinsi)
        if kd_dati2:
            conditions.append(Spop.KD_DATI2 == kd_dati2)
        if kd_kecamatan:
            conditions.append(Spop.KD_KECAMATAN == kd_kecamatan)
        if kd_kelurahan:
            conditions.append(Spop.KD_KELURAHAN == kd_kelurahan)
        if search:
            conditions.append(
                (Spop.JALAN_OP.contains(search)) |
                (Spop.SUBJEK_PAJAK_ID.contains(search)) |
                (Spop.NO_FORMULIR_SPOP.contains(search))
            )
        
        if conditions:
            statement = statement.where(*conditions)
            count_statement = count_statement.where(*conditions)
        
        # Count total
        count_result = await session.execute(count_statement)
        total = count_result.scalar_one()
        
        # Pagination
        statement = statement.offset((page - 1) * page_size).limit(page_size)
        statement = statement.order_by(Spop.KD_PROPINSI, Spop.KD_DATI2, Spop.KD_KECAMATAN, Spop.KD_KELURAHAN)
        
        result = await session.execute(statement)
        spop_list = result.scalars().all()
        
        return list(spop_list), total
    
    @staticmethod
    async def create_spop(session: AsyncSession, spop_data: SpopCreate) -> Spop:
        """Buat SPOP baru"""
        # Check if SPOP already exists
        existing = await SpopService.get_spop_by_nop(
            session,
            spop_data.KD_PROPINSI,
            spop_data.KD_DATI2,
            spop_data.KD_KECAMATAN,
            spop_data.KD_KELURAHAN,
            spop_data.KD_BLOK,
            spop_data.NO_URUT,
            spop_data.KD_JNS_OP
        )
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SPOP dengan NOP tersebut sudah ada"
            )
        
        # Create new SPOP
        spop = Spop(**spop_data.model_dump())
        session.add(spop)
        await session.commit()
        await session.refresh(spop)
        
        return spop
    
    @staticmethod
    async def update_spop(session: AsyncSession, spop_data: SpopUpdate) -> Spop:
        """Update SPOP yang sudah ada"""
        # Find existing SPOP
        spop = await SpopService.get_spop_by_nop(
            session,
            spop_data.KD_PROPINSI,
            spop_data.KD_DATI2,
            spop_data.KD_KECAMATAN,
            spop_data.KD_KELURAHAN,
            spop_data.KD_BLOK,
            spop_data.NO_URUT,
            spop_data.KD_JNS_OP
        )
        
        if not spop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SPOP tidak ditemukan"
            )
        
        # Update fields yang tidak None
        update_data = spop_data.model_dump(exclude_unset=True, exclude={
            'KD_PROPINSI', 'KD_DATI2', 'KD_KECAMATAN', 'KD_KELURAHAN',
            'KD_BLOK', 'NO_URUT', 'KD_JNS_OP'  # Primary keys tidak bisa diupdate
        })
        
        for key, value in update_data.items():
            setattr(spop, key, value)
        
        session.add(spop)
        await session.commit()
        await session.refresh(spop)
        
        return spop
    
    # Reference Data Services
    @staticmethod
    async def get_all_propinsi(session: AsyncSession) -> list[RefPropinsi]:
        """Ambil semua provinsi untuk dropdown"""
        statement = select(RefPropinsi).order_by(RefPropinsi.NM_PROPINSI)
        result = await session.execute(statement)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_dati2_by_propinsi(session: AsyncSession, kd_propinsi: str) -> list[RefDati2]:
        """Ambil kabupaten/kota berdasarkan provinsi"""
        statement = select(RefDati2).where(
            RefDati2.KD_PROPINSI == kd_propinsi
        ).order_by(RefDati2.NM_DATI2)
        result = await session.execute(statement)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_kecamatan_by_dati2(
        session: AsyncSession,
        kd_propinsi: str,
        kd_dati2: str
    ) -> list[RefKecamatan]:
        """Ambil kecamatan berdasarkan kabupaten/kota"""
        statement = select(RefKecamatan).where(
            RefKecamatan.KD_PROPINSI == kd_propinsi,
            RefKecamatan.KD_DATI2 == kd_dati2
        ).order_by(RefKecamatan.NM_KECAMATAN)
        result = await session.execute(statement)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_kelurahan_by_kecamatan(
        session: AsyncSession,
        kd_propinsi: str,
        kd_dati2: str,
        kd_kecamatan: str
    ) -> list[RefKelurahan]:
        """Ambil kelurahan berdasarkan kecamatan"""
        statement = select(RefKelurahan).where(
            RefKelurahan.KD_PROPINSI == kd_propinsi,
            RefKelurahan.KD_DATI2 == kd_dati2,
            RefKelurahan.KD_KECAMATAN == kd_kecamatan
        ).order_by(RefKelurahan.NM_KELURAHAN)
        result = await session.execute(statement)
        return list(result.scalars().all())
