from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.transaction import TransactionType

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = None
    transaction_type: TransactionType
    transaction_date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None
    transaction_type: Optional[TransactionType] = None
    transaction_date: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
